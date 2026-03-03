"""Tests for MenuDisplay."""
import pytest
from cli.display.menu_display import MenuDisplay


def test_render_main_menu(capsys):
    """Test rendering main menu."""
    display = MenuDisplay()
    display.render_main_menu()

    # Check output contains key information
    captured = capsys.readouterr()
    assert "开始游戏" in captured.out or "Start" in captured.out
    assert "构建卡组" in captured.out or "Deck" in captured.out
    assert "退出" in captured.out or "Quit" in captured.out


def test_render_game_mode_menu(capsys):
    """Test rendering game mode menu."""
    display = MenuDisplay()
    display.render_game_mode_menu()

    # Check output contains key information
    captured = capsys.readouterr()
    assert "人 vs AI" in captured.out or "Human" in captured.out
    assert "AI vs AI" in captured.out or "AI" in captured.out


def test_render_deck_builder_menu(capsys):
    """Test rendering deck builder menu."""
    display = MenuDisplay()
    display.render_deck_builder_menu()

    # Check output contains key information
    captured = capsys.readouterr()
    assert "创建新卡组" in captured.out or "Create" in captured.out
    assert "编辑卡组" in captured.out or "Edit" in captured.out
    assert "删除卡组" in captured.out or "Delete" in captured.out
    assert "返回" in captured.out or "Return" in captured.out


