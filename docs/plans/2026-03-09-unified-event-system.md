# Unified Event System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port Python fireplace's complete Action-based event system to TypeScript, unifying the current dual event systems.

**Architecture:** Replace the current EventManager + cardScriptsRegistry dual system with a unified Action-based event system where Actions broadcast events that match against Entity's event listeners with ON/AFTER timing, complete with Action Block management for proper aura/ death processing.

**Tech Stack:** TypeScript, CommonJS, Jest

---

## Background

Current TypeScript implementation has two parallel event systems:
1. `EventManager` (centralized pub/sub with EventType enum)
2. `cardScriptsRegistry` (card script event registration)

Python fireplace has a unified system:
- Actions are event sources (`Action.broadcast()`)
- Entities store event listeners (`entity.events`)
- Listeners match via `Action.matches()` with Selector DSL
- Support ON (before) and AFTER (after) timing
- Action Block system manages nested actions and triggers aura refresh/death processing

---

## Phase 1: Core Action Infrastructure

### Task 1: Create ActionArg Base Class

**Files:**
- Create: `src/actions/actionarg.ts`
- Test: `tests/actions/actionarg.test.ts`

**Step 1: Write the failing test**

```typescript
import { ActionArg } from '../../src/actions/actionarg';

describe('ActionArg', () => {
  test('should create ActionArg with metadata', () => {
    const arg = new ActionArg();
    arg['_setup'](0, 'testArg', { name: 'TestAction' });

    expect(arg.index).toBe(0);
    expect(arg.name).toBe('testArg');
    expect(arg.owner).toEqual({ name: 'TestAction' });
  });

  test('evaluate should return null by default', () => {
    const arg = new ActionArg();
    expect(arg.evaluate({} as any)).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/actions/actionarg.test.ts`
Expected: FAIL - "Cannot find module"

**Step 3: Write minimal implementation**

```typescript
// src/actions/actionarg.ts
import type { Entity } from '../core/entity';

export class ActionArg {
  public index: number = 0;
  public name: string = '';
  public owner: unknown = null;

  _setup(index: number, name: string, owner: unknown): void {
    this.index = index;
    this.name = name;
    this.owner = owner;
  }

  evaluate(_source: Entity): unknown {
    return null;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/actions/actionarg.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/actions/actionarg.test.ts src/actions/actionarg.ts
git commit -m "feat: add ActionArg base class for action arguments"
```

---

### Task 2: Create EventListener Class

**Files:**
- Create: `src/actions/eventlistener.ts`
- Modify: `src/actions/base.ts` (update existing)
- Test: `tests/actions/eventlistener.test.ts`

**Step 1: Write the failing test**

```typescript
import { EventListener, EventListenerAt } from '../../src/actions/eventlistener';
import { Action } from '../../src/actions/base';

describe('EventListener', () => {
  test('should create EventListener with ON timing', () => {
    const trigger = { constructor: { name: 'Damage' } } as Action;
    const actions: Action[] = [];
    const listener = new EventListener(trigger, actions, EventListenerAt.ON);

    expect(listener.trigger).toBe(trigger);
    expect(listener.actions).toBe(actions);
    expect(listener.at).toBe(EventListenerAt.ON);
    expect(listener.once).toBe(false);
  });

  test('should create EventListener with AFTER timing', () => {
    const trigger = { constructor: { name: 'Play' } } as Action;
    const actions: Action[] = [];
    const listener = new EventListener(trigger, actions, EventListenerAt.AFTER);

    expect(listener.at).toBe(EventListenerAt.AFTER);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/actions/eventlistener.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/actions/eventlistener.ts
import type { Action } from './base';

export enum EventListenerAt {
  ON = 1,
  AFTER = 2,
}

export class EventListener {
  public trigger: Action;
  public actions: Action[];
  public at: EventListenerAt;
  public once: boolean = false;

  constructor(trigger: Action, actions: Action[], at: EventListenerAt) {
    this.trigger = trigger;
    this.actions = actions;
    this.at = at;
  }
}
```

**Step 4: Update base.ts exports**

```typescript
// src/actions/base.ts
export { EventListener, EventListenerAt } from './eventlistener';
export { ActionArg } from './actionarg';
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/actions/eventlistener.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add tests/actions/eventlistener.test.ts src/actions/eventlistener.ts src/actions/base.ts
git commit -m "feat: add EventListener class with ON/AFTER timing"
```

---

### Task 3: Refactor Action Base Class with Broadcast

**Files:**
- Modify: `src/actions/base.ts`
- Test: `tests/actions/base.test.ts`

**Step 1: Write the failing test**

