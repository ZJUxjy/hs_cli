"""Tests for MulliganPolicy."""

from hearthstone.ai.env.mulligan_policy import KeepAll, KeepLowCost


def test_keep_all_returns_empty():
    class C:
        def __init__(self, cost):
            self.cost = cost

    hand = [C(1), C(5), C(7)]
    assert KeepAll().cards_to_mulligan(hand) == []


def test_keep_low_cost_mulligans_high_cost():
    class C:
        def __init__(self, cost, name):
            self.cost, self.name = cost, name

    hand = [C(1, "a"), C(2, "b"), C(5, "c"), C(7, "d")]
    out = KeepLowCost(threshold=3).cards_to_mulligan(hand)
    out_names = [c.name for c in out]
    assert out_names == ["c", "d"]
