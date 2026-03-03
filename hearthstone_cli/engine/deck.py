"""Deck module for Hearthstone CLI game."""

from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class Deck:
    """卡组定义"""
    card_ids: List[str]

    def __post_init__(self):
        if len(self.card_ids) != 30:
            raise ValueError(f"Deck must have exactly 30 cards, got {len(self.card_ids)}")

    def __iter__(self):
        return iter(self.card_ids)

    def __len__(self):
        return len(self.card_ids)
