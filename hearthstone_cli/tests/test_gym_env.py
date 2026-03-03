"""Tests for Gymnasium environment."""

import numpy as np
import pytest

from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.env.gym_env import HearthstoneEnv


def create_test_deck() -> Deck:
    """Create a simple test deck with 30 cards."""
    # Using basic card IDs that should exist in the database
    card_ids = ["CS1_042"] * 30  # Goldshire Footman (basic minion)
    return Deck(card_ids=card_ids)


def test_env_creation():
    """可以创建环境"""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    env = HearthstoneEnv(deck1=deck1, deck2=deck2, seed=42)
    assert env is not None
    assert env.deck1 == deck1
    assert env.deck2 == deck2
    assert env.seed == 42


def test_env_reset():
    """可以重置环境"""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    env = HearthstoneEnv(deck1=deck1, deck2=deck2, seed=42)

    obs, info = env.reset()

    assert obs is not None
    assert isinstance(obs, dict)
    assert info is not None
    assert isinstance(info, dict)
    assert "turn" in info
    assert "active_player" in info
    assert "legal_actions" in info


def test_env_observation_shape():
    """观察值形状正确"""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    env = HearthstoneEnv(deck1=deck1, deck2=deck2, seed=42)
    obs, _ = env.reset()

    # Check scalar features
    assert isinstance(obs["my_hero_health"], float)
    assert isinstance(obs["my_hero_armor"], float)
    assert isinstance(obs["my_mana_current"], float)
    assert isinstance(obs["my_mana_max"], float)
    assert isinstance(obs["opponent_hero_health"], float)
    assert isinstance(obs["opponent_hero_armor"], float)
    assert isinstance(obs["turn"], float)
    assert isinstance(obs["is_my_turn"], float)

    # Check hand encoding
    assert len(obs["my_hand"]) == 10  # MAX_HAND_SIZE
    assert len(obs["my_hand"][0]) == 10  # Card feature dimension
    assert len(obs["my_hand_mask"]) == 10

    # Check board encoding
    assert len(obs["my_board"]) == 7  # MAX_BOARD_SIZE
    assert len(obs["my_board"][0]) == 15  # Minion feature dimension
    assert len(obs["my_board_mask"]) == 7

    assert len(obs["enemy_board"]) == 7
    assert len(obs["enemy_board"][0]) == 15
    assert len(obs["enemy_board_mask"]) == 7

    # Check deck sizes
    assert isinstance(obs["my_deck_size"], float)
    assert isinstance(obs["enemy_deck_size"], float)

    # Check weapon info
    assert isinstance(obs["has_weapon"], float)
    assert isinstance(obs["weapon_attack"], float)
    assert isinstance(obs["weapon_durability"], float)

    # Check secrets
    assert isinstance(obs["opponent_secrets_count"], float)
    assert isinstance(obs["my_secrets_count"], float)


def test_env_step_end_turn():
    """可以执行结束回合动作"""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    env = HearthstoneEnv(deck1=deck1, deck2=deck2, seed=42)
    obs, info = env.reset()

    # Initial state - player 0's turn
    initial_turn = info["turn"]
    assert info["active_player"] == 0

    # Perform end turn action (action_id 0)
    obs, reward, terminated, truncated, info = env.step(0)

    assert obs is not None
    assert isinstance(reward, float)
    assert isinstance(terminated, bool)
    assert isinstance(truncated, bool)
    assert info is not None

    # After end turn, it should be player 0's turn again (opponent auto-plays)
    # and turn number should have increased
    assert info["active_player"] == 0


def test_env_observation_space_contains():
    """观察值在观察空间内"""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    env = HearthstoneEnv(deck1=deck1, deck2=deck2, seed=42)
    obs, _ = env.reset()

    assert env.observation_space.contains(obs)


def test_env_action_space():
    """动作空间正确配置"""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    env = HearthstoneEnv(deck1=deck1, deck2=deck2, seed=42)

    assert env.action_space.n == 1000


def test_env_render():
    """渲染功能工作正常"""
    deck1 = create_test_deck()
    deck2 = create_test_deck()

    # Test ansi render mode
    env = HearthstoneEnv(deck1=deck1, deck2=deck2, seed=42, render_mode="ansi")
    env.reset()
    result = env.render()
    assert isinstance(result, str)

    # Test none render mode
    env2 = HearthstoneEnv(deck1=deck1, deck2=deck2, seed=42, render_mode="none")
    env2.reset()
    result2 = env2.render()
    assert result2 is None


def test_env_close():
    """关闭环境不报错"""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    env = HearthstoneEnv(deck1=deck1, deck2=deck2, seed=42)
    env.reset()
    env.close()  # Should not raise


def test_env_reward_calculation():
    """奖励计算正确"""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    env = HearthstoneEnv(deck1=deck1, deck2=deck2, seed=42)
    env.reset()

    # In a normal ongoing game, reward should be 0
    obs, reward, terminated, truncated, info = env.step(0)
    if not terminated:
        assert reward == 0.0
