"""Discover / Choose policies (mid-turn 1-of-N pick). Always pick exactly one."""
from __future__ import annotations

from typing import Any


class DiscoverPolicy:
    """Base class for discover policies."""

    def choose(self, options: list[Any]) -> Any:
        raise NotImplementedError


class FirstOption(DiscoverPolicy):
    """Always pick the first option."""

    def choose(self, options: list[Any]) -> Any:
        return options[0]


class LowestCost(DiscoverPolicy):
    """Pick the option with the lowest cost."""

    def choose(self, options: list[Any]) -> Any:
        return min(options, key=lambda c: c.cost)
