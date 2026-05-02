"""evaluate_pool: greedy-agent vs opponent_factory across a deck pool."""
from __future__ import annotations

from typing import Callable, Optional

from hearthstone.enums import PlayState

from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
from hearthstone.ai.env.opponents import OpponentPolicy, SelfPlayOpponent


DEFAULT_MAX_ACTIONS_PER_GAME = 1000


def evaluate_pool(
    network: PolicyValueNetwork,
    opponent_factory: Callable[[], OpponentPolicy],
    decks: list,
    n_games: int = 100,
    slot_dim: int = 90,
    hidden_dim: int = 128,
    num_actions: int = 512,
    max_actions_per_game: int = DEFAULT_MAX_ACTIONS_PER_GAME,
    seed: Optional[int] = None,
    stratified: bool = True,
) -> dict:
    """Run n_games games sampling deck pairs from `decks`.

    When stratified=True (default), each call generates a fresh shuffle of
    all directed (deck_a, deck_b, training_player_idx) triples and samples
    the first n_games. Per-call shuffle (no cross-call state).

    When stratified=False, every game samples (i, j) ∈ random_pair (no
    mirror) + training_player_idx ∈ {0, 1} independently.

    Returns:
        {
            "winrate": float,        # cap-hit games count as non-wins
            "n_games": int,
            "matchups_seen": int,    # distinct (deck_a, deck_b, tp_idx) triples
            "cap_hit_count": int,
        }
    """
    import random
    rng = random.Random(seed)

    eval_agent = SelfPlayOpponent(
        network_path=None, slot_dim=slot_dim,
        hidden_dim=hidden_dim, num_actions=num_actions,
    )
    eval_agent.network = network
    eval_agent.network.eval()

    n = len(decks)
    if stratified:
        directed = [
            (i, j, k)
            for i in range(n)
            for j in range(n)
            if i != j
            for k in (0, 1)
        ]
        rng.shuffle(directed)
        if n_games > len(directed):
            extra = [
                directed[rng.randrange(len(directed))]
                for _ in range(n_games - len(directed))
            ]
            sampler = directed + extra
        else:
            sampler = directed[:n_games]
    else:
        sampler = []
        for _ in range(n_games):
            i = rng.randrange(n)
            j = rng.randrange(n)
            while j == i:
                j = rng.randrange(n)
            sampler.append((i, j, rng.randrange(2)))

    wins = 0
    cap_hit_count = 0
    seen = set()
    for g, (i, j, tp_idx) in enumerate(sampler):
        env = FireplaceGymEnv(
            decks=[decks[i], decks[j]], pair_strategy="fixed",
            swap_training_player=False, training_player_idx=tp_idx,
            seed=(seed + g) if seed is not None else None,
        )
        opp = opponent_factory()
        env.reset()
        action_count = 0
        while not env.game.ended and action_count < max_actions_per_game:
            if env.game.current_player is env.training_player:
                idx = eval_agent.act(env)
            else:
                idx = opp.act(env)
            env.step(idx)
            action_count += 1
        if action_count >= max_actions_per_game and not env.game.ended:
            cap_hit_count += 1
        elif env.training_player.playstate == PlayState.WON:
            wins += 1
        seen.add((i, j, tp_idx))
        env.close()

    return {
        "winrate": wins / n_games,
        "n_games": n_games,
        "matchups_seen": len(seen),
        "cap_hit_count": cap_hit_count,
    }
