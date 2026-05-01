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
