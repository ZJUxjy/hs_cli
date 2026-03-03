import pytest


def test_card_importer_exists():
    """Test that CardImporter class can be imported."""
    from hearthstone.data.card_importer import CardImporter
    importer = CardImporter()
    assert importer is not None


def test_mechanic_map_exists():
    """Test that MECHANIC_MAP is defined."""
    from hearthstone.data.card_importer import CardImporter
    assert hasattr(CardImporter, 'MECHANIC_MAP')
    assert 'BATTLECRY' in CardImporter.MECHANIC_MAP


def test_card_type_map_exists():
    """Test that CARD_TYPE_MAP is defined."""
    from hearthstone.data.card_importer import CardImporter
    assert hasattr(CardImporter, 'CARD_TYPE_MAP')
    assert 'MINION' in CardImporter.CARD_TYPE_MAP


def test_hero_class_map_exists():
    """Test that HERO_CLASS_MAP is defined."""
    from hearthstone.data.card_importer import CardImporter
    assert hasattr(CardImporter, 'HERO_CLASS_MAP')
    assert 'MAGE' in CardImporter.HERO_CLASS_MAP


def test_map_mechanic():
    """Test mechanic mapping."""
    from hearthstone.data.card_importer import CardImporter
    from hearthstone.models.enums import Ability

    importer = CardImporter()
    assert importer.map_mechanic('BATTLECRY') == Ability.BATTLECRY
    assert importer.map_mechanic('CHARGE') == Ability.CHARGE
    assert importer.map_mechanic('INVALID') is None


def test_filter_collectible():
    """Test collectible filter."""
    from hearthstone.data.card_importer import CardImporter

    importer = CardImporter()
    cards = [
        {'id': '1', 'collectible': True},
        {'id': '2', 'collectible': False},
        {'id': '3'},  # No collectible field
    ]

    result = importer.filter_collectible(cards)
    assert len(result) == 1
    assert result[0]['id'] == '1'
