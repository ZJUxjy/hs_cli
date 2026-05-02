"""FireplaceGymEnv -- Gymnasium wrapper around fireplace.Game with multi-deck support."""
from __future__ import annotations

import logging
import random
from typing import Optional

import gymnasium as gym
import numpy as np

from .action_enum import (
    Action, EndTurnAction, dispatch, enumerate_valid_actions,
)
from .choose_one_policy import ChooseOnePolicy, FirstChoiceOne
from .deck_source import Deck
from .discover_policy import DiscoverPolicy, FirstOption
from .mulligan_policy import KeepLowCost, MulliganPolicy
from .observation import (
    build_observation_for, make_observation_space,
)

logger = logging.getLogger(__name__)


class FireplaceGymEnv(gym.Env):
    """Gymnasium env over fireplace.Game with multi-deck pool sampling.

    Constructor invariants:
      - pair_strategy="fixed" requires len(decks) == 2
      - pair_strategy="random_pair" requires len(decks) >= 2
      - swap_training_player is independent of pair_strategy

    When swap_training_player=True, training_player_idx is the initial value
    used before the first reset; subsequent resets pick uniformly from {0, 1}.

    RNG model (3 sources):
      1. self._rng (np.random.Generator) — drives deck pair sampling, swap,
         and seed derivation for sources 2 & 3.
      2. fireplace.Game(seed=fp_seed) — internal Game.random for card draw,
         mulligan, fireplace bare-random helpers.
      3. Python's global random — reseeded each reset() so RandomOpponent
         (which uses random.randrange) is reproducible per env seed.
    """
    metadata = {"render_modes": ["human"]}

    NUM_ACTIONS = 512
    MAX_OPP_ACTIONS_PER_STEP = 200
    MAX_CHOICE_RESOLUTIONS = 50

    def __init__(
        self,
        decks: list,
        pair_strategy: str = "fixed",
        swap_training_player: bool = False,
        training_player_idx: int = 0,
        mulligan_policy: Optional[MulliganPolicy] = None,
        discover_policy: Optional[DiscoverPolicy] = None,
        choose_one_policy: Optional[ChooseOnePolicy] = None,
        seed: Optional[int] = None,
    ):
        super().__init__()
        assert pair_strategy in ("fixed", "random_pair"), (
            f"pair_strategy must be 'fixed' or 'random_pair', got {pair_strategy!r}"
        )
        if pair_strategy == "fixed":
            assert len(decks) == 2, (
                f"pair_strategy='fixed' requires len(decks) == 2, got {len(decks)}"
            )
        else:
            assert len(decks) >= 2, (
                f"pair_strategy='random_pair' requires len(decks) >= 2, "
                f"got {len(decks)}"
            )
        assert all(isinstance(d, Deck) for d in decks), (
            "decks must be a list of Deck instances"
        )
        assert training_player_idx in (0, 1)

        self.decks = list(decks)
        self.pair_strategy = pair_strategy
        self.swap_training_player = swap_training_player
        self._training_player_idx = training_player_idx
        self._init_seed = seed
        self._rng = np.random.default_rng(seed)

        self.mulligan_policy = mulligan_policy or KeepLowCost(threshold=3)
        self.discover_policy = discover_policy or FirstOption()
        self.choose_one_policy = choose_one_policy or FirstChoiceOne()

        self.observation_space = make_observation_space()
        self.action_space = gym.spaces.Discrete(self.NUM_ACTIONS)

        self.game = None
        self.current_valid_actions: list = []
        self._reward_fn = None
        self._current_p1_deck_name: Optional[str] = None
        self._current_p2_deck_name: Optional[str] = None
        self._current_fireplace_seed: Optional[int] = None

    def reset(self, *, seed: Optional[int] = None, options=None):
        from fireplace import cards as fp_cards
        from fireplace.game import Game
        from fireplace.player import Player
        from .reward import RewardFunction

        fp_cards.db.initialize()
        if seed is not None:
            self._rng = np.random.default_rng(seed)

        # 1. Seed Python's global random (for RandomOpponent reproducibility).
        random.seed(int(self._rng.integers(0, 2**31)))

        # 2. Sample deck pair
        if self.pair_strategy == "fixed":
            deck_a, deck_b = self.decks[0], self.decks[1]
        else:
            i, j = self._rng.choice(len(self.decks), size=2, replace=False)
            deck_a, deck_b = self.decks[int(i)], self.decks[int(j)]

        # 3. Sample training_player_idx (or hold fixed)
        if self.swap_training_player:
            self._training_player_idx = int(self._rng.integers(0, 2))

        # 4. Construct fireplace.Game with derived seed
        fp_seed = int(self._rng.integers(0, 2**31))
        p1 = Player("p1", list(deck_a.card_ids), deck_a.hero_id)
        p2 = Player("p2", list(deck_b.card_ids), deck_b.hero_id)
        self.game = Game(players=[p1, p2], seed=fp_seed)
        self.game.start()
        self._auto_resolve_choices()

        # 5. Cache for info / metrics / S2-B
        self._current_p1_deck_name = deck_a.name
        self._current_p2_deck_name = deck_b.name
        self._current_fireplace_seed = fp_seed
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
            info = self._info()
            info["invalid_action"] = True
            return obs, -0.01, bool(self.game.ended), False, info

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
            "p1_deck_name": self._current_p1_deck_name,
            "p2_deck_name": self._current_p2_deck_name,
            "training_player_idx": self._training_player_idx,
            "fireplace_seed": self._current_fireplace_seed,
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
