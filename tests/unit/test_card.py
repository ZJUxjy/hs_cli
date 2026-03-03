"""Tests for Card model."""
import pytest
from hearthstone.models.card import Card, Minion, Spell
from hearthstone.models.enums import CardType, Ability


def test_card_creation():
    """Test basic card creation."""
    card = Card(
        id="TEST_001",
        name="Test Card",
        cost=3,
        card_type=CardType.SPELL,
        description="A test card"
    )
    assert card.id == "TEST_001"
    assert card.name == "Test Card"
    assert card.cost == 3
    assert card.card_type == CardType.SPELL


def test_minion_creation():
    """Test minion card creation."""
    minion = Minion(
        id="TEST_002",
        name="Test Minion",
        cost=2,
        attack=3,
        health=2,
        abilities={Ability.CHARGE}
    )
    assert minion.id == "TEST_002"
    assert minion.attack == 3
    assert minion.health == 2
    assert Ability.CHARGE in minion.abilities


def test_minion_default_abilities():
    """Test minion has empty abilities set by default."""
    minion = Minion(
        id="TEST_003",
        name="Simple Minion",
        cost=1,
        attack=1,
        health=1
    )
    assert len(minion.abilities) == 0


def test_card_string_representation():
    """Test card string representation."""
    card = Card(
        id="TEST_001",
        name="Fireball",
        cost=4,
        card_type=CardType.SPELL
    )
    assert str(card) == "Fireball (4)"
