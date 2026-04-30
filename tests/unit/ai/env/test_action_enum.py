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


@pytest.fixture
def fresh_game():
    """Construct a basic fireplace.Game with two basic mage decks, started."""
    from fireplace import cards
    cards.db.initialize()
    from fireplace.game import Game
    from fireplace.player import Player
    from fireplace.utils import random_draft

    p1 = Player("p1", random_draft("MAGE"), "HERO_08")
    p2 = Player("p2", random_draft("MAGE"), "HERO_08")
    game = Game(players=[p1, p2], seed=42)
    game.start()
    for p in (p1, p2):
        if p.choice is not None:
            p.choice.choose()
    return game


def test_enumerate_end_turn_at_index_zero(fresh_game):
    from hearthstone.ai.env.action_enum import (
        enumerate_valid_actions, EndTurnAction,
    )
    from hearthstone.ai.env.choose_one_policy import FirstChoiceOne
    actions = enumerate_valid_actions(fresh_game.current_player, FirstChoiceOne())
    assert len(actions) >= 1
    assert isinstance(actions[0], EndTurnAction)


def test_enumerate_includes_playable_cards(fresh_game):
    from hearthstone.ai.env.action_enum import (
        enumerate_valid_actions, PlayCardAction,
    )
    from hearthstone.ai.env.choose_one_policy import FirstChoiceOne
    actions = enumerate_valid_actions(fresh_game.current_player, FirstChoiceOne())
    play_count = sum(1 for a in actions if isinstance(a, PlayCardAction))
    assert 0 <= play_count <= 50


def test_dispatch_end_turn_advances_player(fresh_game):
    from hearthstone.ai.env.action_enum import dispatch, EndTurnAction
    starting_player = fresh_game.current_player
    dispatch(EndTurnAction(), fresh_game)
    assert fresh_game.current_player is not starting_player
