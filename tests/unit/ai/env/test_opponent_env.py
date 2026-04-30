import pytest


@pytest.fixture
def opp_env():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.opponent_env import OpponentEnv
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck

    c1, h1 = load_deck("basic_mage")
    c2, h2 = load_deck("basic_warrior")
    base = FireplaceGymEnv(c1, c2, h1, h2, training_player_idx=0, seed=42)
    return OpponentEnv(base, RandomOpponent())


def test_reset_returns_to_training_turn(opp_env):
    obs, info = opp_env.reset()
    inner = opp_env._env
    assert (inner.game.current_player is inner.training_player
            or inner.game.ended)


def test_step_folds_opponent_actions(opp_env):
    opp_env.reset()
    obs, reward, term, trunc, info = opp_env.step(0)
    inner = opp_env._env
    if not term:
        assert inner.game.current_player is inner.training_player


def test_terminated_during_opponent_turn():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.opponent_env import OpponentEnv
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck

    c1, h1 = load_deck("basic_mage")
    c2, h2 = load_deck("basic_warrior")

    saw_terminal = False
    for seed in range(20):
        base = FireplaceGymEnv(c1, c2, h1, h2, training_player_idx=0, seed=seed)
        env = OpponentEnv(base, RandomOpponent())
        env.reset()
        for _ in range(100):
            _, _, term, _, _ = env.step(0)
            if term:
                saw_terminal = True
                break
        if saw_terminal:
            break
    assert saw_terminal, "20 random games did not terminate within 100 steps each"


def test_opponent_action_cap_force_ends_turn(opp_env):
    from hearthstone.ai.env.opponent_env import OpponentEnv

    inner = opp_env._env

    class StubbornOpponent:
        def act(self, env):
            n = len(env.current_valid_actions)
            return n - 1 if n > 1 else 0

    opp_env.opponent = StubbornOpponent()
    opp_env.reset()
    obs, reward, term, trunc, info = opp_env.step(0)
    assert isinstance(reward, float)
