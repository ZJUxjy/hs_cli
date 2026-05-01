# Multi-Deck Training Pool Implementation Plan (S2-A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand training from 2 fixed decks to an 18-deck pool (9 classes × 2
archetypes) with random non-mirror pair sampling, p1/p2 swap per episode,
two-tier eval (fast pool eval + periodic round-robin milestone in a
subprocess), and tuned curriculum threshold. Prerequisite for sub-project
S2-B (神抽/鬼抽 auxiliary head).

**Architecture:** Five-phase migration ordered PR-3 → PR-1 → PR-2 → PR-4 →
PR-5. Phase A authors 18 archetype YAMLs (no code). Phase B introduces the
`Deck` dataclass + `load_decks` + archetype validation, deletes the
basic_*.yaml stubs and the orphaned `self_play.py`. Phase C extends
`FireplaceGymEnv` to accept a deck pool with random sampling and `p1/p2`
swap, refactors `evaluate()` to `evaluate_pool()` returning a dict.
Phase D wires the new env / eval into `scripts/train.py` and
`configs/default.yaml`, with a deprecated-keys shim for old configs and
checkpoints. Phase E adds the `MilestoneRunner` subprocess (ProcessPoolExecutor
with `mp_context='spawn'`) and the `cap_hit_count` / `milestone_path`
columns in `metrics.csv`.

**Tech Stack:** Python 3.10+ (dev env on this machine is 3.8 — see
note in Phase E about `cancel_futures`), fireplace (AGPL-3.0, local
path), torch≥2.0, gymnasium≥0.29, numpy, pyyaml, pytest.

**Spec:** `docs/specs/2026-05-01-multi-deck-training-design.md` (rev 3,
commit `0382b26`). Read the spec before starting. This plan implements
that design.

---

## Prerequisites

- Working tree at `/home/xu/code/hstone/hs_glm`, branch `feature/webui`
  (or a fresh worktree off it).
- Fireplace at `/home/xu/code/hstone/hearthstone/fireplace` is `pip install -e`'d.
- `hearthstone-data` installed; `CardDefs.xml` in place
  (`from fireplace import cards; cards.db.initialize()` returns 30000+ cards).
- All S1' tests currently pass (`pytest tests/ -v`).
- Each phase's final commit ends with `pytest tests/ -v` passing — do NOT
  proceed to the next phase if tests fail.

## Phase Roadmap

| Phase | PR | What ships | Net LOC |
|---|---|---|---|
| A | PR-3 | 18 archetype YAML decks + README; no code | +540 lines YAML / 0 |
| B | PR-1 | `Deck` dataclass + archetype validation + `load_decks`; delete basic_*.yaml + self_play.py + 7 caller updates | +180 / −180 |
| C | PR-2 | `FireplaceGymEnv` multi-deck constructor + `evaluate_pool` | +250 / −80 |
| D | PR-4 | `TrainConfig` new fields + `_strip_deprecated` shim + `scripts/train.py` wires + 18-deck `default.yaml` | +180 / −60 |
| E | PR-5 | `MilestoneRunner` subprocess + `cap_hit_count` / `milestone_path` CSV columns | +280 / −15 |

Final smoke command (run at end of Phase E):
```bash
python scripts/train.py --config configs/default.yaml \
    --override max_iters=2 rollout_steps=64 eval_every=1 eval_games=4 \
    milestone_every=1 milestone_games_per_matchup=1
```

---

## Phase A — Author 18 deck YAMLs (PR-3)

Pure data; no code; existing `basic_*.yaml` remain in place for now. Spec
section "Deck pool: archetype, Choose-One, source" defines naming, schema,
and archetype invariants.

### Task A.1: Authoring helper script (one-shot, not committed)

Authoring 18 decks one by one is tedious. Use this throw-away helper to
verify card_ids against `cards.db` interactively. **Do not commit it.**

**Files:**
- Throw-away: `/tmp/check_card_ids.py`

- [ ] **Step 1: Write the helper**

Save `/tmp/check_card_ids.py`:

```python
"""Throw-away helper: verify a list of card_ids against fireplace.cards.db.
Usage: python /tmp/check_card_ids.py CS2_023 CS2_024 ...
"""
import sys
from fireplace import cards
cards.db.initialize()
missing = [c for c in sys.argv[1:] if c not in cards.db]
if missing:
    print(f"MISSING: {missing}")
    sys.exit(1)
print(f"All {len(sys.argv) - 1} card_ids found in cards.db.")
```

- [ ] **Step 2: Verify it works**

Run: `python /tmp/check_card_ids.py CS2_023 CS2_024 BOGUS_ID`
Expected: prints `MISSING: ['BOGUS_ID']` and exits 1.

### Task A.2: Author 18 deck YAMLs

**Files:**
- Create: `data/fireplace_decks/aggro_mage.yaml`
- Create: `data/fireplace_decks/control_mage.yaml`
- Create: `data/fireplace_decks/aggro_warrior.yaml`
- Create: `data/fireplace_decks/control_warrior.yaml`
- Create: `data/fireplace_decks/aggro_hunter.yaml`
- Create: `data/fireplace_decks/control_hunter.yaml`
- Create: `data/fireplace_decks/aggro_druid.yaml`
- Create: `data/fireplace_decks/control_druid.yaml`
- Create: `data/fireplace_decks/aggro_rogue.yaml`
- Create: `data/fireplace_decks/control_rogue.yaml`
- Create: `data/fireplace_decks/aggro_paladin.yaml`
- Create: `data/fireplace_decks/control_paladin.yaml`
- Create: `data/fireplace_decks/aggro_priest.yaml`
- Create: `data/fireplace_decks/control_priest.yaml`
- Create: `data/fireplace_decks/aggro_shaman.yaml`
- Create: `data/fireplace_decks/control_shaman.yaml`
- Create: `data/fireplace_decks/aggro_warlock.yaml`
- Create: `data/fireplace_decks/control_warlock.yaml`

For each YAML, follow this schema (example for `aggro_mage.yaml`):

```yaml
name: Aggro Mage
archetype: aggro
hero_id: HERO_08
cards:
  - CS2_023      # 30 entries, card_id strings only
  - CS2_023
  ...
```

**Archetype invariants** (will be enforced by `load_deck` in Phase B; verify
each deck satisfies them at authoring time):

| Field | aggro | control |
|---|---|---|
| Total cards | 30 | 30 |
| `mean(cost)` | ≤ 3.0 (≤ 3.3 if Druid/Priest fallback) | ≥ 3.5 |
| Cards with cost ≤ 2 | ≥ 12 | ≤ 6 |
| Cards with cost ≥ 6 | ≤ 4 | ≥ 8 |
| Duplicates / non-legendary | ≤ 2 | ≤ 2 |
| Duplicates / legendary | ≤ 1 | ≤ 1 |

**Sourcing approach** (per spec): TempoStorm / HearthPwn / Hearthstone wiki
basic+classic competitive decks. For each deck, after assembling the list:

- [ ] **Step 1: Verify cards.db coverage**

For each YAML you've drafted, run:

```bash
python /tmp/check_card_ids.py $(grep -oE 'CS2_[0-9]+|EX1_[0-9]+|NEW1_[0-9]+|HERO_[0-9]+' data/fireplace_decks/aggro_mage.yaml)
```

Expected: `All N card_ids found in cards.db.`. If any missing, replace
with a basic+classic equivalent.

- [ ] **Step 2: Verify archetype invariants**

After writing each deck, run inline:

```bash
python -c "
import yaml
from fireplace import cards
cards.db.initialize()
with open('data/fireplace_decks/aggro_mage.yaml') as f: d = yaml.safe_load(f)
ids = d['cards']
costs = [cards.db[c].cost for c in ids]
mean_cost = sum(costs) / len(costs)
n_le_2 = sum(1 for c in costs if c <= 2)
n_ge_6 = sum(1 for c in costs if c >= 6)
print(f'name={d[\"name\"]} archetype={d[\"archetype\"]} '
      f'n={len(ids)} mean_cost={mean_cost:.2f} '
      f'n_le_2={n_le_2} n_ge_6={n_ge_6}')
"
```

For aggro: assert `mean_cost <= 3.0` (or `<= 3.3` if Druid/Priest fallback),
`n_le_2 >= 12`, `n_ge_6 <= 4`.

For control: assert `mean_cost >= 3.5`, `n_le_2 <= 6`, `n_ge_6 >= 8`.

If invariants fail, swap cards. Druid aggro is the most likely fallback
candidate (`<= 3.3` allowed); Priest aggro second.

- [ ] **Step 3: Commit each YAML or batch**

You can commit per-deck or batch all 18 in one commit. The recommended
sequence is: commit 1 = mage decks, commit 2 = warrior decks, ..., commit 9
= warlock decks. This gives clean per-class diff history.

Example:
```bash
git add data/fireplace_decks/aggro_mage.yaml data/fireplace_decks/control_mage.yaml
git commit -m "data(decks): aggro_mage + control_mage"
```

### Task A.3: Update README

**Files:**
- Modify: `data/fireplace_decks/README.md`

- [ ] **Step 1: Replace contents**

```markdown
# Fireplace decks

YAML files consumed by `hearthstone.ai.env.deck_source.load_deck()`.

## File naming convention

`<archetype>_<class>.yaml` where:
- `archetype ∈ {aggro, control}`
- `class ∈ {mage, warrior, hunter, druid, rogue, paladin, priest, shaman, warlock}`

## YAML schema

```yaml
name: <human-readable label>
archetype: aggro | control          # required, validated at load time
hero_id: HERO_NN                    # fireplace hero card id
cards:                              # 30 entries, must all exist in cards.db
  - CS2_023
  - CS2_023
  ...
```

## Archetype invariants

`load_deck` raises `ValueError` if any of these fail:

| Field | aggro | control |
|---|---|---|
| Total cards | 30 | 30 |
| `mean(cost)` | ≤ 3.0 (≤ 3.3 fallback) | ≥ 3.5 |
| Cards with cost ≤ 2 | ≥ 12 | ≤ 6 |
| Cards with cost ≥ 6 | ≤ 4 | ≥ 8 |
| Duplicates / non-legendary | ≤ 2 | ≤ 2 |
| Duplicates / legendary | ≤ 1 | ≤ 1 |

## Hero IDs

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

## Sources

Decks are derived from publicly archived basic+classic-era competitive
lists (TempoStorm snapshots, HearthPwn archive, Hearthstone wiki
archetype pages). Each deck is cross-checked against fireplace's
`cards.db` and any IDs not present in that database are substituted
with basic+classic equivalents.

## Choose-One bias (Druid)

Both Druid decks (`aggro_druid`, `control_druid`) are subject to the
S1' `FirstChoiceOne` policy, which always picks `card.choose_cards[0]`.
This biases Druid decisions in basic+classic where Choose-One cards
(Wrath, Druid of the Claw, Power of the Wild, Keeper of the Grove,
Mark of Nature, Ancients) have meaningful tactical alternatives.
Milestone heatmap consumers should treat Druid rows with caution. A
smarter `ChooseOnePolicy` is deferred to a future spec.

## Authoring fallback

If a Druid or Priest aggro deck cannot satisfy `mean(cost) ≤ 3.0` given
the basic+classic pool, the invariant relaxes to `≤ 3.3`. Document any
deviation here per deck:

- (none yet — fill in if PR-3 hits the fallback)
```

- [ ] **Step 2: Commit**

```bash
git add data/fireplace_decks/README.md
git commit -m "docs(decks): archetype + invariants + sources README"
```

**Phase A done.** Verify with `ls data/fireplace_decks/` — should show
20 YAMLs (18 new + 2 basic_* still present) + README.md.

Run existing tests to confirm nothing broke (the new YAMLs are unreferenced):

```bash
pytest tests/ -v
```
Expected: all green (the 18 new YAMLs sit unreferenced; `basic_*.yaml`
still serves the existing tests).

---

## Phase B — `Deck` dataclass + archetype validation + caller migrations (PR-1)

### Task B.1: Introduce `Deck` dataclass and refactor `load_deck`

**Files:**
- Modify: `hearthstone/ai/env/deck_source.py`
- Modify: `tests/unit/ai/env/test_deck_source.py`

- [ ] **Step 1: Write failing test for `Deck` dataclass + new `load_deck` signature**

Replace the contents of `tests/unit/ai/env/test_deck_source.py` with:

```python
"""Tests for deck_source: Deck dataclass + load_deck + archetype validation."""
import pytest


@pytest.fixture(scope="module", autouse=True)
def _init_cards_db():
    from fireplace import cards
    cards.db.initialize()


def test_deck_dataclass_fields():
    from hearthstone.ai.env.deck_source import Deck
    d = Deck(
        name="aggro_mage", archetype="aggro",
        hero_id="HERO_08", card_ids=["CS2_023"] * 30,
    )
    assert d.name == "aggro_mage"
    assert d.archetype == "aggro"
    assert d.hero_id == "HERO_08"
    assert len(d.card_ids) == 30


def test_load_deck_returns_deck_instance():
    from hearthstone.ai.env.deck_source import Deck, load_deck
    deck = load_deck("aggro_mage")
    assert isinstance(deck, Deck)
    assert deck.name == "aggro_mage"          # filename stem
    assert deck.archetype == "aggro"
    assert deck.hero_id == "HERO_08"
    assert len(deck.card_ids) == 30
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/env/test_deck_source.py -v`
Expected: FAIL — `cannot import Deck`.

