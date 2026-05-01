"""Evaluation against an opponent factory; greedy on agent side."""
from __future__ import annotations

from typing import Callable

from hearthstone.enums import PlayState

from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
from hearthstone.ai.env.opponents import OpponentPolicy, SelfPlayOpponent


DEFAULT_MAX_ACTIONS_PER_GAME = 1000


def evaluate(
    network: PolicyValueNetwork,
    opponent_factory: Callable[[], OpponentPolicy],
    n_games: int,
    deck1: list[str],
    deck2: list[str],
    hero1: str,
    hero2: str,
    training_player_idx: int = 0,
    slot_dim: int = 90,
    num_actions: int = 512,
    max_actions_per_game: int = DEFAULT_MAX_ACTIONS_PER_GAME,
) -> float:
    """Greedy agent vs opponent; return win-rate from training player's perspective."""
    eval_agent = SelfPlayOpponent(
        network_path=None, slot_dim=slot_dim, num_actions=num_actions,
    )
    eval_agent.network = network
    eval_agent.network.eval()

    wins = 0
    for _ in range(n_games):
        env = FireplaceGymEnv(
            deck1=deck1, deck2=deck2, hero1=hero1, hero2=hero2,
            training_player_idx=training_player_idx,
        )
        opp = opponent_factory()
        env.reset()
        action_count = 0
        cap_hit = False
        while not env.game.ended and action_count < max_actions_per_game:
            if env.game.current_player is env.training_player:
                action = eval_agent.act(env)
            else:
                action = opp.act(env)
            env.step(action)
            action_count += 1
        if action_count >= max_actions_per_game and not env.game.ended:
            cap_hit = True
        if not cap_hit and env.training_player.playstate == PlayState.WON:
            wins += 1
        env.close()
    return wins / n_games
