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

        self.deck1_name = deck1_name
        self.deck2_name = deck2_name

        # Observation space
        # Using simple features for MVP
        self.observation_space = spaces.Dict({
            "player_health": spaces.Box(0, 30, shape=(1,), dtype=np.float32),
            "player_mana": spaces.Box(0, 10, shape=(1,), dtype=np.float32),
            "player_hand_size": spaces.Box(0, 10, shape=(1,), dtype=np.float32),
            "player_board_size": spaces.Box(0, 7, shape=(1,), dtype=np.float32),
            "opponent_health": spaces.Box(0, 30, shape=(1,), dtype=np.float32),
            "opponent_board_size": spaces.Box(0, 7, shape=(1,), dtype=np.float32),
            "turn_number": spaces.Box(0, 100, shape=(1,), dtype=np.float32),
        })

        # Action space (will use masking)
        self.action_space = spaces.Discrete(100)  # Max 100 possible actions

        self.controller = None

    def reset(self, seed=None, options=None):
        """Reset environment to initial state."""
        super().reset(seed=seed)

        from hearthstone.decks.deck_manager import DeckManager
        from hearthstone.engine.game_controller import GameController

        # Load decks
        manager = DeckManager()
        deck1 = manager.load_deck(self.deck1_name)
        deck2 = manager.load_deck(self.deck2_name)

        # Create game controller
        self.controller = GameController(deck1, deck2)
        self.controller.start_game()

        # Get initial observation
        obs = self._get_observation()

        return obs, {}

    def _get_observation(self):
        """Convert game state to observation."""
        state = self.controller.get_state()

        return {
            "player_health": np.array([state.current_player.hero.health], dtype=np.float32),
            "player_mana": np.array([state.current_player.mana], dtype=np.float32),
            "player_hand_size": np.array([len(state.current_player.hand)], dtype=np.float32),
            "player_board_size": np.array([len(state.current_player.board)], dtype=np.float32),
            "opponent_health": np.array([state.opposing_player.hero.health], dtype=np.float32),
            "opponent_board_size": np.array([len(state.opposing_player.board)], dtype=np.float32),
            "turn_number": np.array([state.turn], dtype=np.float32),
        }

    def step(self, action):
        """Execute action."""
        # TODO: Implement
        pass

    def render(self, mode="human"):
        """Render environment."""
        # TODO: Implement
        pass
