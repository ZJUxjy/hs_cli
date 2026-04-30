"""FireplaceGymEnv -- Gymnasium wrapper around fireplace.Game."""
from __future__ import annotations

import logging
from typing import Optional

import gymnasium as gym
import numpy as np

from .action_enum import (
    Action, EndTurnAction, dispatch, enumerate_valid_actions,
)
from .choose_one_policy import ChooseOnePolicy, FirstChoiceOne
from .discover_policy import DiscoverPolicy, FirstOption
from .mulligan_policy import KeepLowCost, MulliganPolicy
from .observation import (
    build_observation_for, make_observation_space,
)

logger = logging.getLogger(__name__)


class FireplaceGymEnv(gym.Env):
    metadata = {"render_modes": ["human"]}

    NUM_ACTIONS = 512
    MAX_OPP_ACTIONS_PER_STEP = 200
    MAX_CHOICE_RESOLUTIONS = 50

    def __init__(
        self,
        deck1: list[str],
        deck2: list[str],
        hero1: str,
        hero2: str,
        training_player_idx: int = 0,
        mulligan_policy: Optional[MulliganPolicy] = None,
        discover_policy: Optional[DiscoverPolicy] = None,
        choose_one_policy: Optional[ChooseOnePolicy] = None,
        seed: Optional[int] = None,
    ):
        super().__init__()
        assert training_player_idx in (0, 1)
        self._deck1 = list(deck1)
        self._deck2 = list(deck2)
        self._hero1 = hero1
        self._hero2 = hero2
        self._training_player_idx = training_player_idx
        self._init_seed = seed
        self.mulligan_policy = mulligan_policy or KeepLowCost(threshold=3)
        self.discover_policy = discover_policy or FirstOption()
        self.choose_one_policy = choose_one_policy or FirstChoiceOne()

        self.observation_space = make_observation_space()
        self.action_space = gym.spaces.Discrete(self.NUM_ACTIONS)

        self.game = None
        self.current_valid_actions: list[Action] = []
        self._reward_fn = None

    def reset(self, *, seed: Optional[int] = None, options=None):
        from fireplace import cards as fp_cards
        from fireplace.game import Game
        from fireplace.player import Player
        from .reward import RewardFunction

        fp_cards.db.initialize()
        s = seed if seed is not None else self._init_seed
        p1 = Player("p1", self._deck1, self._hero1)
        p2 = Player("p2", self._deck2, self._hero2)
        self.game = Game(players=[p1, p2], seed=s)
        self.game.start()
        self._auto_resolve_choices()
        self._reward_fn = RewardFunction()
        self.current_valid_actions = enumerate_valid_actions(
            self.game.current_player, self.choose_one_policy,
        )
        return self._build_observation(), self._info()

    def step(self, action_idx: int):
        valid = self.current_valid_actions
        invalid = action_idx >= len(valid) or action_idx < 0
        if invalid:
            obs = self._build_observation()
            return obs, -0.01, bool(self.game.ended), False, {
                "valid_actions": len(valid),
                "invalid_action": True,
            }

        before = self._reward_snapshot()
        dispatch(valid[action_idx], self.game)
        self._auto_resolve_choices()
        after = self._reward_snapshot()
        reward = self._reward_fn.calc(before, after, self.training_player)

        terminated = bool(self.game.ended)
        if terminated:
            self.current_valid_actions = []
        else:
            self.current_valid_actions = enumerate_valid_actions(
                self.game.current_player, self.choose_one_policy,
            )

        obs = self._build_observation()
        return obs, float(reward), terminated, False, self._info()

    def render(self, mode="human"):
        if self.game is not None:
            print(repr(self.game))

    def close(self):
        self.game = None
        self.current_valid_actions = []

    @property
    def training_player(self):
        return self.game.players[self._training_player_idx]

    @property
    def opponent_player(self):
        return self.game.players[1 - self._training_player_idx]

    def _build_observation(self) -> dict:
        return build_observation_for(self.game, self.training_player)

    def build_observation_for(self, player) -> dict:
        return build_observation_for(self.game, player)

    def _info(self) -> dict:
        return {
            "valid_actions": len(self.current_valid_actions),
            "invalid_action": False,
        }

    def _auto_resolve_choices(self) -> None:
        from fireplace.actions import MulliganChoice
        for _ in range(self.MAX_CHOICE_RESOLUTIONS):
            for player in self.game.players:
                choice = player.choice
                if choice is None:
                    continue
                if isinstance(choice, MulliganChoice):
                    muls = self.mulligan_policy.cards_to_mulligan(list(choice.cards))
                    choice.choose(*muls)
                else:
                    pick = self.discover_policy.choose(list(choice.cards))
                    choice.choose(pick)
            if all(p.choice is None for p in self.game.players):
                return
        raise RuntimeError(
            f"Choice resolution did not converge within "
            f"{self.MAX_CHOICE_RESOLUTIONS} iterations"
        )

    def _reward_snapshot(self) -> dict:
        from .reward import reward_snapshot
        return reward_snapshot(self)
