"""CardFeatureEncoder — encodes fireplace cards into fixed-length feature vectors.

The static portion (80 dims) is computed once per card at startup by walking
the fireplace DSL trees (play / events / update / deathrattle). The dynamic
portion (10 dims) is rebuilt every observation for board minions.

All features are clipped to [0.0, 1.0]. See spec section "CardFeatureEncoder".
"""
from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


CARD_FEAT_DIM = 80
MINION_STATE_DIM = 10
SLOT_DIM = CARD_FEAT_DIM + MINION_STATE_DIM   # 90


_FEATURE_CACHE: dict[str, np.ndarray] = {}
_ZERO_STATIC = np.zeros(CARD_FEAT_DIM, dtype=np.float32)
_ZERO_STATE = np.zeros(MINION_STATE_DIM, dtype=np.float32)


def _clip_norm(x: float, max_val: float) -> float:
    """Clip x to [0, max_val] and normalize to [0, 1]."""
    if max_val <= 0:
        return 0.0
    return float(min(max(x, 0.0), max_val)) / float(max_val)


# ----- one-hot vocabularies ------------------------------------------------
_TYPE_VOCAB = ["MINION", "SPELL", "WEAPON", "HERO_POWER"]
_CLASS_VOCAB = [
    "NEUTRAL", "WARRIOR", "SHAMAN", "ROGUE", "PALADIN", "HUNTER",
    "DRUID", "WARLOCK", "MAGE", "PRIEST", "DEMONHUNTER",
]
_RACE_VOCAB = [
    "INVALID", "BEAST", "DEMON", "DRAGON", "ELEMENTAL", "MECHANICAL",
    "MURLOC", "NAGA", "PIRATE", "TOTEM", "UNDEAD", "ALL",
]
_MECHANIC_VOCAB = [
    "BATTLECRY", "DEATHRATTLE", "TAUNT", "DIVINE_SHIELD", "CHARGE", "RUSH",
    "WINDFURY", "STEALTH", "POISONOUS", "LIFESTEAL", "SPELLPOWER", "FREEZE",
    "SECRET", "SILENCE", "REBORN",
]
_RARITY_VOCAB = ["COMMON", "RARE", "EPIC", "LEGENDARY"]


# Slot offsets in the static feature vector.
_OFF_NUMERIC = 0     # 4 dims
_OFF_TYPE = 4        # 4 dims
_OFF_CLASS = 8       # 11 dims
_OFF_RACE = 19       # 12 dims
_OFF_MECHANIC = 31   # 15 dims
_OFF_FLAGS = 46      # 2 dims (has_aura, has_event_trigger)
_OFF_FINGERPRINT = 48  # 12 dims
_OFF_RARITY = 60     # 4 dims
# 64..80 reserved


def _fill_static_numeric(feat: np.ndarray, card_def: Any) -> None:
    feat[_OFF_NUMERIC + 0] = _clip_norm(getattr(card_def, "cost", 0), 10)
    feat[_OFF_NUMERIC + 1] = _clip_norm(getattr(card_def, "atk", 0), 20)
    feat[_OFF_NUMERIC + 2] = _clip_norm(getattr(card_def, "health", 0), 20)
    feat[_OFF_NUMERIC + 3] = _clip_norm(getattr(card_def, "durability", 0), 5)


def _set_one_hot(feat: np.ndarray, offset: int, vocab: list[str], value: str) -> None:
    """Set one-hot bit for *value* at ``offset:offset+len(vocab)``."""
    if value in vocab:
        feat[offset + vocab.index(value)] = 1.0


def _fill_one_hots(feat: np.ndarray, card_def: Any) -> None:
    type_name = getattr(getattr(card_def, "type", None), "name", "")
    _set_one_hot(feat, _OFF_TYPE, _TYPE_VOCAB, type_name)

    class_name = getattr(getattr(card_def, "card_class", None), "name", "NEUTRAL")
    _set_one_hot(feat, _OFF_CLASS, _CLASS_VOCAB, class_name)

    race_name = getattr(getattr(card_def, "race", None), "name", "INVALID")
    _set_one_hot(feat, _OFF_RACE, _RACE_VOCAB, race_name)

    for mech in _MECHANIC_VOCAB:
        prop = getattr(card_def, mech.lower(), None)
        if prop is True:
            feat[_OFF_MECHANIC + _MECHANIC_VOCAB.index(mech)] = 1.0

    rarity_name = getattr(getattr(card_def, "rarity", None), "name", "COMMON")
    _set_one_hot(feat, _OFF_RARITY, _RARITY_VOCAB, rarity_name)


def build_card_feature_cache() -> None:
    """Walk every card in fireplace's database and populate _FEATURE_CACHE.

    Idempotent — cheap to call multiple times.
    """
    if _FEATURE_CACHE:
        return
    from fireplace import cards
    cards.db.initialize()
    n_total = 0
    for card_id, card_def in cards.db.items():
        feat = np.zeros(CARD_FEAT_DIM, dtype=np.float32)
        _fill_static_numeric(feat, card_def)
        _fill_one_hots(feat, card_def)
        # fingerprint filled later (Task 2.3); leave zeros for now
        _FEATURE_CACHE[card_id] = feat
        n_total += 1
    logger.info("[card_features] %d cards cached", n_total)
