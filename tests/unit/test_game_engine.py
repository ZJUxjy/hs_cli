"""Tests for GameEngine."""
import pytest
from hearthstone.engine.game_engine import GameEngine
from hearthstone.engine.action import EndTurnAction, PlayCardAction
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass


def create_test_engine():
    """Create a test game engine with basic setup."""
    engine = GameEngine()
    engine.initialize_game(
        player1_name="Player 1",
        player1_class=HeroClass.MAGE,
        player2_name="Player 2",
        player2_class=HeroClass.WARRIOR
    )
    return engine


def test_engine_initialization():
    """Test game engine initialization."""
    engine = create_test_engine()

    assert engine.state is not None
    assert engine.state.current_player.name == "Player 1"
    assert engine.state.opposing_player.name == "Player 2"
    assert engine.state.turn == 1


def test_engine_end_turn():
    """Test ending a turn."""
    engine = create_test_engine()
    player1 = engine.state.current_player
    player2 = engine.state.opposing_player

    action = EndTurnAction(player_id="Player 1")
    result = engine.take_action(action)

    assert result.success
    assert result.turn_ended
    assert engine.state.current_player == player2
    assert engine.state.opposing_player == player1


def test_engine_play_card():
    """Test playing a card."""
    engine = create_test_engine()

    # Add a card to hand
    card = Minion(id="TEST_001", name="Test Minion", cost=1, attack=1, health=1)
    engine.state.current_player.hand.append(card)
    engine.state.current_player.mana = 1

    action = PlayCardAction(
        player_id="Player 1",
        card_index=0,
        target_id=None
    )
    result = engine.take_action(action)

    assert result.success
    assert len(engine.state.current_player.hand) == 0
    assert len(engine.state.current_player.board) == 1


def test_engine_not_enough_mana():
    """Test playing a card without enough mana."""
    engine = create_test_engine()

    # Add a card to hand
    card = Minion(id="TEST_001", name="Test Minion", cost=5, attack=5, health=5)
    engine.state.current_player.hand.append(card)
    engine.state.current_player.mana = 1

    action = PlayCardAction(
        player_id="Player 1",
        card_index=0,
        target_id=None
    )
    result = engine.take_action(action)

    assert not result.success
    assert "mana" in result.message.lower()