```typescript
import { Action, EventListener, EventListenerAt } from '../../src/actions/base';
import type { Entity } from '../../src/core/entity';
import type { Game } from '../../src/core/game';

describe('Action', () => {
  class TestAction extends Action {
    constructor(private value: number = 0) {
      super();
    }

    getArgs(_source: Entity): unknown[] {
      return [this.value];
    }

    do(_source: Entity, value: number): void {
      console.log('TestAction executed with', value);
    }
  }

  test('should store args and callbacks', () => {
    const action = new TestAction(5);
    expect(action['_args']).toEqual([5]);
  });

  test('should create ON event listener', () => {
    const action = new TestAction(5);
    const callback = new TestAction(10);
    const listener = action.on(callback);

    expect(listener).toBeInstanceOf(EventListener);
    expect(listener.at).toBe(EventListenerAt.ON);
    expect(listener.actions).toContain(callback);
  });

  test('should create AFTER event listener', () => {
    const action = new TestAction(5);
    const callback = new TestAction(10);
    const listener = action.after(callback);

    expect(listener.at).toBe(EventListenerAt.AFTER);
  });

  test('should match action with same args', () => {
    const action1 = new TestAction(5);
    const action2 = new TestAction(5);
    const mockEntity = {} as Entity;
    const mockSource = {} as Entity;

    expect(action1.matches(mockEntity, mockSource, [5])).toBe(true);
    expect(action1.matches(mockEntity, mockSource, [10])).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/actions/base.test.ts`
Expected: FAIL - missing `on()`, `after()`, `matches()` methods

**Step 3: Write implementation**

```typescript
// src/actions/base.ts
import type { Entity } from '../core/entity';
import { EventListener, EventListenerAt } from './eventlistener';
import { ActionArg } from './actionarg';

export { EventListener, EventListenerAt } from './eventlistener';
export { ActionArg } from './actionarg';

export abstract class Action {
  protected _args: unknown[] = [];
  protected _kwargs: Record<string, unknown> = {};
  public callback: Action[] = [];
  public times: number = 1;
  public eventQueue: [Entity, unknown[]][] = [];

  constructor(...args: unknown[]) {
    this._args = args;
  }

  abstract getArgs(source: Entity): unknown[];
  abstract do(source: Entity, ...args: unknown[]): void;

  on(...actions: Action[]): EventListener {
    return new EventListener(this, actions, EventListenerAt.ON);
  }

  after(...actions: Action[]): EventListener {
    return new EventListener(this, actions, EventListenerAt.AFTER);
  }

  then(...args: Action[]): Action {
    const ret = new (this.constructor as any)(...this._args, ...this._kwargs);
    ret.callback = args;
    ret.times = this.times;
    return ret;
  }

  trigger(source: Entity): unknown[] {
    const args = this.getArgs(source);
    this.do(source, ...args);
    return [];
  }

  matches(entity: Entity, source: Entity, args: unknown[]): boolean {
    const matchArgs = this._args;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const match = matchArgs[i];

      if (match === null || match === undefined) {
        continue;
      }
      if (arg === null || arg === undefined) {
        return false;
      }

      // Handle Selector matching (will be implemented later)
      if (typeof (match as any)?.eval === 'function') {
        const result = (match as any).eval([arg], entity);
        if (!result || result.length === 0 || result[0] !== arg) {
          return false;
        }
      } else if (typeof match === 'function') {
        if (!(match as Function)(arg)) {
          return false;
        }
      } else if (arg !== match) {
        return false;
      }
    }

    return true;
  }

  protected broadcastSingle(entity: Entity, source: Entity, at: EventListenerAt, args: unknown[]): void {
    for (const event of entity.events) {
      if (!(event as any).trigger || (event as any).at !== at) {
        continue;
      }

      const eventTrigger = (event as any).trigger;
      const listenerActions = (event as any).actions;

      if (eventTrigger.constructor === this.constructor && eventTrigger.matches(entity, source, args)) {
        console.log(`[Event] ${entity.constructor.name} triggers off ${this.constructor.name}`);
        entity.triggerEvent(source, event as any, args);
      }
    }
  }

  broadcast(source: Entity, at: EventListenerAt, ...args: unknown[]): void {
    const game = (source as any).game as Game;
    if (!game) return;

    game.actionStart('TRIGGER', source, 0, undefined);

    // Broadcast to all entities
    for (const entity of game.entities) {
      this.broadcastSingle(entity, source, at, args);
    }

    // Broadcast to hands
    for (const hand of game.hands) {
      for (const entity of hand) {
        this.broadcastSingle(entity as any, source, at, args);
      }
    }

    // Broadcast to decks
    for (const deck of game.decks) {
      for (const entity of deck) {
        this.broadcastSingle(entity as any, source, at, args);
      }
    }

    game.actionEnd('TRIGGER', source);
  }

  queueBroadcast(obj: Entity, args: unknown[]): void {
    this.eventQueue.push([obj, args]);
  }

  resolveBroadcasts(): void {
    for (const [obj, args] of this.eventQueue) {
      (this as any).broadcast(obj, ...args);
    }
    this.eventQueue = [];
  }
}

export { EventListener, EventListenerAt };
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/actions/base.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/actions/base.test.ts src/actions/base.ts
git commit -m "feat: refactor Action base class with broadcast and matching"
```

