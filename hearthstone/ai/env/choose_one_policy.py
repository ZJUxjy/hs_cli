"""Pre-pick a sub-card for must_choose_one cards at action-enumeration time."""

from typing import Any


class ChooseOnePolicy:
    """Base class for choose-one card policies."""

    def choose(self, card: Any) -> Any:
        """Return one of card.choose_cards. Called when card.must_choose_one."""
        raise NotImplementedError


class FirstChoiceOne(ChooseOnePolicy):
    """Always pick the first sub-card from choose_cards."""

    def choose(self, card: Any) -> Any:
        return card.choose_cards[0]
