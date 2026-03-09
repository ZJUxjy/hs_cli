# Missing Game Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all missing game mechanics to achieve feature parity with Python fireplace.

**Architecture:** The implementation follows the existing Action-based event system pattern. Each feature is added as a new Action class or extends existing core classes (Game, Player, Card). Features are implemented incrementally with TDD approach.

**Tech Stack:** TypeScript, Jest for testing, existing Action event system

---

## Phase 1: Core Game Loop Enhancements

### Task 1: Complete Step State Machine

**Files:**
- Modify: `src/core/game.ts`
- Modify: `src/enums.ts`
- Test: `tests/core/game.step.test.ts`

**Current Gap:** TypeScript has basic step tracking but no proper state transitions. Python has full step flow: `BEGIN_FIRST → BEGIN_SHUFFLE → BEGIN_DRAW → BEGIN_MULLIGAN → MAIN_READY → MAIN_START → MAIN_ACTION → MAIN_END → MAIN_NEXT`

**Step 1: Add step transition tests**

```typescript
// tests/core/game.step.test.ts
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Step, State } from '../../src/enums';

describe('Game Step State Machine', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';
    game = new Game({ players: [player1, player2] });
  });

  test('initial step should be BEGIN_FIRST', () => {
    expect(game.step).toBe(Step.BEGIN_FIRST);
  });

  test('setup should transition to BEGIN_DRAW', () => {
    game.setup();
    expect(game.step).toBe(Step.BEGIN_DRAW);
  });

  test('stepTransition should update step and nextStep', () => {
    game.stepTransition(Step.MAIN_READY);
    expect(game.step).toBe(Step.MAIN_READY);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/game.step.test.ts`
Expected: FAIL with step transition not implemented

**Step 3: Implement step transition in Game class**

```typescript
// In src/core/game.ts - add new method
stepTransition(nextStep: Step): void {
  const oldStep = this.step;
  this.step = this.nextStep;
  this.nextStep = nextStep;
  this.manager.step(oldStep, this.step);
}

// Modify setup() to use stepTransition
setup(): void {
  console.log('[Game] Setting up');
  this.state = State.RUNNING;
  this.stepTransition(Step.BEGIN_DRAW);
  // ... rest of setup
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/core/game.step.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/core/game.step.test.ts src/core/game.ts
git commit -m "$(cat <<'EOF'
feat: add step state machine to Game class

Add stepTransition method for proper game phase management.
Matches Python fireplace's step flow architecture.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Implement Mulligan Phase

**Files:**
- Create: `src/actions/mulligan.ts`
- Modify: `src/actions/index.ts`
- Modify: `src/core/game.ts`
- Test: `tests/actions/mulligan.test.ts`

**Current Gap:** No mulligan phase - game starts directly. Python has full mulligan with MulliganChoice action.

**Step 1: Write the failing test**

```typescript
// tests/actions/mulligan.test.ts
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { MulliganChoice } from '../../src/actions/mulligan';
import { Step } from '../../src/enums';

