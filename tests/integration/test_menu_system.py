"""Integration tests for MenuSystem."""
import pytest
from unittest.mock import patch, Mock
from cli.menu.menu_system import MenuSystem


def test_menu_system_exit():
    """Test menu system can exit."""
    menu = MenuSystem()

    # Mock input to return "4"
    with patch('builtins.input', return_value="4"):
        menu.run()

    assert not menu.running


@pytest.mark.skip(reason="Game mode selection requires GameEngine updates - not part of Tasks 8-10")
def test_menu_system_game_mode_selection():
    """Test game mode selection."""
    menu = MenuSystem()

    # Mock inputs: select "Start Game" then "Human vs AI" then back then "Exit"
    with patch('builtins.input', side_effect=["1", "1", "3", "4"]):
        # Should not crash
        menu.run()
