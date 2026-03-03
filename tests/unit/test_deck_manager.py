"""Tests for DeckManager."""
import pytest
from hearthstone.decks.deck_manager import DeckManager


def test_deck_manager_list_decks():
    """Test listing available decks."""
    manager = DeckManager()
    decks = manager.list_decks()

    assert isinstance(decks, list)


def test_deck_manager_load_nonexistent():
    """Test loading a deck that doesn't exist."""
    manager = DeckManager()

    with pytest.raises(FileNotFoundError):
        manager.load_deck("nonexistent_deck")


def test_deck_manager_save_deck_not_implemented():
    """Test that save_deck raises NotImplementedError."""
    manager = DeckManager()

    with pytest.raises(NotImplementedError, match="save_deck not yet implemented"):
        manager.save_deck(None, "test_deck")


def test_deck_manager_load_deck():
    """Test loading a deck from JSON."""
    manager = DeckManager()
    deck = manager.load_deck("test_deck")

    assert deck is not None
    assert deck.name == "Test Deck"
    assert len(deck.cards) == 30