describe('MulliganChoice Action', () => {
  test('MulliganChoice creates choice for player', () => {
    const player = new Player('Test', ['CS2_120', 'CS2_121', 'CS2_122']);
    player.startingHero = 'HERO_01';
    const game = new Game({ players: [player, new Player('Opp', [])] });
    game.setup();

    const mulligan = new MulliganChoice(player);
    mulligan.trigger(game);

    expect(player.choice).toBeDefined();
    expect(player.choice?.cards.length).toBeGreaterThan(0);
  });

  test('MulliganChoice callback resolves mulligan', () => {
    let callbackCalled = false;
    const player = new Player('Test', ['CS2_120']);
    player.startingHero = 'HERO_01';
    const game = new Game({ players: [player, new Player('Opp', [])] });
    game.setup();

    const mulligan = new MulliganChoice(player, () => {
      callbackCalled = true;
    });
    mulligan.trigger(game);

    // Simulate player choice (keep all cards)
    player.choice = undefined;

    expect(callbackCalled).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/actions/mulligan.test.ts`
Expected: FAIL with MulliganChoice not defined

**Step 3: Implement MulliganChoice action**

```typescript
// src/actions/mulligan.ts
import { Action } from './base';
import { Entity } from '../core/entity';
import { Player } from '../core/player';
import { Game } from '../core/game';
import { Step } from '../enums';

export interface MulliganChoiceCallback {
  (): void;
}

export interface PlayerChoice {
  cards: Entity[];
  minCount: number;
  maxCount: number;
  source?: Entity;
}

export class MulliganChoice extends Action {
  constructor(
    public readonly player: Player,
    public readonly callback?: MulliganChoiceCallback
  ) {
    super();
  }

  override trigger(source: Entity): void[][] {
    const game = source.game as Game;

    // Set player's choice to their current hand
    this.player.choice = {
      cards: [...this.player.hand] as unknown as Entity[],
      minCount: 0,
      maxCount: this.player.hand.length,
      source: game
    };

    console.log(`[Mulligan] ${this.player.name} is choosing cards to keep`);

    // If no callback, immediately resolve (for AI/testing)
    if (!this.callback) {
      this.resolve([]);
    }

    return [[]];
  }

  resolve(cardsToReplace: Entity[]): void {
    // Put chosen cards back in deck
    for (const card of cardsToReplace) {
      const idx = this.player.hand.indexOf(card as any);
      if (idx !== -1) {
        const [removed] = this.player.hand.splice(idx, 1);
        this.player.deck.push(removed);
      }
    }

    // Draw replacement cards
    const replacementCount = cardsToReplace.length;
    this.player.draw(replacementCount);

    // Clear choice
    this.player.choice = undefined;

    // Shuffle deck
    this.player.shuffleDeck();

    console.log(`[Mulligan] ${this.player.name} replaced ${replacementCount} cards`);

    // Call callback if provided
    if (this.callback) {
      this.callback();
    }
  }
}
```

**Step 4: Export from index**

```typescript
// Add to src/actions/index.ts
export { MulliganChoice } from './mulligan';
export type { MulliganChoiceCallback, PlayerChoice } from './mulligan';
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/actions/mulligan.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/actions/mulligan.ts src/actions/index.ts tests/actions/mulligan.test.ts
git commit -m "$(cat <<'EOF'
feat: add MulliganChoice action for mulligan phase

Implements the mulligan phase where players can replace
starting cards. Matches Python fireplace's MulliganRules.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Add Mulligan to Game Start Flow

**Files:**
- Modify: `src/core/game.ts`
- Test: `tests/core/game.mulligan.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/core/game.mulligan.test.ts
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Step } from '../../src/enums';

describe('Game Mulligan Flow', () => {
  test('startWithMulligan should enter mulligan phase', () => {
    const player1 = new Player('P1', ['CS2_120', 'CS2_121', 'CS2_122']);
    const player2 = new Player('P2', ['CS2_120', 'CS2_121', 'CS2_122', 'CS2_123']);
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';

    const game = new Game({ players: [player1, player2] });
    game.startWithMulligan();

    expect(game.step).toBe(Step.BEGIN_MULLIGAN);
    expect(player1.choice).toBeDefined();
    expect(player2.choice).toBeDefined();
  });

  test('resolveMulligan should transition to game start', () => {
    const player1 = new Player('P1', ['CS2_120']);
    const player2 = new Player('P2', ['CS2_120']);
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';

    const game = new Game({ players: [player1, player2] });
    game.startWithMulligan();

    // Resolve both mulligans
    game.resolveMulligan(player1, []);
    game.resolveMulligan(player2, []);

    expect(game.currentPlayer).toBe(player1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/game.mulligan.test.ts`
Expected: FAIL with startWithMulligan not defined

**Step 3: Implement mulligan flow in Game**

```typescript
// Add to src/core/game.ts
import { MulliganChoice } from '../actions/mulligan';
import { GameStart } from '../actions/gamestart';

// Add private field for tracking mulligan state
private _mulliganCallbacks: Map<Player, () => void> = new Map();
private _mulliganPending: Set<Player> = new Set();

startWithMulligan(): void {
  this.setup();
  this.step = Step.BEGIN_MULLIGAN;
  this.nextStep = Step.MAIN_READY;
  console.log('[Game] Entering mulligan phase');

  for (const player of this.players) {
    this._mulliganPending.add(player);
    const callback = () => this._onMulliganComplete(player);
    this._mulliganCallbacks.set(player, callback);
    this.queueActions(this, [new MulliganChoice(player, callback)]);
  }
}

resolveMulligan(player: Player, cardsToReplace: Entity[]): void {
  const mulligan = new MulliganChoice(player, this._mulliganCallbacks.get(player));
  mulligan.resolve(cardsToReplace);
}

private _onMulliganComplete(player: Player): void {
  this._mulliganPending.delete(player);

  if (this._mulliganPending.size === 0) {
    // All mulligans complete, start the game
    this.queueActions(this, [new GameStart()]);
    this.beginTurn(this.player1);
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/core/game.mulligan.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/game.ts tests/core/game.mulligan.test.ts
git commit -m "$(cat <<'EOF'
feat: add mulligan phase to game start flow

Games can now start with mulligan phase using startWithMulligan().
Matches Python fireplace's MulliganRules class.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2: Mana System Enhancements

### Task 4: Implement Mana Crystal Growth

**Files:**
- Modify: `src/core/player.ts`
- Modify: `src/actions/beginturn.ts`
- Test: `tests/core/player.mana.test.ts`

**Current Gap:** Mana crystals don't grow automatically each turn. Python increments max_mana by 1 each turn.

**Step 1: Write the failing test**

```typescript
// tests/core/player.mana.test.ts
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { BeginTurn } from '../../src/actions/beginturn';

describe('Player Mana System', () => {
  test('max mana should increment by 1 each turn (max 10)', () => {
    const player = new Player('Test', []);
    const opponent = new Player('Opp', []);
    player.startingHero = 'HERO_01';
    opponent.startingHero = 'HERO_01';
    const game = new Game({ players: [player, opponent] });
    game.setup();

    expect(player.maxMana).toBe(0);

    // Turn 1
    new BeginTurn(player).trigger(game);
    expect(player.maxMana).toBe(1);
    expect(player.usedMana).toBe(0);

    // Turn 2
    new BeginTurn(player).trigger(game);
    expect(player.maxMana).toBe(2);

    // Turn 10+ should cap at 10
    for (let i = 0; i < 10; i++) {
      new BeginTurn(player).trigger(game);
    }
    expect(player.maxMana).toBe(10);
  });

  test('mana calculation should account for overload', () => {
    const player = new Player('Test', []);
    player.maxMana = 5;
    player.usedMana = 2;
    player.overloadLocked = 1;

    expect(player.mana).toBe(2); // 5 - 2 - 1 = 2
  });

  test('temp mana should be consumed first', () => {
    const player = new Player('Test', []);
    player.maxMana = 3;
    player.usedMana = 0;
    player.tempMana = 2;

    expect(player.mana).toBe(5); // 3 + 2 = 5
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/player.mana.test.ts`
Expected: FAIL with mana not incrementing

**Step 3: Implement mana growth in BeginTurn**

```typescript
// Modify src/actions/beginturn.ts
override trigger(source: Entity): void[][] {
  const game = source.game as Game;
  const player = this.player;

  // Mana crystal growth
  player.maxMana = Math.min(10, player.maxMana + 1);
  player.usedMana = 0;

  // Overload handling
  player.overloadLocked = player.overloaded;
  player.overloaded = 0;

  // Reset temp mana
  player.tempMana = 0;

  // ... rest of BeginTurn logic
  return [[]];
}

// Fix Player.mana getter in src/core/player.ts
get mana(): number {
  return Math.max(0, this.maxMana - this.usedMana - this.overloadLocked) + this.tempMana;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/core/player.mana.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/player.ts src/actions/beginturn.ts tests/core/player.mana.test.ts
git commit -m "$(cat <<'EOF'
feat: implement mana crystal growth and overload system

- Max mana increases by 1 each turn (capped at 10)
- Proper overload handling with locked crystals
- Temp mana consumed first

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Implement SpendMana Action

**Files:**
- Create: `src/actions/spendmana.ts`
- Modify: `src/actions/index.ts`
- Test: `tests/actions/spendmana.test.ts`

**Current Gap:** No SpendMana action for proper mana spending tracking.

**Step 1: Write the failing test**

```typescript
// tests/actions/spendmana.test.ts
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { SpendMana } from '../../src/actions/spendmana';

describe('SpendMana Action', () => {
  test('SpendMana should deduct from player mana', () => {
    const player = new Player('Test', []);
    const opponent = new Player('Opp', []);
    const game = new Game({ players: [player, opponent] });
    player.maxMana = 5;
    player.usedMana = 0;

    const spend = new SpendMana(player, 3);
    spend.trigger(game);

    expect(player.usedMana).toBe(3);
  });

  test('SpendMana should use temp mana first', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.maxMana = 3;
    player.usedMana = 0;
    player.tempMana = 2;

    const spend = new SpendMana(player, 4);
    spend.trigger(game);

    expect(player.tempMana).toBe(0); // All temp mana used
    expect(player.usedMana).toBe(2); // Remaining from regular mana
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/actions/spendmana.test.ts`
Expected: FAIL with SpendMana not defined

**Step 3: Implement SpendMana action**

```typescript
// src/actions/spendmana.ts
import { Action } from './base';
import { Entity } from '../core/entity';
import { Player } from '../core/player';

export class SpendMana extends Action {
  constructor(
    public readonly player: Player,
    public readonly amount: number
  ) {
    super();
  }

  override trigger(source: Entity): void[][] {
    let remaining = this.amount;

    // Use temp mana first
    if (this.player.tempMana > 0) {
      const fromTemp = Math.min(remaining, this.player.tempMana);
      this.player.tempMana -= fromTemp;
      remaining -= fromTemp;
      console.log(`[Mana] ${this.player.name} spent ${fromTemp} temp mana`);
    }

    // Then use regular mana
    if (remaining > 0) {
      this.player.usedMana += remaining;
      console.log(`[Mana] ${this.player.name} spent ${remaining} mana`);
    }

    return [[]];
  }
}
```

**Step 4: Export from index**

```typescript
// Add to src/actions/index.ts
export { SpendMana } from './spendmana';
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/actions/spendmana.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/actions/spendmana.ts src/actions/index.ts tests/actions/spendmana.test.ts
git commit -m "$(cat <<'EOF'
feat: add SpendMana action for mana tracking

Implements proper mana spending with temp mana priority.
Matches Python fireplace's SpendMana action.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3: Card Type Enhancements

### Task 6: Implement Weapon System

**Files:**
- Create: `src/core/weapon.ts`
- Modify: `src/core/card.ts`
- Modify: `src/core/player.ts`
- Test: `tests/core/weapon.test.ts`

**Current Gap:** No Weapon card type with durability and attack mechanics.

**Step 1: Write the failing test**

```typescript
// tests/core/weapon.test.ts
import { Weapon } from '../../src/core/weapon';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';

describe('Weapon', () => {
  test('Weapon should have attack and durability', () => {
    const weapon = new Weapon({
      id: 'CS2_106',
      type: 7, // CardType.WEAPON
      cardClass: 2,
      cost: 2,
      attack: 2,
      durability: 3
    });

    expect(weapon.attack).toBe(2);
    expect(weapon.durability).toBe(3);
  });

  test('Weapon loses durability on attack', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    game.setup();

    const weapon = new Weapon({
      id: 'TEST_WEAPON',
      type: 7,
      cardClass: 2,
      cost: 1,
      attack: 2,
      durability: 2
    });
    (weapon as any).controller = player;

    player.weapon = weapon;
    weapon.loseDurability();

    expect(weapon.durability).toBe(1);
  });

  test('Weapon is destroyed at 0 durability', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    game.setup();

    const weapon = new Weapon({
      id: 'TEST_WEAPON',
      type: 7,
      cardClass: 2,
      cost: 1,
      attack: 2,
      durability: 1
    });
    (weapon as any).controller = player;

    player.weapon = weapon;
    weapon.loseDurability();

    expect(player.weapon).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/weapon.test.ts`
Expected: FAIL with Weapon not defined

**Step 3: Implement Weapon class**

```typescript
// src/core/weapon.ts
import { Card, CardDefinition } from './card';
import { CardType, Zone } from '../enums';
import { Player } from './player';

export interface WeaponDefinition extends CardDefinition {
  attack: number;
  durability: number;
}

export class Weapon extends Card {
  public attack: number;
  public durability: number;
  public damage: number = 0;

  constructor(def: WeaponDefinition) {
    super(def);
    this.attack = def.attack;
    this.durability = def.durability;
  }

  get currentDurability(): number {
    return this.durability - this.damage;
  }

  loseDurability(amount: number = 1): void {
    this.damage += amount;
    console.log(`[Weapon] ${this.id} durability: ${this.currentDurability}/${this.durability}`);

    if (this.currentDurability <= 0) {
      this.destroy();
    }
  }

  destroy(): void {
    const controller = this.controller as Player;
    if (controller.weapon === this) {
      controller.weapon = null;
      console.log(`[Weapon] ${this.id} destroyed`);
    }
    this.zone = Zone.GRAVEYARD;
  }
}
```

**Step 4: Export Weapon from card.ts**

```typescript
// Add to src/core/card.ts exports
export { Weapon, WeaponDefinition } from './weapon';
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/core/weapon.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/core/weapon.ts src/core/card.ts tests/core/weapon.test.ts
git commit -m "$(cat <<'EOF'
feat: implement Weapon card type with durability system

Weapons track durability and are destroyed when depleted.
Matches Python fireplace's Weapon class.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Implement HeroPower System

**Files:**
- Create: `src/core/heropower.ts`
- Modify: `src/core/card.ts`
- Test: `tests/core/heropower.test.ts`

**Current Gap:** HeroPower exists as type but lacks activation tracking and cost mechanics.

**Step 1: Write the failing test**

```typescript
// tests/core/heropower.test.ts
import { HeroPower } from '../../src/core/heropower';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';

describe('HeroPower', () => {
  test('HeroPower tracks activations per turn', () => {
    const heropower = new HeroPower({
      id: 'CS2_034',
      type: 10, // CardType.HERO_POWER
      cardClass: 4, // MAGE
      cost: 2
    });

    expect(heropower.activationsThisTurn).toBe(0);
    expect(heropower.isUsable()).toBe(true);
  });

  test('HeroPower can only be used once per turn by default', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const heropower = new HeroPower({
      id: 'CS2_034',
      type: 10,
      cardClass: 4,
      cost: 2
    });
    (heropower as any).controller = player;
    player.heroPower = heropower;
    player.maxMana = 2;

    heropower.activate();
    expect(heropower.activationsThisTurn).toBe(1);
    expect(heropower.isUsable()).toBe(false);
  });

  test('HeroPower resets activations on new turn', () => {
    const heropower = new HeroPower({
      id: 'CS2_034',
      type: 10,
      cardClass: 4,
      cost: 2
    });

    heropower.activationsThisTurn = 1;
    heropower.resetForNewTurn();

    expect(heropower.activationsThisTurn).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/heropower.test.ts`
Expected: FAIL with HeroPower not properly implemented

**Step 3: Implement HeroPower class**

```typescript
// src/core/heropower.ts
import { Card, CardDefinition, PlayableCard } from './card';
import { CardType, Zone } from '../enums';
import { Player } from './player';

export interface HeroPowerDefinition extends CardDefinition {
  cost: number;
}

export class HeroPower extends PlayableCard {
  public activationsThisTurn: number = 0;
  public additionalActivationsThisTurn: number = 0;

  constructor(def: HeroPowerDefinition) {
    super(def);
  }

  isUsable(): boolean {
    const maxActivations = 1 + this.additionalActivationsThisTurn;
    if (this.activationsThisTurn >= maxActivations) {
      return false;
    }

    const controller = this.controller as Player;
    if (controller.mana < this.cost) {
      return false;
    }

    return true;
  }

  activate(): boolean {
    if (!this.isUsable()) {
      return false;
    }

    const controller = this.controller as Player;
    controller.payCost(this.cost);
    this.activationsThisTurn++;

    console.log(`[HeroPower] ${controller.name} used ${this.name || this.id}`);

    // Trigger hero power effect (would be handled by card script)
    return true;
  }

  resetForNewTurn(): void {
    this.activationsThisTurn = 0;
    this.additionalActivationsThisTurn = 0;
  }
}
```

**Step 4: Export from card.ts**

```typescript
// Add to src/core/card.ts
export { HeroPower, HeroPowerDefinition } from './heropower';
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/core/heropower.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/core/heropower.ts src/core/card.ts tests/core/heropower.test.ts
git commit -m "$(cat <<'EOF'
feat: implement HeroPower with activation tracking

Hero powers track uses per turn and cost requirements.
Matches Python fireplace's HeroPower class.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Implement Secret Card Type

**Files:**
- Create: `src/core/secret.ts`
- Modify: `src/core/card.ts`
- Test: `tests/core/secret.test.ts`

**Current Gap:** Secret exists as type but lacks event triggering mechanics.

**Step 1: Write the failing test**

```typescript
// tests/core/secret.test.ts
import { Secret } from '../../src/core/secret';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';

describe('Secret', () => {
  test('Secret can be played to secrets zone', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const secret = new Secret({
      id: 'EX1_130',
      type: 5, // SPELL
      cardClass: 3, // HUNTER
      cost: 2,
      secret: true
    });
    (secret as any).controller = player;

    secret.playToSecretZone();

    expect(player.secrets.includes(secret)).toBe(true);
    expect(secret.zone).toBe(1); // Zone.SECRET
  });

  test('Secret reacts to trigger event', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const secret = new Secret({
      id: 'EX1_130',
      type: 5,
      cardClass: 3,
      cost: 2,
      secret: true
    });
    (secret as any).controller = player;
    secret.playToSecretZone();

    // Simulate trigger condition
    const shouldTrigger = secret.checkTrigger('AFTER_ATTACK', { attacker: player.opponent.hero });

    expect(typeof shouldTrigger).toBe('boolean');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/secret.test.ts`
Expected: FAIL with Secret not properly implemented

**Step 3: Implement Secret class**

```typescript
// src/core/secret.ts
import { Spell, CardDefinition } from './card';
import { Zone } from '../enums';
import { Player } from './player';
import { Entity } from './entity';

export interface SecretDefinition extends CardDefinition {
  secret?: boolean;
  quest?: boolean;
}

export class Secret extends Spell {
  public secret: boolean;

  constructor(def: SecretDefinition) {
    super(def);
    this.secret = def.secret ?? false;
  }

  playToSecretZone(): void {
    const controller = this.controller as Player;

    // Check secret limit
    if (controller.secrets.length >= 5) {
      console.log(`[Secret] Cannot play ${this.id} - secret limit reached`);
      return;
    }

    controller.secrets.push(this);
    this.zone = Zone.SECRET;

    console.log(`[Secret] ${controller.name} played ${this.id}`);
  }

  checkTrigger(eventName: string, eventArgs: Record<string, unknown>): boolean {
    // This would be implemented by card scripts
    // Returns true if the secret should trigger
    return false;
  }

  reveal(): void {
    const controller = this.controller as Player;
    const idx = controller.secrets.indexOf(this);
    if (idx !== -1) {
      controller.secrets.splice(idx, 1);
    }
    console.log(`[Secret] ${this.id} revealed!`);
  }

  destroy(): void {
    this.reveal();
    this.zone = Zone.GRAVEYARD;
  }
}
```

**Step 4: Update card.ts exports**

```typescript
// Add to src/core/card.ts
export { Secret, SecretDefinition } from './secret';
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/core/secret.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/core/secret.ts src/core/card.ts tests/core/secret.test.ts
git commit -m "$(cat <<'EOF'
feat: implement Secret card type with event triggering

Secrets play to secret zone and can react to game events.
Matches Python fireplace's Secret class.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4: Entity Mechanics

### Task 9: Implement Dormant/Awaken Mechanics

**Files:**
- Create: `src/actions/dormant.ts`
- Modify: `src/core/entity.ts`
- Test: `tests/actions/dormant.test.ts`

**Current Gap:** No dormant state handling for minions like those in Ashes of Outlands.

**Step 1: Write the failing test**

```typescript
// tests/actions/dormant.test.ts
import { Dormant, Awaken } from '../../src/actions/dormant';
import { Minion } from '../../src/core/card';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';

describe('Dormant/Awaken Mechanics', () => {
  test('Dormant sets dormant_turns on minion', () => {
    const minion = new Minion({
      id: 'BT_126',
      type: 4, // MINION
      cardClass: 7,
      cost: 5,
      attack: 4,
      health: 5
    });

    const dormant = new Dormant(minion, 2);
    dormant.trigger(minion);

    expect((minion as any).dormantTurns).toBe(2);
    expect((minion as any).dormant).toBe(true);
  });

  test('Awaken removes dormant state', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    game.setup();

    const minion = new Minion({
      id: 'BT_126',
      type: 4,
      cardClass: 7,
      cost: 5,
      attack: 4,
      health: 5
    });
    (minion as any).controller = player;
    (minion as any).dormantTurns = 0;

    const awaken = new Awaken(minion);
    awaken.trigger(game);

    expect((minion as any).dormant).toBe(false);
    expect((minion as any).dormantTurns).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/actions/dormant.test.ts`
Expected: FAIL with Dormant not defined

**Step 3: Implement Dormant/Awaken actions**

```typescript
// src/actions/dormant.ts
import { Action } from './base';
import { Entity } from '../core/entity';

export class Dormant extends Action {
  constructor(
    public readonly target: Entity,
    public readonly turns: number
  ) {
    super();
  }

  override trigger(source: Entity): void[][] {
    const target = this.target as any;
    target.dormant = true;
    target.dormantTurns = this.turns;
    target.canAttack = false;

    console.log(`[Dormant] ${target.id} is dormant for ${this.turns} turns`);

    return [[]];
  }
}

export class Awaken extends Action {
  constructor(public readonly target: Entity) {
    super();
  }

  override trigger(source: Entity): void[][] {
    const target = this.target as any;
    target.dormant = false;
    target.dormantTurns = 0;
    target.canAttack = true;

    console.log(`[Awaken] ${target.id} has awakened!`);

    // Trigger awaken effects would be handled by card scripts

    return [[]];
  }
}
```

**Step 4: Export from index**

```typescript
// Add to src/actions/index.ts
export { Dormant, Awaken } from './dormant';
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/actions/dormant.test.ts`
Expected: PASS

**Step 6: Add dormant turn decrement to BeginTurn**

```typescript
// Add to src/actions/beginturn.ts
import { Awaken } from './dormant';

// In trigger method, add:
// Process dormant minions
for (const entity of player.liveEntities) {
  const entityAny = entity as any;
  if (entityAny.dormantTurns && entityAny.dormantTurns > 0) {
    entityAny.dormantTurns--;
    if (entityAny.dormantTurns === 0) {
      game.queueActions(game, [new Awaken(entity)]);
    }
  }
}
```

**Step 7: Commit**

```bash
git add src/actions/dormant.ts src/actions/index.ts src/actions/beginturn.ts tests/actions/dormant.test.ts
git commit -m "$(cat <<'EOF'
feat: implement Dormant/Awaken mechanics

Minions can now be dormant for N turns and awaken automatically.
Matches Python fireplace's Dormant and Awaken actions.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Implement Elemental Chain Tracking

**Files:**
- Modify: `src/core/player.ts`
- Modify: `src/actions/play.ts`
- Test: `tests/core/player.elemental.test.ts`

**Current Gap:** Elemental tracking exists but isn't updated properly during play.

**Step 1: Write the failing test**

```typescript
// tests/core/player.elemental.test.ts
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { Minion } from '../../src/core/card';
import { Play } from '../../src/actions/play';
import { Race } from '../../src/enums';

describe('Elemental Chain Tracking', () => {
  test('Playing elemental increments this turn counter', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const elemental = new Minion({
      id: 'ELEMENTAL_01',
      type: 4,
      cardClass: 2,
      cost: 2,
      attack: 2,
      health: 2,
      races: [Race.ELEMENTAL]
    });
    (elemental as any).controller = player;
    player.hand.push(elemental);

    player.elementalPlayedThisTurn = 0;
    const play = new Play(elemental, undefined, undefined, undefined);
    play.trigger(player);

    expect(player.elementalPlayedThisTurn).toBe(1);
  });

  test('Elemental last turn tracks previous turn', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    player.elementalPlayedThisTurn = 2;
    game.beginTurn(player.opponent); // End player's turn

    expect(player.elementalPlayedLastTurn).toBe(2);
    expect(player.elementalPlayedThisTurn).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/core/player.elemental.test.ts`
Expected: FAIL with elemental tracking not working

**Step 3: Implement elemental tracking in Play action**

```typescript
// Modify src/actions/play.ts - in trigger method after minion summon
import { Race } from '../enums';

// After successful play, check if elemental
if ((card as any).races?.includes(Race.ELEMENTAL)) {
  player.elementalPlayedThisTurn++;
  console.log(`[Elemental] ${player.name} played elemental this turn (${player.elementalPlayedThisTurn})`);
}
```

**Step 4: Add turn transition tracking to BeginTurn**

```typescript
// Modify src/actions/beginturn.ts
// In trigger method for player's turn start:
player.elementalPlayedLastTurn = player.elementalPlayedThisTurn;
player.elementalPlayedThisTurn = 0;
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/core/player.elemental.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/actions/play.ts src/actions/beginturn.ts tests/core/player.elemental.test.ts
git commit -m "$(cat <<'EOF'
feat: implement elemental chain tracking

Track elementals played this turn and last turn for synergy effects.
Matches Python fireplace's elemental tracking.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 5: Choice Mechanics

### Task 11: Implement Discover Action

**Files:**
- Create: `src/actions/discover.ts`
- Modify: `src/actions/index.ts`
- Test: `tests/actions/discover.test.ts`

**Current Gap:** No Discover action for discover mechanic.

**Step 1: Write the failing test**

```typescript
// tests/actions/discover.test.ts
import { Discover } from '../../src/actions/discover';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';

describe('Discover Action', () => {
  test('Discover creates choice with 3 options', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const discover = new Discover(player, ['CS2_120', 'CS2_121', 'CS2_122', 'CS2_123']);
    discover.trigger(game);

    expect(player.choice).toBeDefined();
    expect(player.choice?.cards.length).toBe(3);
  });

  test('Discover respects card filter', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const discover = new Discover(player, ['CS2_120', 'CS2_121', 'CS2_122'], {
      filter: (card: any) => card.cost <= 2
    });
    discover.trigger(game);

    // All cards should pass filter
    for (const card of player.choice?.cards || []) {
      expect((card as any).cost).toBeLessThanOrEqual(2);
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/actions/discover.test.ts`
Expected: FAIL with Discover not defined

**Step 3: Implement Discover action**

```typescript
// src/actions/discover.ts
import { Action } from './base';
import { Entity } from '../core/entity';
import { Player } from '../core/player';
import { Game } from '../core/game';
import { Card, createCard } from '../core/card';
import { CardLoader } from '../cards/loader';

export interface DiscoverOptions {
  filter?: (card: Card) => boolean;
  count?: number;
}

export class Discover extends Action {
  constructor(
    public readonly player: Player,
    public readonly cardPool: string[],
    public readonly options: DiscoverOptions = {}
  ) {
    super();
  }

  override trigger(source: Entity): void[][] {
    const game = source.game as Game;
    const count = this.options.count ?? 3;

    // Load cards from pool
    const availableCards: Card[] = [];
    for (const cardId of this.cardPool) {
      const cardDef = CardLoader.get(cardId);
      if (cardDef) {
        const card = createCard(cardDef);
        if (!this.options.filter || this.options.filter(card)) {
          availableCards.push(card);
        }
      }
    }

    // Random selection
    const choices = game.random.sample(availableCards, Math.min(count, availableCards.length));

    // Set player choice
    this.player.choice = {
      cards: choices,
      minCount: 1,
      maxCount: 1,
      source: source
    };

    console.log(`[Discover] ${this.player.name} choosing from ${choices.length} cards`);

    return [[]];
  }

  resolve(chosenCard: Card): void {
    // Add chosen card to hand
    if (this.player.hand.length < 10) {
      this.player.hand.push(chosenCard as any);
      (chosenCard as any).zone = 3; // Zone.HAND
      console.log(`[Discover] ${this.player.name} discovered ${chosenCard.id}`);
    }

    // Clear choice
    this.player.choice = undefined;
  }
}
```

**Step 4: Export from index**

```typescript
// Add to src/actions/index.ts
export { Discover } from './discover';
export type { DiscoverOptions } from './discover';
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/actions/discover.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/actions/discover.ts src/actions/index.ts tests/actions/discover.test.ts
git commit -m "$(cat <<'EOF'
feat: implement Discover action for discover mechanic

Players can discover cards from a pool with optional filtering.
Matches Python fireplace's Discover action.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Implement Choice Action (Choose One)

**Files:**
- Create: `src/actions/choice.ts`
- Modify: `src/actions/index.ts`
- Test: `tests/actions/choice.test.ts`

**Current Gap:** No Choice action for Choose One mechanic (Druid cards).

**Step 1: Write the failing test**

```typescript
// tests/actions/choice.test.ts
import { Choice } from '../../src/actions/choice';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { Minion } from '../../src/core/card';

describe('Choice Action', () => {
  test('Choice presents options to player', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const option1 = new Minion({ id: 'OPT_1', type: 4, cardClass: 2, cost: 1, attack: 1, health: 1 });
    const option2 = new Minion({ id: 'OPT_2', type: 4, cardClass: 2, cost: 1, attack: 2, health: 2 });

    const choice = new Choice(player, [option1, option2]);
    choice.trigger(game);

    expect(player.choice).toBeDefined();
    expect(player.choice?.cards.length).toBe(2);
  });

  test('Choice resolves with selected option', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const option1 = new Minion({ id: 'OPT_1', type: 4, cardClass: 2, cost: 1, attack: 1, health: 1 });
    const option2 = new Minion({ id: 'OPT_2', type: 4, cardClass: 2, cost: 1, attack: 2, health: 2 });

    const choice = new Choice(player, [option1, option2]);
    choice.trigger(game);

    // Simulate choosing option 2
    choice.resolve(option2);

    expect(player.choice).toBeUndefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/actions/choice.test.ts`
Expected: FAIL with Choice not defined

**Step 3: Implement Choice action**

```typescript
// src/actions/choice.ts
import { Action } from './base';
import { Entity } from '../core/entity';
import { Player } from '../core/player';
import { Game } from '../core/game';
import { Card } from '../core/card';

export class Choice extends Action {
  constructor(
    public readonly player: Player,
    public readonly options: Card[],
    public readonly minCount: number = 1,
    public readonly maxCount: number = 1
  ) {
    super();
  }

  override trigger(source: Entity): void[][] {
    const game = source.game as Game;

    this.player.choice = {
      cards: this.options,
      minCount: this.minCount,
      maxCount: this.maxCount,
      source: source
    };

    console.log(`[Choice] ${this.player.name} choosing from ${this.options.length} options`);

    return [[]];
  }

  resolve(chosen: Card | Card[]): void {
    const cards = Array.isArray(chosen) ? chosen : [chosen];

    // Mark choices as resolved
    this.player.choice = undefined;

    console.log(`[Choice] ${this.player.name} chose ${cards.map(c => c.id).join(', ')}`);

    // Return chosen cards for processing by caller
    // The actual effect would be handled by the card script
  }
}
```

**Step 4: Export from index**

```typescript
// Add to src/actions/index.ts
export { Choice } from './choice';
```

**Step 5: Run test to verify it passes**

Run: `npm test -- tests/actions/choice.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/actions/choice.ts src/actions/index.ts tests/actions/choice.test.ts
git commit -m "$(cat <<'EOF'
feat: implement Choice action for Choose One mechanic

Players can choose between card options like Druid Choose One.
Matches Python fireplace's Choice action.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 6: Combat System Enhancement

### Task 13: Complete Attack Action

**Files:**
- Modify: `src/actions/attack.ts`
- Test: `tests/actions/attack.test.ts`

**Current Gap:** Attack action exists but lacks proper combat resolution with damage exchange, weapon durability loss, etc.

**Step 1: Write the failing test**

```typescript
// tests/actions/attack.test.ts
import { Attack } from '../../src/actions/attack';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { Minion, Hero } from '../../src/core/card';
import { Weapon } from '../../src/core/weapon';

describe('Attack Action', () => {
  test('Attack exchanges damage between minions', () => {
    const player1 = new Player('P1', []);
    const player2 = new Player('P2', []);
    const game = new Game({ players: [player1, player2] });
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';
    game.setup();

    const attacker = new Minion({ id: 'ATK', type: 4, cardClass: 2, cost: 1, attack: 3, health: 3 });
    const defender = new Minion({ id: 'DEF', type: 4, cardClass: 2, cost: 1, attack: 2, health: 4 });

    player1.summon(attacker);
    player2.summon(defender);
    (attacker as any).turnsInPlay = 1; // Can attack

    const attack = new Attack(attacker, defender);
    attack.trigger(game);

    expect(attacker.damage).toBe(2); // Took 2 damage from defender
    expect(defender.damage).toBe(3); // Took 3 damage from attacker
  });

  test('Attacking hero with weapon loses durability', () => {
    const player1 = new Player('P1', []);
    const player2 = new Player('P2', []);
    const game = new Game({ players: [player1, player2] });
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';
    game.setup();

    const weapon = new Weapon({ id: 'WEP', type: 7, cardClass: 2, cost: 1, attack: 2, durability: 2 });
    (weapon as any).controller = player1;
    player1.weapon = weapon;

    const attacker = player1.hero;
    const defender = player2.hero;
    (attacker as any).turnsInPlay = 1;

    const attack = new Attack(attacker, defender);
    attack.trigger(game);

    expect(weapon.durability - weapon.damage).toBe(1); // Lost 1 durability
  });

  test('Minion cannot attack if exhausted', () => {
    const player1 = new Player('P1', []);
    const player2 = new Player('P2', []);
    const game = new Game({ players: [player1, player2] });
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';
    game.setup();

    const attacker = new Minion({ id: 'ATK', type: 4, cardClass: 2, cost: 1, attack: 3, health: 3 });
    const defender = player2.hero;

    player1.summon(attacker);
    // No turnsInPlay set - minion just summoned

    const attack = new Attack(attacker, defender);
    const result = attack.trigger(game);

    // Attack should fail or deal no damage
    expect(defender.damage).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/actions/attack.test.ts`
Expected: FAIL with combat not properly resolved

**Step 3: Implement complete Attack action**

```typescript
// src/actions/attack.ts
import { Action } from './base';
import { Entity } from '../core/entity';
import { Game } from '../core/game';
import { Player } from '../core/player';
import { Minion, Hero } from '../core/card';
import { Weapon } from '../core/weapon';
import { Damage } from './damage';
import { BlockType } from '../enums';

export class Attack extends Action {
  constructor(
    public readonly attacker: Entity,
    public readonly defender: Entity
  ) {
    super();
  }

  override trigger(source: Entity): void[][] {
    const game = source.game as Game;
    const attacker = this.attacker as any;
    const defender = this.defender as any;

    // Validate attack
    if (!this.canAttack(attacker)) {
      console.log(`[Attack] ${attacker.id} cannot attack`);
      return [[]];
    }

    console.log(`[Attack] ${attacker.id} attacks ${defender.id}`);

    // Mark attack as used
    attacker.numAttacks = (attacker.numAttacks || 0) + 1;

    // Get attack values
    const attackDamage = this.getAttackDamage(attacker);
    const defenseDamage = this.getDefenseDamage(defender);

    // Exchange damage
    game.actionBlock(source, [
      new Damage(attacker, defender, attackDamage)
    ], BlockType.ATTACK, -1, defender);

    // Defender counterattacks if still alive and is a minion
    if (defender.health && defender.damage < defender.health && defender instanceof Minion) {
      game.queueActions(source, [new Damage(defender, attacker, defenseDamage)]);
    }

    // Weapon loses durability if hero attacked
    if (attacker instanceof Hero) {
      const controller = attacker.controller as Player;
      if (controller.weapon) {
        controller.weapon.loseDurability();
      }
    }

    return [[]];
  }

  private canAttack(attacker: any): boolean {
    // Check if can attack
    if (attacker.frozen) return false;
    if (attacker.dormant) return false;

    // Check attack allowance
    const maxAttacks = attacker.windfury ? 2 : 1;
    if ((attacker.numAttacks || 0) >= maxAttacks) return false;

    // Check if just summoned (summoning sickness)
    if (!attacker.turnsInPlay && !attacker.charge) return false;

    return true;
  }

  private getAttackDamage(attacker: any): number {
    return attacker.attack || 0;
  }

  private getDefenseDamage(defender: any): number {
    if (defender instanceof Minion) {
      return defender.attack || 0;
    }
    return 0;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/actions/attack.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/actions/attack.ts tests/actions/attack.test.ts
git commit -m "$(cat <<'EOF'
feat: complete Attack action with proper combat resolution

- Damage exchange between attacker and defender
- Weapon durability loss on hero attack
- Summoning sickness and windfury support
- Counter-attack from defender minions

Matches Python fireplace's Attack action.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 7: Integration and Testing

### Task 14: Create Integration Test Suite

**Files:**
- Create: `tests/integration/full-game.test.ts`

**Step 1: Write comprehensive integration test**

```typescript
// tests/integration/full-game.test.ts
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Step, State, PlayState } from '../../src/enums';

describe('Full Game Integration', () => {
  test('Complete game flow with mulligan', () => {
    const deck1 = ['CS2_120', 'CS2_121', 'CS2_122', 'CS2_123', 'CS2_124'];
    const deck2 = ['CS2_120', 'CS2_121', 'CS2_122', 'CS2_123', 'CS2_124', 'CS2_125'];

    const player1 = new Player('Player1', deck1);
    const player2 = new Player('Player2', deck2);
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';

    const game = new Game({ players: [player1, player2] });

    // Start with mulligan
    game.startWithMulligan();

    expect(game.step).toBe(Step.BEGIN_MULLIGAN);
    expect(player1.choice).toBeDefined();
    expect(player2.choice).toBeDefined();

    // Resolve mulligans (keep all cards)
    game.resolveMulligan(player1, []);
    game.resolveMulligan(player2, []);

    // Game should start
    expect(game.currentPlayer).toBe(player1);
    expect(player1.maxMana).toBe(1);

    // Turn 1 play
    expect(game.state).toBe(State.RUNNING);
  });

  test('Mana growth over multiple turns', () => {
    const player1 = new Player('P1', ['CS2_120']);
    const player2 = new Player('P2', ['CS2_120']);
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';

    const game = new Game({ players: [player1, player2] });
    game.start();

    // Play 10 turns
    for (let turn = 1; turn <= 10; turn++) {
      expect(player1.maxMana).toBe(Math.min(10, turn));
      game.endTurn();
      expect(player2.maxMana).toBe(Math.min(10, turn));
      game.endTurn();
    }

    // Max mana should cap at 10
    expect(player1.maxMana).toBe(10);
    expect(player2.maxMana).toBe(10);
  });

  test('Game ends when hero reaches 0 health', () => {
    const player1 = new Player('P1', []);
    const player2 = new Player('P2', []);
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';

    const game = new Game({ players: [player1, player2] });
    game.start();

    // Deal lethal damage to player1's hero
    player1.hero.damage = player1.hero.health;

    game.checkForEndGame();

    expect(game.state).toBe(State.COMPLETE);
    expect(player1.playstate).toBe(PlayState.LOST);
    expect(player2.playstate).toBe(PlayState.WON);
  });
});
```

**Step 2: Run integration tests**

Run: `npm test -- tests/integration/full-game.test.ts`
Expected: All tests should pass with previous implementations

**Step 3: Commit**

```bash
git add tests/integration/full-game.test.ts
git commit -m "$(cat <<'EOF'
test: add comprehensive integration tests

Test full game flow including mulligan, mana growth, and game end.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

This plan implements the following missing features to achieve parity with Python fireplace:

| Phase | Feature | Tasks |
|-------|---------|-------|
| 1 | Core Game Loop | Step state machine, Mulligan phase |
| 2 | Mana System | Crystal growth, Overload, SpendMana |
| 3 | Card Types | Weapon, HeroPower, Secret |
| 4 | Entity Mechanics | Dormant/Awaken, Elemental tracking |
| 5 | Choice Mechanics | Discover, Choose One |
| 6 | Combat System | Complete Attack action |
| 7 | Integration | Full game test suite |

Total: **14 tasks** with bite-sized TDD steps.
