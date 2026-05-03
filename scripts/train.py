"""Entry point: PPO training driver with curriculum and CSV logging.

Usage:
    python scripts/train.py --config configs/default.yaml
    python scripts/train.py --config configs/default.yaml --resume checkpoints/iter_0250.pt
    python scripts/train.py --config configs/default.yaml --override seed=7 lr=1e-4
    python scripts/train.py --config configs/default.yaml --device cuda
"""
import logging
import os
import random
import sys
import time
from dataclasses import asdict
from typing import Optional

import numpy as np
import torch

from hearthstone.ai.config import (
    CardFeaturesConfig, CurriculumConfig, SelfPlayConfig, TrainConfig,
    load_config, parse_cli,
)
from hearthstone.ai.curriculum import CurriculumEvent, CurriculumFSM, Phase
from hearthstone.ai.evaluate import evaluate_pool
from hearthstone.ai.env.counterfactual import sample_counterfactual_baseline
from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
from hearthstone.ai.env.opponent_env import OpponentEnv
from hearthstone.ai.env.opponents import RandomOpponent, SelfPlayOpponent
from hearthstone.ai.env.deck_source import load_deck, load_decks
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.ppo_trainer import PPOTrainer
from hearthstone.ai.rollout_buffer import RolloutBuffer
from hearthstone.ai.training_utils import (
    MetricsLogger, load_checkpoint, save_checkpoint,
)

logger = logging.getLogger(__name__)


def _seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def _build_obs_for_network(obs: dict, device: str) -> dict:
    """Convert a numpy obs dict to a torch tensor obs dict on `device` (batch dim added)."""
    return {k: torch.from_numpy(v).unsqueeze(0).to(device) for k, v in obs.items()}


def _make_env(cfg: TrainConfig, opponent, decks: list) -> OpponentEnv:
    """Build OpponentEnv from a pre-loaded deck pool + opponent.

    `decks` is loaded once at startup (load_decks(cfg.deck_pool)) and passed
    in to avoid re-validating archetype invariants on every env construction.
    """
    from hearthstone.ai.env.mulligan_policy import KeepAll, KeepLowCost
    from hearthstone.ai.env.discover_policy import FirstOption, LowestCost
    from hearthstone.ai.env.choose_one_policy import FirstChoiceOne

    mp = (KeepAll() if cfg.mulligan_policy == "keep_all"
          else KeepLowCost(cfg.mulligan_threshold))
    dp = (FirstOption() if cfg.discover_policy == "first"
          else LowestCost())
    cop = FirstChoiceOne()

    base = FireplaceGymEnv(
        decks=decks,
        pair_strategy=cfg.deck_selection,           # "fixed" | "random_pair"
        swap_training_player=cfg.swap_training_player,
        training_player_idx=cfg.training_player_idx,
        mulligan_policy=mp, discover_policy=dp, choose_one_policy=cop,
        seed=cfg.seed,
    )
    return OpponentEnv(base, opponent)


def _action_mask(env: OpponentEnv, n_actions: int) -> np.ndarray:
    valid = env._env.current_valid_actions
    n_valid = len(valid)
    if n_valid > n_actions:
        logger.warning(
            "action-space truncation: %d valid actions but n_actions=%d",
            n_valid, n_actions,
        )
    mask = np.zeros(n_actions, dtype=np.float32)
    mask[: min(n_valid, n_actions)] = 1.0
    return mask


def _bootstrap_value(network: PolicyValueNetwork, obs: dict, device: str) -> float:
    """Forward-pass an observation through the value head; return scalar."""
    torch_obs = _build_obs_for_network(obs, device)
    with torch.no_grad():
        _, value, _ = network(torch_obs)
    return float(value[0, 0].item())


