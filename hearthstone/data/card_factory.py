"""Card factory for creating cards from JSON data."""
import re
from typing import Any, Dict, Optional, Set, Tuple

from hearthstone.data.card_importer import CardImporter
from hearthstone.models.card import Card, Minion, Spell, Weapon
from hearthstone.models.enums import Ability, CardType, HeroClass


class CardFactory:
    """Factory class for creating Card instances from JSON data."""

    def __init__(self, importer: Optional[CardImporter] = None):
        """Initialize the CardFactory.

        Args:
            importer: Optional CardImporter instance for mapping functions.
        """
        self.importer = importer or CardImporter()

    def create_card(self, json_data: Dict[str, Any]) -> Card:
        """Create a Card instance from JSON data.

        Args:
            json_data: Dictionary containing card data from HearthstoneJSON.

        Returns:
            A Card instance (Minion, Spell, or Weapon).

        Raises:
            ValueError: If the card type is not supported.
        """
        card_type_str = json_data.get('type', 'MINION')
        card_type = self.importer.map_card_type(card_type_str)

        if card_type == CardType.MINION:
            return self._create_minion(json_data)
        elif card_type == CardType.SPELL:
            return self._create_spell(json_data)
        elif card_type == CardType.WEAPON:
            return self._create_weapon(json_data)
        else:
            raise ValueError(f"Unsupported card type: {card_type_str}")

    def _create_minion(self, data: Dict[str, Any]) -> Minion:
        """Create a Minion from JSON data.

        Args:
            data: Dictionary containing minion data.

        Returns:
            A Minion instance.
        """
        return Minion(
            id=data['id'],
            name=data['name'],
            cost=data.get('cost', 0),
            card_type=CardType.MINION,
            description=self._clean_text(data.get('text', '')),
            hero_class=self.importer.map_hero_class(data.get('cardClass', 'NEUTRAL')),
            attack=data.get('attack', 0),
            health=data.get('health', 0),
            abilities=self._extract_abilities(data),
        )

    def _create_spell(self, data: Dict[str, Any]) -> Spell:
        """Create a Spell from JSON data.

        Args:
            data: Dictionary containing spell data.

        Returns:
            A Spell instance.
        """
        effect_type, effect_value = self._parse_spell_effect(data)

        return Spell(
            id=data['id'],
            name=data['name'],
            cost=data.get('cost', 0),
            card_type=CardType.SPELL,
            description=self._clean_text(data.get('text', '')),
            hero_class=self.importer.map_hero_class(data.get('cardClass', 'NEUTRAL')),
            effect=effect_type,
            effect_value=effect_value,
        )

    def _create_weapon(self, data: Dict[str, Any]) -> Weapon:
        """Create a Weapon from JSON data.

        Args:
            data: Dictionary containing weapon data.

        Returns:
            A Weapon instance.
        """
        return Weapon(
            id=data['id'],
            name=data['name'],
            cost=data.get('cost', 0),
            card_type=CardType.WEAPON,
            description=self._clean_text(data.get('text', '')),
            hero_class=self.importer.map_hero_class(data.get('cardClass', 'NEUTRAL')),
            attack=data.get('attack', 0),
            durability=data.get('durability', 0),
        )

    def _extract_abilities(self, data: Dict[str, Any]) -> Set[Ability]:
        """Extract abilities from mechanics data.

        Args:
            data: Dictionary containing card data.

        Returns:
            Set of Ability enums.
        """
        abilities: Set[Ability] = set()
        mechanics = data.get('mechanics', [])

        for mechanic in mechanics:
            ability = self.importer.map_mechanic(mechanic)
            if ability is not None:
                abilities.add(ability)

        return abilities

    def _clean_text(self, text: str) -> str:
        """Clean HTML tags and special characters from card text.

        Args:
            text: Raw card text from JSON.

        Returns:
            Cleaned text string.
        """
        if not text:
            return ''

        # Remove HTML tags like <b>, </b>, <i>, etc.
        text = re.sub(r'<[^>]+>', '', text)

        # Replace $ with nothing (used for variable numbers)
        text = text.replace('$', '')

        # Remove [x] markers
        text = text.replace('[x]', '')

        return text.strip()

    def _parse_spell_effect(self, data: Dict[str, Any]) -> Tuple[Optional[str], int]:
        """Parse effect type and value from spell text.

        Args:
            data: Dictionary containing spell data.

        Returns:
            Tuple of (effect_type, effect_value).
        """
        text = self._clean_text(data.get('text', ''))

        # Look for common patterns
        # Pattern: "Deal X damage"
        damage_match = re.search(r'deal\s+(\d+)\s+damage', text, re.IGNORECASE)
        if damage_match:
            return ('DAMAGE', int(damage_match.group(1)))

        # Pattern: "Restore X Health"
        heal_match = re.search(r'restore\s+(\d+)\s+health', text, re.IGNORECASE)
        if heal_match:
            return ('HEAL', int(heal_match.group(1)))

        # Pattern: "Draw X cards"
        draw_match = re.search(r'draw\s+(\d+)\s+cards?', text, re.IGNORECASE)
        if draw_match:
            return ('DRAW', int(draw_match.group(1)))

        # Pattern: "Gain X Armor"
        armor_match = re.search(r'gain\s+(\d+)\s+armor', text, re.IGNORECASE)
        if armor_match:
            return ('ARMOR', int(armor_match.group(1)))

        # Default: no effect parsed
        return (None, 0)
