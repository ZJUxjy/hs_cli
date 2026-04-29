"""Tests for the build_observation helper."""
import numpy as np
import pytest
from hearthstone.ai.card_embedding import CardEmbedding, build_observation
from hearthstone.decks.deck_manager import DeckManager
from hearthstone.engine.game_controller import GameController


def _make_state():
    """Start a fresh game and return its state."""
    manager = DeckManager()
    deck1 = manager.load_deck("test_deck")
    deck2 = manager.load_deck("test_deck")
    controller = GameController(deck1, deck2)
    controller.start_game()
    return controller.get_state()


def test_returns_twelve_keys():
    state = _make_state()
    obs = build_observation(state, perspective_player=state.player1)
    expected = {
        "player_hand", "player_board", "opponent_board",
        "player_health", "player_mana", "player_max_mana",
        "player_hand_size", "player_board_size",
        "opponent_health", "opponent_board_size",
        "turn_number", "player_deck_size",
    }
    assert set(obs.keys()) == expected


def test_card_tensor_shapes():
    state = _make_state()
    obs = build_observation(state, perspective_player=state.player1, embedding_dim=64)
    assert obs["player_hand"].shape == (10, 64)
    assert obs["player_board"].shape == (7, 64)
    assert obs["opponent_board"].shape == (7, 64)


def test_perspective_p1_vs_p2_swaps_hands_and_boards():
    """Calling with perspective_player=player2 yields P2's hand and board sizes."""
    state = _make_state()
    obs1 = build_observation(state, perspective_player=state.player1)
    obs2 = build_observation(state, perspective_player=state.player2)
    # Hand sizes typically differ at game start (P1 draws 3, P2 draws 4 with coin)
    assert obs1["player_hand_size"][0] == len(state.player1.hand)
    assert obs2["player_hand_size"][0] == len(state.player2.hand)
    assert obs1["opponent_health"][0] == state.player2.hero.health
    assert obs2["opponent_health"][0] == state.player1.hero.health


def test_uses_provided_embedding_instance():
    """When `embedding=...` is passed, the helper does not create a fresh one."""
    state = _make_state()
    custom = CardEmbedding(embedding_dim=64)
    obs = build_observation(state, perspective_player=state.player1, embedding=custom)
    # If the embedding were ignored, the test would still pass — verify by
    # checking the encoding matches what `custom` produces directly.
    expected_hand = custom.encode_hand(state.player1.hand, max_size=10)
    assert np.array_equal(obs["player_hand"], expected_hand)


def test_creates_default_embedding_when_none():
    """Default path still works when no embedding instance is provided."""
    state = _make_state()
    obs = build_observation(state, perspective_player=state.player1, embedding_dim=64)
    assert obs["player_hand"].shape == (10, 64)


def test_embedding_dim_changes_tensor_shape():
    state = _make_state()
    obs = build_observation(state, perspective_player=state.player1, embedding_dim=32)
    assert obs["player_hand"].shape == (10, 32)


def test_values_in_zero_one_range():
    state = _make_state()
    obs = build_observation(state, perspective_player=state.player1)
    for key in ["player_hand", "player_board", "opponent_board"]:
        assert np.all(obs[key] >= 0.0) and np.all(obs[key] <= 1.0)