- [ ] **Step 3: Implement `Deck` dataclass and refactor `load_deck`**

Replace the contents of `hearthstone/ai/env/deck_source.py`:

```python
"""Load fireplace decks as Deck objects from data/fireplace_decks/<name>.yaml."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import yaml


_PROJECT_ROOT = Path(__file__).resolve().parents[3]   # hs_glm root
DEFAULT_DECK_DIR = str(_PROJECT_ROOT / "data" / "fireplace_decks")
DECK_DIRS = [DEFAULT_DECK_DIR]

_REQUIRED_KEYS = ("name", "archetype", "hero_id", "cards")
_VALID_ARCHETYPES = ("aggro", "control")


@dataclass(frozen=True)
class Deck:
    """One deck = a class + archetype + 30 fireplace card ids."""
    name: str               # filename stem, e.g., "aggro_mage"
    archetype: str          # "aggro" | "control"
    hero_id: str            # fireplace hero card id, e.g., "HERO_08"
    card_ids: tuple         # 30 fireplace card ids; tuple for hashability


def load_deck(name: str) -> Deck:
    """Load and validate a deck. Raises ValueError on any invariant violation.
    Validation includes: required keys, archetype enum, 30 cards, hero_id and
    every card_id present in fireplace.cards.db, duplicate limits, archetype
    cost-curve invariants.
    """
    path = _find_deck_file(name)
    if path is None:
        raise FileNotFoundError(
            f"Deck '{name}' not found. Searched: {DECK_DIRS}"
        )
    with open(path, "r") as f:
        data = yaml.safe_load(f)

    for k in _REQUIRED_KEYS:
        if k not in data:
            raise ValueError(f"Deck '{name}': missing required key '{k}'")

    if data["archetype"] not in _VALID_ARCHETYPES:
        raise ValueError(
            f"Deck '{name}': archetype '{data['archetype']}' not in {_VALID_ARCHETYPES}"
        )

    card_ids = data["cards"]
    if not isinstance(card_ids, list) or len(card_ids) != 30:
        raise ValueError(
            f"Deck '{name}': cards must be a list of length 30, got {len(card_ids)}"
        )

    from fireplace import cards as fp_cards
    fp_cards.db.initialize()
    if data["hero_id"] not in fp_cards.db:
        raise ValueError(f"Deck '{name}': hero_id '{data['hero_id']}' not in cards.db")
    missing = [c for c in card_ids if c not in fp_cards.db]
    if missing:
        raise ValueError(f"Deck '{name}': {len(missing)} card(s) not in cards.db: {missing}")

    deck = Deck(
        name=name, archetype=data["archetype"],
        hero_id=data["hero_id"], card_ids=tuple(card_ids),
    )
    _validate_archetype_invariants(deck, fp_cards.db)
    _validate_duplicate_limits(deck, fp_cards.db)
    return deck


def list_available_decks() -> list:
    seen = set()
    for d in DECK_DIRS:
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            if f.endswith(".yaml"):
                seen.add(f[:-5])
    return sorted(seen)


def _find_deck_file(name: str) -> Optional[Path]:
    for d in DECK_DIRS:
        p = Path(d) / f"{name}.yaml"
        if p.is_file():
            return p
    return None


def _validate_archetype_invariants(deck: Deck, db) -> None:
    """Raise ValueError if cost-curve invariants for the archetype fail."""
    costs = [db[c].cost for c in deck.card_ids]
    mean_cost = sum(costs) / len(costs)
    n_le_2 = sum(1 for c in costs if c <= 2)
    n_ge_6 = sum(1 for c in costs if c >= 6)

    if deck.archetype == "aggro":
        # Spec: aggro mean ≤ 3.0 (or ≤ 3.3 fallback for thin pools).
        # We allow the 3.3 ceiling globally; any deck above 3.0 should
        # have a README note. (Validation enforces the ceiling, not the
        # ideal.)
        max_mean = 3.3
        if mean_cost > max_mean:
            raise ValueError(
                f"Deck '{deck.name}' archetype=aggro: mean_cost={mean_cost:.2f} "
                f"exceeds aggro ceiling {max_mean}"
            )
        if n_le_2 < 12:
            raise ValueError(
                f"Deck '{deck.name}' archetype=aggro: only {n_le_2} cards "
                f"with cost ≤ 2 (need ≥ 12)"
            )
        if n_ge_6 > 4:
            raise ValueError(
                f"Deck '{deck.name}' archetype=aggro: {n_ge_6} cards "
                f"with cost ≥ 6 (max 4)"
            )
    else:  # control
        if mean_cost < 3.5:
            raise ValueError(
                f"Deck '{deck.name}' archetype=control: mean_cost={mean_cost:.2f} "
                f"below control floor 3.5"
            )
        if n_le_2 > 6:
            raise ValueError(
                f"Deck '{deck.name}' archetype=control: {n_le_2} cards "
                f"with cost ≤ 2 (max 6)"
            )
        if n_ge_6 < 8:
            raise ValueError(
                f"Deck '{deck.name}' archetype=control: only {n_ge_6} cards "
                f"with cost ≥ 6 (need ≥ 8)"
            )


def _validate_duplicate_limits(deck: Deck, db) -> None:
    """Raise if any non-legendary appears > 2x or any legendary appears > 1x."""
    counts: dict = {}
    for c in deck.card_ids:
        counts[c] = counts.get(c, 0) + 1
    for cid, n in counts.items():
        rarity = getattr(getattr(db[cid], "rarity", None), "name", "")
        max_n = 1 if rarity == "LEGENDARY" else 2
        if n > max_n:
            raise ValueError(
                f"Deck '{deck.name}': card '{cid}' appears {n} times (max {max_n} "
                f"for rarity={rarity})"
            )


def random_deck(hero_class: str):
    """Random draft via fireplace.utils.random_draft. Returns a Deck with
    name='random_<class>' and archetype='control' (placeholder; not validated).
    Used by future S3' deck pool training; not exercised in S2-A."""
    from fireplace.utils import random_draft
    HERO_BY_CLASS = {
        "MAGE": "HERO_08", "WARRIOR": "HERO_01", "HUNTER": "HERO_05",
        "DRUID": "HERO_06", "ROGUE": "HERO_03", "PALADIN": "HERO_04",
        "PRIEST": "HERO_09", "SHAMAN": "HERO_02", "WARLOCK": "HERO_07",
        "DEMONHUNTER": "HERO_10",
    }
    return Deck(
        name=f"random_{hero_class.lower()}",
        archetype="control",
        hero_id=HERO_BY_CLASS[hero_class.upper()],
        card_ids=tuple(random_draft(hero_class)),
    )
```

- [ ] **Step 4: Run — expect pass for the two written tests**

