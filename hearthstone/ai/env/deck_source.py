"""Load fireplace decks from data/fireplace_decks/<name>.yaml."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

import yaml


_PROJECT_ROOT = Path(__file__).resolve().parents[3]   # hs_glm root
DEFAULT_DECK_DIR = str(_PROJECT_ROOT / "data" / "fireplace_decks")
DECK_DIRS = [DEFAULT_DECK_DIR]


def load_deck(name: str) -> tuple[list[str], str]:
    """Load a deck and return (card_ids, hero_id).

    Validates: file exists, contains 30 cards, hero_id and every card_id
    are present in fireplace.cards.db. Raises FileNotFoundError or ValueError.
    """
    path = _find_deck_file(name)
    if path is None:
        raise FileNotFoundError(
            f"Deck '{name}' not found. Searched: {DECK_DIRS}"
        )
    with open(path, "r") as f:
        data = yaml.safe_load(f)

    if "cards" not in data or "hero_id" not in data:
        raise ValueError(f"Deck '{name}' missing 'cards' or 'hero_id' key")

    cards_list = data["cards"]
    hero_id = data["hero_id"]

    if len(cards_list) != 30:
        raise ValueError(f"Deck '{name}' has {len(cards_list)} cards, expected 30")

    from fireplace import cards as fp_cards
    fp_cards.db.initialize()
    if hero_id not in fp_cards.db:
        raise ValueError(f"Deck '{name}': hero_id '{hero_id}' not in cards.db")
    for cid in cards_list:
        if cid not in fp_cards.db:
            raise ValueError(f"Deck '{name}': card_id '{cid}' not in cards.db")

    return list(cards_list), hero_id


def list_available_decks() -> list[str]:
    seen: set[str] = set()
    for d in DECK_DIRS:
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            if f.endswith(".yaml"):
                seen.add(f[:-5])
    return sorted(seen)


def random_deck(hero_class: str) -> tuple[list[str], str]:
    """Random draft via fireplace.utils.random_draft."""
    from fireplace.utils import random_draft
    cards = random_draft(hero_class)
    HERO_BY_CLASS = {
        "MAGE": "HERO_08", "WARRIOR": "HERO_01", "HUNTER": "HERO_05",
        "DRUID": "HERO_06", "ROGUE": "HERO_03", "PALADIN": "HERO_04",
        "PRIEST": "HERO_09", "SHAMAN": "HERO_02", "WARLOCK": "HERO_07",
        "DEMONHUNTER": "HERO_10",
    }
    return cards, HERO_BY_CLASS[hero_class.upper()]


def _find_deck_file(name: str) -> Optional[Path]:
    for d in DECK_DIRS:
        p = Path(d) / f"{name}.yaml"
        if p.is_file():
            return p
    return None
