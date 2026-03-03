"""Tests for HearthstoneEnv."""
import pytest


def test_gym_env_import():
    """Test that we can import HearthstoneEnv."""
    from hearthstone.ai.gym_env import HearthstoneEnv

    assert HearthstoneEnv is not None


def test_gym_env_initialization():
    """Test environment initialization."""
    from hearthstone.ai.gym_env import HearthstoneEnv

    env = HearthstoneEnv()
    assert env is not None


def test_gym_env_reset():
    """Test environment reset."""
    from hearthstone.ai.gym_env import HearthstoneEnv

    env = HearthstoneEnv()
    obs, info = env.reset()

    assert obs is not None
    assert isinstance(obs, dict)
    assert "player_health" in obs


def test_gym_env_step():
    """Test environment step."""
    from hearthstone.ai.gym_env import HearthstoneEnv

    env = HearthstoneEnv()
    obs, _ = env.reset()

    # Try to take a step (action 0 = end turn)
    obs, reward, terminated, truncated, info = env.step(0)

    assert obs is not None
    assert isinstance(reward, (int, float))
    assert isinstance(terminated, bool)
    assert isinstance(truncated, bool)
