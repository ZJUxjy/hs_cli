"""Card importer for importing cards from HearthstoneJSON API."""
from typing import Any, Dict, List, Optional

import requests

from hearthstone.models.enums import Ability, CardType, HeroClass


class CardImporter:
    """Import card data from HearthstoneJSON API."""

    BASE_URL = "https://api.hearthstonejson.com/v1/latest/enUS/cards.json"

    # Mapping from HearthstoneJSON mechanics to Ability enum
    MECHANIC_MAP: Dict[str, Ability] = {
        'BATTLECRY': Ability.BATTLECRY,
        'CHARGE': Ability.CHARGE,
        'TAUNT': Ability.TAUNT,
        'DIVINE_SHIELD': Ability.DIVINE_SHIELD,
        'WINDFURY': Ability.WINDFURY,
        'STEALTH': Ability.STEALTH,
        'POISONOUS': Ability.POISONOUS,
        'LIFESTEAL': Ability.LIFESTEAL,
        'RUSH': Ability.RUSH,
        'REBORN': Ability.REBORN,
        'SPELL_DAMAGE': Ability.SPELL_DAMAGE,
        'DEATHRATTLE': Ability.DEATHRATTLE,
        'DISCOVER': Ability.DISCOVER,
        'COMBO': Ability.COMBO,
        'OVERLOAD': Ability.OVERLOAD,
        'SECRET': Ability.SECRET,
        'FREEZE': Ability.FREEZE,
        'SILENCE': Ability.SILENCE,
    }

    # Mapping from HearthstoneJSON card types to CardType enum
    CARD_TYPE_MAP: Dict[str, CardType] = {
        'MINION': CardType.MINION,
        'SPELL': CardType.SPELL,
        'WEAPON': CardType.WEAPON,
        'HERO': CardType.HERO,
    }

    # Mapping from HearthstoneJSON classes to HeroClass enum
    HERO_CLASS_MAP: Dict[str, HeroClass] = {
        'WARRIOR': HeroClass.WARRIOR,
        'SHAMAN': HeroClass.SHAMAN,
        'ROGUE': HeroClass.ROGUE,
        'PALADIN': HeroClass.PALADIN,
        'HUNTER': HeroClass.HUNTER,
        'DRUID': HeroClass.DRUID,
        'WARLOCK': HeroClass.WARLOCK,
        'MAGE': HeroClass.MAGE,
        'PRIEST': HeroClass.PRIEST,
        'DEMON_HUNTER': HeroClass.DEMON_HUNTER,
        'NEUTRAL': HeroClass.NEUTRAL,
    }

    def __init__(self, api_url: Optional[str] = None):
        """Initialize the CardImporter.

        Args:
            api_url: Optional custom API URL for testing.
        """
        self.api_url = api_url or self.BASE_URL

    def fetch_cards(self) -> List[Dict[str, Any]]:
        """Fetch cards from the HearthstoneJSON API.

        Returns:
            List of card dictionaries.

        Raises:
            requests.RequestException: If the API request fails.
        """
        response = requests.get(self.api_url, timeout=30)
        response.raise_for_status()
        return response.json()

    def filter_collectible(self, cards: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter cards to only include collectible ones.

        Args:
            cards: List of card dictionaries.

        Returns:
            List of collectible card dictionaries.
        """
        return [card for card in cards if card.get('collectible', False) is True]

    def filter_by_set(self, cards: List[Dict[str, Any]], card_set: str) -> List[Dict[str, Any]]:
        """Filter cards by card set.

        Args:
            cards: List of card dictionaries.
            card_set: The card set to filter by.

        Returns:
            List of cards in the specified set.
        """
        return [card for card in cards if card.get('set') == card_set]

    def map_mechanic(self, mechanic: str) -> Optional[Ability]:
        """Map a HearthstoneJSON mechanic string to an Ability enum.

        Args:
            mechanic: The mechanic string from HearthstoneJSON.

        Returns:
            The corresponding Ability enum, or None if not found.
        """
        return self.MECHANIC_MAP.get(mechanic)

    def map_card_type(self, card_type: str) -> Optional[CardType]:
        """Map a HearthstoneJSON card type string to a CardType enum.

        Args:
            card_type: The card type string from HearthstoneJSON.

        Returns:
            The corresponding CardType enum, or None if not found.
        """
        return self.CARD_TYPE_MAP.get(card_type)

    def map_hero_class(self, hero_class: str) -> Optional[HeroClass]:
        """Map a HearthstoneJSON class string to a HeroClass enum.

        Args:
            hero_class: The class string from HearthstoneJSON.

        Returns:
            The corresponding HeroClass enum, or None if not found.
        """
        return self.HERO_CLASS_MAP.get(hero_class)
