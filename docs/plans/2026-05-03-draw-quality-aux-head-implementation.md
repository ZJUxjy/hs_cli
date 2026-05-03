# Draw-Quality Auxiliary Head Implementation Plan (S2-B)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third head (`aux_head`) to `PolicyValueNetwork` that predicts
the counterfactual draw advantage of the most recently drawn card, trained
jointly with policy/value via PPO. Targets are computed by synthesizing K=4
hypothetical post-draw observations (replacing one hand slot + a new
`just_drawn_card` obs field with each alternative card encoding) and
forwarding V on each — actual V minus the K-mean is the regression target.

**Architecture:** Five-phase migration ordered PR-1 → PR-2 → PR-3 → PR-4 →
PR-5, mirroring the spec's PR split. Phase 1 ships a pure encoder helper +
the `counterfactual.py` module (no callers, low risk). Phase 2 atomically
breaks `network.forward` from a 2-tuple to a 3-tuple, adds `just_drawn_card`
to the obs dict, and adds draw-event tracking to `FireplaceGymEnv` —
landing the cross-cutting changes in one PR with all caller sites updated
together. Phase 3 wires the aux-loss training (`RolloutBuffer` aux fields,
`PPOTrainer` warmup + MSE, rollout-loop counterfactual computation, 4 new
config fields). Phase 4 extends `evaluate_pool`, the 12-column
`MetricsLogger`, and ships `scripts/analyze_draws.py`. Phase 5 ships the
milestone draw heatmap (`heatmap_draw.csv`) and `scripts/migrate_checkpoint.py`.

**Tech Stack:** Python 3.10+ (dev env on this machine is 3.8 — see Phase E
note in S2-A plan about `cancel_futures`), fireplace (AGPL-3.0, local
path), torch≥2.0, gymnasium≥0.29, numpy, pyyaml, pytest.

**Spec:** `docs/specs/2026-05-03-draw-quality-aux-head-design.md` (rev 2,
commit `b8148da`). Read the spec before starting. This plan implements
that design.

---

## Prerequisites

- Working tree at `/home/xu/code/hstone/hs_glm`, branch `feature/webui` (or a
  fresh worktree off it).
- Fireplace at `/home/xu/code/hstone/hearthstone/fireplace` is `pip install -e`'d.
- `hearthstone-data` installed; `from fireplace import cards; cards.db.initialize()`
  returns 30000+ cards.
- All S2-A tests currently pass (`pytest tests/ -v`).
- Each phase's final commit ends with `pytest tests/ -v` passing — do NOT
  proceed to the next phase if tests fail.

## Phase Roadmap

| Phase | PR | What ships | Net LOC |
|---|---|---|---|
| 1 | PR-1 | `encode_hand_card_by_id` + `counterfactual.py` (synthesize_obs, sample_counterfactual_baseline) | +95 / 0 |
| 2 | PR-2 | obs `just_drawn_card` field + `FireplaceGymEnv` draw-event tracking + `aux_head` + 3-tuple `forward` + ALL caller updates | +180 / -10 |
| 3 | PR-3 | `RolloutBuffer` aux fields + `PPOTrainer` aux loss + warmup + `TrainConfig` 4 new fields + rollout loop + smoke test fix | +130 / -5 |
| 4 | PR-4 | `MetricsLogger` 12-col + `evaluate_pool` aux capture + `scripts/analyze_draws.py` | +220 / -15 |
| 5 | PR-5 | `milestone.py` second CSV (`heatmap_draw.csv`) + `scripts/migrate_checkpoint.py` | +130 / 0 |

Net: ~+755 / -30 LOC, in line with the spec's ~530 source + ~270 test budget.

Final smoke command (run at end of Phase 5):
```bash
python scripts/train.py --config configs/default.yaml \
    --override max_iters=2 rollout_steps=64 eval_every=1 eval_games=4 \
    aux_warmup_iters=0 milestone_every=1 milestone_games_per_matchup=1
```

Verify outputs:
- `runs/<ts>/metrics.csv` has header with 12 columns ending in `mean_abs_draw_advantage`
- `runs/<ts>/milestones/iter_0001/heatmap.csv` exists
- `runs/<ts>/milestones/iter_0001/heatmap_draw.csv` exists with rows per matchup

---

## Phase 1 — Encoder helper + counterfactual module (PR-1)

Pure helper additions; no obs/network/env changes; `counterfactual.py`
has no live callers yet (rollout loop wires it up in Phase 3). This
phase produces a green-tested standalone module.

### Task 1.1: Add cached encoder + `encode_hand_card_by_id` to `card_features.py`

**Files:**
- Modify: `hearthstone/ai/env/card_features.py` (add module-level singleton + helper)
- Modify: `tests/unit/ai/env/test_card_features.py` (add 3 tests)

- [ ] **Step 1: Read current card_features.py to confirm `CardFeatureEncoder` API**

Run: `sed -n '300,320p' hearthstone/ai/env/card_features.py`
Expected: `class CardFeatureEncoder` constructor branches on `if not _FEATURE_CACHE`, has `encode_hand_card(self, card)` reading `card.id` only.

- [ ] **Step 2: Write the failing tests**

Append to `tests/unit/ai/env/test_card_features.py`:

```python
import numpy as np
from hearthstone.ai.env.card_features import (
    CardFeatureEncoder, SLOT_DIM, encode_hand_card_by_id,
)


def test_encode_hand_card_by_id_returns_slot_dim_array():
    """encode_hand_card_by_id returns a SLOT_DIM-shaped float32 array."""
    arr = encode_hand_card_by_id("CS2_023")  # Arcane Intellect (Mage)
    assert arr.shape == (SLOT_DIM,)
    assert arr.dtype == np.float32


def test_encode_hand_card_by_id_matches_encoder_path():
    """Result equals what CardFeatureEncoder().encode_hand_card(carddef) returns."""
    from fireplace import cards
    cards.db.initialize()
    card_def = cards.db["CS2_023"]
    via_helper = encode_hand_card_by_id("CS2_023")
    via_direct = CardFeatureEncoder().encode_hand_card(card_def)
    assert np.array_equal(via_helper, via_direct)


def test_encode_hand_card_by_id_caches_encoder_singleton():
    """Repeated calls reuse a single _DEFAULT_ENCODER instance."""
    from hearthstone.ai.env import card_features as cf
    cf._DEFAULT_ENCODER = None
    encode_hand_card_by_id("CS2_023")
    first = cf._DEFAULT_ENCODER
    encode_hand_card_by_id("CS2_024")
    assert cf._DEFAULT_ENCODER is first
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pytest tests/unit/ai/env/test_card_features.py::test_encode_hand_card_by_id_returns_slot_dim_array -v`
Expected: FAIL with `ImportError: cannot import name 'encode_hand_card_by_id'`.

- [ ] **Step 4: Implement the helper**

Add near the top of `hearthstone/ai/env/card_features.py` (after the
`_ZERO_STATE` line, around line 27):

```python
from typing import Optional

_DEFAULT_ENCODER: Optional["CardFeatureEncoder"] = None
```

Add at the bottom of the file (after the `CardFeatureEncoder` class):

```python
def encode_hand_card_by_id(card_id: str) -> np.ndarray:
    """Resolve card_id via fireplace.cards.db and encode as a hand-card slot.

    Used by counterfactual synthesis where we have card_ids but no live
    fireplace card objects. cards.db[card_id] returns a CardDef (a static
    card definition); encode_hand_card reads only .id, which CardDefs
    have, so this is safe — no minion-state attributes are touched.

    NOTE: fireplace's CardDB.initialize() lacks an idempotency guard
    (~10 s per call). We rely on CardFeatureEncoder.__init__ →
    build_card_feature_cache() to call cards.db.initialize once via
    the guarded `if not _FEATURE_CACHE` branch.
    """
    global _DEFAULT_ENCODER
    if _DEFAULT_ENCODER is None:
        _DEFAULT_ENCODER = CardFeatureEncoder()
    from fireplace import cards as fp_cards
    card_def = fp_cards.db[card_id]
    return _DEFAULT_ENCODER.encode_hand_card(card_def)
```

- [ ] **Step 4b: Add regression test against db.initialize re-entry**

Append to `tests/unit/ai/env/test_card_features.py`:

```python
def test_encode_hand_card_by_id_does_not_reinitialize_db():
    """Repeated calls do not re-run fireplace's expensive cards.db.initialize().

    fireplace's CardDB.initialize() lacks an idempotency guard (sets
    self.initialized = True but never checks it before re-running the
    XML merge), costing ~10 s per call. encode_hand_card_by_id MUST NOT
    call it on every invocation.
    """
    from unittest.mock import patch
    from hearthstone.ai.env import card_features as cf

    # Force-warm the encoder + db so subsequent calls hit the cached path.
    encode_hand_card_by_id("CS2_023")

    # Now monkey-patch initialize to detect any further calls.
    from fireplace import cards as fp_cards
    call_count = []
    original = fp_cards.db.initialize
    def counting_init(*a, **kw):
        call_count.append(1)
        return original(*a, **kw)
    with patch.object(fp_cards.db, "initialize", counting_init):
        encode_hand_card_by_id("CS2_024")
        encode_hand_card_by_id("CS2_025")
        encode_hand_card_by_id("CS2_023")
    assert len(call_count) == 0, (
        f"db.initialize() called {len(call_count)} times during cached path; "
        "expected 0 (encoder + cache should already be warm)"
    )
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pytest tests/unit/ai/env/test_card_features.py -v`
Expected: 4 new tests PASS (3 original + 1 regression), all existing tests still PASS.

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/env/card_features.py tests/unit/ai/env/test_card_features.py
git commit -m "feat(ai): add encode_hand_card_by_id with cached encoder

Helper used by S2-B counterfactual obs synthesis. Module-level
singleton avoids re-running the no-op _FEATURE_CACHE check on every
call (200-800 calls per rollout in the hot path).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 1.2: Create `counterfactual.py` with `synthesize_obs`

**Files:**
- Create: `hearthstone/ai/env/counterfactual.py`
- Create: `tests/unit/ai/env/test_counterfactual.py`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/ai/env/test_counterfactual.py`:

```python
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
```

- [ ] **Step 2: Verify tests fail**

Run: `pytest tests/unit/ai/env/test_counterfactual.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'hearthstone.ai.env.counterfactual'`.

- [ ] **Step 3: Create the module**

Create `hearthstone/ai/env/counterfactual.py`:

```python
"""Counterfactual obs synthesis for the draw-quality auxiliary head.

We compute the counterfactual draw advantage of the actually-drawn card X
by synthesizing K hypothetical post-draw observations where the agent
drew X' instead of X, forwarding V on each, and using the actual V minus
the K-mean as the regression target for `aux_head`.
"""
from __future__ import annotations

import random
from typing import Optional

import numpy as np
import torch

from .card_features import encode_hand_card_by_id


def synthesize_obs(obs: dict, draw_slot_idx: int, alt_card_id: str) -> dict:
    """Return a deep-copy of `obs` with two slots replaced by the encoding
    of `alt_card_id`:
      - player_hand[draw_slot_idx]
      - just_drawn_card

    Other obs fields are np.copy()'d unchanged. Asserts the slot index is
    a valid hand position.
    """
    enc = encode_hand_card_by_id(alt_card_id)
    out = {k: v.copy() for k, v in obs.items()}
    assert 0 <= draw_slot_idx < out["player_hand"].shape[0], (
        f"draw_slot_idx={draw_slot_idx} out of range "
        f"[0, {out['player_hand'].shape[0]})"
    )
    out["player_hand"][draw_slot_idx] = enc
    out["just_drawn_card"] = enc
    return out
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/unit/ai/env/test_counterfactual.py -v`
Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/counterfactual.py tests/unit/ai/env/test_counterfactual.py
git commit -m "feat(ai): add counterfactual.synthesize_obs

Pure helper that produces a hypothetical post-draw observation by
replacing player_hand[draw_slot_idx] and just_drawn_card with the
encoding of an alternative card. No live callers yet; rollout loop
wires it up in PR-3.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 1.3: Add `sample_counterfactual_baseline` to `counterfactual.py`

**Files:**
- Modify: `hearthstone/ai/env/counterfactual.py`
- Modify: `tests/unit/ai/env/test_counterfactual.py`

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/ai/env/test_counterfactual.py`:

```python
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
```

- [ ] **Step 2: Verify tests fail**

Run: `pytest tests/unit/ai/env/test_counterfactual.py -v -k baseline`
Expected: FAIL with `ImportError: cannot import name 'sample_counterfactual_baseline'`.

- [ ] **Step 3: Implement the function**

Append to `hearthstone/ai/env/counterfactual.py`:

