"""Training configuration: dataclass schema, YAML loading, CLI parsing."""
import argparse
from dataclasses import dataclass
from typing import List, Optional

import yaml


@dataclass
class CurriculumConfig:
    switch_threshold: float
    early_stop_patience: int


@dataclass
class SelfPlayConfig:
    refresh_threshold: float
    refresh_eval_games: int
    refresh_every: int
    random_opponent_prob: float
    opponent_checkpoint_path: str


@dataclass
class CardFeaturesConfig:
    log_coverage: bool = True


@dataclass
class TrainConfig:
    seed: int
    max_iters: int
    rollout_steps: int
    ppo_epochs: int
    deck_pool: List[str]
    deck_selection: str
    fixed_deck1: str
    fixed_deck2: str
    training_player_idx: int

    mulligan_policy: str
    mulligan_threshold: int
    discover_policy: str
    choose_one_policy: str

    lr: float
    gamma: float
    gae_lambda: float
    clip_epsilon: float
    value_coef: float
    entropy_coef: float
    max_grad_norm: float

    slot_dim: int
    hidden_dim: int
    num_actions: int

    curriculum: CurriculumConfig

    self_play: SelfPlayConfig

    eval_every: int
    eval_games: int
    max_actions_per_game: int

    checkpoint_every: int
    checkpoint_dir: str
    best_checkpoint_path: str

    runs_dir: str

    card_features: CardFeaturesConfig


def apply_overrides(raw: dict, overrides: List[str]) -> dict:
    """Apply --override key=value pairs to a raw config dict in-place.

    Supports dotted keys for nested fields, e.g.
    'curriculum.switch_threshold=0.75'. Values are parsed via yaml.safe_load
    so types are preserved (1e-4 → float, true → bool).

    Caveat: PyYAML 6 (YAML 1.2) parses bare scientific notation like '1e-4'
    as a string; we fall back to float() in that case so the documented
    type preservation works. As a side effect, overriding a string-typed
    field with a value that happens to parse as float (e.g. 'deck1=1e3' or
    'deck1=inf') will silently coerce to float — avoid such collisions.
    """
    for item in overrides:
        if "=" not in item:
            raise ValueError(f"--override expects key=value, got: {item!r}")
        key, value_str = item.split("=", 1)
        value = yaml.safe_load(value_str)
        # PyYAML 6 (YAML 1.2) treats bare scientific notation like '1e-4' as a
        # string.  Try float() so '--override lr=1e-4' still yields a float.
        if isinstance(value, str):
            try:
                value = float(value)
            except ValueError:
                pass
        parts = key.split(".")
        target = raw
        for part in parts[:-1]:
            if part not in target or not isinstance(target[part], dict):
                raise KeyError(f"override path {key!r}: {part} not in config")
            target = target[part]
        target[parts[-1]] = value
    return raw


def load_config(path: str, overrides: Optional[List[str]] = None) -> TrainConfig:
    """Load a YAML config file, apply overrides, return a validated TrainConfig.

    Missing keys → TypeError from dataclass constructor.
    Extra keys → TypeError from dataclass constructor.
    """
    with open(path) as f:
        raw = yaml.safe_load(f)
    if overrides:
        apply_overrides(raw, overrides)
    raw["curriculum"] = CurriculumConfig(**raw["curriculum"])
    raw["self_play"] = SelfPlayConfig(**raw["self_play"])
    raw["card_features"] = CardFeaturesConfig(**raw.get("card_features", {}))
    return TrainConfig(**raw)


def parse_cli(argv: Optional[List[str]] = None) -> argparse.Namespace:
    """Parse CLI args. Returns a Namespace with: config, resume, override, device."""
    parser = argparse.ArgumentParser(description="Train Hearthstone AI via PPO.")
    parser.add_argument("--config", required=True, help="Path to YAML config file")
    parser.add_argument("--resume", default=None, help="Path to checkpoint to resume from")
    parser.add_argument(
        "--override", nargs="*", default=[],
        help="key=value pairs (supports nested keys via dot notation)",
    )
    parser.add_argument(
        "--device", default="cpu", choices=["cpu", "cuda"],
        help="PyTorch device for training (default: cpu)",
    )
    return parser.parse_args(argv)
