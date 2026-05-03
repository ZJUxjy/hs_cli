"""Tests for counterfactual obs synthesis."""
import numpy as np

from hearthstone.ai.env.card_features import SLOT_DIM, encode_hand_card_by_id
from hearthstone.ai.env.counterfactual import synthesize_obs
from hearthstone.ai.env.observation import MAX_HAND, MAX_BOARD


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
    """synthesize_obs returns a deep copy; ALL input keys are unchanged
    after the call (boards, scalars, hand, just_drawn_card)."""
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.full(SLOT_DIM, 0.42, dtype=np.float32)
    obs["player_board"][2] = np.full(SLOT_DIM, 0.5, dtype=np.float32)
    obs["opponent_board"][1] = np.full(SLOT_DIM, 0.7, dtype=np.float32)
    saved = {k: v.copy() for k, v in obs.items()}
    _ = synthesize_obs(obs, draw_slot_idx=3, alt_card_id="CS2_023")
    for k, saved_v in saved.items():
        assert np.array_equal(obs[k], saved_v), (
            f"input obs[{k!r}] was mutated by synthesize_obs"
        )


def test_synthesize_obs_copies_all_other_keys():
    """All non-target keys appear in the output AND are deep-copied
    (output values are independent ndarray instances from input)."""
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.zeros(SLOT_DIM, dtype=np.float32)
    out = synthesize_obs(obs, draw_slot_idx=3, alt_card_id="CS2_023")
    for k in obs:
        assert k in out, f"key {k!r} missing from output"
        # The two write sites are intentionally rebound; for all OTHER
        # keys, output must be a distinct ndarray (writing to out[k]
        # must not corrupt obs[k]).
        if k not in ("player_hand", "just_drawn_card"):
            assert out[k] is not obs[k], (
                f"key {k!r} shares array reference with input — copy failed"
            )


def test_synthesize_obs_asserts_slot_idx_in_range():
    """Asserts on out-of-range draw_slot_idx (defensive vs. fireplace bugs)."""
    import pytest
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.zeros(SLOT_DIM, dtype=np.float32)
    with pytest.raises(AssertionError):
        synthesize_obs(obs, draw_slot_idx=MAX_HAND, alt_card_id="CS2_023")
    with pytest.raises(AssertionError):
        synthesize_obs(obs, draw_slot_idx=-1, alt_card_id="CS2_023")