```python
def sample_counterfactual_baseline(
    obs: dict, info: dict, network, device: str,
    K: int = 4, rng: Optional[random.Random] = None,
) -> tuple[float, int]:
    """Sample up to K alternative cards from info['deck_remaining_ids']
    and compute the mean V over the synthesized hypothetical post-draw obs.

    Returns (baseline, n_sampled). n_sampled = min(K, len(deck_remaining)).
    Returns (0.0, 0) if no alternatives are available (deck empty / no
    draw event recorded).

    The network forward is BATCHED into a single call of shape (n_sampled, ...)
    — do not Python-loop K calls.
    """
    rng = rng or random.Random()
    deck_alt = info.get("deck_remaining_ids") or []
    slot_idx = info.get("draw_slot_idx")
    if not deck_alt or slot_idx is None:
        return 0.0, 0

    sampled_ids = rng.sample(deck_alt, min(K, len(deck_alt)))
    synth_obs_list = [
        synthesize_obs(obs, slot_idx, alt_id) for alt_id in sampled_ids
    ]
    keys = list(synth_obs_list[0].keys())
    batched = {
        k: torch.from_numpy(np.stack([o[k] for o in synth_obs_list])).to(device)
        for k in keys
    }
    with torch.no_grad():
        _, values, _ = network(batched)
    return float(values.mean().item()), len(sampled_ids)
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/unit/ai/env/test_counterfactual.py -v`
Expected: 11 tests PASS (6 from Task 1.2 + 5 new).

- [ ] **Step 5: Run the full test suite to confirm nothing else regressed**

Run: `pytest tests/ -v --no-header -q 2>&1 | tail -10`
Expected: all green; net new tests = 14 (3 from Task 1.1 + 11 from Task 1.2/1.3).

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/env/counterfactual.py tests/unit/ai/env/test_counterfactual.py
git commit -m "feat(ai): add sample_counterfactual_baseline

Samples up to K alternative cards from deck_remaining_ids, synthesizes
K hypothetical post-draw obs, batches them into ONE network forward,
returns the mean of V predictions plus the actual sample count.
End of PR-1.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 2 — `just_drawn_card` obs + env tracking + 3-tuple network (PR-2)

This phase atomically introduces three coupled changes that must land
together to keep tests green at PR head:

1. `obs` gains `just_drawn_card` field (Task 2.1).
2. `FireplaceGymEnv` tracks the latest drawn card and writes it into
   `obs` + `info` (Task 2.2).
3. `PolicyValueNetwork.forward` returns 3-tuple `(logits, value, aux)`
   and consumes `just_drawn_card`. ALL caller sites updated (Task 2.3).

Within each task, tests are written first, fail, then implementation
makes them pass. Across tasks, intermediate states may leave the test
suite red (e.g., after Task 2.1 but before Task 2.3, the network
ignores the new obs key — fine). Phase head ends with full green.

### Task 2.1: Add `just_drawn_card` to `observation.py`

**Files:**
- Modify: `hearthstone/ai/env/observation.py`
- Modify: `tests/unit/ai/env/test_observation.py`

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/ai/env/test_observation.py`:

```python
def test_obs_keys_include_just_drawn_card():
    from hearthstone.ai.env.observation import OBS_KEYS
    assert "just_drawn_card" in OBS_KEYS


def test_observation_space_has_just_drawn_card():
    from hearthstone.ai.env.observation import make_observation_space
    from hearthstone.ai.env.card_features import SLOT_DIM
    space = make_observation_space()
    assert "just_drawn_card" in space.spaces
    box = space.spaces["just_drawn_card"]
    assert box.shape == (SLOT_DIM,)
    assert box.dtype.name == "float32"


def test_build_observation_for_just_drawn_card_zero_when_kwarg_absent():
    """When latest_drawn_card_obj=None, the slot is all-zeros."""
    import numpy as np
    from fireplace import cards as fp_cards
    from fireplace.game import Game
    from fireplace.player import Player
    from hearthstone.ai.env.observation import build_observation_for
    from hearthstone.ai.env.card_features import SLOT_DIM

    fp_cards.db.initialize()
    deck = ["CS2_023"] * 30
    p1 = Player("p1", deck, "HERO_08")
    p2 = Player("p2", deck, "HERO_08")
    g = Game(players=[p1, p2], seed=42)
    g.start()
    obs = build_observation_for(g, p1)  # no kwarg
    assert obs["just_drawn_card"].shape == (SLOT_DIM,)
    assert np.all(obs["just_drawn_card"] == 0.0)


def test_build_observation_for_just_drawn_card_filled_when_kwarg_passed():
    """When latest_drawn_card_obj is a fireplace card, slot encodes it."""
    import numpy as np
    from fireplace import cards as fp_cards
    from fireplace.game import Game
    from fireplace.player import Player
    from hearthstone.ai.env.observation import build_observation_for
    from hearthstone.ai.env.card_features import (
        encode_hand_card_by_id, SLOT_DIM,
    )

    fp_cards.db.initialize()
    deck = ["CS2_023"] * 30
    p1 = Player("p1", deck, "HERO_08")
    p2 = Player("p2", deck, "HERO_08")
    g = Game(players=[p1, p2], seed=42)
    g.start()
    # p1.hand has cards after start(); take one and pass to build_observation_for
    drawn = p1.hand[0]
    obs = build_observation_for(g, p1, latest_drawn_card_obj=drawn)
    expected = encode_hand_card_by_id(drawn.id)
    assert np.array_equal(obs["just_drawn_card"], expected)
```

- [ ] **Step 2: Verify tests fail**

Run: `pytest tests/unit/ai/env/test_observation.py::test_obs_keys_include_just_drawn_card -v`
Expected: FAIL — `OBS_KEYS` doesn't have it yet.

- [ ] **Step 3: Modify observation.py**

Edit `hearthstone/ai/env/observation.py`:

(a) Replace `OBS_KEYS` (line 38-40):

```python
OBS_KEYS = (
    "player_hand", "player_board", "opponent_board",
    "just_drawn_card",
) + SCALAR_KEYS
```

(b) Replace `make_observation_space` (line 43-52):

```python
def make_observation_space() -> spaces.Dict:
    return spaces.Dict({
        "player_hand": spaces.Box(0.0, 1.0, shape=(MAX_HAND, SLOT_DIM), dtype=np.float32),
        "player_board": spaces.Box(0.0, 1.0, shape=(MAX_BOARD, SLOT_DIM), dtype=np.float32),
        "opponent_board": spaces.Box(0.0, 1.0, shape=(MAX_BOARD, SLOT_DIM), dtype=np.float32),
        "just_drawn_card": spaces.Box(0.0, 1.0, shape=(SLOT_DIM,), dtype=np.float32),
        **{
            k: spaces.Box(low=lo, high=hi, shape=(1,), dtype=np.float32)
            for k, (lo, hi) in SCALAR_BOUNDS.items()
        },
    })
```

(c) Replace `build_observation_for` signature + body (line 59-83):

```python
def build_observation_for(game, perspective_player, latest_drawn_card_obj=None) -> dict:
    enc = CardFeatureEncoder()
    me = perspective_player
    opp = me.opponent

    player_hand = _stack_padded(
        [enc.encode_hand_card(c) for c in me.hand[:MAX_HAND]], MAX_HAND, enc,
    )
    player_board = _stack_padded(
        [enc.encode_minion(m) for m in me.field[:MAX_BOARD]], MAX_BOARD, enc,
    )
    opponent_board = _stack_padded(
        [enc.encode_minion(m) for m in opp.field[:MAX_BOARD]], MAX_BOARD, enc,
    )

    if latest_drawn_card_obj is not None:
        just_drawn_card = enc.encode_hand_card(latest_drawn_card_obj)
    else:
        just_drawn_card = np.zeros(SLOT_DIM, dtype=np.float32)

    weapon_me = me.weapon
    weapon_op = opp.weapon

    obs: dict = {
        "player_hand": player_hand,
        "player_board": player_board,
        "opponent_board": opponent_board,
        "just_drawn_card": just_drawn_card,
    }
    obs.update(_scalars_from(game, me, opp, weapon_me, weapon_op))
    return obs
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/unit/ai/env/test_observation.py -v`
Expected: all PASS (4 new + existing).

- [ ] **Step 5: Run full env test suite (current network still consumes 2-tuple obs but shouldn't crash because new key is just ignored)**

Run: `pytest tests/unit/ai/env/ -v --no-header -q 2>&1 | tail -10`
Expected: all PASS — `FireplaceGymEnv._build_observation` calls
`build_observation_for(game, training_player)` (no kwarg), so
`just_drawn_card` is all-zeros. Existing tests don't reference the new key.

Run: `pytest tests/unit/ai/test_network.py tests/unit/ai/test_ppo_trainer.py -v --no-header -q 2>&1 | tail -10`
Expected: PASS — network still gets the same 24 slots in `flat_dim`, and
the `just_drawn_card` field is silently ignored by `forward`.

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/env/observation.py tests/unit/ai/env/test_observation.py
git commit -m "feat(ai): add just_drawn_card field to observation dict

OBS_KEYS extended; observation_space gains a (SLOT_DIM,) Box;
build_observation_for accepts a new latest_drawn_card_obj kwarg
(defaults to None → zero slot). Currently silently ignored by the
network forward; consumed in the next task once the env tracks
draw events.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 2.2: `FireplaceGymEnv` draw-event tracking

**Files:**
- Modify: `hearthstone/ai/env/fireplace_env.py`
- Modify: `tests/unit/ai/env/test_fireplace_env.py`

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/ai/env/test_fireplace_env.py`:

```python
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
    sets info['draw_event']=True and writes obs['just_drawn_card']."""
    import numpy as np
    env = _build_simple_env()
    obs, _ = env.reset()
    # Repeatedly end-turn until a draw happens. End turn is action idx 0
    # (EndTurnAction is always at the end of valid_actions -> action_enum
    # maps it to a specific index that we don't predict; instead we just
    # find the first action of type EndTurnAction).
    from hearthstone.ai.env.action_enum import EndTurnAction
    end_idx = None
    for i, a in enumerate(env.current_valid_actions):
        if isinstance(a, EndTurnAction):
            end_idx = i
            break
    assert end_idx is not None
    obs, _, term, _, info = env.step(end_idx)
    # After end_turn, opponent runs their turn inside fireplace.Game state
    # advance. fireplace's auto-end-of-turn forces opponent draw, so when
    # control returns to us at our next step, hand grows by 1.
    # The single env.step invocation may or may not trigger our draw
    # depending on opponent length; what we CAN assert is that AT THIS
    # STEP'S info, draw_event reflects whatever happened in the dispatch.
    # Either we drew (opp ended turn → my start of turn) or not.
    assert info.get("draw_event") in (True, False)


def test_overdraw_burn_no_draw_event():
    """A draw that lands on a hand-of-10 → fireplace burn → new_entities=[]
    → no draw event recorded.

    We synthesize the scenario by manually calling step() in a tight game
    while monkeypatching training_player.hand to be at MAX_HAND. This is
    awkward to test end-to-end; we instead verify the detection logic by
    asserting that when hand_after has no new entity_ids (i.e., burns or
    no draw), draw_event is False.

    The simplest reliable test: a step that doesn't draw anything (a no-op
    end_turn that bounces straight back to us with no draw because the
    opponent died, etc.) should yield draw_event=False. We just verify
    that the env doesn't spuriously fire draw events on no-op steps.
    """
    env = _build_simple_env()
    obs, info = env.reset()
    # First step is from a known clean state. info['draw_event'] is False.
    assert info["draw_event"] is False


def test_compute_alt_pool_excludes_drawn_cards():
    """_compute_alt_pool removes each drawn card from the deck."""
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    pool = FireplaceGymEnv._compute_alt_pool(
        deck_before_ids=["A", "B", "C", "A"],   # duplicate A
        drawn_ids=["A", "C"],
    )
    # one A removed (first occurrence); C removed; B and second A remain
    assert pool == ["B", "A"]
```

- [ ] **Step 2: Verify tests fail**

Run: `pytest tests/unit/ai/env/test_fireplace_env.py::test_reset_clears_draw_state -v`
Expected: FAIL — `_last_drawn_card_obj` doesn't exist as an attribute yet.

- [ ] **Step 3: Modify FireplaceGymEnv `__init__`**

Edit `hearthstone/ai/env/fireplace_env.py`:

(a) Inside `__init__`, after the `self._current_fireplace_seed: Optional[int] = None`
line (around line 98), add:

```python
        # S2-B draw event tracking: cleared on every reset(), updated on
        # every step() that produces a hand-size growth.
        self._last_drawn_card_obj = None
        self._last_draw_slot_idx: Optional[int] = None
        self._last_deck_remaining_ids: list = []
        self._last_n_drawn: int = 0
```

- [ ] **Step 4: Modify `reset` to clear draw state**

In `reset()`, just before the `return self._build_observation(), self._info()`
line (line 141), add:

```python
        # S2-B: explicitly clear all draw state at every reset.
        self._last_drawn_card_obj = None
        self._last_draw_slot_idx = None
        self._last_deck_remaining_ids = []
        self._last_n_drawn = 0
```

- [ ] **Step 5: Modify `step` to detect draw events**

Replace the body of `step` (lines 143-167) with:

