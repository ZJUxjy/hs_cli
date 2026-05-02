"""Load fireplace decks as Deck objects from data/fireplace_decks/<name>.yaml."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import yaml


_PROJECT_ROOT = Path(__file__).resolve().parents[3]   # hs_glm root
DEFAULT_DECK_DIR = str(_PROJECT_ROOT / "data" / "fireplace_decks")
DECK_DIRS = [DEFAULT_DECK_DIR]

_REQUIRED_KEYS = ("name", "archetype", "hero_id", "cards")
_VALID_ARCHETYPES = ("aggro", "control")


@dataclass(frozen=True)
class Deck:
    """One deck = a class + archetype + 30 fireplace card ids."""
    name: str               # filename stem, e.g., "aggro_mage"
    archetype: str          # "aggro" | "control"
    hero_id: str            # fireplace hero card id, e.g., "HERO_08"
    card_ids: tuple         # 30 fireplace card ids; tuple for hashability


def load_deck(name: str) -> Deck:
    """Load and validate a deck. Raises ValueError on any invariant violation.

    Validation includes: required keys, archetype enum, 30 cards, hero_id and
    every card_id present in fireplace.cards.db, archetype cost-curve
    invariants, duplicate limits.
    """
    path = _find_deck_file(name)
    if path is None:
        raise FileNotFoundError(
            f"Deck '{name}' not found. Searched: {DECK_DIRS}"
        )
    with open(path, "r") as f:
        data = yaml.safe_load(f)

    for k in _REQUIRED_KEYS:
        if k not in data:
            raise ValueError(f"Deck '{name}': missing required key '{k}'")

    if data["archetype"] not in _VALID_ARCHETYPES:
        raise ValueError(
            f"Deck '{name}': archetype '{data['archetype']}' "
            f"not in {_VALID_ARCHETYPES}"
        )

    card_ids = data["cards"]
    if not isinstance(card_ids, list) or len(card_ids) != 30:
        raise ValueError(
            f"Deck '{name}': cards must be a list of length 30, got {len(card_ids)}"
        )

    from fireplace import cards as fp_cards
    fp_cards.db.initialize()
    if data["hero_id"] not in fp_cards.db:
        raise ValueError(
            f"Deck '{name}': hero_id '{data['hero_id']}' not in cards.db"
        )
    missing = [c for c in card_ids if c not in fp_cards.db]
    if missing:
        raise ValueError(
            f"Deck '{name}': {len(missing)} card(s) not in cards.db: {missing}"
        )

    deck = Deck(
        name=name, archetype=data["archetype"],
        hero_id=data["hero_id"], card_ids=tuple(card_ids),
    )
    # Order: duplicate limits before archetype invariants. Synth test decks
    # often violate both; checking duplicates first gives the more specific
    # error message ("card X appears N times").
    _validate_duplicate_limits(deck, fp_cards.db)
    _validate_archetype_invariants(deck, fp_cards.db)
    return deck


def load_decks(names: list) -> list:
    """Load each name in order. Failures bubble up with deck name in message."""
    return [load_deck(n) for n in names]


def list_available_decks() -> list:
    seen = set()
    for d in DECK_DIRS:
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            if f.endswith(".yaml"):
                seen.add(f[:-5])
    return sorted(seen)


def _find_deck_file(name: str) -> Optional[Path]:
    for d in DECK_DIRS:
        p = Path(d) / f"{name}.yaml"
        if p.is_file():
            return p
    return None


def _validate_archetype_invariants(deck: Deck, db) -> None:
    """Raise ValueError if cost-curve invariants for the archetype fail."""
    costs = [db[c].cost for c in deck.card_ids]
    mean_cost = sum(costs) / len(costs)
    n_le_2 = sum(1 for c in costs if c <= 2)
    n_ge_6 = sum(1 for c in costs if c >= 6)

    if deck.archetype == "aggro":
        # Spec: aggro mean ≤ 3.0 (or ≤ 3.3 fallback for thin pools).
        # We allow the 3.3 ceiling globally; any deck above 3.0 should
        # have a README note.
        max_mean = 3.3
        if mean_cost > max_mean:
            raise ValueError(
                f"Deck '{deck.name}' archetype=aggro: mean_cost={mean_cost:.2f} "
                f"exceeds aggro ceiling {max_mean}"
            )
        if n_le_2 < 12:
            raise ValueError(
                f"Deck '{deck.name}' archetype=aggro: only {n_le_2} cards "
                f"with cost ≤ 2 (need ≥ 12)"
            )
        if n_ge_6 > 4:
            raise ValueError(
                f"Deck '{deck.name}' archetype=aggro: {n_ge_6} cards "
                f"with cost ≥ 6 (max 4)"
            )
    else:  # control
        if mean_cost < 3.5:
            raise ValueError(
                f"Deck '{deck.name}' archetype=control: mean_cost={mean_cost:.2f} "
                f"below control floor 3.5"
            )
        if n_le_2 > 6:
            raise ValueError(
                f"Deck '{deck.name}' archetype=control: {n_le_2} cards "
                f"with cost ≤ 2 (max 6)"
            )
        if n_ge_6 < 8:
            raise ValueError(
                f"Deck '{deck.name}' archetype=control: only {n_ge_6} cards "
                f"with cost ≥ 6 (need ≥ 8)"
            )


def _validate_duplicate_limits(deck: Deck, db) -> None:
    """Raise if any non-legendary > 2x or any legendary > 1x."""
    counts: dict = {}
    for c in deck.card_ids:
        counts[c] = counts.get(c, 0) + 1
    for cid, n in counts.items():
        rarity = getattr(getattr(db[cid], "rarity", None), "name", "")
        max_n = 1 if rarity == "LEGENDARY" else 2
        if n > max_n:
            raise ValueError(
                f"Deck '{deck.name}': card '{cid}' appears {n} times "
                f"(max {max_n} for rarity={rarity})"
            )


def random_deck(hero_class: str) -> Deck:
    """Random draft via fireplace.utils.random_draft. Returns a Deck with
    name='random_<class>' and archetype='control' (placeholder; not validated).
    Used by future S3' deck pool training; not exercised in S2-A.
    """
    from fireplace.utils import random_draft
    HERO_BY_CLASS = {
        "MAGE": "HERO_08", "WARRIOR": "HERO_01", "HUNTER": "HERO_05",
        "DRUID": "HERO_06", "ROGUE": "HERO_03", "PALADIN": "HERO_04",
        "PRIEST": "HERO_09", "SHAMAN": "HERO_02", "WARLOCK": "HERO_07",
        "DEMONHUNTER": "HERO_10",
    }
    return Deck(
        name=f"random_{hero_class.lower()}",
        archetype="control",
        hero_id=HERO_BY_CLASS[hero_class.upper()],
        card_ids=tuple(random_draft(hero_class)),
    )
