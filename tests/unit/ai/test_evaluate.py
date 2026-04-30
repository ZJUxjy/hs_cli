"""Tests for evaluate()."""
from hearthstone.ai.evaluate import evaluate
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.env.opponents import RandomOpponent
from hearthstone.ai.env.deck_source import load_deck


def test_evaluate_returns_winrate_in_range():
    net = PolicyValueNetwork(slot_dim=90, hidden_dim=64, num_actions=512)
    c1, h1 = load_deck("basic_mage")
    c2, h2 = load_deck("basic_warrior")
    rate = evaluate(
        network=net, opponent_factory=lambda: RandomOpponent(),
        n_games=2, deck1=c1, deck2=c2, hero1=h1, hero2=h2,
        max_actions_per_game=200,
    )
    assert 0.0 <= rate <= 1.0
