"""Tests for GameEngine."""
import pytest
from hearthstone.engine.game_engine import GameEngine
from hearthstone.engine.action import EndTurnAction, PlayCardAction, AttackAction
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.game_state import GameState


def create_test_engine():
    """Create a test game engine with basic setup."""
    player1 = Player(
        hero=Hero(hero_class=HeroClass.MAGE),
        name="Player 1"
    )
    player2 = Player(
        hero=Hero(hero_class=HeroClass.WARRIOR),
        name="Player 2"
    )
    state = GameState(player1=player1, player2=player2)
    engine = GameEngine(state)
    engine.initialize_game()
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


def test_engine_attack_action():
    """Test attacking with a minion."""
    engine = create_test_engine()

    # Add minion to current player's board
    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=3,
        health=2
    )
    attacker.can_attack = True
    engine.state.current_player.board.append(attacker)

    action = AttackAction(
        player_id="Player 1",
        attacker_id="TEST_001",
        target_id="enemy_hero"
    )
    result = engine.take_action(action)

    assert result.success
    assert engine.state.opposing_player.hero.health == 27  # 30 - 3
