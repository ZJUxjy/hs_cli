"""Tests for ChooseOnePolicy."""

from hearthstone.ai.env.choose_one_policy import FirstChoiceOne


def test_first_choice_one_picks_first():
    class FakeCard:
        choose_cards = ["A", "B", "C"]

    pick = FirstChoiceOne().choose(FakeCard())
    assert pick == "A"
