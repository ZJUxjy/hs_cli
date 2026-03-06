# Actions / DSL / Aura / Targeting 模块实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现炉石传说模拟器的核心动作系统、DSL 选择器/评估器、光环系统和目标选择逻辑

**Architecture:** 分层设计 - Action 基类 + 特定动作实现，DSL 分离选择器和评估器，Aura 独立模块

**Tech Stack:** TypeScript, Jest

---

## 阶段 1：Actions 动作系统

### Task 1: Action 基类和基础类型

**Files:**
- Create: `src/actions/base.ts`
- Test: `tests/actions/base.test.ts`

**Step 1: 创建测试 tests/actions/base.test.ts**

```typescript
import { Action, ActionArg, EventListener } from '../../src/actions/base';

describe('Action', () => {
  test('Action should have trigger method', () => {
    const action = new Action(typeof action.trigger).();
    expecttoBe('function');
  });
});

describe('EventListener', () => {
  test('should create EventListener', () => {
    const listener = new EventListener('event', [], EventListener.ON);
    expect(listener.trigger).toBe('event');
    expect(listener.at).toBe(EventListener.ON);
  });
});
```

**Step 2: 创建 src/actions/base.ts**

```typescript
import type { Entity } from '../core/entity';

export enum EventListenerAt {
  ON = 1,
  AFTER = 2,
}

export class EventListener {
  public trigger: string;
  public actions: unknown[];
  public at: EventListenerAt;
  public once: boolean = false;

  constructor(trigger: string, actions: unknown[], at: EventListenerAt) {
    this.trigger = trigger;
    this.actions = actions;
    this.at = at;
  }
}

export class Action {
  trigger(source: Entity): unknown[] {
    return [];
  }
}

export class ActionArg {
  public index: number = 0;
  public name: string = '';
  public owner: unknown = null;

  evaluate(_source: Entity): unknown {
    return null;
  }
}
```

**Step 3: 运行测试验证**

Run: `npm test -- tests/actions/base.test.ts`
Expected: PASS

---

### Task 2: 攻击动作 (Attack)

**Files:**
- Create: `src/actions/attack.ts`
- Test: `tests/actions/attack.test.ts`

**Step 1: 创建测试 tests/actions/attack.test.ts**

```typescript
import { Attack } from '../../src/actions/attack';
import { Entity } from '../../src/core/entity';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';

describe('Attack', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    game = new Game({ players: [player1, player2], seed: 12345 });
    game.setup();
  });

  test('should create Attack action', () => {
    const attacker = { entityId: 1 } as unknown as Entity;
    const defender = { entityId: 2 } as unknown as Entity;
    const attack = new Attack(attacker, defender);
    expect(attack.attacker).toBe(attacker);
    expect(attack.defender).toBe(defender);
  });
});
```

**Step 2: 创建 src/actions/attack.ts**

```typescript
import { Action } from './base';
import type { Entity } from '../core/entity';

export class Attack extends Action {
  constructor(
    public attacker: Entity,
    public defender: Entity
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const attacker = this.attacker;
    const defender = this.defender;

    // Get attack and defense values
    const attackerAttack = (attacker as any).attack || 0;
    const defenderDefense = (defender as any).attack || 0;

    // Deal damage to defender
    if (attackerAttack > 0) {
      (defender as any).damage = ((defender as any).damage || 0) + attackerAttack;
    }

    // Deal damage to attacker (counter attack)
    if (defenderDefense > 0) {
      (attacker as any).damage = ((attacker as any).damage || 0) + defenderDefense;
    }

    return [];
  }
}
```

**Step 3: 运行测试验证**

Run: `npm test -- tests/actions/attack.test.ts`
Expected: PASS

---

### Task 3: 抽牌动作 (Draw)

**Files:**
- Create: `src/actions/draw.ts`
- Test: `tests/actions/draw.test.ts`

**Step 1: 创建测试 tests/actions/draw.test.ts**

