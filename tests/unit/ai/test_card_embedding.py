import numpy as np
import pytest


def test_card_embedding_exists():
    """Test that CardEmbedding can be imported."""
    from hearthstone.ai.card_embedding import CardEmbedding
    embedding = CardEmbedding()
    assert embedding is not None


def test_encode_minion():
    """Test encoding a minion card."""
    from hearthstone.ai.card_embedding import CardEmbedding
    from hearthstone.models.card import Minion
    from hearthstone.models.enums import CardType, Ability

    embedding = CardEmbedding(embedding_dim=32)
    minion = Minion(
        id='TEST_001',
        name='Test',
        cost=3,
        card_type=CardType.MINION,
        attack=2,
        health=4,
        abilities={Ability.TAUNT},
    )

    vector = embedding.encode(minion)

    assert isinstance(vector, np.ndarray)
    assert vector.shape == (32,)
    assert vector.dtype == np.float32
    # Cost should be normalized (3/10 = 0.3)
    assert abs(vector[0] - 0.3) < 0.01


def test_encode_spell():
    """Test encoding a spell card."""
    from hearthstone.ai.card_embedding import CardEmbedding
    from hearthstone.models.card import Spell
    from hearthstone.models.enums import CardType

    embedding = CardEmbedding(embedding_dim=32)
    spell = Spell(
        id='TEST_002',
        name='Fireball',
        cost=4,
        card_type=CardType.SPELL,
        effect='DAMAGE',
        effect_value=6,
    )

    vector = embedding.encode(spell)

    assert isinstance(vector, np.ndarray)
    assert vector.shape == (32,)
    # Cost should be normalized (4/10 = 0.4)
    assert abs(vector[0] - 0.4) < 0.01


def test_encode_hand():
    """Test encoding a hand of cards."""
    from hearthstone.ai.card_embedding import CardEmbedding
    from hearthstone.models.card import Minion
    from hearthstone.models.enums import CardType

    embedding = CardEmbedding(embedding_dim=16)
    cards = [
        Minion(id='1', name='A', cost=1, card_type=CardType.MINION, attack=1, health=1),
        Minion(id='2', name='B', cost=2, card_type=CardType.MINION, attack=2, health=2),
    ]

    result = embedding.encode_hand(cards, max_size=5)

    assert result.shape == (5, 16)
    # First two cards should be encoded
    assert result[0, 0] == pytest.approx(0.1)
    assert result[1, 0] == pytest.approx(0.2)
    # Rest should be zeros
    assert np.all(result[2:] == 0)


def test_encode_board():
    """Test encoding a board of minions."""
    from hearthstone.ai.card_embedding import CardEmbedding
    from hearthstone.models.card import Minion
    from hearthstone.models.enums import CardType

    embedding = CardEmbedding(embedding_dim=16)
    minions = [
        Minion(id='1', name='A', cost=3, card_type=CardType.MINION, attack=2, health=4),
    ]

    result = embedding.encode_board(minions, max_size=7)

    assert result.shape == (7, 16)
    assert result[0, 0] == pytest.approx(0.3)
    assert np.all(result[1:] == 0)


def test_encode_weapon():
    """Test encoding a weapon card."""
    from hearthstone.ai.card_embedding import CardEmbedding
    from hearthstone.models.card import Weapon
    from hearthstone.models.enums import CardType

    embedding = CardEmbedding(embedding_dim=32)
    weapon = Weapon(
        id='WEAP_001',
        name='Test Weapon',
        cost=2,
        card_type=CardType.WEAPON,
        attack=3,
        durability=2,
    )

    vector = embedding.encode(weapon)

    assert isinstance(vector, np.ndarray)
    assert vector.shape == (32,)
    assert vector.dtype == np.float32
    # Cost should be normalized (2/10 = 0.2)
    assert abs(vector[0] - 0.2) < 0.01
    # Attack should be normalized (3/10 = 0.3)
    assert abs(vector[1] - 0.3) < 0.01
    # Durability should be normalized (2/10 = 0.2) at index 4
    assert abs(vector[4] - 0.2) < 0.01
