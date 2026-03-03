"""Deck model for Hearthstone."""
from dataclasses import dataclass
from typing import List
from hearthstone.models.card import Card
from hearthstone.models.enums import HeroClass


# Standard Hearthstone deck size
DECK_SIZE = 30


@dataclass
class Deck:
    """Represents a deck of cards."""
    name: str
    hero_class: HeroClass
    cards: List[Card]

    def __post_init__(self):
        """Validate deck on creation."""
        if len(self.cards) != DECK_SIZE:
            raise ValueError(f"Deck must have exactly {DECK_SIZE} cards, got {len(self.cards)}")