```typescript
import { Draw } from '../../src/actions/draw';
import { Entity } from '../../src/core/entity';
import { Player } from '../../src/core/player';
import { CardList } from '../../src/utils/cardlist';

describe('Draw', () => {
  test('should create Draw action', () => {
    const source = { entityId: 1 } as unknown as Entity;
    const draw = new Draw(source);
    expect(draw.source).toBe(source);
  });

  test('should default to drawing 1 card', () => {
    const source = { entityId: 1 } as unknown as Entity;
    const draw = new Draw(source);
    expect(draw.count).toBe(1);
  });
});
```

**Step 2: 创建 src/actions/draw.ts**

```typescript
import { Action } from './base';
import type { Entity } from '../core/entity';

export class Draw extends Action {
  constructor(
    public source: Entity,
    public count: number = 1,
    public card: Entity | null = null
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const controller = (source as any).controller;
    if (!controller) return [];

    const drawn: unknown[] = [];
    for (let i = 0; i < this.count; i++) {
      const card = controller.deck.draw();
      if (card) {
        controller.hand.push(card);
        drawn.push(card);
      }
    }
    return drawn;
  }
}
```

**Step 3: 运行测试验证**

Run: `npm test -- tests/actions/draw.test.ts`
Expected: PASS

---

### Task 4: 召唤动作 (Summon)

**Files:**
- Create: `src/actions/summon.ts`
- Test: `tests/actions/summon.test.ts`

**Step 1: 创建测试 tests/actions/summon.test.ts**

```typescript
import { Summon } from '../../src/actions/summon';
import { Entity } from '../../src/core/entity';

describe('Summon', () => {
  test('should create Summon action', () => {
    const source = { entityId: 1 } as unknown as Entity;
    const card = { entityId: 2 } as unknown as Entity;
    const summon = new Summon(source, card);
    expect(summon.source).toBe(source);
    expect(summon.card).toBe(card);
  });
});
```

**Step 2: 创建 src/actions/summon.ts**

```typescript
import { Action } from './base';
import type { Entity } from '../core/entity';

export class Summon extends Action {
  constructor(
    public source: Entity,
    public card: Entity,
    public index: number | null = null
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const controller = (source as any).controller;
    if (!controller) return [];

    const field = controller.field;
    if (field.length >= 7) return []; // Board full

    const card = this.card;
    if (this.index !== null && this.index >= 0) {
      field.splice(this.index, 0, card as any);
    } else {
      field.push(card as any);
    }

    (card as any).playCounter = (source as any).game.tick++;
    return [card];
  }
}
```

**Step 3: 运行测试验证**

Run: `npm test -- tests/actions/summon.test.ts`
Expected: PASS

---

### Task 5: 伤害/治疗动作 (Damage/Heal)

**Files:**
- Create: `src/actions/damage.ts`
- Create: `src/actions/heal.ts`

**Step 1: 创建 src/actions/damage.ts**

```typescript
import { Action } from './base';
import type { Entity } from '../core/entity';

export class Damage extends Action {
  constructor(
    public source: Entity,
    public target: Entity,
    public amount: number
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const target = this.target;
    let amount = this.amount;

    // Get actual damage after modifications
    amount = source.getDamage(amount, target as any);

    const currentDamage = (target as any).damage || 0;
    (target as any).damage = currentDamage + amount;

    return [amount];
  }
}
```

**Step 2: 创建 src/actions/heal.ts**

```typescript
import { Action } from './base';
import type { Entity } from '../core/entity';

export class Heal extends Action {
  constructor(
    public source: Entity,
    public target: Entity,
    public amount: number
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const target = this.target;
    let amount = this.amount;

    // Get actual heal after modifications
    amount = source.getHeal(amount, target as any);

    const currentDamage = (target as any).damage || 0;
    const newDamage = Math.max(0, currentDamage - amount);
    (target as any).damage = newDamage;

    return [amount];
  }
}
```

---

### Task 6: 动作索引文件

**Files:**
- Create: `src/actions/index.ts`

