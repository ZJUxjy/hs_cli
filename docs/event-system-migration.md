# Event System Migration Guide

## Overview

The event system has been unified to match Python fireplace's Action-based architecture.

## Key Changes

### Before (Dual System)
```typescript
// System 1: EventManager
entity.on(GameEvent.DAMAGE, handler);

// System 2: Card Scripts
cardScriptsRegistry.register('CARD_001', {
  events: {
    DAMAGE: (ctx) => { ... }
  }
});
```

### After (Unified System)
```typescript
// Action-based event listeners
const listener = new Damage(SELF).on(new Draw(CONTROLLER));
entity['_events'].push(listener);

// Card scripts still work (backward compatible)
cardScriptsRegistry.register('CARD_001', {
  play: (ctx) => {
    const damage = new Damage(3);
    damage.trigger(ctx.target!);
  }
});
```

## Action Block System

Actions are now executed within blocks:
- `game.actionBlock()` - Execute actions with proper block type
- Automatic aura refresh when action stack empties
- Automatic death processing

## Event Timing

- `EventListenerAt.ON` - Trigger before action effect
- `EventListenerAt.AFTER` - Trigger after action effect
