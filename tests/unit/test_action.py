"""Tests for Action system."""
import pytest
from hearthstone.engine.action import (
    Action,
    EndTurnAction,
    PlayCardAction,
    AttackAction
)


def test_end_turn_action():
    """Test EndTurnAction creation."""
    action = EndTurnAction(player_id="player1")
    assert action.action_type == "END_TURN"
    assert action.player_id == "player1"


def test_play_card_action():
    """Test PlayCardAction creation."""
    action = PlayCardAction(
        player_id="player1",
        card_index=0,
        target_id="enemy_hero"
    )
    assert action.action_type == "PLAY_CARD"
    assert action.card_index == 0
    assert action.target_id == "enemy_hero"


def test_attack_action():
    """Test AttackAction creation."""
    action = AttackAction(
        player_id="player1",
        attacker_id="minion_1",
        target_id="enemy_hero"
    )
    assert action.action_type == "ATTACK"
    assert action.attacker_id == "minion_1"
    assert action.target_id == "enemy_hero"
