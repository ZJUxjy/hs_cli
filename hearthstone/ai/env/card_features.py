"""CardFeatureEncoder -- encodes fireplace cards into fixed-length feature vectors.

The static portion (80 dims) is computed once per card at startup by walking
the fireplace DSL trees (play / events / update / deathrattle). The dynamic
portion (10 dims) is rebuilt every observation for board minions.

All features are clipped to [0.0, 1.0]. See spec section "CardFeatureEncoder".
"""
from __future__ import annotations

import logging
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

# Pre-built mechanic-to-GameTag mapping (populated lazily once).
_MECH_TAG_MAP: dict[str, Any] | None = None


def _get_mech_tag_map() -> dict[str, Any]:
    """Lazy helper: build {MECH_NAME: GameTag} mapping."""
    global _MECH_TAG_MAP
    if _MECH_TAG_MAP is None:
        from hearthstone.enums import GameTag
        _MECH_TAG_MAP = {}
        for mech in _MECHANIC_VOCAB:
            tag = getattr(GameTag, mech, None)
            if tag is not None:
                _MECH_TAG_MAP[mech] = tag
    return _MECH_TAG_MAP


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

    # Mechanic flags: check both attribute and GameTag
    mech_tag_map = _get_mech_tag_map()
    tags_dict = getattr(card_def, "tags", {})
    for idx, mech in enumerate(_MECHANIC_VOCAB):
        prop = getattr(card_def, mech.lower(), None)
        if prop is True:
            feat[_OFF_MECHANIC + idx] = 1.0
            continue
        # Fallback: check card tags dict
        tag = mech_tag_map.get(mech)
        if tag is not None and bool(tags_dict.get(tag, 0)):
            feat[_OFF_MECHANIC + idx] = 1.0

    rarity_name = getattr(getattr(card_def, "rarity", None), "name", "COMMON")
    _set_one_hot(feat, _OFF_RARITY, _RARITY_VOCAB, rarity_name)


# ----- DSL walker ----------------------------------------------------------
_COUNTER_KEYS = (
    "n_hit", "total_hit", "n_buff", "atk_buff", "hp_buff",
    "n_draw", "total_draw", "n_summon", "n_destroy", "n_heal", "total_heal",
    "aoe_or_random",
    "unknown",
)

# Cached references to fireplace action classes (populated on first use).
_FP_ACTIONS: Any = None
_AOE_SELECTOR_IDS: frozenset[int] | None = None


def _get_fp_actions() -> Any:
    global _FP_ACTIONS
    if _FP_ACTIONS is None:
        from fireplace import actions
        _FP_ACTIONS = actions
    return _FP_ACTIONS


def _get_aoe_selector_ids() -> frozenset[int]:
    global _AOE_SELECTOR_IDS
    if _AOE_SELECTOR_IDS is None:
        from fireplace.dsl import selector as sel_mod
        _AOE_SELECTOR_IDS = frozenset(
            id(getattr(sel_mod, name, None))
            for name in (
                "ENEMY_MINIONS", "FRIENDLY_MINIONS", "ALL_MINIONS",
                "ALL_CHARACTERS", "ENEMY_CHARACTERS", "FRIENDLY_CHARACTERS",
            )
        )
    return _AOE_SELECTOR_IDS


def _is_aoe_selector(selector: Any) -> bool:
    """True if the selector targets multiple entities (AOE)."""
    from fireplace.dsl.selector import SetOpSelector

    if id(selector) in _get_aoe_selector_ids():
        return True
    # SetOpSelector that isn't a simple TARGET is typically AOE
    if isinstance(selector, SetOpSelector):
        return True
    return False


def _is_random_selector(selector: Any) -> bool:
    from fireplace.dsl.selector import RandomSelector
    return isinstance(selector, RandomSelector)


