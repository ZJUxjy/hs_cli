"""Tests for DiscoverPolicy."""

from hearthstone.ai.env.discover_policy import FirstOption, LowestCost


def test_first_option_picks_first():
    options = ["x", "y", "z"]
    assert FirstOption().choose(options) == "x"


def test_lowest_cost_picks_min():
    class C:
        def __init__(self, cost):
            self.cost = cost

    options = [C(5), C(2), C(8)]
    assert LowestCost().choose(options).cost == 2
