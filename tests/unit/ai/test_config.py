"""Tests for TrainConfig: YAML load, dataclass validation, CLI parsing."""
import sys
import yaml
import pytest
from hearthstone.ai.config import (
    TrainConfig, CurriculumConfig, load_config, parse_cli, apply_overrides,
)


def _minimal_yaml(tmp_path, **overrides):
    base = {
        "seed": 42,
        "max_iters": 1000,
        "rollout_steps": 2048,
        "ppo_epochs": 4,
        "deck1": "test_deck",
        "deck2": "test_deck",
        "training_player_name": "Player 1",
        "lr": 3.0e-4,
        "gamma": 0.99,
        "gae_lambda": 0.95,
        "clip_epsilon": 0.2,
        "value_coef": 0.5,
        "entropy_coef": 0.01,
        "max_grad_norm": 0.5,
        "embedding_dim": 64,
        "hidden_dim": 128,
        "curriculum": {"switch_threshold": 0.80, "early_stop_patience": 5},
        "eval_every": 10,
        "eval_games": 50,
        "checkpoint_every": 25,
        "checkpoint_dir": "checkpoints",
        "best_checkpoint_path": "checkpoints/best.pt",
        "runs_dir": "runs",
    }
    base.update(overrides)
    path = tmp_path / "config.yaml"
    path.write_text(yaml.safe_dump(base))
    return path


class TestLoadConfig:
    def test_load_minimal(self, tmp_path):
        path = _minimal_yaml(tmp_path)
        cfg = load_config(str(path))
        assert isinstance(cfg, TrainConfig)
        assert cfg.seed == 42
        assert cfg.lr == 3.0e-4
        assert isinstance(cfg.curriculum, CurriculumConfig)
        assert cfg.curriculum.switch_threshold == 0.80

    def test_missing_key_raises(self, tmp_path):
        path = _minimal_yaml(tmp_path)
        # Drop a required key
        data = yaml.safe_load(path.read_text())
        del data["lr"]
        path.write_text(yaml.safe_dump(data))
        with pytest.raises(TypeError, match="lr"):
            load_config(str(path))

    def test_extra_key_raises(self, tmp_path):
        path = _minimal_yaml(tmp_path, garbage_key="oops")
        with pytest.raises(TypeError, match="garbage_key"):
            load_config(str(path))


class TestApplyOverrides:
    def test_flat_override(self, tmp_path):
        path = _minimal_yaml(tmp_path)
        cfg = load_config(str(path), overrides=["seed=7", "lr=1e-4"])
        assert cfg.seed == 7
        assert cfg.lr == 1e-4
        assert isinstance(cfg.lr, float)

    def test_nested_override(self, tmp_path):
        path = _minimal_yaml(tmp_path)
        cfg = load_config(
            str(path),
            overrides=["curriculum.switch_threshold=0.75"],
        )
        assert cfg.curriculum.switch_threshold == 0.75

    def test_override_yaml_typed(self, tmp_path):
        """Overrides must yaml-parse so 'true'→bool, '1e-4'→float, etc."""
        path = _minimal_yaml(tmp_path)
        cfg = load_config(str(path), overrides=["max_iters=500"])
        assert cfg.max_iters == 500
        assert isinstance(cfg.max_iters, int)


class TestParseCli:
    def test_parse_basic(self):
        args = parse_cli(["--config", "configs/default.yaml"])
        assert args.config == "configs/default.yaml"
        assert args.resume is None
        assert args.override == []
        assert args.device == "cpu"

    def test_parse_with_overrides(self):
        args = parse_cli([
            "--config", "configs/default.yaml",
            "--override", "seed=7", "lr=1e-4",
        ])
        assert args.override == ["seed=7", "lr=1e-4"]

    def test_parse_resume_and_device(self):
        args = parse_cli([
            "--config", "configs/default.yaml",
            "--resume", "checkpoints/iter_0250.pt",
            "--device", "cuda",
        ])
        assert args.resume == "checkpoints/iter_0250.pt"
        assert args.device == "cuda"
