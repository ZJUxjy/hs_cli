# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

js-fireplace is a TypeScript rewrite of the Python fireplace Hearthstone simulator. It is a rule-engine-first card game simulator, not primarily a frontend client.

## Common Commands

```bash
# Install dependencies
npm ci

# Build TypeScript (CommonJS output to dist/)
npm run build
npm run build:watch

# Run tests
npm test                    # Run all tests
npm test -- --runInBand     # Run sequentially (slower but more stable)
npm test -- path/to/test.ts # Run single test file
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report

# Linting
npm run lint
npm run lint:fix

# Web UI development (Vite + React)
npm run dev:web             # Dev server on http://127.0.0.1:3000
npm run build:web           # Build to dist-web/
npm run preview:web

# Clean build artifacts
npm run clean
```

## High-Level Architecture

The codebase is organized in five layers:

### 1. Data Layer (`src/cards/`)
- `CardDefs.xml` - Source of truth for 34,179 cards (must be copied from fireplace repo)
- `xmlparser.ts` - Parses Blizzard-style XML with i18n support (14 languages)
- `loader.ts` - Converts XML to internal `CardDefinition` objects

### 2. Runtime Model Layer (`src/core/`)
- `Entity` - Base class with UUID, buff hooks, damage/heal extension points
- `Card` - Runtime card wrapper with `isPlayable()`, `canTarget()`
- `Player` - Owns zones (hand, deck, field), mana, hero
- `Game` - Match coordinator with turn flow, event dispatch, death processing

### 3. Rule Primitive Layer (`src/actions/`)
State mutation actions used by card scripts:
- `Damage`, `Draw`, `Summon`, `Morph`, `Destroy`, `Heal`, `Play`, `Attack`
- `Buff` - For attribute modifiers (ATK, HEALTH, taunt, divineShield)
- `Bounce`, `Steal`, `Remove`, `PutOnBoard` - Board manipulation

### 4. Validation & DSL Layer (`src/targeting/`, `src/dsl/`)
- `targetvalidator.ts` - Validates play requirements (friendly/enemy/minion targets)
- `selector.ts` - Reusable selectors: `ALL_MINIONS`, `FRIENDLY_MINIONS`, `ENEMY_CHARACTERS`
- `lazynum.ts`, `conditions.ts` - Conditional effects and value calculation

### 5. Card Script Layer (`src/cards/mechanics/`)
Card-specific effects registered by card ID:
```typescript
cardScriptsRegistry.register('CS2_025', {
  requirements: { [PlayReq.REQ_TARGET_TO_PLAY]: 0 },
  play: (ctx: ActionContext) => {
    const damage = new Damage(ctx.source, ctx.target!, 6);
    damage.trigger(ctx.source);
  },
});
```

## Important Code Patterns

### Module System
- Uses **CommonJS** (`"module": "CommonJS"` in tsconfig.json)
- Card scripts use `require()` for actions to avoid circular dependencies:
  ```typescript
  const { Damage } = require('../../../actions/damage');
  ```

### Card Script Registration
All card scripts are registered in `src/cards/mechanics/index.ts` via `cardScriptsRegistry.register(cardId, script)`. The main `src/index.ts` imports all mechanics files to ensure registration runs.

### Action Execution Flow
1. `Card.isPlayable()` - checks legality via `TargetValidator`
2. `Play` action - generic "play card" state transition
3. `executePlay()` - looks up and runs card script
4. Primitive actions (`Damage`, `Summon`, etc.) - actual state mutation
5. `Game` cleanup - aura refresh, death processing

### Testing
Jest configuration has two projects:
- **node**: For backend/game logic tests (`tests/**/*.test.ts`)
- **dom**: For React UI tests (`src/ui/**/*.test.tsx`) using jsdom

## Key Files for Understanding

Reading order to understand the execution flow:
1. `src/index.ts` - Exports and module loading
2. `src/core/entity.ts` - Base entity class
3. `src/core/card.ts` - Runtime cards
4. `src/core/player.ts` - Player state
5. `src/core/game.ts` - Game orchestration
6. `src/targeting/targetvalidator.ts` - Target legality
7. `src/actions/play.ts` - Base play action
8. `src/cards/mechanics/index.ts` - Script registry
9. `src/cards/mechanics/classic/mage.ts` - Example card implementations

## Development Notes

- **CardDefs.xml**: The 96MB card definitions file must be obtained from the original fireplace repo and placed in `src/cards/`. It is excluded from git via `.gitignore`.
- **TypeScript strict mode**: Enabled but `noUnusedLocals` and `noUnusedParameters` are disabled to accommodate the translation workflow.
- **DSL compatibility**: Selectors support both object-style (`selector.eval(...)`) and function-style (callable) usage for backward compatibility.
- **Event system**: Unified Action-based event system matching Python fireplace architecture.

## Unified Event System

The event system has been unified to use Action-based events matching Python fireplace's architecture.

### Action-based Events

Event listeners are now created using Action classes:
```typescript
const listener = new Damage(SELF).on(new Draw(CONTROLLER));
entity['_events'].push(listener);
```

### ON/AFTER Timing

Events support two timing points:
- `EventListenerAt.ON` - Trigger before action effect
- `EventListenerAt.AFTER` - Trigger after action effect

### Action Block System

Actions execute within blocks for proper game state management:
```typescript
game.actionBlock(() => {
  const damage = new Damage(source, target, 3);
  damage.trigger(source);
});
```

Features:
- Automatic aura refresh when action stack empties
- Automatic death processing
- Proper block type tracking (PLAY, ATTACK, TRIGGER, etc.)

### Migration Notes

The old dual system (EventManager + Card Script events) has been unified:
- Card scripts remain backward compatible
- New event listeners use Action-based approach
- See `docs/event-system-migration.md` for detailed migration guide