---

## Phase 2: Action Block System

### Task 4: Implement Action Block Types

**Files:**
- Create: `src/enums/blocktype.ts`
- Modify: `src/enums/index.ts`

**Step 1: Write the failing test**

```typescript
// tests/enums/blocktype.test.ts
import { BlockType } from '../../src/enums/blocktype';

describe('BlockType', () => {
  test('should have all block types defined', () => {
    expect(BlockType.ATTACK).toBeDefined();
    expect(BlockType.JOUST).toBeDefined();
    expect(BlockType.POWER).toBeDefined();
    expect(BlockType.TRIGGER).toBeDefined();
    expect(BlockType.DEATHS).toBeDefined();
    expect(BlockType.PLAY).toBeDefined();
    expect(BlockType.FATALITY).toBeDefined();
    expect(BlockType.RITUAL).toBeDefined();
    expect(BlockType.REVEAL_CARD).toBeDefined();
    expect(BlockType.GAME_RESET).toBeDefined();
    expect(BlockType.MOVE_MINION).toBeDefined();
  });
});
```

**Step 2: Run test**

Run: `npm test -- tests/enums/blocktype.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/enums/blocktype.ts
export enum BlockType {
  ATTACK = 1,
  JOUST = 2,
  POWER = 3,
  TRIGGER = 5,
  DEATHS = 6,
  PLAY = 7,
  FATIGUE = 8,
  RITUAL = 9,
  REVEAL_CARD = 10,
  GAME_RESET = 11,
  MOVE_MINION = 12,
}
```

**Step 4: Export from index**

```typescript
// Add to src/enums/index.ts
export { BlockType } from './blocktype';
```

**Step 5: Run test and commit**

Run: `npm test -- tests/enums/blocktype.test.ts`
Expected: PASS

```bash
git add tests/enums/blocktype.test.ts src/enums/blocktype.ts src/enums/index.ts
git commit -m "feat: add BlockType enum for action blocks"
```

---

### Task 5: Add Action Stack Management to Game

**Files:**
- Modify: `src/core/game.ts`
- Test: `tests/core/game-action-stack.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/core/game-action-stack.test.ts
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { BlockType } from '../../src/enums/blocktype';

describe('Game Action Stack', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player 1');
    player2 = new Player('Player 2');
    game = new Game({ players: [player1, player2] });
  });

  test('should initialize action stack to 0', () => {
    expect(game['_actionStack']).toBe(0);
  });

  test('should increment action stack on actionStart', () => {
    game.actionStart(BlockType.TRIGGER, player1, 0);
    expect(game['_actionStack']).toBe(1);
  });

  test('should decrement action stack on actionEnd', () => {
    game.actionStart(BlockType.TRIGGER, player1, 0);
    game.actionEnd(BlockType.TRIGGER, player1);
    expect(game['_actionStack']).toBe(0);
  });

  test('should handle PLAY type differently (not increment stack)', () => {
    game.actionStart(BlockType.PLAY, player1, 0);
    expect(game['_actionStack']).toBe(0);
    game.actionEnd(BlockType.PLAY, player1);
    expect(game['_actionStack']).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/game-action-stack.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// Add to src/core/game.ts in Game class

export class Game extends Entity {
  // ... existing code ...

  private _actionStack: number = 0;

  actionStart(type: BlockType, source: Entity, index: number, target?: Entity): void {
    this.manager.actionStart(type, source, index, target);
    if (type !== BlockType.PLAY) {
      this._actionStack++;
    }
  }

  actionEnd(type: BlockType, source: Entity): void {
    this.manager.actionEnd(type, source);

    if (this.ended) {
      throw new Error('The game has ended.');
    }

    if (type !== BlockType.PLAY) {
      this._actionStack--;
    }

    if (this._actionStack === 0) {
      console.log('[Game] Empty stack, refreshing auras and processing deaths');
      this.refreshAuras();
      this.processDeaths();
    }
  }

  // Add missing properties
  get entities(): Entity[] {
    return [this, ...this.players[0].entities, ...this.players[1].entities];
  }

  get hands(): Card[][] {
    return [this.players[0].hand, this.players[1].hand];
  }

  get decks(): Card[][] {
    return [this.players[0].deck, this.players[1].deck];
  }

  get ended(): boolean {
    return this.state === State.COMPLETE;
  }

  refreshAuras(): void {
    // Implementation placeholder - will be filled in Task 8
  }

  processDeaths(): void {
    // Implementation placeholder - will be filled in Task 7
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/core/game-action-stack.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/core/game-action-stack.test.ts src/core/game.ts
git commit -m "feat: add action stack management to Game class"
```

