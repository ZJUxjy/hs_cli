"""Tests for GameController."""
import pytest
from hearthstone.engine.game_controller import GameController, GameEvent
from hearthstone.models.deck import Deck
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass


def create_test_deck():
    """Create a simple test deck."""
    cards = []
    for i in range(30):
        cards.append(Minion(
            id=f"TEST_{i:03d}",
            name=f"Test Minion {i}",
            cost=2,
            attack=2,
            health=2
        ))
    return Deck(name="Test Deck", hero_class=HeroClass.MAGE, cards=cards)


def test_game_controller_initialization():
    """Test GameController can be initialized with two decks."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()

    controller = GameController(deck1, deck2)

    assert controller is not None
