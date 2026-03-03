"""Gymnasium environment for Hearthstone CLI game."""

from typing import Any, Dict, List, Optional, Tuple

import gymnasium as gym
import numpy as np
from gymnasium import spaces

from hearthstone_cli.engine.actions import Action, EndTurnAction
from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.engine.state import GameState
from hearthstone_cli.env.observation import ObservationEncoder


class HearthstoneEnv(gym.Env):
    metadata = {"render_modes": ["human", "ansi", "none"]}

    def __init__(self, deck1: Deck, deck2: Deck, seed: Optional[int] = None, render_mode: str = "none"):
        super().__init__()
        self.deck1 = deck1
        self.deck2 = deck2
        self.seed = seed
        self.render_mode = render_mode
        self._game: Optional[GameState] = None
        self._action_map: Dict[int, Any] = {}

        # 观察空间
        self.observation_space = spaces.Dict({
            "my_hero_health": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "my_hero_armor": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "my_mana_current": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "my_mana_max": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "opponent_hero_health": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "opponent_hero_armor": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "turn": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "is_my_turn": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "my_hand": spaces.Box(0, 1, shape=(10, 10), dtype=np.float32),
            "my_hand_mask": spaces.MultiBinary(10),
            "my_board": spaces.Box(0, 1, shape=(7, 15), dtype=np.float32),
            "my_board_mask": spaces.MultiBinary(7),
            "enemy_board": spaces.Box(0, 1, shape=(7, 15), dtype=np.float32),
            "enemy_board_mask": spaces.MultiBinary(7),
            "my_deck_size": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "enemy_deck_size": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "has_weapon": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "weapon_attack": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "weapon_durability": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "opponent_secrets_count": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "my_secrets_count": spaces.Box(0, 1, shape=(), dtype=np.float32),
        })

        self.action_space = spaces.Discrete(1000)

    def reset(self, seed: Optional[int] = None, options: Optional[Dict] = None) -> Tuple[Dict, Dict]:
        super().reset(seed=seed)
        if seed is not None:
            self.seed = seed
        self._game = GameLogic.create_game(deck1=self.deck1, deck2=self.deck2, seed=self.seed or 42)
        obs = self._get_obs()
        info = self._get_info()
        return obs, info

    def step(self, action: int) -> Tuple[Dict, float, bool, bool, Dict]:
        assert self._game is not None
        game_action = self._action_id_to_action(action)
        if game_action is not None:
            self._game = GameLogic.apply_action(self._game, game_action)

        while self._game.active_player == 1 and not GameLogic.is_terminal(self._game):
            opponent_action = EndTurnAction(player=1)
            self._game = GameLogic.apply_action(self._game, opponent_action)

        obs = self._get_obs()
        reward = self._calculate_reward()
        terminated = GameLogic.is_terminal(self._game)
        truncated = False
        info = self._get_info()
        return obs, reward, terminated, truncated, info

    def _get_obs(self) -> Dict:
        return ObservationEncoder.encode(self._game, player=0)

    def _get_info(self) -> Dict:
        return {
            "turn": self._game.turn,
            "active_player": self._game.active_player,
            "legal_actions": self._get_legal_action_ids()
        }

    def _calculate_reward(self) -> float:
        if not GameLogic.is_terminal(self._game):
            return 0.0
        winner = GameLogic.get_winner(self._game)
        if winner == 0:
            return 1.0
        elif winner == 1:
            return -1.0
        return 0.0

    def _get_legal_action_ids(self) -> List[int]:
        legal = GameLogic.get_legal_actions(self._game, player=0)
        return [self.action_to_id(a) for a in legal]

    def _action_id_to_action(self, action_id: int) -> Optional[Action]:
        if action_id == 0:
            return EndTurnAction(player=0)
        return None

    def action_to_id(self, action: Any) -> int:
        if isinstance(action, EndTurnAction):
            return 0
        return 1

    def render(self):
        if self.render_mode == "ansi":
            return str(self._game)
        elif self.render_mode == "human":
            print(self._game)

    def close(self):
        pass
