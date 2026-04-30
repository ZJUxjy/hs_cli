"""OpponentEnv — folds opponent moves into one outer step()."""
from __future__ import annotations

import logging

import gymnasium as gym

from .fireplace_env import FireplaceGymEnv
from .opponents import OpponentPolicy

logger = logging.getLogger(__name__)


class OpponentEnv(gym.Env):
    """Wraps a FireplaceGymEnv and an OpponentPolicy.

    The agent sees only its own turn. Opponent moves are accumulated via
    `_loop_opponent`, including their reward contribution.
    """

    MAX_OPP_ACTIONS_PER_STEP = FireplaceGymEnv.MAX_OPP_ACTIONS_PER_STEP

    def __init__(self, base_env: FireplaceGymEnv, opponent: OpponentPolicy):
        super().__init__()
        self._env = base_env
        self.opponent = opponent
        self.observation_space = base_env.observation_space
        self.action_space = base_env.action_space

    def reset(self, *, seed=None, options=None):
        obs, info = self._env.reset(seed=seed, options=options)
        obs, _, _, _, info = self._loop_opponent(obs, info)
        return obs, info

    def step(self, action_idx: int):
        obs, reward, term, trunc, info = self._env.step(action_idx)
        if term:
            return obs, reward, term, trunc, info
        obs, extra, term, trunc, info = self._loop_opponent(obs, info)
        return obs, reward + extra, term, trunc, info

    def render(self, mode="human"):
        self._env.render(mode)

    def close(self):
        self._env.close()

    def _loop_opponent(self, obs, info):
        extra = 0.0
        env = self._env
        for _ in range(self.MAX_OPP_ACTIONS_PER_STEP):
            if env.game.ended or env.game.current_player is env.training_player:
                break
            opp_idx = self.opponent.act(env)
            obs, r, term, trunc, info = env.step(opp_idx)
            extra += r
            if term:
                return obs, extra, True, trunc, info
        else:
            logger.warning("Opponent action cap hit; forcing end turn (idx 0)")
            obs, r, term, trunc, info = env.step(0)
            extra += r
        return obs, extra, env.game.ended, False, info
