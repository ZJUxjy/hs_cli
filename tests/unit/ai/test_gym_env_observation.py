"""Tests for HearthstoneEnv observation upgrade."""
import numpy as np
from hearthstone.ai.gym_env import HearthstoneEnv


def test_observation_keys_present():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    obs, _ = env.reset()
    expected = {
        "player_hand", "player_board", "opponent_board",
        "player_health", "player_mana", "player_max_mana",
        "player_hand_size", "player_board_size",
        "opponent_health", "opponent_board_size",
        "turn_number", "player_deck_size",
    }
    assert set(obs.keys()) == expected, f"Missing/extra keys: {set(obs.keys()) ^ expected}"
    env.close()


def test_card_tensor_shapes():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    obs, _ = env.reset()
    assert obs["player_hand"].shape == (10, 64)
    assert obs["player_board"].shape == (7, 64)
    assert obs["opponent_board"].shape == (7, 64)
    env.close()


def test_card_tensor_values_in_range():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    obs, _ = env.reset()
    for key in ["player_hand", "player_board", "opponent_board"]:
        assert obs[key].dtype == np.float32
        assert np.all(obs[key] >= 0.0) and np.all(obs[key] <= 1.0), \
            f"{key} contains values outside [0, 1]"
    env.close()


def test_scalar_features_in_range():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    obs, _ = env.reset()
    assert 0 <= obs["player_health"][0] <= 30
    assert 0 <= obs["player_mana"][0] <= 10
    assert 0 <= obs["opponent_health"][0] <= 30
    assert 0 <= obs["turn_number"][0] <= 100
    env.close()


def test_observation_perspective_is_fixed():
    """Observation must always reflect the training player, not current_player."""
    env = HearthstoneEnv(
        deck1_name="test_deck", deck2_name="test_deck",
        training_player_name="Player 1",
    )
    obs1, _ = env.reset()
    p1_initial_health = float(obs1["player_health"][0])

    # Step until current_player has flipped at least once (end-turn is index 0)
    flipped = False
    for _ in range(5):
        obs2, _, terminated, _, _ = env.step(0)
        if env.controller.get_state().current_player.name != "Player 1":
            flipped = True
            # player_health in obs MUST still be player1's health
            p1_health_now = env.controller.get_state().player1.hero.health
            assert float(obs2["player_health"][0]) == p1_health_now, \
                "Observation flipped perspective when current_player changed"
            break
        if terminated:
            break
    assert flipped, "Test setup failure: current_player never flipped"
    env.close()


def test_step_returns_valid_tuple():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    env.reset()
    obs, reward, terminated, truncated, info = env.step(0)
    assert isinstance(reward, float)
    assert isinstance(terminated, bool)
    assert isinstance(truncated, bool)
    assert isinstance(info, dict)
    env.close()


def test_training_player_name_mismatch_raises():
    """Passing unknown training_player_name should raise ValueError."""
    import pytest
    env = HearthstoneEnv(
        deck1_name="test_deck", deck2_name="test_deck",
        training_player_name="wrong_name",
    )
    with pytest.raises(ValueError, match="does not match"):
        env.reset()
    env.close()