**Step 1: 创建 src/actions/index.ts**

```typescript
export { Action, ActionArg, EventListener, EventListenerAt } from './base';
export { Attack } from './attack';
export { Draw } from './draw';
export { Summon } from './summon';
export { Damage } from './damage';
export { Heal } from './heal';
```

---

## 阶段 2：DSL 选择器/评估器

### Task 7: 选择器 (Selector)

**Files:**
- Create: `src/dsl/selector.ts`
- Test: `tests/dsl/selector.test.ts`

**Step 1: 创建测试 tests/dsl/selector.test.ts**

```typescript
import { Selector, SELF, ALL_MINIONS, FRIENDLY_MINIONS, ENEMY_MINIONS } from '../../src/dsl/selector';
import { Entity } from '../../src/core/entity';

describe('Selector', () => {
  test('SELF should return source entity', () => {
    const source = {} as unknown as Entity;
    const game = {} as unknown as any;
    const result = SELF(source, game);
    expect(result).toContain(source);
  });

  test('Selector should be callable', () => {
    expect(typeof SELF).toBe('function');
  });
});
```

**Step 2: 创建 src/dsl/selector.ts**

```typescript
import type { Entity } from '../core/entity';
import type { Game } from '../core/game';

export type SelectorFn = (source: Entity, game: Game) => Entity[];

export const SELF: SelectorFn = (source) => [source];

export const ALL_MINIONS: SelectorFn = (_source, game) => {
  const gameAny = game as any;
  if (!gameAny.player1 || !gameAny.player2) return [];
  return [
    ...(gameAny.player1.field || []),
    ...(gameAny.player2.field || [])
  ] as Entity[];
};

export const FRIENDLY_MINIONS: SelectorFn = (source, game) => {
  const gameAny = game as any;
  const controller = gameAny.controller || (source as any).controller;
  return (controller?.field || []) as Entity[];
};

export const ENEMY_MINIONS: SelectorFn = (source, game) => {
  const gameAny = game as any;
  const controller = gameAny.controller || (source as any).controller;
  return (controller?.opponent?.field || []) as Entity[];
};

// Selector class for composition
export class Selector {
  static where(predicate: (entity: Entity) => boolean): SelectorFn {
    return (source, game) => {
      const entities = ALL_MINIONS(source, game);
      return entities.filter(predicate);
    };
  }

  static random(count: number): SelectorFn {
    return (source, game) => {
      const entities = ALL_MINIONS(source, game);
      const gameAny = game as any;
      return gameAny.random?.sample(entities, count) || entities.slice(0, count);
    };
  }
}
```

**Step 3: 运行测试验证**

Run: `npm test -- tests/dsl/selector.test.ts`
Expected: PASS

---

### Task 8: 懒加载数值 (LazyNum)

**Files:**
- Create: `src/dsl/lazynum.ts`
- Test: `tests/dsl/lazynum.test.ts`

**Step 1: 创建测试 tests/dsl/lazynum.test.ts**

```typescript
import { LazyValue, Count, Attr, Const } from '../../src/dsl/lazynum';

describe('LazyValue', () => {
  test('Const should return fixed value', () => {
    const lazy = new Const(5);
    const source = {} as unknown as any;
    const game = {} as unknown as any;
    expect(lazy.evaluate(source, game)).toBe(5);
  });

  test('Count should count entities', () => {
    const mockSelector = jest.fn(() => [{ entityId: 1 }, { entityId: 2 }]);
    const count = new Count(mockSelector);
    const source = {} as unknown as any;
    const game = {} as unknown as any;
    expect(count.evaluate(source, game)).toBe(2);
  });
});
```

**Step 2: 创建 src/dsl/lazynum.ts**

