"""Tests for Player model."""
import pytest
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass


def test_player_creation():
    """Test player creation."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1")
    assert player.name == "Player 1"
    assert player.hero == hero
    assert len(player.hand) == 0
    assert len(player.deck) == 0


def test_player_mana():
    """Test player mana management."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1", max_mana=5)

    assert player.mana == 5
    assert player.max_mana == 5

    player.spend_mana(3)
    assert player.mana == 2

    player.refresh_mana()
    assert player.mana == 5


def test_player_draw_card():
    """Test player drawing a card."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1")

    card = Minion(id="TEST_001", name="Test", cost=1, attack=1, health=1)
    player.deck.append(card)

    drawn = player.draw_card()
    assert drawn == card
    assert len(player.deck) == 0
    assert len(player.hand) == 1


def test_player_gain_mana_crystal():
    """Test gaining mana crystals."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1")

    assert player.max_mana == 0

    # Gain first crystal
    player.gain_mana_crystal()
    assert player.max_mana == 1

    # Gain up to 10
    for _ in range(9):
        player.gain_mana_crystal()
    assert player.max_mana == 10

    # Can't exceed 10
    player.gain_mana_crystal()
    assert player.max_mana == 10


def test_player_draw_card_empty_deck():
    """Test drawing from empty deck returns None."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1")

    # Empty deck should return None
    drawn = player.draw_card()
    assert drawn is None
    assert len(player.hand) == 0


def test_player_draw_card_hand_full():
    """Test drawing when hand is full burns the card."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1")

    # Fill hand to 10 cards
    for i in range(10):
        card = Minion(id=f"TEST_{i:03d}", name=f"Test {i}", cost=1, attack=1, health=1)
        player.hand.append(card)

    # Add one card to deck
    burn_card = Minion(id="BURN_001", name="Burn", cost=1, attack=1, health=1)
    player.deck.append(burn_card)

    # Draw should not add to hand, should go to graveyard
    drawn = player.draw_card()
    assert drawn == burn_card
    assert len(player.hand) == 10
    assert len(player.graveyard) == 1
    assert burn_card in player.graveyard


def test_player_play_card():
    """Test playing a card from hand."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1")

    card = Minion(id="TEST_001", name="Test", cost=1, attack=1, health=1)
    player.hand.append(card)

    played = player.play_card(0)
    assert played == card
    assert len(player.hand) == 0


def test_player_play_card_invalid_index():
    """Test playing a card with invalid index raises exception."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1")

    card = Minion(id="TEST_001", name="Test", cost=1, attack=1, health=1)
    player.hand.append(card)

    # Negative index
    with pytest.raises(IndexError):
        player.play_card(-1)

    # Index out of range
    with pytest.raises(IndexError):
        player.play_card(1)

    # Empty hand
    player.hand.clear()
    with pytest.raises(IndexError):
        player.play_card(0)
