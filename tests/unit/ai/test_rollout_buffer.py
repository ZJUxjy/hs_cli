"""Tests for RolloutBuffer."""
import numpy as np
import pytest
from hearthstone.ai.rollout_buffer import RolloutBuffer


def make_dummy_obs():
    return {
        "player_hand": np.zeros((10, 64), dtype=np.float32),
        "player_board": np.zeros((7, 64), dtype=np.float32),
        "opponent_board": np.zeros((7, 64), dtype=np.float32),
        "player_health": np.array([30.0], dtype=np.float32),
        "player_mana": np.array([5.0], dtype=np.float32),
        "player_max_mana": np.array([5.0], dtype=np.float32),
        "player_hand_size": np.array([3.0], dtype=np.float32),
        "player_board_size": np.array([2.0], dtype=np.float32),
        "opponent_health": np.array([30.0], dtype=np.float32),
        "opponent_board_size": np.array([0.0], dtype=np.float32),
        "turn_number": np.array([3.0], dtype=np.float32),
        "player_deck_size": np.array([20.0], dtype=np.float32),
    }


class TestRolloutBuffer:
    def test_initial_length_zero(self):
        buf = RolloutBuffer(capacity=64)
        assert len(buf) == 0

    def test_add_increments_length(self):
        buf = RolloutBuffer(capacity=64)
        buf.add(make_dummy_obs(), action=0, reward=0.1, value=0.5, log_prob=-1.0, done=False)
        assert len(buf) == 1

    def test_full_buffer_rejects_add(self):
        buf = RolloutBuffer(capacity=2)
        for _ in range(2):
            buf.add(make_dummy_obs(), 0, 0.1, 0.5, -1.0, False)
        with pytest.raises(RuntimeError, match="full"):
            buf.add(make_dummy_obs(), 0, 0.1, 0.5, -1.0, False)

    def test_compute_returns_and_advantages_shapes(self):
        buf = RolloutBuffer(capacity=10, gamma=0.99, gae_lambda=0.95)
        for i in range(5):
            buf.add(make_dummy_obs(), action=i, reward=float(i) * 0.1,
                    value=0.5, log_prob=-1.0, done=(i == 4))
        buf.compute_returns_and_advantages(last_value=0.0)
        batch = buf.get()
        assert batch["advantages"].shape == (5,)
        assert batch["returns"].shape == (5,)
        assert batch["actions"].shape == (5,)
        assert batch["old_log_probs"].shape == (5,)
        assert batch["player_health"].shape == (5, 1)

    def test_advantages_are_normalized_by_default(self):
        buf = RolloutBuffer(capacity=20, gamma=0.99, gae_lambda=0.95)
        for i in range(20):
            buf.add(make_dummy_obs(), action=0, reward=float(i),
                    value=0.0, log_prob=-1.0, done=(i == 19))
        buf.compute_returns_and_advantages(last_value=0.0)
        batch = buf.get(normalize_advantages=True)
        adv = batch["advantages"]
        assert abs(adv.mean()) < 1e-5
        assert abs(adv.std() - 1.0) < 1e-3

    def test_gae_terminal_zeros_bootstrap(self):
        """When done=True at last step, bootstrap value should not propagate."""
        buf = RolloutBuffer(capacity=3, gamma=1.0, gae_lambda=1.0)
        buf.add(make_dummy_obs(), 0, reward=1.0, value=0.0, log_prob=-1.0, done=True)
        buf.compute_returns_and_advantages(last_value=999.0)  # should be ignored
        batch = buf.get(normalize_advantages=False)
        assert abs(batch["advantages"][0] - 1.0) < 1e-6
        assert abs(batch["returns"][0] - 1.0) < 1e-6

    def test_reset_clears_buffer(self):
        buf = RolloutBuffer(capacity=10)
        buf.add(make_dummy_obs(), 0, 0.1, 0.5, -1.0, False)
        buf.reset()
        assert len(buf) == 0

    def test_get_on_empty_buffer_raises(self):
        """get() should raise RuntimeError with clear message when buffer is empty."""
        buf = RolloutBuffer(capacity=10)
        buf.compute_returns_and_advantages(0.0)  # succeeds silently
        with pytest.raises(RuntimeError, match="empty"):
            buf.get()

    def test_get_before_compute_raises(self):
        buf = RolloutBuffer(capacity=10)
        buf.add(make_dummy_obs(), 0, 0.1, 0.5, -1.0, False)
        with pytest.raises(RuntimeError, match="compute_returns_and_advantages"):
            buf.get()