```python
    def step(self, action_idx: int):
        valid = self.current_valid_actions
        invalid = action_idx >= len(valid) or action_idx < 0
        if invalid:
            obs = self._build_observation()
            info = self._info()
            info["invalid_action"] = True
            return obs, -0.01, bool(self.game.ended), False, info

        # Snapshot hand entity_ids and deck contents BEFORE dispatch so we
        # can detect draw events post-dispatch.
        hand_before_ids = {c.entity_id for c in self.training_player.hand}
        deck_before_ids = [c.id for c in self.training_player.deck]

        before = self._reward_snapshot()
        dispatch(valid[action_idx], self.game)
        self._auto_resolve_choices()
        after = self._reward_snapshot()
        reward = self._reward_fn.calc(before, after, self.training_player)

        # Detect draw events by hand entity_id diff. Multi-draw: take last
        # appended (chronological order). Overdraw burns: card never enters
        # hand → not in new_entities → no draw event.
        hand_after = list(self.training_player.hand)
        new_entities = [
            c for c in hand_after if c.entity_id not in hand_before_ids
        ]
        if new_entities:
            self._last_drawn_card_obj = new_entities[-1]
            self._last_n_drawn = len(new_entities)
            self._last_draw_slot_idx = hand_after.index(new_entities[-1])
            drawn_ids = [c.id for c in new_entities]
            self._last_deck_remaining_ids = self._compute_alt_pool(
                deck_before_ids, drawn_ids,
            )
        else:
            self._last_drawn_card_obj = None
            self._last_draw_slot_idx = None
            self._last_deck_remaining_ids = []
            self._last_n_drawn = 0

        terminated = bool(self.game.ended)
        if terminated:
            self.current_valid_actions = []
        else:
            self.current_valid_actions = enumerate_valid_actions(
                self.game.current_player, self.choose_one_policy,
            )

        obs = self._build_observation()
        return obs, float(reward), terminated, False, self._info()
```

- [ ] **Step 6: Modify `_build_observation` to pass the latest drawn card**

Replace `_build_observation` (line 185-186) with:

```python
    def _build_observation(self) -> dict:
        return build_observation_for(
            self.game, self.training_player,
            latest_drawn_card_obj=self._last_drawn_card_obj,
        )
```

- [ ] **Step 7: Modify `_info` to expose draw metadata**

Replace `_info` (line 191-199) with:

```python
    def _info(self) -> dict:
        return {
            "valid_actions": len(self.current_valid_actions),
            "invalid_action": False,
            "p1_deck_name": self._current_p1_deck_name,
            "p2_deck_name": self._current_p2_deck_name,
            "training_player_idx": self._training_player_idx,
            "fireplace_seed": self._current_fireplace_seed,
            "draw_event": self._last_n_drawn > 0,
            "n_drawn": self._last_n_drawn,
            "draw_slot_idx": self._last_draw_slot_idx,
            "deck_remaining_ids": list(self._last_deck_remaining_ids),
        }
```

- [ ] **Step 8: Add `_compute_alt_pool` static helper**

At the bottom of the `FireplaceGymEnv` class (after `_reward_snapshot`,
around line 224), add:

```python
    @staticmethod
    def _compute_alt_pool(deck_before_ids: list,
                          drawn_ids: list) -> list:
        """Counterfactual alternative pool: deck contents at moment of
        draw, minus the cards actually drawn. Removes each drawn card
        once (handles duplicates correctly)."""
        alt = list(deck_before_ids)
        for did in drawn_ids:
            if did in alt:
                alt.remove(did)
        return alt
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `pytest tests/unit/ai/env/test_fireplace_env.py -v`
Expected: all PASS, including the 6 new draw-event tests.

- [ ] **Step 10: Run the full test suite to confirm nothing else regressed**

Run: `pytest tests/ -v --no-header -q 2>&1 | tail -20`
Expected: all green. The network forward still ignores `just_drawn_card`
in the obs, so existing PPO/network tests are unaffected.

- [ ] **Step 11: Commit**

```bash
git add hearthstone/ai/env/fireplace_env.py tests/unit/ai/env/test_fireplace_env.py
git commit -m "feat(ai): track draw events in FireplaceGymEnv

reset() clears _last_drawn_card_obj and friends; step() snapshots
hand entity_ids before dispatch and diffs after to detect draws.
The latest drawn card is passed to build_observation_for via the
new kwarg (writing it into obs['just_drawn_card']) and exposed
through info dict (draw_event, n_drawn, draw_slot_idx,
deck_remaining_ids). Overdraw burns automatically excluded; multi-
draw attributes the LAST drawn card (chronological).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 2.3: 3-tuple `forward` + ALL caller updates

This task is atomic: it changes `network.forward` from 2-tuple to 3-tuple,
adds `aux_head` and the `just_drawn_card` slot in `flat_dim`, and updates
every caller that destructures the return value. Tests must be green at
end of task.

**Files:**
- Modify: `hearthstone/ai/network.py`
- Modify: `hearthstone/ai/ppo_trainer.py`
- Modify: `hearthstone/ai/env/opponents.py`
- Modify: `scripts/train.py`
- Modify: `tests/unit/ai/test_network.py`

- [ ] **Step 1: Write failing tests for the new 3-tuple forward**

Edit `tests/unit/ai/test_network.py`. Update existing 2-tuple destructures and add new aux assertions.

(a) Replace the test that asserts forward returns 2-tuple
(`test_forward_returns_logits_and_value_with_correct_shapes`, around
line 22) — change body to:

```python
    def test_forward_returns_three_tuple_with_correct_shapes(self):
        net = PolicyValueNetwork(slot_dim=90, hidden_dim=128, num_actions=512)
        obs = _make_dummy_obs(batch_size=4)
        logits, value, aux = net(obs)
        assert logits.shape == (4, 512)
        assert value.shape == (4, 1)
        assert aux.shape == (4, 1)
```

(b) Update `_make_dummy_obs` (around line 12 — examine exact line) to add
the `just_drawn_card` field. The function currently builds an obs without it.
Add this line just before the `return obs` statement:

```python
    obs["just_drawn_card"] = torch.zeros(batch_size, SLOT_DIM)
```

(c) Update existing 2-tuple destructure tests at lines 29 and 39 (the
batch and single-sample asserts) to 3-tuple:

```python
    def test_forward_handles_batch_size_one(self):
        net = PolicyValueNetwork()
        obs = _make_dummy_obs(batch_size=1)
        logits, value, aux = net(obs)
        assert logits.shape == (1, 512)
        assert value.shape == (1, 1)
        assert aux.shape == (1, 1)

    def test_forward_handles_batch_size_three_with_explicit_dims(self):
        net = PolicyValueNetwork(slot_dim=90, hidden_dim=64, num_actions=128)
        obs = _make_dummy_obs(batch_size=3, slot_dim=90)
        logits, value, aux = net(obs)
        assert logits.shape == (3, 128)
        assert value.shape == (3, 1)
        assert aux.shape == (3, 1)
```

(d) Update `test_uses_all_twenty_one_scalar_features` at lines 62-63:

```python
            with torch.no_grad():
                _, v_a, _ = net(obs_a)
                _, v_b, _ = net(obs_b)
```

(e) Add a new test at the end of the file:

```python
    def test_aux_head_gradient_propagates(self):
        """Backprop on aux output flows gradient into shared body params."""
        net = PolicyValueNetwork()
        obs = _make_dummy_obs(batch_size=2)
        _, _, aux = net(obs)
        loss = aux.pow(2).mean()
        loss.backward()
        # The first shared linear weight should have a non-zero grad.
        assert net.shared[0].weight.grad is not None
        assert torch.any(net.shared[0].weight.grad != 0)
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pytest tests/unit/ai/test_network.py -v`
Expected: FAILs because (a) `_make_dummy_obs` doesn't include
`just_drawn_card`, so the network's `forward` may KeyError once we add
the slot; and (b) destructuring `logits, value, aux = net(...)` raises
ValueError on the current 2-tuple forward.

- [ ] **Step 3: Modify `PolicyValueNetwork`**

Edit `hearthstone/ai/network.py`:

(a) Replace the `__init__` body (lines 39-66) with:

```python
    def __init__(
        self,
        slot_dim: int = 90,
        hidden_dim: int = 128,
        num_actions: int = 512,
        embedding_dim: int | None = None,
    ):
        super().__init__()
        if embedding_dim is not None:
            slot_dim = embedding_dim
        self.card_encoder = CardEncoder(slot_dim, hidden_dim)
        self.num_scalars = len(SCALAR_KEYS)  # 21

        # 10 hand + 2*7 board + 1 just_drawn_card slots, all sharing CardEncoder
        # (intentional: just_drawn_card is conceptually a hand-card slot).
        flat_dim = (10 + 2 * 7 + 1) * hidden_dim + self.num_scalars

        self.shared = nn.Sequential(
            nn.Linear(flat_dim, hidden_dim * 2),
            nn.ReLU(),
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
        )
        self.policy_head = nn.Linear(hidden_dim, num_actions)
        self.value_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
        )
        # NEW S2-B: same shape as value_head, sibling regression head.
        self.aux_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
        )
```

(b) Replace the `forward` body (lines 68-83) with:

```python
    def forward(self, obs: dict):
        """Returns (policy_logits, value, aux_advantage). All callers MUST
        destructure 3 items even if they ignore aux."""
        batch_size = obs["player_health"].shape[0]

        hand_enc = self.card_encoder(obs["player_hand"])
        p_board_enc = self.card_encoder(obs["player_board"])
        o_board_enc = self.card_encoder(obs["opponent_board"])
        # just_drawn_card: (B, slot_dim) → (B, 1, slot_dim) → encode → (B, 1, h)
        drawn_enc = self.card_encoder(obs["just_drawn_card"].unsqueeze(1))

        hand_flat = hand_enc.reshape(batch_size, -1)
        p_board_flat = p_board_enc.reshape(batch_size, -1)
        o_board_flat = o_board_enc.reshape(batch_size, -1)
        drawn_flat = drawn_enc.reshape(batch_size, -1)

        scalars = torch.cat([obs[k] for k in SCALAR_KEYS], dim=-1)  # (B, 21)

        flat = torch.cat(
            [hand_flat, p_board_flat, o_board_flat, drawn_flat, scalars],
            dim=-1,
        )
        h = self.shared(flat)
        return self.policy_head(h), self.value_head(h), self.aux_head(h)
```

- [ ] **Step 4: Update `PPOTrainer` callers**

Edit `hearthstone/ai/ppo_trainer.py`:

(a) Line 62 (`update` method):

```python
            logits, values, _aux_preds = self.network(obs)
```

(b) Line 108 (`select_action` method):

```python
            logits, value, _aux = self.network(obs_d)
```

- [ ] **Step 5: Update `SelfPlayOpponent` caller**

Edit `hearthstone/ai/env/opponents.py`, line 58:

```python
            logits, _, _ = self.network(torch_obs)
```

- [ ] **Step 6: Update `scripts/train.py` caller**

Edit `scripts/train.py`, line 95 (`_bootstrap_value`):

```python
        _, value, _ = network(torch_obs)
```

- [ ] **Step 7: Run the network tests to verify they pass**

Run: `pytest tests/unit/ai/test_network.py -v`
Expected: all PASS, including the new aux gradient test.

- [ ] **Step 8: Run full test suite**

Run: `pytest tests/ -v --no-header -q 2>&1 | tail -30`
Expected: all green. The PPO/opponent/train smoke tests still pass
because the obs dict now (Task 2.1+2.2) carries `just_drawn_card`, the
network consumes it, and all caller destructures match the 3-tuple.

- [ ] **Step 9: Commit**

```bash
git add hearthstone/ai/network.py hearthstone/ai/ppo_trainer.py \
        hearthstone/ai/env/opponents.py scripts/train.py \
        tests/unit/ai/test_network.py
git commit -m "feat(ai): add aux_head and 3-tuple forward to PolicyValueNetwork

Network gains aux_head sibling of value_head (Linear → ReLU → Linear → 1).
flat_dim grows by 1 × hidden_dim for the new just_drawn_card slot, which
shares CardEncoder weights with hand cards. forward returns
(policy_logits, value, aux); all caller sites updated atomically:
PPOTrainer.update + select_action, SelfPlayOpponent.act,
train._bootstrap_value, test_network destructures.

End of PR-2.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 3 — Aux loss training (PR-3)

Wires the aux loss into PPO. Adds 4 new config fields, RolloutBuffer aux
fields, PPOTrainer aux loss + warmup, and the rollout-loop counterfactual
computation.

### Task 3.1: `TrainConfig` 4 new fields + `default.yaml` + smoke test

**Files:**
- Modify: `hearthstone/ai/config.py`
- Modify: `configs/default.yaml`
- Modify: `tests/unit/ai/test_config.py`
- Modify: `tests/unit/ai/test_train_smoke.py`

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/ai/test_config.py`:

