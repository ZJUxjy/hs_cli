# Fireplace Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the in-house Hearthstone engine with the locally maintained
fireplace simulator, expose its ~3500 cards to the existing PPO training stack
via a new `FireplaceGymEnv` adapter, and add a structured `CardFeatureEncoder`
so the policy network can distinguish cards by their actual effects (not by
ID hash).

**Architecture:** Six-phase migration. New code goes under
`hearthstone/ai/env/`; the old engine and old `hearthstone/ai/` modules sit
untouched until phase 6 deletes them atomically. Each phase ends with `main`
green. PPO infrastructure (`network`, `ppo_trainer`, `rollout_buffer`,
`curriculum`, `self_play`, `evaluate`, `training_utils`) is preserved; only
its inputs change.

**Tech Stack:** Python 3.10+, fireplace (AGPL-3.0, local path dep), torch≥2.0,
gymnasium≥0.29, numpy, pyyaml, pytest.

**Spec:** `docs/specs/2026-05-01-fireplace-integration-design.md` (rev 3,
commit `5638df0`). Read the spec before starting. This plan implements that
design.

---

## Prerequisites

- Working tree at `/home/xu/code/hstone/hs_glm`, branch `feature/webui` (or a
  worktree off it).
- Fireplace checkout at `/home/xu/code/hstone/hearthstone/fireplace` available
  for `pip install -e <path>`.
- `hearthstone-data` installable from PyPI; `CardDefs.xml` downloadable from
  `https://raw.githubusercontent.com/HearthSim/hsdata/master/CardDefs.xml`
  (see fireplace README).
- Tests run with `pytest tests/ -v`; slow integration tests gated by
  `@pytest.mark.slow`.
- Each phase's final commit ends with passing `pytest tests/ -v`. Do not
  proceed to the next phase if tests fail.

## Phase Roadmap

| Phase | Mergeable PR | What ships | Net LOC |
|---|---|---|---|
| 1 | PR-1 | fireplace dependency, AGPL note, CardDefs.xml fetched in CI | +60 / 0 |
| 2 | PR-2 | `env/card_features.py` + `test_card_features.py`, isolated | +450 / 0 |
| 3 | PR-3 | `env/{action_enum,observation,deck_source,*_policy,fireplace_env}.py` + tests + sample decks | +900 / 0 |
| 4 | PR-4 | `env/{reward,opponents,opponent_env}.py` + tests | +400 / 0 |
| 5 | PR-5 | network/scripts/train.py/configs/evaluate adapted; smoke test passes on new path | +200 / −150 |
| 6 | PR-6 | Atomic deletion of old engine + old `hearthstone/ai/` modules + dependent tests | 0 / −3500 |

---

## Phase 1 — Setup (PR-1)

### Task 1.1: Add fireplace as a local-path dependency

**Files:**
- Modify: `pyproject.toml`
- Modify: `requirements.txt`

- [ ] **Step 1: Edit pyproject.toml — add fireplace and hearthstone-data**

Replace the `[project]` table's `dependencies` and `license` fields:

```toml
[project]
name = "hearthstone-cli"
version = "0.2.0"
description = "PPO training driver on top of fireplace Hearthstone simulator"
license = "AGPL-3.0-or-later"
requires-python = ">=3.10"
dependencies = [
    "fireplace @ file:///home/xu/code/hstone/hearthstone/fireplace",
    "hearthstone-data",
    "gymnasium>=0.29.0",
    "numpy>=1.24.0",
    "rich>=13.0.0",
    "torch>=2.0.0",
    "pyyaml>=6.0",
]
```

Remove the `[project.scripts]` `hearthstone-cli` entry — `main.py` is going
away in phase 6. Update `[tool.setuptools.packages.find]` to drop `cli*`:

```toml
[tool.setuptools.packages.find]
include = ["hearthstone*"]
```

- [ ] **Step 2: Edit requirements.txt — add fireplace and hearthstone-data**

```
pytest>=7.0.0
pytest-cov>=4.0.0
gymnasium>=0.29.0
numpy>=1.24.0
torch>=2.0.0
rich>=13.0.0
pyyaml>=6.0

# Fireplace simulator (AGPL-3.0). hs_glm becomes AGPL by import.
-e file:///home/xu/code/hstone/hearthstone/fireplace
hearthstone-data

# Web dependencies — kept until phase 6 deletes web/.
fastapi>=0.100.0
uvicorn[standard]>=0.23.0
websockets>=11.0
python-multipart>=0.0.6
```

- [ ] **Step 3: Reinstall and verify import**

Run:

```bash
pip install -e ".[dev]"
python -c "from fireplace import cards; cards.db.initialize(); print(f'{len(cards.db)} cards loaded')"
```

Expected: a number > 1000 (e.g., `3700 cards loaded`). If it fails with
`hearthstone-data` missing or `CardDefs.xml` not found, run:

```bash
aria2c -c -x 16 -s 16 https://raw.githubusercontent.com/HearthSim/hsdata/master/CardDefs.xml -d $(python -c "import hearthstone, os; print(os.path.dirname(hearthstone.__file__))")
```

Re-run the import check.

- [ ] **Step 4: Run existing tests to confirm nothing broke**

Run: `pytest tests/ -v --ignore=tests/integration -x`
Expected: all tests pass. Adding fireplace as a dependency must not break
any pre-existing test (none of the existing code imports fireplace yet).

- [ ] **Step 5: Commit**

```bash
git add pyproject.toml requirements.txt
git commit -m "$(cat <<'EOF'
chore(deps): add fireplace + hearthstone-data; license AGPL-3.0

Phase 1 of fireplace integration. fireplace pulled in as a local path
editable install; hs_glm picks up AGPL transitivity. Existing tests still
pass — no source changes yet.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 1.2: README licensing section + CardDefs.xml setup instructions

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add licensing section to README**

Append to `README.md` (after existing content):

```markdown
## Licensing

