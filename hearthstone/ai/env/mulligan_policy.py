"""Mulligan policies. Return cards to mulligan away."""
from __future__ import annotations

from typing import Any


class MulliganPolicy:
    """Base class for mulligan policies."""

    def cards_to_mulligan(self, hand: list[Any]) -> list[Any]:
        raise NotImplementedError


class KeepAll(MulliganPolicy):
    """Never mulligan any cards."""

    def cards_to_mulligan(self, hand: list[Any]) -> list[Any]:
        return []


class KeepLowCost(MulliganPolicy):
    """Keep cards with cost <= threshold; mulligan the rest."""

    def __init__(self, threshold: int = 3):
        self.threshold = threshold

    def cards_to_mulligan(self, hand: list[Any]) -> list[Any]:
        return [c for c in hand if c.cost > self.threshold]