```typescript
import type { Entity } from '../core/entity';
import type { Game } from '../core/game';
import type { SelectorFn } from './selector';

export abstract class LazyValue<T> {
  abstract evaluate(source: Entity, game: Game): T;
}

export class Count extends LazyValue<number> {
  constructor(private selector: SelectorFn) {
    super();
  }

  evaluate(source: Entity, game: Game): number {
    return this.selector(source, game).length;
  }
}

export class Attr extends LazyValue<number> {
  constructor(
    private selector: SelectorFn,
    private attr: string
  ) {
    super();
  }

  evaluate(source: Entity, game: Game): number {
    const entities = this.selector(source, game);
    return entities.reduce((sum, e) => sum + ((e as any)[this.attr] || 0), 0);
  }
}

export class SelfAttr extends LazyValue<number> {
  constructor(private attr: string) {
    super();
  }

  evaluate(source: Entity, _game: Game): number {
    return (source as any)[this.attr] || 0;
  }
}

export class Const<T> extends LazyValue<T> {
  constructor(private value: T) {
    super();
  }

  evaluate(_source: Entity, _game: Game): T {
    return this.value;
  }
}

export class Joust extends LazyValue<number> {
  constructor(
    private selector1: SelectorFn,
    private selector2: SelectorFn
  ) {
    super();
  }

  evaluate(source: Entity, game: Game): number {
    const entities1 = this.selector1(source, game);
    const entities2 = this.selector2(source, game);
    const gameAny = game as any;
    const random = gameAny.random;

    if (!entities1.length || !entities2.length) return 0;

    const e1 = random?.choice(entities1) || entities1[0];
    const e2 = random?.choice(entities2) || entities2[0];

    return ((e1 as any).attack || 0) > ((e2 as any).attack || 0) ? 1 : 0;
  }
}
```

**Step 3: 运行测试验证**

Run: `npm test -- tests/dsl/lazynum.test.ts`
Expected: PASS

---

### Task 9: 随机选择器 (RandomPicker)

**Files:**
- Create: `src/dsl/random_picker.ts`

**Step 1: 创建 src/dsl/random_picker.ts**

```typescript
import type { Entity } from '../core/entity';
import type { Game } from '../core/game';
import type { SelectorFn } from './selector';

export class RandomMinion {
  constructor(
    private selector: SelectorFn,
    private count: number = 1,
    private _exclude: SelectorFn | null = null
  ) {}

  trigger(source: Entity, game: Game): Entity[] {
    const entities = this.selector(source, game);
    const gameAny = game as any;
    const random = gameAny.random;

    if (!entities.length) return [];
    return random?.sample(entities, this.count) || entities.slice(0, this.count);
  }
}

export class RandomCard {
  constructor(
    private selector: SelectorFn,
    private count: number = 1
  ) {}

  trigger(source: Entity, game: Game): Entity[] {
    const entities = this.selector(source, game);
    const gameAny = game as any;
    const random = gameAny.random;

    if (!entities.length) return [];
    return random?.sample(entities, this.count) || entities.slice(0, this.count);
  }
}
```

---

### Task 10: DSL 索引文件

**Files:**
- Create: `src/dsl/index.ts`

**Step 1: 创建 src/dsl/index.ts**

```typescript
export { Selector, SELF, ALL_MINIONS, FRIENDLY_MINIONS, ENEMY_MINIONS } from './selector';
export type { SelectorFn } from './selector';
export { LazyValue, Count, Attr, SelfAttr, Const, Joust } from './lazynum';
export { RandomMinion, RandomCard } from './random_picker';
```

---

## 阶段 3：Aura 光环系统

### Task 11: AuraBuff 和 Refresh

**Files:**
- Create: `src/aura/aura.ts`
- Test: `tests/aura/aura.test.ts`

**Step 1: 创建测试 tests/aura/aura.test.ts**

