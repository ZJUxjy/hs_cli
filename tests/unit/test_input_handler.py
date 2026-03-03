"""Tests for InputHandler."""
import pytest
from unittest.mock import Mock, patch
from cli.input.input_handler import InputHandler
from hearthstone.engine.action import EndTurnAction, PlayCardAction
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.enums import HeroClass


from hearthstone.models.card import Minion


def create_test_game():
    """Create a test game state."""
    player1 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 1")
    player2 = Player(hero=Hero(hero_class=HeroClass.WARRIOR), name="Player 2")
    # Add a card to hand
    card = Minion(id="TEST_001", name="Test", cost=2, attack=2, health=2)
    player1.hand.append(card)

    return GameState(player1=player1, player2=player2)


def test_parse_number_input():
    """Test parsing number input."""
    game = create_test_game()
    display = Mock()

    handler = InputHandler(display)

    # Mock input to return "1"
    with patch('builtins.input', return_value="1"):
        action = handler.get_action(game)
        # Should parse to some action based on available options
        assert action is not None


def test_parse_command_mode():
    """Test switching to command mode."""
    game = create_test_game()
    display = Mock()

    handler = InputHandler(display)

    # Mock input to return ":" then "end"
    with patch('builtins.input', side_effect=[":", "end"]):
        action = handler.get_action(game)
        assert isinstance(action, EndTurnAction)
