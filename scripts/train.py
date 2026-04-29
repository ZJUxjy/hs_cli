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
    CurriculumConfig, TrainConfig, load_config, parse_cli,
)
from hearthstone.ai.curriculum import CurriculumEvent, CurriculumFSM, Phase
from hearthstone.ai.evaluate import evaluate
from hearthstone.ai.gym_env import HearthstoneEnv
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.opponent_env import OpponentEnv
from hearthstone.ai.opponents import RandomOpponent, SelfPlayOpponent
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


def _make_env(cfg: TrainConfig, opponent) -> OpponentEnv:
    base = HearthstoneEnv(
        deck1_name=cfg.deck1,
        deck2_name=cfg.deck2,
        training_player_name=cfg.training_player_name,
    )
    return OpponentEnv(base, opponent)


def _action_mask(controller, n_actions: int) -> np.ndarray:
    valid = controller.get_valid_actions()
    n_valid = len(valid)
    if n_valid > n_actions:
        logger.warning(
            "action-space truncation: %d valid actions but n_actions=%d "
            "(tail %d actions are unreachable)",
            n_valid, n_actions, n_valid - n_actions,
        )
    mask = np.zeros(n_actions, dtype=np.float32)
    mask[: min(n_valid, n_actions)] = 1.0
    return mask


def _bootstrap_value(network: PolicyValueNetwork, obs: dict, device: str) -> float:
    """Forward-pass an observation through the value head; return scalar."""
    torch_obs = _build_obs_for_network(obs, device)
    with torch.no_grad():
        _, value = network(torch_obs)
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
        embedding_dim=config.embedding_dim,
        hidden_dim=config.hidden_dim,
        num_actions=100,
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
            embedding_dim=config.embedding_dim,
            hidden_dim=config.hidden_dim,
        )
    else:
        opp = RandomOpponent(seed=config.seed)
    env = _make_env(config, opp)

    # 6. Open metrics logger
    metrics = MetricsLogger(os.path.join(run_dir, "metrics.csv"))

    # 7. Main loop
    obs, _ = env.reset()
    it = start_iter - 1  # in case the loop body never runs
    try:
        for it in range(start_iter, config.max_iters + 1):
            # --- Collect rollout ---
            buffer.reset()
            for _ in range(config.rollout_steps):
                mask = _action_mask(env.controller, n_actions=100)
                torch_obs = _build_obs_for_network(obs, device)
                action, log_prob, value = trainer.select_action(torch_obs, mask)
                next_obs, reward, terminated, truncated, _ = env.step(action)
                buffer.add(obs, action, reward, value, log_prob, terminated)
                obs = next_obs
                if terminated or truncated:
                    obs, _ = env.reset()
            # --- Bootstrap final value ---
            last_value = _bootstrap_value(network, obs, device)
            buffer.compute_returns_and_advantages(last_value)

            # --- Update ---
            try:
                batch = buffer.get()
                losses = trainer.update(batch)
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
                f"entropy={losses['entropy']:.4f}",
                flush=True,
            )

            # --- Eval ---
            if it % config.eval_every == 0:
                winrate = evaluate(
                    network=network,
                    opponent_factory=lambda: RandomOpponent(seed=config.seed + it),
                    n_games=config.eval_games,
                    deck1=config.deck1, deck2=config.deck2,
                    training_player_name=config.training_player_name,
                )
                event = fsm.update(winrate)
                metrics.log_eval(
                    iter=it, phase=fsm.phase.value,
                    eval_winrate=winrate,
                    best_winrate=fsm.best_winrate,
                    plateau_count=fsm.plateau_count,
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
                        embedding_dim=config.embedding_dim,
                        hidden_dim=config.hidden_dim,
                    )
                    obs, _ = env.reset()  # restart episode against new opponent

                if event == CurriculumEvent.EARLY_STOP:
                    print(
                        f"[iter {it:04d}] early stop: "
                        f"no improvement for {fsm.early_stop_patience} evals",
                        flush=True,
                    )
                    break

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
        metrics.close()
        env.close()

    return run_dir


def main(argv=None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    args = parse_cli(argv)

    if args.resume is not None:
        ckpt = load_checkpoint(args.resume)
        # Reconstruct TrainConfig from the checkpoint's saved config dict
        cfg_dict = ckpt["config"]
        cfg_dict["curriculum"] = CurriculumConfig(**cfg_dict["curriculum"])
        config = TrainConfig(**cfg_dict)
        print(f"resuming from {args.resume}; --config is ignored", file=sys.stderr)
    else:
        config = load_config(args.config, overrides=args.override)

    run_dir = run_training_loop(config, resume_path=args.resume, device=args.device)
    print(f"training complete; run directory: {run_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
