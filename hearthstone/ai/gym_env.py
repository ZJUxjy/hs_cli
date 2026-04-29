"""Gymnasium environment for Hearthstone."""
import copy

import gymnasium as gym
from gymnasium import spaces
import numpy as np

from hearthstone.ai.card_embedding import CardEmbedding
from hearthstone.ai.reward_functions import RewardFunction
from hearthstone.decks.deck_manager import DeckManager
from hearthstone.engine.game_controller import GameController


class HearthstoneEnv(gym.Env):
    """Hearthstone environment following Gymnasium API.

    Observation includes card embeddings for hand and both boards plus 9
    scalar features. Observation and reward are always computed from the
    training player's perspective (default Player 1) regardless of whose
    turn it currently is.
    """

    metadata = {"render_modes": ["human"]}
    EMBEDDING_DIM = 64
    MAX_HAND = 10
    MAX_BOARD = 7
    NUM_ACTIONS = 100

    def __init__(
        self,
        deck1_name: str = "test_deck",
        deck2_name: str = "test_deck",
        training_player_name: str = "Player 1",
    ):
        super().__init__()
        self.deck1_name = deck1_name
        self.deck2_name = deck2_name
        self.training_player_name = training_player_name
        self.embedding = CardEmbedding(embedding_dim=self.EMBEDDING_DIM)
        self.reward_fn = RewardFunction()

        self.observation_space = spaces.Dict({
            "player_hand": spaces.Box(0, 1, shape=(self.MAX_HAND, self.EMBEDDING_DIM), dtype=np.float32),
            "player_board": spaces.Box(0, 1, shape=(self.MAX_BOARD, self.EMBEDDING_DIM), dtype=np.float32),
            "opponent_board": spaces.Box(0, 1, shape=(self.MAX_BOARD, self.EMBEDDING_DIM), dtype=np.float32),
            "player_health": spaces.Box(0, 30, shape=(1,), dtype=np.float32),
            "player_mana": spaces.Box(0, 10, shape=(1,), dtype=np.float32),
            "player_max_mana": spaces.Box(0, 10, shape=(1,), dtype=np.float32),
            "player_hand_size": spaces.Box(0, 10, shape=(1,), dtype=np.float32),
            "player_board_size": spaces.Box(0, 7, shape=(1,), dtype=np.float32),
            "opponent_health": spaces.Box(0, 30, shape=(1,), dtype=np.float32),
            "opponent_board_size": spaces.Box(0, 7, shape=(1,), dtype=np.float32),
            "turn_number": spaces.Box(0, 100, shape=(1,), dtype=np.float32),
            "player_deck_size": spaces.Box(0, 30, shape=(1,), dtype=np.float32),
        })

        self.action_space = spaces.Discrete(self.NUM_ACTIONS)
        self.controller = None

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        manager = DeckManager()
        deck1 = manager.load_deck(self.deck1_name)
        deck2 = manager.load_deck(self.deck2_name)
        self.controller = GameController(deck1, deck2)
        self.controller.start_game()
        return self._get_observation(), {}

    def _resolve_players(self, state):
        """Return (training_player, opponent) regardless of whose turn it is."""
        if state.player1.name == self.training_player_name:
            return state.player1, state.player2
        if state.player2.name == self.training_player_name:
            return state.player2, state.player1
        raise ValueError(
            f"training_player_name '{self.training_player_name}' does not match "
            f"either player ('{state.player1.name}', '{state.player2.name}')"
        )

    def _get_observation(self):
        from hearthstone.ai.card_embedding import build_observation
        state = self.controller.get_state()
        me, _ = self._resolve_players(state)
        return build_observation(
            state,
            perspective_player=me,
            embedding=self.embedding,
            max_hand=self.MAX_HAND,
            max_board=self.MAX_BOARD,
        )

    def step(self, action):
        if self.controller is None:
            raise RuntimeError("Call reset() before step()")

        old_state = copy.deepcopy(self.controller.get_state())
        valid_actions = self.controller.get_valid_actions()
        invalid = action >= len(valid_actions)

        if not invalid:
            self.controller.execute_action(valid_actions[action])

        new_state = self.controller.get_state()
        terminated = self.controller.is_game_over()

        reward = self.reward_fn.calculate(
            old_state, new_state, player_name=self.training_player_name,
        )
        if invalid:
            reward -= 0.01  # small penalty for picking out-of-range action

        obs = self._get_observation()
        info = {"valid_actions": len(valid_actions), "invalid_action": invalid}
        return obs, float(reward), bool(terminated), False, info

    def render(self, mode="human"):
        pass

    def close(self):
        self.controller = None
