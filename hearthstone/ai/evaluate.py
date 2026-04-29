"""Evaluation of an agent's win-rate against an opponent factory."""
from typing import Callable

from hearthstone.ai.gym_env import HearthstoneEnv
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.opponent_env import OpponentEnv
from hearthstone.ai.opponents import OpponentPolicy, SelfPlayOpponent


DEFAULT_MAX_ACTIONS_PER_GAME = 1000


def evaluate(
    network: PolicyValueNetwork,
    opponent_factory: Callable[[], OpponentPolicy],
    n_games: int,
    deck1: str,
    deck2: str,
    training_player_name: str,
    max_actions_per_game: int = DEFAULT_MAX_ACTIONS_PER_GAME,
) -> float:
    """Play n_games using `network` (greedy) against fresh opponents.

    Returns win-rate from the training player's perspective.

    The agent uses the same greedy-act logic as SelfPlayOpponent — a
    SelfPlayOpponent instance is constructed without loading weights and
    its network is replaced with the provided network (no copy).

    `opponent_factory` is called once per game so opponents that carry
    state get a fresh instance each match.

    Each game is capped at `max_actions_per_game` agent actions. If the
    cap is hit (which should not happen with a well-behaved engine), the
    game is treated as not-a-win — defense-in-depth against deterministic
    stuck states.
    """
    eval_agent = SelfPlayOpponent(network_path=None)
    eval_agent.network = network
    eval_agent.network.eval()

    wins = 0
    for _ in range(n_games):
        base = HearthstoneEnv(
            deck1_name=deck1, deck2_name=deck2,
            training_player_name=training_player_name,
        )
        env = OpponentEnv(base, opponent_factory())
        obs, _ = env.reset()
        terminated = truncated = False
        action_count = 0
        while not (terminated or truncated) and action_count < max_actions_per_game:
            action = eval_agent.act(env.controller)
            obs, _, terminated, truncated, _ = env.step(action)
            action_count += 1
        winner = env.controller.get_winner()
        if winner is not None and winner.name == env.training_player_name:
            wins += 1
        env.close()
    return wins / n_games
