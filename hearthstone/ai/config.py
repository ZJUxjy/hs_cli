"""Training configuration: dataclass schema, YAML loading, CLI parsing."""
from __future__ import annotations

import argparse
import warnings
from dataclasses import dataclass
from typing import List, Optional

import yaml


# Keys deprecated in S2-A. Kept for migration only; stripped before TrainConfig
# construction so old config YAMLs and old checkpoints don't TypeError.
_DEPRECATED_KEYS = ("fixed_deck1", "fixed_deck2")


def _strip_deprecated(raw: dict, source: str) -> dict:
    """Remove deprecated keys from a raw config dict in-place; warn for each.

    Called from BOTH load_config (YAML path) AND scripts/train.py's
    --resume branch (checkpoint path). Single helper so both paths track
    the same set.
    """
    for key in _DEPRECATED_KEYS:
        if key in raw:
            warnings.warn(
                f"{source}: '{key}' is deprecated; ignored. "
                "Decks are now drawn from `deck_pool` per `pair_strategy`.",
                DeprecationWarning,
                stacklevel=2,
            )
            raw.pop(key)
    return raw


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
    deck_selection: str          # "fixed" | "random_pair"
    training_player_idx: int

    swap_training_player: bool
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

    milestone_every: int
    milestone_games_per_matchup: int

    checkpoint_every: int
    checkpoint_dir: str
    best_checkpoint_path: str

    runs_dir: str

    card_features: CardFeaturesConfig

    # === S2-B aux head (defaults if missing from YAML) ===
    aux_loss_coef: float = 0.5
    aux_warmup_iters: int = 100
    aux_counterfactual_k: int = 4
    draw_advantage_threshold: float = 0.15


def apply_overrides(raw: dict, overrides: List[str]) -> dict:
    """Apply --override key=value pairs to a raw config dict in-place."""
    for item in overrides:
        if "=" not in item:
            raise ValueError(f"--override expects key=value, got: {item!r}")
        key, value_str = item.split("=", 1)
        value = yaml.safe_load(value_str)
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


def _dict_to_config(raw: dict) -> TrainConfig:
    """Build TrainConfig from a raw dict (after _strip_deprecated)."""
    raw["curriculum"] = CurriculumConfig(**raw["curriculum"])
    raw["self_play"] = SelfPlayConfig(**raw["self_play"])
    raw["card_features"] = CardFeaturesConfig(**raw.get("card_features", {}))
    return TrainConfig(**raw)


def load_config(path: str, overrides: Optional[List[str]] = None) -> TrainConfig:
    """Load a YAML config file, strip deprecated keys, apply overrides,
    return a validated TrainConfig.

    Missing keys → TypeError from dataclass constructor.
    Extra keys (other than deprecated) → TypeError from dataclass constructor.
    """
    with open(path) as f:
        raw = yaml.safe_load(f)
    raw = _strip_deprecated(raw, source=f"config file {path}")
    if overrides:
        apply_overrides(raw, overrides)
    return _dict_to_config(raw)


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