def _walk(node: Any, c: dict, fp_actions: Any) -> None:
    """Recursively walk a fireplace DSL action / event tree, accumulating counters."""
    if node is None:
        return
    if isinstance(node, (tuple, list)):
        for n in node:
            _walk(n, c, fp_actions)
        return

    args = getattr(node, "_args", ())

    if isinstance(node, fp_actions.Hit):
        c["n_hit"] = c.get("n_hit", 0) + 1
        amount = args[1] if len(args) > 1 else 0
        if isinstance(amount, int):
            c["total_hit"] = c.get("total_hit", 0) + amount
        if len(args) > 0:
            sel = args[0]
            if _is_aoe_selector(sel) or _is_random_selector(sel):
                c["aoe_or_random"] = 1
    elif isinstance(node, fp_actions.Damage):
        c["n_hit"] = c.get("n_hit", 0) + 1
        amount = args[1] if len(args) > 1 else 0
        if isinstance(amount, int):
            c["total_hit"] = c.get("total_hit", 0) + amount
    elif isinstance(node, fp_actions.Buff):
        c["n_buff"] = c.get("n_buff", 0) + 1
    elif isinstance(node, fp_actions.Draw):
        times = getattr(node, "times", 1)
        n = times if isinstance(times, int) else 1
        c["n_draw"] = c.get("n_draw", 0) + 1
        c["total_draw"] = c.get("total_draw", 0) + n
    elif isinstance(node, fp_actions.Summon):
        c["n_summon"] = c.get("n_summon", 0) + 1
    elif isinstance(node, fp_actions.Destroy):
        c["n_destroy"] = c.get("n_destroy", 0) + 1
    elif isinstance(node, fp_actions.Heal):
        c["n_heal"] = c.get("n_heal", 0) + 1
        amount = args[1] if len(args) > 1 else 0
        if isinstance(amount, int):
            c["total_heal"] = c.get("total_heal", 0) + amount
    elif isinstance(node, fp_actions.EventListener):
        _walk(getattr(node, "actions", ()), c, fp_actions)
    elif isinstance(node, fp_actions.SetTags):
        # Not a primary effect type we fingerprint; silently skip
        pass
    else:
        # Unknown action type -- increment counter instead of crashing
        c["unknown"] = c.get("unknown", 0) + 1


def _fill_effect_fingerprint(
    feat: np.ndarray, card_def: Any, fp_actions: Any,
) -> bool:
    """Walk the card's DSL action trees and fill fingerprint features.

    Returns True if any unknown action was encountered.
    """
    counters: dict[str, float] = {}
    has_aura = False
    has_event = False

    scripts = getattr(card_def, "scripts", None)

    for attr_name in ("play", "deathrattle"):
        node = getattr(scripts, attr_name, None) if scripts else None
        if node is not None:
            _walk(node, counters, fp_actions)

    update_node = getattr(scripts, "update", None) if scripts else None
    if update_node is not None:
        has_aura = True
        _walk(update_node, counters, fp_actions)

    events_node = getattr(scripts, "events", None) if scripts else None
    if events_node is not None:
        has_event = True
        _walk(events_node, counters, fp_actions)

    feat[_OFF_FLAGS + 0] = 1.0 if has_aura else 0.0
    feat[_OFF_FLAGS + 1] = 1.0 if has_event else 0.0

    feat[_OFF_FINGERPRINT + 0] = _clip_norm(counters.get("n_hit", 0), 5)
    feat[_OFF_FINGERPRINT + 1] = _clip_norm(counters.get("total_hit", 0), 15)
    feat[_OFF_FINGERPRINT + 2] = _clip_norm(counters.get("n_buff", 0), 5)
    feat[_OFF_FINGERPRINT + 3] = _clip_norm(counters.get("atk_buff", 0), 10)
    feat[_OFF_FINGERPRINT + 4] = _clip_norm(counters.get("hp_buff", 0), 10)
    feat[_OFF_FINGERPRINT + 5] = _clip_norm(counters.get("n_draw", 0), 5)
    feat[_OFF_FINGERPRINT + 6] = _clip_norm(counters.get("total_draw", 0), 5)
    feat[_OFF_FINGERPRINT + 7] = _clip_norm(counters.get("n_summon", 0), 5)
    feat[_OFF_FINGERPRINT + 8] = _clip_norm(counters.get("n_destroy", 0), 3)
    feat[_OFF_FINGERPRINT + 9] = _clip_norm(counters.get("n_heal", 0), 3)
    feat[_OFF_FINGERPRINT + 10] = _clip_norm(counters.get("total_heal", 0), 15)
    feat[_OFF_FINGERPRINT + 11] = 1.0 if counters.get("aoe_or_random", 0) else 0.0

    return counters.get("unknown", 0) > 0


def build_card_feature_cache() -> None:
    """Walk every card in fireplace's database and populate _FEATURE_CACHE.

    Idempotent -- cheap to call multiple times.
    """
    if _FEATURE_CACHE:
        return
    from fireplace import cards
    cards.db.initialize()
    fp_actions = _get_fp_actions()
    n_total = 0
    n_unknown = 0
    for card_id, card_def in cards.db.items():
        feat = np.zeros(CARD_FEAT_DIM, dtype=np.float32)
        _fill_static_numeric(feat, card_def)
        _fill_one_hots(feat, card_def)
        has_unknown = _fill_effect_fingerprint(feat, card_def, fp_actions)
        _FEATURE_CACHE[card_id] = feat
        n_total += 1
        if has_unknown:
            n_unknown += 1
    coverage_pct = 100.0 * (n_total - n_unknown) / max(n_total, 1)
    logger.info(
        "[card_features] %d cards cached, %.1f%% fully covered",
        n_total, coverage_pct,
    )
