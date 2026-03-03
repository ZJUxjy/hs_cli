"""Gymnasium environment for Hearthstone."""
import gymnasium as gym
from gymnasium import spaces
import numpy as np


class HearthstoneEnv(gym.Env):
    """Hearthstone environment following Gymnasium API."""

    metadata = {"render_modes": ["human"]}

    def __init__(self, deck1_name: str = "test_deck", deck2_name: str = "test_deck"):
        """Initialize environment."""
        super().__init__()

        # TODO: Define observation and action spaces
        self.observation_space = spaces.Dict({})
        self.action_space = spaces.Discrete(1)

    def reset(self, seed=None, options=None):
        """Reset environment."""
        # TODO: Implement
        pass

    def step(self, action):
        """Execute action."""
        # TODO: Implement
        pass

    def render(self, mode="human"):
        """Render environment."""
        # TODO: Implement
        pass
