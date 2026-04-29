"""Tests for evaluate()."""
import numpy as np
import pytest
from hearthstone.ai.evaluate import evaluate
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.opponents import RandomOpponent


def test_winrate_in_zero_one_range():
    """Untrained network vs random opponent: winrate is some float in [0, 1]."""
    net = PolicyValueNetwork()
    winrate = evaluate(
        network=net,
        opponent_factory=lambda: RandomOpponent(seed=0),
        n_games=4,
        deck1="test_deck", deck2="test_deck",
        training_player_name="Player 1",
    )
    assert 0.0 <= winrate <= 1.0


def test_returns_float():
    net = PolicyValueNetwork()
    winrate = evaluate(
        network=net,
        opponent_factory=lambda: RandomOpponent(seed=0),
        n_games=2,
        deck1="test_deck", deck2="test_deck",
        training_player_name="Player 1",
    )
    assert isinstance(winrate, float)


def test_two_runs_with_same_seed_produce_same_result():
    """Greedy agent + seeded opponent → fully deterministic."""
    net = PolicyValueNetwork()
    # Set network to eval to fix any dropout etc. (PolicyValueNetwork has none, but be safe)
    net.eval()
    w1 = evaluate(
        network=net,
        opponent_factory=lambda: RandomOpponent(seed=123),
        n_games=4,
        deck1="test_deck", deck2="test_deck",
        training_player_name="Player 1",
    )
    w2 = evaluate(
        network=net,
        opponent_factory=lambda: RandomOpponent(seed=123),
        n_games=4,
        deck1="test_deck", deck2="test_deck",
        training_player_name="Player 1",
    )
    assert w1 == w2