---

### Task 6: Implement Action Block Methods

**Files:**
- Modify: `src/core/game.ts`
- Test: `tests/core/game-action-block.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/core/game-action-block.test.ts
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { BlockType } from '../../src/enums/blocktype';
import { Action } from '../../src/actions/base';

describe('Game Action Block', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player 1');
    player2 = new Player('Player 2');
    game = new Game({ players: [player1, player2] });
  });

  test('should execute action block', () => {
    const mockAction = {
      trigger: jest.fn().mockReturnValue(['result']),
      getArgs: jest.fn().mockReturnValue([]),
      do: jest.fn(),
    } as unknown as Action;

    const results = game.actionBlock(player1, [mockAction], BlockType.TRIGGER);

    expect(mockAction.trigger).toHaveBeenCalled();
    expect(results).toEqual([['result']]);
  });

  test('should handle trigger method with event args', () => {
    const mockSource = { game } as unknown as Entity;
    const mockAction = {
      trigger: jest.fn().mockReturnValue(['triggered']),
    } as unknown as Action;

    const results = game.trigger(mockSource, [mockAction], ['arg1', 'arg2']);

    expect(mockAction.trigger).toHaveBeenCalled();
    expect(results).toEqual([['triggered']]);
  });

  test('should queue actions with event args', () => {
    const mockSource = { game, eventArgs: null } as unknown as Entity;
    const mockAction = {
      trigger: jest.fn().mockReturnValue(['queued']),
    } as unknown as Action;

    const results = game.queueActions(mockSource, [mockAction], ['event', 'args']);

    expect(mockSource.eventArgs).toEqual(['event', 'args']);
    expect(results).toEqual([['queued']]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/game-action-block.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// Add to src/core/game.ts in Game class

  actionBlock(
    source: Entity,
    actions: Action[],
    type: BlockType,
    index: number = -1,
    target?: Entity,
    eventArgs?: unknown
  ): unknown[] {
    this.actionStart(type, source, index, target);

    let ret: unknown[] = [];
    if (actions && actions.length > 0) {
      ret = this.queueActions(source, actions, eventArgs);
    }

    this.actionEnd(type, source);
    return ret;
  }

  trigger(source: Entity, actions: Action[], eventArgs?: unknown): unknown[] {
    return this.actionBlock(source, actions, BlockType.TRIGGER, -1, undefined, eventArgs);
  }

  cheatAction(source: Entity, actions: Action[]): unknown[] {
    return this.trigger(source, actions);
  }

  queueActions(source: Entity, actions: Action[], eventArgs?: unknown): unknown[] {
    const oldEventArgs = source.eventArgs;
    source.eventArgs = eventArgs;
    const ret = this.triggerActions(source, actions);
    source.eventArgs = oldEventArgs;
    return ret;
  }

  triggerActions(source: Entity, actions: Action[]): unknown[] {
    const ret: unknown[] = [];

    for (const action of actions) {
      // Check if it's an EventListener registration
      if ((action as any).trigger && (action as any).at) {
        console.log(`[Game] Registering event listener on ${source.constructor.name}`);
        (action as any).once = true;
        source['_events'].push(action);
      } else {
        const result = action.trigger(source);
        ret.push(result);
      }
    }

    return ret;
  }
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/core/game-action-block.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/core/game-action-block.test.ts src/core/game.ts
git commit -m "feat: implement action block methods (actionBlock, trigger, queueActions)"
```

---

### Task 7: Implement Death Processing

