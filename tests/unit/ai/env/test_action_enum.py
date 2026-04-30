"""Tests for action enum + enumerator + dispatch."""
import pytest


def test_end_turn_is_singleton_value():
    from hearthstone.ai.env.action_enum import EndTurnAction
    a, b = EndTurnAction(), EndTurnAction()
    assert a == b
    assert hash(a) == hash(b)


def test_play_card_action_fields():
    from hearthstone.ai.env.action_enum import PlayCardAction
    a = PlayCardAction(card_idx_in_hand=2, target_entity_id=42,
                       board_index=None, choose=None)
    assert a.card_idx_in_hand == 2
    assert a.target_entity_id == 42
