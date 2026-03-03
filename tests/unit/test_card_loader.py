"""Tests for CardLoader."""
import pytest
from hearthstone.cards.card_loader import CardLoader
from hearthstone.models.enums import Ability


def test_load_cards_from_json():
    """Test loading cards from JSON file."""
    loader = CardLoader()
    cards = loader.load_cards("data/cards/basic.json")

    assert len(cards) > 0

    # Check Wisp
    wisp = cards["CS2_231"]
    assert wisp.name == "Wisp"
    assert wisp.cost == 0
    assert wisp.attack == 1
    assert wisp.health == 1


def test_load_card_with_abilities():
    """Test loading a card with abilities."""
    loader = CardLoader()
    cards = loader.load_cards("data/cards/basic.json")

    # Check Sen'jin Shieldmasta
    senjin = cards["CS2_179"]
    assert Ability.TAUNT in senjin.abilities


def test_get_card_by_id():
    """Test getting a card by ID."""
    loader = CardLoader()
    loader.load_cards("data/cards/basic.json")

    wisp = loader.get_card("CS2_231")
    assert wisp.name == "Wisp"