**Files:**
- Modify: `src/actions/extended.ts` (add Death action)
- Modify: `src/core/game.ts`
- Test: `tests/actions/death.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/actions/death.test.ts
import { Death } from '../../src/actions/extended';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Card } from '../../src/core/card';
import { Zone } from '../../src/enums';

describe('Death Action', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;
  let minion: Card;

  beforeEach(() => {
    player1 = new Player('Player 1');
    player2 = new Player('Player 2');
    game = new Game({ players: [player1, player2] });
    minion = new Card({ id: 'TEST_001' } as any);
    minion.zone = Zone.PLAY;
    minion.damage = 10;
    minion.health = 5; // dead
    player1.field.push(minion as any);
  });

  test('should process deaths and move dead minions to graveyard', () => {
    expect(minion.zone).toBe(Zone.PLAY);

    game.processDeaths();

    expect(minion.zone).toBe(Zone.GRAVEYARD);
  });

  test('Death action should trigger broadcast', () => {
    const deathAction = new Death([minion]);
    deathAction.do(game, [minion]);

    expect(minion.zone).toBe(Zone.GRAVEYARD);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/actions/death.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// Add to src/actions/extended.ts

import { Action } from './base';
import { Entity } from '../core/entity';
import { Game, BlockType } from '../core/game';
import { Zone } from '../enums';

export class Death extends Action {
  private _trigger: boolean = false;

  constructor(private entities: Entity[]) {
    super();
  }

  getArgs(_source: Entity): Entity[] {
    return this.entities;
  }

  protected broadcastSingle(entity: Entity, source: Entity, at: any, args: unknown[]): void {
    const target = args[0] as Entity;

    if (!this._trigger && entity.playCounter > target.playCounter) {
      this._trigger = true;

      // Trigger deathrattle if at ON timing
      if (at === 1) { // EventListenerAt.ON
        const hasDeathrattle = (target as any).hasDeathrattle;
        if (hasDeathrattle) {
          // Queue deathrattle actions
          const deathrattles = (target as any).deathrattles || [];
          for (const deathrattle of deathrattles) {
            // Implementation would queue the actions
          }
        }
      }

      // Handle reborn if at AFTER timing
      if (at === 2) { // EventListenerAt.AFTER
        const isMinion = (target as any).type === 4; // CardType.MINION
        const reborn = (target as any).reborn;
        if (isMinion && reborn) {
          // Queue summon reborn copy
        }
      }
    }

    super.broadcastSingle(entity, source, at, args);
  }

  do(source: Entity, entities: Entity[]): void {
    for (const entity of entities) {
      if (!(entity as any).dead) continue;

      // Store position before moving
      if (entity.zone === Zone.PLAY) {
        (entity as any)._deadPosition = (entity as any).zonePosition - 1;
      }

      entity.zone = Zone.GRAVEYARD;
      (source as any).manager?.gameAction?.(this, source, entity);

      this._trigger = false;
      this.broadcast(source, 1, entity); // ON
    }

    for (const entity of entities) {
      if (!(entity as any).dead) continue;

      this._trigger = false;
      this.broadcast(source, 2, entity); // AFTER
    }
  }
}

export class Deaths extends Action {
  getArgs(_source: Entity): [] {
    return [];
  }

  do(source: Entity): void {
    const game = (source as any).game as Game;
    game.processDeaths();
  }
}
```

**Step 4: Update Game.processDeaths**

```typescript
// In src/core/game.ts

  processDeaths(): void {
    const liveEntities = this.liveEntities;
    const hasDead = liveEntities.some((e: any) => e.dead);

    if (hasDead) {
      this.actionStart(BlockType.DEATHS, this, 0);
      const deadEntities = liveEntities.filter((e: any) => e.dead);
      this.trigger(this, [new Death(deadEntities)]);
      this.actionEnd(BlockType.DEATHS, this);
    }
  }

  get liveEntities(): Entity[] {
    return [
      ...this.players[0].liveEntities,
      ...this.players[1].liveEntities,
    ];
  }
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/actions/death.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add tests/actions/death.test.ts src/actions/extended.ts src/core/game.ts
git commit -m "feat: implement Death processing with ON/AFTER broadcasts"
```

---

## Phase 3: Entity Event System

### Task 8: Complete Entity Event Methods

**Files:**
- Modify: `src/core/entity.ts`
- Test: `tests/core/entity-events.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/core/entity-events.test.ts
import { Entity } from '../../src/core/entity';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';

describe('Entity Event System', () => {
  let game: Game;
  let entity: Entity;

  beforeEach(() => {
    const player1 = new Player('Player 1');
    const player2 = new Player('Player 2');
    game = new Game({ players: [player1, player2] });
    entity = new Entity({
      scripts: {
        events: [
          { actions: ['action1'], once: false },
          { actions: ['action2'], once: true },
        ],
      },
    });
    (entity as any).game = game;
  });

  test('should initialize events from data', () => {
    expect(entity.events.length).toBe(2);
  });

  test('triggerEvent should execute event actions', () => {
    const mockSource = { game } as unknown as Entity;
    const mockEvent = { actions: ['action1'], once: false };

    const results = entity.triggerEvent(mockSource, mockEvent, ['arg']);

    expect(results).toBeDefined();
  });

  test('triggerEvent should remove once events', () => {
    const mockSource = { game } as unknown as Entity;
    const onceEvent = entity.events.find((e: any) => e.once);

    expect(entity.events.length).toBe(2);
    entity.triggerEvent(mockSource, onceEvent as any, []);

    expect(entity.events.length).toBe(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/entity-events.test.ts`
Expected: FAIL (may pass if existing code is close enough)

**Step 3: Enhance Entity implementation**

