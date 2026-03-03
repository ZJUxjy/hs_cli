"""Integration tests for deck management with card importer."""
import pytest


def test_deck_manager_can_use_card_importer():
    """Test that DeckManager can use CardImporter."""
    from hearthstone.decks.deck_manager import DeckManager
    from hearthstone.data.card_importer import CardImporter

    manager = DeckManager()
    importer = CardImporter()

    # Verify both can be instantiated
    assert manager is not None
    assert importer is not None


def test_card_factory_creates_minion():
    """Test CardFactory integration."""
    from hearthstone.data.card_factory import CardFactory
    from hearthstone.models.enums import CardType, Ability

    factory = CardFactory()

    json_data = {
        'id': 'EX1_001',
        'name': 'Test Minion',
        'type': 'MINION',
        'cost': 1,
        'attack': 1,
        'health': 1,
        'cardClass': 'NEUTRAL',
        'mechanics': ['CHARGE'],
    }

    card = factory.create_card(json_data)

    assert card.card_type == CardType.MINION
    assert Ability.CHARGE in card.abilities
