# Multi-Deck Training Pool Design (S2-A)

**Date:** 2026-05-01
**Status:** Approved, ready for implementation plan
**Predecessor:** `docs/specs/2026-05-01-fireplace-integration-design.md` (S1' fireplace integration — completed, commit `d57419f`)

## Goal

Expand training from the current 2-deck pool (basic_mage / basic_warrior) to
**18 decks** spanning 9 classes × 2 archetypes (aggro / control), so the agent
trains across **18 × 17 = 306 directed matchups** instead of 1. Add the
machinery the curriculum needs to track progress in this richer setting:
fast-eval over a sampled subset of matchups every iteration, plus a
periodic full-pool round-robin **milestone** evaluation that runs in a
**subprocess** so the main training loop's throughput is not hit. Randomize
the agent's `training_player_idx` per episode so it learns both first- and
second-player play.

This is the prerequisite stage for sub-project S2-B (神抽/鬼抽 auxiliary
head): a multi-deck training distribution gives the draw-quality signal
enough variance to be learnable.

## Non-goals

- The auxiliary "draw quality" head — that is sub-project S2-B (next spec).
- Smarter `ChooseOnePolicy` than `FirstChoiceOne`. The known bias against
  Druid (every Wrath is "Heavy", every Druid of the Claw is "Bear form",
  etc.) is documented and accepted for this stage. See "Druid bias" below.
- Multi-process **rollout collection**. Only milestone eval runs in a
  subprocess; PPO rollouts stay single-process.
- TensorBoard / W&B integration. CSV remains the source of truth.
- GPU training. CPU-only assumed; subprocess uses `mp_context='spawn'` and
  `torch.set_num_threads(1)` regardless.
- Random deck **drafting** at episode boundaries (`fireplace.utils.random_draft`).
  The pool is fixed: 18 hand-authored YAMLs.
- Online/streaming addition of decks. The deck pool is loaded once at
  startup; changing it requires a restart.

## Decisions locked in during brainstorming

| Decision | Choice |
|---|---|
| Pool size | 18 decks = 9 classes × 2 archetypes (aggro, control) |
| Pair sampling at training | Independent sampling, no mirror (`replace=False` over deck index pair) |
| Eval design | Two-tier: fast eval (every `eval_every` iter) + milestone (every `milestone_every` iter) |
| Deck source | Online competitive lists, prioritising decks with all card_ids in fireplace `cards.db` |
| Training player swap | Randomly chosen p1/p2 per episode |
| Milestone runner | `ProcessPoolExecutor(max_workers=1, mp_context='spawn')`; non-blocking submit + poll-collect |
| Milestone matchup | Loaded checkpoint (greedy via `SelfPlayOpponent`) vs `RandomOpponent`; both `agent_idx` ∈ {0, 1} |
| Milestone games per matchup | 5 (configurable) → 18 × 17 × 2 × 5 = 3060 games |

## Context

Currently `FireplaceGymEnv` takes a fixed `(deck1, deck2, hero1, hero2)`.
`scripts/train.py` constructs one env per training run. Rollouts and eval
all happen on the same matchup. Curriculum FSM transitions RANDOM → SELF_PLAY
at `winrate vs RandomOpponent >= 0.80`. With only Mage vs Warrior, the agent
quickly saturates. Multi-deck adds genuine generalization pressure and is
also the data substrate for S2-B's draw-quality work.

## High-level approach

`FireplaceGymEnv`'s constructor takes a **list of `Deck` objects** plus a
`pair_strategy` ("fixed" | "random_pair") and `swap_training_player` flag.
At every `reset()`, the env (a) samples a non-mirror deck pair from the pool
if `pair_strategy="random_pair"`, (b) picks a `training_player_idx` if
`swap_training_player=True`, (c) constructs the underlying `fireplace.Game`
with seeds derived from a single env-owned `np.random.Generator`. Per-episode
metadata (deck names, swap, fireplace seed) is exposed via the `info` dict
for metrics and S2-B's draw-quality recording.

`evaluate.py:evaluate_pool` plays N games against `opponent_factory()`,
**stratified** so every directed matchup is hit at least once when
`n_games >= 612` and otherwise sampled uniformly at random; returns a dict
with the aggregate `winrate`, `n_games`, and `matchups_seen`.

`hearthstone/ai/milestone.py:MilestoneRunner` owns a single-worker
`ProcessPoolExecutor` with a **spawn** context. On `submit(iter_num, ckpt,
deck_names, …)`, the parent (a) **copies** `best.pt` to
`<run_dir>/milestones/iter_NNNN/checkpoint.pt` to avoid a race with the
next checkpoint save, then (b) submits `_run_round_robin(snapshot_path,
deck_names, games_per_matchup, output_path, slot_dim, num_actions)`. The
subprocess does cold-start re-imports, runs all 612 directed matchups, and
writes a heatmap CSV. The parent's main loop calls
`milestone_runner.collect_completed()` once per iteration (non-blocking).

`scripts/train.py` integrates the runner: submit at
`iter % milestone_every == 0`, collect every iter, `shutdown(wait=False,
cancel_futures=True)` on `KeyboardInterrupt`. `MetricsLogger` gains a
`milestone_path` column and a `log_milestone(iter, csv_path)` method.

The PPO trainer, network, reward function, card_features, opponents, and
opponent_env are **all unchanged**. The only env changes are signature and
internal sampling logic; reward semantics (perspective = training_player)
stay correct under swap because reward already keys off `training_player`.

## File layout

```
data/fireplace_decks/
├── aggro_mage.yaml          NEW    (replaces basic_mage.yaml; smoke uses aggro_mage)
├── control_mage.yaml        NEW
├── aggro_warrior.yaml       NEW    (replaces basic_warrior.yaml)
├── control_warrior.yaml     NEW
├── aggro_hunter.yaml        NEW
├── control_hunter.yaml      NEW
├── aggro_druid.yaml         NEW    (Choose-One bias — see "Druid bias")
├── control_druid.yaml       NEW
├── aggro_rogue.yaml         NEW
├── control_rogue.yaml       NEW
├── aggro_paladin.yaml       NEW
├── control_paladin.yaml     NEW
├── aggro_priest.yaml        NEW
├── control_priest.yaml      NEW
├── aggro_shaman.yaml        NEW
├── control_shaman.yaml      NEW
├── aggro_warlock.yaml       NEW    (zoo-style)
├── control_warlock.yaml     NEW    (handlock-style)
├── basic_mage.yaml          DELETE in PR-1
├── basic_warrior.yaml       DELETE in PR-1
└── README.md                MODIFY  archetype naming + source-attribution table

hearthstone/ai/env/
├── deck_source.py           MODIFY  ~+80 LOC
│     - new dataclass Deck(name, archetype, card_ids, hero_id)
│     - load_deck(name) -> Deck (replaces tuple return)
│     - load_decks(names: list[str]) -> list[Deck]  NEW
│     - validate_archetype_invariants(deck) — called inside load_deck
├── fireplace_env.py         MODIFY  ~+100 LOC
│     - new constructor signature (decks, pair_strategy, swap_training_player, …)
│     - reset() with sampling + RNG + global random.seed propagation
│     - info dict gains p1_deck_name / p2_deck_name / training_player_idx /
│       fireplace_seed
├── (other env modules unchanged)

hearthstone/ai/
├── milestone.py             NEW    ~200 LOC
│     - MilestoneRunner class (spawn pool, snapshot pinning, partial-CSV cleanup)
│     - _run_round_robin (subprocess entry; torch+fireplace cold init in this order)
├── evaluate.py              MODIFY  ~+60 LOC
│     - evaluate_pool(network, opponent_factory, decks, n_games, …) -> dict
│     - stratified sampling helper
│     - old single-matchup evaluate() removed
├── network.py               UNCHANGED
├── ppo_trainer.py           UNCHANGED
├── rollout_buffer.py        UNCHANGED
├── curriculum.py            UNCHANGED
├── self_play.py             DELETE  (legacy from pre-S1'; orphaned, see "Cleanup")
├── batch_simulator.py       UNCHANGED
├── training_utils.py        MODIFY  ~+25 LOC
│     - _HEADER gets `milestone_path` column (10 columns total now)
│     - log_milestone(iter, csv_path) method
│     - existing log_iter / log_eval pad with "" for new column
├── config.py                MODIFY  ~+15 LOC
│     - swap_training_player: bool
│     - milestone_every: int
│     - milestone_games_per_matchup: int
│     - curriculum.switch_threshold default lowered to 0.65 (see "Curriculum")
├── evaluate.py              (above)

scripts/train.py             MODIFY  ~+100 LOC  (env construction, MilestoneRunner
                                                 lifecycle, fast-eval call site)
configs/default.yaml         MODIFY  field changes + 18-name deck_pool

tests/unit/ai/env/
├── test_deck_source.py      MODIFY  +Deck dataclass tests, load_decks,
│                                    archetype validation tests
├── test_fireplace_env.py    MODIFY  +random_pair / no_mirror / swap_balance /
│                                    seed_repro / pair_strategy_constraint tests
├── test_observation.py      UNCHANGED   (perspective swap already covered in S1')
└── (others unchanged)

tests/unit/ai/
├── test_milestone.py        NEW    ~150 LOC
├── test_evaluate.py         MODIFY  evaluate_pool returns dict; stratified sampling
├── test_train_smoke.py      MODIFY  smoke uses 2-deck pool with random_pair + swap
├── test_training_utils.py   MODIFY  _HEADER column, log_milestone method
├── test_config.py           MODIFY  new fields
├── test_self_play.py        DELETE  (deletes alongside hearthstone/ai/self_play.py)
└── (others unchanged)
```

Net code change estimate: **~470 LOC new / modified** + **~540 lines YAML
(18 decks)** + **~200 LOC tests**. Plus deletion of `self_play.py` and its
test (~150 LOC).

## Component design

### `Deck` dataclass + `deck_source.py`

```python
@dataclass(frozen=True)
class Deck:
    name: str            # filename stem, e.g., "aggro_mage"
    archetype: str       # "aggro" | "control"
    hero_id: str         # fireplace hero card id, e.g., "HERO_08"
    card_ids: list[str]  # 30 fireplace card ids


def load_deck(name: str) -> Deck:
    """Load and validate a deck. Raises ValueError on any invariant violation."""

def load_decks(names: list[str]) -> list[Deck]:
    """Load each name in order. Failures bubble up with deck name in the message."""
```

YAML schema:

```yaml
name: Aggro Mage
archetype: aggro                 # required, must be "aggro" | "control"
hero_id: HERO_08
cards:
  - CS2_023                      # 30 entries, validated against cards.db
  - CS2_023
  ...
```

Note: no `notes` field. Deck source attribution lives in
`data/fireplace_decks/README.md` only (avoids per-file legal noise).

#### Archetype invariants

Validated by `load_deck` after YAML parse and card-id checks. Violation →
`ValueError` naming the deck and the failed constraint.

| Invariant | aggro | control |
|---|---|---|
| Total cards | 30 | 30 |
| Mean cost (mana) | ≤ 3.0 | ≥ 3.5 |
| Cards with cost ≤ 2 | ≥ 12 | ≤ 6 |
| Cards with cost ≥ 6 | ≤ 4 | ≥ 8 |
| Duplicates per non-legendary | ≤ 2 | ≤ 2 |
| Duplicates per legendary | ≤ 1 | ≤ 1 |
| `hero_id` and every card_id | in `cards.db` | in `cards.db` |

These invariants make "aggro" / "control" data-verifiable, not aesthetic.
Decks that don't satisfy them either get re-authored or have cards swapped
(the implementation plan iterates).

### `FireplaceGymEnv` multi-deck support

```python
class FireplaceGymEnv(gym.Env):
    NUM_ACTIONS = 512
    MAX_OPP_ACTIONS_PER_STEP = 200          # unchanged from S1'
    MAX_CHOICE_RESOLUTIONS = 50             # unchanged

    def __init__(
        self,
        decks: list[Deck],
        pair_strategy: Literal["fixed", "random_pair"] = "fixed",
        swap_training_player: bool = False,
        training_player_idx: int = 0,        # initial value; ignored when swap=True
        mulligan_policy: Optional[MulliganPolicy] = None,
        discover_policy: Optional[DiscoverPolicy] = None,
        choose_one_policy: Optional[ChooseOnePolicy] = None,
        seed: Optional[int] = None,
    ):
        ...
```

Constructor invariants (asserted):
- `pair_strategy == "fixed"` ⇒ `len(decks) == 2`
- `pair_strategy == "random_pair"` ⇒ `len(decks) >= 2`
- `swap_training_player` is independent of `pair_strategy` (any combination valid)

When `swap_training_player=True`, the `training_player_idx` constructor
argument is the **initial value before the first reset only**; subsequent
resets pick uniformly at random from {0, 1}. When `swap_training_player=False`,
`training_player_idx` is held fixed across resets.

The constructor takes a list of `Deck`, **never** the legacy `(deck1, deck2,
hero1, hero2)` tuple. All call sites are updated in PR-2; no compatibility
shim.

#### RNG & reproducibility

The env owns `self._rng = np.random.default_rng(seed)`. Every random
decision in `reset()` reads from this generator. To make
`fireplace.RandomOpponent` (uses Python `random.randrange`) and fireplace's
internal bare-`random` calls (e.g., `card.py:241`) reproducible, the env
also calls `random.seed(int(self._rng.integers(0, 2**31)))` at the start of
each `reset()`. `np.random.seed()` is **not** called (numpy random in this
codebase is only via the env's local generator).

This makes `(seed, episode_index)` → identical episode trajectory.

#### `reset()` flow

```python
def reset(self, seed=None, options=None):
    if seed is not None:
        self._rng = np.random.default_rng(seed)

    # 1. Seed Python's global random — affects RandomOpponent and fireplace internals
    random.seed(int(self._rng.integers(0, 2**31)))

    # 2. Sample deck pair
    if self.pair_strategy == "fixed":
        deck_a, deck_b = self.decks[0], self.decks[1]
    else:
        i, j = self._rng.choice(len(self.decks), size=2, replace=False)
        deck_a, deck_b = self.decks[i], self.decks[j]

    # 3. Sample training_player_idx (or hold fixed)
    if self.swap_training_player:
        self._training_player_idx = int(self._rng.integers(0, 2))
    # else: keep self._training_player_idx as set in __init__ (or last reset's value)

    # 4. Construct Game with derived seed
    fp_seed = int(self._rng.integers(0, 2**31))
    p1 = fireplace.Player("p1", deck_a.card_ids, deck_a.hero_id)
    p2 = fireplace.Player("p2", deck_b.card_ids, deck_b.hero_id)
    self.game = fireplace.Game(players=[p1, p2], seed=fp_seed)
    self.game.start()
    self._auto_resolve_choices()

    # 5. Cache for info dict / metrics / S2-B
    self._current_p1_deck_name = deck_a.name
    self._current_p2_deck_name = deck_b.name
    self._current_fireplace_seed = fp_seed

    self.current_valid_actions = enumerate_valid_actions(...)
    return self._build_observation(), self._info()
```

#### `info` dict additions

Both `reset()` and `step()` return `info` with these new fields (existing
fields unchanged):

```python
info = {
    "valid_actions": int,        # existing
    "invalid_action": bool,       # existing
    # new:
    "p1_deck_name": str,
    "p2_deck_name": str,
    "training_player_idx": int,
    "fireplace_seed": int,
}
```

#### Observation distribution shift under swap

When `swap_training_player=True` and a particular `reset()` picks
`training_player_idx == 1`, fireplace's standard p1-acts-first rule means
the **opponent has played their entire turn 1 before the training agent
sees its first observation**. (`OpponentEnv._loop_opponent` correctly
defers control to the agent only when `current_player is training_player`,
including from `reset` — this path is already tested in S1's
`test_reset_runs_opponent_first_when_p2_is_training`.)

This is a deliberate behavior change relative to S1', not a bug. Three
implications for downstream consumers:

1. **PPO trajectory**: each episode still produces a valid sequence of
   (obs, action, reward) tuples for the training agent only. Opponent's
   pre-emptive turn-1 actions count toward the inter-step reward
   accumulation handled by `OpponentEnv`.
2. **Value baseline**: the `is_my_turn` scalar in observation
   (`hearthstone/ai/env/observation.py`) already uses the *perspective*
   player, so it correctly toggles regardless of `training_player_idx`.
   No code change needed.
3. **Card draw distribution under "second player"**: p2 starts with 4 cards
   plus The Coin, vs p1's 3 cards. The agent now learns both starting
   conditions (5.6% better data efficiency).

### Reward, OpponentEnv, SelfPlayOpponent, observation builder

All **unchanged from S1'**.

- `reward_snapshot(env)` reads `env.training_player` and `env.opponent_player`,
  which are now properties that respect the per-episode
  `_training_player_idx` — so reward perspective stays correct.
- `OpponentEnv._loop_opponent` already runs opponent moves until
  `current_player is training_player`, including from `reset()`.
- `SelfPlayOpponent.act(env)` builds observation from
  `env.game.current_player`'s perspective via
  `env.build_observation_for(env.game.current_player)`. Unchanged.
- `build_observation_for(env, player)` and `SCALAR_BOUNDS` unchanged.
- The S1' invariant `current_valid_actions[0] == EndTurnAction()` is
  preserved (action enumeration logic untouched).

### `evaluate_pool`

Replaces the single-matchup `evaluate()`.

```python
def evaluate_pool(
    network: PolicyValueNetwork,
    opponent_factory: Callable[[], OpponentPolicy],
    decks: list[Deck],
    n_games: int = 100,
    slot_dim: int = 90,
    num_actions: int = 512,
    max_actions_per_game: int = 1000,
    seed: Optional[int] = None,
    stratified: bool = True,
) -> dict:
    """Run n_games games sampling deck pairs from `decks`. Greedy agent vs
    opponent_factory(). Returns aggregate winrate (cap-hit games count as
    non-wins).

    When stratified=True (default), the (deck_a, deck_b, agent_idx) sampler
    cycles through all 612 directed matchups in shuffled order so that over
    one eval call all 612 are hit at least once iff n_games >= 612, and any
    extra games are uniform random samples.

    When stratified=False, every game samples (i, j) ∈ random_pair and
    agent_idx ∈ {0, 1} independently.
    """
    return {
        "winrate": float,
        "n_games": int,
        "matchups_seen": int,        # distinct (deck_a, deck_b, agent_idx) triples
        "cap_hit_count": int,         # how many games hit max_actions_per_game
    }
```

**Why stratified by default**: with 18 decks, 306 directed matchups, and
the curriculum's old `n_games=50`, ~83% of matchups never get sampled in a
single eval, and adjacent eval calls oversample whatever happens to come
up. Stratified at `n_games=100` covers ~33% of matchups per eval (with
agent_idx noise) and dramatically reduces eval-to-eval winrate variance —
critical for the curriculum FSM to detect plateaus reliably.

The default `n_games` is bumped from 50 (S1's value) to **100** in
`configs/default.yaml`. Sampling-noise floor at p=0.5: σ ≈ 0.05 (was 0.07).

`scripts/train.py` consumes the result as
`fsm.update(eval_result["winrate"])`. The full dict is logged to
`metrics.csv` (the `cap_hit_count` field flags pathological pools or
under-tuned `max_actions_per_game`).

### `MilestoneRunner` (subprocess) — Path 3

```python
import csv, logging, multiprocessing as mp, os, shutil
from concurrent.futures import Future, ProcessPoolExecutor
from typing import Optional

logger = logging.getLogger(__name__)


class MilestoneRunner:
    """Single-worker spawn-context process pool for round-robin eval.

    submit() is non-blocking: the parent first copies best.pt to a pinned
    snapshot path (avoiding torch.save races with the next iter's
    checkpoint), then submits the round-robin job. collect_completed()
    polls without blocking. shutdown() with cancel_futures=True
    immediately cancels not-yet-started jobs and waits for the in-flight
    one (or doesn't, if wait=False).
    """

    def __init__(self, output_dir: str):
        os.makedirs(output_dir, exist_ok=True)
        self.output_dir = output_dir
        # Cleanup partial CSVs from prior killed runs.
        for fname in os.listdir(output_dir):
            if fname.endswith(".csv.partial"):
                os.remove(os.path.join(output_dir, fname))
        # spawn (not fork) — torch+fork is unsafe; batch_simulator.py
        # already documents this lesson for this codebase.
        ctx = mp.get_context("spawn")
        self._executor = ProcessPoolExecutor(max_workers=1, mp_context=ctx)
        self._pending: list[tuple[Future, int, str]] = []

    def submit(self, *, iter_num: int, checkpoint_path: str,
               deck_names: list[str], games_per_matchup: int,
               slot_dim: int, num_actions: int) -> str:
        # Pin the checkpoint so subprocess doesn't race with next save.
        snapshot_dir = os.path.join(self.output_dir, f"iter_{iter_num:04d}")
        os.makedirs(snapshot_dir, exist_ok=True)
        snapshot_path = os.path.join(snapshot_dir, "checkpoint.pt")
        shutil.copy(checkpoint_path, snapshot_path)

        out_csv = os.path.join(snapshot_dir, "heatmap.csv")
        f = self._executor.submit(
            _run_round_robin,
            snapshot_path, deck_names, games_per_matchup, out_csv,
            slot_dim, num_actions,
        )
        self._pending.append((f, iter_num, out_csv))
        logger.info("[milestone] submitted iter=%d → %s", iter_num, out_csv)
        return out_csv

    def collect_completed(self) -> list[tuple[int, str]]:
        done, remaining = [], []
        for fut, iter_num, out in self._pending:
            if not fut.done():
                remaining.append((fut, iter_num, out))
                continue
            try:
                fut.result()  # raises if subprocess crashed
                done.append((iter_num, out))
                logger.info("[milestone] completed iter=%d", iter_num)
            except Exception as e:
                logger.error("[milestone] iter=%d failed: %s", iter_num, e)
        self._pending = remaining
        return done

    def shutdown(self, wait: bool = True):
        # cancel_futures: pending-but-not-running jobs are cancelled.
        # If wait=False, in-flight subprocess is left to finish (orphan
        # CSV in milestones/ dir). Acceptable; documented in failure modes.
        self._executor.shutdown(wait=wait, cancel_futures=True)


def _run_round_robin(
    checkpoint_path: str, deck_names: list[str], games_per_matchup: int,
    output_path: str, slot_dim: int, num_actions: int,
) -> None:
    """Subprocess entry point — cold start: re-imports everything.

    Order matters: torch threading must be set BEFORE the first torch op.
    Pickle-safety: this function only takes basic types (str/int/list[str]),
    so spawn-context pickling is trivial.
    """
    import random
    import torch
    torch.set_num_threads(1)            # match conftest.py main-process setting

    from fireplace import cards
    cards.db.initialize()

    from hearthstone.ai.env.deck_source import load_decks
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.opponents import RandomOpponent, SelfPlayOpponent
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.enums import PlayState

    # Load checkpoint into a fresh network.
    net = PolicyValueNetwork(slot_dim=slot_dim, num_actions=num_actions)
    ckpt = torch.load(checkpoint_path, map_location="cpu")
    net.load_state_dict(ckpt["network"] if "network" in ckpt else ckpt)
    net.eval()

    decks = load_decks(deck_names)
    agent = SelfPlayOpponent(network_path=None, slot_dim=slot_dim, num_actions=num_actions)
    agent.network = net
    agent.network.eval()

    # Write to a .partial file first; rename on success so partial outputs
    # are recoverable from cleanup.
    partial = output_path + ".partial"
    rows = []
    for i, deck_a in enumerate(decks):
        for j, deck_b in enumerate(decks):
            if i == j:
                continue
            for agent_idx in (0, 1):
                wins = 0
                cap_hits = 0
                for g in range(games_per_matchup):
                    # Per-matchup deterministic seed
                    random.seed(1000 + g)                    # for RandomOpponent
                    env = FireplaceGymEnv(
                        decks=[deck_a, deck_b],
                        pair_strategy="fixed",
                        swap_training_player=False,
                        training_player_idx=agent_idx,
                        seed=1000 + g,
                    )
                    env.reset()
                    opp = RandomOpponent()
                    action_count = 0
                    while not env.game.ended and action_count < 1000:
                        if env.game.current_player is env.training_player:
                            idx = agent.act(env)
                        else:
                            idx = opp.act(env)
                        env.step(idx)
                        action_count += 1
                    if action_count >= 1000 and not env.game.ended:
                        cap_hits += 1            # cap-hit: counts as non-win
                    elif env.training_player.playstate == PlayState.WON:
                        wins += 1
                rows.append({
                    "deck_a": deck_a.name, "deck_b": deck_b.name,
                    "agent_idx": agent_idx, "n_games": games_per_matchup,
                    "winrate": wins / games_per_matchup,
                    "cap_hit_count": cap_hits,
                })

    with open(partial, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=[
            "deck_a", "deck_b", "agent_idx", "n_games", "winrate", "cap_hit_count",
        ])
        w.writeheader()
        w.writerows(rows)
    os.replace(partial, output_path)            # atomic; on failure, .partial
                                                 # remains for cleanup next run
```

#### Milestone matchup semantics

For **every** of the 612 directed matchups, **the loaded checkpoint
plays as `agent_idx`-side via greedy `SelfPlayOpponent`**, and **the
other side is `RandomOpponent`**. Both `agent_idx ∈ {0, 1}` are run
(so each unordered pair contributes 2 rows: agent-as-p1 and agent-as-p2).
This matches the fast-eval semantics ("agent vs random opponent") and
makes the heatmap directly comparable to the curriculum's eval winrate.

Self-play heatmap (agent vs agent across matchups) is intentionally not
included: it averages to 50% by construction and is uninformative for
curriculum decisions. A future S3' spec can add `_run_round_robin_self_play`.

#### Subprocess output CSV format

```
deck_a,deck_b,agent_idx,n_games,winrate,cap_hit_count
aggro_mage,control_mage,0,5,0.80,0
aggro_mage,control_mage,1,5,0.40,1
aggro_mage,aggro_warrior,0,5,1.00,0
...
```

`cap_hit_count` is informational. `winrate` already counts cap-hit games
as non-wins (matching `evaluate_pool` semantics).

#### Pickling & spawn-context

Only basic types cross the process boundary: `checkpoint_path` (str),
`deck_names` (list[str]), `games_per_matchup` (int), `output_path` (str),
`slot_dim` / `num_actions` (int). No `Deck` instances, no `torch.nn.Module`,
no `Future`. Spawn pickle is trivial.

### `scripts/train.py` integration

```python
# Top of main():
milestone_runner = MilestoneRunner(
    output_dir=os.path.join(run_dir, "milestones"),
)

# In the per-iteration loop, after fast-eval and checkpoint save:
#   1. fast eval (every eval_every)
#   2. save checkpoint (every checkpoint_every; updates best.pt if winrate improved)
#   3. submit milestone (every milestone_every) — uses the just-saved best.pt
#   4. collect completed milestones (every iter, non-blocking)
if cfg.milestone_every > 0 and iter_num > 0 and iter_num % cfg.milestone_every == 0:
    milestone_runner.submit(
        iter_num=iter_num,
        checkpoint_path=cfg.best_checkpoint_path,
        deck_names=cfg.deck_pool,
        games_per_matchup=cfg.milestone_games_per_matchup,
        slot_dim=cfg.slot_dim,
        num_actions=cfg.num_actions,
    )
for completed_iter, csv_path in milestone_runner.collect_completed():
    metrics_logger.log_milestone(completed_iter, csv_path)

# Try/finally and KeyboardInterrupt handlers:
finally:
    milestone_runner.shutdown(wait=False)   # cancel pending; let in-flight finish
    metrics_logger.close()
```

`milestone_every: 0` disables the runner entirely (skipped at constructor:
`if cfg.milestone_every == 0: milestone_runner = NullMilestoneRunner()` —
or a flag-guarded skip; spec leaves implementation choice to plan).

Per-iteration order: **train → fast eval → save checkpoint (and best.pt
if improved) → submit milestone (against just-saved best.pt) → collect
completed milestones**. This ordering is sequenced explicitly in
`scripts/train.py` and tested in `test_train_smoke.py`.

### Curriculum / FSM

Behaviour unchanged in code; threshold tuned in config.

`evaluate_pool` returns a dict; the FSM consumer in `scripts/train.py`
extracts the scalar:

```python
eval_result = evaluate_pool(network, lambda: RandomOpponent(), decks=loaded_decks,
                            n_games=cfg.eval_games, ...)
fsm.update(eval_result["winrate"])
metrics_logger.log_eval(iter_num, phase, eval_result["winrate"], best_winrate, plateau_count)
```

`switch_threshold` default lowered from **0.80 → 0.65** in
`configs/default.yaml`. With multi-deck eval, "winrate vs RandomOpponent"
no longer saturates as easily; 0.65 is the calibrated entry-into-self-play
threshold against random play across 18 deck archetypes. The constant is
config-driven, not code-driven.

Plateau detection unchanged: strict `> best_winrate` comparison in
`SELF_PLAY` phase only.

### MetricsLogger

`_HEADER` adds one column at the end:

```python
_HEADER = [
    "iter", "phase", "total_loss", "policy_loss", "value_loss",
    "entropy", "eval_winrate", "best_winrate", "plateau_count",
    "milestone_path",
]
```

`log_iter` and `log_eval` write `""` for the new column. New method:

```python
def log_milestone(self, iter_num: int, csv_path: str) -> None:
    """Mark a milestone heatmap as completed at this iter."""
    self._writer.writerow([
        iter_num, "", "", "", "", "", "", "", "",
        csv_path,
    ])
    self._file.flush()
```

`csv_path` is stored as a relative path (relative to `runs/<timestamp>/`)
so the metrics CSV is portable.

### Druid bias (Choose-One)

Sub-project A keeps S1's `FirstChoiceOne` policy: every Choose-One card
picks `card.choose_cards[0]`. For Druid:

- **Wrath**: always "Heavy" (4 damage, no draw). Loses utility on small
  minions and never draws.
- **Druid of the Claw**: always "Bear form" (4/6 with Charge). Loses the
  4/6 with Taunt option.
- **Power of the Wild**: always "Leader of the Pack" (+1/+1 to friendly
  minions). Loses the 3/2 panther summon.
- **Keeper of the Grove**: always "Silence target". Loses the 2-damage
  removal option.
- **Ancient of War / Ancient of Lore**: always first option (Taunt 5/10
  body and "draw 2", respectively).
- **Mark of Nature**: always "+4/0". Loses the +0/+4 Taunt option.

This systematically biases Druid winrates downward, particularly for
control variants where the silence/heal/draw alternatives are strong.
**Both Druid decks remain in the 18-deck pool** for completeness, but:

1. Milestone heatmap consumers should treat Druid rows with caution.
   `data/fireplace_decks/README.md` documents this.
2. S2-B (神抽/鬼抽) analysis must exclude Druid samples until S3' adds
   a smarter `ChooseOnePolicy`.
3. The S2-A spec and tests do not assume Druid winrate ≈ other classes;
   archetype-invariant tests check structure (cost curve, duplicate limit),
   not winrate.

A future spec can replace `FirstChoiceOne` with a deterministic
state-aware policy (e.g., "if any enemy minion has ≤4 HP and Wrath
is being played, choose Heavy; else choose Light + draw"). That work is
out of scope here.

### Cleanup: `hearthstone/ai/self_play.py`

`hearthstone/ai/self_play.py` (77 LOC) defines a `SelfPlayTrainer` class
with its own `select_decks(self) -> tuple` method. The Phase 6 cleanup of
S1' missed it. The class:

- Has no callers in `scripts/train.py` (verified by grep).
- Has its own `random.sample(deck_pool, 2)` logic — exactly what S2-A is
  implementing inside `FireplaceGymEnv.reset()`. Two implementations of
  "sample a deck pair" is a future-bug magnet.
- Stores `episode_history: list[dict]` and `record_episode()`/`get_stats()`
  helpers that nothing currently uses.

S2-A deletes both `hearthstone/ai/self_play.py` and
`tests/unit/ai/test_self_play.py` as part of PR-1 (since PR-1 is the
deck-source overhaul, doing minor `ai/` cleanup alongside is appropriate
scope).

## Configuration

`configs/default.yaml` diff:

```yaml
# === REMOVED ===
# fixed_deck1: basic_mage
# fixed_deck2: basic_warrior

# === MODIFIED ===
deck_selection: random_pair         # was: fixed
swap_training_player: true          # was: training_player_idx-only
training_player_idx: 0              # initial value before first reset

curriculum:
  switch_threshold: 0.65            # was: 0.80 (lowered for multi-deck)
  early_stop_patience: 5

# === NEW ===
deck_pool:
  - aggro_mage
  - control_mage
  - aggro_warrior
  - control_warrior
  - aggro_hunter
  - control_hunter
  - aggro_druid
  - control_druid
  - aggro_rogue
  - control_rogue
  - aggro_paladin
  - control_paladin
  - aggro_priest
  - control_priest
  - aggro_shaman
  - control_shaman
  - aggro_warlock
  - control_warlock

milestone_every: 100               # iters between milestone submissions; 0 disables
milestone_games_per_matchup: 5

# === DEFAULTS BUMPED ===
eval_every: 10
eval_games: 100                    # was: 50 (halve sampling noise: σ ≈ 0.05)
```

`TrainConfig` dataclass adds `swap_training_player: bool`,
`milestone_every: int`, `milestone_games_per_matchup: int`. Field
`fixed_deck1` / `fixed_deck2` removed. `training_player_idx` retained
(now an initial-value field).

## Failure modes

| Failure | Detection | Response |
|---|---|---|
| `pair_strategy="random_pair"` + `len(decks) < 2` | `__init__` assert | `AssertionError("random_pair requires len(decks) >= 2, got {n}")`; exit 1 |
| `pair_strategy="fixed"` + `len(decks) != 2` | `__init__` assert | Same |
| Deck YAML invariant violation (avg cost / cost-range counts / duplicates) | `load_deck` validation | `ValueError` naming the deck and the failed constraint; exit 1 |
| Card_id missing from `cards.db` | `load_deck` validation | `ValueError` listing missing IDs |
| Milestone subprocess crash (bad ckpt path / fireplace exception) | `future.result()` raises in `collect_completed` | `logger.error` one line; main process continues; next milestone unaffected |
| Milestone game hits 1000-action cap | per-game cap inside `_run_round_robin` | Counted in `cap_hit_count`; game tallied as non-win |
| Disk full during milestone CSV write | `open(partial)` raises | Future raises; main logs error; partial file remains for cleanup |
| KeyboardInterrupt (Ctrl-C) | `try/finally` in `scripts/train.py` | `milestone_runner.shutdown(wait=False, cancel_futures=True)` cancels pending; in-flight subprocess continues writing to its `.partial` file; OS reaps when done. On next run, `MilestoneRunner.__init__` deletes any stale `.csv.partial` |
| Hard kill (SIGKILL on parent) | n/a | OS reaps subprocess; `.partial` file may persist; cleanup on next run |
| best.pt overwritten while subprocess `torch.load`s | parent copies best.pt to `iter_NNNN/checkpoint.pt` before submit | Race eliminated by design |
| `fork` vs `spawn` PyTorch issue | `mp_context='spawn'` mandatory | Documented; `batch_simulator.py` shipped with the same pattern |
| `random.seed` not propagated to subprocess | `_run_round_robin` calls `random.seed(1000 + g)` per game | Reproducible per-matchup outcomes |
| Curriculum FSM never switches phase (multi-deck winrate plateau below threshold) | manual review of `metrics.csv` `eval_winrate` column | User lowers `curriculum.switch_threshold` via `--override` (or in YAML for next run) |

## Testing strategy

### Modified tests

- `tests/unit/ai/env/test_deck_source.py`:
  - `test_deck_dataclass_fields_match_yaml`
  - `test_load_decks_returns_list_in_order`
  - `test_aggro_archetype_avg_cost_violation_raises`
  - `test_control_archetype_low_count_violation_raises`
  - `test_duplicate_legendary_violation_raises`
  - `test_invalid_card_id_lists_all_missing`
  - `test_all_18_decks_load_successfully` (PR-3 + PR-1: regression that authored YAMLs satisfy archetype invariants)

- `tests/unit/ai/env/test_fireplace_env.py`:
  - `test_random_pair_no_mirror` — 1000 resets over 18 decks, zero mirrors,
    distribution check (each unordered pair ≈ 1000/C(18,2) ≈ 6.5 ± reasonable σ)
  - `test_swap_training_player_balanced` — 200 resets, counts within ±20 of 100
  - `test_seed_reproducibility_with_pool` — same seed → identical
    `(deck_pair, agent_idx, fp_seed)` and identical first observation
  - `test_pair_strategy_random_pair_requires_two_decks`
  - `test_pair_strategy_fixed_requires_two_decks`
  - `test_swap_training_player_when_idx_1_opponent_acts_first` — assert that
    when `swap_training_player=True` selects p2 as training, the first
    obs after `OpponentEnv.reset()` reflects opponent's turn-1 board
  - `test_info_dict_contains_deck_names_and_seed`
  - `test_random_seed_propagates_to_python_random_for_RandomOpponent`

- `tests/unit/ai/test_evaluate.py`:
  - `test_evaluate_pool_returns_dict_with_winrate_n_games_matchups_seen`
  - `test_evaluate_pool_stratified_covers_all_directed_matchups_when_n_games_ge_612`
  - `test_evaluate_pool_non_stratified_independent_sampling`
  - `test_evaluate_pool_cap_hit_counts_as_non_win`

- `tests/unit/ai/test_train_smoke.py`:
  - `test_two_iter_train_smoke_with_pool` — 2 iters, 2-deck pool
    (random_pair degenerates to single matchup), `swap_training_player=True`,
    `milestone_every=0`. Assert metrics.csv has 2 iter rows + 2 eval rows,
    no milestone_path entries.
  - `test_two_iter_train_smoke_with_milestone` — 2 iters, 2-deck pool,
    `milestone_every=1`. Assert at least 1 milestone CSV produced under
    `runs/<ts>/milestones/`. Use `games_per_matchup=1` to keep test fast
    (~30s).

- `tests/unit/ai/test_training_utils.py`:
  - Update `_HEADER` assertion (10 columns now)
  - `test_log_milestone_writes_csv_path_in_correct_column`
  - Update `test_log_iter_blanks_eval_columns` to check 9 trailing blanks
    (was 3 — was wrong even in S1' rev 2)

- `tests/unit/ai/test_config.py`:
  - `test_default_yaml_has_swap_training_player_and_milestone_fields`

### New tests

`tests/unit/ai/test_milestone.py`:

```python
def test_milestone_runner_creates_output_dir(): ...

def test_milestone_runner_cleans_partial_csvs_on_init(tmp_path):
    # Pre-create iter_0001/heatmap.csv.partial; instantiate runner;
    # confirm partial deleted.

def test_submit_copies_checkpoint_snapshot(tmp_path):
    # Submit a milestone; assert iter_NNNN/checkpoint.pt exists at submit time.

def test_submit_returns_output_path(): ...

def test_collect_completed_returns_finished_jobs(tmp_path):
    # Submit one tiny milestone (2 decks, 1 game per matchup);
    # poll collect_completed() until non-empty; assert (iter, path) returned.

def test_collect_completed_skips_running_jobs(): ...

def test_failed_subprocess_logs_and_continues(tmp_path, caplog):
    # Submit with a non-existent ckpt path; collect_completed; assert
    # logger.error fired; assert no exception escapes.

def test_shutdown_with_cancel_futures(): ...

def test_round_robin_csv_format(tmp_path):
    # Run a 2-deck milestone; load output CSV; assert header has 6 columns;
    # assert N rows = 2 * 1 * 2 (decks × pairs × agent_idx) = 4.

def test_round_robin_uses_spawn_context():
    # Patch ProcessPoolExecutor; assert spawn context is requested.
```

### Test deletions

- `tests/unit/ai/test_self_play.py` — removed alongside `self_play.py`.

## Migration steps (PR series)

```
PR-1  Deck dataclass + archetype validation + load_decks
      hearthstone/ai/env/deck_source.py + test_deck_source.py
      DELETE: data/fireplace_decks/{basic_mage,basic_warrior}.yaml
      DELETE: hearthstone/ai/self_play.py + tests/unit/ai/test_self_play.py
      Update test_evaluate.py / test_train_smoke.py / test_fireplace_env.py
      to NOT depend on basic_*.yaml: substitute in-test stub Deck objects
      until PR-3 lands the real archetype YAMLs.

PR-3  Author 18 deck YAMLs (data only, no code changes)
      18 × YAML in data/fireplace_decks/
      data/fireplace_decks/README.md updated (archetype convention + sources)
      test_deck_source.py::test_all_18_decks_load_successfully passes.

PR-2  FireplaceGymEnv multi-deck signature + evaluate_pool
      hearthstone/ai/env/fireplace_env.py: new constructor, reset() flow
      hearthstone/ai/evaluate.py: evaluate_pool replaces evaluate
      Update tests/unit/ai/env/test_fireplace_env.py + test_evaluate.py
      Old (deck1, deck2, hero1, hero2) signature removed; all callers
      updated to Deck-based API.
      [Bundling env signature change with evaluate_pool refactor — needed
      so main stays green; see "PR ordering rationale" below.]

PR-4  scripts/train.py wires multi-deck end-to-end
      configs/default.yaml: deck_pool (18), curriculum.switch_threshold=0.65,
      eval_games=100, swap_training_player=true
      hearthstone/ai/config.py: new fields
      Update test_train_smoke.py and test_config.py
      End-to-end smoke runs over 18-deck pool.

PR-5  Milestone subprocess
      hearthstone/ai/milestone.py + test_milestone.py
      hearthstone/ai/training_utils.py: log_milestone, _HEADER addition
      hearthstone/ai/config.py: milestone_every / milestone_games_per_matchup
      scripts/train.py: MilestoneRunner integration
      configs/default.yaml: milestone_every: 100 (or whatever default)
```

### PR ordering rationale

Order is **PR-1 → PR-3 → PR-2 → PR-4 → PR-5**:

- PR-1 introduces the `Deck` dataclass and archetype validation. Delete the
  basic_* YAMLs and `self_play.py` here. Tests that previously called
  `load_deck("basic_mage")` switch to in-test stub `Deck` objects.
- PR-3 (data-only) immediately follows so the 18 archetype YAMLs exist and
  validate. After PR-3, `load_deck("aggro_mage")` works.
- PR-2 changes `FireplaceGymEnv`'s constructor and replaces `evaluate()` with
  `evaluate_pool()`. Bundled into one PR because separating them would
  leave `evaluate.py` calling the old constructor, which PR-2 removes.
- PR-4 wires multi-deck training in `scripts/train.py` against the now-functional
  18-deck pool. Smoke test passing here gates merge.
- PR-5 adds milestone subprocess machinery on top.

`main` stays green throughout. Each PR's tests pass before merge.

### High-risk areas (called out for plan/review attention)

- **PR-2: `FireplaceGymEnv.reset()` random.seed propagation**. Forgetting
  `random.seed(...)` will silently break reproducibility tests at the
  full-trajectory level (deck pair will match but `RandomOpponent` and
  fireplace bare-`random` calls will diverge). Test
  `test_random_seed_propagates_to_python_random_for_RandomOpponent`
  catches this.
- **PR-2: Observation distribution shift under swap**. PR-2 should note
  the change in PR description; users running pre-PR-2 checkpoints
  against post-PR-2 envs (training continues from old `best.pt`) will
  see a different obs distribution. Reset training rather than resume.
- **PR-5: spawn context + torch import order**. Subprocess must call
  `torch.set_num_threads(1)` BEFORE the first torch op. Document in
  module docstring of `milestone.py`.
- **PR-5: `cancel_futures=True` requires Python ≥ 3.9**. The `pyproject.toml`
  declares `requires-python = ">=3.10"` but the dev conda env on this
  machine is 3.8 (see S1' rev 3 changelog). `cancel_futures` will fail
  in 3.8 with `TypeError: shutdown() got an unexpected keyword argument`.
  Either (a) bump the dev env to 3.10+, or (b) gate the kwarg via
  `sys.version_info`. Plan should flag this.
- **PR-3: deck authoring source brittleness**. Many basic+classic competitive
  decks include cards that fireplace's current `cards.db` may have under
  slightly different IDs. Plan task: write a card_id verification script
  that runs before each deck YAML is finalized.

## Spec self-review

- **Placeholders**: none. All defaults are concrete.
- **Internal consistency**:
  - `swap_training_player` (TrainConfig + `FireplaceGymEnv` constructor +
    YAML) is the single name. The earlier brainstorm draft mixed
    `swap_training_idx` and `training_player_swap`; both are gone.
  - `evaluate_pool` returns `dict`; FSM consumer pulls `["winrate"]`.
  - Reward perspective + `OpponentEnv._loop_opponent` + `is_my_turn`
    scalar all key off `training_player`, which is now per-episode but
    consistent within an episode.
  - `MAX_OPP_ACTIONS_PER_STEP=200` (S1') is for the agent-step opponent
    chain; `max_actions_per_game=1000` is for milestone games. Different
    constants, different scopes. Documented.
  - Milestone matchup is "loaded checkpoint via SelfPlayOpponent vs
    RandomOpponent", `agent_idx ∈ {0, 1}` (Section 4 + Failure modes).
  - `self_play.py` deletion is in PR-1 file list and Cleanup section.
- **Scope check**: focused on multi-deck training infrastructure. Defers:
  smarter ChooseOnePolicy, draw-quality head, deck pool changes at
  runtime, GPU support. Each named in non-goals.
- **Ambiguity check**:
  - "winrate" in milestone CSV counts cap-hit games as non-wins — same
    semantics as `evaluate_pool`. Both documented.
  - `training_player_idx` constructor arg semantics: when
    `swap_training_player=True`, treated as initial value before first
    reset only. Documented in constructor section.
  - `evaluate_pool(stratified=True)` covers all 612 directed matchups
    when `n_games >= 612`; below that, sampler iterates the shuffled list
    in order and stops at `n_games`. Documented.
  - `milestone_every: 0` means "disabled" — runner is conceptually a
    no-op but the implementation choice (NullRunner vs flag-guard) is
    deferred to plan.
  - On `KeyboardInterrupt`, in-flight subprocess is allowed to finish
    writing its `.partial` file; cleanup happens on next launch.

### Changelog

- **rev 1 (2026-05-01)**: initial draft post brainstorming + subagent self-review.
  Incorporates 12 must-act items from the holistic review (B1 milestone
  matchup semantics, B2 swap observation distribution shift documented,
  B3 cap_hit_count column, I1 swap_training_player naming, I2
  curriculum threshold lowered to 0.65 + dict-result extraction, I3
  random.seed propagation, I4 spawn context, I5 checkpoint snapshot
  pinning, I6 Druid bias documented, I7 stratified evaluate_pool,
  I8 PR ordering 1→3→2→4→5, I9 cancel_futures shutdown) and 5
  nice-to-haves (1000-reset distribution test, PR ordering, basic_*.yaml
  deletion in PR-1, self_play.py cleanup, notes-field removal,
  per-iter sequencing).