def run_training_loop(
    config: TrainConfig,
    resume_path: Optional[str] = None,
    device: str = "cpu",
) -> str:
    """Run the full PPO + curriculum training loop.

    Returns the run directory path (`runs/<timestamp>/`).
    """
    # 1. Set up run directory
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    run_dir = os.path.join(config.runs_dir, timestamp)
    os.makedirs(run_dir, exist_ok=True)
    os.makedirs(config.checkpoint_dir, exist_ok=True)

    # Copy resolved config for reproducibility
    import yaml
    with open(os.path.join(run_dir, "config.yaml"), "w") as f:
        yaml.safe_dump(asdict(config), f)

    # 2. Seed and device
    _seed_everything(config.seed)

    # 3. Build agent components
    network = PolicyValueNetwork(
        slot_dim=config.slot_dim,
        hidden_dim=config.hidden_dim,
        num_actions=config.num_actions,
    ).to(device)
    trainer = PPOTrainer(
        network,
        lr=config.lr,
        gamma=config.gamma,
        gae_lambda=config.gae_lambda,
        clip_epsilon=config.clip_epsilon,
        value_coef=config.value_coef,
        entropy_coef=config.entropy_coef,
        max_grad_norm=config.max_grad_norm,
        ppo_epochs=config.ppo_epochs,
    )
    buffer = RolloutBuffer(
        capacity=config.rollout_steps,
        gamma=config.gamma,
        gae_lambda=config.gae_lambda,
    )
    fsm = CurriculumFSM(
        switch_threshold=config.curriculum.switch_threshold,
        early_stop_patience=config.curriculum.early_stop_patience,
    )

    # 4. Optional resume
    start_iter = 1
    if resume_path is not None:
        ckpt = load_checkpoint(resume_path)
        network.load_state_dict(ckpt["network"])
        trainer.optimizer.load_state_dict(ckpt["optimizer"])
        start_iter = ckpt["iter"] + 1
        fsm.best_winrate = ckpt["best_winrate"]
        fsm.phase = Phase(ckpt["phase"])
        logger.warning(
            "Resuming from %s (iter=%d, best_winrate=%.3f, phase=%s); "
            "config from --config flag is ignored",
            resume_path, ckpt["iter"], ckpt["best_winrate"], ckpt["phase"],
        )

    # 5. Build env with phase-appropriate opponent
    if fsm.phase == Phase.SELF_PLAY:
        opp = SelfPlayOpponent(
            network_path=config.best_checkpoint_path,
            slot_dim=config.slot_dim,
            hidden_dim=config.hidden_dim,
            num_actions=config.num_actions,
        )
    else:
        opp = RandomOpponent()
    # Load deck pool once (used for env + eval); validates each deck against
    # archetype invariants.
    decks = load_decks(config.deck_pool)

    env = _make_env(config, opp, decks)

    # 6. Open metrics logger + milestone runner
    metrics = MetricsLogger(os.path.join(run_dir, "metrics.csv"))

    from hearthstone.ai.milestone import MilestoneRunner
    milestone_runner = MilestoneRunner(
        output_dir=os.path.join(run_dir, "milestones"),
    )

    # Bootstrap best.pt at iter=0 so the first milestone (potentially at
    # iter == milestone_every) has something to copy. Without this, if no
    # NEW_BEST has fired by milestone_every, shutil.copy raises.
    if not os.path.exists(config.best_checkpoint_path):
        save_checkpoint(
            config.best_checkpoint_path,
            network=network, optimizer=trainer.optimizer, iter_num=0,
            config=config, best_winrate=0.0, phase=fsm.phase.value,
        )

    # 7. Main loop
    obs, info = env.reset()
    it = start_iter - 1  # in case the loop body never runs
    try:
        for it in range(start_iter, config.max_iters + 1):
            # --- Collect rollout ---
            buffer.reset()
            for _ in range(config.rollout_steps):
                # If THIS obs has a draw event (came from prior step), compute
                # the counterfactual baseline by synthesizing K hypothetical
                # post-draw obs and forwarding V on each.
                if info.get("draw_event", False):
                    baseline, n_sampled = sample_counterfactual_baseline(
                        obs, info, network, device,
                        K=config.aux_counterfactual_k,
                    )
                else:
                    baseline, n_sampled = 0.0, 0

                mask = _action_mask(env, n_actions=config.num_actions)
                torch_obs = _build_obs_for_network(obs, device)
                action, log_prob, value = trainer.select_action(torch_obs, mask)

                if n_sampled > 0:
                    aux_target = float(value) - baseline
                    aux_mask = True
                else:
                    aux_target = 0.0
                    aux_mask = False

                next_obs, reward, terminated, truncated, info = env.step(action)
                buffer.add(
                    obs, action, reward, value, log_prob, terminated,
                    aux_target=aux_target, aux_mask=aux_mask,
                )
                obs = next_obs
                if terminated or truncated:
                    obs, info = env.reset()
            # --- Bootstrap final value ---
            last_value = _bootstrap_value(network, obs, device)
            buffer.compute_returns_and_advantages(last_value)

            # --- Update ---
            try:
                batch = buffer.get()
                losses = trainer.update(batch, current_iter=it)
            except RuntimeError as e:
                logger.warning("buffer.get() failed: %s; skipping update", e)
                continue

            if any(np.isnan(v) for v in losses.values()):
                save_checkpoint(
                    os.path.join(config.checkpoint_dir, f"iter_{it:04d}_nan.pt"),
                    network=network, optimizer=trainer.optimizer, iter_num=it,
                    config=config, best_winrate=fsm.best_winrate,
                    phase=fsm.phase.value,
                )
                raise RuntimeError(f"NaN loss at iter {it}: {losses}")

            metrics.log_iter(
                iter=it, phase=fsm.phase.value,
                total_loss=losses["total_loss"],
                policy_loss=losses["policy_loss"],
                value_loss=losses["value_loss"],
                entropy=losses["entropy"],
            )
            print(
                f"[iter {it:04d}] phase={fsm.phase.value} "
                f"total_loss={losses['total_loss']:.4f} "
                f"policy={losses['policy_loss']:.4f} "
                f"value={losses['value_loss']:.4f} "
                f"entropy={losses['entropy']:.4f} "
                f"aux={losses['aux_loss']:.4f} (n_aux={int(losses['aux_n_samples'])})",
                flush=True,
            )

            # --- Eval ---
            if it % config.eval_every == 0:
                eval_result = evaluate_pool(
                    network=network,
                    opponent_factory=lambda: RandomOpponent(),
                    decks=decks,
                    n_games=config.eval_games,
                    slot_dim=config.slot_dim,
                    hidden_dim=config.hidden_dim,
                    num_actions=config.num_actions,
                    max_actions_per_game=config.max_actions_per_game,
                    seed=config.seed + it,
                )
                winrate = eval_result["winrate"]
                event = fsm.update(winrate)
                metrics.log_eval(
                    iter=it, phase=fsm.phase.value,
                    eval_winrate=winrate,
                    best_winrate=fsm.best_winrate,
                    plateau_count=fsm.plateau_count,
                    cap_hit_count=eval_result["cap_hit_count"],
                )
                print(
                    f"[iter {it:04d}] phase={fsm.phase.value} "
                    f"eval winrate={winrate:.3f} (best={fsm.best_winrate:.3f}, "
                    f"plateau={fsm.plateau_count})",
                    flush=True,
                )

                if event in (CurriculumEvent.NEW_BEST, CurriculumEvent.SWITCH_TO_SELF_PLAY):
                    save_checkpoint(
                        config.best_checkpoint_path,
                        network=network, optimizer=trainer.optimizer, iter_num=it,
                        config=config, best_winrate=fsm.best_winrate,
                        phase=fsm.phase.value,
                    )

                if event == CurriculumEvent.SWITCH_TO_SELF_PLAY:
                    print(f"[iter {it:04d}] curriculum: switching to SELF_PLAY", flush=True)
                    env.opponent = SelfPlayOpponent(
                        network_path=config.best_checkpoint_path,
                        slot_dim=config.slot_dim,
                        hidden_dim=config.hidden_dim,
                        num_actions=config.num_actions,
                    )
                    obs, _ = env.reset()  # restart episode against new opponent

                if event == CurriculumEvent.EARLY_STOP:
                    print(
                        f"[iter {it:04d}] early stop: "
                        f"no improvement for {fsm.early_stop_patience} evals",
                        flush=True,
                    )
                    break

            # --- Milestone subprocess (non-blocking; runs round-robin in
            #     a spawn-context worker against best.pt) ---
            if (config.milestone_every > 0
                    and it > 0
                    and it % config.milestone_every == 0):
                if os.path.exists(config.best_checkpoint_path):
                    milestone_runner.submit(
                        iter_num=it,
                        checkpoint_path=config.best_checkpoint_path,
                        deck_names=config.deck_pool,
                        games_per_matchup=config.milestone_games_per_matchup,
                        slot_dim=config.slot_dim,
                        num_actions=config.num_actions,
                    )
                else:
                    logger.warning(
                        "[milestone] iter=%d: best.pt missing at %s; "
                        "skipping submission", it, config.best_checkpoint_path,
                    )

            # Collect any milestones that finished since last poll
            for completed_iter, csv_path in milestone_runner.collect_completed():
                # Use a relative path in the CSV so the metrics file is portable.
                rel = os.path.relpath(csv_path, run_dir)
                metrics.log_milestone(completed_iter, rel)
                print(
                    f"[iter {it:04d}] milestone iter={completed_iter} "
                    f"completed → {rel}", flush=True,
                )

            # --- Periodic checkpoint ---
            if it % config.checkpoint_every == 0:
                ckpt_path = os.path.join(config.checkpoint_dir, f"iter_{it:04d}.pt")
                save_checkpoint(
                    ckpt_path,
                    network=network, optimizer=trainer.optimizer, iter_num=it,
                    config=config, best_winrate=fsm.best_winrate,
                    phase=fsm.phase.value,
                )
                print(f"[iter {it:04d}] checkpoint saved to {ckpt_path}", flush=True)

    except KeyboardInterrupt:
        interrupted_path = os.path.join(config.checkpoint_dir, "interrupted.pt")
        save_checkpoint(
            interrupted_path,
            network=network, optimizer=trainer.optimizer, iter_num=it,
            config=config, best_winrate=fsm.best_winrate, phase=fsm.phase.value,
        )
        print(f"\n[interrupted] checkpoint saved to {interrupted_path}", flush=True)
    finally:
        # cancel pending submits; in-flight subprocess survives until done
        # (writing its .partial file). User may need pkill -f
        # _run_round_robin if they want it dead immediately.
        milestone_runner.shutdown(wait=False)
        metrics.close()
        env.close()

    return run_dir


def main(argv=None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    args = parse_cli(argv)

    if args.resume is not None:
        ckpt = load_checkpoint(args.resume)
        # Reconstruct TrainConfig from the checkpoint's saved config dict
        raw = ckpt.get("config", {})
        if "deck1" in raw or "embedding_dim" in raw:
            sys.stderr.write(
                f"ERROR: checkpoint {args.resume} was saved by the pre-fireplace trainer. "
                f"Old checkpoints are not resumable; start a fresh run.\n"
            )
            sys.exit(1)
        # Strip S2-A-deprecated keys (fixed_deck1/fixed_deck2) so older
        # in-the-wild checkpoints from S1' / pre-S2-A loads cleanly.
        from hearthstone.ai.config import _strip_deprecated, _dict_to_config
        raw = _strip_deprecated(raw, source=f"checkpoint {args.resume}")
        config = _dict_to_config(raw)
        print(f"resuming from {args.resume}; --config is ignored", file=sys.stderr)
    else:
        config = load_config(args.config, overrides=args.override)

    run_dir = run_training_loop(config, resume_path=args.resume, device=args.device)
    print(f"training complete; run directory: {run_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
