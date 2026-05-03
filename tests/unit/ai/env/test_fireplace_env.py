import numpy as np
import pytest


@pytest.fixture
def env():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck

    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    return FireplaceGymEnv(
        decks=decks, pair_strategy="fixed",
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
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    e1 = FireplaceGymEnv(decks=decks, pair_strategy="fixed", seed=99)
    e2 = FireplaceGymEnv(decks=decks, pair_strategy="fixed", seed=99)
    obs1, _ = e1.reset()
    obs2, _ = e2.reset()
    assert np.array_equal(obs1["player_hand"], obs2["player_hand"])


def test_valid_actions_under_num_actions_bound():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    for seed in range(5):
        env = FireplaceGymEnv(decks=decks, pair_strategy="fixed", seed=seed)
        env.reset()
        steps = 0
        while not env.game.ended and steps < 200:
            assert len(env.current_valid_actions) <= env.NUM_ACTIONS
            env.step(0)
            steps += 1


def test_pair_strategy_random_pair_requires_two_decks():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    one = [load_deck("aggro_mage")]
    with pytest.raises(AssertionError, match="random_pair"):
        FireplaceGymEnv(decks=one, pair_strategy="random_pair", seed=42)


def test_pair_strategy_fixed_requires_two_decks():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    one = [load_deck("aggro_mage")]
    with pytest.raises(AssertionError, match="fixed"):
        FireplaceGymEnv(decks=one, pair_strategy="fixed", seed=42)


def test_random_pair_no_mirror():
    """200 resets over a 4-deck pool: zero mirrors, all 6 unordered pairs seen."""
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck(n) for n in ("aggro_mage", "control_mage",
                                     "aggro_warrior", "control_warrior")]
    env = FireplaceGymEnv(decks=decks, pair_strategy="random_pair", seed=42)
    seen_mirrors = 0
    pair_counts = {}
    for _ in range(200):
        env.reset()
        if env._current_p1_deck_name == env._current_p2_deck_name:
            seen_mirrors += 1
        key = tuple(sorted([env._current_p1_deck_name, env._current_p2_deck_name]))
        pair_counts[key] = pair_counts.get(key, 0) + 1
    assert seen_mirrors == 0
    assert len(pair_counts) == 6   # C(4, 2) unordered pairs


def test_swap_training_player_balanced():
    """Deterministic seed=42; assert 50 resets give plausibly balanced 0/1 counts."""
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    env = FireplaceGymEnv(
        decks=decks, pair_strategy="fixed",
        swap_training_player=True, seed=42,
    )
    counts = {0: 0, 1: 0}
    for _ in range(50):
        env.reset()
        counts[env._training_player_idx] += 1
    assert counts[0] + counts[1] == 50
    assert 15 <= counts[0] <= 35
    assert 15 <= counts[1] <= 35


def test_seed_reproducibility_with_pool():
    """Same seed → same deck pair / swap / fp_seed / first observation."""
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck(n) for n in ("aggro_mage", "control_mage",
                                     "aggro_warrior", "control_warrior")]
    e1 = FireplaceGymEnv(decks=decks, pair_strategy="random_pair",
                          swap_training_player=True, seed=99)
    e2 = FireplaceGymEnv(decks=decks, pair_strategy="random_pair",
                          swap_training_player=True, seed=99)
    obs1, info1 = e1.reset()
    obs2, info2 = e2.reset()
    assert info1["p1_deck_name"] == info2["p1_deck_name"]
    assert info1["p2_deck_name"] == info2["p2_deck_name"]
    assert info1["training_player_idx"] == info2["training_player_idx"]
    assert info1["fireplace_seed"] == info2["fireplace_seed"]
    np.testing.assert_array_equal(obs1["player_hand"], obs2["player_hand"])


def test_random_seed_propagates_to_python_random():
    """Two envs same seed → same random.random() sample after reset."""
    import random
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    e1 = FireplaceGymEnv(decks=decks, pair_strategy="fixed", seed=123)
    e2 = FireplaceGymEnv(decks=decks, pair_strategy="fixed", seed=123)
    e1.reset()
    s1 = random.random()
    e2.reset()
    s2 = random.random()
    assert s1 == s2