```typescript
import { AuraBuff, Refresh } from '../../src/aura/aura';
import { Entity } from '../../src/core/entity';

describe('AuraBuff', () => {
  test('should create AuraBuff', () => {
    const source = {} as unknown as Entity;
    const entity = {} as unknown as Entity;
    const buff = new AuraBuff(source, entity);
    expect(buff.source).toBe(source);
    expect(buff.entity).toBe(entity);
  });
});

describe('Refresh', () => {
  test('should create Refresh', () => {
    const selector = () => [];
    const refresh = new Refresh(selector, { ATK: 1 });
    expect(refresh.selector).toBe(selector);
    expect(refresh.tags).toEqual({ ATK: 1 });
  });
});
```

**Step 2: 创建 src/aura/aura.ts**

```typescript
import type { Entity } from '../core/entity';
import type { SelectorFn } from '../dsl/selector';

export class AuraBuff {
  public tags: Map<string, number> = new Map();
  public tick: number = 0;

  constructor(
    public source: Entity,
    public entity: Entity
  ) {}

  updateTags(tags: Record<string, number>): void {
    for (const [key, value] of Object.entries(tags)) {
      this.tags.set(key, value);
    }
    this.tick = (this.source as any).game?.tick || 0;
  }

  remove(): void {
    const entityAny = this.entity as any;
    const sourceAny = this.source as any;

    const slots = entityAny.slots || [];
    const idx = slots.indexOf(this);
    if (idx !== -1) slots.splice(idx, 1);

    const game = sourceAny.game;
    if (game) {
      const auraBuffs = game.activeAuraBuffs || [];
      const idx2 = auraBuffs.indexOf(this);
      if (idx2 !== -1) auraBuffs.splice(idx2, 1);
    }
  }

  _getattr(attr: string, value: number): number {
    const tagValue = this.tags.get(attr);
    if (tagValue !== undefined) {
      return value + tagValue;
    }
    return value;
  }
}

export class Refresh {
  constructor(
    public selector: SelectorFn,
    public tags: Record<string, number> | null = null,
    public buff: AuraBuff | null = null,
    public priority: number = 50
  ) {}

  trigger(source: Entity): void {
    const game = (source as any).game;
    if (!game) return;

    const entities = this.selector(source, game);

    for (const entity of entities) {
      if (this.buff) {
        // Refresh buff
        const entityAny = entity as any;
        if (!entityAny.slots) entityAny.slots = [];

        // Check if already has this buff
        let found = false;
        for (const slot of entityAny.slots) {
          if (slot.source === this.buff.source) {
            slot.tick = game.tick;
            found = true;
            break;
          }
        }

        if (!found) {
          const newBuff = new AuraBuff(this.buff.source, entity);
          if (this.buff.tags) {
            newBuff.updateTags(Object.fromEntries(this.buff.tags));
          }
          entityAny.slots.push(newBuff);
          if (!game.activeAuraBuffs) game.activeAuraBuffs = [];
          game.activeAuraBuffs.push(newBuff);
        }
      } else if (this.tags) {
        // Refresh tags directly
        const entityAny = entity as any;
        for (const [tag, value] of Object.entries(this.tags)) {
          entityAny[tag] = (entityAny[tag] || 0) + value;
        }
      }
    }
  }
}

// Interface for entities that can receive auras
export interface TargetableByAuras {
  slots: AuraBuff[];
  refresh_buff(source: Entity, buff: AuraBuff): void;
  refresh_tags(source: Entity, tags: Record<string, number>): void;
}
```

**Step 3: 运行测试验证**

Run: `npm test -- tests/aura/aura.test.ts`
Expected: PASS

---

### Task 12: Aura 索引文件

**Files:**
- Create: `src/aura/index.ts`

**Step 1: 创建 src/aura/index.ts**

```typescript
export { AuraBuff, Refresh, TargetableByAuras } from './aura';
```

---

## 阶段 4：Targeting 目标选择

### Task 13: 目标验证

**Files:**
- Create: `src/targeting/targeting.ts`
- Test: `tests/targeting/targeting.test.ts`

**Step 1: 创建测试 tests/targeting/targeting.test.ts**