```typescript
// Update src/core/entity.ts

export interface EntityGameEvent {
  actions: unknown[];
  once?: boolean;
  trigger?: unknown;  // For Action-based events
  at?: number;        // EventListenerAt
}

export class Entity {
  // ... existing code ...

  triggerEvent(source: Entity, event: EntityGameEvent, args: unknown[]): unknown[] {
    const actions: unknown[] = [];

    for (const action of event.actions) {
      if (typeof action === 'function') {
        const result = action(this, ...args);
        if (result) {
          if (Array.isArray(result)) {
            actions.push(...result);
          } else {
            actions.push(result);
          }
        }
      } else {
        actions.push(action);
      }
    }

    const game = (source as any).game || (this as any).game;
    const ret = game?.trigger?.(this, actions as any, args) || [];

    if (event.once) {
      const idx = this._events.indexOf(event);
      if (idx !== -1) {
        this._events.splice(idx, 1);
      }
    }

    return ret;
  }

  // Add buffs/slots getters for BuffableEntity behavior
  get buffs(): Buff[] {
    return (this as any)._buffs || [];
  }

  get slots(): Slot[] {
    return (this as any)._slots || [];
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/core/game-entity-events.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/core/entity-events.test.ts src/core/entity.ts
git commit -m "feat: enhance Entity event system with proper triggerEvent"
```

---

## Phase 4: Selector DSL Enhancement

### Task 9: Enhance Selector Matching for Actions

**Files:**
- Modify: `src/dsl/selector.ts`
- Test: `tests/dsl/selector-matching.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/dsl/selector-matching.test.ts
import { Selector, SELF, ALL_MINIONS } from '../../src/dsl/selector';
import { Entity } from '../../src/core/entity';

describe('Selector Action Matching', () => {
  test('SELF should match the source entity', () => {
    const mockEntity = { uuid: 'test-1' } as unknown as Entity;
    const mockSource = { uuid: 'test-1' } as unknown as Entity;

    const result = SELF.eval([mockSource], mockEntity);
    expect(result).toContain(mockSource);
  });

  test('Selector should support callable interface for compatibility', () => {
    const selector = ALL_MINIONS;
    const mockGame = {
      board: [
        { type: 4 }, // MINION
        { type: 4 },
        { type: 3 }, // SPELL (not minion)
      ]
    };
    const mockSource = {} as Entity;

    // Both calling styles should work
    const result1 = selector.eval(mockGame.board as any, mockSource);
    expect(result1.length).toBe(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/dsl/selector-matching.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// Add to src/dsl/selector.ts

// Make Selectors callable for backward compatibility
export interface CallableSelector extends Selector {
  (game: unknown, source: Entity): Entity[];
}

export function makeCallable(selector: Selector): CallableSelector {
  const callable = selector.eval.bind(selector) as any;

  // Copy all methods from selector
  Object.setPrototypeOf(callable, Selector.prototype);

  // Add eval method
  callable.eval = selector.eval.bind(selector);

  return callable as CallableSelector;
}

// Update exports to use callable versions
export const SELF = makeCallable(new SelfSelector());
export const ALL_MINIONS = makeCallable(new EntityTypeSelector(CardType.MINION));
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/dsl/selector-matching.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/dsl/selector-matching.test.ts src/dsl/selector.ts
git commit -m "feat: add callable interface to Selectors for compatibility"
```

---

## Phase 5: Integration and Unification

### Task 10: Migrate Existing Actions to New System

**Files:**
- Modify: `src/actions/damage.ts`
- Modify: `src/actions/draw.ts`
- Modify: `src/actions/summon.ts`
- Test: `tests/actions/integration.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/actions/integration.test.ts
import { Damage } from '../../src/actions/damage';
import { Draw } from '../../src/actions/draw';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Entity } from '../../src/core/entity';
import { Card } from '../../src/core/card';

describe('Action System Integration', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player 1');
    player2 = new Player('Player 2');
    game = new Game({ players: [player1, player2] });
  });

  test('Damage action should work with new system', () => {
    const target = new Card({ id: 'TEST', health: 5 } as any);
    const damage = new Damage(3);

    damage.trigger(target);

    expect(target.damage).toBe(3);
  });

  test('Draw action should work with new system', () => {
    player1.deck.push(new Card({ id: 'CARD_001' } as any));
    player1.deck.push(new Card({ id: 'CARD_002' } as any));

    const draw = new Draw(2);
    draw.trigger(player1 as unknown as Entity);

    expect(player1.hand.length).toBe(2);
    expect(player1.deck.length).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/actions/integration.test.ts`
Expected: FAIL

**Step 3: Migrate Damage action**

