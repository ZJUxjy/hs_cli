import pytest


def _snap(p_h=30, p_a=0, o_h=30, o_a=0, p_b=0, o_b=0, ended=False, ps=None):
    from hearthstone.enums import PlayState
    return {
        "p_health": p_h, "p_armor": p_a, "o_health": o_h, "o_armor": o_a,
        "p_board": p_b, "o_board": o_b, "ended": ended,
        "p_playstate": ps if ps is not None else PlayState.PLAYING,
    }


def test_no_change_no_reward():
    from hearthstone.ai.env.reward import RewardFunction
    rf = RewardFunction()
    before = _snap()
    after = _snap()
    assert rf.calc(before, after, training_player=None) == pytest.approx(0.0)


def test_damage_to_opponent_positive_reward():
    from hearthstone.ai.env.reward import RewardFunction
    before = _snap(o_h=30)
    after = _snap(o_h=27)
    r = RewardFunction().calc(before, after, training_player=None)
    assert r == pytest.approx(0.03)


def test_self_damage_negative_reward():
    from hearthstone.ai.env.reward import RewardFunction
    before = _snap(p_h=30)
    after = _snap(p_h=27)
    r = RewardFunction().calc(before, after, training_player=None)
    assert r == pytest.approx(-0.03)


def test_terminal_win():
    from hearthstone.ai.env.reward import RewardFunction
    from hearthstone.enums import PlayState
    before = _snap()
    after = _snap(ended=True, ps=PlayState.WON)
    r = RewardFunction().calc(before, after, training_player=None)
    assert r == pytest.approx(1.0)


def test_terminal_loss():
    from hearthstone.ai.env.reward import RewardFunction
    from hearthstone.enums import PlayState
    before = _snap()
    after = _snap(ended=True, ps=PlayState.LOST)
    r = RewardFunction().calc(before, after, training_player=None)
    assert r == pytest.approx(-1.0)


def test_terminal_tied():
    from hearthstone.ai.env.reward import RewardFunction
    from hearthstone.enums import PlayState
    before = _snap()
    after = _snap(ended=True, ps=PlayState.TIED)
    r = RewardFunction().calc(before, after, training_player=None)
    assert r == pytest.approx(0.0)
