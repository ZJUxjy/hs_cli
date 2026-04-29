"""Gym env wrapper that runs the opponent's turn(s) inside step()/reset()."""
import logging
from typing import Tuple

import gymnasium as gym

from hearthstone.ai.gym_env import HearthstoneEnv
from hearthstone.ai.opponents import OpponentPolicy

logger = logging.getLogger(__name__)


class OpponentEnv(gym.Env):
    """Wraps HearthstoneEnv with an opponent so the agent only sees its own turn.

    On reset() and after the agent's step(), opponent moves are run
    internally until current_player == training_player_name or the game
    ends. Reward from opponent turns is accumulated and returned in the
    agent's step() result so the agent observes the consequences of
    ending its turn.
    """

    MAX_OPPONENT_ACTIONS_PER_STEP = 200

    def __init__(self, base_env: HearthstoneEnv, opponent: OpponentPolicy):
        self._env = base_env
        self.opponent = opponent  # mutable; driver swaps on phase transition
        self.observation_space = base_env.observation_space
        self.action_space = base_env.action_space

    @property
    def controller(self):
        """Expose the underlying GameController for eval / opponent logic."""
        return self._env.controller

    @property
    def training_player_name(self) -> str:
        """Name of the training player (forwarded from the inner env)."""
        return self._env.training_player_name

    def reset(self, **kw):
        obs, info = self._env.reset(**kw)
        obs, _, _, _, info = self._loop_opponent(obs, info)
        return obs, info

    def step(self, action):
        obs, reward, terminated, truncated, info = self._env.step(action)
        if terminated or truncated:
            return obs, reward, terminated, truncated, info
        obs, extra, terminated, truncated, info = self._loop_opponent(obs, info)
        return obs, reward + extra, terminated, truncated, info

    def _loop_opponent(self, obs, info) -> Tuple:
        """Run opponent steps until training-player turn or game over.

        Accumulates reward (always perspective-correct via inner env's
        RewardFunction, which uses training_player_name) into `extra`.
        """
        extra_reward = 0.0
        terminated = self._env.controller.is_game_over()
        truncated = False

        for _ in range(self.MAX_OPPONENT_ACTIONS_PER_STEP):
            controller = self._env.controller
            if controller.is_game_over():
                terminated = True
                break
            state = controller.get_state()
            if state.current_player.name == self._env.training_player_name:
                break
            opp_action = self.opponent.act(controller)
            obs, r, terminated, truncated, info = self._env.step(opp_action)
            extra_reward += r
            if terminated or truncated:
                break
        else:
            # Action cap hit — force-end the opponent's turn.
            logger.warning(
                "Opponent action cap (%d) hit; forcing end turn",
                self.MAX_OPPONENT_ACTIONS_PER_STEP,
            )
            from hearthstone.engine.action import EndTurnAction
            valid = self._env.controller.get_valid_actions()
            idx = next(
                (i for i, a in enumerate(valid) if isinstance(a, EndTurnAction)), 0
            )
            obs, r, terminated, truncated, info = self._env.step(idx)
            extra_reward += r

        return obs, extra_reward, terminated, truncated, info

    def render(self, mode="human"):
        return self._env.render(mode)

    def close(self):
        return self._env.close()