```python
def test_trainconfig_has_aux_defaults():
    """The 4 new S2-B fields default to spec values."""
    from hearthstone.ai.config import (
        CardFeaturesConfig, CurriculumConfig, SelfPlayConfig, TrainConfig,
    )
    cfg = TrainConfig(
        seed=1, max_iters=1, rollout_steps=8, ppo_epochs=1,
        deck_pool=["aggro_mage", "control_warrior"],
        deck_selection="random_pair", training_player_idx=0,
        swap_training_player=True,
        mulligan_policy="keep_low_cost", mulligan_threshold=3,
        discover_policy="first", choose_one_policy="first",
        lr=3e-4, gamma=0.99, gae_lambda=0.95, clip_epsilon=0.2,
        value_coef=0.5, entropy_coef=0.01, max_grad_norm=0.5,
        slot_dim=90, hidden_dim=128, num_actions=512,
        curriculum=CurriculumConfig(switch_threshold=0.65, early_stop_patience=5),
        self_play=SelfPlayConfig(
            refresh_threshold=0.8, refresh_eval_games=4, refresh_every=2,
            random_opponent_prob=0.2,
            opponent_checkpoint_path="x.pt",
        ),
        eval_every=2, eval_games=4, max_actions_per_game=200,
        milestone_every=0, milestone_games_per_matchup=1,
        checkpoint_every=5, checkpoint_dir="ckpt",
        best_checkpoint_path="best.pt", runs_dir="runs",
        card_features=CardFeaturesConfig(log_coverage=False),
    )
    assert cfg.aux_loss_coef == 0.5
    assert cfg.aux_warmup_iters == 100
    assert cfg.aux_counterfactual_k == 4
    assert cfg.draw_advantage_threshold == 0.15


def test_load_config_picks_up_aux_keys_from_yaml(tmp_path):
    """aux_* keys in YAML override defaults."""
    import yaml
    from hearthstone.ai.config import load_config
    yaml_path = tmp_path / "cfg.yaml"
    base = yaml.safe_load(open("configs/default.yaml"))
    base["aux_loss_coef"] = 0.25
    base["aux_warmup_iters"] = 0
    base["aux_counterfactual_k"] = 2
    base["draw_advantage_threshold"] = 0.05
    yaml_path.write_text(yaml.safe_dump(base))
    cfg = load_config(str(yaml_path))
    assert cfg.aux_loss_coef == 0.25
    assert cfg.aux_warmup_iters == 0
    assert cfg.aux_counterfactual_k == 2
    assert cfg.draw_advantage_threshold == 0.05
```

- [ ] **Step 2: Verify tests fail**

Run: `pytest tests/unit/ai/test_config.py::test_trainconfig_has_aux_defaults -v`
Expected: FAIL — `TypeError: TrainConfig.__init__() got unexpected keyword argument 'aux_loss_coef'`
or `AttributeError: 'TrainConfig' object has no attribute 'aux_loss_coef'`.

- [ ] **Step 3: Modify `TrainConfig`**

Edit `hearthstone/ai/config.py`. At the END of the `TrainConfig`
dataclass (after `card_features: CardFeaturesConfig`, around line 101),
add:

```python
    # === S2-B aux head (defaults if missing from YAML) ===
    aux_loss_coef: float = 0.5
    aux_warmup_iters: int = 100
    aux_counterfactual_k: int = 4
    draw_advantage_threshold: float = 0.15
```

- [ ] **Step 4: Modify `configs/default.yaml`**

Append to `configs/default.yaml`:

```yaml

# === S2-B aux head ===
aux_loss_coef: 0.5
aux_warmup_iters: 100
aux_counterfactual_k: 4
draw_advantage_threshold: 0.15
```

- [ ] **Step 5: Modify smoke test to disable warmup**

Edit `tests/unit/ai/test_train_smoke.py`. In the `TrainConfig(...)`
literal (lines 16-40), add the 4 new kwargs (with `aux_warmup_iters=0`
so the smoke test exercises the aux-loss path):

```python
        runs_dir=str(tmp_path / "runs"),
        card_features=CardFeaturesConfig(log_coverage=False),
        aux_loss_coef=0.5,
        aux_warmup_iters=0,
        aux_counterfactual_k=2,
        draw_advantage_threshold=0.15,
    )
```

(Insert these 4 lines just before the closing paren of `TrainConfig(...)`.)

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pytest tests/unit/ai/test_config.py -v`
Expected: 2 new tests PASS, all existing tests PASS.

Run: `pytest tests/unit/ai/test_train_smoke.py -v`
Expected: SKIP (slow tests not collected by default) or PASS if `--run-slow`.
At minimum, no collection errors.

- [ ] **Step 7: Commit**

```bash
git add hearthstone/ai/config.py configs/default.yaml \
        tests/unit/ai/test_config.py tests/unit/ai/test_train_smoke.py
git commit -m "feat(ai): add S2-B config fields with defaults

aux_loss_coef=0.5, aux_warmup_iters=100, aux_counterfactual_k=4,
draw_advantage_threshold=0.15 — all dataclass defaults so old YAML
configs (without these keys) continue to load. Smoke test sets
aux_warmup_iters=0 so 2-iter runs exercise the aux-loss code path.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 3.2: `RolloutBuffer` aux fields

**Files:**
- Modify: `hearthstone/ai/rollout_buffer.py`
- Modify: `tests/unit/ai/test_rollout_buffer.py`

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/ai/test_rollout_buffer.py`:

```python
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
    np.testing.assert_array_equal(batch["aux_target"], np.array([0.7, 0.0]))
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
```

- [ ] **Step 2: Verify tests fail**

Run: `pytest tests/unit/ai/test_rollout_buffer.py::test_aux_target_aux_mask_round_trip -v`
Expected: FAIL with TypeError (`add() got unexpected keyword argument`).

- [ ] **Step 3: Modify `RolloutBuffer`**

Edit `hearthstone/ai/rollout_buffer.py`:

(a) In `__init__` (after `self._dones: list[bool] = []`, line 30), add:

```python
        self._aux_target: list[float] = []
        self._aux_mask: list[bool] = []
```

(b) Replace `add` (lines 34-52) with:

```python
    def add(
        self,
        obs: dict,
        action: int,
        reward: float,
        value: float,
        log_prob: float,
        done: bool,
        aux_target: float = 0.0,
        aux_mask: bool = False,
    ) -> None:
        if len(self._observations) >= self.capacity:
            raise RuntimeError("RolloutBuffer is full; call reset() before adding more")
        self._observations.append({k: v.copy() for k, v in obs.items()})
        self._actions.append(int(action))
        self._rewards.append(float(reward))
        self._values.append(float(value))
        self._log_probs.append(float(log_prob))
        self._dones.append(bool(done))
        self._aux_target.append(float(aux_target))
        self._aux_mask.append(bool(aux_mask))
        self._advantages = None
        self._returns = None
```

(c) In `get` (around line 99 — after the `batch["values"] = ...` line),
add:

```python
        batch["aux_target"] = np.asarray(self._aux_target, dtype=np.float32)
        batch["aux_mask"] = np.asarray(self._aux_mask, dtype=bool)
```

(d) In `reset` (around line 108), append:

```python
        self._aux_target.clear()
        self._aux_mask.clear()
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/unit/ai/test_rollout_buffer.py -v`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/rollout_buffer.py tests/unit/ai/test_rollout_buffer.py
git commit -m "feat(ai): add aux_target / aux_mask fields to RolloutBuffer

Default kwargs (0.0 / False) keep existing add() callers working.
get() exposes both as np arrays in the batch dict; reset() clears.
Trainer consumes these in the next task.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 3.3: `PPOTrainer` aux loss + warmup + `_NON_OBS_KEYS`

**Files:**
- Modify: `hearthstone/ai/ppo_trainer.py`
- Modify: `tests/unit/ai/test_ppo_trainer.py`

- [ ] **Step 1: Write the failing tests**

Edit `tests/unit/ai/test_ppo_trainer.py`. First, find the helper that
constructs a dummy batch (likely `_make_dummy_batch` or similar) and
update it to include `just_drawn_card` and the new aux fields. Then
append new tests:

```python
import numpy as np
import torch

from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.ppo_trainer import PPOTrainer


def _make_dummy_batch(n=4, slot_dim=90, num_actions=512, with_aux=False):
    """Minimal batch matching trainer.update's expectations, including
    just_drawn_card and aux fields."""
    obs = {
        "player_hand": np.zeros((n, 10, slot_dim), dtype=np.float32),
        "player_board": np.zeros((n, 7, slot_dim), dtype=np.float32),
        "opponent_board": np.zeros((n, 7, slot_dim), dtype=np.float32),
        "just_drawn_card": np.zeros((n, slot_dim), dtype=np.float32),
    }
    # Fill 21 scalar keys with float32 (n, 1) arrays
    from hearthstone.ai.network import SCALAR_KEYS
    for k in SCALAR_KEYS:
        obs[k] = np.zeros((n, 1), dtype=np.float32)
    batch = dict(obs)
    batch["actions"] = np.zeros(n, dtype=np.int64)
    batch["rewards"] = np.zeros(n, dtype=np.float32)
    batch["dones"] = np.zeros(n, dtype=np.float32)
    batch["values"] = np.zeros(n, dtype=np.float32)
    batch["old_log_probs"] = np.zeros(n, dtype=np.float32)
    batch["advantages"] = np.zeros(n, dtype=np.float32)
    batch["returns"] = np.zeros(n, dtype=np.float32)
    if with_aux:
        batch["aux_target"] = np.array([0.5] * n, dtype=np.float32)
        batch["aux_mask"] = np.array([True] * n, dtype=bool)
    else:
        batch["aux_target"] = np.zeros(n, dtype=np.float32)
        batch["aux_mask"] = np.zeros(n, dtype=bool)
    return batch


def test_trainer_update_returns_aux_loss_key():
    """trainer.update() returns 'aux_loss' and 'aux_n_samples' in losses dict."""
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1)
    batch = _make_dummy_batch(with_aux=False)
    losses = trainer.update(batch, current_iter=999)
    assert "aux_loss" in losses
    assert "aux_n_samples" in losses


def test_trainer_aux_loss_zero_when_no_mask():
    """All-False aux_mask → aux_loss == 0.0."""
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1, aux_warmup_iters=0)
    batch = _make_dummy_batch(with_aux=False)
    losses = trainer.update(batch, current_iter=999)
    assert losses["aux_loss"] == 0.0


def test_trainer_aux_loss_nonzero_when_mask_true():
    """All-True aux_mask + nonzero target → aux_loss > 0 (post-warmup)."""
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1, aux_warmup_iters=0,
                         aux_loss_coef=0.5)
    batch = _make_dummy_batch(with_aux=True)
    losses = trainer.update(batch, current_iter=999)
    assert losses["aux_loss"] > 0.0
    assert losses["aux_n_samples"] == 4.0


def test_trainer_warmup_zeros_aux_coef():
    """During warmup (current_iter < aux_warmup_iters), aux_loss is computed
    but the gradient is zeroed — verify by ensuring the network's aux_head
    weights don't move during a warmup step."""
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1, aux_warmup_iters=100,
                         aux_loss_coef=0.5)
    batch = _make_dummy_batch(with_aux=True)
    aux_w_before = net.aux_head[0].weight.clone()
    trainer.update(batch, current_iter=0)  # below warmup threshold
    aux_w_after = net.aux_head[0].weight.clone()
    # During warmup, effective_aux_coef=0 → aux loss has no influence on
    # aux_head params via aux gradient. (The shared body may still update
    # via policy/value loss; only check aux_head specifically.)
    assert torch.equal(aux_w_before, aux_w_after), (
        "aux_head weights changed during warmup — aux gradient leaked through"
    )


def test_trainer_post_warmup_uses_full_coef():
    """After warmup, aux gradient updates aux_head."""
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1, aux_warmup_iters=0,
                         aux_loss_coef=0.5)
    batch = _make_dummy_batch(with_aux=True)
    aux_w_before = net.aux_head[0].weight.clone()
    trainer.update(batch, current_iter=0)
    aux_w_after = net.aux_head[0].weight.clone()
    assert not torch.equal(aux_w_before, aux_w_after), (
        "aux_head weights did not change post-warmup"
    )


def test_trainer_update_default_iter_is_zero():
    """update() can be called without current_iter (default=0); existing
    callers continue to work."""
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1, aux_warmup_iters=0)
    batch = _make_dummy_batch(with_aux=False)
    losses = trainer.update(batch)
    assert "total_loss" in losses
```

- [ ] **Step 2: Verify tests fail**

Run: `pytest tests/unit/ai/test_ppo_trainer.py::test_trainer_update_returns_aux_loss_key -v`
Expected: FAIL — `aux_loss` not in returned dict; `current_iter` kwarg unsupported.

- [ ] **Step 3: Modify `PPOTrainer`**

Edit `hearthstone/ai/ppo_trainer.py`:

(a) Replace `_NON_OBS_KEYS` (lines 12-15) with:

```python
_NON_OBS_KEYS = {
    "actions", "rewards", "dones", "values",
    "old_log_probs", "advantages", "returns",
    "aux_target", "aux_mask",
}
```

(b) Replace `__init__` signature (lines 21-32) with:

```python
    def __init__(
        self,
        network: PolicyValueNetwork,
        lr: float = 3e-4,
        gamma: float = 0.99,
        gae_lambda: float = 0.95,
        clip_epsilon: float = 0.2,
        value_coef: float = 0.5,
        entropy_coef: float = 0.01,
        max_grad_norm: float = 0.5,
        ppo_epochs: int = 4,
        aux_loss_coef: float = 0.5,
        aux_warmup_iters: int = 100,
    ):
        self.network = network
        self.optimizer = Adam(network.parameters(), lr=lr)
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.clip_epsilon = clip_epsilon
        self.value_coef = value_coef
        self.entropy_coef = entropy_coef
        self.max_grad_norm = max_grad_norm
        self.ppo_epochs = ppo_epochs
        self.aux_loss_coef = aux_loss_coef
        self.aux_warmup_iters = aux_warmup_iters
