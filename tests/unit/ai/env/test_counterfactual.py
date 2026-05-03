"""Tests for counterfactual obs synthesis."""
import numpy as np

from hearthstone.ai.env.card_features import SLOT_DIM, encode_hand_card_by_id
from hearthstone.ai.env.counterfactual import synthesize_obs
from hearthstone.ai.env.observation import OBS_KEYS, MAX_HAND, MAX_BOARD


def _make_dummy_obs():
    """A minimal obs dict matching observation_space."""
    obs = {
        "player_hand": np.zeros((MAX_HAND, SLOT_DIM), dtype=np.float32),
        "player_board": np.zeros((MAX_BOARD, SLOT_DIM), dtype=np.float32),
        "opponent_board": np.zeros((MAX_BOARD, SLOT_DIM), dtype=np.float32),
    }
    # Existing scalar keys present at runtime (kept minimal here; synthesize_obs
    # must copy ALL keys, not just the 3 above).
    for k in (
        "player_health", "player_mana", "is_my_turn",
    ):
        obs[k] = np.array([0.5], dtype=np.float32)
    return obs


def test_synthesize_obs_replaces_hand_slot():
    """The hand slot at draw_slot_idx is replaced with the encoded alt card."""
    obs = _make_dummy_obs()
    obs["player_hand"][3] = np.full(SLOT_DIM, 0.99, dtype=np.float32)  # marker
    out = synthesize_obs(obs, draw_slot_idx=3, alt_card_id="CS2_023")
    expected_enc = encode_hand_card_by_id("CS2_023")
    assert np.array_equal(out["player_hand"][3], expected_enc)


def test_synthesize_obs_preserves_other_hand_slots():
    """Non-target hand slots are left unchanged."""
    obs = _make_dummy_obs()
    obs["player_hand"][0] = np.full(SLOT_DIM, 0.7, dtype=np.float32)
    obs["player_hand"][7] = np.full(SLOT_DIM, 0.3, dtype=np.float32)
    out = synthesize_obs(obs, draw_slot_idx=3, alt_card_id="CS2_023")
    assert np.array_equal(out["player_hand"][0], obs["player_hand"][0])
    assert np.array_equal(out["player_hand"][7], obs["player_hand"][7])


def test_synthesize_obs_replaces_just_drawn_card():
    """The just_drawn_card field is replaced with the encoded alt card."""
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.full(SLOT_DIM, 0.99, dtype=np.float32)
    out = synthesize_obs(obs, draw_slot_idx=3, alt_card_id="CS2_023")
    expected_enc = encode_hand_card_by_id("CS2_023")
    assert np.array_equal(out["just_drawn_card"], expected_enc)


def test_synthesize_obs_does_not_mutate_input():
    """synthesize_obs returns a deep copy; the input obs is untouched."""
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.zeros(SLOT_DIM, dtype=np.float32)
    obs_hand_before = obs["player_hand"][3].copy()
    obs_drawn_before = obs["just_drawn_card"].copy()
    _ = synthesize_obs(obs, draw_slot_idx=3, alt_card_id="CS2_023")
    assert np.array_equal(obs["player_hand"][3], obs_hand_before)
    assert np.array_equal(obs["just_drawn_card"], obs_drawn_before)


def test_synthesize_obs_copies_all_other_keys():
    """All non-target keys appear in the output (deep-copied)."""
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.zeros(SLOT_DIM, dtype=np.float32)
    out = synthesize_obs(obs, draw_slot_idx=3, alt_card_id="CS2_023")
    for k in obs:
        assert k in out


def test_synthesize_obs_asserts_slot_idx_in_range():
    """Asserts on out-of-range draw_slot_idx (defensive vs. fireplace bugs)."""
    import pytest
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.zeros(SLOT_DIM, dtype=np.float32)
    with pytest.raises(AssertionError):
        synthesize_obs(obs, draw_slot_idx=MAX_HAND, alt_card_id="CS2_023")
    with pytest.raises(AssertionError):
        synthesize_obs(obs, draw_slot_idx=-1, alt_card_id="CS2_023")
