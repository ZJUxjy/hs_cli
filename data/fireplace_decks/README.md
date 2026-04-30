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
