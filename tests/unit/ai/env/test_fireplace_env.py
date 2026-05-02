import numpy as np
import pytest


@pytest.fixture
def env():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck

    deck_a = load_deck("aggro_mage")
    deck_b = load_deck("control_warrior")
    # Adapt new Deck dataclass to legacy FireplaceGymEnv tuple signature.
    # Phase C.1 will switch the env to take Deck instances directly.
    return FireplaceGymEnv(
        deck1=list(deck_a.card_ids), deck2=list(deck_b.card_ids),
        hero1=deck_a.hero_id, hero2=deck_b.hero_id,
        training_player_idx=0, seed=42,
    )


def test_reset_returns_obs_and_info(env):
    obs, info = env.reset()
    assert isinstance(obs, dict)
    assert env.observation_space.contains(obs)


def test_reset_resolves_mulligan(env):
    env.reset()
    for p in env.game.players:
        assert p.choice is None


def test_reset_endturn_at_index_zero(env):
    from hearthstone.ai.env.action_enum import EndTurnAction
    env.reset()
    assert isinstance(env.current_valid_actions[0], EndTurnAction)


def test_step_invalid_action_returns_negative_reward(env):
    env.reset()
    n = len(env.current_valid_actions)
    obs, reward, term, trunc, info = env.step(n + 100)
    assert reward == pytest.approx(-0.01)
    assert info["invalid_action"]


def test_step_end_turn_advances_state(env):
    env.reset()
    obs0_summary = float(env._build_observation()["turn_number"][0])
    env.step(0)
    obs1_summary = float(env._build_observation()["turn_number"][0])
    assert obs1_summary >= obs0_summary


def test_seed_reproducibility():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    deck_a = load_deck("aggro_mage")
    deck_b = load_deck("control_warrior")
    c1, h1 = list(deck_a.card_ids), deck_a.hero_id
    c2, h2 = list(deck_b.card_ids), deck_b.hero_id
    e1 = FireplaceGymEnv(c1, c2, h1, h2, seed=99)
    e2 = FireplaceGymEnv(c1, c2, h1, h2, seed=99)
    obs1, _ = e1.reset()
    obs2, _ = e2.reset()
    assert np.array_equal(obs1["player_hand"], obs2["player_hand"])


def test_valid_actions_under_num_actions_bound():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    deck_a = load_deck("aggro_mage")
    deck_b = load_deck("control_warrior")
    c1, h1 = list(deck_a.card_ids), deck_a.hero_id
    c2, h2 = list(deck_b.card_ids), deck_b.hero_id
    for seed in range(5):
        env = FireplaceGymEnv(c1, c2, h1, h2, seed=seed)
        env.reset()
        steps = 0
        while not env.game.ended and steps < 200:
            assert len(env.current_valid_actions) <= env.NUM_ACTIONS
            env.step(0)
            steps += 1