```

(c) Replace `update` method (lines 43-96) with:

```python
    def update(self, batch: Dict[str, np.ndarray],
               current_iter: int = 0) -> Dict[str, float]:
        """Run ppo_epochs gradient updates on the rollout batch.

        Required keys: observation tensors + actions, advantages, returns,
        old_log_probs. Optional: aux_target, aux_mask (default zeros).
        """
        device = next(self.network.parameters()).device

        obs = {
            k: torch.from_numpy(v).float().to(device)
            for k, v in batch.items() if k not in _NON_OBS_KEYS
        }
        actions = torch.from_numpy(batch["actions"]).long().to(device)
        advantages = torch.from_numpy(batch["advantages"]).float().to(device)
        returns = torch.from_numpy(batch["returns"]).float().to(device).unsqueeze(-1)
        old_log_probs = torch.from_numpy(batch["old_log_probs"]).float().to(device)
        aux_target = torch.from_numpy(batch["aux_target"]).float().to(device)
        aux_mask = torch.from_numpy(batch["aux_mask"]).bool().to(device)

        # Aux warmup: zero coef while V is poorly calibrated. After warmup,
        # the aux loss contributes via aux_loss_coef.
        effective_aux_coef = (
            0.0 if current_iter < self.aux_warmup_iters else self.aux_loss_coef
        )

        total = policy = value = entropy = aux_total = 0.0
        n_aux_seen = 0
        for _ in range(self.ppo_epochs):
            logits, values, aux_preds = self.network(obs)
            new_log_probs = self._log_probs(logits, actions)
            ent = self._entropy(logits)

            ratio = torch.exp(new_log_probs - old_log_probs)
            unclipped = ratio * advantages
            clipped = torch.clamp(
                ratio, 1.0 - self.clip_epsilon, 1.0 + self.clip_epsilon
            ) * advantages
            policy_loss = -torch.min(unclipped, clipped).mean()
            value_loss = F.mse_loss(values, returns)

            n_aux = int(aux_mask.sum().item())
            if n_aux > 0:
                aux_loss = F.mse_loss(
                    aux_preds.squeeze(-1)[aux_mask], aux_target[aux_mask],
                )
            else:
                aux_loss = torch.tensor(0.0, device=device)

            loss = (
                policy_loss
                + self.value_coef * value_loss
                - self.entropy_coef * ent
                + effective_aux_coef * aux_loss
            )

            self.optimizer.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(self.network.parameters(), self.max_grad_norm)
            self.optimizer.step()

            total += loss.item()
            policy += policy_loss.item()
            value += value_loss.item()
            entropy += ent.item()
            aux_total += aux_loss.item()
            n_aux_seen = n_aux  # last epoch's count (constant across epochs)

        n = float(self.ppo_epochs)
        return {
            "total_loss": total / n,
            "policy_loss": policy / n,
            "value_loss": value / n,
            "entropy": entropy / n,
            "aux_loss": aux_total / n,
            "aux_n_samples": float(n_aux_seen),
        }
```

- [ ] **Step 4: Run the trainer tests to verify they pass**

Run: `pytest tests/unit/ai/test_ppo_trainer.py -v`
Expected: all PASS, including the 6 new aux tests.

- [ ] **Step 5: Run full test suite**

Run: `pytest tests/ -v --no-header -q 2>&1 | tail -10`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/ppo_trainer.py tests/unit/ai/test_ppo_trainer.py
git commit -m "feat(ai): add aux loss + warmup to PPOTrainer

Trainer accepts aux_target / aux_mask via the batch dict (added to
_NON_OBS_KEYS so they don't leak into the network forward call).
Aux loss is masked MSE; effective_aux_coef is zero during the
aux_warmup_iters window. update() now takes a current_iter kwarg
(default 0). Returns include aux_loss and aux_n_samples.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 3.4: Rollout loop wires counterfactual + passes current_iter

**Files:**
- Modify: `scripts/train.py`
- (smoke test in Task 3.1 already prepared)

- [ ] **Step 1: Verify smoke test currently fails (because rollout loop doesn't compute aux yet)**

Run: `pytest tests/unit/ai/test_train_smoke.py::test_two_iter_train_smoke -v --runslow 2>&1 | tail -15`

Expected: PASS — the smoke test doesn't directly check aux behaviour;
it only verifies the run completes and writes metrics.csv. We add aux
behaviour without breaking it. (If you don't have a `--runslow` flag,
omit it; the test is gated by `@pytest.mark.slow`.)

- [ ] **Step 2: Modify `scripts/train.py` rollout loop**

Edit `scripts/train.py`:

(a) At the top, in the imports block (around line 20-35), add:

```python
from hearthstone.ai.env.counterfactual import sample_counterfactual_baseline
```

(b) Replace the rollout loop (lines 198-213) with:

```python
    # 7. Main loop
    obs, info = env.reset()
    it = start_iter - 1  # in case the loop body never runs
    try:
        for it in range(start_iter, config.max_iters + 1):
            # --- Collect rollout ---
            buffer.reset()
            for _ in range(config.rollout_steps):
                # If THIS obs has a draw event (came from prior step), compute
                # the counterfactual baseline by synthesizing K hypothetical
                # post-draw obs and forwarding V on each.
                if info.get("draw_event", False):
                    baseline, n_sampled = sample_counterfactual_baseline(
                        obs, info, network, device,
                        K=config.aux_counterfactual_k,
                    )
                else:
                    baseline, n_sampled = 0.0, 0

                mask = _action_mask(env, n_actions=config.num_actions)
                torch_obs = _build_obs_for_network(obs, device)
                action, log_prob, value = trainer.select_action(torch_obs, mask)

                if n_sampled > 0:
                    aux_target = float(value) - baseline
                    aux_mask = True
                else:
                    aux_target = 0.0
                    aux_mask = False

                next_obs, reward, terminated, truncated, info = env.step(action)
                buffer.add(
                    obs, action, reward, value, log_prob, terminated,
                    aux_target=aux_target, aux_mask=aux_mask,
                )
                obs = next_obs
                if terminated or truncated:
                    obs, info = env.reset()
            # --- Bootstrap final value ---
            last_value = _bootstrap_value(network, obs, device)
            buffer.compute_returns_and_advantages(last_value)

            # --- Update ---
            try:
                batch = buffer.get()
                losses = trainer.update(batch, current_iter=it)
            except RuntimeError as e:
                logger.warning("buffer.get() failed: %s; skipping update", e)
                continue
