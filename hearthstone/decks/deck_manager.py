"""Deck loading and management."""
import json
from pathlib import Path
from typing import List
from hearthstone.models.deck import Deck
from hearthstone.cards.card_loader import CardLoader
from hearthstone.models.enums import HeroClass


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
        deck_file = self.decks_dir / f"{name}.json"

        if not deck_file.exists():
            raise FileNotFoundError(f"Deck '{name}' not found at {deck_file}")

        with open(deck_file) as f:
            deck_data = json.load(f)

        # Load card objects from IDs
        card_loader = CardLoader()
        cards = []
        for card_id in deck_data["cards"]:
            card = card_loader.load_card(card_id)
            if card:
                cards.append(card)

        return Deck(
            name=deck_data["name"],
            hero_class=HeroClass[deck_data["hero_class"]],
            cards=cards
        )

    def save_deck(self, deck: Deck, name: str):
        """Save a deck to file."""
        # TODO: Implement
        raise NotImplementedError("save_deck not yet implemented")

    def validate_deck(self, deck: Deck) -> List[str]:
        """Validate deck and return list of errors."""
        # TODO: Implement
        return []
