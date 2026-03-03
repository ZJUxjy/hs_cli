"""Deck loading and management."""
from pathlib import Path
from typing import List
from hearthstone.models.deck import Deck


class DeckManager:
    """Manage deck loading and saving."""

    def __init__(self, decks_dir: str = "data/decks"):
        self.decks_dir = Path(decks_dir)

    def list_decks(self) -> List[str]:
        """List available deck names."""
        # TODO: Implement
        return []

    def load_deck(self, name: str) -> Deck:
        """Load a deck by name."""
        # TODO: Implement
        raise FileNotFoundError(f"Deck '{name}' not found")

    def save_deck(self, deck: Deck, name: str):
        """Save a deck to file."""
        # TODO: Implement
        raise NotImplementedError("save_deck not yet implemented")

    def validate_deck(self, deck: Deck) -> List[str]:
        """Validate deck and return list of errors."""
        # TODO: Implement
        return []
