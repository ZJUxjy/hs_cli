"""Slow integration smoke test for run_training_loop."""
import csv
import os

import pytest

from hearthstone.ai.config import TrainConfig, CurriculumConfig


@pytest.mark.slow
def test_two_iter_train_smoke(tmp_path):
    """Run 2 tiny iterations and verify metrics + checkpoint files exist."""
    cfg = TrainConfig(
        seed=42, max_iters=2, rollout_steps=64, ppo_epochs=2,
        deck1="test_deck", deck2="test_deck", training_player_name="Player 1",
        lr=3e-4, gamma=0.99, gae_lambda=0.95, clip_epsilon=0.2,
        value_coef=0.5, entropy_coef=0.01, max_grad_norm=0.5,
        embedding_dim=64, hidden_dim=128,
        curriculum=CurriculumConfig(switch_threshold=0.80, early_stop_patience=5),
        eval_every=1, eval_games=4,
        checkpoint_every=1,
        checkpoint_dir=str(tmp_path / "checkpoints"),
        best_checkpoint_path=str(tmp_path / "checkpoints" / "best.pt"),
        runs_dir=str(tmp_path / "runs"),
    )
    from scripts.train import run_training_loop
    run_dir = run_training_loop(cfg, resume_path=None, device="cpu")

    metrics_path = os.path.join(run_dir, "metrics.csv")
    assert os.path.exists(metrics_path), f"missing {metrics_path}"

    rows = list(csv.reader(open(metrics_path)))
    # Header + 2 iter rows + 2 eval rows = 5 rows
    assert len(rows) >= 5, f"expected >=5 csv rows, got {len(rows)}"

    # At least one checkpoint file in the checkpoints dir
    ckpt_dir = tmp_path / "checkpoints"
    assert ckpt_dir.exists()
    ckpt_files = list(ckpt_dir.glob("*.pt"))
    assert len(ckpt_files) >= 1, f"no checkpoint files in {ckpt_dir}"
