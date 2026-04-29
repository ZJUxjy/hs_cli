"""Tests for opponent policies."""
import pytest
from hearthstone.ai.opponents import OpponentPolicy, RandomOpponent
from hearthstone.ai.gym_env import HearthstoneEnv


def _fresh_env():
    return HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")


class TestRandomOpponent:
    def test_returns_index_within_valid_actions(self):
        opp = RandomOpponent(seed=42)
        env = _fresh_env()
        env.reset()
        # Random opponent should always return a valid index over many calls
        for _ in range(50):
            valid = env.controller.get_valid_actions()
            if not valid:
                continue
            action = opp.act(env.controller)
            assert 0 <= action < len(valid)
        env.close()

    def test_no_valid_actions_returns_zero(self):
        """When valid_actions is empty, fall back to 0 instead of crashing."""
        class EmptyController:
            def get_valid_actions(self):
                return []
        opp = RandomOpponent()
        assert opp.act(EmptyController()) == 0

    def test_seeded_is_deterministic(self):
        env1 = _fresh_env(); env1.reset()
        env2 = _fresh_env(); env2.reset()
        opp1 = RandomOpponent(seed=123)
        opp2 = RandomOpponent(seed=123)
        a1 = opp1.act(env1.controller)
        a2 = opp2.act(env2.controller)
        assert a1 == a2
        env1.close(); env2.close()


def test_opponent_policy_act_is_abstract():
    """OpponentPolicy.act() should raise NotImplementedError."""
    base = OpponentPolicy()
    with pytest.raises(NotImplementedError):
        base.act(None)
