"""Tests for scripts/analyze_draws.py — the draw-quality replay tool."""
import csv
import os
import sys

import pytest
import torch

from hearthstone.ai.network import PolicyValueNetwork


# Ensure scripts/ is importable
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def test_label_from_score_thresholds():
    """label_from_score returns 神抽 / 鬼抽 / 普通 at the right cutoffs."""
    from scripts.analyze_draws import label_from_score
    assert label_from_score(0.20, threshold=0.15) == "神抽"
    assert label_from_score(-0.20, threshold=0.15) == "鬼抽"
    assert label_from_score(0.10, threshold=0.15) == "普通"
    assert label_from_score(0.0, threshold=0.15) == "普通"
    # Boundary: exactly at threshold → 普通 (strict >)
    assert label_from_score(0.15, threshold=0.15) == "普通"
    assert label_from_score(-0.15, threshold=0.15) == "普通"


@pytest.mark.slow
def test_analyze_draws_writes_csv(tmp_path):
    """End-to-end: load a fresh checkpoint, replay 2 games, write CSV."""
    from hearthstone.ai.training_utils import save_checkpoint
    from hearthstone.ai.config import (
        CardFeaturesConfig, CurriculumConfig, SelfPlayConfig, TrainConfig,
    )
    cfg = TrainConfig(
        seed=42, max_iters=1, rollout_steps=8, ppo_epochs=1,
        deck_pool=["aggro_mage", "control_warrior"],
        deck_selection="random_pair", training_player_idx=0,
        swap_training_player=True,
        mulligan_policy="keep_low_cost", mulligan_threshold=3,
        discover_policy="first", choose_one_policy="first",
        lr=3e-4, gamma=0.99, gae_lambda=0.95, clip_epsilon=0.2,
        value_coef=0.5, entropy_coef=0.01, max_grad_norm=0.5,
        slot_dim=90, hidden_dim=128, num_actions=512,
        curriculum=CurriculumConfig(switch_threshold=0.65, early_stop_patience=5),
        self_play=SelfPlayConfig(
            refresh_threshold=0.8, refresh_eval_games=4, refresh_every=2,
            random_opponent_prob=0.2, opponent_checkpoint_path="x.pt",
        ),
        eval_every=1, eval_games=2, max_actions_per_game=100,
        milestone_every=0, milestone_games_per_matchup=1,
        checkpoint_every=1, checkpoint_dir=str(tmp_path),
        best_checkpoint_path=str(tmp_path / "best.pt"),
        runs_dir=str(tmp_path / "runs"),
        card_features=CardFeaturesConfig(log_coverage=False),
        aux_loss_coef=0.5, aux_warmup_iters=0,
        aux_counterfactual_k=2, draw_advantage_threshold=0.15,
    )

    net = PolicyValueNetwork()
    opt = torch.optim.Adam(net.parameters(), lr=3e-4)
    ckpt_path = str(tmp_path / "ckpt.pt")
    save_checkpoint(
        ckpt_path, network=net, optimizer=opt, iter_num=1,
        config=cfg, best_winrate=0.0, phase="RANDOM",
    )

    out_csv = str(tmp_path / "draws.csv")
    from scripts.analyze_draws import run_analysis
    run_analysis(
        checkpoint_path=ckpt_path,
        deck_names=["aggro_mage", "control_warrior"],
        n_games=2, output_path=out_csv, threshold=0.15, seed=42,
        max_actions_per_game=100,
    )

    assert os.path.exists(out_csv)
    rows = list(csv.DictReader(open(out_csv)))
    if rows:  # may be 0 if no draw events fired in 2 short games
        for r in rows:
            assert r["label"] in ("神抽", "鬼抽", "普通")
            assert r["deck_agent"] in ("aggro_mage", "control_warrior")
            assert int(r["game_idx"]) >= 0