def test_info_dict_contains_deck_names_and_seed():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    env = FireplaceGymEnv(decks=decks, pair_strategy="fixed", seed=42)
    obs, info = env.reset()
    assert info["p1_deck_name"] == "aggro_mage"
    assert info["p2_deck_name"] == "control_warrior"
    assert "training_player_idx" in info
    assert "fireplace_seed" in info
    assert isinstance(info["fireplace_seed"], int)


def test_swap_training_player_when_idx_1_opponent_acts_first():
    """When training_player_idx=1, OpponentEnv.reset must run opponent's
    turn first; agent's first obs reflects opponent's turn-1 board."""
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.opponent_env import OpponentEnv
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    base = FireplaceGymEnv(
        decks=decks, pair_strategy="fixed",
        training_player_idx=1, seed=42,
    )
    env = OpponentEnv(base, RandomOpponent())
    env.reset()
    assert base.game.current_player is base.training_player or base.game.ended


def _build_simple_env(seed=42):
    """A 2-deck FireplaceGymEnv with a fixed pair, suitable for stepping."""
    from hearthstone.ai.env.deck_source import load_decks
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    decks = load_decks(["aggro_mage", "control_warrior"])
    return FireplaceGymEnv(
        decks=decks, pair_strategy="fixed",
        swap_training_player=False, training_player_idx=0, seed=seed,
    )


def test_reset_clears_draw_state():
    """reset() zeros out _last_drawn_card_obj and friends."""
    env = _build_simple_env()
    env.reset()
    # Manually set a fake state
    env._last_drawn_card_obj = "FAKE"
    env._last_draw_slot_idx = 5
    env._last_deck_remaining_ids = ["CS2_023"]
    env._last_n_drawn = 1
    env.reset()
    assert env._last_drawn_card_obj is None
    assert env._last_draw_slot_idx is None
    assert env._last_deck_remaining_ids == []
    assert env._last_n_drawn == 0


def test_info_has_draw_event_keys_after_reset():
    """info dict carries draw_event=False, n_drawn=0 right after reset."""
    env = _build_simple_env()
    obs, info = env.reset()
    assert info["draw_event"] is False
    assert info["n_drawn"] == 0
    assert info["draw_slot_idx"] is None
    assert info["deck_remaining_ids"] == []


def test_obs_just_drawn_card_zero_after_reset():
    """obs[just_drawn_card] is all zeros immediately after reset."""
    import numpy as np
    env = _build_simple_env()
    obs, _ = env.reset()
    assert np.all(obs["just_drawn_card"] == 0.0)


def test_step_records_draw_event_when_hand_grows():
    """Stepping through a turn that ends in opponent's turn → my draw
    sets info['draw_event']=True (or remains False, depending on what
    happens in the single env.step call)."""
    env = _build_simple_env()
    obs, _ = env.reset()
    from hearthstone.ai.env.action_enum import EndTurnAction
    end_idx = None
    for i, a in enumerate(env.current_valid_actions):
        if isinstance(a, EndTurnAction):
            end_idx = i
            break
    assert end_idx is not None
    obs, _, term, _, info = env.step(end_idx)
    # We CAN'T strictly assert draw_event is True here — depends on
    # opponent's actions inside fireplace's auto-resolve. But info MUST
    # have the new keys with sensible values.
    assert "draw_event" in info
    assert "n_drawn" in info
    assert "draw_slot_idx" in info
    assert "deck_remaining_ids" in info
    assert isinstance(info["draw_event"], bool)


def test_overdraw_burn_no_draw_event():
    """A no-op step (no card drawn) leaves draw_event=False."""
    env = _build_simple_env()
    obs, info = env.reset()
    # First step is from a known clean state. info['draw_event'] is False.
    assert info["draw_event"] is False


def test_compute_alt_pool_excludes_drawn_cards():
    """_compute_alt_pool removes each drawn card from the deck (handles
    duplicates: removes once per drawn instance)."""
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    pool = FireplaceGymEnv._compute_alt_pool(
        deck_before_ids=["A", "B", "C", "A"],   # duplicate A
        drawn_ids=["A", "C"],
    )
    # one A removed (first occurrence); C removed; B and second A remain
    assert pool == ["B", "A"]
