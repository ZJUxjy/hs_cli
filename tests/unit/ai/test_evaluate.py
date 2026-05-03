"""Tests for evaluate_pool."""
import pytest


@pytest.fixture(scope="module", autouse=True)
def _init_cards_db():
    from fireplace import cards
    cards.db.initialize()


def test_evaluate_pool_returns_dict_with_required_keys():
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.evaluate import evaluate_pool
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck

    net = PolicyValueNetwork(slot_dim=90, hidden_dim=64, num_actions=512)
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    result = evaluate_pool(
        network=net, opponent_factory=lambda: RandomOpponent(),
        decks=decks, n_games=2, max_actions_per_game=100, seed=1,
        hidden_dim=64,
    )
    assert set(result.keys()) >= {"winrate", "n_games", "matchups_seen", "cap_hit_count"}
    assert 0.0 <= result["winrate"] <= 1.0
    assert result["n_games"] == 2
    assert result["matchups_seen"] >= 1
    assert result["cap_hit_count"] >= 0


def test_evaluate_pool_cap_hit_counted():
    """Tight cap forces cap-hits; cap_hit_count > 0."""
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.evaluate import evaluate_pool
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck

    net = PolicyValueNetwork(slot_dim=90, hidden_dim=64, num_actions=512)
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    result = evaluate_pool(
        network=net, opponent_factory=lambda: RandomOpponent(),
        decks=decks, n_games=2, max_actions_per_game=10,    # very tight
        seed=1, hidden_dim=64,
    )
    assert result["cap_hit_count"] >= 1


def test_evaluate_pool_returns_mean_abs_draw_advantage_key():
    """The result dict gains mean_abs_draw_advantage and n_draw_events keys."""
    from hearthstone.ai.evaluate import evaluate_pool
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.env.deck_source import load_decks
    from hearthstone.ai.env.opponents import RandomOpponent

    net = PolicyValueNetwork()
    decks = load_decks(["aggro_mage", "control_warrior"])
    result = evaluate_pool(
        network=net,
        opponent_factory=lambda: RandomOpponent(),
        decks=decks, n_games=2, max_actions_per_game=100, seed=42,
    )
    assert "mean_abs_draw_advantage" in result
    assert "n_draw_events" in result
    assert isinstance(result["mean_abs_draw_advantage"], float)
    assert isinstance(result["n_draw_events"], int)


def test_evaluate_pool_aux_stays_finite_with_random_init():
    """Random-init aux_head + 2 short games: the mean is finite (no NaN);
    n_draw_events is non-negative."""
    from hearthstone.ai.evaluate import evaluate_pool
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.env.deck_source import load_decks
    from hearthstone.ai.env.opponents import RandomOpponent
    import math

    net = PolicyValueNetwork()
    decks = load_decks(["aggro_mage", "control_warrior"])
    result = evaluate_pool(
        network=net,
        opponent_factory=lambda: RandomOpponent(),
        decks=decks, n_games=2, max_actions_per_game=100, seed=42,
    )
    assert math.isfinite(result["mean_abs_draw_advantage"])
    assert result["n_draw_events"] >= 0
