"""Tests for MetricsLogger and checkpoint save/load helpers."""
import csv
from dataclasses import asdict

import pytest
import torch

from hearthstone.ai.config import (
    CardFeaturesConfig, CurriculumConfig, SelfPlayConfig, TrainConfig,
)
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.training_utils import (
    MetricsLogger, save_checkpoint, load_checkpoint,
)


def _minimal_config() -> TrainConfig:
    return TrainConfig(
        seed=42, max_iters=10, rollout_steps=64, ppo_epochs=2,
        deck_pool=["basic_mage", "basic_warrior"],
        deck_selection="fixed",
        fixed_deck1="basic_mage", fixed_deck2="basic_warrior",
        training_player_idx=0,
        mulligan_policy="keep_low_cost", mulligan_threshold=3,
        discover_policy="first", choose_one_policy="first",
        lr=3e-4, gamma=0.99, gae_lambda=0.95, clip_epsilon=0.2,
        value_coef=0.5, entropy_coef=0.01, max_grad_norm=0.5,
        slot_dim=90, hidden_dim=128, num_actions=512,
        curriculum=CurriculumConfig(switch_threshold=0.8, early_stop_patience=5),
        self_play=SelfPlayConfig(
            refresh_threshold=0.8, refresh_eval_games=4, refresh_every=2,
            random_opponent_prob=0.2,
            opponent_checkpoint_path="checkpoints/self_play_opponent.pt",
        ),
        eval_every=2, eval_games=4, max_actions_per_game=200,
        checkpoint_every=5, checkpoint_dir="checkpoints",
        best_checkpoint_path="checkpoints/best.pt",
        runs_dir="runs",
        card_features=CardFeaturesConfig(log_coverage=False),
    )


class TestMetricsLogger:
    def test_writes_header_on_open(self, tmp_path):
        path = tmp_path / "metrics.csv"
        logger = MetricsLogger(str(path))
        logger.close()
        rows = list(csv.reader(path.open()))
        assert rows[0] == [
            "iter", "phase", "total_loss", "policy_loss", "value_loss",
            "entropy", "eval_winrate", "best_winrate", "plateau_count",
        ]

    def test_log_iter_blanks_eval_columns(self, tmp_path):
        path = tmp_path / "metrics.csv"
        logger = MetricsLogger(str(path))
        logger.log_iter(
            iter=1, phase="RANDOM",
            total_loss=0.5, policy_loss=0.1, value_loss=0.4, entropy=4.2,
        )
        logger.close()
        rows = list(csv.reader(path.open()))
        assert rows[1][:6] == ["1", "RANDOM", "0.5", "0.1", "0.4", "4.2"]
        assert rows[1][6:] == ["", "", ""]  # eval columns blank

    def test_log_eval_fills_eval_columns(self, tmp_path):
        path = tmp_path / "metrics.csv"
        logger = MetricsLogger(str(path))
        logger.log_eval(
            iter=10, phase="RANDOM",
            eval_winrate=0.75, best_winrate=0.75, plateau_count=0,
        )
        logger.close()
        rows = list(csv.reader(path.open()))
        # Eval row: loss columns are blank, eval columns filled
        assert rows[1][0] == "10"
        assert rows[1][1] == "RANDOM"
        assert rows[1][2:6] == ["", "", "", ""]
        assert rows[1][6:] == ["0.75", "0.75", "0"]


class TestCheckpointing:
    def test_save_load_round_trip(self, tmp_path):
        net = PolicyValueNetwork()
        opt = torch.optim.Adam(net.parameters(), lr=3e-4)
        cfg = _minimal_config()
        path = tmp_path / "ckpt.pt"

        save_checkpoint(
            str(path), network=net, optimizer=opt, iter_num=42,
            config=cfg, best_winrate=0.83, phase="SELF_PLAY",
        )

        ckpt = load_checkpoint(str(path))
        assert ckpt["iter"] == 42
        assert ckpt["best_winrate"] == 0.83
        assert ckpt["phase"] == "SELF_PLAY"
        assert ckpt["config"]["lr"] == 3e-4
        # Network weights preserved
        net2 = PolicyValueNetwork()
        net2.load_state_dict(ckpt["network"])
        for (k1, v1), (k2, v2) in zip(net.state_dict().items(), net2.state_dict().items()):
            assert torch.equal(v1, v2)
