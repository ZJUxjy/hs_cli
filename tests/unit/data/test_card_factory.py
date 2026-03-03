import pytest


def test_card_factory_exists():
    """Test that CardFactory can be imported."""
    from hearthstone.data.card_factory import CardFactory
    factory = CardFactory()
    assert factory is not None


def test_create_minion_from_json():
    """Test creating a minion from JSON data."""
    from hearthstone.data.card_factory import CardFactory
    from hearthstone.models.enums import CardType, Ability

    factory = CardFactory()

    json_data = {
        'id': 'TEST_001',
        'name': 'Test Minion',
        'type': 'MINION',
        'cost': 3,
        'attack': 2,
        'health': 4,
        'text': 'A test minion',
        'cardClass': 'NEUTRAL',
        'mechanics': ['TAUNT'],
    }

    card = factory.create_card(json_data)

    assert card.id == 'TEST_001'
    assert card.name == 'Test Minion'
    assert card.cost == 3
    assert card.card_type == CardType.MINION
    assert card.attack == 2
    assert card.health == 4
    assert Ability.TAUNT in card.abilities


def test_create_spell_from_json():
    """Test creating a spell from JSON data."""
    from hearthstone.data.card_factory import CardFactory
    from hearthstone.models.enums import CardType

    factory = CardFactory()

    json_data = {
        'id': 'TEST_002',
        'name': 'Test Spell',
        'type': 'SPELL',
        'cost': 2,
        'text': 'Deal 3 damage',
        'cardClass': 'MAGE',
    }

    card = factory.create_card(json_data)

    assert card.id == 'TEST_002'
    assert card.name == 'Test Spell'
    assert card.cost == 2
    assert card.card_type == CardType.SPELL
    assert card.effect == 'DAMAGE'
    assert card.effect_value == 3


def test_create_weapon_from_json():
    """Test creating a weapon from JSON data."""
    from hearthstone.data.card_factory import CardFactory
    from hearthstone.models.enums import CardType

    factory = CardFactory()

    json_data = {
        'id': 'TEST_003',
        'name': 'Test Weapon',
        'type': 'WEAPON',
        'cost': 2,
        'attack': 3,
        'durability': 2,
        'text': 'A test weapon',
        'cardClass': 'WARRIOR',
    }

    card = factory.create_card(json_data)

    assert card.id == 'TEST_003'
    assert card.name == 'Test Weapon'
    assert card.cost == 2
    assert card.card_type == CardType.WEAPON
    assert card.attack == 3
    assert card.durability == 2


def test_clean_text():
    """Test HTML tag cleaning from card text."""
    from hearthstone.data.card_factory import CardFactory

    factory = CardFactory()

    assert factory._clean_text('<b>Bold</b>') == 'Bold'
    assert factory._clean_text('$1 damage') == '1 damage'
    assert factory._clean_text('[x]Text') == 'Text'
