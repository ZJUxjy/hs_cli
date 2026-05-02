"""MilestoneRunner — periodic round-robin eval in a subprocess.

Subprocess is spawned via ProcessPoolExecutor(mp_context='spawn') because
torch+fork is unsafe (lesson from batch_simulator.py).

submit() is non-blocking: parent copies best.pt to a pinned snapshot path
(avoiding torch.save races with the next iter's checkpoint), then submits
the round-robin job. collect_completed() polls without blocking.

Caveats:
- max_workers=1 means the same worker process is reused across submits.
  Imports run once per worker lifetime; cards.db re-init is idempotent.
- On parent KeyboardInterrupt → shutdown(wait=False, cancel_futures=True):
  running subprocess survives parent death (not daemonic; concurrent.futures
  doesn't expose a kill API). User may need pkill -f _run_round_robin.
- If milestones run slower than milestone_every iters, _pending grows;
  we warn when len(_pending) > 3.
"""
from __future__ import annotations

import csv
import logging
import multiprocessing as mp
import os
import shutil
import sys
from concurrent.futures import Future, ProcessPoolExecutor
from typing import Optional

logger = logging.getLogger(__name__)


class MilestoneRunner:

    def __init__(self, output_dir: str):
        os.makedirs(output_dir, exist_ok=True)
        self.output_dir = output_dir

        # Cleanup partial CSVs from prior killed runs.
        for root, _dirs, files in os.walk(output_dir):
            for fname in files:
                if fname.endswith(".csv.partial"):
                    os.remove(os.path.join(root, fname))

        # spawn (not fork) — torch+fork is unsafe.
        ctx = mp.get_context("spawn")
        self._executor = ProcessPoolExecutor(max_workers=1, mp_context=ctx)
        self._pending: list = []   # list of (Future, iter_num, out_path)

    def submit(self, *, iter_num: int, checkpoint_path: str,
               deck_names: list, games_per_matchup: int,
               slot_dim: int, num_actions: int) -> str:
        """Pin checkpoint snapshot; submit subprocess job; return output csv path."""
        snapshot_dir = os.path.join(self.output_dir, f"iter_{iter_num:04d}")
        os.makedirs(snapshot_dir, exist_ok=True)
        snapshot_path = os.path.join(snapshot_dir, "checkpoint.pt")
        shutil.copy(checkpoint_path, snapshot_path)

        out_csv = os.path.join(snapshot_dir, "heatmap.csv")
        f = self._executor.submit(
            _run_round_robin,
            snapshot_path, deck_names, games_per_matchup, out_csv,
            slot_dim, num_actions,
        )
        self._pending.append((f, iter_num, out_csv))
        if len(self._pending) > 3:
            logger.warning(
                "[milestone] _pending length %d — milestones running slower "
                "than milestone_every; consider increasing the interval",
                len(self._pending),
            )
        logger.info("[milestone] submitted iter=%d → %s", iter_num, out_csv)
        return out_csv

    def collect_completed(self) -> list:
        """Return [(iter_num, out_path), ...] for newly-finished milestones."""
        done, remaining = [], []
        for fut, iter_num, out in self._pending:
            if not fut.done():
                remaining.append((fut, iter_num, out))
                continue
            try:
                fut.result()
                done.append((iter_num, out))
                logger.info("[milestone] completed iter=%d", iter_num)
            except Exception as e:
                logger.error("[milestone] iter=%d failed: %s", iter_num, e)
        self._pending = remaining
        return done

    def shutdown(self, wait: bool = True):
        """Cancel pending submits; in-flight subprocess is NOT signalled."""
        # cancel_futures requires Python 3.9+. Gate the kwarg.
        if sys.version_info >= (3, 9):
            self._executor.shutdown(wait=wait, cancel_futures=True)
        else:
            self._executor.shutdown(wait=wait)


def _run_round_robin(
    checkpoint_path: str, deck_names: list, games_per_matchup: int,
    output_path: str, slot_dim: int, num_actions: int,
) -> None:
    """Subprocess entry. Cold start: re-imports everything fresh.

    Order: torch threading must be set BEFORE the first torch op.
    """
    import torch
    torch.set_num_threads(1)

    from fireplace import cards
    cards.db.initialize()

    from hearthstone.ai.env.deck_source import load_decks
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.opponents import RandomOpponent, SelfPlayOpponent
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.enums import PlayState

    # Load checkpoint and read network shape from its embedded config so
    # the subprocess works with non-default hidden_dim/num_actions/slot_dim.
    ckpt = torch.load(checkpoint_path, map_location="cpu")
    ckpt_cfg = ckpt.get("config", {})
    eff_slot_dim = int(ckpt_cfg.get("slot_dim", slot_dim))
    eff_hidden_dim = int(ckpt_cfg.get("hidden_dim", 128))
    eff_num_actions = int(ckpt_cfg.get("num_actions", num_actions))

    net = PolicyValueNetwork(
        slot_dim=eff_slot_dim,
        hidden_dim=eff_hidden_dim,
        num_actions=eff_num_actions,
    )
    net.load_state_dict(ckpt["network"] if "network" in ckpt else ckpt)
    net.eval()

    decks = load_decks(deck_names)
    agent = SelfPlayOpponent(
        network_path=None,
        slot_dim=eff_slot_dim,
        hidden_dim=eff_hidden_dim,
        num_actions=eff_num_actions,
    )
    agent.network = net
    agent.network.eval()

    # Write to .partial first; rename on success so partial outputs are
    # recoverable from cleanup.
    partial = output_path + ".partial"
    rows = []
    for i, deck_a in enumerate(decks):
        for j, deck_b in enumerate(decks):
            if i == j:
                continue
            for tp_idx in (0, 1):
                wins = 0
                cap_hits = 0
                for g in range(games_per_matchup):
                    matchup_seed = (i * 31 + j * 17 + tp_idx * 7 + g) & 0x7FFFFFFF
                    env = FireplaceGymEnv(
                        decks=[deck_a, deck_b],
                        pair_strategy="fixed",
                        swap_training_player=False,
                        training_player_idx=tp_idx,
                        seed=matchup_seed,
                    )
                    env.reset()
                    opp = RandomOpponent()
                    action_count = 0
                    while not env.game.ended and action_count < 1000:
                        if env.game.current_player is env.training_player:
                            idx = agent.act(env)
                        else:
                            idx = opp.act(env)
                        env.step(idx)
                        action_count += 1
                    if action_count >= 1000 and not env.game.ended:
                        cap_hits += 1
                    elif env.training_player.playstate == PlayState.WON:
                        wins += 1
                rows.append({
                    "deck_a": deck_a.name, "deck_b": deck_b.name,
                    "training_player_idx": tp_idx,
                    "n_games": games_per_matchup,
                    "winrate": wins / games_per_matchup,
                    "cap_hit_count": cap_hits,
                })

    with open(partial, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=[
            "deck_a", "deck_b", "training_player_idx",
            "n_games", "winrate", "cap_hit_count",
        ])
        w.writeheader()
        w.writerows(rows)
    os.replace(partial, output_path)
