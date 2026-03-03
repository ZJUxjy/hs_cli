"""Tests for CommandParser."""
import pytest
from cli.input.command_parser import CommandParser
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass
from hearthstone.engine.action import PlayCardAction, AttackAction, EndTurnAction


def create_test_game():
    """Create a test game state."""
    player1 = Player(
        hero=Hero(hero_class=HeroClass.MAGE),
        name="Player 1"
    )
    player2 = Player(
        hero=Hero(hero_class=HeroClass.WARRIOR),
        name="Player 2"
    )
    # Add a card to hand
    card = Minion(id="TEST_001", name="Test", cost=2, attack=2, health=2)
    player1.hand.append(card)

    # Add a minion to board
    minion = Minion(id="TEST_002", name="Board Minion", cost=3, attack=3, health=3)
    minion.can_attack = True
    player1.board.append(minion)

    return GameState(player1=player1, player2=player2)


def test_parse_play_command():
    """Test parsing play command."""
    game = create_test_game()
    action = CommandParser.parse("play 1", game)

    assert isinstance(action, PlayCardAction)
    assert action.card_index == 1


def test_parse_attack_command():
    """Test parsing attack command."""
    game = create_test_game()
    action = CommandParser.parse("attack TEST_002 enemy_hero", game)

    assert isinstance(action, AttackAction)
    assert action.attacker_id == "test_002"
    assert action.target_id == "enemy_hero"


def test_parse_end_command():
    """Test parsing end turn command."""
    game = create_test_game()
    action = CommandParser.parse("end", game)

    assert isinstance(action, EndTurnAction)


def test_parse_invalid_command():
    """Test parsing invalid command."""
    game = create_test_game()

    with pytest.raises(ValueError, match="Unknown command"):
        CommandParser.parse("invalid", game)