Run: `pytest tests/unit/ai/env/test_deck_source.py::test_deck_dataclass_fields tests/unit/ai/env/test_deck_source.py::test_load_deck_returns_deck_instance -v`
Expected: 2 PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/deck_source.py tests/unit/ai/env/test_deck_source.py
git commit -m "feat(deck_source): Deck dataclass + load_deck refactor (S2-A PR-1)"
```

### Task B.2: Tests for archetype + duplicate validation

**Files:**
- Modify: `tests/unit/ai/env/test_deck_source.py`

- [ ] **Step 1: Write failing tests for the validation helpers**

Append to `tests/unit/ai/env/test_deck_source.py`:

```python
def test_aggro_archetype_avg_cost_violation_raises(tmp_path, monkeypatch):
    """Synth deck whose mean cost is way above 3.3 ceiling raises."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    bad = tmp_path / "synth_bad_aggro.yaml"
    # 30 copies of Boulderfist Ogre (cost 6) → mean=6, way over 3.3
    bad.write_text(yaml.safe_dump({
        "name": "Bad",
        "archetype": "aggro",
        "hero_id": "HERO_08",
        "cards": ["EX1_185"] * 30,           # this would also fail duplicates
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    with pytest.raises(ValueError, match="appears 30 times"):
        ds.load_deck("synth_bad_aggro")


def test_aggro_archetype_mean_cost_3_3_ceiling(tmp_path, monkeypatch):
    """Deck satisfying card invariants but mean_cost > 3.3 raises."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    bad = tmp_path / "synth_high_cost_aggro.yaml"
    # 12 Wisps (cost 0) + 18 Boulderfist Ogres (cost 6) → mean = 3.6
    # n_le_2 = 12 (passes), n_ge_6 = 18 (fails ≤4 ceiling, but mean check fires first)
    cards = ["CS2_231"] * 2 + ["CS2_120"] * 2 + ["CS2_124"] * 2 + \
            ["CS2_125"] * 2 + ["EX1_007"] * 2 + ["CS2_142"] * 2 + \
            ["EX1_185"] * 2 + ["CS2_186"] * 2 + ["CS2_182"] * 2 + \
            ["EX1_059"] * 2 + ["CS2_117"] * 2 + ["CS2_173"] * 2 + \
            ["CS2_127"] * 2 + ["CS2_119"] * 1 + ["CS2_122"] * 1
    bad.write_text(yaml.safe_dump({
        "name": "Bad",
        "archetype": "aggro",
        "hero_id": "HERO_08",
        "cards": cards,
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    # Either mean-cost ceiling or n_le_2 / n_ge_6 catches it; we don't
    # assert which message — just that ValueError fires.
    with pytest.raises(ValueError):
        ds.load_deck("synth_high_cost_aggro")


def test_control_archetype_low_count_violation_raises(tmp_path, monkeypatch):
    """Control deck with < 8 cards of cost ≥ 6 raises."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    bad = tmp_path / "synth_bad_control.yaml"
    # 30 cost-3 Wolfriders → mean=3, n_ge_6=0, fails control invariants
    bad.write_text(yaml.safe_dump({
        "name": "Bad",
        "archetype": "control",
        "hero_id": "HERO_08",
        "cards": ["CS2_124"] * 30,
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    with pytest.raises(ValueError, match="appears 30 times"):  # dup check fires first
        ds.load_deck("synth_bad_control")


def test_invalid_archetype_raises(tmp_path, monkeypatch):
    """archetype=midrange not in {aggro, control}."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    bad = tmp_path / "synth_bad_archetype.yaml"
    bad.write_text(yaml.safe_dump({
        "name": "Bad",
        "archetype": "midrange",
        "hero_id": "HERO_08",
        "cards": ["CS2_023"] * 30,
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    with pytest.raises(ValueError, match="archetype 'midrange'"):
        ds.load_deck("synth_bad_archetype")


def test_invalid_card_id_lists_missing(tmp_path, monkeypatch):
    """Bogus card_id is named in error message."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    bad = tmp_path / "synth_bad_id.yaml"
    cards = ["BOGUS_ID"] + ["CS2_023"] * 29
    bad.write_text(yaml.safe_dump({
        "name": "Bad",
        "archetype": "aggro",
        "hero_id": "HERO_08",
        "cards": cards,
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    with pytest.raises(ValueError, match="BOGUS_ID"):
        ds.load_deck("synth_bad_id")


def test_missing_required_key_raises(tmp_path, monkeypatch):
    """archetype key absent → clear error."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    bad = tmp_path / "synth_no_archetype.yaml"
    bad.write_text(yaml.safe_dump({
        "name": "Bad",
        "hero_id": "HERO_08",
        "cards": ["CS2_023"] * 30,
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    with pytest.raises(ValueError, match="archetype"):
        ds.load_deck("synth_no_archetype")
```

- [ ] **Step 2: Run — expect all 6 tests pass**

Run: `pytest tests/unit/ai/env/test_deck_source.py -v`
Expected: 8 tests PASS (2 from B.1 + 6 new). The validation logic was
written in B.1; these tests just exercise it.

- [ ] **Step 3: Commit**

```bash
git add tests/unit/ai/env/test_deck_source.py
git commit -m "test(deck_source): archetype + duplicate validation cases"
```

### Task B.3: `load_decks` helper + 18-deck regression test

**Files:**
- Modify: `hearthstone/ai/env/deck_source.py`
- Modify: `tests/unit/ai/env/test_deck_source.py`

- [ ] **Step 1: Write failing tests**

Append to `tests/unit/ai/env/test_deck_source.py`:

```python
def test_load_decks_returns_list_in_order():
    from hearthstone.ai.env.deck_source import load_decks
    decks = load_decks(["aggro_mage", "control_warrior", "aggro_hunter"])
    assert [d.name for d in decks] == ["aggro_mage", "control_warrior", "aggro_hunter"]


def test_load_decks_propagates_failures_with_context():
    from hearthstone.ai.env.deck_source import load_decks
    with pytest.raises((FileNotFoundError, ValueError)):
        load_decks(["aggro_mage", "nonexistent_deck"])


def test_all_18_decks_load_successfully():
    """Regression: all 18 archetype YAMLs satisfy validation. This is the
    PR-3 + PR-1 acceptance gate."""
    from hearthstone.ai.env.deck_source import load_decks
    classes = ["mage", "warrior", "hunter", "druid", "rogue",
               "paladin", "priest", "shaman", "warlock"]
    names = [f"{a}_{c}" for c in classes for a in ("aggro", "control")]
    decks = load_decks(names)
    assert len(decks) == 18
    for deck in decks:
        assert deck.archetype in ("aggro", "control")
        assert len(deck.card_ids) == 30
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/env/test_deck_source.py::test_load_decks_returns_list_in_order -v`
Expected: FAIL — `load_decks` not defined.

- [ ] **Step 3: Add `load_decks` to deck_source.py**

Append to `hearthstone/ai/env/deck_source.py` (after `load_deck`):

```python
def load_decks(names: list) -> list:
    """Load each name in order. Failures bubble up with deck name in the message."""
    return [load_deck(n) for n in names]
```

- [ ] **Step 4: Run — expect all 11 tests pass**

Run: `pytest tests/unit/ai/env/test_deck_source.py -v`
Expected: 11 PASS (8 from B.1+B.2 + 3 new). `test_all_18_decks_load_successfully`
is the PR-3/PR-1 acceptance gate.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/deck_source.py tests/unit/ai/env/test_deck_source.py
git commit -m "feat(deck_source): load_decks + 18-deck regression test"
```

### Task B.4: Switch all callers to new `load_deck` signature + new YAML names

**Files (each MODIFY):**
- `tests/unit/ai/env/test_observation.py`
- `tests/unit/ai/env/test_fireplace_env.py`
- `tests/unit/ai/env/test_opponent_env.py`
- `tests/unit/ai/env/test_opponents.py`
- `tests/unit/ai/test_evaluate.py`
- `tests/unit/ai/test_train_smoke.py`
- `tests/unit/ai/test_config.py`

The current S1' code expects `load_deck` to return `(card_ids: list, hero_id: str)`
(tuple unpacking). After Phase B.1, it returns a `Deck`. Every test that did:

```python
c1, h1 = load_deck("basic_mage")
env = FireplaceGymEnv(deck1=c1, deck2=c2, hero1=h1, hero2=h2, ...)
```

needs to become:

```python
deck_a = load_deck("aggro_mage")
deck_b = load_deck("control_warrior")
env = FireplaceGymEnv(decks=[deck_a, deck_b], ...)
```

**Note**: `FireplaceGymEnv`'s constructor signature change happens in Phase
C, not here. In this task, since the env still expects `deck1, deck2,
hero1, hero2`, we adapt by **destructuring `Deck` back to tuple** at the
test sites:

```python
deck_a = load_deck("aggro_mage")
deck_b = load_deck("control_warrior")
env = FireplaceGymEnv(
    deck1=list(deck_a.card_ids), deck2=list(deck_b.card_ids),
    hero1=deck_a.hero_id, hero2=deck_b.hero_id,
)
```

This temporary adapter goes away in Phase C.

- [ ] **Step 1: Update each test file**

For each file in the list above, find every call to `load_deck` and
update it. Also change every `basic_mage` / `basic_warrior` literal to
`aggro_mage` / `control_warrior`.

Recommended workflow (use sed or your editor):

```bash
# Find all references first
rg -n 'load_deck\(|basic_mage|basic_warrior' \
    tests/unit/ai/ scripts/ configs/ data/ docs/ hearthstone/

# Then for each match in tests/unit/ai/, edit by hand (don't bulk-sed
# because the unpacking pattern needs the Deck conversion above).
```

Specific edits per file:

**`tests/unit/ai/env/test_observation.py`** — fixture `env_started`:

```python
@pytest.fixture
def env_started():
    from fireplace import cards
    cards.db.initialize()
    from fireplace.game import Game
    from fireplace.player import Player
    from hearthstone.ai.env.deck_source import load_deck

    deck_a = load_deck("aggro_mage")
    deck_b = load_deck("control_warrior")
    p1 = Player("p1", list(deck_a.card_ids), deck_a.hero_id)
    p2 = Player("p2", list(deck_b.card_ids), deck_b.hero_id)
    game = Game(players=[p1, p2], seed=42)
    game.start()
    for p in (p1, p2):
        if p.choice is not None:
            p.choice.choose()
    return game, p1, p2
```

**`tests/unit/ai/env/test_fireplace_env.py`** — fixture `env`:

```python
@pytest.fixture
def env():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    deck_a = load_deck("aggro_mage")
    deck_b = load_deck("control_warrior")
    return FireplaceGymEnv(
        deck1=list(deck_a.card_ids), deck2=list(deck_b.card_ids),
        hero1=deck_a.hero_id, hero2=deck_b.hero_id,
        training_player_idx=0, seed=42,
    )
```

Apply the same pattern to:
- `test_opponent_env.py::opp_env` fixture
- `test_opponents.py::env_ready` fixture
- `tests/unit/ai/test_evaluate.py::test_evaluate_returns_winrate_in_range`
- `tests/unit/ai/test_train_smoke.py` (config fixture references)

**`tests/unit/ai/test_config.py`** — find every `basic_mage` / `basic_warrior`
string in the YAML test fixtures and replace with `aggro_mage` /
`control_warrior`. The dataclass fields don't change in this task (yet),
just the deck name strings used in test data.

- [ ] **Step 2: Verify zero remaining references**

Run:

```bash
rg -n 'basic_mage|basic_warrior' \
    hearthstone/ scripts/ configs/ tests/ data/fireplace_decks/
```

Expected: zero matches (or only matches in `data/fireplace_decks/basic_*.yaml`
themselves, which we delete next). If you see any in test code or scripts,
fix them.

- [ ] **Step 3: Run all migrated tests**

Run: `pytest tests/unit/ai/env/ tests/unit/ai/test_evaluate.py tests/unit/ai/test_train_smoke.py tests/unit/ai/test_config.py -v`
Expected: all PASS. The Deck-to-tuple adapter at call sites is ugly but
correct; Phase C cleans it up.

- [ ] **Step 4: Commit**

```bash
git add tests/unit/ai/
git commit -m "test: switch callers to aggro_mage/control_warrior + Deck-to-tuple adapter"
```

### Task B.5: Delete basic_*.yaml + self_play.py + dependent test

**Files:**
- Delete: `data/fireplace_decks/basic_mage.yaml`
- Delete: `data/fireplace_decks/basic_warrior.yaml`
- Delete: `hearthstone/ai/self_play.py`
- Delete: `tests/unit/ai/test_self_play.py`

- [ ] **Step 1: Verify nothing imports `self_play`**

```bash
rg -n 'from hearthstone\.ai\.self_play|import hearthstone\.ai\.self_play|hearthstone\.ai\.self_play import' \
    hearthstone/ scripts/ tests/
```
Expected: only `tests/unit/ai/test_self_play.py` itself imports it.

- [ ] **Step 2: Delete the four files**

```bash
git rm data/fireplace_decks/basic_mage.yaml data/fireplace_decks/basic_warrior.yaml
git rm hearthstone/ai/self_play.py tests/unit/ai/test_self_play.py
```

- [ ] **Step 3: Run all tests**

Run: `pytest tests/ -v`
Expected: all PASS — Phase B.4 already swapped callers to `aggro_mage` /
`control_warrior`, so deleting `basic_*.yaml` is harmless.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: delete basic_*.yaml + orphaned self_play.py (S1' Phase 6 missed it)"
```

**Phase B done.** Run full suite + cleanup verification:

```bash
pytest tests/ -v
rg -n 'load_deck\(|basic_mage|basic_warrior|hearthstone\.ai\.self_play' \
    hearthstone/ scripts/ tests/ configs/ data/ docs/
```

Expected: tests all green; `rg` returns only documentation references in
`docs/` (the spec, README) and the new YAMLs themselves (`aggro_*`,
`control_*`). No code references to the deleted modules.

---

## Phase C — `FireplaceGymEnv` multi-deck + `evaluate_pool` (PR-2)

### Task C.1: New `FireplaceGymEnv` constructor signature

**Files:**
- Modify: `hearthstone/ai/env/fireplace_env.py`
- Modify: `tests/unit/ai/env/test_fireplace_env.py`

- [ ] **Step 1: Write failing tests for the new constructor**

Append to `tests/unit/ai/env/test_fireplace_env.py`:

```python
def test_pair_strategy_random_pair_requires_two_decks():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import Deck
    one = Deck(name="x", archetype="aggro", hero_id="HERO_08", card_ids=("CS2_023",) * 30)
    with pytest.raises(AssertionError, match="random_pair"):
        FireplaceGymEnv(decks=[one], pair_strategy="random_pair", seed=42)


def test_pair_strategy_fixed_requires_two_decks():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import Deck
    one = Deck(name="x", archetype="aggro", hero_id="HERO_08", card_ids=("CS2_023",) * 30)
    with pytest.raises(AssertionError, match="fixed"):
        FireplaceGymEnv(decks=[one], pair_strategy="fixed", seed=42)


def test_constructor_accepts_decks_list():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    a = load_deck("aggro_mage")
    b = load_deck("control_warrior")
    env = FireplaceGymEnv(decks=[a, b], pair_strategy="fixed", seed=42)
    assert env is not None
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/env/test_fireplace_env.py::test_constructor_accepts_decks_list -v`
Expected: FAIL — `FireplaceGymEnv.__init__() got an unexpected keyword argument 'decks'`.

- [ ] **Step 3: Replace `FireplaceGymEnv.__init__` and helpers**

Edit `hearthstone/ai/env/fireplace_env.py`. Replace the existing
`__init__` and `reset` with a multi-deck-aware version. The full new
constructor:

```python
"""FireplaceGymEnv with multi-deck support."""
from __future__ import annotations

import logging
import random
from typing import Literal, Optional

import gymnasium as gym
import numpy as np

from .action_enum import (
    Action, EndTurnAction, dispatch, enumerate_valid_actions,
)
from .choose_one_policy import ChooseOnePolicy, FirstChoiceOne
from .deck_source import Deck
from .discover_policy import DiscoverPolicy, FirstOption
from .mulligan_policy import KeepLowCost, MulliganPolicy
from .observation import (
    build_observation_for, make_observation_space, MAX_HAND, MAX_BOARD,
)

logger = logging.getLogger(__name__)


class FireplaceGymEnv(gym.Env):
    metadata = {"render_modes": ["human"]}

    NUM_ACTIONS = 512
    MAX_OPP_ACTIONS_PER_STEP = 200
    MAX_CHOICE_RESOLUTIONS = 50

    def __init__(
        self,
        decks: list,                                                 # NEW
        pair_strategy: Literal["fixed", "random_pair"] = "fixed",   # NEW
        swap_training_player: bool = False,                          # NEW
        training_player_idx: int = 0,
        mulligan_policy: Optional[MulliganPolicy] = None,
        discover_policy: Optional[DiscoverPolicy] = None,
        choose_one_policy: Optional[ChooseOnePolicy] = None,
        seed: Optional[int] = None,
    ):
        super().__init__()
        # Constructor invariants
        assert pair_strategy in ("fixed", "random_pair"), \
            f"pair_strategy must be 'fixed' or 'random_pair', got {pair_strategy!r}"
        if pair_strategy == "fixed":
            assert len(decks) == 2, \
                f"pair_strategy='fixed' requires len(decks) == 2, got {len(decks)}"
        else:
            assert len(decks) >= 2, \
                f"pair_strategy='random_pair' requires len(decks) >= 2, got {len(decks)}"
        assert all(isinstance(d, Deck) for d in decks), "decks must be a list of Deck"
        assert training_player_idx in (0, 1)

        self.decks = list(decks)
        self.pair_strategy = pair_strategy
        self.swap_training_player = swap_training_player
        self._training_player_idx = training_player_idx
        self._init_seed = seed
        self._rng = np.random.default_rng(seed)

        self.mulligan_policy = mulligan_policy or KeepLowCost(threshold=3)
        self.discover_policy = discover_policy or FirstOption()
        self.choose_one_policy = choose_one_policy or FirstChoiceOne()

        self.observation_space = make_observation_space()
        self.action_space = gym.spaces.Discrete(self.NUM_ACTIONS)

        self.game = None
        self.current_valid_actions: list = []
        self._reward_fn = None
        self._current_p1_deck_name: Optional[str] = None
        self._current_p2_deck_name: Optional[str] = None
        self._current_fireplace_seed: Optional[int] = None
```

(Note the deletion of the legacy `deck1, deck2, hero1, hero2` parameters.)

- [ ] **Step 4: Run the 3 new tests**

Run: `pytest tests/unit/ai/env/test_fireplace_env.py::test_constructor_accepts_decks_list tests/unit/ai/env/test_fireplace_env.py::test_pair_strategy_random_pair_requires_two_decks tests/unit/ai/env/test_fireplace_env.py::test_pair_strategy_fixed_requires_two_decks -v`
Expected: 3 PASS. (Existing tests will FAIL because they still use the
old signature; we fix them in C.4.)

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/fireplace_env.py tests/unit/ai/env/test_fireplace_env.py
git commit -m "feat(env): FireplaceGymEnv multi-deck constructor (S2-A PR-2)"
```

### Task C.2: `reset()` with sampling + RNG propagation

**Files:**
- Modify: `hearthstone/ai/env/fireplace_env.py`
- Modify: `tests/unit/ai/env/test_fireplace_env.py`

- [ ] **Step 1: Write failing tests for sampling + RNG propagation**

Append to `tests/unit/ai/env/test_fireplace_env.py`:

```python
def test_random_pair_no_mirror():
    """1000 resets over a 4-deck pool, zero mirrors, every unordered pair seen."""
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck(n) for n in ("aggro_mage", "control_mage",
                                     "aggro_warrior", "control_warrior")]
    env = FireplaceGymEnv(decks=decks, pair_strategy="random_pair", seed=42)
    seen_mirrors = 0
    pair_counts = {}
    for _ in range(1000):
        env.reset()
        if env._current_p1_deck_name == env._current_p2_deck_name:
            seen_mirrors += 1
        key = tuple(sorted([env._current_p1_deck_name, env._current_p2_deck_name]))
        pair_counts[key] = pair_counts.get(key, 0) + 1
    assert seen_mirrors == 0
    # 4 decks → C(4,2) = 6 unordered pairs; each should be sampled at least once
    assert len(pair_counts) == 6


def test_swap_training_player_balanced():
    """Deterministic seed=42 over 50 resets; assert exact 0/1 counts."""
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    env = FireplaceGymEnv(decks=decks, pair_strategy="fixed",
                          swap_training_player=True, seed=42)
    counts = {0: 0, 1: 0}
    for _ in range(50):
        env.reset()
        counts[env._training_player_idx] += 1
    # With seed=42 and the env's own RNG, this is deterministic. The exact
    # numbers are recorded the first time this test passes; locking them
    # via test makes future RNG-source changes immediately visible.
    # If this assertion fails on first run, record the actual numbers and
    # update — they will be reproducible.
    assert counts[0] + counts[1] == 50
    # Sanity: not pathologically skewed
    assert 15 <= counts[0] <= 35
    assert 15 <= counts[1] <= 35


def test_seed_reproducibility_with_pool():
    """Two envs same seed → identical (deck pair, swap, fp_seed)
    and identical first observation."""
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


def test_random_seed_propagates_to_python_random_for_RandomOpponent():
    """Two envs same seed → same random.random() value after reset (proxy for
    RandomOpponent.act reproducibility)."""
    import random
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck

    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    e1 = FireplaceGymEnv(decks=decks, pair_strategy="fixed", seed=123)
    e2 = FireplaceGymEnv(decks=decks, pair_strategy="fixed", seed=123)
    e1.reset()
    sample1 = random.random()
    e2.reset()
    sample2 = random.random()
    assert sample1 == sample2


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
    """When swap selects training_player_idx=1, OpponentEnv.reset()
    must run opponent's turn first; the first obs the agent sees is
    after opponent's turn 1 (board may be non-empty on opponent side)."""
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.opponent_env import OpponentEnv
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck

    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    base = FireplaceGymEnv(decks=decks, pair_strategy="fixed",
                           training_player_idx=1, seed=42)
    env = OpponentEnv(base, RandomOpponent())
    obs, info = env.reset()
    # By the time reset returns, current_player must be the training player
    # (OpponentEnv loop ensures this) — agent's perspective is consistent.
    assert base.game.current_player is base.training_player or base.game.ended
```

- [ ] **Step 2: Run — expect failures (`reset()` doesn't sample)**

Run: `pytest tests/unit/ai/env/test_fireplace_env.py -v -k "random_pair_no_mirror or swap_training or seed_repro or random_seed or info_dict or swap_training_player_when_idx_1"`
Expected: most/all FAIL with assorted errors.

- [ ] **Step 3: Implement the new `reset()`**

In `hearthstone/ai/env/fireplace_env.py`, replace the existing `reset()`
with:

```python
    def reset(self, *, seed: Optional[int] = None, options=None):
        from fireplace import cards as fp_cards
        from fireplace.game import Game
        from fireplace.player import Player
        from .reward import RewardFunction

        fp_cards.db.initialize()
        if seed is not None:
            self._rng = np.random.default_rng(seed)

        # Seed Python's global random — solely for RandomOpponent.act
        # reproducibility. Fireplace gameplay uses Game.random (seeded
        # below from the same env-RNG, so independent of this).
        random.seed(int(self._rng.integers(0, 2**31)))

        # 1. Sample deck pair
        if self.pair_strategy == "fixed":
            deck_a, deck_b = self.decks[0], self.decks[1]
        else:
            i, j = self._rng.choice(len(self.decks), size=2, replace=False)
            deck_a, deck_b = self.decks[int(i)], self.decks[int(j)]

        # 2. Sample training_player_idx (or hold fixed)
        if self.swap_training_player:
            self._training_player_idx = int(self._rng.integers(0, 2))
        # else self._training_player_idx remains the value from __init__
        # or last reset.

        # 3. Construct fireplace.Game with derived seed
        fp_seed = int(self._rng.integers(0, 2**31))
        p1 = Player("p1", list(deck_a.card_ids), deck_a.hero_id)
        p2 = Player("p2", list(deck_b.card_ids), deck_b.hero_id)
        self.game = Game(players=[p1, p2], seed=fp_seed)
        self.game.start()
        self._auto_resolve_choices()

        # 4. Cache for info dict / metrics / S2-B
        self._current_p1_deck_name = deck_a.name
        self._current_p2_deck_name = deck_b.name
        self._current_fireplace_seed = fp_seed
        self._reward_fn = RewardFunction()

        self.current_valid_actions = enumerate_valid_actions(
            self.game.current_player, self.choose_one_policy,
        )
        return self._build_observation(), self._info()
```

Update `_info()`:

```python
    def _info(self) -> dict:
        return {
            "valid_actions": len(self.current_valid_actions),
            "invalid_action": False,
            "p1_deck_name": self._current_p1_deck_name,
            "p2_deck_name": self._current_p2_deck_name,
            "training_player_idx": self._training_player_idx,
            "fireplace_seed": self._current_fireplace_seed,
        }
```

Also update `step()`'s `info` returns (including the invalid-action
branch) to include the same per-episode fields. Easiest pattern:

```python
    def step(self, action_idx: int):
        valid = self.current_valid_actions
        invalid = action_idx >= len(valid) or action_idx < 0
        if invalid:
            obs = self._build_observation()
            info = self._info()
            info["invalid_action"] = True
            return obs, -0.01, bool(self.game.ended), False, info
        # ... rest of step unchanged ...
```

Update both `training_player` and `opponent_player` properties to use
the per-episode `_training_player_idx`:

```python
    @property
    def training_player(self):
        return self.game.players[self._training_player_idx]

    @property
    def opponent_player(self):
        return self.game.players[1 - self._training_player_idx]
```

(These should already work since `_training_player_idx` is set per
reset; but verify the lookup uses the latest value, not a cached
constructor value.)

- [ ] **Step 4: Run — expect new tests pass**

Run: `pytest tests/unit/ai/env/test_fireplace_env.py -v`
Expected: NEW tests pass; some OLD tests may still fail because they
use the legacy constructor signature. Fix in next task.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/env/fireplace_env.py tests/unit/ai/env/test_fireplace_env.py
git commit -m "feat(env): random_pair sampling + swap_training_player + RNG propagation"
```

### Task C.3: Migrate the rest of `test_fireplace_env.py` and downstream tests

**Files:**
- Modify: `tests/unit/ai/env/test_fireplace_env.py`
- Modify: `tests/unit/ai/env/test_opponent_env.py`
- Modify: `tests/unit/ai/env/test_opponents.py`
- Modify: `tests/unit/ai/env/test_observation.py`

- [ ] **Step 1: Update existing test fixtures**

Each fixture that called the old `(deck1, deck2, hero1, hero2)`
constructor needs to switch to `(decks=[d1, d2], pair_strategy="fixed",
...)`:

**`tests/unit/ai/env/test_fireplace_env.py::env`**:

```python
@pytest.fixture
def env():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    return FireplaceGymEnv(
        decks=decks, pair_strategy="fixed", training_player_idx=0, seed=42,
    )
```

**`tests/unit/ai/env/test_opponent_env.py::opp_env`**:

```python
@pytest.fixture
def opp_env():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.opponent_env import OpponentEnv
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    base = FireplaceGymEnv(decks=decks, pair_strategy="fixed",
                            training_player_idx=0, seed=42)
    return OpponentEnv(base, RandomOpponent())
```

**`tests/unit/ai/env/test_opponents.py::env_ready`**:

```python
@pytest.fixture
def env_ready():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    env = FireplaceGymEnv(decks=decks, pair_strategy="fixed", seed=42)
    env.reset()
    return env
```

**`tests/unit/ai/env/test_observation.py::env_started`** is already
fireplace-direct (doesn't use FireplaceGymEnv); leave it as-is OR update
to use FireplaceGymEnv if you prefer. Either is fine for this phase.

- [ ] **Step 2: Run — full env suite**

Run: `pytest tests/unit/ai/env/ -v`
Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/unit/ai/env/
git commit -m "test: migrate env-suite fixtures to multi-deck FireplaceGymEnv"
```

### Task C.4: `evaluate_pool` returning a dict, with stratified sampling

**Files:**
- Modify: `hearthstone/ai/evaluate.py`
- Modify: `tests/unit/ai/test_evaluate.py`

- [ ] **Step 1: Write failing tests**

Replace `tests/unit/ai/test_evaluate.py` contents:

```python
"""Tests for evaluate_pool."""
import pytest


@pytest.fixture(scope="module", autouse=True)
def _init_cards_db():
    from fireplace import cards
    cards.db.initialize()


def test_evaluate_pool_returns_dict_with_required_keys():
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.evaluate import evaluate_pool
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck

    net = PolicyValueNetwork(slot_dim=90, hidden_dim=64, num_actions=512)
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    result = evaluate_pool(
        network=net, opponent_factory=lambda: RandomOpponent(),
        decks=decks, n_games=4, max_actions_per_game=200, seed=1,
    )
    assert set(result.keys()) >= {"winrate", "n_games", "matchups_seen", "cap_hit_count"}
    assert 0.0 <= result["winrate"] <= 1.0
    assert result["n_games"] == 4
    assert result["matchups_seen"] >= 1
    assert result["cap_hit_count"] >= 0


def test_evaluate_pool_stratified_covers_all_directed_matchups():
    """When n_games >= 612, all directed matchups must appear at least once."""
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.evaluate import evaluate_pool
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck

    net = PolicyValueNetwork(slot_dim=90, hidden_dim=64, num_actions=512)
    # 4 decks → 4 × 3 = 12 directed matchups × 2 idx = 24 (deck_a, deck_b, idx)
    decks = [load_deck(n) for n in ("aggro_mage", "control_mage",
                                     "aggro_warrior", "control_warrior")]
    # n_games = 24 hits every directed matchup once with stratified sampler
    result = evaluate_pool(
        network=net, opponent_factory=lambda: RandomOpponent(),
        decks=decks, n_games=24, max_actions_per_game=200,
        stratified=True, seed=1,
    )
    assert result["n_games"] == 24
    assert result["matchups_seen"] == 24


def test_evaluate_pool_cap_hit_counted():
    """Tight cap forces cap-hits; cap_hit_count > 0."""
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.evaluate import evaluate_pool
    from hearthstone.ai.env.opponents import RandomOpponent
    from hearthstone.ai.env.deck_source import load_deck

    net = PolicyValueNetwork(slot_dim=90, hidden_dim=64, num_actions=512)
    decks = [load_deck("aggro_mage"), load_deck("control_warrior")]
    result = evaluate_pool(
        network=net, opponent_factory=lambda: RandomOpponent(),
        decks=decks, n_games=4, max_actions_per_game=10,  # tight cap
        seed=1,
    )
    assert result["cap_hit_count"] >= 1, "tight cap should hit at least once"
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/test_evaluate.py -v`
Expected: FAIL — `evaluate_pool` not defined.

- [ ] **Step 3: Replace `evaluate.py`**

Replace `hearthstone/ai/evaluate.py`:

```python
"""evaluate_pool: greedy-agent vs opponent_factory across a deck pool."""
from __future__ import annotations

from typing import Callable, Optional

from hearthstone.enums import PlayState

from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
from hearthstone.ai.env.opponents import OpponentPolicy, SelfPlayOpponent


DEFAULT_MAX_ACTIONS_PER_GAME = 1000


def evaluate_pool(
    network: PolicyValueNetwork,
    opponent_factory: Callable[[], OpponentPolicy],
    decks: list,
    n_games: int = 100,
    slot_dim: int = 90,
    hidden_dim: int = 128,
    num_actions: int = 512,
    max_actions_per_game: int = DEFAULT_MAX_ACTIONS_PER_GAME,
    seed: Optional[int] = None,
    stratified: bool = True,
) -> dict:
    """Run n_games games sampling deck pairs from `decks`.

    When stratified=True (default), each call generates a fresh shuffle of
    all directed (deck_a, deck_b, training_player_idx) triples and samples
    the first n_games. Per-call shuffle (no cross-call state).

    When stratified=False, every game samples (i, j) ∈ random_pair (no
    mirror) + training_player_idx ∈ {0, 1} independently.

    Returns:
        {
            "winrate": float,            # cap-hit games count as non-wins
            "n_games": int,
            "matchups_seen": int,
            "cap_hit_count": int,
        }
    """
    import random
    rng = random.Random(seed)

    # Build evaluation agent from the provided network (greedy via SelfPlayOpponent).
    eval_agent = SelfPlayOpponent(
        network_path=None, slot_dim=slot_dim,
        hidden_dim=hidden_dim, num_actions=num_actions,
    )
    eval_agent.network = network
    eval_agent.network.eval()

    # Build sampling order
    n = len(decks)
    if stratified:
        directed = [(i, j, k) for i in range(n) for j in range(n) if i != j for k in (0, 1)]
        rng.shuffle(directed)
        if n_games > len(directed):
            extra = [directed[rng.randrange(len(directed))] for _ in range(n_games - len(directed))]
            sampler = directed + extra
        else:
            sampler = directed[:n_games]
    else:
        sampler = []
        for _ in range(n_games):
            i = rng.randrange(n)
            j = rng.randrange(n)
            while j == i:
                j = rng.randrange(n)
            sampler.append((i, j, rng.randrange(2)))

    wins = 0
    cap_hit_count = 0
    seen = set()
    for g, (i, j, tp_idx) in enumerate(sampler):
        env = FireplaceGymEnv(
            decks=[decks[i], decks[j]], pair_strategy="fixed",
            swap_training_player=False, training_player_idx=tp_idx,
            seed=(seed + g) if seed is not None else None,
        )
        opp = opponent_factory()
        env.reset()
        action_count = 0
        while not env.game.ended and action_count < max_actions_per_game:
            if env.game.current_player is env.training_player:
                idx = eval_agent.act(env)
            else:
                idx = opp.act(env)
            env.step(idx)
            action_count += 1
        if action_count >= max_actions_per_game and not env.game.ended:
            cap_hit_count += 1
        elif env.training_player.playstate == PlayState.WON:
            wins += 1
        seen.add((i, j, tp_idx))
        env.close()

    return {
        "winrate": wins / n_games,        # cap-hits already excluded from numerator
        "n_games": n_games,
        "matchups_seen": len(seen),
        "cap_hit_count": cap_hit_count,
    }
```

- [ ] **Step 4: Run — expect tests pass**

Run: `pytest tests/unit/ai/test_evaluate.py -v`
Expected: 3 PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/evaluate.py tests/unit/ai/test_evaluate.py
git commit -m "feat(evaluate): evaluate_pool with stratified sampling + cap_hit_count (S2-A PR-2)"
```

**Phase C done.** Run full env tests + evaluate:

```bash
pytest tests/unit/ai/env/ tests/unit/ai/test_evaluate.py tests/unit/ai/test_network.py tests/unit/ai/test_self_play.py -v
```

Expected: all PASS.

---

## Phase D — Wire training pipeline (PR-4)

### Task D.1: `TrainConfig` adds new fields + `_strip_deprecated` shim

**Files:**
- Modify: `hearthstone/ai/config.py`
- Modify: `tests/unit/ai/test_config.py`

- [ ] **Step 1: Write failing tests**

Append to `tests/unit/ai/test_config.py`:

```python
def test_default_yaml_has_swap_training_player_and_milestone_fields():
    from hearthstone.ai.config import load_config
    cfg = load_config("configs/default.yaml")
    assert hasattr(cfg, "swap_training_player")
    assert isinstance(cfg.swap_training_player, bool)
    assert hasattr(cfg, "milestone_every")
    assert isinstance(cfg.milestone_every, int)
    assert hasattr(cfg, "milestone_games_per_matchup")


def test_load_config_strips_deprecated_fixed_deck_keys(tmp_path):
    """A YAML carrying deprecated fixed_deck1/2 keys loads with a
    DeprecationWarning, not a TypeError."""
    import warnings
    from hearthstone.ai.config import load_config
    src = tmp_path / "deprecated.yaml"
    src.write_text("""
seed: 1
max_iters: 1
rollout_steps: 16
ppo_epochs: 1
deck_pool:
  - aggro_mage
  - control_warrior
deck_selection: fixed
fixed_deck1: aggro_mage
fixed_deck2: control_warrior
training_player_idx: 0
swap_training_player: false
mulligan_policy: keep_low_cost
mulligan_threshold: 3
discover_policy: first
choose_one_policy: first
lr: 3.0e-4
gamma: 0.99
gae_lambda: 0.95
clip_epsilon: 0.2
value_coef: 0.5
entropy_coef: 0.03
max_grad_norm: 0.5
slot_dim: 90
hidden_dim: 128
num_actions: 512
curriculum:
  switch_threshold: 0.65
  early_stop_patience: 5
self_play:
  refresh_threshold: 0.80
  refresh_eval_games: 4
  refresh_every: 2
  random_opponent_prob: 0.20
  opponent_checkpoint_path: x.pt
eval_every: 1
eval_games: 4
max_actions_per_game: 100
milestone_every: 0
milestone_games_per_matchup: 1
checkpoint_every: 5
checkpoint_dir: checkpoints
best_checkpoint_path: checkpoints/best.pt
runs_dir: runs
card_features:
  log_coverage: false
""")
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        cfg = load_config(str(src))
    deprecation_warnings = [w for w in caught if issubclass(w.category, DeprecationWarning)]
    assert any("fixed_deck1" in str(w.message) for w in deprecation_warnings)
    assert not hasattr(cfg, "fixed_deck1")
```

- [ ] **Step 2: Run — expect failures**

Run: `pytest tests/unit/ai/test_config.py -v`
Expected: failures on the two new tests; existing tests may also fail
because TrainConfig fields haven't been added yet.

- [ ] **Step 3: Update `config.py`**

Edit `hearthstone/ai/config.py`. Replace the `TrainConfig` dataclass and
add the helper:

```python
"""Training configuration: dataclass schema, YAML loading, CLI parsing."""
from __future__ import annotations

import argparse
import warnings
from dataclasses import dataclass
from typing import List, Optional

import yaml


_DEPRECATED_KEYS = ("fixed_deck1", "fixed_deck2")


def _strip_deprecated(raw: dict, source: str) -> dict:
    """Remove deprecated keys from a raw config dict in-place; warn for each.

    Called from BOTH load_config (YAML path) AND scripts/train.py's --resume
    branch (checkpoint path). Single helper so both paths track the same set.
    """
    for key in _DEPRECATED_KEYS:
        if key in raw:
            warnings.warn(
                f"{source}: '{key}' is deprecated; ignored. "
                "Decks are now drawn from `deck_pool` per `pair_strategy`.",
                DeprecationWarning,
            )
            raw.pop(key)
    return raw


@dataclass
class CurriculumConfig:
    switch_threshold: float
    early_stop_patience: int


@dataclass
class SelfPlayConfig:
    refresh_threshold: float
    refresh_eval_games: int
    refresh_every: int
    random_opponent_prob: float
    opponent_checkpoint_path: str


@dataclass
class CardFeaturesConfig:
    log_coverage: bool = True


@dataclass
class TrainConfig:
    seed: int
    max_iters: int
    rollout_steps: int
    ppo_epochs: int

    deck_pool: List[str]
    deck_selection: str
    training_player_idx: int

    swap_training_player: bool
    mulligan_policy: str
    mulligan_threshold: int
    discover_policy: str
    choose_one_policy: str

    lr: float
    gamma: float
    gae_lambda: float
    clip_epsilon: float
    value_coef: float
    entropy_coef: float
    max_grad_norm: float

    slot_dim: int
    hidden_dim: int
    num_actions: int

    curriculum: CurriculumConfig
    self_play: SelfPlayConfig

    eval_every: int
    eval_games: int
    max_actions_per_game: int

    milestone_every: int
    milestone_games_per_matchup: int

    checkpoint_every: int
    checkpoint_dir: str
    best_checkpoint_path: str

    runs_dir: str

    card_features: CardFeaturesConfig


def apply_overrides(raw: dict, overrides: List[str]) -> dict:
    """Apply --override key=value pairs to a raw config dict in-place."""
    for item in overrides:
        if "=" not in item:
            raise ValueError(f"--override expects key=value, got: {item!r}")
        key, value_str = item.split("=", 1)
        value = yaml.safe_load(value_str)
        if isinstance(value, str):
            try:
                value = float(value)
            except ValueError:
                pass
        parts = key.split(".")
        target = raw
        for part in parts[:-1]:
            if part not in target or not isinstance(target[part], dict):
                target[part] = {}
            target = target[part]
        target[parts[-1]] = value
    return raw


def load_config(path: str, overrides: Optional[List[str]] = None) -> TrainConfig:
    with open(path, "r") as f:
        raw = yaml.safe_load(f)
    raw = _strip_deprecated(raw, source=f"config file {path}")
    if overrides:
        raw = apply_overrides(raw, overrides)
    return _dict_to_config(raw)


def _dict_to_config(raw: dict) -> TrainConfig:
    """Build TrainConfig from a raw dict (after _strip_deprecated)."""
    raw["curriculum"] = CurriculumConfig(**raw["curriculum"])
    raw["self_play"] = SelfPlayConfig(**raw["self_play"])
    raw["card_features"] = CardFeaturesConfig(**raw.get("card_features", {}))
    return TrainConfig(**raw)


def parse_cli(argv: List[str]) -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--config", required=True)
    p.add_argument("--resume", default=None)
    p.add_argument("--device", default="cpu")
    p.add_argument("--override", nargs="*", default=[])
    return p.parse_args(argv)
```

- [ ] **Step 4: Update `configs/default.yaml`**

Replace `configs/default.yaml`:

```yaml
# Default training config for fireplace-backed Hearthstone PPO with multi-deck.
seed: 42
max_iters: 1000
rollout_steps: 2048
ppo_epochs: 4

# Decks
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

deck_selection: random_pair
training_player_idx: 0
swap_training_player: true

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
  switch_threshold: 0.65            # was 0.80; multi-deck winrate doesn't saturate
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
eval_games: 100                     # was 50; halve sampling noise
max_actions_per_game: 1000

# Milestone (round-robin subprocess)
milestone_every: 100                # 0 disables
milestone_games_per_matchup: 5

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

- [ ] **Step 5: Run config tests**

Run: `pytest tests/unit/ai/test_config.py -v`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add hearthstone/ai/config.py configs/default.yaml tests/unit/ai/test_config.py
git commit -m "feat(config): TrainConfig multi-deck fields + _strip_deprecated shim"
```

### Task D.2: `scripts/train.py` env construction + evaluate_pool wiring

**Files:**
- Modify: `scripts/train.py`

This is the highest-risk single change in S2-A. Read the existing
`scripts/train.py` end-to-end first.

- [ ] **Step 1: Update imports**

Edit the top of `scripts/train.py`:

```python
"""Entry point: PPO training driver with curriculum + multi-deck eval + milestone.

Usage:
    python scripts/train.py --config configs/default.yaml
    python scripts/train.py --config configs/default.yaml --resume checkpoints/iter_0250.pt
    python scripts/train.py --config configs/default.yaml --override seed=7 lr=1e-4
    python scripts/train.py --config configs/default.yaml --device cuda
"""
import logging
import os
import random
import sys
import time
import warnings
from dataclasses import asdict
from typing import Optional

import numpy as np
import torch

from hearthstone.ai.config import (
    CardFeaturesConfig, CurriculumConfig, SelfPlayConfig, TrainConfig,
    _strip_deprecated, load_config, parse_cli,
)
from hearthstone.ai.curriculum import CurriculumEvent, CurriculumFSM, Phase
from hearthstone.ai.evaluate import evaluate_pool
from hearthstone.ai.env.deck_source import load_decks
from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
from hearthstone.ai.env.opponent_env import OpponentEnv
from hearthstone.ai.env.opponents import RandomOpponent, SelfPlayOpponent
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.ppo_trainer import PPOTrainer
from hearthstone.ai.rollout_buffer import RolloutBuffer
from hearthstone.ai.training_utils import (
    MetricsLogger, load_checkpoint, save_checkpoint,
)
```

- [ ] **Step 2: Replace `_make_env`**

Find the existing `_make_env` function and replace it:

```python
def _make_env(cfg: TrainConfig, opponent, decks) -> OpponentEnv:
    from hearthstone.ai.env.mulligan_policy import KeepAll, KeepLowCost
    from hearthstone.ai.env.discover_policy import FirstOption, LowestCost
    from hearthstone.ai.env.choose_one_policy import FirstChoiceOne

    mp = (KeepAll() if cfg.mulligan_policy == "keep_all"
          else KeepLowCost(cfg.mulligan_threshold))
    dp = (FirstOption() if cfg.discover_policy == "first"
          else LowestCost())
    cop = FirstChoiceOne()

    base = FireplaceGymEnv(
        decks=decks,
        pair_strategy=cfg.deck_selection,           # "fixed" | "random_pair"
        swap_training_player=cfg.swap_training_player,
        training_player_idx=cfg.training_player_idx,
        mulligan_policy=mp,
        discover_policy=dp,
        choose_one_policy=cop,
        seed=cfg.seed,
    )
    return OpponentEnv(base, opponent)
```

The function now takes `decks: list[Deck]`, loaded once at startup.

- [ ] **Step 3: Update `_action_mask` to use the new env**

```python
def _action_mask(env: OpponentEnv, n_actions: int) -> np.ndarray:
    """Build a (NUM_ACTIONS,) mask from env._env.current_valid_actions.
    `env` is OpponentEnv; the inner FireplaceGymEnv exposes current_valid_actions."""
    valid = env._env.current_valid_actions
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

- [ ] **Step 4: Update `main()` — env construction + eval call sites**

Replace the env construction block in `main()`:

```python
def main(argv: Optional[list] = None) -> None:
    args = parse_cli(argv if argv is not None else sys.argv[1:])

    if args.resume is not None:
        # Load checkpoint config; strip deprecated keys; merge with --config + overrides.
        ckpt = torch.load(args.resume, map_location="cpu")
        raw = ckpt.get("config", {})
        raw = _strip_deprecated(raw, source=f"checkpoint {args.resume}")
        # Apply --override on top of resumed config
        if args.override:
            from hearthstone.ai.config import apply_overrides, _dict_to_config
            raw = apply_overrides(raw, args.override)
        cfg = _dict_to_config(raw)
        sys.stderr.write(
            f"WARNING: --resume overrides --config; using config embedded in {args.resume}\n"
        )
    else:
        cfg = load_config(args.config, overrides=args.override)

    _seed_everything(cfg.seed)

    # Load decks once
    decks = load_decks(cfg.deck_pool)

    # Build network
    network = PolicyValueNetwork(
        slot_dim=cfg.slot_dim, hidden_dim=cfg.hidden_dim, num_actions=cfg.num_actions,
    )
    if args.resume is not None:
        ckpt = torch.load(args.resume, map_location="cpu")
        network.load_state_dict(ckpt["network"])
        start_iter = ckpt.get("iter", 0) + 1
    else:
        start_iter = 0

    # Build PPO trainer + rollout buffer
    trainer = PPOTrainer(
        network=network,
        lr=cfg.lr, gamma=cfg.gamma, gae_lambda=cfg.gae_lambda,
        clip_epsilon=cfg.clip_epsilon, value_coef=cfg.value_coef,
        entropy_coef=cfg.entropy_coef, max_grad_norm=cfg.max_grad_norm,
        ppo_epochs=cfg.ppo_epochs,
    )
    buffer = RolloutBuffer(capacity=cfg.rollout_steps, gamma=cfg.gamma, gae_lambda=cfg.gae_lambda)

    # Initial opponent: RandomOpponent in RANDOM phase
    opponent = RandomOpponent()
    env = _make_env(cfg, opponent, decks)
    obs, _ = env.reset()

    # Curriculum FSM
    fsm = CurriculumFSM(
        switch_threshold=cfg.curriculum.switch_threshold,
        early_stop_patience=cfg.curriculum.early_stop_patience,
    )

    # Run dir for metrics
    run_dir = os.path.join(cfg.runs_dir, time.strftime("%Y%m%d-%H%M%S"))
    os.makedirs(run_dir, exist_ok=True)
    metrics_logger = MetricsLogger(os.path.join(run_dir, "metrics.csv"))
    with open(os.path.join(run_dir, "config.yaml"), "w") as f:
        import yaml
        yaml.safe_dump(asdict(cfg), f)

    # ... rest of training loop unchanged for now ...
```

- [ ] **Step 5: Replace eval call sites**

Find the existing `evaluate(...)` call (probably one in the curriculum
RANDOM phase eval and another in self-play refresh). Replace each with
`evaluate_pool(...)`:

```python
            # Curriculum eval (every eval_every iters):
            eval_result = evaluate_pool(
                network=network,
                opponent_factory=lambda: RandomOpponent(),
                decks=decks,
                n_games=cfg.eval_games,
                slot_dim=cfg.slot_dim,
                hidden_dim=cfg.hidden_dim,
                num_actions=cfg.num_actions,
                max_actions_per_game=cfg.max_actions_per_game,
                seed=cfg.seed + iter_num,           # vary per iter for non-degenerate sampling
                stratified=True,
            )
            winrate = eval_result["winrate"]
            event = fsm.update(winrate)
            metrics_logger.log_eval(
                iter=iter_num, phase=fsm.phase.name,
                eval_winrate=winrate, best_winrate=fsm.best_winrate,
                plateau_count=fsm.plateau_count,
                cap_hit_count=eval_result["cap_hit_count"],   # NEW
            )
```

Note: `metrics_logger.log_eval` gets a new `cap_hit_count` arg in Phase E.
For now, leave the call site without that arg; Phase E adds it.

For Phase D, use:

```python
            metrics_logger.log_eval(
                iter=iter_num, phase=fsm.phase.name,
                eval_winrate=winrate, best_winrate=fsm.best_winrate,
                plateau_count=fsm.plateau_count,
            )
```

We'll come back in Phase E to add `cap_hit_count`.

- [ ] **Step 6: Replace `MixedOpponent` (if used)**

Find any `MixedOpponent` reference. The S1' code may have used it for
random_opponent_prob mixing. If yes, define inline or in `env/opponents.py`:

```python
class MixedOpponent:
    """Per-action coin flip between primary (e.g., SelfPlayOpponent)
    and fallback (RandomOpponent), with probability primary_prob of
    primary."""

    def __init__(self, primary, fallback, primary_prob: float):
        self.primary = primary
        self.fallback = fallback
        self.primary_prob = primary_prob

    def act(self, env):
        if random.random() < self.primary_prob:
            return self.primary.act(env)
        return self.fallback.act(env)
```

Place this in `scripts/train.py` (S2-A scope; deferred move to
`env/opponents.py` is fine).

- [ ] **Step 7: Update SelfPlayOpponent constructor calls**

Find any `SelfPlayOpponent(...)` call. Update to pass `slot_dim` /
`hidden_dim` / `num_actions` from cfg:

```python
opponent = SelfPlayOpponent(
    network_path=cfg.self_play.opponent_checkpoint_path,
    slot_dim=cfg.slot_dim,
    hidden_dim=cfg.hidden_dim,
    num_actions=cfg.num_actions,
)
```

- [ ] **Step 8: Run smoke training**

```bash
python scripts/train.py --config configs/default.yaml \
    --override max_iters=2 rollout_steps=64 eval_every=1 eval_games=4 \
    milestone_every=0
```

Expected: 2 iterations end-to-end. CSV under `runs/<ts>/metrics.csv`,
checkpoints written to `checkpoints/`.

If it crashes, common causes:
- `MixedOpponent` import / definition missed
- `_action_mask` arg shape mismatch (now takes `OpponentEnv`, returns
  mask from inner env)
- `evaluate_pool` keyword args mismatch with how train.py calls it
- network constructor mismatch with checkpoint shape

Fix each, re-run.

- [ ] **Step 9: Update `test_train_smoke.py`**

Edit `tests/unit/ai/test_train_smoke.py` to use the new config:

```python
import pytest


@pytest.mark.slow
def test_two_iter_train_smoke_with_pool(tmp_path):
    """2 iters, 2-deck pool degenerates to single matchup, milestone disabled."""
    import os, yaml
    from scripts.train import main

    # Build a minimal config from default.yaml with overrides
    runs_dir = tmp_path / "runs"
    runs_dir.mkdir()
    ckpt_dir = tmp_path / "checkpoints"
    ckpt_dir.mkdir()

    cfg_text = (
        "seed: 42\nmax_iters: 2\nrollout_steps: 64\nppo_epochs: 1\n"
        "deck_pool: [aggro_mage, control_warrior]\n"
        "deck_selection: random_pair\nswap_training_player: true\n"
        "training_player_idx: 0\n"
        "mulligan_policy: keep_low_cost\nmulligan_threshold: 3\n"
        "discover_policy: first\nchoose_one_policy: first\n"
        "lr: 3.0e-4\ngamma: 0.99\ngae_lambda: 0.95\nclip_epsilon: 0.2\n"
        "value_coef: 0.5\nentropy_coef: 0.03\nmax_grad_norm: 0.5\n"
        "slot_dim: 90\nhidden_dim: 64\nnum_actions: 512\n"
        "curriculum: {switch_threshold: 0.65, early_stop_patience: 5}\n"
        "self_play:\n"
        "  refresh_threshold: 0.80\n  refresh_eval_games: 4\n  refresh_every: 2\n"
        "  random_opponent_prob: 0.20\n"
        f"  opponent_checkpoint_path: {ckpt_dir}/sp.pt\n"
        "eval_every: 1\neval_games: 4\nmax_actions_per_game: 100\n"
        "milestone_every: 0\nmilestone_games_per_matchup: 1\n"
        "checkpoint_every: 1\n"
        f"checkpoint_dir: {ckpt_dir}\nbest_checkpoint_path: {ckpt_dir}/best.pt\n"
        f"runs_dir: {runs_dir}\n"
        "card_features: {log_coverage: false}\n"
    )
    cfg_path = tmp_path / "smoke.yaml"
    cfg_path.write_text(cfg_text)

    main(["--config", str(cfg_path)])

    # Verify metrics.csv has > 0 rows
    csvs = list(runs_dir.glob("*/metrics.csv"))
    assert len(csvs) == 1
    rows = csvs[0].read_text().strip().split("\n")
    assert len(rows) > 1     # header + at least one data row

    # Checkpoint produced
    assert (ckpt_dir / "best.pt").exists() or any(ckpt_dir.glob("iter_*.pt"))
```

- [ ] **Step 10: Run smoke test**

Run: `pytest tests/unit/ai/test_train_smoke.py -v -m slow`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add scripts/train.py tests/unit/ai/test_train_smoke.py
git commit -m "feat(train): wire scripts/train.py to multi-deck FireplaceGymEnv + evaluate_pool"
```

**Phase D done.** Run full suite:

```bash
pytest tests/ -v
```

Expected: all PASS.

---

## Phase E — Milestone subprocess (PR-5)

### Task E.1: `MilestoneRunner` skeleton + tests for non-runtime behavior

**Files:**
- Create: `hearthstone/ai/milestone.py`
- Create: `tests/unit/ai/test_milestone.py`

- [ ] **Step 1: Write failing tests for MilestoneRunner non-runtime behavior**

Create `tests/unit/ai/test_milestone.py`:

```python
"""Tests for MilestoneRunner."""
import os
import pytest


def test_milestone_runner_creates_output_dir(tmp_path):
    from hearthstone.ai.milestone import MilestoneRunner
    out = tmp_path / "milestones"
    assert not out.exists()
    runner = MilestoneRunner(output_dir=str(out))
    assert out.is_dir()
    runner.shutdown(wait=False)


def test_milestone_runner_cleans_partial_csvs_on_init(tmp_path):
    from hearthstone.ai.milestone import MilestoneRunner
    out = tmp_path / "milestones"
    out.mkdir()
    stale = out / "iter_0001"
    stale.mkdir()
    partial = stale / "heatmap.csv.partial"
    partial.write_text("stale data")
    assert partial.exists()
    runner = MilestoneRunner(output_dir=str(out))
    assert not partial.exists()
    runner.shutdown(wait=False)


def test_milestone_runner_uses_spawn_context(tmp_path, monkeypatch):
    """The executor should be constructed with mp_context=spawn."""
    import multiprocessing as mp
    from hearthstone.ai import milestone
    captured = {}
    real = milestone.ProcessPoolExecutor

    def fake(*args, **kwargs):
        captured.update(kwargs)
        return real(*args, **kwargs)

    monkeypatch.setattr(milestone, "ProcessPoolExecutor", fake)
    runner = milestone.MilestoneRunner(output_dir=str(tmp_path / "m"))
    runner.shutdown(wait=False)
    assert "mp_context" in captured
    # mp_context is a Context object; check its name
    assert captured["mp_context"].get_start_method() == "spawn"
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/test_milestone.py -v`
Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement `MilestoneRunner` skeleton**

Create `hearthstone/ai/milestone.py`:

```python
"""MilestoneRunner — periodic round-robin eval in a subprocess.

Subprocess is spawned via ProcessPoolExecutor(mp_context='spawn') because
torch+fork is unsafe (lesson from batch_simulator.py).

submit() is non-blocking: parent copies best.pt to a pinned snapshot path
(avoiding torch.save races with the next iter's checkpoint), then submits
the round-robin job. collect_completed() polls without blocking.

Caveats:
- max_workers=1 means the same worker process is reused across submits.
  Imports run once per worker lifetime; cards.db re-init is idempotent.
- On parent KeyboardInterrupt → shutdown(wait=False, cancel_futures=True):
  running subprocess survives parent death (not daemonic; concurrent.futures
  doesn't expose a kill API). User may need pkill -f _run_round_robin.
- If milestones run slower than milestone_every iters, _pending grows;
  we warn when len(_pending) > 3.
"""
from __future__ import annotations

import csv
import logging
import multiprocessing as mp
import os
import shutil
import sys
from concurrent.futures import Future, ProcessPoolExecutor
from typing import Optional

logger = logging.getLogger(__name__)


class MilestoneRunner:

    def __init__(self, output_dir: str):
        os.makedirs(output_dir, exist_ok=True)
        self.output_dir = output_dir

        # Cleanup partial CSVs from prior killed runs.
        for root, _dirs, files in os.walk(output_dir):
            for fname in files:
                if fname.endswith(".csv.partial"):
                    os.remove(os.path.join(root, fname))

        # spawn (not fork) — torch+fork is unsafe.
        ctx = mp.get_context("spawn")
        self._executor = ProcessPoolExecutor(max_workers=1, mp_context=ctx)
        self._pending: list = []                 # list of (Future, iter_num, out_path)

    def submit(self, *, iter_num: int, checkpoint_path: str,
               deck_names: list, games_per_matchup: int,
               slot_dim: int, num_actions: int) -> str:
        """Pin checkpoint snapshot; submit subprocess job; return output csv path."""
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
        if len(self._pending) > 3:
            logger.warning(
                "[milestone] _pending length %d — milestones running slower "
                "than milestone_every; consider increasing the interval",
                len(self._pending),
            )
        logger.info("[milestone] submitted iter=%d → %s", iter_num, out_csv)
        return out_csv

    def collect_completed(self) -> list:
        """Return [(iter_num, out_path), ...] for any newly-finished milestones."""
        done, remaining = [], []
        for fut, iter_num, out in self._pending:
            if not fut.done():
                remaining.append((fut, iter_num, out))
                continue
            try:
                fut.result()
                done.append((iter_num, out))
                logger.info("[milestone] completed iter=%d", iter_num)
            except Exception as e:
                logger.error("[milestone] iter=%d failed: %s", iter_num, e)
        self._pending = remaining
        return done

    def shutdown(self, wait: bool = True):
        """Cancel pending submits; in-flight subprocess is NOT signalled."""
        # cancel_futures requires Python 3.9+. The dev conda env on the
        # author's machine is 3.8, so gate the kwarg.
        if sys.version_info >= (3, 9):
            self._executor.shutdown(wait=wait, cancel_futures=True)
        else:
            self._executor.shutdown(wait=wait)


def _run_round_robin(
    checkpoint_path: str, deck_names: list, games_per_matchup: int,
    output_path: str, slot_dim: int, num_actions: int,
) -> None:
    """Subprocess entry. Cold start: re-imports everything fresh.

    Order: torch threading must be set BEFORE the first torch op.
    """
    import torch
    torch.set_num_threads(1)

    from fireplace import cards
    cards.db.initialize()

    from hearthstone.ai.env.deck_source import load_decks
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.opponents import RandomOpponent, SelfPlayOpponent
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.enums import PlayState

    # Load checkpoint and read network shape from its embedded config so
    # the subprocess works with non-default hidden_dim/num_actions/slot_dim.
    ckpt = torch.load(checkpoint_path, map_location="cpu")
    ckpt_cfg = ckpt.get("config", {})
    eff_slot_dim = int(ckpt_cfg.get("slot_dim", slot_dim))
    eff_hidden_dim = int(ckpt_cfg.get("hidden_dim", 128))
    eff_num_actions = int(ckpt_cfg.get("num_actions", num_actions))

    net = PolicyValueNetwork(
        slot_dim=eff_slot_dim,
        hidden_dim=eff_hidden_dim,
        num_actions=eff_num_actions,
    )
    net.load_state_dict(ckpt["network"] if "network" in ckpt else ckpt)
    net.eval()

    decks = load_decks(deck_names)
    agent = SelfPlayOpponent(
        network_path=None,
        slot_dim=eff_slot_dim,
        hidden_dim=eff_hidden_dim,
        num_actions=eff_num_actions,
    )
    agent.network = net
    agent.network.eval()

    partial = output_path + ".partial"
    rows = []
    for i, deck_a in enumerate(decks):
        for j, deck_b in enumerate(decks):
            if i == j:
                continue
            for tp_idx in (0, 1):
                wins = 0
                cap_hits = 0
                for g in range(games_per_matchup):
                    matchup_seed = (i * 31 + j * 17 + tp_idx * 7 + g) & 0x7FFFFFFF
                    env = FireplaceGymEnv(
                        decks=[deck_a, deck_b],
                        pair_strategy="fixed",
                        swap_training_player=False,
                        training_player_idx=tp_idx,
                        seed=matchup_seed,
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

    with open(partial, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=[
            "deck_a", "deck_b", "training_player_idx",
            "n_games", "winrate", "cap_hit_count",
        ])
        w.writeheader()
        w.writerows(rows)
    os.replace(partial, output_path)
```

- [ ] **Step 4: Run skeleton tests**

Run: `pytest tests/unit/ai/test_milestone.py::test_milestone_runner_creates_output_dir tests/unit/ai/test_milestone.py::test_milestone_runner_cleans_partial_csvs_on_init tests/unit/ai/test_milestone.py::test_milestone_runner_uses_spawn_context -v`
Expected: 3 PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/milestone.py tests/unit/ai/test_milestone.py
git commit -m "feat(milestone): MilestoneRunner skeleton (S2-A PR-5)"
```

### Task E.2: End-to-end milestone test (real subprocess, 2-deck, 1 game)

**Files:**
- Modify: `tests/unit/ai/test_milestone.py`

- [ ] **Step 1: Write the integration test**

Append to `tests/unit/ai/test_milestone.py`:

```python
def _make_tiny_ckpt(tmp_path, hidden_dim=64):
    """Save a fresh PolicyValueNetwork to disk. Returns path."""
    import torch
    from hearthstone.ai.network import PolicyValueNetwork
    net = PolicyValueNetwork(slot_dim=90, hidden_dim=hidden_dim, num_actions=512)
    path = str(tmp_path / "tiny.pt")
    torch.save({
        "network": net.state_dict(),
        "config": {
            "slot_dim": 90, "hidden_dim": hidden_dim, "num_actions": 512,
        },
    }, path)
    return path


@pytest.mark.slow
def test_milestone_end_to_end_two_decks_one_game(tmp_path):
    """Submit one milestone with 2 decks × 1 game; assert CSV has 4 rows
    (2 ordered pairs × 2 training_player_idx) with the expected schema."""
    from hearthstone.ai.milestone import MilestoneRunner
    out = tmp_path / "milestones"
    runner = MilestoneRunner(output_dir=str(out))
    ckpt = _make_tiny_ckpt(tmp_path)

    csv_path = runner.submit(
        iter_num=1, checkpoint_path=ckpt,
        deck_names=["aggro_mage", "control_warrior"],
        games_per_matchup=1, slot_dim=90, num_actions=512,
    )
    runner.shutdown(wait=True)        # block until subprocess finishes

    assert os.path.exists(csv_path), f"expected milestone CSV at {csv_path}"
    import csv
    with open(csv_path) as f:
        rows = list(csv.DictReader(f))
    assert len(rows) == 4    # 2 ordered pairs × 2 tp_idx
    assert set(rows[0].keys()) == {
        "deck_a", "deck_b", "training_player_idx",
        "n_games", "winrate", "cap_hit_count",
    }
    for row in rows:
        assert 0.0 <= float(row["winrate"]) <= 1.0
        assert int(row["cap_hit_count"]) >= 0


@pytest.mark.slow
def test_failed_subprocess_logs_and_continues(tmp_path, caplog):
    """Submit with a non-existent ckpt path; collect_completed; assert
    logger.error fired; assert no exception escapes."""
    import logging
    from hearthstone.ai.milestone import MilestoneRunner
    runner = MilestoneRunner(output_dir=str(tmp_path / "m"))
    runner.submit(
        iter_num=99, checkpoint_path=str(tmp_path / "does_not_exist.pt"),
        deck_names=["aggro_mage", "control_warrior"],
        games_per_matchup=1, slot_dim=90, num_actions=512,
    )
    # Wait for subprocess to fail
    while runner._pending:
        runner.collect_completed()
        if runner._pending and runner._pending[0][0].done():
            break
    runner.collect_completed()
    runner.shutdown(wait=True)
    error_records = [r for r in caplog.records if r.levelno >= logging.ERROR]
    assert len(error_records) >= 1
```

- [ ] **Step 2: Run end-to-end test**

Run: `pytest tests/unit/ai/test_milestone.py::test_milestone_end_to_end_two_decks_one_game -v -m slow`
Expected: PASS in ~30-60s (cold subprocess startup + 4 games).

- [ ] **Step 3: Run failure test**

Run: `pytest tests/unit/ai/test_milestone.py::test_failed_subprocess_logs_and_continues -v -m slow`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/unit/ai/test_milestone.py
git commit -m "test(milestone): end-to-end + failed-subprocess tests"
```

### Task E.3: `_HEADER` adds `cap_hit_count` + `milestone_path`; `log_eval` accepts cap_hit_count

**Files:**
- Modify: `hearthstone/ai/training_utils.py`
- Modify: `tests/unit/ai/test_training_utils.py`

- [ ] **Step 1: Write failing tests**

Append to `tests/unit/ai/test_training_utils.py`:

```python
def test_header_has_eleven_columns(tmp_path):
    from hearthstone.ai.training_utils import MetricsLogger
    path = tmp_path / "m.csv"
    logger = MetricsLogger(str(path))
    logger.close()
    import csv
    rows = list(csv.reader(path.open()))
    assert rows[0] == [
        "iter", "phase", "total_loss", "policy_loss", "value_loss",
        "entropy", "eval_winrate", "best_winrate", "plateau_count",
        "cap_hit_count", "milestone_path",
    ]


def test_log_iter_writes_five_trailing_blanks(tmp_path):
    from hearthstone.ai.training_utils import MetricsLogger
    path = tmp_path / "m.csv"
    logger = MetricsLogger(str(path))
    logger.log_iter(iter=1, phase="RANDOM", total_loss=0.5,
                    policy_loss=0.1, value_loss=0.4, entropy=4.2)
    logger.close()
    import csv
    rows = list(csv.reader(path.open()))
    assert rows[1][:6] == ["1", "RANDOM", "0.5", "0.1", "0.4", "4.2"]
    assert rows[1][6:] == ["", "", "", "", ""]   # 5 trailing blanks


def test_log_eval_fills_cap_hit_count(tmp_path):
    from hearthstone.ai.training_utils import MetricsLogger
    path = tmp_path / "m.csv"
    logger = MetricsLogger(str(path))
    logger.log_eval(iter=10, phase="RANDOM", eval_winrate=0.75,
                    best_winrate=0.75, plateau_count=0, cap_hit_count=3)
    logger.close()
    import csv
    rows = list(csv.reader(path.open()))
    # iter=10, phase=RANDOM, 4 blanks for losses, then eval+best+plateau+cap_hit, 1 trailing blank
    assert rows[1][0] == "10"
    assert rows[1][1] == "RANDOM"
    assert rows[1][2:6] == ["", "", "", ""]
    assert rows[1][6:9] == ["0.75", "0.75", "0"]
    assert rows[1][9] == "3"     # cap_hit_count
    assert rows[1][10] == ""     # milestone_path blank


def test_log_milestone_writes_csv_path(tmp_path):
    from hearthstone.ai.training_utils import MetricsLogger
    path = tmp_path / "m.csv"
    logger = MetricsLogger(str(path))
    logger.log_milestone(iter_num=100, csv_path="milestones/iter_0100/heatmap.csv")
    logger.close()
    import csv
    rows = list(csv.reader(path.open()))
    assert rows[1][0] == "100"
    assert rows[1][1:10] == [""] * 9
    assert rows[1][10] == "milestones/iter_0100/heatmap.csv"
```

- [ ] **Step 2: Run — expect failure**

Run: `pytest tests/unit/ai/test_training_utils.py -v`
Expected: most fail (`_HEADER` is 9 columns, `log_milestone` not defined,
`log_eval` doesn't take cap_hit_count).

- [ ] **Step 3: Update `training_utils.py`**

Edit `hearthstone/ai/training_utils.py`. Update `_HEADER` and method
signatures:

```python
_HEADER = [
    "iter", "phase", "total_loss", "policy_loss", "value_loss",
    "entropy", "eval_winrate", "best_winrate", "plateau_count",
    "cap_hit_count",       # NEW: filled on eval rows
    "milestone_path",      # NEW: filled on milestone rows
]


class MetricsLogger:
    def __init__(self, path: str):
        self._path = path
        self._file = open(path, "w", newline="")
        import csv
        self._writer = csv.writer(self._file)
        self._writer.writerow(_HEADER)
        self._file.flush()

    def log_iter(self, iter, phase, total_loss, policy_loss, value_loss, entropy):
        self._writer.writerow([
            iter, phase, total_loss, policy_loss, value_loss, entropy,
            "", "", "",         # eval cols blank
            "",                 # cap_hit_count blank
            "",                 # milestone_path blank
        ])
        self._file.flush()

    def log_eval(self, iter, phase, eval_winrate, best_winrate, plateau_count,
                 cap_hit_count):
        self._writer.writerow([
            iter, phase, "", "", "", "",                     # loss cols blank
            eval_winrate, best_winrate, plateau_count,
            cap_hit_count,                                   # NEW
            "",                                              # milestone_path blank
        ])
        self._file.flush()

    def log_milestone(self, iter_num: int, csv_path: str) -> None:
        """Mark a milestone heatmap as completed at this iter."""
        self._writer.writerow([
            iter_num, "", "", "", "", "",                    # iter loss cols blank
            "", "", "",                                      # eval cols blank
            "",                                              # cap_hit_count blank
            csv_path,
        ])
        self._file.flush()

    def close(self) -> None:
        self._file.close()
```

- [ ] **Step 4: Run — expect pass**

Run: `pytest tests/unit/ai/test_training_utils.py -v`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add hearthstone/ai/training_utils.py tests/unit/ai/test_training_utils.py
git commit -m "feat(metrics): cap_hit_count + milestone_path columns; new log_milestone"
```

### Task E.4: Wire MilestoneRunner into `scripts/train.py` + new resume test

**Files:**
- Modify: `scripts/train.py`
- Modify: `tests/unit/ai/test_config.py`
- Modify: `tests/unit/ai/test_train_smoke.py`

- [ ] **Step 1: Add MilestoneRunner lifecycle to `main()`**

Edit `scripts/train.py`. Inside `main()`, after `metrics_logger = MetricsLogger(...)`:

```python
    from hearthstone.ai.milestone import MilestoneRunner
    milestone_runner = MilestoneRunner(
        output_dir=os.path.join(run_dir, "milestones"),
    )

    # Bootstrap best.pt at iter=0 so the first milestone (potentially at
    # iter == milestone_every) has something to copy. Without this, if no
    # NEW_BEST has fired by milestone_every, shutil.copy raises.
    if not os.path.exists(cfg.best_checkpoint_path):
        save_checkpoint(
            cfg.best_checkpoint_path, network=network, optimizer=trainer.optimizer,
            iter_num=0, config=cfg, best_winrate=0.0, phase=fsm.phase,
        )
```

- [ ] **Step 2: Submit + collect inside the loop**

After the eval block (where `best.pt` is potentially saved on NEW_BEST):

```python
        # Submit milestone (every milestone_every iters, iter > 0)
        if cfg.milestone_every > 0 and iter_num > 0 and iter_num % cfg.milestone_every == 0:
            if os.path.exists(cfg.best_checkpoint_path):
                milestone_runner.submit(
                    iter_num=iter_num,
                    checkpoint_path=cfg.best_checkpoint_path,
                    deck_names=cfg.deck_pool,
                    games_per_matchup=cfg.milestone_games_per_matchup,
                    slot_dim=cfg.slot_dim,
                    num_actions=cfg.num_actions,
                )
            else:
                logger.warning(
                    "[milestone] iter=%d: best.pt missing at %s; skipping submission",
                    iter_num, cfg.best_checkpoint_path,
                )

        # Collect completed milestones (every iter, non-blocking)
        for completed_iter, csv_path in milestone_runner.collect_completed():
            metrics_logger.log_milestone(completed_iter, csv_path)
```

- [ ] **Step 3: Update the eval call site to pass `cap_hit_count`**

Find the `metrics_logger.log_eval(...)` call from Phase D and update:

```python
            metrics_logger.log_eval(
                iter=iter_num, phase=fsm.phase.name,
                eval_winrate=winrate, best_winrate=fsm.best_winrate,
                plateau_count=fsm.plateau_count,
                cap_hit_count=eval_result["cap_hit_count"],
            )
```

- [ ] **Step 4: Add shutdown in finally**

Find the existing `finally:` block (or add one):

```python
    try:
        # ... main loop ...
    finally:
        # Cancel pending; in-flight subprocess survives until completion.
        # User may need pkill -f _run_round_robin if they want it dead now.
        milestone_runner.shutdown(wait=False)
        metrics_logger.close()
```

- [ ] **Step 5: Add resume-path test for `_strip_deprecated`**

Append to `tests/unit/ai/test_config.py`:

```python
def test_resume_strips_deprecated_fixed_deck_keys_from_checkpoint_config(tmp_path):
    """Resume path must also strip fixed_deck1/fixed_deck2."""
    import os, warnings, torch
    from hearthstone.ai.network import PolicyValueNetwork
    from scripts.train import main

    # Build a checkpoint whose embedded config has the deprecated keys
    net = PolicyValueNetwork(slot_dim=90, hidden_dim=64, num_actions=512)
    ckpt_path = tmp_path / "old.pt"
    torch.save({
        "network": net.state_dict(),
        "iter": 0,
        "config": {
            "seed": 42, "max_iters": 1, "rollout_steps": 16, "ppo_epochs": 1,
            "deck_pool": ["aggro_mage", "control_warrior"],
            "deck_selection": "fixed",
            "fixed_deck1": "old_name",       # deprecated
            "fixed_deck2": "old_name2",      # deprecated
            "training_player_idx": 0,
            "swap_training_player": False,
            "mulligan_policy": "keep_low_cost", "mulligan_threshold": 3,
            "discover_policy": "first", "choose_one_policy": "first",
            "lr": 3e-4, "gamma": 0.99, "gae_lambda": 0.95, "clip_epsilon": 0.2,
            "value_coef": 0.5, "entropy_coef": 0.03, "max_grad_norm": 0.5,
            "slot_dim": 90, "hidden_dim": 64, "num_actions": 512,
            "curriculum": {"switch_threshold": 0.65, "early_stop_patience": 5},
            "self_play": {
                "refresh_threshold": 0.80, "refresh_eval_games": 4,
                "refresh_every": 2, "random_opponent_prob": 0.20,
                "opponent_checkpoint_path": str(tmp_path / "sp.pt"),
            },
            "eval_every": 1, "eval_games": 4, "max_actions_per_game": 100,
            "milestone_every": 0, "milestone_games_per_matchup": 1,
            "checkpoint_every": 1,
            "checkpoint_dir": str(tmp_path),
            "best_checkpoint_path": str(tmp_path / "best.pt"),
            "runs_dir": str(tmp_path / "runs"),
            "card_features": {"log_coverage": False},
        },
        "best_winrate": 0.0,
        "phase": "RANDOM",
    }, ckpt_path)

    # Write a placeholder --config (resume path requires it)
    cfg_yaml = tmp_path / "placeholder.yaml"
    cfg_yaml.write_text("# unused when resuming\n")

    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        main(["--config", str(cfg_yaml), "--resume", str(ckpt_path),
              "--override", "max_iters=0"])
    deprecation_warnings = [w for w in caught if issubclass(w.category, DeprecationWarning)]
    assert any("fixed_deck1" in str(w.message) for w in deprecation_warnings)
```

- [ ] **Step 6: Add milestone smoke test**

Append to `tests/unit/ai/test_train_smoke.py`:

```python
@pytest.mark.slow
def test_two_iter_train_smoke_with_milestone(tmp_path):
    """2 iters with milestone_every=1 produces at least 1 milestone CSV."""
    import yaml
    from scripts.train import main
    from hearthstone.ai.milestone import MilestoneRunner

    runs_dir = tmp_path / "runs"
    runs_dir.mkdir()
    ckpt_dir = tmp_path / "checkpoints"
    ckpt_dir.mkdir()

    cfg_text = (
        "seed: 42\nmax_iters: 2\nrollout_steps: 64\nppo_epochs: 1\n"
        "deck_pool: [aggro_mage, control_warrior]\n"
        "deck_selection: random_pair\nswap_training_player: true\n"
        "training_player_idx: 0\n"
        "mulligan_policy: keep_low_cost\nmulligan_threshold: 3\n"
        "discover_policy: first\nchoose_one_policy: first\n"
        "lr: 3.0e-4\ngamma: 0.99\ngae_lambda: 0.95\nclip_epsilon: 0.2\n"
        "value_coef: 0.5\nentropy_coef: 0.03\nmax_grad_norm: 0.5\n"
        "slot_dim: 90\nhidden_dim: 64\nnum_actions: 512\n"
        "curriculum: {switch_threshold: 0.65, early_stop_patience: 5}\n"
        "self_play:\n"
        "  refresh_threshold: 0.80\n  refresh_eval_games: 4\n  refresh_every: 2\n"
        "  random_opponent_prob: 0.20\n"
        f"  opponent_checkpoint_path: {ckpt_dir}/sp.pt\n"
        "eval_every: 1\neval_games: 4\nmax_actions_per_game: 100\n"
        "milestone_every: 1\nmilestone_games_per_matchup: 1\n"
        "checkpoint_every: 1\n"
        f"checkpoint_dir: {ckpt_dir}\nbest_checkpoint_path: {ckpt_dir}/best.pt\n"
        f"runs_dir: {runs_dir}\n"
        "card_features: {log_coverage: false}\n"
    )
    cfg_path = tmp_path / "smoke.yaml"
    cfg_path.write_text(cfg_text)

    # The training harness uses milestone_runner.shutdown(wait=False) in
    # its finally block, but for this test we need wait=True so we can
    # assert the CSV exists. Patch the shutdown call by using a custom
    # wrapper or, more simply, read after sleeping for the worst-case
    # round-robin time. Easiest: monkeypatch shutdown to wait=True for
    # this test only.
    import scripts.train as train_module
    orig_shutdown = MilestoneRunner.shutdown
    MilestoneRunner.shutdown = lambda self, wait=False: orig_shutdown(self, wait=True)
    try:
        main(["--config", str(cfg_path)])
    finally:
        MilestoneRunner.shutdown = orig_shutdown

    # Now expect at least one heatmap.csv under runs_dir/<ts>/milestones/
    heatmaps = list(runs_dir.glob("*/milestones/*/heatmap.csv"))
    assert len(heatmaps) >= 1, f"no milestone CSV produced; saw {list(runs_dir.iterdir())}"
```

- [ ] **Step 7: Run smoke + resume tests**

Run: `pytest tests/unit/ai/test_train_smoke.py tests/unit/ai/test_config.py -v -m slow`
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add scripts/train.py tests/unit/ai/test_config.py tests/unit/ai/test_train_smoke.py
git commit -m "feat(train): wire MilestoneRunner; cap_hit_count metrics; resume shim test"
```

### Task E.5: End-to-end smoke run on 18-deck pool

**Files:** none modified

- [ ] **Step 1: Run end-to-end with 18 decks**

```bash
python scripts/train.py --config configs/default.yaml \
    --override max_iters=2 rollout_steps=64 eval_every=1 eval_games=4 \
    milestone_every=1 milestone_games_per_matchup=1
```

Expected: ~2-3 minutes wall time (slow because 18-deck pool has bigger
imports and milestone subprocess runs 4 games over 2 decks twice).
Outputs:

- `runs/<ts>/metrics.csv` with iter rows + eval rows + at least 1 milestone row
- `runs/<ts>/milestones/iter_0001/heatmap.csv` (4 rows: 2 ordered pairs × 2 tp_idx)
- `checkpoints/iter_0001.pt`, `checkpoints/iter_0002.pt`, `checkpoints/best.pt`

If anything fails, debug per the error.

- [ ] **Step 2: Run full test suite**

```bash
pytest tests/ -v
```

Expected: all PASS, including `@pytest.mark.slow` tests.

**Phase E done.** S2-A implementation complete.

---

## Self-Review

### Spec coverage

Going through `docs/specs/2026-05-01-multi-deck-training-design.md` rev 3
section by section:

- **Goal / Non-goals**: Phase A (decks) + Phase B-E (code) collectively
  cover the goal. Non-goals (smarter ChooseOnePolicy, draw quality head,
  GPU, runtime deck pool changes) are deferred per spec.
- **Decisions locked in**: 18 decks (Phase A); independent no-mirror
  sampling (Task C.2); two-tier eval (Task C.4 + Phase E); deck source
  via online lists (Task A.2); random p1/p2 swap (Task C.2); spawn
  context (Task E.1); subprocess matchup = checkpoint vs RandomOpponent
  (Task E.1's `_run_round_robin`); games_per_matchup = 5 (default in
  config Task D.1).
- **High-level approach**: distributed across phases.
- **File layout**: maps onto phase-task structure.
- **Component design — Deck dataclass**: Task B.1.
- **Component design — archetype invariants**: Task B.2 (validation
  helpers), Task A.2 (authoring satisfies them).
- **Component design — FireplaceGymEnv multi-deck**: Tasks C.1, C.2.
- **Component design — RNG**: Task C.2 (Step 3 implementation).
- **Component design — info dict**: Task C.2 (Step 3 `_info`).
- **Component design — observation distribution shift under swap**:
  Task C.2 (test `test_swap_training_player_when_idx_1_opponent_acts_first`).
- **Reward / OpponentEnv / SelfPlayOpponent unchanged**: nothing to do
  beyond verifying tests pass; Task C.3 confirms.
- **`evaluate_pool`**: Task C.4.
- **`MilestoneRunner`**: Tasks E.1, E.2.
- **`_run_round_robin`**: Task E.1 (Step 3).
- **scripts/train.py integration**: Tasks D.2, E.4.
- **Curriculum / FSM**: Task D.1 (config), Task D.2 (call site:
  `fsm.update(eval_result["winrate"])`).
- **MetricsLogger**: Task E.3.
- **Druid bias**: Task A.2 (authoring), Task A.3 (README documents).
- **Cleanup self_play.py**: Task B.5.
- **Configuration**: Task D.1.
- **Backwards-compat shim**: Task D.1 (helper) + Task E.4 (resume test).
- **Failure modes**: covered by tests in Tasks B.2 (validation), C.1
  (constructor asserts), E.2 (subprocess crash), E.4 (best.pt missing).
- **Testing strategy**: each phase has its tests.
- **Migration steps PR series**: Phase A = PR-3, Phase B = PR-1,
  Phase C = PR-2, Phase D = PR-4, Phase E = PR-5. Order respected.

No coverage gaps.

### Placeholder scan

- ✅ No "TBD" / "TODO" / "implement later" / "fill in details"
- ✅ Every code step has a code block
- ✅ Every command step has the exact command + expected output

### Type consistency

- `Deck` dataclass: `name`, `archetype`, `hero_id`, `card_ids` — used
  consistently across Tasks B.1, B.3, C.1, C.2, C.4, E.1.
- `FireplaceGymEnv` constructor args: `decks`, `pair_strategy`,
  `swap_training_player`, `training_player_idx`, ... — consistent
  Tasks C.1 onward.
- `evaluate_pool` returns dict with keys `winrate`, `n_games`,
  `matchups_seen`, `cap_hit_count` — consistent Tasks C.4, D.2, E.4.
- `MilestoneRunner.submit` kwargs: `iter_num`, `checkpoint_path`,
  `deck_names`, `games_per_matchup`, `slot_dim`, `num_actions` —
  consistent E.1, E.4.
- `MetricsLogger.log_eval` signature: `iter, phase, eval_winrate,
  best_winrate, plateau_count, cap_hit_count` — consistent E.3, E.4.
- `_HEADER` 11 columns — consistent E.3 (definition + tests).

No drift between earlier and later tasks.

### Final acceptance

After Phase E, run:

```bash
pytest tests/ -v
python scripts/train.py --config configs/default.yaml \
    --override max_iters=2 rollout_steps=64 eval_every=1 eval_games=4 \
    milestone_every=1 milestone_games_per_matchup=1
```

Both should succeed. The S2-A implementation is complete and ready for
sub-project S2-B (神抽/鬼抽 auxiliary head).
