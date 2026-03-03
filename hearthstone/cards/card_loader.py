"""Card loader for loading cards from JSON files."""
import json
from pathlib import Path
from typing import Dict, Optional
from hearthstone.models.card import Card, Minion, Spell, Weapon
from hearthstone.models.enums import CardType, Ability, HeroClass


class CardLoader:
    """Load and manage card definitions."""

    def __init__(self):
        """Initialize card loader."""
        self.cards: Dict[str, Card] = {}

    def load_cards(self, filepath: str) -> Dict[str, Card]:
        """Load cards from a JSON file."""
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"Card file not found: {filepath}")

        with open(path, 'r') as f:
            card_data = json.load(f)

        for card_json in card_data:
            card = self._parse_card(card_json)
            self.cards[card.id] = card

        return self.cards

    def _parse_card(self, data: dict) -> Card:
        """Parse a card from JSON data."""
        card_type = CardType(data["type"])

        # Parse hero_class if present
        hero_class = None
        if "hero_class" in data and data["hero_class"]:
            hero_class = HeroClass(data["hero_class"])

        if card_type == CardType.MINION:
            abilities = set()
            if "abilities" in data:
                for ability_str in data["abilities"]:
                    abilities.add(Ability(ability_str))

            return Minion(
                id=data["id"],
                name=data["name"],
                cost=data["cost"],
                card_type=card_type,
                description=data.get("description", ""),
                hero_class=hero_class,
                attack=data["attack"],
                health=data["health"],
                abilities=abilities
            )
        elif card_type == CardType.SPELL:
            return Spell(
                id=data["id"],
                name=data["name"],
                cost=data["cost"],
                card_type=card_type,
                description=data.get("description", ""),
                hero_class=hero_class
            )
        elif card_type == CardType.WEAPON:
            return Weapon(
                id=data["id"],
                name=data["name"],
                cost=data["cost"],
                card_type=card_type,
                description=data.get("description", ""),
                hero_class=hero_class,
                attack=data.get("attack", 0),
                durability=data.get("durability", 0)
            )
        else:
            return Card(
                id=data["id"],
                name=data["name"],
                cost=data["cost"],
                card_type=card_type,
                description=data.get("description", ""),
                hero_class=hero_class
            )

    def get_card(self, card_id: str) -> Optional[Card]:
        """Get a card by ID."""
        return self.cards.get(card_id)
