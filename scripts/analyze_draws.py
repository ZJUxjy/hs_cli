"""Replay a trained agent over N games; emit per-draw CSV with
draw_advantage_score and 神抽/鬼抽/普通 label.

Usage:
    python scripts/analyze_draws.py \
        --checkpoint checkpoints/best.pt \
        --decks aggro_mage,control_warrior \
        --n-games 20 \
        --output runs/draws_analysis.csv \
        [--threshold 0.15] [--seed 42]
"""
from __future__ import annotations

import argparse
import csv
import random
import sys
from typing import Optional

import torch

from hearthstone.ai.env.deck_source import load_decks
from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
from hearthstone.ai.env.opponents import RandomOpponent, SelfPlayOpponent
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.training_utils import load_checkpoint


def label_from_score(score: float, threshold: float = 0.15) -> str:
    """Map a continuous draw_advantage_score to a coarse label.

    Strict > threshold for 神抽 / strict < -threshold for 鬼抽; ties → 普通.
    """
    if score > threshold:
        return "神抽"
    if score < -threshold:
        return "鬼抽"
    return "普通"


def run_analysis(
    *, checkpoint_path: str, deck_names: list, n_games: int,
    output_path: str, threshold: float = 0.15,
    seed: Optional[int] = None, max_actions_per_game: int = 1000,
) -> None:
    """Replay n_games agent-vs-RandomOpponent games over a deck pool subset.
    Each draw on training_player's turn produces one row in `output_path`.
    """
    ckpt = load_checkpoint(checkpoint_path)
    cfg_raw = ckpt.get("config", {})
    slot_dim = int(cfg_raw.get("slot_dim", 90))
    hidden_dim = int(cfg_raw.get("hidden_dim", 128))
    num_actions = int(cfg_raw.get("num_actions", 512))

    net = PolicyValueNetwork(
        slot_dim=slot_dim, hidden_dim=hidden_dim, num_actions=num_actions,
    )
    net.load_state_dict(ckpt["network"])
    net.eval()

    decks = load_decks(deck_names)
    if len(decks) < 2:
        raise ValueError(f"Need >= 2 decks, got {len(decks)}")

    eval_agent = SelfPlayOpponent(
        network_path=None, slot_dim=slot_dim,
        hidden_dim=hidden_dim, num_actions=num_actions,
    )
    eval_agent.network = net

    rng = random.Random(seed)
    rows = []
    for g in range(n_games):
        # Sample a directed pair (i, j, tp_idx)
        i = rng.randrange(len(decks))
        j = rng.randrange(len(decks))
        while j == i:
            j = rng.randrange(len(decks))
        tp_idx = rng.randrange(2)
        env = FireplaceGymEnv(
            decks=[decks[i], decks[j]], pair_strategy="fixed",
            swap_training_player=False, training_player_idx=tp_idx,
            seed=(seed + g) if seed is not None else None,
        )
        opp = RandomOpponent()
        obs, info = env.reset()
        action_count = 0
        while not env.game.ended and action_count < max_actions_per_game:
            if env.game.current_player is env.training_player:
                if info.get("draw_event", False):
                    drawn = env._last_drawn_card_obj
                    torch_obs = {
                        k: torch.from_numpy(v).unsqueeze(0)
                        for k, v in obs.items()
                    }
                    with torch.no_grad():
                        _, _, aux = net(torch_obs)
                    score = float(aux[0, 0].item())
                    # i and j are the deck indices for env.players[0] and [1].
                    # tp_idx tells us which is the agent.
                    deck_agent_name = decks[i].name if tp_idx == 0 else decks[j].name
                    deck_opp_name = decks[j].name if tp_idx == 0 else decks[i].name
                    rows.append({
                        "game_idx": g, "turn": env.game.turn,
                        "deck_agent": deck_agent_name,
                        "deck_opponent": deck_opp_name,
                        "training_player_idx": tp_idx,
                        "drawn_card_id": getattr(drawn, "id", "?"),
                        "drawn_card_name": getattr(drawn, "name", "?"),
                        "drawn_card_cost": getattr(drawn, "cost", 0),
                        "draw_advantage_score": round(score, 4),
                        "label": label_from_score(score, threshold=threshold),
                    })
                idx = eval_agent.act(env)
            else:
                idx = opp.act(env)
            obs, _, _, _, info = env.step(idx)
            action_count += 1
        env.close()

    fieldnames = [
        "game_idx", "turn", "deck_agent", "deck_opponent",
        "training_player_idx", "drawn_card_id", "drawn_card_name",
        "drawn_card_cost", "draw_advantage_score", "label",
    ]
    with open(output_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

    print(f"Wrote {len(rows)} rows → {output_path}")


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Analyze trained agent's draws.")
    p.add_argument("--checkpoint", required=True)
    p.add_argument("--decks", required=True,
                   help="Comma-separated deck names (>= 2)")
    p.add_argument("--n-games", type=int, default=20)
    p.add_argument("--output", required=True)
    p.add_argument("--threshold", type=float, default=0.15)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--max-actions-per-game", type=int, default=1000)
    args = p.parse_args(argv)

    deck_names = [d.strip() for d in args.decks.split(",") if d.strip()]
    run_analysis(
        checkpoint_path=args.checkpoint,
        deck_names=deck_names,
        n_games=args.n_games,
        output_path=args.output,
        threshold=args.threshold,
        seed=args.seed,
        max_actions_per_game=args.max_actions_per_game,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