```typescript
// Update src/actions/damage.ts

import { Action } from './base';
import { Entity } from '../core/entity';
import type { Game } from '../core/game';
import { BlockType } from '../enums/blocktype';

export class Damage extends Action {
  constructor(private amount: number) {
    super(amount);
  }

  getArgs(_source: Entity): [number] {
    return [this.amount];
  }

  do(source: Entity, amount: number): void {
    const game = (source as any).game as Game;

    // Broadcast ON event
    this.broadcast(source, 1, amount); // EventListenerAt.ON

    // Apply damage
    const target = source as any;
    const actualAmount = target.getDamage?.(amount, source) ?? amount;

    if (actualAmount > 0) {
      target.damage = (target.damage || 0) + actualAmount;
      console.log(`[Damage] ${target.id || 'entity'} took ${actualAmount} damage`);
    }

    // Broadcast AFTER event
    this.broadcast(source, 2, amount); // EventListenerAt.AFTER

    // Trigger callbacks
    if (this.callback.length > 0) {
      game.queueActions(source, this.callback);
    }
  }
}
```

**Step 4: Migrate Draw action**

```typescript
// Update src/actions/draw.ts

import { Action } from './base';
import { Entity } from '../core/entity';
import type { Game } from '../core/game';
import { Zone } from '../enums';
import { Card } from '../core/card';

export class Draw extends Action {
  constructor(private count: number) {
    super(count);
  }

  getArgs(_source: Entity): [number] {
    return [this.count];
  }

  do(source: Entity, count: number): void {
    const player = source as any;
    const game = player.game as Game;

    for (let i = 0; i < count; i++) {
      if (player.deck.length === 0) {
        // Fatigue
        player.fatigue = (player.fatigue || 0) + 1;
        const fatigueDamage = player.fatigue;
        console.log(`[Draw] Fatigue: ${fatigueDamage} damage`);
        // Apply fatigue damage to hero
        continue;
      }

      const card = player.deck.shift() as Card;
      if (card) {
        card.zone = Zone.HAND;
        player.hand.push(card);
        console.log(`[Draw] Drew ${card.id}`);
      }
    }

    // Trigger callbacks
    if (this.callback.length > 0) {
      game.queueActions(source, this.callback);
    }
  }
}
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/actions/integration.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add tests/actions/integration.test.ts src/actions/damage.ts src/actions/draw.ts
git commit -m "feat: migrate Damage and Draw actions to new event system"
```

---

### Task 11: Deprecate Old Event Systems

**Files:**
- Modify: `src/cards/mechanics/index.ts`
- Create: `src/cards/mechanics/adapter.ts`
- Test: `tests/cards/mechanics/adapter.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/cards/mechanics/adapter.test.ts
import { adaptLegacyScript } from '../../src/cards/mechanics/adapter';
import { cardScriptsRegistry } from '../../src/cards/mechanics/index';
import type { Entity } from '../../src/core/entity';

describe('Legacy Script Adapter', () => {
  test('should convert legacy event script to EventListener', () => {
    const legacyScript = {
      events: {
        DAMAGE: (ctx: any) => {
          console.log('Damage event!');
        },
      },
    };

    const adapted = adaptLegacyScript('TEST_001', legacyScript);

    expect(adapted).toBeDefined();
    expect(adapted.events).toBeDefined();
  });

  test('registry should still work with legacy format', () => {
    cardScriptsRegistry.register('LEGACY_001', {
      play: (ctx) => {
        return 'played';
      },
    });

    const script = cardScriptsRegistry.get('LEGACY_001');
    expect(script).toBeDefined();
    expect(script?.play).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/cards/mechanics/adapter.test.ts`
Expected: FAIL

**Step 3: Write adapter implementation**

```typescript
// src/cards/mechanics/adapter.ts

import type { CardScript, ActionContext } from './types';
import { EventListener, EventListenerAt } from '../../actions/eventlistener';
import type { Action } from '../../actions/base';

/**
 * Adapter to convert legacy card scripts to new EventListener-based system
 */
export function adaptLegacyScript(cardId: string, script: CardScript): CardScript {
  const adapted: CardScript = { ...script };

  // Convert legacy events map to EventListeners
  if (script.events) {
    const eventMap: Record<string, (ctx: ActionContext) => void> = {};

    for (const [eventType, handler] of Object.entries(script.events)) {
      // Store original handler for backward compatibility
      eventMap[eventType] = handler as (ctx: ActionContext) => void;
    }

    // Keep events for compatibility
    adapted.events = eventMap;
  }

  return adapted;
}

/**
 * Create EventListener from legacy event handler
 */
export function createEventListenerFromLegacy(
  eventType: string,
  handler: (ctx: ActionContext) => void,
  triggerAction: Action
): EventListener {
  // Create a wrapper action that calls the legacy handler
  const wrapperAction: Action = {
    trigger: (source: Entity, target?: Entity) => {
      const ctx: ActionContext = {
        source,
        target,
        game: (source as any).game,
        event: { type: eventType as any },
      };
      handler(ctx);
      return [];
    },
    getArgs: () => [],
    do: () => {},
  } as any;

  return new EventListener(triggerAction, [wrapperAction], EventListenerAt.ON);
}
```

