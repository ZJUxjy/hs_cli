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