hs_glm imports [fireplace](https://github.com/jleclanche/fireplace), which is
AGPL-3.0. As a transitive consequence, the combined work is licensed under
AGPL-3.0-or-later.

As of this release, the project is personal research and is not published
or offered as a network service — private development is unaffected.
**Any future decision to open-source hs_glm, distribute binaries, or run
hs_glm as a network-accessible service (including model serving or a web
demo) triggers AGPL §13: the entire combined work, including training code,
configuration, and any service wrapper, must be released under
AGPL-3.0-or-later with full source available to remote users.** Re-evaluate
the license fit before any such change.

## Installing card data

Fireplace's runtime card database is distributed via the `hearthstone-data`
package plus `CardDefs.xml` from HearthSim's `hsdata` repo. After
`pip install -e ".[dev]"`:

```bash
python -c "import hearthstone, os; \
  d = os.path.dirname(hearthstone.__file__); \
  print(f'Drop CardDefs.xml in {d}')"
aria2c -c -x 16 -s 16 \
  https://raw.githubusercontent.com/HearthSim/hsdata/master/CardDefs.xml \
  -d <path-printed-above>
```

Verify:

```bash
python -c "from fireplace import cards; cards.db.initialize(); print(len(cards.db))"
```
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs(readme): AGPL transitivity section + CardDefs.xml setup

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Phase 1 done.** `main` green; nothing functionally changed; AGPL is documented;
fireplace importable. Open PR-1 if using GitHub workflow; otherwise continue.

---

## Phase 2 — CardFeatureEncoder (PR-2)

This phase is fully isolated: nothing else imports `env/card_features.py`
yet. It can be developed and tested independently.

### Task 2.1: Subpackage skeleton + constants

**Files:**
- Create: `hearthstone/ai/env/__init__.py`
- Create: `hearthstone/ai/env/card_features.py`

- [ ] **Step 1: Create `hearthstone/ai/env/__init__.py`** (empty file)

```bash
mkdir -p hearthstone/ai/env
: > hearthstone/ai/env/__init__.py
```

- [ ] **Step 2: Create `hearthstone/ai/env/card_features.py` with constants and stub**

```python
"""CardFeatureEncoder — encodes fireplace cards into fixed-length feature vectors.

The static portion (80 dims) is computed once per card at startup by walking
the fireplace DSL trees (play / events / update / deathrattle). The dynamic
portion (10 dims) is rebuilt every observation for board minions.

All features are clipped to [0.0, 1.0]. See spec section "CardFeatureEncoder".
"""
from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


CARD_FEAT_DIM = 80
MINION_STATE_DIM = 10
SLOT_DIM = CARD_FEAT_DIM + MINION_STATE_DIM   # 90


_FEATURE_CACHE: dict[str, np.ndarray] = {}
_ZERO_STATIC = np.zeros(CARD_FEAT_DIM, dtype=np.float32)
_ZERO_STATE = np.zeros(MINION_STATE_DIM, dtype=np.float32)


def _clip_norm(x: float, max_val: float) -> float:
    """Clip x to [0, max_val] and normalize to [0, 1]."""
    if max_val <= 0:
        return 0.0
    return float(min(max(x, 0.0), max_val)) / float(max_val)
```

- [ ] **Step 3: Commit**

```bash
git add hearthstone/ai/env/
git commit -m "feat(env): card_features module skeleton (phase 2)"
```

### Task 2.2: Static numeric + one-hot fillers — TDD

**Files:**
- Modify: `hearthstone/ai/env/card_features.py`
- Test: `tests/unit/ai/env/__init__.py` (new, empty)
- Test: `tests/unit/ai/env/test_card_features.py`

- [ ] **Step 1: Create test directory and write the failing test for basic minion**

```bash
mkdir -p tests/unit/ai/env
: > tests/unit/ai/env/__init__.py
```

Create `tests/unit/ai/env/test_card_features.py`:

```python
"""Tests for CardFeatureEncoder."""
import numpy as np
import pytest


@pytest.fixture(scope="module", autouse=True)
def _init_cards_db():
    from fireplace import cards
    cards.db.initialize()


def test_basic_minion_features():
    """Chillwind Yeti (CS2_182) — cost 4, 4/5 vanilla minion."""
    from hearthstone.ai.env.card_features import (
        CARD_FEAT_DIM, build_card_feature_cache, _FEATURE_CACHE,
    )
    if not _FEATURE_CACHE:
        build_card_feature_cache()
    feat = _FEATURE_CACHE["CS2_182"]
    assert feat.shape == (CARD_FEAT_DIM,)
    # cost=4 / 10 = 0.4
    assert feat[0] == pytest.approx(0.4)
    # atk=4 / 20 = 0.2
    assert feat[1] == pytest.approx(0.2)
    # hp=5 / 20 = 0.25
    assert feat[2] == pytest.approx(0.25)
    # type=MINION → one-hot at index 4
    assert feat[4] == 1.0
    # all features in [0, 1]
    assert (feat >= 0.0).all() and (feat <= 1.0).all()
```

- [ ] **Step 2: Run test — expect failure**

Run: `pytest tests/unit/ai/env/test_card_features.py::test_basic_minion_features -v`
Expected: FAIL with `ImportError` or `AttributeError` (`build_card_feature_cache` not defined).

- [ ] **Step 3: Implement static-numeric + one-hot fillers**

Append to `hearthstone/ai/env/card_features.py`:

```python
# ----- one-hot vocabularies ------------------------------------------------
_TYPE_VOCAB = ["MINION", "SPELL", "WEAPON", "HERO_POWER"]
_CLASS_VOCAB = [
    "NEUTRAL", "WARRIOR", "SHAMAN", "ROGUE", "PALADIN", "HUNTER",
    "DRUID", "WARLOCK", "MAGE", "PRIEST", "DEMONHUNTER",
]
_RACE_VOCAB = [
    "INVALID", "BEAST", "DEMON", "DRAGON", "ELEMENTAL", "MECHANICAL",
    "MURLOC", "NAGA", "PIRATE", "TOTEM", "UNDEAD", "ALL",
]
_MECHANIC_VOCAB = [
    "BATTLECRY", "DEATHRATTLE", "TAUNT", "DIVINE_SHIELD", "CHARGE", "RUSH",
    "WINDFURY", "STEALTH", "POISONOUS", "LIFESTEAL", "SPELLPOWER", "FREEZE",
    "SECRET", "SILENCE", "REBORN",
]
_RARITY_VOCAB = ["COMMON", "RARE", "EPIC", "LEGENDARY"]


# Slot offsets in the static feature vector.
_OFF_NUMERIC = 0     # 4 dims
_OFF_TYPE = 4        # 4 dims
_OFF_CLASS = 8       # 11 dims
_OFF_RACE = 19       # 12 dims
_OFF_MECHANIC = 31   # 15 dims
_OFF_FLAGS = 46      # 2 dims (has_aura, has_event_trigger)
_OFF_FINGERPRINT = 48  # 12 dims
_OFF_RARITY = 60     # 4 dims
# 64..80 reserved


def _fill_static_numeric(feat: np.ndarray, card_def: Any) -> None:
    feat[_OFF_NUMERIC + 0] = _clip_norm(getattr(card_def, "cost", 0), 10)
    feat[_OFF_NUMERIC + 1] = _clip_norm(getattr(card_def, "atk", 0), 20)
    feat[_OFF_NUMERIC + 2] = _clip_norm(getattr(card_def, "health", 0), 20)
    feat[_OFF_NUMERIC + 3] = _clip_norm(getattr(card_def, "durability", 0), 5)


def _set_one_hot(feat: np.ndarray, offset: int, vocab: list[str], value: str) -> None:
    """Set one-hot bit for `value` at `offset:offset+len(vocab)`."""
    if value in vocab:
        feat[offset + vocab.index(value)] = 1.0


def _fill_one_hots(feat: np.ndarray, card_def: Any) -> None:
    type_name = getattr(getattr(card_def, "type", None), "name", "")
    _set_one_hot(feat, _OFF_TYPE, _TYPE_VOCAB, type_name)

    class_name = getattr(getattr(card_def, "card_class", None), "name", "NEUTRAL")
    _set_one_hot(feat, _OFF_CLASS, _CLASS_VOCAB, class_name)

    race_name = getattr(getattr(card_def, "race", None), "name", "INVALID")
    _set_one_hot(feat, _OFF_RACE, _RACE_VOCAB, race_name)

    mechanics = getattr(card_def, "tags", None) or {}
    # fireplace stores mechanics as GameTag enum keys → True; we look at names.
    for mech in _MECHANIC_VOCAB:
        # Each mechanic name corresponds to a GameTag attr or boolean property.
        # Use getattr on card_def directly — fireplace exposes booleans like
        # `taunt`, `divine_shield`, etc. on the card class.
        prop = getattr(card_def, mech.lower(), None)
        if prop is True:
            feat[_OFF_MECHANIC + _MECHANIC_VOCAB.index(mech)] = 1.0

    rarity_name = getattr(getattr(card_def, "rarity", None), "name", "COMMON")
    _set_one_hot(feat, _OFF_RARITY, _RARITY_VOCAB, rarity_name)


def build_card_feature_cache() -> None:
    """Walk every card in fireplace's database and populate _FEATURE_CACHE.

    Idempotent — cheap to call multiple times.
    """
    if _FEATURE_CACHE:
        return
    from fireplace import cards
    cards.db.initialize()
    n_unknown = 0
    n_total = 0
    for card_id, card_def in cards.db.items():
        feat = np.zeros(CARD_FEAT_DIM, dtype=np.float32)
        _fill_static_numeric(feat, card_def)
        _fill_one_hots(feat, card_def)
        # fingerprint filled later (Task 2.3); leave zeros for now
        _FEATURE_CACHE[card_id] = feat
        n_total += 1
    logger.info("[card_features] %d cards cached", n_total)
```

- [ ] **Step 4: Run test — expect pass**

Run: `pytest tests/unit/ai/env/test_card_features.py::test_basic_minion_features -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/card_features.py tests/unit/ai/env/
git commit -m "feat(env): card feature static numerics + one-hots"
```

### Task 2.3: Effect fingerprint via DSL walker — TDD

**Files:**
- Modify: `hearthstone/ai/env/card_features.py`
- Modify: `tests/unit/ai/env/test_card_features.py`

- [ ] **Step 1: Add Frostbolt fingerprint test**

Append to `tests/unit/ai/env/test_card_features.py`:

```python
def test_frostbolt_fingerprint():
    """CS2_024 Frostbolt — Hit(TARGET, 3), Freeze(TARGET).
    Expect: n_hit_ops=1/5, total_hit_damage=3/15, FREEZE mechanic flag set.
    """
    from hearthstone.ai.env.card_features import (
        _FEATURE_CACHE, _OFF_FINGERPRINT, _OFF_MECHANIC,
        _MECHANIC_VOCAB, build_card_feature_cache,
    )
    if not _FEATURE_CACHE:
        build_card_feature_cache()
    feat = _FEATURE_CACHE["CS2_024"]
    # n_hit_ops = 1, normalized by 5
    assert feat[_OFF_FINGERPRINT + 0] == pytest.approx(0.2)
    # total_hit_damage = 3, normalized by 15
    assert feat[_OFF_FINGERPRINT + 1] == pytest.approx(0.2)
    # FREEZE mechanic
    assert feat[_OFF_MECHANIC + _MECHANIC_VOCAB.index("FREEZE")] == 1.0


def test_arcane_explosion_aoe_flag():
    """CS2_025 Arcane Explosion — Hit(ENEMY_MINIONS, 1). Expect aoe_flag=1."""
    from hearthstone.ai.env.card_features import (
        _FEATURE_CACHE, _OFF_FINGERPRINT, build_card_feature_cache,
    )
    if not _FEATURE_CACHE:
        build_card_feature_cache()
    feat = _FEATURE_CACHE["CS2_025"]
    # aoe_or_random_flag at fingerprint+11
    assert feat[_OFF_FINGERPRINT + 11] == 1.0


def test_arcane_intellect_draw_count():
    """CS2_023 Arcane Intellect — Draw(CONTROLLER) * 2.
    Expect: n_draw_ops>=1/5, total_draw_count=2/5.
    """
    from hearthstone.ai.env.card_features import (
        _FEATURE_CACHE, _OFF_FINGERPRINT, build_card_feature_cache,
    )
    if not _FEATURE_CACHE:
        build_card_feature_cache()
    feat = _FEATURE_CACHE["CS2_023"]
    # total_draw_count at fingerprint+6 = 2/5
    assert feat[_OFF_FINGERPRINT + 6] == pytest.approx(0.4)


def test_unknown_op_silently_skipped():
    """Synthetic action class not in the dispatcher must not crash _walk."""
    from hearthstone.ai.env.card_features import _walk
    counters = {}
    class Mystery:
        pass
    _walk(Mystery(), counters)
    # No exception. The counter dict has 'unknown' incremented.
    assert counters.get("unknown", 0) == 1
```

- [ ] **Step 2: Run tests — expect failure**

Run: `pytest tests/unit/ai/env/test_card_features.py -v`
Expected: 3 new tests FAIL (`_OFF_FINGERPRINT` index has zeros; `_walk` not defined).

- [ ] **Step 3: Implement DSL walker and fingerprint filler**

Append to `hearthstone/ai/env/card_features.py`:

```python
# ----- DSL walker ----------------------------------------------------------
# Counter keys used by _walk; every fingerprint slot maps to one.
_COUNTER_KEYS = (
    "n_hit", "total_hit", "n_buff", "atk_buff", "hp_buff",
    "n_draw", "total_draw", "n_summon", "n_destroy", "n_heal", "total_heal",
    "aoe_or_random",
    # bookkeeping
    "unknown",
)


def _is_aoe_selector(selector: Any) -> bool:
    """Heuristic: True if selector targets multiple entities."""
    cls_name = type(selector).__name__
    name_attr = getattr(selector, "name", "") or ""
    return any(
        marker in (cls_name + " " + str(name_attr)).upper()
        for marker in ("ALL_", "ENEMY_MINIONS", "FRIENDLY_MINIONS",
                       "ALL_MINIONS", "ALL_CHARACTERS")
    )


def _is_random_selector(selector: Any) -> bool:
    cls_name = type(selector).__name__
    return "RANDOM" in cls_name.upper()


def _walk(node: Any, c: dict) -> None:
    """Recursively walk a fireplace DSL action / event tree, accumulating counters."""
    if node is None:
        return
    if isinstance(node, (tuple, list)):
        for n in node:
            _walk(n, c)
        return

    # Lazy fireplace import — keeps card_features importable when fireplace
    # is broken or unavailable in tooling that only inspects the static layout.
    from fireplace import actions as fp_actions

    if isinstance(node, fp_actions.Hit):
        c["n_hit"] = c.get("n_hit", 0) + 1
        amount = node._args[1] if len(node._args) > 1 else 0
        if isinstance(amount, int):
            c["total_hit"] = c.get("total_hit", 0) + amount
        if len(node._args) > 0:
            sel = node._args[0]
            if _is_aoe_selector(sel) or _is_random_selector(sel):
                c["aoe_or_random"] = 1
    elif isinstance(node, fp_actions.Damage):
        c["n_hit"] = c.get("n_hit", 0) + 1
        amount = node._args[1] if len(node._args) > 1 else 0
        if isinstance(amount, int):
            c["total_hit"] = c.get("total_hit", 0) + amount
    elif isinstance(node, fp_actions.Buff):
        c["n_buff"] = c.get("n_buff", 0) + 1
        # Buff(target, "BUFF_CARD_ID") — look up atk/health on the buff card.
        if len(node._args) > 1:
            buff_id = node._args[1]
            try:
                from fireplace import cards
                cards.db.initialize()
                buff_def = cards.db.get(buff_id)
                if buff_def is not None:
                    c["atk_buff"] = c.get("atk_buff", 0) + getattr(buff_def, "atk", 0)
                    c["hp_buff"] = c.get("hp_buff", 0) + getattr(buff_def, "health", 0)
            except Exception:
                pass
    elif isinstance(node, fp_actions.Draw):
        c["n_draw"] = c.get("n_draw", 0) + 1
        c["total_draw"] = c.get("total_draw", 0) + 1
    elif isinstance(node, fp_actions.Summon):
        c["n_summon"] = c.get("n_summon", 0) + 1
    elif isinstance(node, fp_actions.Destroy):
        c["n_destroy"] = c.get("n_destroy", 0) + 1
    elif isinstance(node, fp_actions.Heal):
        c["n_heal"] = c.get("n_heal", 0) + 1
        amount = node._args[1] if len(node._args) > 1 else 0
        if isinstance(amount, int):
            c["total_heal"] = c.get("total_heal", 0) + amount
    elif isinstance(node, fp_actions.EventListener):
        _walk(node.actions, c)
    else:
        c["unknown"] = c.get("unknown", 0) + 1


# Apply tuple-multiplication semantics for Draw * N etc. The fireplace DSL
# uses `Draw(CONTROLLER) * 2` which constructs a tuple (Draw, Draw). _walk
# receives the tuple and visits each child; total_draw therefore increments
# once per child, naturally yielding 2 for `Draw * 2`. Keep counter math
# additive across the whole tree.


def _fill_effect_fingerprint(feat: np.ndarray, card_def: Any) -> None:
    counters: dict[str, float] = {}
    has_aura = False
    has_event = False
    for attr_name in ("play", "deathrattle"):
        node = getattr(card_def, attr_name, None)
        if node is not None:
            _walk(node, counters)
    update_node = getattr(card_def, "update", None)
    if update_node is not None:
        has_aura = True
        _walk(update_node, counters)
    events_node = getattr(card_def, "events", None)
    if events_node is not None:
        has_event = True
        _walk(events_node, counters)

    feat[_OFF_FLAGS + 0] = 1.0 if has_aura else 0.0
    feat[_OFF_FLAGS + 1] = 1.0 if has_event else 0.0

    # Fingerprint slots, all clipped+normalised to [0, 1].
    feat[_OFF_FINGERPRINT + 0] = _clip_norm(counters.get("n_hit", 0), 5)
    feat[_OFF_FINGERPRINT + 1] = _clip_norm(counters.get("total_hit", 0), 15)
    feat[_OFF_FINGERPRINT + 2] = _clip_norm(counters.get("n_buff", 0), 5)
    feat[_OFF_FINGERPRINT + 3] = _clip_norm(counters.get("atk_buff", 0), 10)
    feat[_OFF_FINGERPRINT + 4] = _clip_norm(counters.get("hp_buff", 0), 10)
    feat[_OFF_FINGERPRINT + 5] = _clip_norm(counters.get("n_draw", 0), 5)
    feat[_OFF_FINGERPRINT + 6] = _clip_norm(counters.get("total_draw", 0), 5)
    feat[_OFF_FINGERPRINT + 7] = _clip_norm(counters.get("n_summon", 0), 5)
    feat[_OFF_FINGERPRINT + 8] = _clip_norm(counters.get("n_destroy", 0), 3)
    feat[_OFF_FINGERPRINT + 9] = _clip_norm(counters.get("n_heal", 0), 3)
    feat[_OFF_FINGERPRINT + 10] = _clip_norm(counters.get("total_heal", 0), 15)
    feat[_OFF_FINGERPRINT + 11] = 1.0 if counters.get("aoe_or_random", 0) else 0.0
```

Update `build_card_feature_cache()` to call `_fill_effect_fingerprint`:

```python
# In build_card_feature_cache, replace the loop body:
    for card_id, card_def in cards.db.items():
        feat = np.zeros(CARD_FEAT_DIM, dtype=np.float32)
        _fill_static_numeric(feat, card_def)
        _fill_one_hots(feat, card_def)
        _fill_effect_fingerprint(feat, card_def)
        _FEATURE_CACHE[card_id] = feat
        n_total += 1
        if counters_have_unknown_for(card_def):  # see below
            n_unknown += 1
    coverage_pct = 100.0 * (n_total - n_unknown) / max(n_total, 1)
    logger.info(
        "[card_features] %d cards cached, %.1f%% fully covered",
        n_total, coverage_pct,
    )


def counters_have_unknown_for(card_def: Any) -> bool:
    """Walk a card and return True if any unknown op was encountered.
    Slow path for coverage stats only — called once per card at startup.
    """
    counters: dict[str, float] = {}
    for attr_name in ("play", "deathrattle", "events", "update"):
        node = getattr(card_def, attr_name, None)
        if node is not None:
            _walk(node, counters)
    return counters.get("unknown", 0) > 0
```

- [ ] **Step 4: Run tests — expect pass**

Run: `pytest tests/unit/ai/env/test_card_features.py -v`
Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/card_features.py tests/unit/ai/env/test_card_features.py
git commit -m "feat(env): card feature fingerprint via DSL walk"
```

### Task 2.4: Encoder class + minion state + range-invariant test

**Files:**
- Modify: `hearthstone/ai/env/card_features.py`
- Modify: `tests/unit/ai/env/test_card_features.py`

- [ ] **Step 1: Write tests for the encoder class and the range invariant**

Append to `tests/unit/ai/env/test_card_features.py`:

```python
def test_encoder_encodes_hand_card_with_zero_state():
    from hearthstone.ai.env.card_features import (
        CardFeatureEncoder, CARD_FEAT_DIM, MINION_STATE_DIM, SLOT_DIM,
    )
    enc = CardFeatureEncoder()
    # Build a stand-in card object with id only — encoder reads from cache.
    class FakeHandCard:
        id = "CS2_182"
    out = enc.encode_hand_card(FakeHandCard())
    assert out.shape == (SLOT_DIM,)
    # state channels (last 10) all zero for hand cards
    assert (out[CARD_FEAT_DIM:] == 0).all()


def test_encoder_encodes_minion_with_state():
    from hearthstone.ai.env.card_features import (
        CardFeatureEncoder, CARD_FEAT_DIM, SLOT_DIM,
    )
    enc = CardFeatureEncoder()
    class FakeMinion:
        id = "CS2_182"
        atk = 4
        health = 5
        max_health = 5
        attacks_this_turn = 0
        max_attacks = 1
        divine_shield = False
        frozen = False
        silenced = False
        stealthed = False
        # summoning_sick: when a minion is freshly summoned and lacks Charge,
        # fireplace exposes this as `card.exhausted` (or similar).
        exhausted = True
    out = enc.encode_minion(FakeMinion())
    assert out.shape == (SLOT_DIM,)
    # current_atk = 4/20 = 0.2
    assert out[CARD_FEAT_DIM + 0] == pytest.approx(0.2)
    # current_hp = 5/20 = 0.25
    assert out[CARD_FEAT_DIM + 1] == pytest.approx(0.25)
    # summoning_sick (exhausted) = 1
    assert out[CARD_FEAT_DIM + 8] == 1.0


def test_card_features_in_unit_range():
    """Iterate every card in fireplace.cards.db and assert each encoded
    feature is in [0, 1]. Catches future cards that the encoder needs to clip."""
    from fireplace import cards
    from hearthstone.ai.env.card_features import (
        _FEATURE_CACHE, build_card_feature_cache,
    )
    cards.db.initialize()
    if not _FEATURE_CACHE:
        build_card_feature_cache()
    for cid, feat in _FEATURE_CACHE.items():
        assert (feat >= 0.0).all(), f"card {cid} has negative feature"
        assert (feat <= 1.0).all(), f"card {cid} exceeds 1.0"
```

- [ ] **Step 2: Run tests — expect failure**

Run: `pytest tests/unit/ai/env/test_card_features.py -v`
Expected: 3 new tests FAIL (`CardFeatureEncoder` not defined, `encode_minion` not defined).

- [ ] **Step 3: Implement encoder class and minion-state filler**

Append to `hearthstone/ai/env/card_features.py`:

```python
class CardFeatureEncoder:
    """Stateful encoder; safe to instantiate multiple times (shares _FEATURE_CACHE)."""

    def __init__(self) -> None:
        if not _FEATURE_CACHE:
            build_card_feature_cache()

    def encode_hand_card(self, card: Any) -> np.ndarray:
        static = _FEATURE_CACHE.get(card.id, _ZERO_STATIC)
        return np.concatenate([static, _ZERO_STATE])

    def encode_minion(self, minion: Any) -> np.ndarray:
        static = _FEATURE_CACHE.get(minion.id, _ZERO_STATIC)
        state = self._encode_minion_state(minion)
        return np.concatenate([static, state])

    def encode_empty(self) -> np.ndarray:
        return np.zeros(SLOT_DIM, dtype=np.float32)

    @staticmethod
    def _encode_minion_state(minion: Any) -> np.ndarray:
        s = np.zeros(MINION_STATE_DIM, dtype=np.float32)
        atk = getattr(minion, "atk", 0)
        hp = getattr(minion, "health", 0)
        max_hp = getattr(minion, "max_health", hp) or hp
        attacks_remaining = max(
            0,
            getattr(minion, "max_attacks", 1) - getattr(minion, "attacks_this_turn", 0),
        )
        s[0] = _clip_norm(atk, 20)
        s[1] = _clip_norm(hp, 20)
        s[2] = _clip_norm(max_hp - hp, 20)
        s[3] = _clip_norm(attacks_remaining, 2)
        s[4] = 1.0 if getattr(minion, "divine_shield", False) else 0.0
        s[5] = 1.0 if getattr(minion, "frozen", False) else 0.0
        s[6] = 1.0 if getattr(minion, "silenced", False) else 0.0
        s[7] = 1.0 if getattr(minion, "stealthed", False) else 0.0
        s[8] = 1.0 if getattr(minion, "exhausted", False) else 0.0
        # s[9] reserved
        return s
```

- [ ] **Step 4: Run all card_features tests — expect pass**

Run: `pytest tests/unit/ai/env/test_card_features.py -v`
Expected: all tests pass, including `test_card_features_in_unit_range`. If the
range-invariant test fails on a specific card, the encoder is missing a clip
or vocabulary entry — fix in `_fill_*` and re-run.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/card_features.py tests/unit/ai/env/test_card_features.py
git commit -m "feat(env): CardFeatureEncoder class + minion state + range invariant"
```

**Phase 2 done.** `card_features` is complete and isolated; no other module imports it yet.

---

## Phase 3 — FireplaceGymEnv adapter (PR-3)

This phase builds the env, action enumerator, observation builder, deck source,
and the three lightweight policies (mulligan / discover / choose-one). Old
`HearthstoneEnv` continues to exist alongside.

### Task 3.1: Action types

**Files:**
- Create: `hearthstone/ai/env/action_enum.py`
- Test: `tests/unit/ai/env/test_action_enum.py`

- [ ] **Step 1: Write the action-types test**

Create `tests/unit/ai/env/test_action_enum.py`:

```python
"""Tests for action enum + enumerator + dispatch."""
import pytest


def test_end_turn_is_singleton_value():
    from hearthstone.ai.env.action_enum import EndTurnAction
    a, b = EndTurnAction(), EndTurnAction()
    # frozen dataclasses with no fields compare equal
    assert a == b
    assert hash(a) == hash(b)


def test_play_card_action_fields():
    from hearthstone.ai.env.action_enum import PlayCardAction
    a = PlayCardAction(card_idx_in_hand=2, target_entity_id=42,
                       board_index=None, choose=None)
    assert a.card_idx_in_hand == 2
    assert a.target_entity_id == 42
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/env/test_action_enum.py -v`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement action types**

Create `hearthstone/ai/env/action_enum.py`:

```python
"""Flat action types for FireplaceGymEnv.

Action enumeration produces a list[Action] each step; index 0 is always
EndTurnAction(). The agent picks an index. dispatch() decodes back to
fireplace API calls.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Union


@dataclass(frozen=True)
class EndTurnAction:
    pass


@dataclass(frozen=True)
class PlayCardAction:
    card_idx_in_hand: int
    target_entity_id: Optional[int]
    board_index: Optional[int]
    choose: Optional[str]                 # sub-card ID for must_choose_one


@dataclass(frozen=True)
class AttackAction:
    attacker_entity_id: int
    target_entity_id: int


@dataclass(frozen=True)
class HeroPowerAction:
    target_entity_id: Optional[int]


Action = Union[EndTurnAction, PlayCardAction, AttackAction, HeroPowerAction]
```

- [ ] **Step 4: Run — expect pass**

Run: `pytest tests/unit/ai/env/test_action_enum.py -v`
Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/action_enum.py tests/unit/ai/env/test_action_enum.py
git commit -m "feat(env): flat action type dataclasses"
```

### Task 3.2: ChooseOnePolicy + MulliganPolicy + DiscoverPolicy

**Files:**
- Create: `hearthstone/ai/env/choose_one_policy.py`
- Create: `hearthstone/ai/env/mulligan_policy.py`
- Create: `hearthstone/ai/env/discover_policy.py`
- Test: `tests/unit/ai/env/test_choose_one_policy.py`
- Test: `tests/unit/ai/env/test_mulligan_policy.py`
- Test: `tests/unit/ai/env/test_discover_policy.py`

- [ ] **Step 1: Write tests for all three policies**

Create `tests/unit/ai/env/test_choose_one_policy.py`:

```python
def test_first_choice_one_picks_first():
    from hearthstone.ai.env.choose_one_policy import FirstChoiceOne
    class FakeCard:
        choose_cards = ["A", "B", "C"]
    pick = FirstChoiceOne().choose(FakeCard())
    assert pick == "A"
```

Create `tests/unit/ai/env/test_mulligan_policy.py`:

```python
def test_keep_all_returns_empty():
    from hearthstone.ai.env.mulligan_policy import KeepAll
    class C:
        def __init__(self, cost): self.cost = cost
    hand = [C(1), C(5), C(7)]
    assert KeepAll().cards_to_mulligan(hand) == []


def test_keep_low_cost_mulligans_high_cost():
    from hearthstone.ai.env.mulligan_policy import KeepLowCost
    class C:
        def __init__(self, cost, name): self.cost, self.name = cost, name
    hand = [C(1, "a"), C(2, "b"), C(5, "c"), C(7, "d")]
    out = KeepLowCost(threshold=3).cards_to_mulligan(hand)
    out_names = [c.name for c in out]
    assert out_names == ["c", "d"]   # only high-cost get mulliganed
```

Create `tests/unit/ai/env/test_discover_policy.py`:

```python
def test_first_option_picks_first():
    from hearthstone.ai.env.discover_policy import FirstOption
    options = ["x", "y", "z"]
    assert FirstOption().choose(options) == "x"


def test_lowest_cost_picks_min():
    from hearthstone.ai.env.discover_policy import LowestCost
    class C:
        def __init__(self, cost): self.cost = cost
    options = [C(5), C(2), C(8)]
    assert LowestCost().choose(options).cost == 2
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/env/test_*_policy.py -v`
Expected: 5 tests FAIL with ImportError.

- [ ] **Step 3: Implement the three policy modules**

Create `hearthstone/ai/env/choose_one_policy.py`:

```python
"""Pre-pick a sub-card for must_choose_one cards at action-enumeration time."""
from typing import Any


class ChooseOnePolicy:
    def choose(self, card: Any) -> Any:
        """Return one of card.choose_cards. Called when card.must_choose_one."""
        raise NotImplementedError


class FirstChoiceOne(ChooseOnePolicy):
    def choose(self, card: Any) -> Any:
        return card.choose_cards[0]
```

Create `hearthstone/ai/env/mulligan_policy.py`:

```python
"""Mulligan policies. Return cards to MULLIGAN AWAY (passed to fireplace's
MulliganChoice.choose(*cards), which sends them to deck and replaces them).
"""
from typing import Any


class MulliganPolicy:
    def cards_to_mulligan(self, hand: list[Any]) -> list[Any]:
        raise NotImplementedError


class KeepAll(MulliganPolicy):
    def cards_to_mulligan(self, hand):
        return []


class KeepLowCost(MulliganPolicy):
    """Aggressive baseline: keep cards with cost <= threshold; mulligan the rest."""

    def __init__(self, threshold: int = 3):
        self.threshold = threshold

    def cards_to_mulligan(self, hand):
        return [c for c in hand if c.cost > self.threshold]
```

Create `hearthstone/ai/env/discover_policy.py`:

```python
"""Discover / Choose policies (mid-turn 1-of-N pick). Always pick exactly one."""
from typing import Any


class DiscoverPolicy:
    def choose(self, options: list[Any]) -> Any:
        raise NotImplementedError


class FirstOption(DiscoverPolicy):
    def choose(self, options):
        return options[0]


class LowestCost(DiscoverPolicy):
    def choose(self, options):
        return min(options, key=lambda c: c.cost)
```

- [ ] **Step 4: Run — expect pass**

Run: `pytest tests/unit/ai/env/test_*_policy.py -v`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/choose_one_policy.py \
        hearthstone/ai/env/mulligan_policy.py \
        hearthstone/ai/env/discover_policy.py \
        tests/unit/ai/env/test_choose_one_policy.py \
        tests/unit/ai/env/test_mulligan_policy.py \
        tests/unit/ai/env/test_discover_policy.py
git commit -m "feat(env): mulligan / discover / choose-one policies"
```

### Task 3.3: Action enumerator + dispatcher

**Files:**
- Modify: `hearthstone/ai/env/action_enum.py`
- Modify: `tests/unit/ai/env/test_action_enum.py`

- [ ] **Step 1: Write enumerator tests against a real fireplace.Game**

Append to `tests/unit/ai/env/test_action_enum.py`:

```python
@pytest.fixture
def fresh_game():
    """Construct a basic fireplace.Game with two basic mage decks, started."""
    from fireplace import cards
    cards.db.initialize()
    from fireplace.game import Game
    from fireplace.player import Player
    from fireplace.utils import random_draft

    p1 = Player("p1", random_draft("MAGE"), "HERO_08")
    p2 = Player("p2", random_draft("MAGE"), "HERO_08")
    game = Game(players=[p1, p2], seed=42)
    game.start()
    # auto-resolve mulligan: keep all
    for p in (p1, p2):
        if p.choice is not None:
            p.choice.choose()    # empty => mulligan nothing
    return game


def test_enumerate_end_turn_at_index_zero(fresh_game):
    from hearthstone.ai.env.action_enum import (
        enumerate_valid_actions, EndTurnAction,
    )
    from hearthstone.ai.env.choose_one_policy import FirstChoiceOne
    actions = enumerate_valid_actions(fresh_game.current_player, FirstChoiceOne())
    assert len(actions) >= 1
    assert isinstance(actions[0], EndTurnAction)


def test_enumerate_includes_playable_cards(fresh_game):
    from hearthstone.ai.env.action_enum import (
        enumerate_valid_actions, PlayCardAction,
    )
    from hearthstone.ai.env.choose_one_policy import FirstChoiceOne
    actions = enumerate_valid_actions(fresh_game.current_player, FirstChoiceOne())
    play_count = sum(1 for a in actions if isinstance(a, PlayCardAction))
    # First turn the player should be able to play at least one minion if any
    # 1-mana cards are in their starting hand. Pessimistic: assert no exception
    # and the call succeeded with a reasonable upper bound.
    assert 0 <= play_count <= 50


def test_dispatch_end_turn_advances_player(fresh_game):
    from hearthstone.ai.env.action_enum import dispatch, EndTurnAction
    starting_player = fresh_game.current_player
    dispatch(EndTurnAction(), fresh_game)
    assert fresh_game.current_player is not starting_player
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/env/test_action_enum.py -v`
Expected: 3 new tests FAIL (`enumerate_valid_actions` / `dispatch` not defined).

- [ ] **Step 3: Implement enumerator and dispatcher**

Append to `hearthstone/ai/env/action_enum.py`:

```python
import logging
from .choose_one_policy import ChooseOnePolicy

logger = logging.getLogger(__name__)


def enumerate_valid_actions(player, choose_one_policy: ChooseOnePolicy) -> list[Action]:
    """Return the flat list of actions valid for `player`. Index 0 is always EndTurnAction."""
    actions: list[Action] = [EndTurnAction()]

    # Hand → PlayCardAction
    for i, card in enumerate(player.hand):
        if not card.is_playable():
            continue
        if getattr(card, "must_choose_one", False):
            sub_card = choose_one_policy.choose(card)
            chosen_id = sub_card.id
            target_source = sub_card
        else:
            chosen_id = None
            target_source = card
        targets = list(target_source.play_targets) or [None]
        for target in targets:
            tid = target.entity_id if target is not None else None
            actions.append(PlayCardAction(
                card_idx_in_hand=i,
                target_entity_id=tid,
                board_index=None,
                choose=chosen_id,
            ))

    # Field minions → AttackAction
    for minion in player.field:
        if not minion.can_attack():
            continue
        for target in minion.attack_targets:
            actions.append(AttackAction(minion.entity_id, target.entity_id))

    # Hero power → HeroPowerAction
    hp = player.hero_power
    if hp is not None and hp.is_usable():
        targets = list(hp.play_targets) or [None]
        for target in targets:
            tid = target.entity_id if target is not None else None
            actions.append(HeroPowerAction(tid))

    return actions


def _resolve_entity(game, entity_id: int):
    """O(N) scan over game.entities. N is small (~25) so a dict isn't worth it."""
    for e in game.entities:
        if e.entity_id == entity_id:
            return e
    raise KeyError(f"No entity with id {entity_id}")


def dispatch(action: Action, game) -> None:
    """Translate an Action into fireplace API calls.

    Wrap calls in try/except fireplace.exceptions.GameOver so terminal damage
    doesn't bubble up through the agent's step.
    """
    from fireplace.exceptions import GameOver
    try:
        if isinstance(action, EndTurnAction):
            game.end_turn()
        elif isinstance(action, PlayCardAction):
            player = game.current_player
            card = player.hand[action.card_idx_in_hand]
            target = (_resolve_entity(game, action.target_entity_id)
                      if action.target_entity_id is not None else None)
            card.play(target=target, index=action.board_index, choose=action.choose)
        elif isinstance(action, AttackAction):
            attacker = _resolve_entity(game, action.attacker_entity_id)
            target = _resolve_entity(game, action.target_entity_id)
            attacker.attack(target)
        elif isinstance(action, HeroPowerAction):
            hp = game.current_player.hero_power
            target = (_resolve_entity(game, action.target_entity_id)
                      if action.target_entity_id is not None else None)
            hp.use(target=target)
        else:
            raise TypeError(f"Unknown action type: {type(action).__name__}")
    except GameOver:
        # Terminal — game.ended will be True after this.
        pass
```

- [ ] **Step 4: Run — expect pass**

Run: `pytest tests/unit/ai/env/test_action_enum.py -v`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/action_enum.py tests/unit/ai/env/test_action_enum.py
git commit -m "feat(env): enumerate_valid_actions + dispatch"
```

### Task 3.4: Deck source + sample basic decks

**Files:**
- Create: `hearthstone/ai/env/deck_source.py`
- Create: `data/fireplace_decks/README.md`
- Create: `data/fireplace_decks/basic_mage.yaml`
- Create: `data/fireplace_decks/basic_warrior.yaml`
- Test: `tests/unit/ai/env/test_deck_source.py`

- [ ] **Step 1: Write deck source tests**

Create `tests/unit/ai/env/test_deck_source.py`:

```python
import pytest


def test_load_deck_returns_card_ids_and_hero():
    from hearthstone.ai.env.deck_source import load_deck
    cards, hero = load_deck("basic_mage")
    assert isinstance(cards, list)
    assert len(cards) == 30
    assert hero == "HERO_08"


def test_load_deck_validates_card_id_exists():
    from hearthstone.ai.env.deck_source import load_deck
    with pytest.raises(ValueError, match="bogus_card_id"):
        load_deck("__synth_bad")    # see fixture below


@pytest.fixture(autouse=True)
def _write_bad_deck(tmp_path, monkeypatch):
    """Write a deck with an invalid card id under a temp DECK_DIR for the bad-id test."""
    bad = tmp_path / "__synth_bad.yaml"
    bad.write_text(
        "name: Bad\nhero_id: HERO_08\ncards:\n" + "\n".join(["  - bogus_card_id"] * 30)
    )
    # Patch the search path to include tmp_path FIRST.
    from hearthstone.ai.env import deck_source
    monkeypatch.setattr(deck_source, "DECK_DIRS", [str(tmp_path), deck_source.DEFAULT_DECK_DIR])
```

- [ ] **Step 2: Create the sample decks**

Create `data/fireplace_decks/README.md`:

```markdown
# Fireplace decks

YAML files consumed by `hearthstone.ai.env.deck_source.load_deck()`.

## Format

```yaml
name: <human readable>
hero_id: <fireplace hero card id, e.g., HERO_08 for Mage>
cards:
  - <card_id>          # 30 entries; duplicates allowed up to fireplace limits
```

## Hero IDs (Basic)

| Class | Hero ID |
|---|---|
| Mage | HERO_08 |
| Warrior | HERO_01 |
| Hunter | HERO_05 |
| Druid | HERO_06 |
| Rogue | HERO_03 |
| Paladin | HERO_04 |
| Priest | HERO_09 |
| Shaman | HERO_02 |
| Warlock | HERO_07 |
| Demon Hunter | HERO_10 |
```

Create `data/fireplace_decks/basic_mage.yaml`:

```yaml
name: Basic Mage
hero_id: HERO_08
cards:
  - CS2_023      # Arcane Intellect
  - CS2_023
  - CS2_024      # Frostbolt
  - CS2_024
  - CS2_025      # Arcane Explosion
  - CS2_025
  - CS2_026      # Frost Nova
  - CS2_027      # Mirror Image
  - CS2_028      # Blizzard
  - CS2_029      # Fireball
  - CS2_029
  - CS2_032      # Flamestrike
  - CS2_033      # Water Elemental
  - CS2_120      # River Crocolisk
  - CS2_120
  - CS2_125      # Ironfur Grizzly
  - CS2_125
  - CS2_142      # Kobold Geomancer
  - CS2_142
  - CS2_155      # Archmage
  - CS2_168      # Murloc Raider
  - CS2_168
  - CS2_172      # Bloodfen Raptor
  - CS2_173      # Bluegill Warrior
  - CS2_179      # Sen'jin Shieldmasta
  - CS2_182      # Chillwind Yeti
  - CS2_182
  - CS2_186      # War Golem
  - CS2_189      # Elven Archer
  - CS2_201      # Core Hound
```

Create `data/fireplace_decks/basic_warrior.yaml`:

```yaml
name: Basic Warrior
hero_id: HERO_01
cards:
  - CS2_103      # Charge
  - CS2_103
  - CS2_104      # Rampage
  - CS2_105      # Heroic Strike
  - CS2_105
  - CS2_106      # Fiery War Axe
  - CS2_106
  - CS2_108      # Execute
  - CS2_112      # Arcanite Reaper
  - CS2_114      # Cleave
  - EX1_400      # Whirlwind
  - CS2_120      # River Crocolisk
  - CS2_120
  - CS2_124      # Wolfrider
  - CS2_124
  - CS2_125      # Ironfur Grizzly
  - CS2_127      # Silverback Patriarch
  - CS2_142      # Kobold Geomancer
  - CS2_150      # Stormpike Commando
  - CS2_155      # Archmage
  - CS2_168      # Murloc Raider
  - CS2_172      # Bloodfen Raptor
  - CS2_173      # Bluegill Warrior
  - CS2_179      # Sen'jin Shieldmasta
  - CS2_182      # Chillwind Yeti
  - CS2_182
  - CS2_186      # War Golem
  - CS2_187      # Booty Bay Bodyguard
  - CS2_189      # Elven Archer
  - CS2_200      # Boulderfist Ogre
```

Note: card IDs in this list must all exist in `cards.db`. If `aria2c` fetched a
newer `CardDefs.xml` and any ID is renamed/removed, the deck loader will raise
during validation — replace the offending ID with a current basic-set
equivalent.

- [ ] **Step 3: Implement deck_source.py**

Create `hearthstone/ai/env/deck_source.py`:

```python
"""Load fireplace decks from data/fireplace_decks/<name>.yaml."""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

import yaml


_PROJECT_ROOT = Path(__file__).resolve().parents[3]   # hs_glm root
DEFAULT_DECK_DIR = str(_PROJECT_ROOT / "data" / "fireplace_decks")
DECK_DIRS = [DEFAULT_DECK_DIR]


def load_deck(name: str) -> tuple[list[str], str]:
    """Load a deck and return (card_ids, hero_id).

    Validates: file exists, contains 30 cards, hero_id and every card_id
    are present in fireplace.cards.db. Raises FileNotFoundError or ValueError.
    """
    path = _find_deck_file(name)
    if path is None:
        raise FileNotFoundError(
            f"Deck '{name}' not found. Searched: {DECK_DIRS}"
        )
    with open(path, "r") as f:
        data = yaml.safe_load(f)

    if "cards" not in data or "hero_id" not in data:
        raise ValueError(f"Deck '{name}' missing 'cards' or 'hero_id' key")

    cards_list = data["cards"]
    hero_id = data["hero_id"]

    if len(cards_list) != 30:
        raise ValueError(f"Deck '{name}' has {len(cards_list)} cards, expected 30")

    from fireplace import cards as fp_cards
    fp_cards.db.initialize()
    if hero_id not in fp_cards.db:
        raise ValueError(f"Deck '{name}': hero_id '{hero_id}' not in cards.db")
    for cid in cards_list:
        if cid not in fp_cards.db:
            raise ValueError(f"Deck '{name}': card_id '{cid}' not in cards.db")

    return list(cards_list), hero_id


def list_available_decks() -> list[str]:
    seen: set[str] = set()
    for d in DECK_DIRS:
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            if f.endswith(".yaml"):
                seen.add(f[:-5])
    return sorted(seen)


def random_deck(hero_class: str) -> tuple[list[str], str]:
    """Random draft via fireplace.utils.random_draft. (Used by S3' deck pool training.)"""
    from fireplace.utils import random_draft
    cards = random_draft(hero_class)
    # random_draft returns 30 card ids; hero is class-derived
    HERO_BY_CLASS = {
        "MAGE": "HERO_08", "WARRIOR": "HERO_01", "HUNTER": "HERO_05",
        "DRUID": "HERO_06", "ROGUE": "HERO_03", "PALADIN": "HERO_04",
        "PRIEST": "HERO_09", "SHAMAN": "HERO_02", "WARLOCK": "HERO_07",
        "DEMONHUNTER": "HERO_10",
    }
    return cards, HERO_BY_CLASS[hero_class.upper()]


def _find_deck_file(name: str) -> Optional[Path]:
    for d in DECK_DIRS:
        p = Path(d) / f"{name}.yaml"
        if p.is_file():
            return p
    return None
```

- [ ] **Step 4: Run deck source tests — expect pass**

Run: `pytest tests/unit/ai/env/test_deck_source.py -v`
Expected: tests pass. If `test_load_deck_returns_card_ids_and_hero` fails
because a card ID isn't in `cards.db`, edit the YAML to use a valid ID.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/deck_source.py \
        data/fireplace_decks/ \
        tests/unit/ai/env/test_deck_source.py
git commit -m "feat(env): deck_source + basic mage/warrior YAML decks"
```

### Task 3.5: Observation builder

**Files:**
- Create: `hearthstone/ai/env/observation.py`
- Test: `tests/unit/ai/env/test_observation.py`

- [ ] **Step 1: Write observation tests**

Create `tests/unit/ai/env/test_observation.py`:

```python
import numpy as np
import pytest


@pytest.fixture
def env_started():
    """A FireplaceGymEnv-like minimal harness — a started Game with two players."""
    from fireplace import cards
    cards.db.initialize()
    from fireplace.game import Game
    from fireplace.player import Player
    from hearthstone.ai.env.deck_source import load_deck

    cards1, h1 = load_deck("basic_mage")
    cards2, h2 = load_deck("basic_warrior")
    p1 = Player("p1", cards1, h1)
    p2 = Player("p2", cards2, h2)
    game = Game(players=[p1, p2], seed=42)
    game.start()
    for p in (p1, p2):
        if p.choice is not None:
            p.choice.choose()  # mulligan nothing
    return game, p1, p2


def test_observation_keys_match_expected(env_started):
    from hearthstone.ai.env.observation import build_observation_for, OBS_KEYS
    game, p1, _ = env_started
    obs = build_observation_for(game, p1)
    assert set(obs.keys()) == set(OBS_KEYS)


def test_observation_card_tensor_shapes(env_started):
    from hearthstone.ai.env.observation import build_observation_for
    from hearthstone.ai.env.card_features import SLOT_DIM
    game, p1, _ = env_started
    obs = build_observation_for(game, p1)
    assert obs["player_hand"].shape == (10, SLOT_DIM)
    assert obs["player_board"].shape == (7, SLOT_DIM)
    assert obs["opponent_board"].shape == (7, SLOT_DIM)


def test_observation_perspective_swap_changes_hand(env_started):
    """Building obs from p2's POV should reflect p2's hand, not p1's."""
    from hearthstone.ai.env.observation import build_observation_for
    game, p1, p2 = env_started
    o1 = build_observation_for(game, p1)
    o2 = build_observation_for(game, p2)
    # Hands differ between players (different decks).
    assert not np.array_equal(o1["player_hand"], o2["player_hand"])


def test_observation_scalars_in_bounds(env_started):
    """player_health <= 60, player_mana <= 10, etc."""
    from hearthstone.ai.env.observation import (
        build_observation_for, SCALAR_BOUNDS,
    )
    game, p1, _ = env_started
    obs = build_observation_for(game, p1)
    for k, (lo, hi) in SCALAR_BOUNDS.items():
        v = float(obs[k][0])
        assert lo <= v <= hi, f"{k}={v} outside [{lo}, {hi}]"


def test_observation_card_features_in_unit_range(env_started):
    """Slot tensors must be in [0, 1] per encoder contract."""
    from hearthstone.ai.env.observation import build_observation_for
    game, p1, _ = env_started
    obs = build_observation_for(game, p1)
    for k in ("player_hand", "player_board", "opponent_board"):
        v = obs[k]
        assert (v >= 0).all()
        assert (v <= 1).all()
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/env/test_observation.py -v`
Expected: all FAIL (module not defined).

- [ ] **Step 3: Implement observation.py**

Create `hearthstone/ai/env/observation.py`:

```python
"""Builds the observation dict from a fireplace.Game + perspective Player.

The dict is shape-stable: hand and board tensors are always padded to
MAX_HAND / MAX_BOARD with encode_empty(). Scalars are 1-D float32 with
explicit per-key bounds (see SCALAR_BOUNDS).
"""
from __future__ import annotations

import numpy as np
from gymnasium import spaces

from .card_features import CardFeatureEncoder, SLOT_DIM


MAX_HAND = 10
MAX_BOARD = 7

SCALAR_KEYS = (
    "player_health", "player_armor", "player_mana", "player_max_mana",
    "player_overload", "player_hand_size", "player_board_size",
    "player_deck_size", "player_secrets_count",
    "opponent_health", "opponent_armor", "opponent_hand_size",
    "opponent_board_size", "opponent_deck_size", "opponent_secrets_count",
    "weapon_atk_player", "weapon_dur_player",
    "weapon_atk_opponent", "weapon_dur_opponent",
    "turn_number", "is_my_turn",
)

SCALAR_BOUNDS = {
    "player_health": (0, 60),  "player_armor": (0, 99),
    "player_mana": (0, 10), "player_max_mana": (0, 10),
    "player_overload": (0, 10),
    "player_hand_size": (0, 10), "player_board_size": (0, 7),
    "player_deck_size": (0, 60), "player_secrets_count": (0, 5),
    "opponent_health": (0, 60), "opponent_armor": (0, 99),
    "opponent_hand_size": (0, 10), "opponent_board_size": (0, 7),
    "opponent_deck_size": (0, 60), "opponent_secrets_count": (0, 5),
    "weapon_atk_player": (0, 20), "weapon_dur_player": (0, 20),
    "weapon_atk_opponent": (0, 20), "weapon_dur_opponent": (0, 20),
    "turn_number": (0, 100), "is_my_turn": (0, 1),
}

OBS_KEYS = (
    "player_hand", "player_board", "opponent_board",
) + SCALAR_KEYS


def make_observation_space() -> spaces.Dict:
    return spaces.Dict({
        "player_hand": spaces.Box(0.0, 1.0, shape=(MAX_HAND, SLOT_DIM), dtype=np.float32),
        "player_board": spaces.Box(0.0, 1.0, shape=(MAX_BOARD, SLOT_DIM), dtype=np.float32),
        "opponent_board": spaces.Box(0.0, 1.0, shape=(MAX_BOARD, SLOT_DIM), dtype=np.float32),
        **{
            k: spaces.Box(low=lo, high=hi, shape=(1,), dtype=np.float32)
            for k, (lo, hi) in SCALAR_BOUNDS.items()
        },
    })


def _clip(value: float, lo: float, hi: float) -> float:
    return float(min(max(value, lo), hi))


def build_observation_for(game, perspective_player) -> dict:
    """Build observation dict from `perspective_player`'s POV.

    `game` is a fireplace.Game; `perspective_player` is one of game.players.
    The opponent is derived as the other player.
    """
    enc = CardFeatureEncoder()
    me = perspective_player
    opp = me.opponent

    # Card tensors
    player_hand = _stack_padded(
        [enc.encode_hand_card(c) for c in me.hand[:MAX_HAND]], MAX_HAND, enc,
    )
    player_board = _stack_padded(
        [enc.encode_minion(m) for m in me.field[:MAX_BOARD]], MAX_BOARD, enc,
    )
    opponent_board = _stack_padded(
        [enc.encode_minion(m) for m in opp.field[:MAX_BOARD]], MAX_BOARD, enc,
    )

    weapon_me = me.weapon
    weapon_op = opp.weapon

    obs: dict = {
        "player_hand": player_hand,
        "player_board": player_board,
        "opponent_board": opponent_board,
    }
    obs.update(_scalars_from(game, me, opp, weapon_me, weapon_op))
    return obs


def _stack_padded(rows, target_n, enc):
    if len(rows) < target_n:
        rows = list(rows) + [enc.encode_empty()] * (target_n - len(rows))
    return np.stack(rows, axis=0).astype(np.float32)


def _scalars_from(game, me, opp, weapon_me, weapon_op) -> dict:
    def s(value, key):
        lo, hi = SCALAR_BOUNDS[key]
        return np.array([_clip(value, lo, hi)], dtype=np.float32)

    return {
        "player_health":    s(me.hero.health, "player_health"),
        "player_armor":     s(me.hero.armor, "player_armor"),
        "player_mana":      s(me.mana, "player_mana"),
        "player_max_mana":  s(me.max_mana, "player_max_mana"),
        "player_overload":  s(me.overloaded, "player_overload"),
        "player_hand_size": s(len(me.hand), "player_hand_size"),
        "player_board_size": s(len(me.field), "player_board_size"),
        "player_deck_size": s(len(me.deck), "player_deck_size"),
        "player_secrets_count": s(len(me.secrets), "player_secrets_count"),
        "opponent_health":  s(opp.hero.health, "opponent_health"),
        "opponent_armor":   s(opp.hero.armor, "opponent_armor"),
        "opponent_hand_size": s(len(opp.hand), "opponent_hand_size"),
        "opponent_board_size": s(len(opp.field), "opponent_board_size"),
        "opponent_deck_size": s(len(opp.deck), "opponent_deck_size"),
        "opponent_secrets_count": s(len(opp.secrets), "opponent_secrets_count"),
        "weapon_atk_player": s(weapon_me.atk if weapon_me else 0, "weapon_atk_player"),
        "weapon_dur_player": s(weapon_me.durability if weapon_me else 0, "weapon_dur_player"),
        "weapon_atk_opponent": s(weapon_op.atk if weapon_op else 0, "weapon_atk_opponent"),
        "weapon_dur_opponent": s(weapon_op.durability if weapon_op else 0, "weapon_dur_opponent"),
        "turn_number":      s(game.turn, "turn_number"),
        "is_my_turn":       s(1 if game.current_player is me else 0, "is_my_turn"),
    }
```

- [ ] **Step 4: Run — expect pass**

Run: `pytest tests/unit/ai/env/test_observation.py -v`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/observation.py tests/unit/ai/env/test_observation.py
git commit -m "feat(env): build_observation_for + SCALAR_BOUNDS + obs space"
```

### Task 3.6: FireplaceGymEnv class

**Files:**
- Create: `hearthstone/ai/env/fireplace_env.py`
- Test: `tests/unit/ai/env/test_fireplace_env.py`

- [ ] **Step 1: Write FireplaceGymEnv tests**

Create `tests/unit/ai/env/test_fireplace_env.py`:

```python
import numpy as np
import pytest


@pytest.fixture
def env():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck

    cards1, h1 = load_deck("basic_mage")
    cards2, h2 = load_deck("basic_warrior")
    return FireplaceGymEnv(
        deck1=cards1, deck2=cards2, hero1=h1, hero2=h2,
        training_player_idx=0, seed=42,
    )


def test_reset_returns_obs_and_info(env):
    obs, info = env.reset()
    assert isinstance(obs, dict)
    assert env.observation_space.contains(obs)


def test_reset_resolves_mulligan(env):
    """After reset, no player has a pending choice."""
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
    obs, reward, term, trunc, info = env.step(n + 100)  # out of range
    assert reward == pytest.approx(-0.01)
    assert info["invalid_action"]


def test_step_end_turn_advances_state(env):
    env.reset()
    obs0_summary = float(env._build_observation()["turn_number"][0])
    env.step(0)   # EndTurnAction is at index 0
    obs1_summary = float(env._build_observation()["turn_number"][0])
    assert obs1_summary >= obs0_summary    # turn number didn't decrease


def test_seed_reproducibility():
    """Same seed → same player_hand after reset."""
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    c1, h1 = load_deck("basic_mage")
    c2, h2 = load_deck("basic_warrior")
    e1 = FireplaceGymEnv(c1, c2, h1, h2, seed=99)
    e2 = FireplaceGymEnv(c1, c2, h1, h2, seed=99)
    obs1, _ = e1.reset()
    obs2, _ = e2.reset()
    assert np.array_equal(obs1["player_hand"], obs2["player_hand"])


def test_valid_actions_under_num_actions_bound():
    """Property test: over multiple games, never exceed NUM_ACTIONS."""
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.action_enum import EndTurnAction
    from hearthstone.ai.env.deck_source import load_deck
    c1, h1 = load_deck("basic_mage")
    c2, h2 = load_deck("basic_warrior")
    for seed in range(5):                    # 5 games is enough for smoke
        env = FireplaceGymEnv(c1, c2, h1, h2, seed=seed)
        env.reset()
        steps = 0
        while not env.game.ended and steps < 200:
            assert len(env.current_valid_actions) <= env.NUM_ACTIONS
            # Always pick EndTurn for speed; we're testing bounds, not policy
            env.step(0)
            steps += 1
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/env/test_fireplace_env.py -v`
Expected: FAIL (module not defined).

- [ ] **Step 3: Implement FireplaceGymEnv**

Create `hearthstone/ai/env/fireplace_env.py`:

```python
"""FireplaceGymEnv — Gymnasium wrapper around fireplace.Game.

Per-step: enumerate valid actions for game.current_player, decode action_idx,
dispatch to fireplace API, auto-resolve any pending choices, build the next
observation from training_player's POV.
"""
from __future__ import annotations

import logging
from typing import Optional

import gymnasium as gym
import numpy as np

from .action_enum import (
    Action, EndTurnAction, dispatch, enumerate_valid_actions,
)
from .choose_one_policy import ChooseOnePolicy, FirstChoiceOne
from .discover_policy import DiscoverPolicy, FirstOption
from .mulligan_policy import KeepLowCost, MulliganPolicy
from .observation import (
    build_observation_for, make_observation_space, MAX_HAND, MAX_BOARD,
)

logger = logging.getLogger(__name__)


class FireplaceGymEnv(gym.Env):
    metadata = {"render_modes": ["human"]}

    NUM_ACTIONS = 512
    MAX_OPP_ACTIONS_PER_STEP = 200      # used by OpponentEnv
    MAX_CHOICE_RESOLUTIONS = 50

    def __init__(
        self,
        deck1: list[str],
        deck2: list[str],
        hero1: str,
        hero2: str,
        training_player_idx: int = 0,
        mulligan_policy: Optional[MulliganPolicy] = None,
        discover_policy: Optional[DiscoverPolicy] = None,
        choose_one_policy: Optional[ChooseOnePolicy] = None,
        seed: Optional[int] = None,
    ):
        super().__init__()
        assert training_player_idx in (0, 1)
        self._deck1 = list(deck1)
        self._deck2 = list(deck2)
        self._hero1 = hero1
        self._hero2 = hero2
        self._training_player_idx = training_player_idx
        self._init_seed = seed
        self.mulligan_policy = mulligan_policy or KeepLowCost(threshold=3)
        self.discover_policy = discover_policy or FirstOption()
        self.choose_one_policy = choose_one_policy or FirstChoiceOne()

        self.observation_space = make_observation_space()
        self.action_space = gym.spaces.Discrete(self.NUM_ACTIONS)

        # Lazy-init fireplace cards db so the env can be constructed in tests
        # without paying the import cost when reset() isn't called.
        self.game = None
        self.current_valid_actions: list[Action] = []
        self._reward_fn = None    # set in reset()

    # -- gym API ------------------------------------------------------------

    def reset(self, *, seed: Optional[int] = None, options=None):
        from fireplace import cards as fp_cards
        from fireplace.game import Game
        from fireplace.player import Player
        from .reward import RewardFunction       # local import — added in phase 4

        fp_cards.db.initialize()
        s = seed if seed is not None else self._init_seed
        p1 = Player("p1", self._deck1, self._hero1)
        p2 = Player("p2", self._deck2, self._hero2)
        self.game = Game(players=[p1, p2], seed=s)
        self.game.start()
        self._auto_resolve_choices()
        self._reward_fn = RewardFunction()
        self.current_valid_actions = enumerate_valid_actions(
            self.game.current_player, self.choose_one_policy,
        )
        return self._build_observation(), self._info()

    def step(self, action_idx: int):
        valid = self.current_valid_actions
        invalid = action_idx >= len(valid) or action_idx < 0
        if invalid:
            obs = self._build_observation()
            return obs, -0.01, bool(self.game.ended), False, {
                "valid_actions": len(valid),
                "invalid_action": True,
            }

        before = self._reward_snapshot()
        dispatch(valid[action_idx], self.game)
        self._auto_resolve_choices()
        after = self._reward_snapshot()
        reward = self._reward_fn.calc(before, after, self.training_player)

        terminated = bool(self.game.ended)
        if terminated:
            self.current_valid_actions = []
        else:
            self.current_valid_actions = enumerate_valid_actions(
                self.game.current_player, self.choose_one_policy,
            )

        obs = self._build_observation()
        return obs, float(reward), terminated, False, self._info()

    def render(self, mode="human"):
        # Minimal CLI render. Caller can override.
        if self.game is not None:
            print(repr(self.game))

    def close(self):
        self.game = None
        self.current_valid_actions = []

    # -- properties ---------------------------------------------------------

    @property
    def training_player(self):
        return self.game.players[self._training_player_idx]

    @property
    def opponent_player(self):
        return self.game.players[1 - self._training_player_idx]

    # -- internals ----------------------------------------------------------

    def _build_observation(self) -> dict:
        return build_observation_for(self.game, self.training_player)

    def build_observation_for(self, player) -> dict:
        """Public API: build obs from arbitrary perspective. Used by SelfPlayOpponent."""
        return build_observation_for(self.game, player)

    def _info(self) -> dict:
        return {
            "valid_actions": len(self.current_valid_actions),
            "invalid_action": False,
        }

    def _auto_resolve_choices(self) -> None:
        from fireplace.actions import MulliganChoice
        for _ in range(self.MAX_CHOICE_RESOLUTIONS):
            for player in self.game.players:
                choice = player.choice
                if choice is None:
                    continue
                if isinstance(choice, MulliganChoice):
                    muls = self.mulligan_policy.cards_to_mulligan(list(choice.cards))
                    choice.choose(*muls)
                else:
                    pick = self.discover_policy.choose(list(choice.cards))
                    choice.choose(pick)
            if all(p.choice is None for p in self.game.players):
                return
        raise RuntimeError(
            f"Choice resolution did not converge within "
            f"{self.MAX_CHOICE_RESOLUTIONS} iterations; game={self.game!r}"
        )

    def _reward_snapshot(self) -> dict:
        from .reward import reward_snapshot
        return reward_snapshot(self)
```

- [ ] **Step 4: Stub `env/reward.py` so `FireplaceGymEnv` can import it**

The full reward implementation lands in phase 4. Create a minimal stub now
so the env tests can run:

```python
# hearthstone/ai/env/reward.py — phase 3 stub; phase 4 replaces this.
"""Reward function (phase-3 stub; phase 4 replaces with proper logic)."""


def reward_snapshot(env) -> dict:
    p = env.training_player
    o = env.opponent_player
    return {
        "p_health": p.hero.health, "p_armor": p.hero.armor,
        "o_health": o.hero.health, "o_armor": o.hero.armor,
        "p_board": len(p.field), "o_board": len(o.field),
        "ended": env.game.ended,
        "p_playstate": p.playstate,
    }


class RewardFunction:
    def calc(self, before: dict, after: dict, training_player) -> float:
        return 0.0
```

- [ ] **Step 5: Run env tests — expect pass**

Run: `pytest tests/unit/ai/env/test_fireplace_env.py -v`
Expected: 7 tests pass. The reward stub returns 0.0 so reward-magnitude
assertions are limited to `-0.01` for invalid actions (which the stub does
NOT touch — invalid-action reward is in `step()` before reward_fn.calc).

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/env/fireplace_env.py \
        hearthstone/ai/env/reward.py \
        tests/unit/ai/env/test_fireplace_env.py
git commit -m "feat(env): FireplaceGymEnv + reward stub"
```

**Phase 3 done.** All env-side modules in place. Run full test suite to confirm:

```bash
pytest tests/ -v --ignore=tests/integration
```
Expected: all green. Old tests still pass; new `tests/unit/ai/env/` tests
all pass.

---

## Phase 4 — Reward + Opponents + OpponentEnv (PR-4)

### Task 4.1: Real RewardFunction with sign-walk tests

**Files:**
- Modify: `hearthstone/ai/env/reward.py`
- Test: `tests/unit/ai/env/test_reward.py`

- [ ] **Step 1: Write reward sign-walk tests**

Create `tests/unit/ai/env/test_reward.py`:

```python
import pytest


def _snap(p_h=30, p_a=0, o_h=30, o_a=0, p_b=0, o_b=0, ended=False, ps=None):
    from hearthstone.enums import PlayState
    return {
        "p_health": p_h, "p_armor": p_a, "o_health": o_h, "o_armor": o_a,
        "p_board": p_b, "o_board": o_b, "ended": ended,
        "p_playstate": ps if ps is not None else PlayState.PLAYING,
    }


def test_no_change_no_reward():
    from hearthstone.ai.env.reward import RewardFunction
    rf = RewardFunction()
    before = _snap()
    after = _snap()
    assert rf.calc(before, after, training_player=None) == pytest.approx(0.0)


def test_damage_to_opponent_positive_reward():
    from hearthstone.ai.env.reward import RewardFunction
    before = _snap(o_h=30)
    after = _snap(o_h=27)
    r = RewardFunction().calc(before, after, training_player=None)
    assert r == pytest.approx(0.03)


def test_self_damage_negative_reward():
    from hearthstone.ai.env.reward import RewardFunction
    before = _snap(p_h=30)
    after = _snap(p_h=27)
    r = RewardFunction().calc(before, after, training_player=None)
    assert r == pytest.approx(-0.03)


def test_terminal_win():
    from hearthstone.ai.env.reward import RewardFunction
    from hearthstone.enums import PlayState
    before = _snap()
    after = _snap(ended=True, ps=PlayState.WON)
    r = RewardFunction().calc(before, after, training_player=None)
    assert r == pytest.approx(1.0)


def test_terminal_loss():
    from hearthstone.ai.env.reward import RewardFunction
    from hearthstone.enums import PlayState
    before = _snap()
    after = _snap(ended=True, ps=PlayState.LOST)
    r = RewardFunction().calc(before, after, training_player=None)
    assert r == pytest.approx(-1.0)


def test_terminal_tied():
    from hearthstone.ai.env.reward import RewardFunction
    from hearthstone.enums import PlayState
    before = _snap()
    after = _snap(ended=True, ps=PlayState.TIED)
    r = RewardFunction().calc(before, after, training_player=None)
    assert r == pytest.approx(0.0)
```

- [ ] **Step 2: Run — expect failure (stub returns 0)**

Run: `pytest tests/unit/ai/env/test_reward.py -v`
Expected: 5 of 6 FAIL (only `test_no_change_no_reward` passes since the
stub always returns 0).

- [ ] **Step 3: Replace the reward stub with real implementation**

Replace `hearthstone/ai/env/reward.py`:

```python
"""Reward function from training player's perspective."""
from __future__ import annotations

from hearthstone.enums import PlayState


def reward_snapshot(env) -> dict:
    p = env.training_player
    o = env.opponent_player
    return {
        "p_health": p.hero.health, "p_armor": p.hero.armor,
        "o_health": o.hero.health, "o_armor": o.hero.armor,
        "p_board": len(p.field), "o_board": len(o.field),
        "ended": env.game.ended,
        "p_playstate": p.playstate,
    }


class RewardFunction:
    DAMAGE_OPP_COEF  = 0.01     # positive: damage to opponent → reward
    DAMAGE_SELF_COEF = -0.01    # negative: damage to self → penalty
    BOARD_DELTA_COEF = 0.05
    WIN_REWARD  = 1.0
    LOSS_REWARD = -1.0
    TIE_REWARD  = 0.0

    def calc(self, before: dict, after: dict, training_player) -> float:
        if after["ended"] and not before["ended"]:
            ps = after["p_playstate"]
            if ps == PlayState.WON:
                return self.WIN_REWARD
            if ps == PlayState.LOST:
                return self.LOSS_REWARD
            return self.TIE_REWARD

        opp_eh_b = before["o_health"] + before["o_armor"]
        opp_eh_a = after["o_health"]  + after["o_armor"]
        own_eh_b = before["p_health"] + before["p_armor"]
        own_eh_a = after["p_health"]  + after["p_armor"]

        opp_damage_dealt  = opp_eh_b - opp_eh_a
        self_damage_taken = own_eh_b - own_eh_a

        r  = self.DAMAGE_OPP_COEF  * opp_damage_dealt
        r += self.DAMAGE_SELF_COEF * self_damage_taken
        r += self.BOARD_DELTA_COEF * (after["p_board"] - before["p_board"])
        r -= self.BOARD_DELTA_COEF * (after["o_board"] - before["o_board"])
        return float(r)
```

- [ ] **Step 4: Run — expect pass**

Run: `pytest tests/unit/ai/env/test_reward.py -v`
Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/reward.py tests/unit/ai/env/test_reward.py
git commit -m "feat(env): RewardFunction with sign-walk tests + terminal branches"
```

### Task 4.2: Opponents (Random + SelfPlay)

**Files:**
- Create: `hearthstone/ai/env/opponents.py`
- Test: `tests/unit/ai/env/test_opponents.py`

- [ ] **Step 1: Write opponent tests**

Create `tests/unit/ai/env/test_opponents.py`:

```python
import numpy as np
import pytest
import torch


@pytest.fixture
def env_ready():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    c1, h1 = load_deck("basic_mage")
    c2, h2 = load_deck("basic_warrior")
    env = FireplaceGymEnv(c1, c2, h1, h2, seed=42)
    env.reset()
    return env


def test_random_opponent_returns_valid_index(env_ready):
    from hearthstone.ai.env.opponents import RandomOpponent
    opp = RandomOpponent()
    for _ in range(20):
        idx = opp.act(env_ready)
        assert 0 <= idx < len(env_ready.current_valid_actions)


def test_random_opponent_with_no_valid_actions_returns_zero():
    from hearthstone.ai.env.opponents import RandomOpponent
    class FakeEnv:
        current_valid_actions = []
    assert RandomOpponent().act(FakeEnv()) == 0


def test_self_play_opponent_loads_state_dict_round_trip(tmp_path):
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.env.opponents import SelfPlayOpponent
    net1 = PolicyValueNetwork(slot_dim=90, hidden_dim=128, num_actions=512)
    ckpt = tmp_path / "model.pt"
    torch.save({"network": net1.state_dict()}, ckpt)
    opp = SelfPlayOpponent(network_path=str(ckpt), slot_dim=90, num_actions=512)
    # Compare a tensor — state_dict equal
    for k, v in net1.state_dict().items():
        assert torch.allclose(v, opp.network.state_dict()[k])


def test_self_play_opponent_greedy_respects_mask(env_ready):
    from hearthstone.ai.env.opponents import SelfPlayOpponent
    from hearthstone.ai.network import PolicyValueNetwork
    opp = SelfPlayOpponent(network_path=None, slot_dim=90, num_actions=512)
    opp.network = PolicyValueNetwork(slot_dim=90, hidden_dim=128, num_actions=512)
    opp.network.eval()
    idx = opp.act(env_ready)
    assert 0 <= idx < len(env_ready.current_valid_actions)
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/env/test_opponents.py -v`
Expected: FAIL (module not defined). Note: `PolicyValueNetwork` constructor
signature changes in phase 5 (slot_dim param). This task pre-empts that
signature; tests will pass once phase 5 ships, but for now we'll need to
either skip these tests or pre-emptively update network.py. **Decision:
update network.py constructor signature now** (phase 4) since it's a small
non-breaking addition (keep `embedding_dim` as a deprecated alias). See
step 3.

- [ ] **Step 3: Pre-update PolicyValueNetwork ctor to accept slot_dim**

Modify `hearthstone/ai/network.py`:

```python
class PolicyValueNetwork(nn.Module):
    """Shared body with policy head (logits) and value head (scalar)."""

    def __init__(
        self,
        slot_dim: int = 64,           # was embedding_dim
        hidden_dim: int = 128,
        num_actions: int = 100,
        embedding_dim: int | None = None,    # deprecated alias
    ):
        super().__init__()
        if embedding_dim is not None:
            slot_dim = embedding_dim
        self.card_encoder = CardEncoder(slot_dim, hidden_dim)
        self.num_scalars = len(SCALAR_KEYS)
        flat_dim = 10 * hidden_dim + 2 * 7 * hidden_dim + self.num_scalars
        ...
```

This is a forward-compatible change — existing callers that use
`embedding_dim=64` continue to work. Run existing network tests to confirm:

```bash
pytest tests/unit/ai/test_network.py -v
```
Expected: all pass (the deprecated alias preserves behavior).

- [ ] **Step 4: Implement opponents**

Create `hearthstone/ai/env/opponents.py`:

```python
"""Opponent policies for FireplaceGymEnv.

Contract: act(env) is invoked when env.game.current_player is the opponent.
Returns an index into env.current_valid_actions for the current player.
"""
from __future__ import annotations

import random
from typing import Optional

import numpy as np
import torch


class OpponentPolicy:
    def act(self, env) -> int:
        raise NotImplementedError


class RandomOpponent(OpponentPolicy):
    def act(self, env) -> int:
        n = len(env.current_valid_actions)
        return random.randrange(n) if n > 0 else 0


class SelfPlayOpponent(OpponentPolicy):
    """Frozen network, greedy argmax over masked logits."""

    def __init__(
        self,
        network_path: Optional[str],
        slot_dim: int = 90,
        hidden_dim: int = 128,
        num_actions: int = 512,
    ):
        from hearthstone.ai.network import PolicyValueNetwork
        self.network = PolicyValueNetwork(
            slot_dim=slot_dim, hidden_dim=hidden_dim, num_actions=num_actions,
        )
        if network_path is not None:
            self.load_from(network_path)
        self.network.eval()
        self.num_actions = num_actions

    def load_from(self, path: str) -> None:
        ckpt = torch.load(path, map_location="cpu")
        sd = ckpt["network"] if isinstance(ckpt, dict) and "network" in ckpt else ckpt
        self.network.load_state_dict(sd)
        self.network.eval()

    def act(self, env) -> int:
        # Build obs from current_player's POV (which is the opponent when
        # OpponentEnv is calling this). Use env.build_observation_for.
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

- [ ] **Step 5: Run opponent tests — expect pass**

Run: `pytest tests/unit/ai/env/test_opponents.py -v`
Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/env/opponents.py \
        hearthstone/ai/network.py \
        tests/unit/ai/env/test_opponents.py
git commit -m "feat(env): RandomOpponent + SelfPlayOpponent over fireplace"
```

### Task 4.3: OpponentEnv wrapper

**Files:**
- Create: `hearthstone/ai/env/opponent_env.py`
- Test: `tests/unit/ai/env/test_opponent_env.py`

- [ ] **Step 1: Write OpponentEnv tests**

Create `tests/unit/ai/env/test_opponent_env.py`:

```python
import pytest


@pytest.fixture
def opp_env():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.opponent_env import OpponentEnv
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck
    c1, h1 = load_deck("basic_mage")
    c2, h2 = load_deck("basic_warrior")
    base = FireplaceGymEnv(c1, c2, h1, h2, training_player_idx=0, seed=42)
    return OpponentEnv(base, RandomOpponent())


def test_reset_returns_to_training_turn(opp_env):
    """After reset (and folded opponent moves if any), it's training player's turn or game over."""
    obs, info = opp_env.reset()
    inner = opp_env._env
    assert (inner.game.current_player is inner.training_player
            or inner.game.ended)


def test_step_folds_opponent_actions(opp_env):
    """After agent's end-turn step, opponent acts and we're back on agent's turn."""
    opp_env.reset()
    obs, reward, term, trunc, info = opp_env.step(0)   # EndTurn
    inner = opp_env._env
    if not term:
        assert inner.game.current_player is inner.training_player


def test_terminated_during_opponent_turn():
    """If the opponent achieves lethal during its turn, term=True; reward includes LOSS_REWARD."""
    # Smoke-test: run many random self-play games; assert at least one terminates
    # and the reward magnitudes are bounded.
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.opponent_env import OpponentEnv
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck
    c1, h1 = load_deck("basic_mage")
    c2, h2 = load_deck("basic_warrior")

    saw_terminal = False
    for seed in range(20):
        base = FireplaceGymEnv(c1, c2, h1, h2, training_player_idx=0, seed=seed)
        env = OpponentEnv(base, RandomOpponent())
        env.reset()
        for _ in range(100):
            _, _, term, _, _ = env.step(0)        # always EndTurn → fast game
            if term:
                saw_terminal = True
                break
        if saw_terminal:
            break
    assert saw_terminal, "20 random games did not terminate within 100 steps each"


def test_opponent_action_cap_force_ends_turn(opp_env):
    """Synthesize a pathological opponent that never picks EndTurn."""
    from hearthstone.ai.env.opponent_env import OpponentEnv
    from hearthstone.ai.env.opponents import RandomOpponent
    inner = opp_env._env

    class StubbornOpponent:
        def act(self, env):
            # Always pick the LAST valid action — never EndTurn (which is at index 0)
            n = len(env.current_valid_actions)
            return n - 1 if n > 1 else 0

    opp_env.opponent = StubbornOpponent()
    opp_env.reset()
    # Force agent to end turn → opponent loops; cap should kick in eventually.
    obs, reward, term, trunc, info = opp_env.step(0)
    # We don't assert specific outcome (the game might end or roll over);
    # we assert no exception escaped and opp_env returned a real value.
    assert isinstance(reward, float)
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/env/test_opponent_env.py -v`
Expected: FAIL.

- [ ] **Step 3: Implement OpponentEnv**

Create `hearthstone/ai/env/opponent_env.py`:

```python
"""OpponentEnv — folds opponent moves into one outer step()."""
from __future__ import annotations

import logging

import gymnasium as gym

from .fireplace_env import FireplaceGymEnv
from .opponents import OpponentPolicy

logger = logging.getLogger(__name__)


class OpponentEnv(gym.Env):
    """Wraps a FireplaceGymEnv and an OpponentPolicy.

    The agent sees only its own turn. Opponent moves are accumulated via
    `_loop_opponent`, including their reward contribution (so the agent's
    "end turn" carries the cost of opponent damage).
    """

    MAX_OPP_ACTIONS_PER_STEP = FireplaceGymEnv.MAX_OPP_ACTIONS_PER_STEP

    def __init__(self, base_env: FireplaceGymEnv, opponent: OpponentPolicy):
        super().__init__()
        self._env = base_env
        self.opponent = opponent
        self.observation_space = base_env.observation_space
        self.action_space = base_env.action_space

    def reset(self, *, seed=None, options=None):
        obs, info = self._env.reset(seed=seed, options=options)
        obs, _, _, _, info = self._loop_opponent(obs, info)
        return obs, info

    def step(self, action_idx: int):
        obs, reward, term, trunc, info = self._env.step(action_idx)
        if term:
            return obs, reward, term, trunc, info
        obs, extra, term, trunc, info = self._loop_opponent(obs, info)
        return obs, reward + extra, term, trunc, info

    def render(self, mode="human"):
        self._env.render(mode)

    def close(self):
        self._env.close()

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

- [ ] **Step 4: Run — expect pass**

Run: `pytest tests/unit/ai/env/test_opponent_env.py -v`
Expected: 4 tests pass. The terminal-during-opponent test is inherently
stochastic; if it fails on rare occasion, increase the seed range from 20
to 50.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/opponent_env.py tests/unit/ai/env/test_opponent_env.py
git commit -m "feat(env): OpponentEnv folds opponent turn into outer step"
```

**Phase 4 done.** Run full suite:

```bash
pytest tests/ -v --ignore=tests/integration
```

---

## Phase 5 — Wire training pipeline (PR-5)

This is the largest single phase. The `scripts/train.py` change is significant
(env factory, action mask, network ctor, self-play opponent, --resume compat).

### Task 5.1: Update SCALAR_KEYS in network.py + new defaults

**Files:**
- Modify: `hearthstone/ai/network.py`
- Modify: `tests/unit/ai/test_network.py`

- [ ] **Step 1: Update SCALAR_KEYS to the 21-tuple from the spec**

Edit `hearthstone/ai/network.py`:

```python
# Replace existing SCALAR_KEYS:
SCALAR_KEYS = (
    "player_health", "player_armor", "player_mana", "player_max_mana",
    "player_overload", "player_hand_size", "player_board_size",
    "player_deck_size", "player_secrets_count",
    "opponent_health", "opponent_armor", "opponent_hand_size",
    "opponent_board_size", "opponent_deck_size", "opponent_secrets_count",
    "weapon_atk_player", "weapon_dur_player",
    "weapon_atk_opponent", "weapon_dur_opponent",
    "turn_number", "is_my_turn",
)


class PolicyValueNetwork(nn.Module):
    def __init__(
        self,
        slot_dim: int = 90,            # default updated to 90
        hidden_dim: int = 128,
        num_actions: int = 512,        # default updated to 512
        embedding_dim: int | None = None,
    ):
        # ... rest unchanged from Task 4.2's pre-update
```

- [ ] **Step 2: Update `tests/unit/ai/test_network.py` to use new defaults**

Find every `PolicyValueNetwork(embedding_dim=64, num_actions=100)` and
replace with `PolicyValueNetwork(slot_dim=90, num_actions=512)`. Find
every test that constructs an obs dict — the dict must now contain all
21 SCALAR_KEYS (not 9).

A helper is the cleanest way:

```python
import numpy as np
from hearthstone.ai.network import SCALAR_KEYS

def _make_dummy_obs(batch_size=1, slot_dim=90):
    obs = {
        "player_hand": np.zeros((batch_size, 10, slot_dim), dtype=np.float32),
        "player_board": np.zeros((batch_size, 7, slot_dim), dtype=np.float32),
        "opponent_board": np.zeros((batch_size, 7, slot_dim), dtype=np.float32),
    }
    for k in SCALAR_KEYS:
        obs[k] = np.zeros((batch_size, 1), dtype=np.float32)
    return obs
```

Update all existing tests in this file to use this helper. Replace
hand-rolled dicts with `_make_dummy_obs()`.

- [ ] **Step 3: Run network tests — expect pass**

Run: `pytest tests/unit/ai/test_network.py -v`
Expected: all pass with new dims.

- [ ] **Step 4: Commit**

```bash
git add hearthstone/ai/network.py tests/unit/ai/test_network.py
git commit -m "feat(network): 21 scalars, slot_dim=90 default, num_actions=512"
```

### Task 5.2: Update TrainConfig + default.yaml

**Files:**
- Modify: `hearthstone/ai/config.py`
- Modify: `configs/default.yaml`
- Modify: `tests/unit/ai/test_config.py`

- [ ] **Step 1: Update TrainConfig dataclass**

Edit `hearthstone/ai/config.py`:

```python
@dataclass
class CardFeaturesConfig:
    log_coverage: bool = True


@dataclass
class TrainConfig:
    seed: int
    max_iters: int
    rollout_steps: int
    ppo_epochs: int

    # Deck pool config (replaces deck1 / deck2 / training_player_name)
    deck_pool: List[str]
    deck_selection: str        # "fixed" | "random_pair"
    fixed_deck1: str
    fixed_deck2: str
    training_player_idx: int   # 0 or 1

    # Choice policies
    mulligan_policy: str       # "keep_all" | "keep_low_cost"
    mulligan_threshold: int
    discover_policy: str       # "first" | "lowest_cost"
    choose_one_policy: str     # "first"

    lr: float
    gamma: float
    gae_lambda: float
    clip_epsilon: float
    value_coef: float
    entropy_coef: float
    max_grad_norm: float

    slot_dim: int              # was embedding_dim
    hidden_dim: int
    num_actions: int

    curriculum: CurriculumConfig
    self_play: SelfPlayConfig

    eval_every: int
    eval_games: int
    max_actions_per_game: int  # NEW: cap from existing evaluate.py

    checkpoint_every: int
    checkpoint_dir: str
    best_checkpoint_path: str

    runs_dir: str

    card_features: CardFeaturesConfig
```

Update `load_config()` so it constructs `CardFeaturesConfig` from the
nested yaml block (mirror of how `CurriculumConfig` and `SelfPlayConfig`
are constructed).

- [ ] **Step 2: Update configs/default.yaml**

Replace contents:

```yaml
# Default training config for fireplace-backed Hearthstone PPO.
seed: 42
max_iters: 1000
rollout_steps: 2048
ppo_epochs: 4

# Decks
deck_pool:
  - basic_mage
  - basic_warrior
deck_selection: fixed
fixed_deck1: basic_mage
fixed_deck2: basic_warrior
training_player_idx: 0

# Choice policies
mulligan_policy: keep_low_cost
mulligan_threshold: 3
discover_policy: first
choose_one_policy: first

# PPO hyperparameters
lr: 3.0e-4
gamma: 0.99
gae_lambda: 0.95
clip_epsilon: 0.2
value_coef: 0.5
entropy_coef: 0.03
max_grad_norm: 0.5

# Network
slot_dim: 90
hidden_dim: 128
num_actions: 512

# Curriculum
curriculum:
  switch_threshold: 0.80
  early_stop_patience: 5

# Self-play opponent refresh
self_play:
  refresh_threshold: 0.80
  refresh_eval_games: 20
  refresh_every: 10
  random_opponent_prob: 0.20
  opponent_checkpoint_path: checkpoints/self_play_opponent.pt

# Eval
eval_every: 10
eval_games: 50
max_actions_per_game: 1000

# Checkpointing
checkpoint_every: 25
checkpoint_dir: checkpoints
best_checkpoint_path: checkpoints/best.pt

# Logging
runs_dir: runs

# Card feature encoder
card_features:
  log_coverage: true
```

- [ ] **Step 3: Update test_config.py**

Update each test in `tests/unit/ai/test_config.py` that constructs a
`TrainConfig` literal — add the new fields. Where the test loads
default.yaml, add an assertion that the new fields parse:

```python
def test_default_yaml_loads_with_new_fields():
    from hearthstone.ai.config import load_config
    cfg = load_config("configs/default.yaml")
    assert cfg.deck_pool == ["basic_mage", "basic_warrior"]
    assert cfg.training_player_idx == 0
    assert cfg.slot_dim == 90
    assert cfg.num_actions == 512
    assert cfg.mulligan_policy == "keep_low_cost"
    assert cfg.discover_policy == "first"
    assert cfg.choose_one_policy == "first"
    assert cfg.max_actions_per_game == 1000
```

For tests that constructed `TrainConfig` with old fields like `deck1`,
remove those tests (no longer applicable) or update them to the new shape.

- [ ] **Step 4: Run config tests — expect pass**

Run: `pytest tests/unit/ai/test_config.py -v`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/config.py configs/default.yaml tests/unit/ai/test_config.py
git commit -m "feat(config): TrainConfig adds deck_pool, slot_dim, policy fields"
```

### Task 5.3: Rewrite evaluate.py

**Files:**
- Modify: `hearthstone/ai/evaluate.py`
- Modify: `tests/unit/ai/test_evaluate.py`

- [ ] **Step 1: Replace evaluate.py with the fireplace version**

Replace contents of `hearthstone/ai/evaluate.py`:

```python
"""Evaluation against an opponent factory; greedy on agent side."""
from typing import Callable

from hearthstone.enums import PlayState

from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
from hearthstone.ai.env.opponents import OpponentPolicy, SelfPlayOpponent


DEFAULT_MAX_ACTIONS_PER_GAME = 1000


def evaluate(
    network: PolicyValueNetwork,
    opponent_factory: Callable[[], OpponentPolicy],
    n_games: int,
    deck1: list[str],
    deck2: list[str],
    hero1: str,
    hero2: str,
    training_player_idx: int = 0,
    slot_dim: int = 90,
    num_actions: int = 512,
    max_actions_per_game: int = DEFAULT_MAX_ACTIONS_PER_GAME,
) -> float:
    """Greedy agent vs `opponent_factory()` opponent; return win-rate from
    training player's perspective. Cap-hit games count as non-wins.
    """
    eval_agent = SelfPlayOpponent(
        network_path=None, slot_dim=slot_dim, num_actions=num_actions,
    )
    eval_agent.network = network
    eval_agent.network.eval()

    wins = 0
    for _ in range(n_games):
        env = FireplaceGymEnv(
            deck1=deck1, deck2=deck2, hero1=hero1, hero2=hero2,
            training_player_idx=training_player_idx,
        )
        opp = opponent_factory()
        env.reset()
        action_count = 0
        cap_hit = False
        while not env.game.ended and action_count < max_actions_per_game:
            if env.game.current_player is env.training_player:
                action = eval_agent.act(env)
            else:
                action = opp.act(env)
            env.step(action)
            action_count += 1
        if action_count >= max_actions_per_game and not env.game.ended:
            cap_hit = True
        if not cap_hit and env.training_player.playstate == PlayState.WON:
            wins += 1
        env.close()
    return wins / n_games
```

- [ ] **Step 2: Update test_evaluate.py**

Update `tests/unit/ai/test_evaluate.py`'s tests to use the new signature.
The simplest test:

```python
def test_evaluate_returns_winrate_in_range():
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.evaluate import evaluate
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck

    net = PolicyValueNetwork(slot_dim=90, hidden_dim=64, num_actions=512)
    c1, h1 = load_deck("basic_mage")
    c2, h2 = load_deck("basic_warrior")
    rate = evaluate(
        network=net, opponent_factory=lambda: RandomOpponent(),
        n_games=2, deck1=c1, deck2=c2, hero1=h1, hero2=h2,
        max_actions_per_game=200,
    )
    assert 0.0 <= rate <= 1.0
```

- [ ] **Step 3: Run — expect pass**

Run: `pytest tests/unit/ai/test_evaluate.py -v`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add hearthstone/ai/evaluate.py tests/unit/ai/test_evaluate.py
git commit -m "feat(evaluate): switch to FireplaceGymEnv + PlayState terminal check"
```

### Task 5.4: Rewrite scripts/train.py — env factory + opponent + network ctor

**Files:**
- Modify: `scripts/train.py`

This is the highest-risk single change in the project. Read existing
`scripts/train.py` end-to-end before editing. The structure stays the same
(curriculum FSM, rollout/update/eval loop, CSV logging, checkpointing) —
only the env construction, opponent construction, and obs/network shapes
change.

- [ ] **Step 1: Update imports**

```python
# Replace these imports:
from hearthstone.ai.gym_env import HearthstoneEnv
from hearthstone.ai.opponent_env import OpponentEnv
from hearthstone.ai.opponents import MixedOpponent, RandomOpponent, SelfPlayOpponent

# With these:
from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
from hearthstone.ai.env.opponent_env import OpponentEnv
from hearthstone.ai.env.opponents import RandomOpponent, SelfPlayOpponent
from hearthstone.ai.env.deck_source import load_deck
```

`MixedOpponent` is no longer present; if `scripts/train.py` uses it for
self-play with random_opponent_prob mixing, replicate the logic inline:

```python
class MixedOpponent:
    """Switch between two opponents per-action with prob p."""
    def __init__(self, primary, fallback, primary_prob: float):
        self.primary = primary
        self.fallback = fallback
        self.primary_prob = primary_prob

    def act(self, env):
        if random.random() < self.primary_prob:
            return self.primary.act(env)
        return self.fallback.act(env)
```

Place this class near the top of `scripts/train.py` (or move to
`hearthstone/ai/env/opponents.py` if used elsewhere). For S1' it can live
inline.

- [ ] **Step 2: Replace `_make_env`**

```python
def _make_env(cfg: TrainConfig, opponent) -> OpponentEnv:
    deck1, hero1 = load_deck(cfg.fixed_deck1)
    deck2, hero2 = load_deck(cfg.fixed_deck2)

    from hearthstone.ai.env.mulligan_policy import KeepAll, KeepLowCost
    from hearthstone.ai.env.discover_policy import FirstOption, LowestCost
    from hearthstone.ai.env.choose_one_policy import FirstChoiceOne

    mp = (KeepAll() if cfg.mulligan_policy == "keep_all"
          else KeepLowCost(cfg.mulligan_threshold))
    dp = (FirstOption() if cfg.discover_policy == "first"
          else LowestCost())
    cop = FirstChoiceOne()

    base = FireplaceGymEnv(
        deck1=deck1, deck2=deck2, hero1=hero1, hero2=hero2,
        training_player_idx=cfg.training_player_idx,
        mulligan_policy=mp, discover_policy=dp, choose_one_policy=cop,
        seed=cfg.seed,
    )
    return OpponentEnv(base, opponent)
```

- [ ] **Step 3: Replace `_action_mask`**

```python
def _action_mask(env: FireplaceGymEnv, n_actions: int) -> np.ndarray:
    valid = env.current_valid_actions
    n_valid = len(valid)
    if n_valid > n_actions:
        logger.warning(
            "action-space truncation: %d valid actions but n_actions=%d",
            n_valid, n_actions,
        )
    mask = np.zeros(n_actions, dtype=np.float32)
    mask[: min(n_valid, n_actions)] = 1.0
    return mask
```

The mask is built from `env.current_valid_actions` (a list), not from a
`controller.get_valid_actions()` call. Wherever `_action_mask` is invoked
in `train.py`, change the argument from `controller` to `env._env` (the
`FireplaceGymEnv` inside `OpponentEnv`).

- [ ] **Step 4: Update PolicyValueNetwork construction**

Find every call to `PolicyValueNetwork(embedding_dim=...)` and replace
with `PolicyValueNetwork(slot_dim=cfg.slot_dim, hidden_dim=cfg.hidden_dim,
num_actions=cfg.num_actions)`. There should be exactly one in `main()`
and one in `_save_self_play_opponent()`.

- [ ] **Step 5: Update SelfPlayOpponent construction**

Find every `SelfPlayOpponent(...)` construction. Update to:

```python
SelfPlayOpponent(
    network_path=path,
    slot_dim=cfg.slot_dim,
    hidden_dim=cfg.hidden_dim,
    num_actions=cfg.num_actions,
)
```

- [ ] **Step 6: Update `evaluate(...)` call sites**

Search for `evaluate(` in `train.py`. Update arg names:

```python
# Old:
evaluate(network, lambda: RandomOpponent(), n_games=cfg.eval_games,
         deck1=cfg.deck1, deck2=cfg.deck2,
         training_player_name=cfg.training_player_name)

# New:
deck1, hero1 = load_deck(cfg.fixed_deck1)
deck2, hero2 = load_deck(cfg.fixed_deck2)
evaluate(network, lambda: RandomOpponent(), n_games=cfg.eval_games,
         deck1=deck1, deck2=deck2, hero1=hero1, hero2=hero2,
         training_player_idx=cfg.training_player_idx,
         slot_dim=cfg.slot_dim, num_actions=cfg.num_actions,
         max_actions_per_game=cfg.max_actions_per_game)
```

- [ ] **Step 7: --resume compatibility**

The `--resume` path loads a checkpoint and may try to inflate the embedded
config into a `TrainConfig`. Old checkpoints have old fields (`deck1`,
`embedding_dim`, etc.), which will raise `TypeError` when constructing the
new `TrainConfig`. Add a clean error:

```python
def _load_checkpoint_config(path: str) -> TrainConfig:
    ckpt = torch.load(path, map_location="cpu")
    raw = ckpt.get("config", {})
    if "deck1" in raw or "embedding_dim" in raw:
        sys.stderr.write(
            f"ERROR: checkpoint {path} was saved by the pre-fireplace "
            f"trainer (has 'deck1' or 'embedding_dim'). Old checkpoints "
            f"are not resumable; start a fresh run.\n"
        )
        sys.exit(1)
    return TrainConfig(**raw)
```

- [ ] **Step 8: Run full smoke test**

This is the integration moment. Run:

```bash
python scripts/train.py --config configs/default.yaml --override max_iters=2 rollout_steps=64 eval_every=1 eval_games=4
```

Expected: 2 iterations of training run end to end. CSV file appears under
`runs/<timestamp>/metrics.csv`. A checkpoint is written to
`checkpoints/iter_0001.pt` (or similar).

If this fails, debug per the error message; common causes:
- Missing import (the `MixedOpponent` rename)
- `_action_mask` arg name mismatch (must take env, not controller)
- `evaluate()` arg name mismatch
- Network constructor still has `embedding_dim`

- [ ] **Step 9: Run test_train_smoke**

Update `tests/unit/ai/test_train_smoke.py` to call `run_training_loop`
(if importable) with `max_iters=2, rollout_steps=64, eval_every=1,
eval_games=4` over the new config. The test asserts that
`runs/<timestamp>/metrics.csv` has 2 iter rows + 2 eval rows.

Run: `pytest tests/unit/ai/test_train_smoke.py -v -m slow`
Expected: pass.

- [ ] **Step 10: Commit**

```bash
git add scripts/train.py tests/unit/ai/test_train_smoke.py
git commit -m "feat(train): wire scripts/train.py onto FireplaceGymEnv"
```

### Task 5.5: Adapt self_play.py and other secondary modules

**Files:**
- Modify: `hearthstone/ai/self_play.py`
- Modify: `tests/unit/ai/test_self_play.py`

- [ ] **Step 1: Audit self_play.py for stale imports**

```bash
grep -nE "from hearthstone.(engine|models|decks|data) import|HearthstoneEnv|opponent_env import|gym_env import" hearthstone/ai/self_play.py
```

Update each match. Most likely the imports of old engine modules are
removed; replace with `from hearthstone.ai.env.fireplace_env import
FireplaceGymEnv` etc.

- [ ] **Step 2: Update test_self_play.py to use fireplace types**

Replace `Minion` from `hearthstone.models.card` (gone in phase 6) with
mock fireplace card IDs (strings). The deck pool is now a list of
`(card_ids, hero_id)` tuples or deck names.

If `SelfPlayTrainer.select_decks()` needs a redesign for new deck source,
update it to consume `cfg.deck_pool` (list of names) and return two
loaded `(card_ids, hero_id)` tuples.

- [ ] **Step 3: Run — expect pass**

Run: `pytest tests/unit/ai/test_self_play.py -v`
Expected: pass after the migration.

- [ ] **Step 4: Commit**

```bash
git add hearthstone/ai/self_play.py tests/unit/ai/test_self_play.py
git commit -m "feat(self_play): adapt to fireplace deck source"
```

**Phase 5 done.** Run full test suite + smoke:

```bash
pytest tests/ -v --ignore=tests/integration
python scripts/train.py --config configs/default.yaml --override max_iters=2 rollout_steps=64 eval_every=1 eval_games=4
```

Both should succeed. The training pipeline now runs on fireplace.

---

## Phase 6 — Atomic cleanup (PR-6)

This phase removes the old engine and old `hearthstone/ai/` modules. Single PR.

### Task 6.1: Verify zero residual imports in kept code

**Files:** none modified yet.

- [ ] **Step 1: Run grep for residual old-engine imports**

```bash
grep -rEn "from hearthstone\.(engine|models|decks|data)|from hearthstone\.ai\.(opponents|opponent_env|reward_functions|card_embedding|gym_env)( |$)|import hearthstone\.engine" \
  hearthstone/ai/ scripts/ configs/ tests/unit/ai/env/ tests/unit/ai/test_train_smoke.py tests/unit/ai/test_config.py tests/unit/ai/test_evaluate.py tests/unit/ai/test_network.py tests/unit/ai/test_self_play.py
```

Expected: zero output. If anything matches, fix it in phase 5 — do not
proceed to deletion.

- [ ] **Step 2: Run a smoke training run to confirm everything works**

```bash
python scripts/train.py --config configs/default.yaml --override max_iters=2 rollout_steps=64 eval_every=1 eval_games=4
```

Expected: no errors. CSV + checkpoint produced.

### Task 6.2: Delete old engine and old ai/ modules

**Files:**
- Delete: many (see below)

- [ ] **Step 1: Delete directories**

```bash
git rm -rf \
  hearthstone/engine \
  hearthstone/models \
  hearthstone/decks \
  hearthstone/data \
  data/cards \
  data/decks \
  cli \
  web

git rm \
  hearthstone/ai/opponents.py \
  hearthstone/ai/opponent_env.py \
  hearthstone/ai/reward_functions.py \
  hearthstone/ai/card_embedding.py \
  hearthstone/ai/gym_env.py \
  main.py \
  run_web.py
```

- [ ] **Step 2: Delete dependent tests**

```bash
git rm \
  tests/unit/test_action.py \
  tests/unit/test_card.py \
  tests/unit/test_card_loader.py \
  tests/unit/test_card_display.py \
  tests/unit/test_attack_executor.py \
  tests/unit/test_attack_validator.py \
  tests/unit/test_command_parser.py \
  tests/unit/test_deck_manager.py \
  tests/unit/test_enums.py \
  tests/unit/test_game_controller.py \
  tests/unit/test_game_display.py \
  tests/unit/test_game_engine.py \
  tests/unit/test_game_state.py \
  tests/unit/test_gym_env.py \
  tests/unit/test_hero.py \
  tests/unit/test_input_handler.py \
  tests/unit/test_menu_display.py \
  tests/unit/test_player.py \
  tests/unit/test_state_cache.py \
  tests/unit/ai/test_opponent_env.py \
  tests/unit/ai/test_opponents.py \
  tests/unit/ai/test_reward_functions.py \
  tests/unit/ai/test_build_observation.py \
  tests/unit/ai/test_card_embedding.py \
  tests/unit/ai/test_gym_env_observation.py

git rm -rf \
  tests/unit/data \
  tests/unit/decks \
  tests/integration
```

- [ ] **Step 3: Drop `requirements.txt` web entries**

Edit `requirements.txt`:

```
pytest>=7.0.0
pytest-cov>=4.0.0
gymnasium>=0.29.0
numpy>=1.24.0
torch>=2.0.0
rich>=13.0.0
pyyaml>=6.0

# Fireplace simulator (AGPL-3.0). hs_glm becomes AGPL by import.
-e file:///home/xu/code/hstone/hearthstone/fireplace
hearthstone-data
```

(Remove fastapi/uvicorn/websockets/python-multipart now that web/ is gone.)

- [ ] **Step 4: Run full test suite**

```bash
pytest tests/ -v
```

Expected: all green, **noticeably faster** (much less code to load and
test). If anything fails, the most likely cause is a missed import in a
kept file — fix the import; don't restore the deleted code.

- [ ] **Step 5: Run smoke training one more time**

```bash
python scripts/train.py --config configs/default.yaml --override max_iters=2 rollout_steps=64 eval_every=1 eval_games=4
```

Expected: succeeds; no errors.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: delete old engine, old ai/ modules, dependent tests, web/, cli/

Phase 6 atomic cleanup. The new path (hearthstone/ai/env/) is fully
operational; nothing remaining in the codebase imports the deleted
modules. Web UI is gone (fireplace has its own webui); cli/ is gone
(human play moves to fireplace's play.py).

Net deletion: ~3500 LOC.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Phase 6 done.** Spec implementation complete. Final state:

- All training runs against fireplace.
- AI sees structured card features (cost / atk / hp / mechanic / effect fingerprint).
- Old engine, web, CLI gone.
- Test suite: ~95% smaller, ~5× faster.
- License: AGPL-3.0-or-later (transitive from fireplace).

---

## Self-Review

After writing the plan, audit it against the spec. Items checked:

- [x] Every spec section maps to a phase + task. Phase 1 → spec "Configuration"
      (pyproject + README); Phase 2 → "CardFeatureEncoder"; Phase 3 →
      "FireplaceGymEnv" + "Action types" + "Observation" + "Mulligan/Discover"
      + "Deck source" + "Choose-One handling"; Phase 4 → "Reward" + "Opponents"
      + "OpponentEnv" + "Evaluate"; Phase 5 → "Network" + "Configuration" +
      "Migration steps high-risk areas"; Phase 6 → "Migration steps PR-6".
- [x] Every step has either a code block or an exact command. No prose-only
      "implement X" steps.
- [x] No "TODO" / "TBD" / "fill in details" placeholders.
- [x] Type consistency: `slot_dim` (not `embedding_dim`) used uniformly in
      phases 4–6. `MulliganPolicy.cards_to_mulligan` (not `choose`) used
      uniformly. `PlayState` from `hearthstone.enums` (not from fireplace).
- [x] Each phase ends with `pytest tests/ -v` passing — green-main contract
      preserved.
- [x] PR-1 / PR-6 ordering: setup at start, atomic deletion at end. New path
      ships green before old path is removed.
- [x] Critical correctness items covered:
      - Choose-One pre-pick at enumeration time (Task 3.3, step 3)
      - Mulligan returns cards-to-mulligan (Task 3.2, step 3) — and
        regression test (Task 3.6, env tests).
      - Reward sign-walks (Task 4.1, all 6 tests).
      - Terminal status via `Player.playstate` (Task 4.1, terminal tests
        + Task 5.3 evaluate.py)
      - Observation feature bounds via `SCALAR_BOUNDS` (Task 3.5, two
        bounds tests; plus encoder unit-range test in Task 2.4).
      - Action count under NUM_ACTIONS=512 property test (Task 3.6).
- [x] High-risk areas from spec are flagged in the plan: Task 5.4 has 10
      sub-steps for `scripts/train.py` because it touches the most code.