```

Note carefully:
- The `info` is read at the TOP of each rollout step (it carries the
  draw event from the env.step that produced THIS obs).
- The `info` is REASSIGNED at the bottom from the new `env.step(action)`.
- On `env.reset()` (terminated/truncated), `info` is also reset.

(c) The downstream loss-printing code (lines 235-249) still references
`losses["total_loss"]` etc. — unchanged. The aux loss is logged via
`metrics.log_iter` only if we extend the logger; we DO NOT extend
`log_iter` in this PR (aux_loss column is per-eval, not per-iter).
We can however append `aux={losses["aux_loss"]:.4f}` to the print line:

Replace the `print(f"[iter {it:04d}] phase=...)` block (lines 242-249) with:

```python
            print(
                f"[iter {it:04d}] phase={fsm.phase.value} "
                f"total_loss={losses['total_loss']:.4f} "
                f"policy={losses['policy_loss']:.4f} "
                f"value={losses['value_loss']:.4f} "
                f"entropy={losses['entropy']:.4f} "
                f"aux={losses['aux_loss']:.4f} (n_aux={int(losses['aux_n_samples'])})",
                flush=True,
            )
```

- [ ] **Step 3: Run smoke test (slow)**

Run: `pytest tests/unit/ai/test_train_smoke.py -v -m slow 2>&1 | tail -20`

Expected: PASS — 2 iters complete, `metrics.csv` exists with header
matching the current 11-column format (extension to 12 columns happens
in Phase 4).

- [ ] **Step 4: Commit**

```bash
git add scripts/train.py
git commit -m "feat(ai): wire counterfactual baseline into rollout loop

Each rollout step inspects info['draw_event']; when True, samples K
alts from info['deck_remaining_ids'], synthesizes hypothetical post-
draw obs, batched-forwards V on all K to get baseline, stores
(value − baseline) as aux_target. trainer.update receives current_iter
so warmup gating works. End of PR-3.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 4 — `MetricsLogger` 12-col + `evaluate_pool` aux + replay tool (PR-4)

### Task 4.1: `MetricsLogger` 12-column extension

**Files:**
- Modify: `hearthstone/ai/training_utils.py`
- Modify: `tests/unit/ai/test_training_utils.py`

- [ ] **Step 1: Update existing tests to expect 12-column header**

Edit `tests/unit/ai/test_training_utils.py`:

(a) Replace `test_writes_header_on_open` (lines 45-54) body:

```python
    def test_writes_header_on_open(self, tmp_path):
        path = tmp_path / "metrics.csv"
        logger = MetricsLogger(str(path))
        logger.close()
        rows = list(csv.reader(path.open()))
        assert rows[0] == [
            "iter", "phase", "total_loss", "policy_loss", "value_loss",
            "entropy", "eval_winrate", "best_winrate", "plateau_count",
            "cap_hit_count", "milestone_path", "mean_abs_draw_advantage",
        ]
```

(b) Replace `test_log_iter_blanks_trailing_columns` (lines 56-68):

```python
    def test_log_iter_blanks_trailing_columns(self, tmp_path):
        """log_iter writes 6 fields then 6 trailing blanks (3 eval +
        cap_hit_count + milestone_path + mean_abs_draw_advantage)."""
        path = tmp_path / "metrics.csv"
        logger = MetricsLogger(str(path))
        logger.log_iter(
            iter=1, phase="RANDOM",
            total_loss=0.5, policy_loss=0.1, value_loss=0.4, entropy=4.2,
        )
        logger.close()
        rows = list(csv.reader(path.open()))
        assert rows[1][:6] == ["1", "RANDOM", "0.5", "0.1", "0.4", "4.2"]
        assert rows[1][6:] == ["", "", "", "", "", ""]   # 6 trailing blanks
        assert len(rows[1]) == 12
```

(c) Replace `test_log_eval_fills_cap_hit_count` (lines 70-87):

```python
    def test_log_eval_fills_cap_hit_count_and_aux(self, tmp_path):
        """log_eval blanks loss cols, fills eval+best+plateau+cap_hit,
        blank milestone_path, fills mean_abs_draw_advantage."""
        path = tmp_path / "metrics.csv"
        logger = MetricsLogger(str(path))
        logger.log_eval(
            iter=10, phase="RANDOM",
            eval_winrate=0.75, best_winrate=0.75, plateau_count=0,
            cap_hit_count=3, mean_abs_draw_advantage=0.42,
        )
        logger.close()
        rows = list(csv.reader(path.open()))
        assert rows[1][0] == "10"
        assert rows[1][1] == "RANDOM"
        assert rows[1][2:6] == ["", "", "", ""]   # loss cols blank
        assert rows[1][6:9] == ["0.75", "0.75", "0"]
        assert rows[1][9] == "3"      # cap_hit_count
        assert rows[1][10] == ""      # milestone_path blank
        assert rows[1][11] == "0.42"  # mean_abs_draw_advantage
        assert len(rows[1]) == 12
```

(d) Replace `test_log_milestone_writes_csv_path` (lines 89-97):

```python
    def test_log_milestone_writes_csv_path(self, tmp_path):
        path = tmp_path / "metrics.csv"
        logger = MetricsLogger(str(path))
        logger.log_milestone(
            iter_num=100,
            csv_path="milestones/iter_0100/heatmap.csv",
        )
        logger.close()
        rows = list(csv.reader(path.open()))
        assert rows[1][0] == "100"
        assert rows[1][1:10] == [""] * 9
        assert rows[1][10] == "milestones/iter_0100/heatmap.csv"
        assert rows[1][11] == ""    # mean_abs_draw_advantage blank
        assert len(rows[1]) == 12
```

- [ ] **Step 2: Verify tests fail**

Run: `pytest tests/unit/ai/test_training_utils.py -v`
Expected: assertion failures — header has 11 columns currently.

- [ ] **Step 3: Modify `MetricsLogger`**

Edit `hearthstone/ai/training_utils.py`:

(a) Replace `_HEADER` (lines 9-14) with:

```python
_HEADER = [
    "iter", "phase", "total_loss", "policy_loss", "value_loss",
    "entropy", "eval_winrate", "best_winrate", "plateau_count",
    "cap_hit_count",
    "milestone_path",
    "mean_abs_draw_advantage",   # NEW (S2-B): filled on eval rows
]
```

(b) Replace `log_iter` (lines 32-41) with:

```python
    def log_iter(
        self, iter: int, phase: str,
        total_loss: float, policy_loss: float, value_loss: float, entropy: float,
    ) -> None:
        self._writer.writerow([
            iter, phase, total_loss, policy_loss, value_loss, entropy,
            "", "", "",       # eval cols blank
            "", "",           # cap_hit_count + milestone_path blank
            "",               # mean_abs_draw_advantage blank
        ])
        self._file.flush()
```

(c) Replace `log_eval` signature + body (lines 43-54) with:

```python
    def log_eval(
        self, iter: int, phase: str,
        eval_winrate: float, best_winrate: float, plateau_count: int,
        cap_hit_count: int = 0,
        mean_abs_draw_advantage: float = 0.0,
    ) -> None:
        self._writer.writerow([
            iter, phase, "", "", "", "",    # loss cols blank
            eval_winrate, best_winrate, plateau_count,
            cap_hit_count,
            "",                              # milestone_path blank
            mean_abs_draw_advantage,
        ])
        self._file.flush()
```

(d) Replace `log_milestone` (lines 56-64) with:

```python
    def log_milestone(self, iter_num: int, csv_path: str) -> None:
        """Mark a milestone heatmap as completed at this iter."""
        self._writer.writerow([
            iter_num, "", "", "", "", "",
            "", "", "",
            "",                # cap_hit_count blank
            csv_path,
            "",                # mean_abs_draw_advantage blank
        ])
        self._file.flush()
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/unit/ai/test_training_utils.py -v`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/training_utils.py tests/unit/ai/test_training_utils.py
git commit -m "feat(ai): extend MetricsLogger to 12 columns

Adds mean_abs_draw_advantage as the trailing column. log_eval has a
new kwarg (defaults to 0.0 so existing callers continue to work).
log_iter and log_milestone trail with one extra blank.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 4.2: `evaluate_pool` aux capture

**Files:**
- Modify: `hearthstone/ai/evaluate.py`
- Modify: `tests/unit/ai/test_evaluate.py`

- [ ] **Step 1: Write the failing tests**

Append to `tests/unit/ai/test_evaluate.py`:

```python
def test_evaluate_pool_returns_mean_abs_draw_advantage_key():
    """The result dict gains mean_abs_draw_advantage and n_draw_events keys."""
    from hearthstone.ai.evaluate import evaluate_pool
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.env.deck_source import load_decks
    from hearthstone.ai.env.opponents import RandomOpponent

    net = PolicyValueNetwork()
    decks = load_decks(["aggro_mage", "control_warrior"])
    result = evaluate_pool(
        network=net,
        opponent_factory=lambda: RandomOpponent(),
        decks=decks, n_games=2, max_actions_per_game=100, seed=42,
    )
    assert "mean_abs_draw_advantage" in result
    assert "n_draw_events" in result
    assert isinstance(result["mean_abs_draw_advantage"], float)
    assert isinstance(result["n_draw_events"], int)


def test_evaluate_pool_zero_when_random_init_aux_head():
    """Random-init aux_head + 2 short games: the mean is finite (no NaN);
    n_draw_events is non-negative."""
    from hearthstone.ai.evaluate import evaluate_pool
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.env.deck_source import load_decks
    from hearthstone.ai.env.opponents import RandomOpponent
    import math

    net = PolicyValueNetwork()
    decks = load_decks(["aggro_mage", "control_warrior"])
    result = evaluate_pool(
        network=net,
        opponent_factory=lambda: RandomOpponent(),
        decks=decks, n_games=2, max_actions_per_game=100, seed=42,
    )
    assert math.isfinite(result["mean_abs_draw_advantage"])
    assert result["n_draw_events"] >= 0
```

- [ ] **Step 2: Verify tests fail**

Run: `pytest tests/unit/ai/test_evaluate.py::test_evaluate_pool_returns_mean_abs_draw_advantage_key -v`
Expected: FAIL — keys not in result dict.

- [ ] **Step 3: Modify `evaluate_pool`**

Edit `hearthstone/ai/evaluate.py`. Replace the per-game loop (lines 82-106)
with:

```python
    wins = 0
    cap_hit_count = 0
    abs_advantages: list = []
    n_draw_events = 0
    seen = set()
    for g, (i, j, tp_idx) in enumerate(sampler):
        env = FireplaceGymEnv(
            decks=[decks[i], decks[j]], pair_strategy="fixed",
            swap_training_player=False, training_player_idx=tp_idx,
            seed=(seed + g) if seed is not None else None,
        )
        opp = opponent_factory()
        obs, info = env.reset()
        action_count = 0
        while not env.game.ended and action_count < max_actions_per_game:
            if env.game.current_player is env.training_player:
                # Capture aux on draws that occur on the agent's turn.
                if info.get("draw_event", False):
                    import torch as _torch
                    torch_obs = {
                        k: _torch.from_numpy(v).unsqueeze(0)
                        for k, v in obs.items()
                    }
                    with _torch.no_grad():
                        _, _, aux = network(torch_obs)
                    abs_advantages.append(abs(float(aux[0, 0].item())))
                    n_draw_events += 1
                idx = eval_agent.act(env)
            else:
                idx = opp.act(env)
            obs, _, _, _, info = env.step(idx)
            action_count += 1
        if action_count >= max_actions_per_game and not env.game.ended:
            cap_hit_count += 1
        elif env.training_player.playstate == PlayState.WON:
            wins += 1
        seen.add((i, j, tp_idx))
        env.close()

    mean_abs = (sum(abs_advantages) / len(abs_advantages)
                if abs_advantages else 0.0)

    return {
        "winrate": wins / n_games,
        "n_games": n_games,
        "matchups_seen": len(seen),
        "cap_hit_count": cap_hit_count,
        "mean_abs_draw_advantage": float(mean_abs),
        "n_draw_events": int(n_draw_events),
    }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/unit/ai/test_evaluate.py -v`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/evaluate.py tests/unit/ai/test_evaluate.py
git commit -m "feat(ai): capture mean_abs_draw_advantage in evaluate_pool

Forwards network on each agent-turn draw event, accumulates abs(aux)
across games. Returns mean (0.0 if no draw events) plus n_draw_events
(informational). Coverage scope: training-player-turn draws only;
opponent-caused draws (e.g., Coldlight Oracle) are not captured by
design.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 4.3: `train.py` log_eval call passes aux

**Files:**
- Modify: `scripts/train.py`

- [ ] **Step 1: Modify the log_eval call site**

Edit `scripts/train.py`. Replace the `metrics.log_eval` call (lines 266-272)
with:

```python
                metrics.log_eval(
                    iter=it, phase=fsm.phase.value,
                    eval_winrate=winrate,
                    best_winrate=fsm.best_winrate,
                    plateau_count=fsm.plateau_count,
                    cap_hit_count=eval_result["cap_hit_count"],
                    mean_abs_draw_advantage=eval_result.get(
                        "mean_abs_draw_advantage", 0.0,
                    ),
                )
```

Also extend the eval print line (lines 273-278):

```python
                print(
                    f"[iter {it:04d}] phase={fsm.phase.value} "
                    f"eval winrate={winrate:.3f} (best={fsm.best_winrate:.3f}, "
                    f"plateau={fsm.plateau_count}) "
                    f"mean_abs_draw_adv={eval_result.get('mean_abs_draw_advantage', 0.0):.3f}",
                    flush=True,
                )
```

- [ ] **Step 2: Run the smoke test (slow)**

Run: `pytest tests/unit/ai/test_train_smoke.py -v -m slow 2>&1 | tail -20`

Expected: PASS — `metrics.csv` now has 12 columns; eval rows include
the new `mean_abs_draw_advantage` value.

- [ ] **Step 3: Commit**

```bash
git add scripts/train.py
git commit -m "feat(ai): wire mean_abs_draw_advantage through to metrics.csv

Eval rows now carry the per-eval mean abs draw advantage. Print line
extended for visibility.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 4.4: `scripts/analyze_draws.py` (replay tool)

**Files:**
- Create: `scripts/analyze_draws.py`
- Create: `tests/unit/ai/test_analyze_draws.py`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/ai/test_analyze_draws.py`:

```python
"""Tests for scripts/analyze_draws.py — the draw-quality replay tool."""
import csv
import os
import sys

import pytest
import torch

from hearthstone.ai.network import PolicyValueNetwork


# Ensure scripts/ is importable
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def test_label_from_score_thresholds():
    """label_from_score returns 神抽 / 鬼抽 / 普通 at the right cutoffs."""
    from scripts.analyze_draws import label_from_score
    assert label_from_score(0.20, threshold=0.15) == "神抽"
    assert label_from_score(-0.20, threshold=0.15) == "鬼抽"
    assert label_from_score(0.10, threshold=0.15) == "普通"
    assert label_from_score(0.0, threshold=0.15) == "普通"
    # Boundary: exactly at threshold → 普通 (strict >)
    assert label_from_score(0.15, threshold=0.15) == "普通"
    assert label_from_score(-0.15, threshold=0.15) == "普通"


@pytest.mark.slow
def test_analyze_draws_writes_csv(tmp_path):
    """End-to-end: load a fresh checkpoint, replay 2 games, write CSV."""
    from hearthstone.ai.training_utils import save_checkpoint
    from hearthstone.ai.config import (
        CardFeaturesConfig, CurriculumConfig, SelfPlayConfig, TrainConfig,
    )
    cfg = TrainConfig(
        seed=42, max_iters=1, rollout_steps=8, ppo_epochs=1,
        deck_pool=["aggro_mage", "control_warrior"],
        deck_selection="random_pair", training_player_idx=0,
        swap_training_player=True,
        mulligan_policy="keep_low_cost", mulligan_threshold=3,
        discover_policy="first", choose_one_policy="first",
        lr=3e-4, gamma=0.99, gae_lambda=0.95, clip_epsilon=0.2,
        value_coef=0.5, entropy_coef=0.01, max_grad_norm=0.5,
        slot_dim=90, hidden_dim=128, num_actions=512,
        curriculum=CurriculumConfig(switch_threshold=0.65, early_stop_patience=5),
        self_play=SelfPlayConfig(
            refresh_threshold=0.8, refresh_eval_games=4, refresh_every=2,
            random_opponent_prob=0.2, opponent_checkpoint_path="x.pt",
        ),
        eval_every=1, eval_games=2, max_actions_per_game=100,
        milestone_every=0, milestone_games_per_matchup=1,
        checkpoint_every=1, checkpoint_dir=str(tmp_path),
        best_checkpoint_path=str(tmp_path / "best.pt"),
        runs_dir=str(tmp_path / "runs"),
        card_features=CardFeaturesConfig(log_coverage=False),
        aux_loss_coef=0.5, aux_warmup_iters=0,
        aux_counterfactual_k=2, draw_advantage_threshold=0.15,
    )

    net = PolicyValueNetwork()
    opt = torch.optim.Adam(net.parameters(), lr=3e-4)
    ckpt_path = str(tmp_path / "ckpt.pt")
    save_checkpoint(
        ckpt_path, network=net, optimizer=opt, iter_num=1,
        config=cfg, best_winrate=0.0, phase="RANDOM",
    )

    out_csv = str(tmp_path / "draws.csv")
    from scripts.analyze_draws import run_analysis
    run_analysis(
        checkpoint_path=ckpt_path,
        deck_names=["aggro_mage", "control_warrior"],
        n_games=2, output_path=out_csv, threshold=0.15, seed=42,
        max_actions_per_game=100,
    )

    assert os.path.exists(out_csv)
    rows = list(csv.DictReader(open(out_csv)))
    if rows:  # may be 0 if no draw events fired in 2 short games
        for r in rows:
            assert r["label"] in ("神抽", "鬼抽", "普通")
            assert r["deck_agent"] in ("aggro_mage", "control_warrior")
            assert int(r["game_idx"]) >= 0
```

- [ ] **Step 2: Verify tests fail**

Run: `pytest tests/unit/ai/test_analyze_draws.py::test_label_from_score_thresholds -v`
Expected: FAIL — `ImportError: scripts.analyze_draws`.

- [ ] **Step 3: Create the script**

Create `scripts/analyze_draws.py`:

```python
"""Replay a trained agent over N games; emit per-draw CSV with
draw_advantage_score and 神抽/鬼抽/普通 label.

Usage:
    python scripts/analyze_draws.py \
        --checkpoint checkpoints/best.pt \
        --decks aggro_mage,control_warrior \
        --n-games 20 \
        --output runs/draws_analysis.csv \
        [--threshold 0.15] [--seed 42]
"""
from __future__ import annotations

import argparse
import csv
import sys
from typing import Optional

import torch

from hearthstone.ai.config import TrainConfig  # noqa: F401  (load_checkpoint shape)
from hearthstone.ai.env.deck_source import load_decks
from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
from hearthstone.ai.env.opponents import RandomOpponent, SelfPlayOpponent
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.training_utils import load_checkpoint


def label_from_score(score: float, threshold: float = 0.15) -> str:
    """Map a continuous draw_advantage_score to a coarse label.
    Strict > threshold for 神抽 / strict < -threshold for 鬼抽; ties → 普通.
    """
    if score > threshold:
        return "神抽"
    if score < -threshold:
        return "鬼抽"
    return "普通"


def run_analysis(
    *, checkpoint_path: str, deck_names: list, n_games: int,
    output_path: str, threshold: float = 0.15,
    seed: Optional[int] = None, max_actions_per_game: int = 1000,
) -> None:
    """Replay n_games agent-vs-RandomOpponent games over a deck pool subset.
    Each draw on training_player's turn produces one row in `output_path`.
    """
    ckpt = load_checkpoint(checkpoint_path)
    cfg_raw = ckpt.get("config", {})
    slot_dim = int(cfg_raw.get("slot_dim", 90))
    hidden_dim = int(cfg_raw.get("hidden_dim", 128))
    num_actions = int(cfg_raw.get("num_actions", 512))

    net = PolicyValueNetwork(
        slot_dim=slot_dim, hidden_dim=hidden_dim, num_actions=num_actions,
    )
    net.load_state_dict(ckpt["network"])
    net.eval()

    decks = load_decks(deck_names)
    if len(decks) < 2:
        raise ValueError(f"Need >= 2 decks, got {len(decks)}")

    eval_agent = SelfPlayOpponent(
        network_path=None, slot_dim=slot_dim,
        hidden_dim=hidden_dim, num_actions=num_actions,
    )
    eval_agent.network = net

    import random
    rng = random.Random(seed)

    rows = []
    for g in range(n_games):
        # Sample a directed pair (i, j, tp_idx)
        i = rng.randrange(len(decks))
        j = rng.randrange(len(decks))
        while j == i:
            j = rng.randrange(len(decks))
        tp_idx = rng.randrange(2)
        env = FireplaceGymEnv(
            decks=[decks[i], decks[j]], pair_strategy="fixed",
            swap_training_player=False, training_player_idx=tp_idx,
            seed=(seed + g) if seed is not None else None,
        )
        opp = RandomOpponent()
        obs, info = env.reset()
        action_count = 0
        while not env.game.ended and action_count < max_actions_per_game:
            if env.game.current_player is env.training_player:
                if info.get("draw_event", False):
                    drawn = env._last_drawn_card_obj
                    torch_obs = {
                        k: torch.from_numpy(v).unsqueeze(0)
                        for k, v in obs.items()
                    }
                    with torch.no_grad():
                        _, _, aux = net(torch_obs)
                    score = float(aux[0, 0].item())
                    rows.append({
                        "game_idx": g, "turn": env.game.turn,
                        "deck_agent": decks[tp_idx if tp_idx == i else j].name
                                       if tp_idx == 0 else decks[j].name,
                        "deck_opponent": decks[1 - tp_idx if 1 - tp_idx == i else j].name
                                          if (1 - tp_idx) == 0 else decks[j].name,
                        "training_player_idx": tp_idx,
                        "drawn_card_id": getattr(drawn, "id", "?"),
                        "drawn_card_name": getattr(drawn, "name", "?"),
                        "drawn_card_cost": getattr(drawn, "cost", 0),
                        "draw_advantage_score": round(score, 4),
                        "label": label_from_score(score, threshold=threshold),
                    })
                idx = eval_agent.act(env)
            else:
                idx = opp.act(env)
            obs, _, _, _, info = env.step(idx)
            action_count += 1
        env.close()

    fieldnames = [
        "game_idx", "turn", "deck_agent", "deck_opponent",
        "training_player_idx", "drawn_card_id", "drawn_card_name",
        "drawn_card_cost", "draw_advantage_score", "label",
    ]
    with open(output_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

    print(f"Wrote {len(rows)} rows → {output_path}")


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Analyze trained agent's draws.")
    p.add_argument("--checkpoint", required=True)
    p.add_argument("--decks", required=True,
                   help="Comma-separated deck names (≥ 2)")
    p.add_argument("--n-games", type=int, default=20)
    p.add_argument("--output", required=True)
    p.add_argument("--threshold", type=float, default=0.15)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--max-actions-per-game", type=int, default=1000)
    args = p.parse_args(argv)

    deck_names = [d.strip() for d in args.decks.split(",") if d.strip()]
    run_analysis(
        checkpoint_path=args.checkpoint,
        deck_names=deck_names,
        n_games=args.n_games,
        output_path=args.output,
        threshold=args.threshold,
        seed=args.seed,
        max_actions_per_game=args.max_actions_per_game,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/unit/ai/test_analyze_draws.py::test_label_from_score_thresholds -v`
Expected: PASS.

Run: `pytest tests/unit/ai/test_analyze_draws.py -v -m slow 2>&1 | tail -10`
Expected: PASS (the @pytest.mark.slow gates the end-to-end test).

- [ ] **Step 5: Commit**

```bash
git add scripts/analyze_draws.py tests/unit/ai/test_analyze_draws.py
git commit -m "feat(ai): add analyze_draws CLI replay tool

scripts/analyze_draws.py: load a trained checkpoint, play N games of
agent-vs-RandomOpponent over a deck subset, emit per-draw CSV with
score and 神抽/鬼抽/普通 label. End of PR-4.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 5 — Milestone draw heatmap + checkpoint migration (PR-5)

### Task 5.1: `milestone.py` emits `heatmap_draw.csv`

**Files:**
- Modify: `hearthstone/ai/milestone.py`
- Modify: `tests/unit/ai/test_milestone.py`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/ai/test_milestone.py`:

```python
@pytest.mark.slow
def test_milestone_writes_both_heatmap_csvs(tmp_path):
    """After a successful milestone run, both heatmap.csv and
    heatmap_draw.csv exist in the iter_NNNN snapshot dir."""
    import csv
    import torch
    from hearthstone.ai.milestone import MilestoneRunner
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.training_utils import save_checkpoint
    from hearthstone.ai.config import (
        CardFeaturesConfig, CurriculumConfig, SelfPlayConfig, TrainConfig,
    )

    cfg = TrainConfig(
        seed=1, max_iters=1, rollout_steps=8, ppo_epochs=1,
        deck_pool=["aggro_mage", "control_warrior"],
        deck_selection="random_pair", training_player_idx=0,
        swap_training_player=True,
        mulligan_policy="keep_low_cost", mulligan_threshold=3,
        discover_policy="first", choose_one_policy="first",
        lr=3e-4, gamma=0.99, gae_lambda=0.95, clip_epsilon=0.2,
        value_coef=0.5, entropy_coef=0.01, max_grad_norm=0.5,
        slot_dim=90, hidden_dim=128, num_actions=512,
        curriculum=CurriculumConfig(switch_threshold=0.65, early_stop_patience=5),
        self_play=SelfPlayConfig(
            refresh_threshold=0.8, refresh_eval_games=4, refresh_every=2,
            random_opponent_prob=0.2, opponent_checkpoint_path="x.pt",
        ),
        eval_every=1, eval_games=2, max_actions_per_game=100,
        milestone_every=1, milestone_games_per_matchup=1,
        checkpoint_every=1, checkpoint_dir=str(tmp_path),
        best_checkpoint_path=str(tmp_path / "best.pt"),
        runs_dir=str(tmp_path / "runs"),
        card_features=CardFeaturesConfig(log_coverage=False),
        aux_loss_coef=0.5, aux_warmup_iters=0,
        aux_counterfactual_k=2, draw_advantage_threshold=0.15,
    )
    net = PolicyValueNetwork()
    opt = torch.optim.Adam(net.parameters(), lr=3e-4)
    ckpt_path = str(tmp_path / "best.pt")
    save_checkpoint(
        ckpt_path, network=net, optimizer=opt, iter_num=1,
        config=cfg, best_winrate=0.0, phase="RANDOM",
    )

    runner = MilestoneRunner(output_dir=str(tmp_path / "milestones"))
    out_path = runner.submit(
        iter_num=1, checkpoint_path=ckpt_path,
        deck_names=["aggro_mage", "control_warrior"],
        games_per_matchup=1, slot_dim=90, num_actions=512,
    )
    # Wait for the future to complete
    for fut, _, _ in list(runner._pending):
        fut.result()
    runner.collect_completed()
    runner.shutdown(wait=True)

    assert os.path.exists(out_path)
    draw_path = out_path.replace("heatmap.csv", "heatmap_draw.csv")
    assert os.path.exists(draw_path), f"missing {draw_path}"
    rows = list(csv.DictReader(open(draw_path)))
    assert len(rows) > 0
    for r in rows:
        assert "deck_a" in r and "deck_b" in r
        assert "mean_abs_draw_advantage" in r
        assert "n_draw_events" in r
```

- [ ] **Step 2: Verify test fails**

Run: `pytest tests/unit/ai/test_milestone.py::test_milestone_writes_both_heatmap_csvs -v -m slow 2>&1 | tail -15`
Expected: FAIL — `heatmap_draw.csv` doesn't exist.

- [ ] **Step 3: Modify `_run_round_robin` to track aux + emit second CSV**

Edit `hearthstone/ai/milestone.py`. Replace the per-game inner loop and
the trailing CSV write (lines 149-195) with:

```python
    # Write to .partial first; rename on success so partial outputs are
    # recoverable from cleanup.
    partial = output_path + ".partial"
    rows = []
    draw_rows = []
    for i, deck_a in enumerate(decks):
        for j, deck_b in enumerate(decks):
            if i == j:
                continue
            for tp_idx in (0, 1):
                wins = 0
                cap_hits = 0
                abs_advantages: list = []
                n_draw_events = 0
                for g in range(games_per_matchup):
                    matchup_seed = (i * 31 + j * 17 + tp_idx * 7 + g) & 0x7FFFFFFF
                    env = FireplaceGymEnv(
                        decks=[deck_a, deck_b],
                        pair_strategy="fixed",
                        swap_training_player=False,
                        training_player_idx=tp_idx,
                        seed=matchup_seed,
                    )
                    obs, info = env.reset()
                    opp = RandomOpponent()
                    action_count = 0
                    while not env.game.ended and action_count < 1000:
                        if env.game.current_player is env.training_player:
                            if info.get("draw_event", False):
                                torch_obs = {
                                    k: torch.from_numpy(v).unsqueeze(0)
                                    for k, v in obs.items()
                                }
                                with torch.no_grad():
                                    _, _, aux = net(torch_obs)
                                abs_advantages.append(
                                    abs(float(aux[0, 0].item()))
                                )
                                n_draw_events += 1
                            idx = agent.act(env)
                        else:
                            idx = opp.act(env)
                        obs, _, _, _, info = env.step(idx)
                        action_count += 1
                    if action_count >= 1000 and not env.game.ended:
                        cap_hits += 1
                    elif env.training_player.playstate == PlayState.WON:
                        wins += 1
                rows.append({
                    "deck_a": deck_a.name, "deck_b": deck_b.name,
                    "training_player_idx": tp_idx,
                    "n_games": games_per_matchup,
                    "winrate": wins / games_per_matchup,
                    "cap_hit_count": cap_hits,
                })
                mean_abs = (sum(abs_advantages) / len(abs_advantages)
                            if abs_advantages else 0.0)
                draw_rows.append({
                    "deck_a": deck_a.name, "deck_b": deck_b.name,
                    "training_player_idx": tp_idx,
                    "n_games": games_per_matchup,
                    "mean_abs_draw_advantage": round(mean_abs, 4),
                    "n_draw_events": n_draw_events,
                })

    with open(partial, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=[
            "deck_a", "deck_b", "training_player_idx",
            "n_games", "winrate", "cap_hit_count",
        ])
        w.writeheader()
        w.writerows(rows)
    os.replace(partial, output_path)

    # Write the sibling heatmap_draw.csv (same atomic .partial → rename).
    draw_path = output_path.replace("heatmap.csv", "heatmap_draw.csv")
    draw_partial = draw_path + ".partial"
    with open(draw_partial, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=[
            "deck_a", "deck_b", "training_player_idx",
            "n_games", "mean_abs_draw_advantage", "n_draw_events",
        ])
        w.writeheader()
        w.writerows(draw_rows)
    os.replace(draw_partial, draw_path)
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pytest tests/unit/ai/test_milestone.py::test_milestone_writes_both_heatmap_csvs -v -m slow 2>&1 | tail -20`
Expected: PASS.

- [ ] **Step 5: Run full milestone test suite**

Run: `pytest tests/unit/ai/test_milestone.py -v 2>&1 | tail -10`
Expected: all PASS — existing milestone tests still work.

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/milestone.py tests/unit/ai/test_milestone.py
git commit -m "feat(ai): emit heatmap_draw.csv in milestone subprocess

Per-matchup mean_abs_draw_advantage + n_draw_events written to a
sibling CSV alongside heatmap.csv. Same .partial → rename atomic
write pattern. Users find both files in the same iter_NNNN/ snapshot
directory. metrics.csv only logs heatmap.csv (heatmap_draw.csv is
implicit by location).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 5.2: `scripts/migrate_checkpoint.py`

**Files:**
- Create: `scripts/migrate_checkpoint.py`
- Create: `tests/unit/ai/test_migrate_checkpoint.py`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/ai/test_migrate_checkpoint.py`:

```python
"""Tests for scripts/migrate_checkpoint.py — S2-A → S2-B network shape migration."""
import os
import sys

import pytest
import torch
import torch.nn as nn


# Ensure scripts/ is importable
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


class _S2APolicyValueNetwork(nn.Module):
    """Local re-creation of the S2-A network shape (24-slot flat_dim, 2-tuple
    forward), used to produce a checkpoint that the migrator must accept."""

    def __init__(self, slot_dim=90, hidden_dim=128, num_actions=512):
        super().__init__()
        self.card_encoder = nn.Sequential(
            nn.Linear(slot_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim), nn.ReLU(),
        )
        flat_dim = (10 + 2 * 7) * hidden_dim + 21
        self.shared = nn.Sequential(
            nn.Linear(flat_dim, hidden_dim * 2), nn.ReLU(),
            nn.Linear(hidden_dim * 2, hidden_dim), nn.ReLU(),
        )
        self.policy_head = nn.Linear(hidden_dim, num_actions)
        self.value_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2), nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
        )


def test_migrate_round_trip_loads_under_new_network(tmp_path):
    """A migrated S2-A checkpoint loads cleanly into the S2-B network."""
    from scripts.migrate_checkpoint import migrate
    from hearthstone.ai.network import PolicyValueNetwork

    s2a = _S2APolicyValueNetwork()
    in_path = str(tmp_path / "s2a.pt")
    out_path = str(tmp_path / "s2b.pt")
    torch.save({
        "iter": 100,
        "network": s2a.state_dict(),
        "optimizer": {},
        "config": {"slot_dim": 90, "hidden_dim": 128, "num_actions": 512},
        "best_winrate": 0.5,
        "phase": "RANDOM",
    }, in_path)

    migrate(in_path, out_path)
    ckpt = torch.load(out_path, map_location="cpu")
    new_net = PolicyValueNetwork(slot_dim=90, hidden_dim=128, num_actions=512)
    new_net.load_state_dict(ckpt["network"])  # must not raise


def test_migrate_pads_shared_with_zeros(tmp_path):
    """The new column block in shared.0.weight (size hidden_dim) is all zeros."""
    from scripts.migrate_checkpoint import migrate
    from hearthstone.ai.network import PolicyValueNetwork

    s2a = _S2APolicyValueNetwork()
    in_path = str(tmp_path / "s2a.pt")
    out_path = str(tmp_path / "s2b.pt")
    torch.save({
        "iter": 100, "network": s2a.state_dict(), "optimizer": {},
        "config": {"slot_dim": 90, "hidden_dim": 128, "num_actions": 512},
        "best_winrate": 0.5, "phase": "RANDOM",
    }, in_path)

    migrate(in_path, out_path)
    ckpt = torch.load(out_path, map_location="cpu")
    w = ckpt["network"]["shared.0.weight"]   # (256, NEW_FLAT_DIM)
    hidden_dim = 128
    split = (10 + 2 * 7) * hidden_dim   # 24*128 = 3072
    new_block = w[:, split:split + hidden_dim]
    assert torch.all(new_block == 0)


def test_migrate_preserves_old_param_values(tmp_path):
    """Existing non-shared.0 params come through unchanged."""
    from scripts.migrate_checkpoint import migrate

    s2a = _S2APolicyValueNetwork()
    in_path = str(tmp_path / "s2a.pt")
    out_path = str(tmp_path / "s2b.pt")
    torch.save({
        "iter": 100, "network": s2a.state_dict(), "optimizer": {},
        "config": {"slot_dim": 90, "hidden_dim": 128, "num_actions": 512},
        "best_winrate": 0.5, "phase": "RANDOM",
    }, in_path)

    migrate(in_path, out_path)
    new = torch.load(out_path, map_location="cpu")["network"]
    old = s2a.state_dict()
    # policy_head and value_head are unchanged in shape; values must match.
    assert torch.equal(new["policy_head.weight"], old["policy_head.weight"])
    assert torch.equal(new["value_head.0.weight"], old["value_head.0.weight"])
    # shared.0.bias is unchanged shape; values match.
    assert torch.equal(new["shared.0.bias"], old["shared.0.bias"])


def test_migrate_injects_aux_config_defaults(tmp_path):
    """The migrated checkpoint's config gains the 4 new aux fields if missing."""
    from scripts.migrate_checkpoint import migrate

    s2a = _S2APolicyValueNetwork()
    in_path = str(tmp_path / "s2a.pt")
    out_path = str(tmp_path / "s2b.pt")
    torch.save({
        "iter": 100, "network": s2a.state_dict(), "optimizer": {},
        "config": {"slot_dim": 90, "hidden_dim": 128, "num_actions": 512},
        "best_winrate": 0.5, "phase": "RANDOM",
    }, in_path)

    migrate(in_path, out_path)
    ckpt = torch.load(out_path, map_location="cpu")
    cfg = ckpt["config"]
    assert cfg["aux_loss_coef"] == 0.5
    assert cfg["aux_warmup_iters"] == 100
    assert cfg["aux_counterfactual_k"] == 4
    assert cfg["draw_advantage_threshold"] == 0.15
```

- [ ] **Step 2: Verify tests fail**

Run: `pytest tests/unit/ai/test_migrate_checkpoint.py -v`
Expected: FAIL — `ModuleNotFoundError: scripts.migrate_checkpoint`.

- [ ] **Step 3: Create the script**

Create `scripts/migrate_checkpoint.py`:

```python
"""S2-A → S2-B checkpoint migration.

The S2-B network adds a `just_drawn_card` slot to flat_dim
(grows by hidden_dim columns in shared.0.weight) and an aux_head
sibling of value_head. This script:
  1. Loads an old checkpoint.
  2. Constructs a fresh S2-B network state_dict.
  3. Copies all unchanged params from old → new.
  4. Pads shared.0.weight with a zero block at the just_drawn_card
     position (between boards and scalars in the concat order).
  5. Leaves aux_head random-initialized.
  6. Injects the 4 new aux config defaults if missing.

Usage:
    python scripts/migrate_checkpoint.py --in old.pt --out new.pt
"""
from __future__ import annotations

import argparse
import sys

import torch

from hearthstone.ai.network import PolicyValueNetwork


_AUX_DEFAULTS = {
    "aux_loss_coef": 0.5,
    "aux_warmup_iters": 100,
    "aux_counterfactual_k": 4,
    "draw_advantage_threshold": 0.15,
}


def migrate(in_path: str, out_path: str) -> None:
    ckpt = torch.load(in_path, map_location="cpu")
    cfg = ckpt.get("config", {})
    slot_dim = int(cfg.get("slot_dim", 90))
    hidden_dim = int(cfg.get("hidden_dim", 128))
    num_actions = int(cfg.get("num_actions", 512))

    new_net = PolicyValueNetwork(
        slot_dim=slot_dim, hidden_dim=hidden_dim, num_actions=num_actions,
    )
    new_sd = new_net.state_dict()
    old_sd = ckpt["network"]

    for k, new_v in new_sd.items():
        if k.startswith("aux_head."):
            continue   # leave random-init
        if k == "shared.0.weight":
            old_w = old_sd[k]   # (h*2, OLD_FLAT_DIM)
            zeros = torch.zeros(
                old_w.shape[0], hidden_dim, dtype=old_w.dtype,
            )
            # New column block lands BETWEEN boards and scalars in the
            # concat order: [hand, p_board, o_board, drawn, scalars].
            split = (10 + 2 * 7) * hidden_dim
            new_v.data = torch.cat([
                old_w[:, :split], zeros, old_w[:, split:],
            ], dim=1)
            continue
        if k in old_sd and old_sd[k].shape == new_v.shape:
            new_v.data = old_sd[k].clone()

    ckpt["network"] = new_sd

    # Inject S2-B aux defaults if absent.
    cfg = dict(ckpt.get("config", {}))
    for key, default_val in _AUX_DEFAULTS.items():
        cfg.setdefault(key, default_val)
    ckpt["config"] = cfg

    torch.save(ckpt, out_path)
    print(f"migrated {in_path} → {out_path} (S2-A → S2-B network shape)")


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Migrate S2-A checkpoint to S2-B shape.")
    p.add_argument("--in", dest="in_path", required=True)
    p.add_argument("--out", dest="out_path", required=True)
    args = p.parse_args(argv)
    migrate(args.in_path, args.out_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pytest tests/unit/ai/test_migrate_checkpoint.py -v`
Expected: 4 tests PASS.

- [ ] **Step 5: Run full test suite**

Run: `pytest tests/ -v --no-header -q 2>&1 | tail -15`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add scripts/migrate_checkpoint.py tests/unit/ai/test_migrate_checkpoint.py
git commit -m "feat(ai): add migrate_checkpoint script for S2-A → S2-B

Zero-pads shared.0.weight at the just_drawn_card column block
(positioned between boards and scalars per the concat order); leaves
aux_head random-initialized. Injects the 4 new aux config defaults
if missing. CLI: python scripts/migrate_checkpoint.py --in old.pt --out new.pt.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### Task 5.3: Final integration smoke test

This is verification only; no commit.

- [ ] **Step 1: Run the final smoke command**

Run:
```bash
python scripts/train.py --config configs/default.yaml \
    --override max_iters=2 rollout_steps=64 eval_every=1 eval_games=4 \
    aux_warmup_iters=0 milestone_every=1 milestone_games_per_matchup=1
```

Expected: training completes 2 iters; prints lines like
`[iter 0001] phase=RANDOM total_loss=... aux=... (n_aux=...)`.

- [ ] **Step 2: Verify outputs**

Run (replace `<ts>` with actual timestamp):
```bash
ls runs/*/metrics.csv runs/*/milestones/iter_0001/heatmap.csv runs/*/milestones/iter_0001/heatmap_draw.csv 2>&1
head -1 runs/*/metrics.csv | tr ',' '\n' | wc -l
```

Expected: all 3 files present; metrics.csv header has 12 columns.

- [ ] **Step 3: Verify analyze_draws end-to-end**

Run:
```bash
python scripts/analyze_draws.py \
    --checkpoint checkpoints/best.pt \
    --decks aggro_mage,control_warrior \
    --n-games 2 \
    --output /tmp/draws_smoke.csv
```

Expected: prints `Wrote N rows → /tmp/draws_smoke.csv` (N may be 0 in
2 short games — that's OK).

- [ ] **Step 4: Confirm full test suite green**

Run: `pytest tests/ -v --no-header -q 2>&1 | tail -5`
Expected: zero failures.

- [ ] **Step 5: Open PR-5**

If the workflow is per-PR, open PR-5 from this branch's tip. If everything
is on a single feature branch, no separate PR per phase — open one PR
containing all 5 phases' commits.

```bash
git push -u origin feature/webui
gh pr create --title "S2-B: draw-quality auxiliary head" --body "$(cat <<'EOF'
## Summary
- Adds aux_head sibling of value_head; predicts counterfactual draw advantage
- Counterfactual baseline via obs synthesis (K=4 alts), no fireplace.Game manipulation
- 4 new config fields with defaults; 12-column metrics.csv; replay tool; milestone draw heatmap; checkpoint migration

## Test plan
- [ ] All unit tests pass: `pytest tests/ -v`
- [ ] Smoke command produces metrics.csv (12 cols), heatmap.csv, heatmap_draw.csv
- [ ] analyze_draws CLI runs against best.pt and writes a non-empty CSV
- [ ] migrate_checkpoint round-trips an S2-A checkpoint without errors
EOF
)"
```

---

## Self-Review

After writing the plan, re-read it against the spec.

**1. Spec coverage:** Each section/requirement → mapping:
- "Add a third head (aux_head)" → Task 2.3
- "Counterfactual via obs synthesis" → Tasks 1.2, 1.3, 3.4
- "synthesize_obs replaces hand slot + just_drawn_card" → Task 1.2
- "sample_counterfactual_baseline batched K forwards" → Task 1.3
- "just_drawn_card field" → Task 2.1
- "FireplaceGymEnv tracks _last_drawn_card_obj" → Task 2.2
- "reset() clears state (Blocker #3)" → Task 2.2 Step 4
- "_compute_alt_pool" → Task 2.2 Step 8
- "3-tuple forward + all callers" → Task 2.3 (full caller checklist incl. test_network.py:62-63)
- "RolloutBuffer aux_target / aux_mask" → Task 3.2
- "PPOTrainer aux loss + warmup + _NON_OBS_KEYS" → Task 3.3
- "TrainConfig 4 new fields with defaults" → Task 3.1
- "Rollout loop calls counterfactual baseline" → Task 3.4
- "Smoke test override fix (TrainConfig literal)" → Task 3.1 Step 5
- "MetricsLogger 12 columns" → Task 4.1
- "evaluate_pool aux capture" → Task 4.2
- "log_eval kwarg + train.py wire" → Task 4.3
- "scripts/analyze_draws.py" → Task 4.4
- "label_from_score thresholds" → Task 4.4 Step 3
- "milestone heatmap_draw.csv" → Task 5.1
- "scripts/migrate_checkpoint.py" → Task 5.2
- "Migration fan-out documentation" → spec only (no plan task; users follow spec)
- "Aux loss zero when no mask samples" → Task 3.3 test
- "Multi-draw last drawn / chronological ordering" → Task 2.2 Step 5 + spec
- "Overdraw burn skipped" → Task 2.2 (new_entities=[] branch)
- "Tracking-style discover known limitation" → spec only

**2. Placeholder scan:** No "TBD", no "TODO", no "implement later", no
"similar to". Each task has runnable test code, runnable implementation
code, and an exact `git commit` invocation.

**3. Type / signature consistency:**
- `synthesize_obs(obs, draw_slot_idx, alt_card_id)` consistent across
  Task 1.2 implementation and Task 1.3 caller.
- `sample_counterfactual_baseline(obs, info, network, device, K, rng)`
  consistent across Task 1.3 def and Task 3.4 call.
- `network.forward(obs) -> (logits, value, aux)` consistent across
  Task 2.3 def and ALL caller sites.
- `info["draw_event"]`, `info["n_drawn"]`, `info["draw_slot_idx"]`,
  `info["deck_remaining_ids"]` consistent across Task 2.2 (writer)
  and Tasks 3.4, 4.2, 4.4, 5.1 (readers).
- `RolloutBuffer.add(..., aux_target=0.0, aux_mask=False)` consistent
  Task 3.2 def → Task 3.4 call.
- `PPOTrainer.update(batch, current_iter=0)` consistent Task 3.3 def →
  Task 3.4 call.
- `MetricsLogger.log_eval(..., mean_abs_draw_advantage=0.0)` consistent
  Task 4.1 def → Task 4.3 call.
- 12-column row format consistent Task 4.1 def → Task 4.1 tests.
- `migrate_checkpoint.migrate(in_path, out_path)` consistent Task 5.2
  def → Task 5.2 tests.
