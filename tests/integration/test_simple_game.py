"""Integration test for a simple game."""
import pytest
from hearthstone.engine.game_engine import GameEngine
from hearthstone.engine.action import EndTurnAction
from hearthstone.models.enums import HeroClass


def test_simple_game_flow():
    """Test a simple game with just end turn actions."""
    engine = GameEngine()
    engine.initialize_game()

    # Play 10 turns (5 rounds)
    for i in range(10):
        action = EndTurnAction(
            player_id=engine.state.current_player.name
        )
        result = engine.take_action(action)
        assert result.success

    # Check game state
    assert engine.state.turn == 6  # Turn 6 after 10 end turns
    assert engine.state.current_player.max_mana >= 5


def test_mana_gain_over_turns():
    """Test mana crystal gain over turns."""
    engine = GameEngine()
    engine.initialize_game()

    player1 = engine.state.player1
    player2 = engine.state.player2

    assert player1.max_mana == 1
    assert player2.max_mana == 1

    # End turn 1
    engine.take_action(EndTurnAction(player_id=player1.name))
    assert player2.max_mana == 2

    # End turn 2
    engine.take_action(EndTurnAction(player_id=player2.name))
    assert player1.max_mana == 2

    # End turn 3
    engine.take_action(EndTurnAction(player_id=player1.name))
    assert player2.max_mana == 3
