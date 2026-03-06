# js-fireplace

TypeScript rewrite of [fireplace](https://github.com/jleclanche/fireplace) - a Hearthstone simulator written in Python.

## Overview

This project aims to provide a complete TypeScript implementation of the fireplace Hearthstone simulator, enabling card game simulations in JavaScript/TypeScript environments (Node.js, browsers, etc.).

## Features

- **Card Definition System**: Load cards from XML (CardDefs.xml with 34,179 cards)
- **i18n Support**: 14 languages for card names and descriptions
- **Action System**: Damage, Draw, Summon, Buff, Heal, Destroy, Silence, Morph, etc.
- **Event System**: Triggers for DAMAGE, DEATH, PLAY, TURN_START, TURN_END, etc.
- **Selector DSL**: Target entities with selectors (FRIENDLY_MINIONS, ENEMY_MINIONS, etc.)
- **Card Scripts Registry**: Register and execute card mechanics

## Installation

```bash
npm install
npm run build
npm test
```

## Project Structure

```
src/
├── actions/           # Action classes (Damage, Draw, Summon, etc.)
├── aura/              # Aura system
├── cards/
│   ├── mechanics/     # Card scripts
│   │   └── classic/   # Classic set cards
│   ├── loader.ts      # Card loading from XML
│   └── xmlparser.ts   # XML parsing
├── core/              # Core game entities
├── dsl/               # Domain-specific language (selectors, lazy values)
├── enums/             # Game enums (CardClass, CardType, Zone, etc.)
├── i18n/              # Internationalization
├── targeting/         # Targeting system
└── utils/             # Utility functions
```

## Current Progress

### Completed

| Component | Status | Details |
|-----------|--------|---------|
| XML Parser | ✅ Complete | Parse CardDefs.xml (34,179 cards, 14 languages) |
| Card Loader | ✅ Complete | Load and query cards by ID, class, set, etc. |
| Action System | ✅ Complete | 14 action types implemented |
| Event System | ✅ Complete | 12 event types |
| Selector DSL | ✅ Complete | Basic selectors for targeting |
| Card Scripts Registry | ✅ Complete | Register and execute card mechanics |

### Card Sets Translation Progress

| Set | Status | Cards | Notes |
|-----|--------|-------|-------|
| **Classic** | ✅ Complete | ~500 | All 10 classes + Neutral |
| Basic | ⏳ Pending | ~200 | Foundation cards |
| Naxxramas | ⏳ Pending | ~30 | Adventure cards |
| Goblins vs Gnomes | ⏳ Pending | ~120 | Expansion |
| Blackrock Mountain | ⏳ Pending | ~31 | Adventure |
| The Grand Tournament | ⏳ Pending | ~132 | Expansion |
| League of Explorers | ⏳ Pending | ~45 | Adventure |
| Whispers of the Old Gods | ⏳ Pending | ~134 | Expansion |
| One Night in Karazhan | ⏳ Pending | ~45 | Adventure |
| Mean Streets of Gadgetzan | ⏳ Pending | ~132 | Expansion |
| Journey to Un'Goro | ⏳ Pending | ~135 | Expansion |
| Knights of the Frozen Throne | ⏳ Pending | ~135 | Expansion |
| Kobolds & Catacombs | ⏳ Pending | ~135 | Expansion |
| The Witchwood | ⏳ Pending | ~135 | Expansion |
| The Boomsday Project | ⏳ Pending | ~135 | Expansion |
| Rastakhan's Rumble | ⏳ Pending | ~135 | Expansion |
| Rise of Shadows | ⏳ Pending | ~135 | Expansion |
| ... | ⏳ Pending | ... | And more expansions |

### Classic Set Details

| Class | Cards | Status |
|-------|-------|--------|
| Mage | 30+ | ✅ |
| Druid | 45+ | ✅ |
| Hunter | 40+ | ✅ |
| Warrior | 35+ | ✅ |
| Paladin | 35+ | ✅ |
| Priest | 50+ | ✅ |
| Rogue | 40+ | ✅ |
| Shaman | 30+ | ✅ |
| Warlock | 40+ | ✅ |
| Demon Hunter | 9 | ✅ |
| Neutral Common | 45 | ✅ |
| Neutral Epic | 60 | ✅ |
| Neutral Legendary | 43 | ✅ |

## Roadmap

### Phase 1: Core Systems (Completed)
- [x] XML Parser for CardDefs.xml
- [x] Card Loader with i18n
- [x] Action system (Damage, Draw, Summon, Buff, Heal, etc.)
- [x] Event system for triggers
- [x] Selector DSL

### Phase 2: Classic Set (Completed)
- [x] Translate all Classic card scripts
- [x] Implement all card mechanics for Classic set

### Phase 3: Basic Set (Next)
- [ ] Translate Basic set card scripts (~200 cards)
- [ ] These are simpler foundation cards, good for testing

### Phase 4: Game Engine
- [ ] Complete Game class implementation
- [ ] Turn management
- [ ] Mana system
- [ ] Combat system
- [ ] Secret system

### Phase 5: Expansions & Adventures
- [ ] Naxxramas
- [ ] Goblins vs Gnomes
- [ ] Blackrock Mountain
- [ ] The Grand Tournament
- [ ] And more...

### Phase 6: Testing & Validation
- [ ] Integration tests with actual game scenarios
- [ ] Validate card interactions
- [ ] Performance optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

This project is for educational purposes. Hearthstone is a trademark of Blizzard Entertainment.

## References

- [fireplace](https://github.com/jleclanche/fireplace) - Original Python implementation
- [Hearthstone Card Definitions](https://hearthstonejson.com/) - Card data source
