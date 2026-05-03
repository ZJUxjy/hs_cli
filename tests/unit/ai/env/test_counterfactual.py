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


import random
import torch

from hearthstone.ai.env.counterfactual import sample_counterfactual_baseline


class _StubNetwork:
    """Returns 3-tuple where value is a constant Tensor of shape (B, 1).
    Mimics the post-S2-B network forward signature."""

    def __init__(self, return_value: float = 0.42):
        self._v = float(return_value)
        self.calls = []

    def __call__(self, obs_batch):
        self.calls.append(obs_batch)
        b = obs_batch["player_hand"].shape[0]
        logits = torch.zeros(b, 512)
        values = torch.full((b, 1), self._v)
        aux = torch.zeros(b, 1)
        return logits, values, aux


class _VaryingStubNetwork:
    """Returns 3-tuple where each row of `values` is a distinct, predictable
    number (row i → 0.1 * (i + 1)). Used to verify that
    sample_counterfactual_baseline computes the MEAN — a constant stub
    can't distinguish mean() from values[0]."""

    def __init__(self):
        self.calls = []

    def __call__(self, obs_batch):
        self.calls.append(obs_batch)
        b = obs_batch["player_hand"].shape[0]
        logits = torch.zeros(b, 512)
        # Row i → 0.1 * (i + 1): [0.1, 0.2, 0.3, 0.4, ...]
        values = torch.tensor(
            [[0.1 * (i + 1)] for i in range(b)], dtype=torch.float32,
        )
        aux = torch.zeros(b, 1)
        return logits, values, aux


def test_sample_counterfactual_baseline_returns_zero_when_no_alts():
    """No alternatives in deck → baseline=0.0, n_sampled=0."""
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.zeros(SLOT_DIM, dtype=np.float32)
    info = {"deck_remaining_ids": [], "draw_slot_idx": 3}
    net = _StubNetwork(return_value=1.0)
    baseline, n = sample_counterfactual_baseline(
        obs, info, network=net, device="cpu", K=4,
    )
    assert baseline == 0.0
    assert n == 0
    assert net.calls == []


def test_sample_counterfactual_baseline_returns_zero_when_slot_none():
    """Missing draw_slot_idx → no synthesis."""
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.zeros(SLOT_DIM, dtype=np.float32)
    info = {"deck_remaining_ids": ["CS2_023"], "draw_slot_idx": None}
    net = _StubNetwork()
    baseline, n = sample_counterfactual_baseline(
        obs, info, network=net, device="cpu", K=4,
    )
    assert baseline == 0.0
    assert n == 0


def test_sample_counterfactual_baseline_caps_K_at_deck_size():
    """When K > len(deck_remaining), n_sampled = len(deck_remaining)."""
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.zeros(SLOT_DIM, dtype=np.float32)
    info = {"deck_remaining_ids": ["CS2_023", "CS2_024"], "draw_slot_idx": 3}
    net = _StubNetwork(return_value=0.7)
    baseline, n = sample_counterfactual_baseline(
        obs, info, network=net, device="cpu", K=4,
        rng=random.Random(0),
    )
    assert n == 2
    assert abs(baseline - 0.7) < 1e-6


def test_sample_counterfactual_baseline_uses_batched_forward():
    """The K alts are batched into a single network call (not K calls)."""
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.zeros(SLOT_DIM, dtype=np.float32)
    info = {
        "deck_remaining_ids": ["CS2_023", "CS2_024", "CS2_025", "CS2_026"],
        "draw_slot_idx": 3,
    }
    net = _StubNetwork()
    sample_counterfactual_baseline(
        obs, info, network=net, device="cpu", K=4,
        rng=random.Random(0),
    )
    assert len(net.calls) == 1, (
        f"Expected 1 batched forward call, got {len(net.calls)}"
    )
    assert net.calls[0]["player_hand"].shape[0] == 4


def test_sample_counterfactual_baseline_returns_mean_value():
    """Baseline = mean of the K values returned by network forward."""
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.zeros(SLOT_DIM, dtype=np.float32)
    info = {
        "deck_remaining_ids": ["CS2_023", "CS2_024", "CS2_025", "CS2_026"],
        "draw_slot_idx": 3,
    }
    net = _StubNetwork(return_value=0.25)
    baseline, n = sample_counterfactual_baseline(
        obs, info, network=net, device="cpu", K=4,
        rng=random.Random(0),
    )
    assert n == 4
    assert abs(baseline - 0.25) < 1e-6


def test_sample_counterfactual_baseline_actually_means_not_first_or_last():
    """Use a varying-value stub so mean() can be distinguished from
    values[0] / values[-1] / values.max() / values.min(). With 4 values
    [0.1, 0.2, 0.3, 0.4], mean=0.25, first=0.1, last=0.4, max=0.4,
    min=0.1. Only mean() produces 0.25."""
    obs = _make_dummy_obs()
    obs["just_drawn_card"] = np.zeros(SLOT_DIM, dtype=np.float32)
    info = {
        "deck_remaining_ids": ["CS2_023", "CS2_024", "CS2_025", "CS2_026"],
        "draw_slot_idx": 3,
    }
    net = _VaryingStubNetwork()
    baseline, n = sample_counterfactual_baseline(
        obs, info, network=net, device="cpu", K=4,
        rng=random.Random(0),
    )
    assert n == 4
    # mean of [0.1, 0.2, 0.3, 0.4] = 0.25
    assert abs(baseline - 0.25) < 1e-6, (
        f"baseline={baseline} — expected 0.25 (mean). "
        f"If 0.1: returns first; if 0.4: returns last/max; "
        f"if 1.0: returns sum, not mean."
    )