**Step 4: Update mechanics index to support both systems**

```typescript
// Add to src/cards/mechanics/index.ts

import { adaptLegacyScript } from './adapter';
import { EventListener, EventListenerAt } from '../../actions/eventlistener';

// Modify register to auto-adapt legacy scripts
class CardScriptsRegistry {
  register(cardId: string, script: CardScript): void {
    // Auto-adapt legacy scripts
    const adapted = adaptLegacyScript(cardId, script);
    this.scripts.set(cardId, adapted);
  }

  // ... rest of existing implementation
}
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/cards/mechanics/adapter.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add tests/cards/mechanics/adapter.test.ts src/cards/mechanics/adapter.ts src/cards/mechanics/index.ts
git commit -m "feat: add legacy script adapter for backward compatibility"
```

---

### Task 12: Final Integration Test

**Files:**
- Create: `tests/integration/full-game.test.ts`

**Step 1: Write comprehensive integration test**

```typescript
// tests/integration/full-game.test.ts
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Card } from '../../src/core/card';
import { Damage, Draw, Summon } from '../../src/actions';
import { EventListener, EventListenerAt } from '../../src/actions/eventlistener';
import { Zone } from '../../src/enums';

describe('Full Game Integration', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player 1');
    player2 = new Player('Player 2');
    game = new Game({ players: [player1, player2], seed: 12345 });
    game.setup();
  });

  test('should play a full turn with events', () => {
    // Setup: Player 1 has a minion on board
    const minion = new Card({ id: 'MINION_001', atk: 2, health: 3 } as any);
    minion.zone = Zone.PLAY;
    minion.controller = player1;
    player1.field.push(minion as any);

    // Register an event listener that triggers on damage
    const damageListener = new Damage(0).on(new Draw(1));
    minion['_events'].push(damageListener);

    // Start turn
    game.beginTurn(player1);

    // Apply damage to minion
    const damageAction = new Damage(1);
    damageAction.trigger(minion as any);

    expect(minion.damage).toBe(1);
  });

  test('should process deaths at end of action block', () => {
    // Setup: Create a minion that will die
    const minion = new Card({ id: 'WEAK_001', health: 1 } as any);
    minion.zone = Zone.PLAY;
    minion.damage = 1; // Dead
    player1.field.push(minion as any);

    // Process deaths
    game.processDeaths();

    expect(minion.zone).toBe(Zone.GRAVEYARD);
  });

  test('action stack should trigger aura refresh', () => {
    let auraRefreshed = false;

    // Override refreshAuras to track calls
    const originalRefresh = game.refreshAuras.bind(game);
    game.refreshAuras = () => {
      auraRefreshed = true;
      originalRefresh();
    };

    // Execute an action block
    game.actionStart('TRIGGER', player1, 0);
    game.actionEnd('TRIGGER', player1);

    expect(auraRefreshed).toBe(true);
  });
});
```

**Step 2: Run test to verify it passes**

Run: `npm test -- tests/integration/full-game.test.ts`
Expected: PASS (may need fixes)

**Step 3: Fix any remaining issues**

Address any failing tests by fixing implementation gaps.

**Step 4: Commit**

```bash
git add tests/integration/full-game.test.ts
git commit -m "test: add comprehensive integration tests for unified event system"
```

---

## Phase 6: Documentation and Cleanup

### Task 13: Update Documentation

**Files:**
- Modify: `CLAUDE.md`
- Create: `docs/event-system-migration.md`

**Step 1: Write migration guide**

```markdown
// docs/event-system-migration.md

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
```

**Step 2: Update CLAUDE.md**

Add section about the unified event system to CLAUDE.md.

**Step 3: Commit**

```bash
git add docs/event-system-migration.md CLAUDE.md
git commit -m "docs: add event system migration guide and update CLAUDE.md"
```

---

## Summary

This plan implements:

1. **Action Infrastructure** - ActionArg, EventListener with ON/AFTER timing
2. **Action Block System** - BlockType enum, action stack, aura/death processing
3. **Entity Event System** - entity.events storage, triggerEvent method
4. **Selector Enhancement** - Callable interface for backward compatibility
5. **Action Migration** - Damage, Draw actions using new broadcast system
6. **Legacy Adapter** - Backward compatibility for existing card scripts
7. **Integration Tests** - Full game scenario tests
8. **Documentation** - Migration guide and updated CLAUDE.md

---

**Plan complete and saved to `docs/plans/2026-03-09-unified-event-system.md`.**

Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach would you prefer?