def test_aux_target_aux_mask_round_trip():
    """add() with aux kwargs → get() returns them in batch dict."""
    import numpy as np
    from hearthstone.ai.rollout_buffer import RolloutBuffer
    buf = RolloutBuffer(capacity=4, gamma=0.99, gae_lambda=0.95)
    obs = {
        "player_hand": np.zeros((10, 90), dtype=np.float32),
        "player_board": np.zeros((7, 90), dtype=np.float32),
        "opponent_board": np.zeros((7, 90), dtype=np.float32),
        "just_drawn_card": np.zeros((90,), dtype=np.float32),
        "is_my_turn": np.array([1.0], dtype=np.float32),
    }
    buf.add(obs, action=0, reward=0.0, value=0.5, log_prob=-1.0, done=False,
            aux_target=0.7, aux_mask=True)
    buf.add(obs, action=0, reward=0.0, value=0.5, log_prob=-1.0, done=False,
            aux_target=0.0, aux_mask=False)
    buf.compute_returns_and_advantages(last_value=0.0)
    batch = buf.get(normalize_advantages=False)
    assert "aux_target" in batch and "aux_mask" in batch
    np.testing.assert_array_equal(batch["aux_target"], np.array([0.7, 0.0], dtype=np.float32))
    np.testing.assert_array_equal(batch["aux_mask"], np.array([True, False]))


def test_aux_defaults_to_zero_and_false():
    """add() without aux kwargs → aux_target=0, aux_mask=False."""
    import numpy as np
    from hearthstone.ai.rollout_buffer import RolloutBuffer
    buf = RolloutBuffer(capacity=4, gamma=0.99, gae_lambda=0.95)
    obs = {
        "player_hand": np.zeros((10, 90), dtype=np.float32),
        "player_board": np.zeros((7, 90), dtype=np.float32),
        "opponent_board": np.zeros((7, 90), dtype=np.float32),
        "just_drawn_card": np.zeros((90,), dtype=np.float32),
        "is_my_turn": np.array([1.0], dtype=np.float32),
    }
    buf.add(obs, action=0, reward=0.0, value=0.0, log_prob=0.0, done=False)
    buf.compute_returns_and_advantages(last_value=0.0)
    batch = buf.get(normalize_advantages=False)
    assert batch["aux_target"][0] == 0.0
    assert batch["aux_mask"][0] == False


def test_reset_clears_aux_fields():
    """reset() clears aux_target and aux_mask along with everything else."""
    import numpy as np
    from hearthstone.ai.rollout_buffer import RolloutBuffer
    buf = RolloutBuffer(capacity=4, gamma=0.99, gae_lambda=0.95)
    obs = {
        "player_hand": np.zeros((10, 90), dtype=np.float32),
        "player_board": np.zeros((7, 90), dtype=np.float32),
        "opponent_board": np.zeros((7, 90), dtype=np.float32),
        "just_drawn_card": np.zeros((90,), dtype=np.float32),
        "is_my_turn": np.array([1.0], dtype=np.float32),
    }
    buf.add(obs, action=0, reward=0.0, value=0.5, log_prob=-1.0, done=False,
            aux_target=1.0, aux_mask=True)
    buf.reset()
    assert buf._aux_target == []
    assert buf._aux_mask == []
