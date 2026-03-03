"""Tests for GameState model."""
import pytest
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.enums import HeroClass, GamePhase


def test_game_state_creation():
    """Test game state creation."""
    player1 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 1")
    player2 = Player(hero=Hero(hero_class=HeroClass.WARRIOR), name="Player 2")

    state = GameState(player1=player1, player2=player2)

    assert state.current_player == player1
    assert state.opposing_player == player2
    assert state.turn == 1
    assert state.phase == GamePhase.MAIN


def test_game_state_switch_turn():
    """Test switching turns."""
    player1 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 1")
    player2 = Player(hero=Hero(hero_class=HeroClass.WARRIOR), name="Player 2")

    state = GameState(player1=player1, player2=player2)

    state.switch_turn()
    assert state.current_player == player2
    assert state.opposing_player == player1
    assert state.turn == 1

    state.switch_turn()
    assert state.current_player == player1
    assert state.turn == 2


def test_game_state_is_game_over():
    """Test game over check."""
    player1 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 1")
    player2 = Player(hero=Hero(hero_class=HeroClass.WARRIOR), name="Player 2")

    state = GameState(player1=player1, player2=player2)

    assert not state.is_game_over()

    player1.hero.take_damage(30)
    assert state.is_game_over()
    assert state.get_winner() == player2
