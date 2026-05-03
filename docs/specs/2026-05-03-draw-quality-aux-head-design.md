# Draw-Quality Auxiliary Head Design (S2-B)

**Date:** 2026-05-03
**Status:** Approved, ready for implementation plan
**Predecessors:**
- `docs/specs/2026-05-01-fireplace-integration-design.md` (S1' fireplace integration — completed)
- `docs/specs/2026-05-01-multi-deck-training-design.md` (S2-A multi-deck training pool — completed, commit `b4fe6a2`)

## Goal

Add a third head (`aux_head`) to `PolicyValueNetwork` that predicts the
**counterfactual draw advantage** of the most recently drawn card —
mathematically `V(s_after | drew X) − E_{X' ∈ remaining_deck}[V(s_after | drew X')]`.
The output is a continuous scalar; positive ≈ 神抽, negative ≈ 鬼抽,
near zero ≈ 普通. The head is trained jointly with policy and value
inside PPO, using counterfactual targets computed by **synthesizing
hypothetical post-draw observations** (replacing the drawn card slot
in the obs tensor with K alternative card encodings) and forwarding V
through the network. No fireplace.Game state copying or modification.

In addition to the head itself, S2-B ships:
- A replay tool `scripts/analyze_draws.py` that runs N games over a deck
  subset and emits per-draw CSV with score and human-readable label.
- An extension to the milestone subprocess (S2-A) that produces a second
  CSV `heatmap_draw.csv` per milestone, with `mean_abs_draw_advantage`
  per matchup.
- A checkpoint migration tool to load S2-A checkpoints under the S2-B
  network shape (zero-pad the new `just_drawn_card` block in the shared
  layer; random-init the new `aux_head`).

This delivers the second of the user's two original goals, completing
the program: "stronger model that not only plays cards but can also
judge whether a draw is god-draw or bad-draw."

## Non-goals

- Per-card aux resolution for multi-draw turns. When a single env step
  produces ≥ 2 drawn cards (Arcane Intellect, Coldlight Oracle, end-of-
  turn auto-draw on top of mid-turn draws), only the LAST drawn card is
  recorded with the full V delta as its target. Per-card attribution
  would require finer fireplace hooks and is deferred.
- Using `aux_head` output as input to the policy. The aux head is
  observational; the policy does not key off it. (A future spec could
  feed `aux_head(s)` back into the shared body as a feature for policy
  decisions, but that's an architectural change not in scope here.)
- Human-labeled training data for "this is 神抽 / 鬼抽". The training
  signal is fully self-supervised via counterfactual V deltas.
- Discretization into 3 classes at training time. The head outputs a
  scalar; class labels are post-hoc display only (replay tool).
- Mid-turn draw event annotation. We detect draws at env.step boundaries
  by `len(player.hand)` diff. Mid-turn V snapshots (e.g., V right before
  Arcane Intellect resolves) require fireplace internal hooks; not
  implemented.
- Cross-game aux signal aggregation. Each game's draw events are
  independent; we don't track `mean_abs_draw_advantage` longitudinally
  across episodes within a rollout (only aggregated at eval time).

## Decisions locked in during brainstorming

| Decision | Choice |
|---|---|
| Operational definition | Counterfactual draw advantage (option A) |
| Output format | Continuous scalar regression (option A) |
| Drawn card identification | Add `just_drawn_card` (SLOT_DIM) field to obs (option A) |
| Counterfactual estimator | **Counterfactual via obs synthesis** (revised from Temporal V delta after subagent review surfaced cross-turn confound) — synthesize K=4 hypothetical post-draw obs by replacing the drawn-card hand slot and `just_drawn_card`, forward V on each, mean as baseline |
| Scope | Path 1 (aux head + training + CSV metric) + Path 2 (replay tool) + Path 3 (milestone draw heatmap) bundled in one spec |

## Subagent review (1 round) — issues addressed

The first design draft (Sections 1-3 in conversation) used Temporal V
delta `V(s_after) − V(s_before)` as the counterfactual target. A
subagent review surfaced two BLOCKERs:

1. **Cross-turn confound**: `V(s_after) − V(s_before)` spans an entire
   `OpponentEnv` outer step, including the agent's previous action,
   the entire opponent turn, and the agent's start-of-turn draw. The
   draw is a small fraction of the V delta; the head ends up learning
   "how did the previous turn cycle go" much more than "how good was
   the drawn card."
2. `_last_drawn_card_id` was not cleared in `reset()` — state leaked
   across episodes.

Plus 5 IMPORTANT issues:

3. Aux sample frequency is low (~50-200 per 2048-step rollout) → α=0.1
   may be too small.
4. V → aux → V instability early in training when V is poorly
   calibrated.
5. The 3-tuple forward signature changes more callsites than originally
   listed (`PPOTrainer.update:62`, `test_network.py:22, 29, 39` missed).
6. `evaluate_pool`'s aux-collection code as written had no `obs` in
   scope.
7. (degraded to documentation issue) Timing arithmetic for the rollout
   aux pairing was correct but cryptic; needs a worked example.

Plus 5 NICE-TO-HAVE notes about overdraw burns, multi-draw bias
direction, checkpoint migration, and test coverage.

**Resolution**: Switched the counterfactual estimator from Temporal V
delta to **obs synthesis with K=4 alternatives**. This makes the
target a true counterfactual — V(s_after) minus the average V over K
hypothetical post-draw states where the agent drew X' instead of X.
The synthesis only mutates two obs tensor slots (`player_hand[draw_slot_idx]`
and `just_drawn_card`); no fireplace.Game manipulation. Cost: K extra
V forwards per draw event (~10-30% rollout overhead, not the 5-10x
that was originally feared). All other findings addressed inline; see
`Changelog` section.

## High-level approach

### Component additions

1. **`hearthstone/ai/env/counterfactual.py`** (NEW): pure helper module
   for synthesizing hypothetical observations and computing the
   counterfactual baseline.
2. **`PolicyValueNetwork`** (MODIFY): adds `aux_head` (sibling of
   `value_head`); forward returns 3-tuple `(logits, value, aux)`.
3. **`observation.py`** (MODIFY): adds `just_drawn_card` field
   (SLOT_DIM=90, encoded same as a hand-card slot).
4. **`FireplaceGymEnv`** (MODIFY): tracks `_last_drawn_card_obj`,
   `_last_draw_slot_idx`, `_last_deck_remaining_ids`; exposes them
   in `info` dict.
5. **`RolloutBuffer`** (MODIFY): stores `aux_target` and `aux_mask`
   per step.
6. **`PPOTrainer`** (MODIFY): computes `aux_loss = MSE(aux_pred[mask],
   aux_target[mask])`; `total_loss = ppo_loss + α × aux_loss` with
   warmup (α=0 for first `aux_warmup_iters`).
7. **`evaluate_pool`** (MODIFY): captures `mean_abs_draw_advantage` and
   `n_draw_events` during eval games.
8. **`MetricsLogger`** (MODIFY): adds `mean_abs_draw_advantage` column
   (12 total).
9. **`scripts/train.py`** (MODIFY): rollout loop calls counterfactual
   synthesis at draw events; trainer.update receives current_iter.
10. **`scripts/analyze_draws.py`** (NEW, path 2): CLI replay tool.
11. **`milestone.py`** (MODIFY, path 3): emits second CSV
    `heatmap_draw.csv` per matchup.
12. **`scripts/migrate_checkpoint.py`** (NEW): one-shot S2-A → S2-B
    state_dict migration (zero-pads the shared layer's new column block;
    random-inits aux_head).

### Data flow

```
agent step (rollout):
  V_t, action, log_prob = network(obs_t)         # 3-tuple, ignore aux
  next_obs, reward, term, trunc, info = env.step(action)

  # env writes draw metadata to info if a draw happened during this step
  if info["draw_event"]:
    slot_idx = info["draw_slot_idx"]               # int, where new card landed
    deck_alt = info["deck_remaining_ids"]          # list[str], alternatives
    K = config.aux_counterfactual_k                # default 4
    sampled_X = random.sample(deck_alt, min(K, len(deck_alt)))
    synth_batch = stack([
      synthesize_obs(next_obs, slot_idx, X')
      for X' in sampled_X
    ])
    with torch.no_grad():
      _, V_alts, _ = network(synth_batch)          # (K, 1)
    baseline = V_alts.mean().item()
    V_actual = ...  (computed at next iter when we forward next_obs)
    aux_target = V_actual − baseline               # set at NEXT iteration
    aux_mask = True
  else:
    aux_target = 0.0
    aux_mask = False

  buffer.add(obs_t, action, reward, V_t, log_prob, term,
             aux_target=aux_target, aux_mask=aux_mask)

PPO update:
  policy_loss, value_loss, entropy = compute_ppo_losses(rollout)
  if iter < aux_warmup_iters:
    effective_aux_coef = 0.0
  else:
    effective_aux_coef = config.aux_loss_coef
  aux_pred = network(obs).aux_head[aux_mask]
  aux_loss = MSE(aux_pred, rollout.aux_target[aux_mask])
  total = ppo_total + effective_aux_coef × aux_loss
```

(See "Component design" below for the precise rollout-loop pseudocode.
The aux_target is computed at iteration t+1 after the draw at step t,
because we need V on s_after which is the obs returned at t+1; the
baseline is computed at iteration t+1 right before V_actual.)

### Compute overhead

`50-200 draw events / rollout × K=4 extra V forwards = 200-800 extra
forwards / 2048 steps`, **rollout cost +10-30%**. Update phase
unchanged (aux_target stored as scalar in buffer).

## File layout

```
hearthstone/ai/
├── network.py                    MODIFY  +30 LOC
│     - aux_head: nn.Sequential(Linear → ReLU → Linear → 1), mirror of value_head
│     - flat_dim grows by 1 × hidden_dim (just_drawn_card slot)
│     - forward returns (policy_logits, value, aux_advantage)
├── env/
│   ├── observation.py            MODIFY  +20 LOC
│   │     - OBS_KEYS adds "just_drawn_card"
│   │     - make_observation_space adds Box(0., 1., (SLOT_DIM,), float32)
│   │     - build_observation_for(env, perspective_player,
│   │                              latest_drawn_card_obj=None) — new kwarg
│   ├── card_features.py          MODIFY  +15 LOC
│   │     - encode_hand_card_by_id(card_id: str) — used by synthesis
│   ├── fireplace_env.py          MODIFY  +80 LOC
│   │     - reset() clears all draw state
│   │     - step() tracks hand_before entity_id set; computes new_entities;
│   │       sets _last_drawn_card_obj, _last_draw_slot_idx,
│   │       _last_deck_remaining_ids, _last_n_drawn
│   │     - _info_with_draw() adds 4 keys to info
│   │     - obs uses _last_drawn_card_obj for just_drawn_card
│   ├── counterfactual.py         NEW    ~80 LOC
│   │     - synthesize_obs(obs, slot_idx, alt_card_id) -> dict
│   │     - sample_counterfactual_baseline(obs, info, network, device, K=4,
│   │                                       rng=None) -> (baseline, n_sampled)
│   └── (other env modules unchanged)
├── rollout_buffer.py             MODIFY  +40 LOC
│     - _aux_target / _aux_mask lists
│     - add() new kwargs aux_target=0.0, aux_mask=False
│     - get() returns aux_target, aux_mask in batch dict
│     - reset() clears them
├── ppo_trainer.py                MODIFY  +35 LOC
│     - __init__ adds aux_loss_coef (default 0.5), aux_warmup_iters (default 100)
│     - update(batch, current_iter=0) returns dict with new "aux_loss" key
│     - aux_loss masked MSE; effective_aux_coef = 0 during warmup
├── training_utils.py             MODIFY  +15 LOC
│     - _HEADER adds "mean_abs_draw_advantage" (12 columns total)
│     - log_eval kwarg mean_abs_draw_advantage=0.0
│     - log_iter / log_milestone padding adjusted for new column
├── evaluate.py                   MODIFY  +50 LOC
│     - evaluate_pool tracks abs_advantages list; forwards network at
│       draw events when current_player is training_player
│     - returns dict adds mean_abs_draw_advantage, n_draw_events
├── milestone.py                  MODIFY  +60 LOC                       [path 3]
│     - _run_round_robin tracks per-matchup abs_advantages + n_draw_events
│     - emits second CSV heatmap_draw.csv (atomic rename)
├── config.py                     MODIFY  +15 LOC
│     - TrainConfig adds 4 new fields with defaults (backward compat):
│         aux_loss_coef: float = 0.5
│         aux_warmup_iters: int = 100
│         aux_counterfactual_k: int = 4
│         draw_advantage_threshold: float = 0.15

scripts/
├── train.py                      MODIFY  +40 LOC
│     - rollout loop calls sample_counterfactual_baseline at draw events
│     - trainer.update(batch, current_iter=it) passes iter
│     - log_eval gets mean_abs_draw_advantage from eval_result
├── analyze_draws.py              NEW    ~150 LOC                       [path 2]
│     - CLI: --checkpoint, --decks, --n-games, --output, --threshold, --seed
│     - Plays N games (greedy agent vs RandomOpponent); per-draw CSV
├── migrate_checkpoint.py         NEW     ~80 LOC                       [NICE #10]
│     - S2-A → S2-B state_dict migration
│     - shared.0.weight padded with zeros at just_drawn_card column block
│     - aux_head random-init

configs/default.yaml              MODIFY  4 new keys

tests/unit/ai/
├── test_network.py               MODIFY  3-tuple destructure + aux shape tests
├── env/test_observation.py       MODIFY  +3 just_drawn_card tests
├── env/test_fireplace_env.py     MODIFY  +6 draw-event detection tests
├── env/test_counterfactual.py    NEW     ~80 LOC, synthesize + baseline tests
├── test_rollout_buffer.py        MODIFY  +3 aux field round-trip tests
├── test_ppo_trainer.py           MODIFY  +5 aux loss + warmup tests
├── test_evaluate.py              MODIFY  +2 mean_abs_draw_advantage tests
├── test_training_utils.py        MODIFY  12-col header; updated padding tests
├── test_milestone.py             MODIFY  +1 two-CSV regression test     [path 3]
├── test_analyze_draws.py         NEW     ~80 LOC                        [path 2]
└── test_migrate_checkpoint.py    NEW     ~60 LOC                        [NICE #10]
```

Net code change: **~530 LOC source + ~270 LOC tests new/modified**.

## Component design

### `counterfactual.py`

```python
"""Counterfactual obs synthesis for the draw-quality auxiliary head."""
from __future__ import annotations

import random
from typing import Optional

import numpy as np
import torch

from .card_features import encode_hand_card_by_id


def synthesize_obs(obs: dict, draw_slot_idx: int, alt_card_id: str) -> dict:
    """Return a deep-copy of `obs` with player_hand[draw_slot_idx] and
    just_drawn_card replaced by the encoding of `alt_card_id`. All other
    fields are np.copy()'d. Asserts 0 <= draw_slot_idx < MAX_HAND."""
    enc = encode_hand_card_by_id(alt_card_id)
    out = {k: v.copy() for k, v in obs.items()}
    assert 0 <= draw_slot_idx < out["player_hand"].shape[0]
    out["player_hand"][draw_slot_idx] = enc
    out["just_drawn_card"] = enc
    return out


def sample_counterfactual_baseline(
    obs: dict, info: dict, network, device: str, K: int = 4,
    rng: Optional[random.Random] = None,
) -> tuple[float, int]:
    """Sample up to K alternative cards from info['deck_remaining_ids']
    and compute the mean V over the synthesized hypothetical obs.

    Returns (baseline, n_sampled). n_sampled = min(K, len(deck_remaining)).
    Returns (0.0, 0) if no alternatives available (deck empty / no draw).
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
    batched = {
        k: torch.from_numpy(np.stack([o[k] for o in synth_obs_list])).to(device)
        for k in synth_obs_list[0].keys()
    }
    with torch.no_grad():
        _, values, _ = network(batched)
    baseline = float(values.mean().item())
    return baseline, len(sampled_ids)
```

### `PolicyValueNetwork` (modified)

```python
class PolicyValueNetwork(nn.Module):
    def __init__(self, slot_dim=90, hidden_dim=128, num_actions=512,
                 embedding_dim=None):
        super().__init__()
        if embedding_dim is not None:
            slot_dim = embedding_dim
        self.card_encoder = CardEncoder(slot_dim, hidden_dim)
        self.num_scalars = len(SCALAR_KEYS)            # 21
        # 10 hand + 14 board + 1 just_drawn_card slots, all sharing CardEncoder
        flat_dim = (10 + 2*7 + 1) * hidden_dim + self.num_scalars
        self.shared = nn.Sequential(
            nn.Linear(flat_dim, hidden_dim*2), nn.ReLU(),
            nn.Linear(hidden_dim*2, hidden_dim), nn.ReLU(),
        )
        self.policy_head = nn.Linear(hidden_dim, num_actions)
        self.value_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim//2), nn.ReLU(),
            nn.Linear(hidden_dim//2, 1),
        )
        # NEW: same shape as value_head
        self.aux_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim//2), nn.ReLU(),
            nn.Linear(hidden_dim//2, 1),
        )

    def forward(self, obs: dict) -> tuple:
        """Returns (policy_logits, value, aux_advantage). All callers
        must destructure 3 items even if they ignore aux."""
        batch_size = obs["player_health"].shape[0]
        hand_enc       = self.card_encoder(obs["player_hand"])
        p_board_enc    = self.card_encoder(obs["player_board"])
        o_board_enc    = self.card_encoder(obs["opponent_board"])
        # just_drawn_card: shape (B, slot_dim) → (B, 1, slot_dim) → encode → (B, 1, h)
        # Reuses CardEncoder weights with hand cards (intentional: same feature space).
        drawn_enc      = self.card_encoder(obs["just_drawn_card"].unsqueeze(1))

        flat = torch.cat([
            hand_enc.reshape(batch_size, -1),
            p_board_enc.reshape(batch_size, -1),
            o_board_enc.reshape(batch_size, -1),
            drawn_enc.reshape(batch_size, -1),
            torch.cat([obs[k] for k in SCALAR_KEYS], dim=-1),
        ], dim=-1)
        h = self.shared(flat)
        return self.policy_head(h), self.value_head(h), self.aux_head(h)
```

#### 3-tuple breaking change — caller checklist

| Site | Old | New |
|---|---|---|
| `ppo_trainer.py:62` (update) | `logits, values = self.network(obs)` | `logits, values, aux_preds = self.network(obs)` |
| `ppo_trainer.py:108` (select_action) | `logits, value = self.network(obs_d)` | `logits, value, _ = self.network(obs_d)` |
| `env/opponents.py:58` (SelfPlayOpponent.act) | `logits, _ = self.network(torch_obs)` | `logits, _, _ = self.network(torch_obs)` |
| `scripts/train.py:95` (_bootstrap_value) | `_, value = network(torch_obs)` | `_, value, _ = network(torch_obs)` |
| `scripts/train.py` (rollout loop, NEW) | n/a | `logits, value, _ = network(torch_obs)` |
| `tests/unit/ai/test_network.py:22, 29, 39` | 2-tuple destructure asserts | 3-tuple + new aux shape assertion |

### `observation.py` (modified)

```python
OBS_KEYS = (
    "player_hand", "player_board", "opponent_board",
    "just_drawn_card",                # NEW
) + SCALAR_KEYS

def make_observation_space():
    return spaces.Dict({
        "player_hand":     spaces.Box(0., 1., (MAX_HAND, SLOT_DIM), np.float32),
        "player_board":    spaces.Box(0., 1., (MAX_BOARD, SLOT_DIM), np.float32),
        "opponent_board":  spaces.Box(0., 1., (MAX_BOARD, SLOT_DIM), np.float32),
        "just_drawn_card": spaces.Box(0., 1., (SLOT_DIM,), np.float32),  # NEW
        **{k: spaces.Box(*SCALAR_BOUNDS[k], (1,), np.float32) for k in SCALAR_KEYS},
    })

def build_observation_for(env, perspective_player,
                          latest_drawn_card_obj=None):       # NEW kwarg
    """latest_drawn_card_obj: a fireplace card (with .id) or None.
    None → just_drawn_card is zeros. Else encode via
    encoder.encode_hand_card(card_obj)."""
    enc = CardFeatureEncoder()
    ...existing scalars + hand + boards encoding...
    if latest_drawn_card_obj is not None:
        just_drawn = enc.encode_hand_card(latest_drawn_card_obj)
    else:
        just_drawn = np.zeros(SLOT_DIM, dtype=np.float32)
    return {..., "just_drawn_card": just_drawn, ...}
```

### `card_features.py` (modified)

Adds:

```python
def encode_hand_card_by_id(card_id: str) -> np.ndarray:
    """Resolve card_id via fireplace.cards.db and encode as a hand-card slot.
    Used by counterfactual synthesis where we have card_ids but no live
    fireplace card objects."""
    from fireplace import cards as fp_cards
    fp_cards.db.initialize()
    card_def = fp_cards.db[card_id]
    enc = CardFeatureEncoder()
    return enc.encode_hand_card(card_def)
```

### `FireplaceGymEnv` (modified)

```python
class FireplaceGymEnv(gym.Env):
    def __init__(self, decks, ..., seed=None):
        ...existing fields...
        # NEW: draw-event metadata, reset on every reset() and updated
        # on every step() that produces a draw.
        self._last_drawn_card_obj = None
        self._last_draw_slot_idx: Optional[int] = None
        self._last_deck_remaining_ids: list[str] = []
        self._last_n_drawn: int = 0

    def reset(self, *, seed=None, options=None):
        ...existing reset logic...
        # Clear ALL draw state at every reset (Blocker #3 fix).
        self._last_drawn_card_obj = None
        self._last_draw_slot_idx = None
        self._last_deck_remaining_ids = []
        self._last_n_drawn = 0
        return self._build_observation(), self._info_with_draw()

    def step(self, action_idx: int):
        valid = self.current_valid_actions
        invalid = action_idx >= len(valid) or action_idx < 0
        if invalid:
            obs = self._build_observation()
            return obs, -0.01, bool(self.game.ended), False, self._info_with_draw()

        # Snapshot hand entity_ids and deck contents BEFORE dispatch
        hand_before_ids = {c.entity_id for c in self.training_player.hand}
        deck_before_ids = [c.id for c in self.training_player.deck]

        before = self._reward_snapshot()
        dispatch(valid[action_idx], self.game)
        self._auto_resolve_choices()
        after = self._reward_snapshot()
        reward = self._reward_fn.calc(before, after, self.training_player)

        # Detect draw event by hand entity_id diff (handles multi-draw,
        # overdraw burns: burned cards never enter hand → not in new_entities).
        hand_after = list(self.training_player.hand)
        new_entities = [
            c for c in hand_after if c.entity_id not in hand_before_ids
        ]
        if new_entities:
            self._last_drawn_card_obj = new_entities[-1]   # last drew (v1)
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
        return obs, float(reward), terminated, False, self._info_with_draw()

    def _build_observation(self) -> dict:
        return build_observation_for(
            self.game, self.training_player,
            latest_drawn_card_obj=self._last_drawn_card_obj,
        )

    def _info_with_draw(self) -> dict:
        return {
            **self._info(),                                  # existing keys
            "draw_event": self._last_n_drawn > 0,             # NEW
            "n_drawn": self._last_n_drawn,                    # NEW
            "draw_slot_idx": self._last_draw_slot_idx,        # NEW
            "deck_remaining_ids": list(self._last_deck_remaining_ids),  # NEW
        }

    @staticmethod
    def _compute_alt_pool(deck_before_ids: list[str],
                          drawn_ids: list[str]) -> list[str]:
        """Counterfactual alternative pool: deck contents at moment of
        draw, minus the cards actually drawn."""
        alt = list(deck_before_ids)
        for did in drawn_ids:
            if did in alt:
                alt.remove(did)
        return alt
```

#### Multi-draw / overdraw semantics

- **Multi-draw step**: a single env.step that produces ≥ 2 draws (e.g.,
  agent plays Arcane Intellect → draws 2 cards; then auto-resolves into
  end-of-turn → opponent's turn → agent's start-of-turn draw — though
  this last one is in the NEXT env.step). v1 records ONLY the last
  drawn card, attributes the FULL `V_after − baseline` to it.
  `info["n_drawn"] > 1` flags multi-draw events.
- **Overdraw burn** (hand at 10, draw resolves into burn): the drawn
  card never enters `player.hand`. `new_entities = []` → no draw event
  recorded → not part of aux training. Documented as known limitation.
- **First obs from `reset()`**: opponent may go first if `swap_training_player=True`
  picks `training_player_idx=1`. The opponent's full first turn runs in
  `OpponentEnv._loop_opponent`. By the time `reset()` returns, the
  agent has seen a board where the opponent already played; `_last_drawn_card_obj`
  reflects whatever happened in that opponent loop. v1 accepts this:
  the first draw event of every episode after a swap-to-p2 may be one
  of opponent's draws (which our env's training_player tracking ignores —
  we only diff `training_player.hand`, not opponent.hand). Net: no spurious
  aux training data is recorded for opponent's draws.

### `RolloutBuffer` (modified)

```python
class RolloutBuffer:
    def __init__(self, capacity, gamma, gae_lambda):
        ...
        self._aux_target: list[float] = []
        self._aux_mask: list[bool] = []

    def add(self, obs, action, reward, value, log_prob, done,
            aux_target: float = 0.0, aux_mask: bool = False):
        ...
        self._aux_target.append(aux_target)
        self._aux_mask.append(aux_mask)

    def get(self) -> dict:
        batch = {...existing fields...}
        batch["aux_target"] = np.asarray(self._aux_target, dtype=np.float32)
        batch["aux_mask"]   = np.asarray(self._aux_mask, dtype=bool)
        return batch

    def reset(self):
        ...
        self._aux_target.clear()
        self._aux_mask.clear()
```

### Rollout loop (in `scripts/train.py`)

```python
from hearthstone.ai.env.counterfactual import sample_counterfactual_baseline

obs, info = env.reset()    # info has draw_event=False (clean reset)
for _ in range(config.rollout_steps):
    torch_obs = _build_obs_for_network(obs, device)
    logits, value, _aux = network(torch_obs)        # 3-tuple, ignore aux
    value_scalar = float(value[0, 0].item())

    # If THIS obs has a draw event (came from previous step), compute
    # counterfactual aux target by synthesizing K hypothetical obs.
    if info.get("draw_event", False):
        baseline, n_sampled = sample_counterfactual_baseline(
            obs, info, network, device, K=config.aux_counterfactual_k,
        )
        if n_sampled > 0:
            aux_target = value_scalar - baseline
            aux_mask = True
        else:
            aux_target = 0.0
            aux_mask = False
    else:
        aux_target = 0.0
        aux_mask = False

    mask = _action_mask(env, n_actions=config.num_actions)
    action, log_prob = trainer.sample_action(logits, mask)

    next_obs, reward, terminated, truncated, info = env.step(action)
    buffer.add(obs, action, reward, value_scalar, log_prob, terminated,
               aux_target=aux_target, aux_mask=aux_mask)

    obs = next_obs
    if terminated or truncated:
        obs, info = env.reset()    # info naturally clears on reset
```

#### Worked timing example

```
t   action   env transition          info["draw_event"] coming OUT  aux pairing
                                     of THIS step's env.step
0   reset    reset; opp goes first   False (no draw yet on reset)   skip
1   end_turn opp turn + my draw      True  (n_drawn=1, slot_idx=3)   skip (no prev)
2   ply Arc  spell played, drew 2    True  (n_drawn=2, slot_idx=4)   compute target at t=2
3   ply Coin coin played, no draw   False                            skip
4   end_turn opp turn + my draw      True  (n_drawn=1, slot_idx=5)   compute target at t=4
...
```

At t=1, `info["draw_event"]=True` from the env.step at t=0, but `prev_V`
in our model is the V at t=0 (which is None / from reset). However,
under the COUNTERFACTUAL approach we don't use prev_V at all — we
compute `aux_target = V_t − baseline` where baseline is computed by
synthesizing K alt obs from t's `info["deck_remaining_ids"]`. So the
worked timing is simpler: every `t` where `info["draw_event"]=True`,
synthesize K alternatives and compute baseline; that's our target.

### `PPOTrainer` (modified)

```python
class PPOTrainer:
    def __init__(self, network, lr, gamma, gae_lambda, clip_epsilon,
                 value_coef, entropy_coef, max_grad_norm, ppo_epochs,
                 aux_loss_coef: float = 0.5,        # NEW
                 aux_warmup_iters: int = 100):       # NEW
        ...
        self.aux_loss_coef = aux_loss_coef
        self.aux_warmup_iters = aux_warmup_iters

    def update(self, batch: dict, current_iter: int = 0) -> dict:
        obs = self._batch_obs_to_torch(batch)
        actions = torch.from_numpy(batch["actions"]).to(self.device)
        old_log_probs = torch.from_numpy(batch["old_log_probs"]).to(self.device)
        advantages = torch.from_numpy(batch["advantages"]).to(self.device)
        returns = torch.from_numpy(batch["returns"]).to(self.device)
        aux_target = torch.from_numpy(batch["aux_target"]).to(self.device)
        aux_mask = torch.from_numpy(batch["aux_mask"]).to(self.device)

        # Aux warmup: zero coef for first N iters; rationale (Important #6):
        # early-training V is poorly calibrated; aux signal is noisy; let
        # the value head stabilize first.
        effective_aux_coef = (
            0.0 if current_iter < self.aux_warmup_iters else self.aux_loss_coef
        )

        losses = {"total_loss": 0., "policy_loss": 0., "value_loss": 0.,
                  "entropy": 0., "aux_loss": 0., "aux_n_samples": 0.}

        for _ in range(self.ppo_epochs):
            logits, values, aux_preds = self.network(obs)        # 3-tuple

            ...existing PPO three terms (policy_loss, value_loss, entropy)...

            n_aux = int(aux_mask.sum().item())
            if n_aux > 0:
                aux_loss = F.mse_loss(
                    aux_preds.squeeze(-1)[aux_mask], aux_target[aux_mask],
                )
            else:
                aux_loss = torch.tensor(0.0, device=self.device)

            total = (policy_loss
                     + self.value_coef * value_loss
                     - self.entropy_coef * entropy
                     + effective_aux_coef * aux_loss)

            self.optimizer.zero_grad()
            total.backward()
            torch.nn.utils.clip_grad_norm_(
                self.network.parameters(), self.max_grad_norm,
            )
            self.optimizer.step()

            for k, v in [("total_loss", total), ("policy_loss", policy_loss),
                         ("value_loss", value_loss), ("entropy", entropy),
                         ("aux_loss", aux_loss)]:
                losses[k] += float(v.item()) / self.ppo_epochs
            losses["aux_n_samples"] = float(n_aux)

        return losses
```

`scripts/train.py` calls `trainer.update(batch, current_iter=it)` to pass
the iteration index. Existing call sites that did `trainer.update(batch)`
keep working via the default `current_iter=0` (which means warmup is
always active — fine, just reset semantics).

`select_action` updated to destructure 3-tuple internally:

```python
def select_action(self, obs_d, mask):
    logits, value, _aux = self.network(obs_d)        # was (logits, value)
    ...
```

### `evaluate_pool` (modified)

```python
def evaluate_pool(network, opponent_factory, decks, n_games=100,
                  slot_dim=90, hidden_dim=128, num_actions=512,
                  max_actions_per_game=1000, seed=None,
                  stratified=True) -> dict:
    ...
    abs_advantages = []                            # NEW
    n_draw_events = 0                               # NEW

    for g, (i, j, tp_idx) in enumerate(sampler):
        env = FireplaceGymEnv(...)
        opp = opponent_factory()
        obs, info = env.reset()                    # NEW: capture obs+info

        action_count = 0
        while not env.game.ended and action_count < max_actions_per_game:
            if env.game.current_player is env.training_player:
                # Capture aux on draw events
                if info.get("draw_event", False):
                    torch_obs = {k: torch.from_numpy(v).unsqueeze(0)
                                 for k, v in obs.items()}
                    with torch.no_grad():
                        _, _, aux = network(torch_obs)
                    abs_advantages.append(abs(float(aux[0, 0].item())))
                    n_draw_events += 1
                action = eval_agent.act(env)
            else:
                action = opp.act(env)
            obs, _, term, trunc, info = env.step(action)
            action_count += 1
        ...

    mean_abs = (sum(abs_advantages) / len(abs_advantages)
                if abs_advantages else 0.0)
    return {
        "winrate": ..., "n_games": ..., "matchups_seen": ...,
        "cap_hit_count": ...,
        "mean_abs_draw_advantage": mean_abs,        # NEW
        "n_draw_events": n_draw_events,             # NEW (informational)
    }
```

### `MetricsLogger` (modified, 12-column CSV)

```python
_HEADER = [
    "iter", "phase", "total_loss", "policy_loss", "value_loss",
    "entropy", "eval_winrate", "best_winrate", "plateau_count",
    "cap_hit_count", "milestone_path",
    "mean_abs_draw_advantage",         # NEW (12 columns total)
]

class MetricsLogger:
    def log_iter(self, iter, phase, total_loss, policy_loss, value_loss, entropy):
        # 6 fields + 6 trailing blanks (was 5)
        self._writer.writerow([
            iter, phase, total_loss, policy_loss, value_loss, entropy,
            "", "", "",       # eval cols blank
            "", "",            # cap_hit_count + milestone_path blank
            "",                # mean_abs_draw_advantage blank
        ])
        self._file.flush()

    def log_eval(self, iter, phase, eval_winrate, best_winrate, plateau_count,
                 cap_hit_count=0, mean_abs_draw_advantage=0.0):    # NEW kwarg
        self._writer.writerow([
            iter, phase, "", "", "", "",
            eval_winrate, best_winrate, plateau_count,
            cap_hit_count, "",                # milestone_path blank
            mean_abs_draw_advantage,           # NEW
        ])
        self._file.flush()

    def log_milestone(self, iter_num, csv_path):
        self._writer.writerow([
            iter_num, "", "", "", "", "",
            "", "", "",
            "", csv_path,
            "",                                # mean_abs_draw_advantage blank
        ])
        self._file.flush()
```

### Replay tool — `scripts/analyze_draws.py` (path 2)

CLI:

```bash
python scripts/analyze_draws.py \
    --checkpoint checkpoints/best.pt \
    --decks aggro_mage,control_warrior \
    --n-games 20 \
    --output runs/draws_analysis.csv \
    [--threshold 0.15] [--seed 42]
```

| Arg | Type | Default | Meaning |
|---|---|---|---|
| `--checkpoint` | str | required | trained network checkpoint |
| `--decks` | comma-sep str | all 18 from `default.yaml` | deck pool subset (≥ 2) |
| `--n-games` | int | 20 | total games |
| `--output` | str | required | output CSV path |
| `--threshold` | float | `cfg.draw_advantage_threshold` (=0.15) | score → label cutoff |
| `--seed` | int | 42 | RNG seed (independent of training) |

CSV format:

```
game_idx, turn, deck_agent, deck_opponent, training_player_idx,
drawn_card_id, drawn_card_name, drawn_card_cost,
draw_advantage_score, label
```

Label: `"神抽"` if `score > threshold`, `"鬼抽"` if `score < -threshold`,
else `"普通"`.

Implementation: matches milestone semantics — greedy agent (loaded from
checkpoint) plays a sampled deck against `RandomOpponent`. At each draw
event on training_player's turn, forward network with current obs and
record aux output as `draw_advantage_score`.

### Milestone draw heatmap (path 3)

`milestone.py:_run_round_robin` writes a SECOND CSV `heatmap_draw.csv`
in the same directory as `heatmap.csv`. Per-matchup row:

```
deck_a, deck_b, training_player_idx, n_games,
mean_abs_draw_advantage, n_draw_events
```

Implementation: extend the per-game inner loop to track `abs_advantages`
and `n_draw_events` (using the same forward-network-on-draw-event
pattern as `evaluate_pool`); per-matchup mean over all games.

`MilestoneRunner.submit` return value is unchanged (path to `heatmap.csv`);
the sibling `heatmap_draw.csv` is implicit. `scripts/train.py` does NOT
log `heatmap_draw.csv` separately to `metrics.csv` — users find it in
the same `iter_NNNN/` directory as `heatmap.csv` + `checkpoint.pt`.

### Checkpoint migration (`scripts/migrate_checkpoint.py`)

Old S2-A checkpoints' `network` state_dict has `shared.0.weight` of shape
`(hidden_dim*2, OLD_FLAT_DIM)` where `OLD_FLAT_DIM = (10 + 14) * hidden_dim + 21`.
S2-B's `NEW_FLAT_DIM = (10 + 14 + 1) * hidden_dim + 21`. The new column
block (size `hidden_dim`) corresponds to the `just_drawn_card` slot.

```python
def migrate(in_path: str, out_path: str) -> None:
    ckpt = torch.load(in_path, map_location="cpu")
    cfg = ckpt.get("config", {})
    slot_dim   = int(cfg.get("slot_dim", 90))
    hidden_dim = int(cfg.get("hidden_dim", 128))
    num_actions = int(cfg.get("num_actions", 512))

    net = PolicyValueNetwork(slot_dim=slot_dim, hidden_dim=hidden_dim,
                              num_actions=num_actions)
    new_sd = net.state_dict()
    old_sd = ckpt["network"]

    for k, new_v in new_sd.items():
        if k.startswith("aux_head."):
            continue                               # leave random-init
        if k == "shared.0.weight":
            old_w = old_sd[k]                      # (h*2, OLD_FLAT_DIM)
            zeros = torch.zeros(
                old_w.shape[0], hidden_dim, dtype=old_w.dtype,
            )
            # Insert zero block where just_drawn_card lands in the concat:
            # after hand+boards (24*hidden), before scalars (21).
            split = (10 + 2*7) * hidden_dim
            new_v.data = torch.cat([
                old_w[:, :split],
                zeros,
                old_w[:, split:],
            ], dim=1)
            continue
        if k in old_sd and old_sd[k].shape == new_v.shape:
            new_v.data = old_sd[k].clone()

    ckpt["network"] = new_sd
    # Inject S2-B config defaults (in case old config lacks them)
    ckpt["config"]["aux_loss_coef"] = 0.5
    ckpt["config"]["aux_warmup_iters"] = 100
    ckpt["config"]["aux_counterfactual_k"] = 4
    ckpt["config"]["draw_advantage_threshold"] = 0.15
    torch.save(ckpt, out_path)
    print(f"migrated {in_path} → {out_path} (S2-A → S2-B network shape)")
```

CLI: `python scripts/migrate_checkpoint.py --in old.pt --out new.pt`

## Configuration

`configs/default.yaml` adds 4 keys at the bottom:

```yaml
# === S2-B aux head ===
aux_loss_coef: 0.5
aux_warmup_iters: 100
aux_counterfactual_k: 4
draw_advantage_threshold: 0.15
```

`TrainConfig` adds 4 fields with defaults (so old YAMLs without these
keys load without error):

```python
@dataclass
class TrainConfig:
    ...existing 30+ fields...
    aux_loss_coef: float = 0.5
    aux_warmup_iters: int = 100
    aux_counterfactual_k: int = 4
    draw_advantage_threshold: float = 0.15
```

`_strip_deprecated` is unchanged. The new fields are forward-compatible
with existing config.yaml files (default if missing).

## Failure modes

| Failure | Detection | Response |
|---|---|---|
| `info["draw_event"] = True` but `deck_remaining_ids = []` (deck empty) | `sample_counterfactual_baseline` returns `(0.0, 0)` | Skip aux sample (mask=False); no error |
| Multi-draw step records only LAST card | `info["n_drawn"] > 1` | Accept as v1 limitation; documented |
| Overdraw burn (hand at 10, drawn card destroyed) | `new_entities = []` → no draw event | Already handled; not in aux training |
| `_last_draw_slot_idx` outside `[0, MAX_HAND)` | `synthesize_obs` `assert 0 <= slot_idx < shape` | AssertionError; should never fire under fireplace's hand-size cap |
| Aux warmup keeps `aux_loss_coef = 0` for first N iters | `effective_aux_coef = 0.0` in trainer.update | Expected; logged in metrics.csv as `aux_loss=0` (well, computed but multiplied by 0 → no gradient) |
| Aux samples in rollout = 0 (rare; long agent turns without draws) | `aux_mask.sum() == 0` | `aux_loss = tensor(0.0)`; total_loss unaffected |
| Old S2-A checkpoint resume shape mismatch | `load_state_dict(strict=True)` raises RuntimeError | Error message guides user: `python scripts/migrate_checkpoint.py --in old.pt --out new.pt` |
| `evaluate_pool` during warmup → `mean_abs_draw_advantage ≈ 0` | n/a | Expected; visible in CSV |
| Counterfactual K in deck end-game (deck only has 1-2 cards left) | `min(K, len(deck_alt))` clamps | Already handled |
| `analyze_draws.py` run on random-init network | n/a | Outputs near-zero scores everywhere; user should run on trained checkpoint |
| Milestone subprocess in warmup → `heatmap_draw.csv` all 0 | n/a | Documented; users check `metrics.csv:mean_abs_draw_advantage` to know if past warmup |

## Testing strategy

### Modified existing tests

| File | Changes |
|---|---|
| `tests/unit/ai/test_network.py` | Update 3 existing tests for 3-tuple destructure; add `test_forward_returns_three_tuple_with_correct_shapes`, `test_aux_head_gradient_flows`, `test_aux_head_dimensions_mirror_value_head` |
| `tests/unit/ai/env/test_observation.py` | Add `test_just_drawn_card_zero_when_no_draw`, `test_just_drawn_card_filled_when_drawn_card_obj`, `test_obs_keys_includes_just_drawn_card` |
| `tests/unit/ai/env/test_fireplace_env.py` | Add `test_reset_clears_last_drawn_card_state` (Blocker #3); `test_step_records_draw_event_when_hand_grows`; `test_multi_draw_records_last_card_only`; `test_overdraw_burn_no_draw_event`; `test_info_has_draw_slot_idx_and_deck_remaining`; `test_episode_boundary_clears_draw_state` |
| `tests/unit/ai/test_rollout_buffer.py` | Add `test_aux_target_aux_mask_round_trip`, `test_aux_default_zero_and_false`, `test_reset_clears_aux_fields` |
| `tests/unit/ai/test_ppo_trainer.py` | Update existing dummy obs to include `just_drawn_card`; add `test_aux_loss_zero_when_no_mask`, `test_aux_loss_nonzero_when_mask_true`, `test_aux_warmup_zeros_aux_coef_for_first_iters`, `test_aux_loss_after_warmup_uses_full_coef`, `test_aux_gradient_propagates_to_aux_head` |
| `tests/unit/ai/test_evaluate.py` | Add `test_evaluate_pool_returns_mean_abs_draw_advantage`, `test_evaluate_pool_n_draw_events_counted` |
| `tests/unit/ai/test_training_utils.py` | Update `_HEADER` assertion (12 columns); update `test_log_iter_blanks_eval_columns` to 6 trailing blanks (was 5); update `test_log_eval_fills_cap_hit_count` to assert `mean_abs_draw_advantage`; update `test_log_milestone_writes_csv_path` to expect 1 trailing blank |
| `tests/unit/ai/test_milestone.py` | Add `test_milestone_writes_both_csvs` (path 3) |
| `tests/unit/ai/test_config.py` | Add `test_load_config_uses_aux_defaults_when_missing` (backward compat); update default.yaml load assertions |

### New test files

```
tests/unit/ai/env/test_counterfactual.py      NEW  ~80 LOC
  - test_synthesize_obs_preserves_other_slots
  - test_synthesize_obs_replaces_correct_hand_slot
  - test_synthesize_obs_replaces_just_drawn_card
  - test_sample_counterfactual_returns_zero_when_deck_empty
  - test_sample_counterfactual_K_capped_by_deck_size
  - test_sample_counterfactual_baseline_deterministic_for_full_deck

tests/unit/ai/test_analyze_draws.py           NEW  ~80 LOC          [path 2]
  - test_label_from_score_thresholds (boundary cases)
  - test_analyze_draws_writes_csv (@slow, end-to-end)

tests/unit/ai/test_migrate_checkpoint.py      NEW  ~60 LOC          [NICE #10]
  - test_migrate_round_trip_loads_under_new_network
  - test_migrate_pads_shared_layer_with_zeros
  - test_migrate_preserves_old_param_values
```

## Migration steps (PR series)

```
PR-1  Encoder helper + counterfactual module
        hearthstone/ai/env/card_features.py: encode_hand_card_by_id
        hearthstone/ai/env/counterfactual.py NEW
        tests/unit/ai/env/test_counterfactual.py NEW
        Pure functions; no caller changes; no obs/network changes;
        existing test suite unaffected.

PR-2  Network 3-tuple forward + obs just_drawn_card field + env draw tracking
        hearthstone/ai/network.py: aux_head + 3-tuple forward
        hearthstone/ai/env/observation.py: just_drawn_card field +
                                            build_observation_for kwarg
        hearthstone/ai/env/fireplace_env.py: track _last_drawn_card_obj
                                              and friends; info dict additions;
                                              reset clears
        Update ALL caller sites for 3-tuple destructure (per Section 2 table)
        Update test_network, test_observation, test_fireplace_env,
        test_opponents (3-tuple), test_evaluate (3-tuple)
        End-to-end: existing tests pass with new shape; new tests pass.
        aux_head's gradient is connected to network params but no loss
        targets it yet → benign random output during forward.

PR-3  RolloutBuffer aux fields + PPOTrainer aux loss + warmup + config
        hearthstone/ai/rollout_buffer.py: aux_target / aux_mask
        hearthstone/ai/ppo_trainer.py: aux_loss + warmup; new __init__ args
        hearthstone/ai/config.py: TrainConfig adds 4 new defaulted fields
        configs/default.yaml: add 4 new keys
        scripts/train.py: rollout loop calls sample_counterfactual_baseline;
                          trainer.update receives current_iter
        Update test_rollout_buffer, test_ppo_trainer, test_config, test_train_smoke
        End-to-end: smoke train produces metrics.csv with aux_loss column
        non-zero AFTER warmup; aux_loss=0 during warmup.

PR-4  evaluate_pool aux + MetricsLogger 12-col + replay tool
        hearthstone/ai/evaluate.py: mean_abs_draw_advantage / n_draw_events
        hearthstone/ai/training_utils.py: _HEADER 12 cols; log_eval kwarg
        scripts/train.py: log_eval call passes mean_abs_draw_advantage
        scripts/analyze_draws.py NEW + tests/unit/ai/test_analyze_draws.py NEW
        Update test_evaluate, test_training_utils.

PR-5  Milestone draw heatmap + checkpoint migration + final smoke
        hearthstone/ai/milestone.py: _run_round_robin emits heatmap_draw.csv
        scripts/migrate_checkpoint.py NEW + test_migrate_checkpoint.py NEW
        Update test_milestone with two-CSV regression
        End-to-end smoke: train 2 iters with milestone_every=1; verify both
        heatmap.csv and heatmap_draw.csv produced; verify analyze_draws
        runs against the trained checkpoint without crashes.
```

### High-risk areas

- **PR-2: 3-tuple breaking change**. Verify with grep before opening:

```bash
rg -n 'self\.network\(|network\(torch_obs|net\(' hearthstone/ scripts/ tests/
```

  Confirm every callsite destructures 3 items.

- **PR-3: aux_warmup_iters interaction with smoke tests**. With
  `max_iters=2` and `aux_warmup_iters=100` (default), warmup covers the
  whole smoke test → `aux_loss=0`. Smoke test must `--override
  aux_warmup_iters=0` to exercise the aux-loss code path.

- **PR-3: counterfactual synthesis K forward passes batched**. `synth_batch`
  is `torch.stack([...])`'d into one tensor before `network()` — do NOT
  Python-loop K calls. Test: `test_sample_counterfactual_baseline_uses_batched_forward`.

- **PR-5: milestone subprocess in aux_warmup**. If `iter < aux_warmup_iters`
  when the first milestone fires, `aux_head` is random-init and produces
  garbage; `heatmap_draw.csv` will show ≈0 mean_abs_draw_advantage.
  Documented as a known phase, not a bug.

## Spec self-review

- **Placeholders.** None. All defaults concrete: `aux_loss_coef=0.5`,
  `aux_warmup_iters=100`, `aux_counterfactual_k=4`,
  `draw_advantage_threshold=0.15`, K=4.
- **Internal consistency.**
  - `just_drawn_card` encoding via `CardEncoder` (same as hand cards) is
    consistent across `build_observation_for`, `synthesize_obs`,
    `encode_hand_card_by_id`.
  - `aux_target` semantics: rollout computes `V(s_after) − baseline` (a
    counterfactual advantage). This is consistent across rollout (where
    it's stored as scalar) and trainer (where it's the regression target).
  - 3-tuple forward: complete caller list in Section 2; tests added.
  - `_HEADER` 12 columns: iter, phase, total_loss, policy_loss, value_loss,
    entropy, eval_winrate, best_winrate, plateau_count, cap_hit_count,
    milestone_path, mean_abs_draw_advantage. log_iter writes 6+6 blanks;
    log_eval writes 9+1 blank+aux value; log_milestone writes 1+8 blanks
    +path+1 blank.
  - Multi-draw policy: take LAST card. Documented in Section 2; flagged
    as v1 limitation.
- **Scope check.** Single sub-project (S2-B). Includes paths 1+2+3 +
  ckpt migration + warmup. Defers: per-card aux resolution for multi-
  draw, draw advantage as policy input, human-labeled training data.
- **Ambiguity check.**
  - "draw event" = `len(player.hand)` net-grows by ≥ 1 in a single
    env.step. Overdraw burns (hand at 10, drawn card destroyed) do NOT
    count.
  - "alt pool" for counterfactual = deck contents at moment of draw,
    minus the actually-drawn cards.
  - aux head is trained on values centered around 0: positive ≈ 神抽,
    negative ≈ 鬼抽, near-zero ≈ 普通. The `mean_abs_draw_advantage`
    metric reports the average magnitude (calibration health), not the
    average score (which should be ≈ 0 by construction over many samples).
  - replay tool's threshold default 0.15 is a starting heuristic; users
    can override per checkpoint based on the score distribution they
    observe in their own runs.

### Changelog

- **rev 1 (2026-05-03)**: initial draft post brainstorming + 1 round of
  subagent self-review.
  - Decision #4 reverted: from "Temporal V delta" (single-line
    estimator) to "Counterfactual via obs synthesis" (K=4 sampled alts).
    Reviewer Blocker #1 surfaced cross-turn confound in the temporal
    delta approach; the synthesized counterfactual gives a true
    advantage signal at ~10-30% rollout overhead.
  - `reset()` clears `_last_drawn_card_obj` and friends (Blocker #3).
  - aux_loss_coef default raised from 0.1 to 0.5 (Important #5: aux
    samples are sparse; per-sample weight needs to be higher to drive
    learning).
  - aux_warmup_iters=100 added (Important #6: V→aux→V instability
    early when V is poorly calibrated).
  - 3-tuple forward complete caller list (Important #7).
  - evaluate_pool aux capture rewritten with explicit obs+info
    tracking (Important #9).
  - Multi-draw "last drew" attribution + overdraw burn skip (NICE #11
    addressed).
  - migrate_checkpoint.py for S2-A → S2-B (NICE #10).
  - Test coverage list across all phases (NICE #12).
