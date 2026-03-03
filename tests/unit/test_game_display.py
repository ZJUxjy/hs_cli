"""Tests for GameDisplay."""
import pytest
from cli.display.game_display import GameDisplay
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass


def test_render_game_state(capsys):
    """Test rendering complete game state."""
    player1 = Player(
        hero=Hero(hero_class=HeroClass.MAGE, health=30),
        name="Player 1",
        mana=5,
        max_mana=5
    )
    player2 = Player(
        hero=Hero(hero_class=HeroClass.WARRIOR, health=28),
        name="Player 2",
        mana=4,
        max_mana=4
    )

    # Add a minion to player1's board
    minion = Minion(id="TEST_001", name="Test", cost=2, attack=2, health=3)
    player1.board.append(minion)

    game_state = GameState(player1=player1, player2=player2)

    display = GameDisplay()
    display.render_game_state(game_state)

    # Check output contains key information
    captured = capsys.readouterr()
    assert "Player 1" in captured.out or "玩家" in captured.out
    assert "30" in captured.out  # health
    assert "5" in captured.out  # mana