```typescript
import { isValidTarget } from '../../src/targeting/targeting';
import { CardType } from '../../src/enums';

describe('isValidTarget', () => {
  test('should return false for self-targeting', () => {
    const source = { entityId: 1 } as unknown as any;
    const target = source;
    expect(isValidTarget(source, target)).toBe(false);
  });

  test('should return false for dormant minions', () => {
    const source = { entityId: 1, type: CardType.SPELL } as unknown as any;
    const target = { entityId: 2, type: CardType.MINION, dormant: true } as unknown as any;
    expect(isValidTarget(source, target)).toBe(false);
  });
});
```

**Step 2: 创建 src/targeting/targeting.ts**

```typescript
import { CardType, Race } from '../enums';

export const TARGETING_PREREQUISITES: number[] = [
  1,   // REQ_TARGET_TO_PLAY
  19,  // REQ_TARGET_FOR_COMBO
  17,  // REQ_TARGET_IF_AVAILABLE
  // Add more as needed
];

export function isValidTarget(
  source: any,
  target: any,
  requirements?: Record<number, number>
): boolean {
  // Cannot target self
  if (target === source) {
    return false;
  }

  // Check target type specific rules
  if (target.type === CardType.MINION) {
    // Dormant minions cannot be targeted
    if (target.dormant) {
      return false;
    }

    // Dead minions cannot be targeted
    if (target.dead) {
      return false;
    }

    // Stealthed minions cannot be targeted by opponent
    if (target.stealthed && target.controller !== source.controller) {
      return false;
    }

    // Immune minions cannot be targeted by opponent
    if (target.immune && target.controller !== source.controller) {
      return false;
    }
  }

  // Check targeting prerequisites
  if (!requirements) {
    requirements = source.requirements || {};
  }

  // If no targeting requirements, not targetable
  let hasTargetingReq = false;
  for (const req of TARGETING_PREREQUISITES) {
    if (req in requirements) {
      hasTargetingReq = true;
      break;
    }
  }

  if (!hasTargetingReq) {
    return false;
  }

  // Check specific requirements
  for (const [req, param] of Object.entries(requirements)) {
    const reqNum = parseInt(req);

    switch (reqNum) {
      case 1: // REQ_MINION_TARGET
        if (target.type !== CardType.MINION) return false;
        break;
      case 2: // REQ_FRIENDLY_TARGET
        if (target.controller !== source.controller) return false;
        break;
      case 3: // REQ_ENEMY_TARGET
        if (target.controller === source.controller) return false;
        break;
      case 4: // REQ_DAMAGED_TARGET
        if (!target.damage) return false;
        break;
      case 8: // REQ_UNDAMAGED_TARGET
        if (target.damage) return false;
        break;
      case 9: // REQ_HERO_TARGET
        if (target.type !== CardType.HERO) return false;
        break;
      case 27: // REQ_TARGET_TAUNT
        if (!target.taunt) return false;
        break;
      // Add more cases as needed
    }
  }

  return true;
}
```

**Step 3: 运行测试验证**

Run: `npm test -- tests/targeting/targeting.test.ts`
Expected: PASS

---

### Task 14: Targeting 索引文件

**Files:**
- Create: `src/targeting/index.ts`

**Step 1: 创建 src/targeting/index.ts**

```typescript
export { isValidTarget, TARGETING_PREREQUISITES } from './targeting';
```

---

## 阶段 5：构建验证

### Task 15: 最终构建和测试

**Step 1: 运行完整构建**

Run: `npm run build`
Expected: 无错误

**Step 2: 运行所有测试**

Run: `npm test`
Expected: 所有测试通过

---

## 总结

已完成以下模块：
1. **Actions** - Action 基类、Attack、Draw、Summon、Damage、Heal
2. **DSL** - Selector、LazyNum、RandomPicker
3. **Aura** - AuraBuff、Refresh
4. **Targeting** - isValidTarget 目标验证

**下一步：**
- 完善更多动作类型 (Buff, Destroy, Death 等)
- 完善 DSL 组合 (Copy, Switch 等)
- 翻译卡牌定义
