"""Tests for Player model."""
import pytest
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass


def test_player_creation():
    """Test player creation."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1")
    assert player.name == "Player 1"
    assert player.hero == hero
    assert len(player.hand) == 0
    assert len(player.deck) == 0


def test_player_mana():
    """Test player mana management."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1", max_mana=5)

    assert player.mana == 5
    assert player.max_mana == 5

    player.spend_mana(3)
    assert player.mana == 2

    player.refresh_mana()
    assert player.mana == 5


def test_player_draw_card():
    """Test player drawing a card."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1")

    card = Minion(id="TEST_001", name="Test", cost=1, attack=1, health=1)
    player.deck.append(card)

    drawn = player.draw_card()
    assert drawn == card
    assert len(player.deck) == 0
    assert len(player.hand) == 1
