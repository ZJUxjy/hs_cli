# Fireplace Integration Design (S1')

**Date:** 2026-05-01
**Status:** Approved, ready for implementation plan
**Predecessor:** `docs/specs/2026-04-29-ai-training-driver-design.md` (PPO training driver — completed)

## Goal

Replace the in-house Hearthstone engine in `hs_glm` with the
[fireplace](https://github.com/jleclanche/fireplace) simulator (locally maintained
at `/home/xu/code/hstone/hearthstone/fireplace`) as the source of truth for game
mechanics. Build a Gymnasium adapter (`FireplaceGymEnv`) that exposes fireplace's
~3500 cards and ~25 expansions to the existing PPO training infrastructure, and
introduce a structured card feature encoder (`CardFeatureEncoder`) so that the
policy network can distinguish cards by their actual effects (e.g., "deal 3
damage" vs "deal 6 damage", "battlecry: silence" vs "battlecry: buff") rather
than by ID hash alone.

This is the first stage (S1') of a larger program to enrich the training
environment. Subsequent stages — multi-deck training pools (S3'), deeper card
features (S4'), and a separate "draw quality" auxiliary head — depend on this
foundation.

## Non-goals

- Migrating the human-play CLI (`cli/`) or web UI (`web/backend/`) onto fireplace.
  Both are deleted in this stage; fireplace's own webui covers human play.
- Letting the agent learn mulligan / Discover / Choose-One decisions. These
  are auto-resolved in S1' via deterministic policies. Adding agent-driven
  mulligan is a separate spec.
- Deeper card text understanding (e.g., NLP embeddings of card text). Effect
  fingerprints from DSL walking are sufficient for S1'.
- Hierarchical or two-stage action spaces. Flat enumeration with a bumped
  `NUM_ACTIONS=512` keeps the existing PPO interface.
- Random deck drafting in training. S1' uses fixed deck files; random drafts
  are S3'.
- Bringing forward existing trained checkpoints. The observation shape and
  card vocabulary both change; checkpoints from the 10-card environment are
  abandoned.

## Context

### Why fireplace

The current `hs_glm` engine has 10 minion cards and no implementation of
Battlecry, Deathrattle, Spell Damage, Divine Shield, weapons, hero powers,
spells, or any keyword beyond Taunt and Charge. Building these out to cover
the basic+classic Hearthstone sets (240+ cards across 9 classes) is the
goal of stages S1–S4 in our project decomposition.

`/home/xu/code/hstone/hearthstone/fireplace` is a mature simulator
(6489 LOC core engine + 345 card files + 44 integration tests) covering 100%
of basic, classic, and ~25 expansions. The user is its active maintainer
(latest commits 2026-04-29). Its DSL — illustrated by

```python
class CS2_024:                                          # Frostbolt
    requirements = {PlayReq.REQ_TARGET_TO_PLAY: 0}
    play = Hit(TARGET, 3), Freeze(TARGET)
```

— is precisely the declarative-with-escape-hatch design the brainstorming
phase converged on. Building S1+S2 (engine extension + card import) on top of
`hs_glm`'s engine would essentially reinvent fireplace at lower quality.

### License

Fireplace is AGPL-3.0. The user accepts this for hs_glm: the project is
personal research, no commercial / public-network use planned. `pyproject.toml`
will note the AGPL transitivity.

### Repo arrangement

Training code remains in `hs_glm`. Fireplace is consumed as a pip dependency
(`pip install -e /home/xu/code/hstone/hearthstone/fireplace` for local dev;
git URL pinned to a specific commit for CI). Fireplace's repo is unaffected.

### Decisions locked in during brainstorming

| Decision | Choice |
|---|---|
| Stage 1 scope | Simulator richness (engine), defer model improvements to S3+ |
| Card pool target | basic+classic, 9 classes (~240 cards) |
| Effect representation | Fireplace's existing declarative DSL with Python escape (matches our chosen pattern) |
| Action space | Flat enumeration; `NUM_ACTIONS=512` |
| Mechanic coverage | All of fireplace's basic+classic (Battlecry, Deathrattle, Divine Shield, Windfury, Spell Damage, AoE, Heal, Draw, Buff, Weapons, Summon, Hero Power, end-of-turn triggers, auras, Stealth, Frozen, Lifesteal, Rush, Reborn, Discover, Combo, Overload, Secret, Silence — fireplace already implements all) |
| Switch to fireplace | Yes |
| AGPL | Accepted |
| Repo arrangement | α — training in hs_glm, fireplace as pip dep |
| Old engine | Delete entirely (not preserved as fallback) |
| S1' scope | Adapter + structured card feature encoding fused (Path 2) |
| Mulligan policy default | KeepLowCost(threshold=3) |
| Discover policy default | FirstOption |

## High-level approach

`FireplaceGymEnv` is a thin wrapper over a `fireplace.Game` instance that
exposes the standard Gymnasium API (`reset`, `step`, `observation_space`,
`action_space`). Per-step it:

1. Enumerates valid actions for `game.current_player` into a flat list.
2. Decodes the agent's `action_idx`, dispatches to fireplace's API
   (`card.play()`, `minion.attack()`, `hero_power.use()`, `game.end_turn()`).
3. Auto-resolves any choice phases (mulligan, Discover, Choose-One) using
   the configured `MulliganPolicy` / `DiscoverPolicy`.
4. Computes shaping reward from a before/after snapshot (effective health
   delta + board delta + terminal +/-1).
5. Builds the next observation from `training_player`'s perspective.

`OpponentEnv` wraps `FireplaceGymEnv` and an `OpponentPolicy`. It folds all
opponent moves into one outer `step()` call, accumulating reward across
opponent turns so the agent's reward signal reflects damage taken on the
opponent's turn.

`CardFeatureEncoder` walks fireplace's DSL action trees once at startup,
producing an 80-dim static feature vector per card (cost / atk / hp /
type / class / race / mechanic flags / effect fingerprint / rarity).
At runtime, board minions get an extra 10-dim dynamic state vector
(current stats, buffs, divine_shield active, etc.). Hand cards have the
state channels zeroed.

The PPO infrastructure (`PolicyValueNetwork`, `RolloutBuffer`, `PPOTrainer`,
`Curriculum`, `SelfPlayOpponent` driver, `evaluate`, `scripts/train.py`) is
preserved with minimal changes: only constants change (`embedding_dim` →
`slot_dim`, scalar list, `num_actions`).

## File layout

```
hearthstone/ai/
├── env/                            NEW subpackage; final home for env-related code
│   ├── __init__.py                 NEW
│   ├── fireplace_env.py            NEW  ~250 LOC  FireplaceGymEnv
│   ├── action_enum.py              NEW  ~150 LOC  action types + enumerator + dispatch
│   ├── observation.py              NEW  ~120 LOC  build_observation_for(env, player)
│   ├── card_features.py            NEW  ~200 LOC  CardFeatureEncoder + DSL walker + cache
│   ├── deck_source.py              NEW  ~80 LOC   YAML deck loader, random_deck wrapper
│   ├── mulligan_policy.py          NEW  ~40 LOC
│   ├── discover_policy.py          NEW  ~40 LOC
│   ├── choose_one_policy.py        NEW  ~30 LOC   pre-pick sub-card for must_choose_one
│   ├── opponents.py                NEW  ~120 LOC  RandomOpponent, SelfPlayOpponent (fireplace)
│   ├── opponent_env.py             NEW  ~100 LOC  OpponentEnv wrapper
│   └── reward.py                   NEW  ~120 LOC  RewardFunction over snapshots (fireplace)
├── network.py                      MODIFY   +30 LOC   slot_dim param, expanded SCALAR_KEYS
├── ppo_trainer.py                  UNCHANGED
├── rollout_buffer.py               UNCHANGED
├── curriculum.py                   UNCHANGED
├── self_play.py                    MODIFY   ~5 LOC
├── evaluate.py                     MODIFY   ~25 LOC  uses env.opponents + per-step
│                                                    perspective dispatch + cap
├── training_utils.py               UNCHANGED
├── config.py                       MODIFY   +20 LOC  deck_pool, mulligan/discover/
│                                                    choose_one policies, slot_dim
├── opponents.py                    DELETE in PR-6 (superseded by env/opponents.py)
├── opponent_env.py                 DELETE in PR-6 (superseded by env/opponent_env.py)
├── reward_functions.py             DELETE in PR-6 (superseded by env/reward.py)
├── card_embedding.py               DELETE in PR-6 (superseded by env/card_features.py)
└── gym_env.py                      DELETE in PR-6 (superseded by env/fireplace_env.py)

hearthstone/engine/                 DELETE   entire dir
hearthstone/models/                 DELETE   entire dir
hearthstone/decks/                  DELETE   entire dir
hearthstone/data/                   DELETE   entire dir
data/cards/                         DELETE
data/decks/                         DELETE
cli/                                DELETE   entire dir
web/                                DELETE   entire dir (fireplace has its own webui)
main.py                             DELETE
run_web.py                          DELETE

data/fireplace_decks/               NEW
├── README.md                       NEW
├── basic_mage.yaml                 NEW
└── basic_warrior.yaml              NEW

scripts/train.py                    MODIFY   ~80–150 LOC  HIGH RISK: env factory,
                                                          action mask, network ctor,
                                                          self-play opponent, --resume
                                                          compat. See "high-risk areas"
                                                          in Migration steps.
configs/default.yaml                MODIFY   field changes (see Configuration section)
pyproject.toml                      MODIFY   +fireplace dep, AGPL note
requirements.txt                    MODIFY   +fireplace, +hearthstone-data, +pyyaml (already there)

tests/unit/ai/env/                  NEW subdir; mirrors hearthstone/ai/env/
├── test_card_features.py           NEW  ~250 LOC
├── test_action_enum.py             NEW  ~150 LOC
├── test_observation.py             NEW  ~200 LOC
├── test_fireplace_env.py           NEW  ~200 LOC
├── test_deck_source.py             NEW  ~50 LOC
├── test_mulligan_policy.py         NEW  ~30 LOC
├── test_discover_policy.py         NEW  ~30 LOC
├── test_choose_one_policy.py       NEW  ~30 LOC
├── test_opponents.py               NEW  ~120 LOC  fireplace-backed opponents
├── test_opponent_env.py            NEW  ~150 LOC  fireplace-backed wrapper
└── test_reward.py                  NEW  ~150 LOC  RewardFunction sign-walks

tests/unit/ai/test_network.py       MODIFY  slot_dim
tests/unit/ai/test_train_smoke.py   MODIFY
tests/unit/ai/test_config.py        MODIFY
tests/unit/ai/test_evaluate.py      MODIFY
tests/unit/ai/test_self_play.py     MODIFY

tests/unit/ai/test_opponent_env.py          DELETE in PR-6 (superseded by env/test_opponent_env.py)
tests/unit/ai/test_opponents.py             DELETE in PR-6 (superseded by env/test_opponents.py)
tests/unit/ai/test_reward_functions.py      DELETE in PR-6 (superseded by env/test_reward.py)
tests/unit/ai/test_build_observation.py     DELETE in PR-6
tests/unit/ai/test_card_embedding.py        DELETE in PR-6
tests/unit/ai/test_gym_env_observation.py   DELETE in PR-6
tests/unit/ai/test_training_pipeline.py     MODIFY (or DELETE if redundant with env/test_*)

tests/unit/test_action.py                  DELETE
tests/unit/test_card.py                    DELETE
tests/unit/test_card_loader.py             DELETE
tests/unit/test_card_display.py            DELETE
tests/unit/test_attack_executor.py         DELETE
tests/unit/test_attack_validator.py        DELETE
tests/unit/test_command_parser.py          DELETE
tests/unit/test_deck_manager.py            DELETE
tests/unit/test_enums.py                   DELETE
tests/unit/test_game_controller.py         DELETE
tests/unit/test_game_display.py            DELETE
tests/unit/test_game_engine.py             DELETE
tests/unit/test_game_state.py              DELETE
tests/unit/test_gym_env.py                 DELETE
tests/unit/test_hero.py                    DELETE
tests/unit/test_input_handler.py           DELETE
tests/unit/test_menu_display.py            DELETE
tests/unit/test_player.py                  DELETE
tests/unit/test_state_cache.py             DELETE
tests/unit/data/                           DELETE  entire dir
tests/unit/decks/                          DELETE  entire dir
tests/integration/                         DELETE  entire dir (all use old engine)
```

Net code change estimate: **~3500 LOC deleted**, **~1200 LOC new**, **~600 LOC test
new**, **~300 LOC test rewritten**.

## Component design

### `FireplaceGymEnv`

```python
class FireplaceGymEnv(gym.Env):
    metadata = {"render_modes": ["human"]}
    MAX_HAND = 10
    MAX_BOARD = 7
    NUM_ACTIONS = 512                # flat enum upper bound (worst-case ~233)
    MAX_OPP_ACTIONS_PER_STEP = 200   # defensive cap (used by OpponentEnv)
    MAX_CHOICE_RESOLUTIONS = 50      # defensive cap inside _auto_resolve_choices

    def __init__(
        self,
        deck1: list[str],            # fireplace card IDs (30 entries)
        deck2: list[str],
        hero1: str,                  # fireplace hero ID, e.g. "HERO_08" (Mage)
        hero2: str,
        training_player_idx: int = 0,    # 0 or 1
        mulligan_policy: MulliganPolicy = KeepLowCost(3),
        discover_policy: DiscoverPolicy = FirstOption(),
        seed: int | None = None,
    ): ...

    @property
    def training_player(self) -> "fireplace.Player": ...
    @property
    def opponent_player(self) -> "fireplace.Player": ...
    @property
    def current_valid_actions(self) -> list[Action]: ...

    def reset(self, seed=None, options=None) -> tuple[dict, dict]: ...
    def step(self, action_idx: int) -> tuple[dict, float, bool, bool, dict]: ...
    def build_observation_for(self, player: "fireplace.Player") -> dict: ...
    def render(self, mode="human"): ...   # delegates to fireplace.dump
    def close(self): ...
```

#### `reset()` flow

1. Construct two `fireplace.Player` objects with the deck card lists and hero
   IDs.
2. Construct `fireplace.Game(players, seed=...)`.
3. Call `game.start()` → enters `BEGIN_MULLIGAN`.
4. `_auto_resolve_choices()`: while either player has a `choice` pending,
   resolve via `mulligan_policy.cards_to_mulligan(choice.cards)` (mulligan
   phase, returns the cards to mulligan away) or
   `discover_policy.choose(choice.cards)` (Discover phase, returns one
   card). Hard cap at `MAX_CHOICE_RESOLUTIONS=50` iterations.
   Note: Choose-One on play is NOT routed through `player.choice` —
   fireplace expects the choice as the `choose=` argument of `card.play()`.
   See "Choose-One handling" below.
5. Set `current_valid_actions = enumerate_valid_actions(game.current_player)`.
6. Return `(self._build_observation(self.training_player), info)`.

#### `step(action_idx)` flow

1. `valid = self.current_valid_actions`.
2. If `action_idx >= len(valid)`: invalid action, `reward = -0.01`, no state change.
3. Otherwise:
   a. `before = _reward_snapshot(self)`.
   b. `dispatch(valid[action_idx], self)` (try / except `GameOver`).
   c. `_auto_resolve_choices()` (handle mid-turn Discover triggers).
   d. `after = _reward_snapshot(self)`.
   e. `reward = self.reward_fn.calc(before, after, self.training_player)`.
4. `terminated = self.game.ended`.
5. `self.current_valid_actions = enumerate_valid_actions(self.game.current_player)
   if not terminated else []`.
6. Return `(self._build_observation(self.training_player), reward, terminated, False, info)`.

#### Invariants

- `current_valid_actions[0]` is always `EndTurnAction()` when not terminated
  (asserted at end of `step`).
- `len(current_valid_actions) > 0` when not terminated.
- The observation is always built from `self.training_player`'s perspective,
  regardless of whose turn it is. `build_observation_for(other)` is a
  separate path used only by `SelfPlayOpponent.act`.
- Reward is always computed from `self.training_player`'s perspective. Damage
  to the training player on the opponent's turn produces a negative reward;
  this is what makes "end turn" cost-aware after `OpponentEnv` accumulates
  opponent-turn rewards.

### Action types (`action_enum.py`)

```python
@dataclass(frozen=True)
class EndTurnAction: ...

@dataclass(frozen=True)
class PlayCardAction:
    card_idx_in_hand: int
    target_entity_id: int | None       # None = no target required
    board_index: int | None            # None = append to end of field
    choose: str | None                 # Choose-One sub-card ID; populated by enumerator
                                       # for must_choose_one cards; None otherwise

@dataclass(frozen=True)
class AttackAction:
    attacker_entity_id: int
    target_entity_id: int

@dataclass(frozen=True)
class HeroPowerAction:
    target_entity_id: int | None
```

#### Choose-One handling

Fireplace's `card.play(choose=None)` raises `InvalidAction` when
`card.must_choose_one` is True (`fireplace/card.py:557-560`), and
`card.play_targets` for a Choose-One card is computed against the
**chosen sub-card**, not the outer card. This means we can NOT route
Choose-One through `_auto_resolve_choices()` — the choice has to be
made before `card.play()` is called.

S1' picks a sub-card deterministically at action-enumeration time
using a `ChooseOnePolicy`:

```python
# choose_one_policy.py
class ChooseOnePolicy:
    def choose(self, card: "PlayableCard") -> "PlayableCard":
        """Return one of card.choose_cards. Called when card.must_choose_one."""
        raise NotImplementedError

class FirstChoiceOne(ChooseOnePolicy):
    def choose(self, card): return card.choose_cards[0]
```

Default: `FirstChoiceOne`. Configurable via `configs/default.yaml`
`choose_one_policy: first` (parallel to `discover_policy`).

#### `enumerate_valid_actions(player, choose_one_policy) -> list[Action]`

```python
def enumerate_valid_actions(player, choose_one_policy) -> list[Action]:
    actions: list[Action] = [EndTurnAction()]   # always index 0

    for i, card in enumerate(player.hand):
        if not card.is_playable():
            continue
        # Resolve Choose-One BEFORE enumerating targets, since play_targets
        # is computed against the chosen sub-card.
        if card.must_choose_one:
            sub_card = choose_one_policy.choose(card)
            chosen_id = sub_card.id
            target_source = sub_card                    # play_targets comes from sub-card
        else:
            chosen_id = None
            target_source = card

        targets = target_source.play_targets or [None]
        for target in targets:
            tid = target.entity_id if target is not None else None
            actions.append(PlayCardAction(
                card_idx_in_hand=i,
                target_entity_id=tid,
                board_index=None,
                choose=chosen_id,
            ))

    for minion in player.field:
        if not minion.can_attack():
            continue
        for target in minion.attack_targets:
            actions.append(AttackAction(minion.entity_id, target.entity_id))

    hp = player.hero_power
    if hp is not None and hp.is_usable():
        targets = hp.play_targets or [None]
        for target in targets:
            tid = target.entity_id if target is not None else None
            actions.append(HeroPowerAction(tid))

    return actions
```

`board_index=None` means "append to end of field". The few cards that care
about insertion position (e.g., positional buffs) are not in basic+classic;
if they show up later, an `escape_handler` can be added to PlayCardAction
without touching the enumerator.

#### `dispatch(action, env)`

Resolves `entity_id` references via `env.game.entities` (linear scan,
N ≤ ~25). Calls fireplace API methods (`card.play(target=, choose=)`,
`minion.attack`, `hero_power.use`, `game.end_turn`). The `choose`
field of `PlayCardAction` is forwarded as-is to `card.play(choose=...)` —
fireplace accepts the sub-card ID string. Wraps the call in
`try/except fireplace.exceptions.GameOver` so terminal damage doesn't
bubble up.

### `CardFeatureEncoder` (`card_features.py`)

Constants:

```python
CARD_FEAT_DIM    = 80
MINION_STATE_DIM = 10
SLOT_DIM         = CARD_FEAT_DIM + MINION_STATE_DIM    # = 90
```

**All slot features are clipped to `[0.0, 1.0]`.** Every numeric feature
divides by an explicit MAX and clips. Cards exceeding MAX (e.g., a
12-cost basic+classic card with `cost/10` would be 1.2) saturate at 1.0.
Bounds are picked generously enough that saturation is rare in
basic+classic but explicit so future expansions don't silently break
`observation_space.contains(obs)`.

Static feature layout (80 dims; all values in `[0, 1]`):

| Range | Width | Content | Normalisation |
|---|---|---|---|
| `[0:4]` | 4 | cost, atk, hp, durability | `min(x, MAX) / MAX` with MAX = 10, 20, 20, 5 |
| `[4:8]` | 4 | type one-hot: MINION / SPELL / WEAPON / HERO_POWER | 0/1 |
| `[8:19]` | 11 | class one-hot: NEUTRAL + 10 classes | 0/1 |
| `[19:31]` | 12 | race one-hot: NONE / BEAST / DEMON / DRAGON / ELEMENTAL / MECH / MURLOC / NAGA / PIRATE / TOTEM / UNDEAD / ALL | 0/1 |
| `[31:46]` | 15 | mechanic one-hot: BATTLECRY, DEATHRATTLE, TAUNT, DIVINE_SHIELD, CHARGE, RUSH, WINDFURY, STEALTH, POISONOUS, LIFESTEAL, SPELL_DAMAGE, FREEZE, SECRET, SILENCE, REBORN | 0/1 |
| `[46:48]` | 2 | `has_aura`, `has_event_trigger` | 0/1 |
| `[48:60]` | 12 | effect fingerprint (below) | each `min(x, MAX) / MAX` |
| `[60:64]` | 4 | rarity one-hot: COMMON / RARE / EPIC / LEGENDARY | 0/1 |
| `[64:80]` | 16 | reserved (set / spell-school / future) | 0 |

Effect fingerprint (12 dims; all values in `[0, 1]`):

| Index | Field | MAX | Notes |
|---|---|---|---|
| 48 | `n_hit_ops` | 5 | count of `Hit`/`Damage` actions |
| 49 | `total_hit_damage` | 15 | summed damage |
| 50 | `n_buff_ops` | 5 | |
| 51 | `total_atk_buff` | 10 | summed atk delta from buff cards |
| 52 | `total_hp_buff` | 10 | summed hp delta |
| 53 | `n_draw_ops` | 5 | |
| 54 | `total_draw_count` | 5 | |
| 55 | `n_summon_ops` | 5 | |
| 56 | `n_destroy_ops` | 3 | |
| 57 | `n_heal_ops` | 3 | |
| 58 | `total_heal` | 15 | |
| 59 | `aoe_or_random_flag` | 1 | bit-OR of `aoe_flag` and `random_target_flag` |

Minion dynamic state (10 dims; all values in `[0, 1]`):

| Index | Field | MAX |
|---|---|---|
| 0 | `current_atk` | 20 |
| 1 | `current_hp` | 20 |
| 2 | `damage_taken` (= max_hp − current_hp) | 20 |
| 3 | `attacks_remaining_this_turn` | 2 (Windfury caps at 2) |
| 4 | `divine_shield_active` | 1 (0/1) |
| 5 | `frozen` | 1 (0/1) |
| 6 | `silenced` | 1 (0/1) |
| 7 | `stealth_active` | 1 (0/1) |
| 8 | `summoning_sick` | 1 (0/1) |
| 9 | reserved | — |

The `_clip_normalize(x, max_val)` helper is `min(max(x, 0), max_val) / max_val`
applied uniformly. A unit test (`test_card_features_in_unit_range`)
iterates the entire fireplace `cards.db`, encodes each, and asserts
`(0.0 <= feat).all() and (feat <= 1.0).all()` to catch any new card
with a value the encoder has not been told to clip.

#### Cache build (`build_card_feature_cache`)

Run once at process start (lazy on first encoder construction). Iterates
`fireplace.cards.db` (after `cards.db.initialize()`), fills cache keyed by
card ID. Logs coverage:
`[card_features] 87.3% of cards fully covered, 12.7% have unknown ops`.
Cards with unknown ops still receive valid stats / mechanics / rarity
features; only the effect fingerprint may be impoverished.

#### DSL walker (`_walk`)

Recursively descends `card_def.play`, `card_def.deathrattle`,
`card_def.events`, `card_def.update`. For each node, dispatches on type:

- `tuple`/`list` → walk children
- `fireplace.actions.Hit` → increment `n_hit`, add damage value (if literal),
  inspect selector for AoE / random flag
- `fireplace.actions.Buff` → increment `n_buff`, look up buff card by ID and
  read `atk` / `health` deltas
- `fireplace.actions.Draw` → increment `n_draw` (multiplier handled by outer
  tuple-multiplication wrapper)
- `fireplace.actions.Summon` → increment `n_summon`
- `fireplace.actions.Destroy` → increment `n_destroy`
- `fireplace.actions.Heal` → increment `n_heal`, add heal amount
- `fireplace.actions.EventListener` → walk `node.actions`
- Unknown → `c["unknown"] += 1`, silent skip

`_is_aoe_selector` and `_is_random_selector` inspect fireplace selector
objects (e.g., `ALL_ENEMIES`, `RandomPicker(...)`). Heuristic: covers the
common cases; cards using exotic selectors fall back to default-zero
fingerprint.

#### Encoder interface

```python
class CardFeatureEncoder:
    def __init__(self):
        if not _FEATURE_CACHE:
            build_card_feature_cache()

    def encode_hand_card(self, card) -> np.ndarray:    # shape (SLOT_DIM,)
        static = _FEATURE_CACHE.get(card.id, _ZERO_STATIC)
        return np.concatenate([static, _ZERO_STATE])

    def encode_minion(self, minion) -> np.ndarray:
        static = _FEATURE_CACHE.get(minion.id, _ZERO_STATIC)
        state = self._encode_minion_state(minion)
        return np.concatenate([static, state])

    def encode_empty(self) -> np.ndarray:
        return np.zeros(SLOT_DIM, dtype=np.float32)
```

### Observation (`observation.py`)

`build_observation_for(env, player)` returns:

```python
SCALAR_KEYS = (
    "player_health", "player_armor", "player_mana", "player_max_mana",
    "player_overload", "player_hand_size", "player_board_size",
    "player_deck_size", "player_secrets_count",
    "opponent_health", "opponent_armor", "opponent_hand_size",
    "opponent_board_size", "opponent_deck_size", "opponent_secrets_count",
    "weapon_atk_player", "weapon_dur_player",
    "weapon_atk_opponent", "weapon_dur_opponent",
    "turn_number", "is_my_turn",
)   # 21 scalars

SCALAR_BOUNDS = {                                # explicit per-scalar (low, high)
    "player_health": (0,   60),  "player_armor":      (0,  99),
    "player_mana":   (0,   10),  "player_max_mana":   (0,  10),
    "player_overload": (0, 10),
    "player_hand_size": (0, 10), "player_board_size": (0,  7),
    "player_deck_size": (0, 60), "player_secrets_count": (0, 5),
    "opponent_health": (0, 60), "opponent_armor":     (0, 99),
    "opponent_hand_size": (0, 10), "opponent_board_size": (0, 7),
    "opponent_deck_size": (0, 60), "opponent_secrets_count": (0, 5),
    "weapon_atk_player": (0, 20), "weapon_dur_player":  (0, 20),
    "weapon_atk_opponent": (0, 20), "weapon_dur_opponent": (0, 20),
    "turn_number": (0, 100),     "is_my_turn":         (0, 1),
}

observation_space = spaces.Dict({
    "player_hand":    Box(0.0, 1.0, shape=(MAX_HAND, SLOT_DIM),  dtype=np.float32),
    "player_board":   Box(0.0, 1.0, shape=(MAX_BOARD, SLOT_DIM), dtype=np.float32),
    "opponent_board": Box(0.0, 1.0, shape=(MAX_BOARD, SLOT_DIM), dtype=np.float32),
    **{
        k: Box(low=lo, high=hi, shape=(1,), dtype=np.float32)
        for k, (lo, hi) in SCALAR_BOUNDS.items()
    },
})
```

**Slot tensors are `Box(0, 1)`** because the encoder explicitly clips
all numeric features and one-hots are `0/1` (see CardFeatureEncoder
section).

**Scalar bounds are explicit per-key** rather than a uniform `(0, 100)`,
giving real validation power — `observation_space.contains(obs)` will
catch (e.g.) a `weapon_dur_player` exceeding 20 (a sign of a feature
bug). Bounds are picked generous enough that legal state never
saturates: `player_health` 60 covers extreme armor; `weapon_atk` 20
covers Gorehowl + buffs; `turn_number` 100 covers fatigue endgames.

The env clips raw values into bounds before placing them in obs (matching
the slot-feature philosophy) — this is documented as defense-in-depth, but
fireplace state should never legally exceed the listed maxima.

Opponent's hand is **not** in the observation: real Hearthstone hides hand
contents. `opponent_hand_size` is the only signal. Both players' decks are
hidden contents-wise; only sizes are observable.

When `player == env.training_player`, "player_*" reflects training player
and "opponent_*" reflects opponent. When called with the other player (only
by `SelfPlayOpponent.act`), the perspective swaps. `is_my_turn = 1.0` if
`game.current_player is player`, else `0.0`.

Padding: hand and board slots are filled with `encoder.encode_empty()` to
the max size.

### Network (`network.py`)

Changes to `PolicyValueNetwork`:

```python
def __init__(self, slot_dim: int = 90, hidden_dim: int = 128, num_actions: int = 512):
    self.card_encoder = CardEncoder(slot_dim, hidden_dim)
    self.num_scalars = len(SCALAR_KEYS)              # 21
    flat_dim = 10*hidden_dim + 2*7*hidden_dim + self.num_scalars
    ...
```

`SCALAR_KEYS` updated to the 21-tuple above. `embedding_dim` parameter renamed
`slot_dim` (with a deprecation note in CHANGELOG, since old checkpoints are
abandoned anyway). `policy_head` becomes `Linear(hidden_dim, 512)`.

No structural change beyond constants. `RolloutBuffer`, `PPOTrainer`,
`Curriculum` are untouched.

### Reward (`env/reward.py`)

**Terminal status detection.** Fireplace has no `Game.winning_player`
attribute; the terminal outcome is recorded on each player's `playstate`
(see `fireplace/game.py` `check_for_end_game`, which sets `WON / LOST /
TIED` on the players). The snapshot reads
`training_player.playstate` directly.

```python
from hearthstone.enums import PlayState   # provided by hearthstone-data, not fireplace itself

def _reward_snapshot(env) -> dict:
    """Cheap (non-deep-copy) snapshot for shaping reward."""
    p = env.training_player
    o = env.opponent_player
    return {
        "p_health":  p.hero.health,
        "p_armor":   p.hero.armor,
        "o_health":  o.hero.health,
        "o_armor":   o.hero.armor,
        "p_board":   len(p.field),
        "o_board":   len(o.field),
        "ended":     env.game.ended,
        "p_playstate": p.playstate,                    # PlayState enum
    }


class RewardFunction:
    DAMAGE_OPP_COEF  = 0.01     # positive: damage to opponent → reward
    DAMAGE_SELF_COEF = -0.01    # negative: damage to self → penalty
    BOARD_DELTA_COEF = 0.05
    WIN_REWARD  = 1.0
    LOSS_REWARD = -1.0
    TIE_REWARD  = 0.0

    def calc(self, before: dict, after: dict, training_player) -> float:
        # Terminal: read training player's playstate directly.
        if after["ended"] and not before["ended"]:
            ps = after["p_playstate"]
            if ps == PlayState.WON:
                return self.WIN_REWARD
            if ps == PlayState.LOST:
                return self.LOSS_REWARD
            return self.TIE_REWARD                     # TIED / CONCEDED / etc.

        opp_eh_b = before["o_health"] + before["o_armor"]
        opp_eh_a = after["o_health"]  + after["o_armor"]
        own_eh_b = before["p_health"] + before["p_armor"]
        own_eh_a = after["p_health"]  + after["p_armor"]

        # opp_damage_dealt is positive when we hurt the opponent
        # self_damage_taken is positive when we got hurt
        opp_damage_dealt = opp_eh_b - opp_eh_a
        self_damage_taken = own_eh_b - own_eh_a

        r  = self.DAMAGE_OPP_COEF  * opp_damage_dealt
        r += self.DAMAGE_SELF_COEF * self_damage_taken     # negative coef → penalty
        r += self.BOARD_DELTA_COEF * (after["p_board"] - before["p_board"])
        r -= self.BOARD_DELTA_COEF * (after["o_board"] - before["o_board"])
        return r
```

**Sign-walk:** when the opponent attacks training player from 30→27 HP,
`self_damage_taken = 30 − 27 = +3`, and `r += −0.01 × 3 = −0.03` → penalty.
When the agent damages opponent from 30→27, `opp_damage_dealt = +3` and
`r += 0.01 × 3 = +0.03` → reward. Both signs verified.

Reward is always from `training_player`'s perspective. On the opponent's
turn, when the opponent attacks the training player, this returns a negative
shaping reward — which `OpponentEnv` accumulates into the agent-facing
reward, ensuring "end turn" is not free.

### `OpponentEnv` (`env/opponent_env.py`)

```python
class OpponentEnv(gym.Env):
    MAX_OPP_ACTIONS_PER_STEP = 200

    def __init__(self, base_env: FireplaceGymEnv, opponent: OpponentPolicy):
        self._env = base_env
        self.opponent = opponent
        self.observation_space = base_env.observation_space
        self.action_space = base_env.action_space

    def reset(self, **kw):
        obs, info = self._env.reset(**kw)
        obs, extra, term, trunc, info = self._loop_opponent(obs, info)
        return obs, info

    def step(self, action_idx):
        obs, reward, term, trunc, info = self._env.step(action_idx)
        if term:
            return obs, reward, term, trunc, info
        obs, extra, term, trunc, info = self._loop_opponent(obs, info)
        return obs, reward + extra, term, trunc, info

    def _loop_opponent(self, obs, info):
        extra = 0.0
        env = self._env
        for _ in range(self.MAX_OPP_ACTIONS_PER_STEP):
            if env.game.ended or env.game.current_player is env.training_player:
                break
            opp_idx = self.opponent.act(env)
            obs, r, term, trunc, info = env.step(opp_idx)
            extra += r
            if term:
                return obs, extra, True, trunc, info
        else:
            logger.warning("Opponent action cap hit; forcing end turn (idx 0)")
            obs, r, term, trunc, info = env.step(0)
            extra += r
        return obs, extra, env.game.ended, False, info
```

Force-end fallback uses index 0, which by invariant is always
`EndTurnAction()`.

### Opponents (`env/opponents.py`)

```python
class OpponentPolicy:
    """Contract: act(env) is invoked when env.game.current_player is the opponent."""
    def act(self, env: FireplaceGymEnv) -> int: ...


class RandomOpponent(OpponentPolicy):
    def act(self, env):
        n = len(env.current_valid_actions)
        return random.randrange(n) if n > 0 else 0


class SelfPlayOpponent(OpponentPolicy):
    """Frozen network, greedy argmax over masked logits."""

    def __init__(self, network_path: Optional[str], slot_dim=90, hidden_dim=128, num_actions=512):
        self.network = PolicyValueNetwork(slot_dim=slot_dim,
                                          hidden_dim=hidden_dim,
                                          num_actions=num_actions)
        if network_path is not None:
            self.load_from(network_path)
        self.network.eval()
        self.num_actions = num_actions

    def load_from(self, path: str):
        ckpt = torch.load(path, map_location="cpu")
        sd = ckpt["network"] if "network" in ckpt else ckpt
        self.network.load_state_dict(sd)
        self.network.eval()

    def act(self, env):
        # Build obs from current_player's POV (the opponent's POV when called).
        obs = env.build_observation_for(env.game.current_player)
        valid_n = len(env.current_valid_actions)
        if valid_n == 0:
            return 0
        torch_obs = {k: torch.from_numpy(v).unsqueeze(0) for k, v in obs.items()}
        mask = np.zeros(self.num_actions, dtype=np.float32)
        mask[: min(valid_n, self.num_actions)] = 1.0
        with torch.no_grad():
            logits, _ = self.network(torch_obs)
            logits = logits[0] + (1.0 - torch.from_numpy(mask)) * -1e9
            return int(torch.argmax(logits).item())
```

### Mulligan / Discover policies

**Fireplace API direction.** `MulliganChoice.choose(*cards)` (in
`fireplace/actions.py`) takes the cards to **mulligan away** (send to
deck and replace from top), not the cards to keep. This spec's policy
interface matches that direction — the policy returns the cards to
mulligan. `KeepLowCost(threshold=3)` therefore returns cards with `cost >
threshold`, not the low-cost cards. Naming the method `cards_to_mulligan`
keeps the intent unambiguous and prevents silent inversion bugs.

```python
# mulligan_policy.py
class MulliganPolicy:
    def cards_to_mulligan(self, hand: list["PlayableCard"]) -> list["PlayableCard"]:
        """Return cards to MULLIGAN AWAY; the rest are kept.
        Passed directly to fireplace's MulliganChoice.choose(*cards)."""
        raise NotImplementedError

class KeepAll(MulliganPolicy):
    def cards_to_mulligan(self, hand): return []                  # mulligan nothing

class KeepLowCost(MulliganPolicy):
    """Aggressive baseline: keep cost <= threshold, mulligan the rest."""
    def __init__(self, threshold: int = 3):
        self.threshold = threshold
    def cards_to_mulligan(self, hand):
        return [c for c in hand if c.cost > self.threshold]       # mulligan high-cost


# discover_policy.py
class DiscoverPolicy:
    def choose(self, options: list["PlayableCard"]) -> "PlayableCard":
        raise NotImplementedError

class FirstOption(DiscoverPolicy):
    def choose(self, options): return options[0]

class LowestCost(DiscoverPolicy):
    def choose(self, options):
        return min(options, key=lambda c: c.cost)
```

`FireplaceGymEnv._auto_resolve_choices()` dispatches:

```python
def _auto_resolve_choices(self):
    for _ in range(self.MAX_CHOICE_RESOLUTIONS):
        for player in self.game.players:
            choice = player.choice
            if choice is None:
                continue
            if isinstance(choice, MulliganChoice):
                muls = self.mulligan_policy.cards_to_mulligan(list(choice.cards))
                choice.choose(*muls)              # fireplace expects unpacked args
            else:
                # Discover / Choose-One / GenericChoice: pick exactly one
                pick = self.discover_policy.choose(list(choice.cards))
                choice.choose(pick)
        if all(p.choice is None for p in self.game.players):
            return
    raise RuntimeError(
        f"Choice resolution did not converge within {self.MAX_CHOICE_RESOLUTIONS} "
        f"iterations; game state: {self.game!r}"
    )
```

The two policy interfaces differ intentionally — `MulliganChoice.choose(*cards)`
accepts a variadic list (zero or more cards to mulligan), while
`Choice.choose(card)` accepts exactly one card. Trying to unify them
would push casework into the policies; keep them separate.

### Deck source (`deck_source.py`)

```python
def load_deck(name: str) -> tuple[list[str], str]:
    """Load YAML deck from data/fireplace_decks/<name>.yaml.
    Returns (card_ids, hero_id). Raises FileNotFoundError or ValueError."""

def list_available_decks() -> list[str]: ...

def random_deck(hero_class: HeroClass) -> tuple[list[str], str]:
    """Random draft via fireplace.utils.random_draft. Used by S3' deck pool training."""
```

YAML format:

```yaml
name: Basic Mage
hero_id: HERO_08
cards:
  - CS2_023        # Arcane Intellect
  - CS2_023
  - CS2_024        # Frostbolt
  ...              # 30 entries total, validated on load
```

For S1' we ship `basic_mage.yaml` and `basic_warrior.yaml` — minimal but
diverse enough for smoke tests. The deck contents are picked from fireplace's
basic set with a focus on cards whose effects cover the full encoder
fingerprint range (damage spells, draw, AoE, buff, weapon, taunt, divine
shield, charge).

### Evaluate (`evaluate.py`) loop adaptation

```python
DEFAULT_MAX_ACTIONS_PER_GAME = 1000   # carried over from existing evaluate.py

def evaluate(network, opponent_factory, n_games, deck1, deck2, hero1, hero2,
             training_player_idx, slot_dim=90, num_actions=512,
             max_actions_per_game: int = DEFAULT_MAX_ACTIONS_PER_GAME) -> float:
    eval_agent = SelfPlayOpponent(network_path=None, slot_dim=slot_dim, num_actions=num_actions)
    eval_agent.network = network
    eval_agent.network.eval()
    wins = 0
    for _ in range(n_games):
        env = FireplaceGymEnv(deck1, deck2, hero1, hero2,
                              training_player_idx=training_player_idx)
        opp = opponent_factory()
        obs, _ = env.reset()
        terminated = truncated = False
        action_count = 0
        cap_hit = False
        while not (terminated or truncated) and action_count < max_actions_per_game:
            if env.game.current_player is env.training_player:
                action = eval_agent.act(env)
            else:
                action = opp.act(env)
            obs, _, terminated, truncated, _ = env.step(action)
            action_count += 1
        if action_count >= max_actions_per_game and not terminated:
            cap_hit = True
        if not cap_hit and env.training_player.playstate == PlayState.WON:
            wins += 1
        # cap_hit games count as non-wins (defense-in-depth against stuck states)
    return wins / n_games
```

This carries over the existing `max_actions_per_game=1000` cap (defense
against deterministic stuck states); cap-hit games are counted as
non-wins. Greedy on the agent's side, opponent-supplied policy on the
other side. Used identically by curriculum (Random eval) and self-play
refresh checks (frozen self-play opponent).

## Configuration

`configs/default.yaml` diff:

```yaml
# === REMOVED ===
# deck1: test_deck
# deck2: test_deck
# training_player_name: "Player 1"
# embedding_dim: 64

# === RENAMED ===
slot_dim: 90                       # was: embedding_dim
num_actions: 512                   # was: hard-coded 100 in HearthstoneEnv

# === NEW ===
deck_pool:
  - basic_mage
  - basic_warrior
deck_selection: fixed              # fixed | random_pair  (S1' uses fixed)
fixed_deck1: basic_mage
fixed_deck2: basic_warrior
training_player_idx: 0             # 0 | 1 (S1' deterministic; "random" deferred to S3')

mulligan_policy: keep_low_cost     # keep_all | keep_low_cost
mulligan_threshold: 3
discover_policy: first             # first | lowest_cost
choose_one_policy: first           # first (FirstChoiceOne) — pre-picks card.choose_cards[0]

card_features:
  log_coverage: true               # log DSL coverage at startup
```

PPO / curriculum / self_play / eval / checkpoint sections are unchanged.
`TrainConfig` dataclass gains corresponding fields; missing keys raise
`TypeError` (existing pattern). The `--override` CLI flag continues to
support nested keys (`--override card_features.log_coverage=false`).

`pyproject.toml`:

```toml
dependencies = [
    "fireplace @ file:///home/xu/code/hstone/hearthstone/fireplace",  # local dev
    "hearthstone-data",   # transitive: provides CardDefs.xml
    "torch>=2.0",
    "gymnasium>=0.29",
    "numpy>=1.24",
    "pyyaml>=6.0",
]

[project]
license = "AGPL-3.0-or-later"     # fireplace dependency forces this
```

`README.md` gains a "Licensing" section that states clearly:

> hs_glm imports fireplace, which is AGPL-3.0. As of S1', the project is
> personal research and is not published or offered as a network service —
> private development is unaffected. **Any future decision to open-source
> hs_glm, distribute binaries, or run hs_glm as a network-accessible
> service (including model serving or a web demo) triggers AGPL §13: the
> entire combined work, including training code, configuration, and any
> service wrapper, must be released under AGPL-3.0-or-later with full
> source available to remote users.** Re-evaluate the license fit before
> any such change.

## Failure modes

| Failure | Detection | Response |
|---|---|---|
| `fireplace.cards.db` initialization fails (hearthstone-data missing or CardDefs.xml not downloaded) | At env construction | Print install instructions (`pip install hearthstone-data` + `aria2c CardDefs.xml URL`), exit 1 |
| Deck YAML invalid (missing keys, wrong card count, unknown card_id) | `load_deck` validates | Specific error message naming the problem; exit 1 |
| Card ID in deck not found in `cards.db` | `load_deck` checks against `cards.db` | Same as above |
| `fireplace.exceptions.GameOver` raised mid-action | `step()` wraps `dispatch` in `try/except` | Set `terminated=True`, build final observation, return |
| `_auto_resolve_choices` exceeds `MAX_CHOICE_RESOLUTIONS` (50) | Counter inside loop | `RuntimeError` with `repr(game)` dump (likely fireplace bug or pathological card combo) |
| `current_valid_actions` empty when not terminated | Assert at end of `step()` | `AssertionError` with state dump; should never fire because `EndTurnAction` is always present |
| Card seen in deck whose features fail to extract | `build_card_feature_cache` keeps going | Falls back to zero static features; logged in coverage stat |
| `OpponentEnv` opponent action cap (200) | `for/else` branch | Logged warning, force end turn via index 0 |
| NaN loss after PPO update | Existing handling in `PPOTrainer` | Save checkpoint with `_nan` suffix, raise (unchanged) |
| Resume checkpoint version mismatch (slot_dim or num_actions differ) | Network `load_state_dict` raises | Print mismatch, exit 1; user must start fresh |
| AGPL alert | n/a | `pyproject.toml` license metadata + README note |

## Testing strategy

All tests use real fireplace; no mocking of fireplace internals (mocks would
silently break on fireplace upgrades, defeating the purpose of integration).

### `tests/unit/ai/env/test_card_features.py`

- `test_basic_minion_features` — Chillwind Yeti (CS2_182): cost=4, atk=4, hp=5, type=MINION, no mechanics
- `test_taunt_minion_features` — Sen'jin (CS2_179): mechanic[TAUNT]=1
- `test_battlecry_minion_no_target` — a basic battlecry minion: has_battlecry=1
- `test_spell_features_frostbolt` — CS2_024: type=SPELL, n_hit=1, total_hit~3/15, FREEZE mechanic=1
- `test_spell_features_aoe` — Arcane Explosion: aoe_or_random=1, n_hit=1
- `test_spell_features_random` — Arcane Missiles: aoe_or_random=1, n_hit≥1
- `test_spell_features_draw` — Arcane Intellect: n_draw=1, total_draw≥2/5
- `test_spell_features_buff` — Blessing of Kings: n_buff=1, total_atk_buff>0, total_hp_buff>0
- `test_unknown_op_silently_skipped` — synthesize a card with a fake action class; encoder doesn't crash; `unknown` counter increments
- `test_minion_state_features_summoning_sick` — minion summoned this turn: state[summoning_sick]=1, attacks_remaining=0
- `test_minion_state_features_after_buff` — buffed minion: current_atk reflects buff
- `test_minion_state_features_divine_shield_consumed` — after taking damage with shield: state[divine_shield_active]=0
- `test_cache_size_under_2mb` — assert `sys.getsizeof(_FEATURE_CACHE) < 2_000_000`
- `test_cache_built_in_under_5s` — sanity perf check
- `test_coverage_logged` — capture stdout, assert "% covered" appears

### `tests/unit/ai/env/test_action_enum.py`

- `test_end_turn_always_at_index_0` — over many random states, `valid[0] == EndTurnAction()`
- `test_unplayable_cards_filtered` — card costing 5 not in actions when mana=2
- `test_targeted_card_enumerates_all_targets` — Frostbolt with 3 valid targets → 3 actions
- `test_attack_filtered_by_taunt` — when opponent has a taunt, only taunt is in attack_targets
- `test_hero_power_appears_when_usable` — fresh turn, mana ≥ 2 → hero power action present
- `test_hero_power_absent_after_use` — after using hero power once, action gone
- `test_dispatch_play_card_modifies_state` — dispatch a Frostbolt; opponent hero takes 3 damage
- `test_dispatch_attack_modifies_state` — dispatch attack; both characters take damage
- `test_dispatch_end_turn_advances_current_player`
- `test_dispatch_unknown_action_type_raises_typeerror`

### `tests/unit/ai/env/test_observation.py`

- `test_observation_shape_matches_space` — `observation_space.contains(obs)` is True
- `test_observation_perspective_default_is_training_player`
- `test_observation_perspective_swap` — `build_observation_for(opponent)` shows opponent's hand, training player's hand becomes hidden
- `test_observation_state_channels_zero_for_hand` — slice of hand obs at state-dim positions is all zeros
- `test_observation_minion_state_reflects_current_hp` — damage a minion, observe its state[current_hp] decreased
- `test_observation_scalars_match_player_state` — player_health == game.player1.hero.health (etc.)
- `test_observation_is_my_turn_flag` — when current_player is the training player, scalar = 1.0

### `tests/unit/ai/env/test_fireplace_env.py`

- `test_reset_runs_mulligan_and_settles_to_normal_state` — after reset, no player has pending choice
- `test_mulligan_keeps_low_cost_cards` — `KeepLowCost(3)` on a hand of mixed costs: low-cost cards remain in hand after reset, high-cost cards are gone
- `test_reset_returns_observation_from_training_perspective`
- `test_step_play_card_changes_state` — agent plays Frostbolt, opponent hero loses 3 HP
- `test_step_invalid_action_returns_negative_reward_no_state_change`
- `test_step_terminates_when_opponent_dies` — set up scenario where lethal is available; agent plays it; `terminated=True`, reward = `WIN_REWARD`, `training_player.playstate == PlayState.WON`
- `test_step_terminal_loss` — opponent kills training player; `terminated=True`, reward = `LOSS_REWARD`
- `test_step_terminal_tie` — both players die same step; reward = `TIE_REWARD`
- `test_step_reward_is_from_training_perspective` — when it's opponent's turn and opponent damages training player, reward < 0
- `test_step_reward_self_damage_sign` — directly assert that taking 3 damage produces a negative shaping reward (regression for the original sign-flip bug)
- `test_seed_reproducibility` — two envs with same seed deal identical hands
- `test_build_observation_for_arbitrary_perspective`
- `test_current_valid_actions_endturn_invariant`
- `test_valid_actions_under_num_actions_bound` — property-style: run 20 games of `basic_mage` vs `basic_warrior`, assert `len(env.current_valid_actions) <= NUM_ACTIONS` at every step. Catches future cards that explode the action space beyond the 512 cap.

### `tests/unit/ai/env/test_deck_source.py`

- `test_load_deck_returns_30_cards`
- `test_load_deck_validates_card_ids` — bogus card_id → ValueError
- `test_load_deck_missing_file_raises`
- `test_random_deck_respects_class`

### `tests/unit/ai/env/test_mulligan_policy.py` and `test_discover_policy.py`

- Trivial unit tests that the policies pick the right cards.

### `tests/unit/ai/test_opponent_env.py` (REWRITE)

- `test_reset_runs_opponent_first_when_p2_is_training` — `training_player_idx=1`, opponent acts first
- `test_step_loops_opponent_until_training_turn`
- `test_reward_accumulates_across_opponent_turns` — opponent attacks training hero across multiple actions; outer step's reward reflects total damage
- `test_terminated_during_opponent_turn` — opponent gets lethal mid-turn; outer step returns terminated=True with LOSS_REWARD
- `test_opponent_action_cap_force_ends_turn` — synthesize a bad opponent that picks non-end-turn forever; cap triggers, falls back to index 0

### `tests/unit/ai/test_opponents.py` (REWRITE)

- `test_random_opponent_returns_valid_index`
- `test_random_opponent_with_no_valid_actions_returns_zero`
- `test_self_play_opponent_loads_state_dict_round_trip`
- `test_self_play_opponent_uses_current_player_perspective` — assert `build_observation_for` is called with `env.game.current_player`
- `test_self_play_opponent_greedy_respects_mask`

### `tests/unit/ai/test_train_smoke.py` (MODIFY)

- `test_two_iter_train_smoke` — uses `basic_mage` vs `basic_warrior`, 2 iters, `rollout_steps=64`, `eval_every=1`, `eval_games=4`. Verifies `metrics.csv` has 2 iter rows + 2 eval rows; checkpoint file exists. Marked `@pytest.mark.slow`.

### Tests deleted

All tests under `tests/unit/test_*.py` that exercise the old engine
(see file layout); all of `tests/integration/`; `tests/unit/data/`; `tests/unit/decks/`.
`test_build_observation.py`, `test_card_embedding.py`, `test_gym_env_observation.py`
under `tests/unit/ai/` are superseded.

### Total test counts (estimate)

- New: 7 files, ~110 tests
- Rewritten: 4 files, ~25 tests
- Modified: 6 files, ~10 tests adjusted
- Deleted: ~30 files

## Migration steps (PR series)

A rough chunking; the actual implementation plan (writing-plans phase) will
expand each into detailed tasks. **Sequencing principle: build the new path
end-to-end before deleting the old.** Each PR keeps `main` green; tests pass
on every commit. The old hs_glm engine sits unused but functional through
PR-1 to PR-5; PR-6 removes it.

```
PR-1  Setup. pyproject.toml: add fireplace as a local-path dependency;
      bump license metadata to AGPL-3.0-or-later; README note on AGPL
      transitivity. Add hearthstone-data install instructions and
      CardDefs.xml fetch step. requirements.txt updated. CI installs
      fireplace successfully. No source code touched yet.

PR-2  hearthstone/ai/env/card_features.py + test_card_features.py.
      Independent of env wiring; runs in isolation. DSL-walker behaviour
      unit-tested against fireplace card definitions.

PR-3  hearthstone/ai/env/{action_enum,observation,deck_source,
      mulligan_policy,discover_policy,choose_one_policy,fireplace_env}.py
      + their test files + data/fireplace_decks/{basic_mage,basic_warrior}.yaml
      + README.  `FireplaceGymEnv` is exercisable via tests but not yet
      wired into training. Old `HearthstoneEnv` continues to exist alongside.

PR-4  hearthstone/ai/env/{opponents,opponent_env,reward}.py + matching
      tests/unit/ai/env/test_*. These are NEW modules under env/; the old
      hearthstone/ai/{opponents,opponent_env,reward_functions}.py remain
      untouched and unaffected, so existing tests targeting the old engine
      keep passing. End-to-end tested by the new tests via
      OpponentEnv → FireplaceGymEnv.

PR-5  Wire training onto the new path. hearthstone/ai/network.py adopts
      `slot_dim` / 21 scalars / 512 actions. scripts/train.py switches
      imports to hearthstone.ai.env.{fireplace_env, opponents, opponent_env,
      reward} (this is the largest change in this PR — see "high-risk
      areas" below). hearthstone/ai/{evaluate,self_play,config}.py adapted
      to the new modules. configs/default.yaml diff applied.
      `test_train_smoke.py` updated and passing on the new path.
      Old hearthstone/ai/{opponents,opponent_env,reward_functions,
      card_embedding,gym_env}.py are now unimported but still present
      on disk to keep main green.

PR-6  Cleanup. Delete in one PR:
        hearthstone/{engine,models,decks,data}/
        hearthstone/ai/{opponents,opponent_env,reward_functions,
                        card_embedding,gym_env}.py
        data/cards/, data/decks/
        cli/, web/, main.py, run_web.py
        tests/unit/test_{action,card,card_loader,card_display,
                          attack_executor,attack_validator,command_parser,
                          deck_manager,enums,game_controller,game_display,
                          game_engine,game_state,gym_env,hero,input_handler,
                          menu_display,player,state_cache}.py
        tests/unit/ai/test_{opponents,opponent_env,reward_functions,
                            build_observation,card_embedding,
                            gym_env_observation}.py
        tests/unit/{data,decks}/
        tests/integration/
      Run full test suite. If anything fails, the PR is fixing a missed
      import in the new path, not bringing back the old engine.
```

### High-risk areas (called out for plan/review attention)

- **PR-5: `scripts/train.py`.** Estimated change is **80–150 LOC**, not 30.
  Affected paths: env construction (`_make_env` factory), action mask
  building, network construction (`slot_dim` propagation), self-play
  opponent instantiation (different signature), `--resume` config compat
  (old checkpoints are abandoned but the resume code path must error
  cleanly, not crash mysteriously). Also: import paths shift from
  `hearthstone.ai.{opponents,opponent_env,reward_functions}` to
  `hearthstone.ai.env.{opponents,opponent_env,reward}`.
- **PR-3: Choose-One handling.** `card.play(choose=None)` raises
  `InvalidAction` when `must_choose_one`. Action enumerator pre-picks a
  sub-card via `ChooseOnePolicy` and uses the **sub-card's** `play_targets`,
  not the outer card's. Test: enumerate a Choose-One card (e.g., a Druid
  card via Discover/Generate path or a synthetic test deck) and assert
  the resulting `PlayCardAction.choose` is non-None and dispatch succeeds.
- **PR-3: `_auto_resolve_choices` mulligan direction.** `KeepLowCost(3)`
  returns the cards to MULLIGAN (cost > 3), not the cards to keep (cost
  ≤ 3). Regression test: hand with mixed costs, after reset the
  high-cost cards have been mulliganed.
- **PR-3: Observation feature bounds.** All slot features clipped to
  `[0, 1]`; scalars have explicit per-key bounds (see `SCALAR_BOUNDS`).
  `observation_space.contains(obs)` should be asserted in
  `test_observation_shape_matches_space`. A second test
  (`test_card_features_in_unit_range`) iterates the full `cards.db` and
  asserts every encoded card stays in `[0, 1]`.
- **PR-4: Reward sign at terminal.** `PlayState.WON / LOST / TIED` paths
  must be tested individually; missing branch (e.g., `CONCEDED` not handled)
  silently produces `WIN_REWARD` or `LOSS_REWARD` because of `ps == WON`
  / `ps == LOST` falsiness elsewhere. The spec routes everything not WON
  / LOST to TIE_REWARD; the test suite enforces this with parametrised
  states.
- **PR-6: Atomic deletion.** PR-6 deletes the old engine, old
  hearthstone/ai/ modules, and their tests in one shot. Before opening
  the PR, run `grep -r "from hearthstone.ai.opponents import\|from
  hearthstone.ai.opponent_env import\|from hearthstone.ai.reward_functions
  import\|from hearthstone.ai.card_embedding import\|from hearthstone.ai.
  gym_env import\|from hearthstone.engine import\|from hearthstone.models
  import"` and confirm zero hits in the kept code. Any hit means PR-5
  missed an import migration.

## Open questions

None at design time. All decisions are recorded above. Unknowns about
fireplace internals (exact selector class names for AoE / random detection,
exact `Buff` second-arg structure) will be resolved during implementation
by reading fireplace source; if they differ from what's described here,
the relevant section is updated in this spec via amendment.

## Spec self-review

- **Placeholders.** None. All defaults are concrete (slot_dim=90,
  num_actions=512, MAX_OPP_ACTIONS=200, MAX_CHOICE_RESOLUTIONS=50,
  max_actions_per_game=1000, mulligan threshold=3, reward coefficients,
  fingerprint dim layout).
- **Internal consistency.**
  - `SLOT_DIM = CARD_FEAT_DIM + MINION_STATE_DIM` referenced consistently
    across encoder, network, observation sections.
  - `action_idx 0 == EndTurnAction()` invariant referenced from
    `enumerate_valid_actions`, `OpponentEnv` fallback, `step` invariants,
    and tests.
  - Reward perspective ("always from training_player") referenced in env
    section, reward section, and OpponentEnv accumulation justification.
  - `build_observation_for(player)` is the single perspective-swap point;
    used by env (default training_player) and SelfPlayOpponent (current_player).
  - Terminal status read from `Player.playstate` (not `Game.winning_player`
    which does not exist in fireplace). Verified against fireplace source
    `game.py:check_for_end_game`.
  - `MulliganChoice.choose(*cards)` semantics: cards passed are mulliganed
    away, not kept. `MulliganPolicy.cards_to_mulligan(hand)` matches the
    fireplace API direction. `KeepLowCost(threshold=3).cards_to_mulligan`
    returns `cost > threshold` (high-cost cards), not low-cost ones.
  - Reward sign-walk verified: self-damage of +3 HP produces
    `r += −0.01 × 3 = −0.03` (penalty), opponent-damage of +3 HP produces
    `r += +0.01 × 3 = +0.03` (reward).
- **Scope.** Single sub-project (S1'). Defers: agent-driven mulligan/Discover,
  random deck pool, NLP card text, two-stage action space, draw quality
  auxiliary head. Each is named in non-goals.
- **Ambiguity check.**
  - "Improvement" for plateau detection unchanged from training-driver spec
    (strict greater-than).
  - Reward on opponent turn is negative shaping; OpponentEnv accumulates;
    documented twice for clarity.
  - `current_valid_actions` is rebuilt every `step` for the new
    `current_player`, regardless of whose turn it is — so opponent uses the
    same `step` API and same valid-action enumeration.
  - Cards with unknown DSL ops fall back to zero fingerprint but retain
    static features (cost / atk / hp / mechanic / class / rarity) — explicit.
  - PR sequence (PR-1 setup → PR-2 features → PR-3 env → PR-4 opponents →
    PR-5 wire training → PR-6 cleanup) keeps `main` green throughout. The
    old `HearthstoneEnv` continues to work in parallel until PR-6 deletes it.
  - `evaluate()` retains `max_actions_per_game=1000` cap from the existing
    implementation; cap-hit games count as non-wins.
  - `NUM_ACTIONS=512` upper bound is asserted at runtime by a
    property-style test exercising 20 games over the chosen deck pair.

### Changelog

- **rev 2 (2026-05-01)**: corrected (a) winner detection to use
  `Player.playstate`, (b) mulligan policy direction to match
  `MulliganChoice.choose(*cards_to_mulligan)`, (c) self-damage reward sign
  bug, (d) PR-1 contradiction by reordering the migration so deletion
  follows the new path going green; added `evaluate()` action cap, action
  bound property test, AGPL README section, scripts/train.py risk callout.
- **rev 3 (2026-05-01)**: corrected (a) Choose-One: cannot route through
  `_auto_resolve_choices` because fireplace raises on
  `card.play(choose=None)` with `must_choose_one`. Added
  `ChooseOnePolicy` (default `FirstChoiceOne`) applied at action
  enumeration; `play_targets` uses the chosen sub-card. Updated
  `enumerate_valid_actions`, `dispatch`, action-type docstring, config,
  and tests. (b) Observation feature bounds: switched slot Box from
  `(-1, 1)` to `(0, 1)`; encoder explicitly clips every numeric feature
  to that range; documented MAX divisors in feature tables; added
  per-scalar bounds dict so `observation_space.contains(obs)` actually
  validates. Added `test_card_features_in_unit_range` covering all of
  `cards.db`. (c) Migration consistency: opponents / opponent_env /
  reward all become NEW modules under `hearthstone/ai/env/` instead of
  rewrites of the old paths. The old modules sit untouched until PR-6
  deletes them atomically. PR-4 description and file layout updated
  accordingly. (d) `reset()` flow now uses `cards_to_mulligan(...)`,
  matching the policy interface introduced in rev 2.
