# js-fireplace TypeScript 重写实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 Python 炉石传说模拟器 fireplace 翻译为 TypeScript 实现，搭建基础框架

**Architecture:** 分层架构：核心层(core) → 动作层(actions) → 卡牌层(cards)，支持多语言

**Tech Stack:** TypeScript, Jest, CommonJS, uuid

---

## 阶段 1：项目初始化

### Task 1: 创建项目配置文件

**Files:**
- Create: `/home/xjingyao/code/js_fireplace/package.json`
- Create: `/home/xjingyao/code/js_fireplace/tsconfig.json`
- Create: `/home/xjingyao/code/js_fireplace/jest.config.js`
- Create: `/home/xjingyao/code/js_fireplace/.eslintrc.js`

**Step 1: 创建 package.json**

```json
{
  "name": "js-fireplace",
  "version": "0.1.0",
  "description": "A Hearthstone simulator in TypeScript",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "clean": "rm -rf dist"
  },
  "keywords": ["hearthstone", "simulator", "game", "typescript"],
  "license": "AGPL-3.0-or-later",
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "@types/node": "^20.11.0",
    "@types/uuid": "^9.0.7",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.2",
    "typescript": "^5.3.3"
  },
  "dependencies": {
    "uuid": "^9.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Step 2: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 3: 创建 jest.config.js**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
```

**Step 4: 创建 .eslintrc.js**

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
};
```

**Step 5: 安装依赖**

Run: `cd /home/xjingyao/code/js_fireplace && npm install`

---

### Task 2: 创建目录结构

**Files:**
- Create: `src/core/`
- Create: `src/actions/`
- Create: `src/cards/`
- Create: `src/cards/classic/`
- Create: `src/cards/basic/`
- Create: `src/dsl/`
- Create: `src/aura/`
- Create: `src/targeting/`
- Create: `src/enums/`
- Create: `src/i18n/`
- Create: `src/i18n/locales/`
- Create: `src/utils/`
- Create: `tests/core/`
- Create: `tests/actions/`
- Create: `tests/cards/`
- Create: `tests/dsl/`
- Create: `tests/i18n/`

Run: `mkdir -p /home/xjingyao/code/js_fireplace/src/{core,actions,cards/classic,cards/basic,dsl,aura,targeting,enums,i18n/locales,utils} /home/xjingyao/code/js_fireplace/tests/{core,actions,cards,dsl,i18n}`

---

## 阶段 2：枚举定义

### Task 3: 创建枚举文件

**Files:**
- Create: `src/enums/cardtype.ts`
- Create: `src/enums/cardclass.ts`
- Create: `src/enums/rarity.ts`
- Create: `src/enums/race.ts`
- Create: `src/enums/zone.ts`
- Create: `src/enums/state.ts`
- Create: `src/enums/step.ts`
- Create: `src/enums/playstate.ts`
- Create: `src/enums/blocktype.ts`
- Create: `src/enums/tags.ts`
- Create: `src/enums/playreq.ts`
- Create: `src/enums/index.ts`

**Step 1: 创建 src/enums/cardtype.ts**

```typescript
export const enum CardType {
  INVALID = 0,
  GAME = 1,
  PLAYER = 2,
  HERO = 3,
  MINION = 4,
  SPELL = 5,
  ENCHANTMENT = 6,
  WEAPON = 7,
  ITEM = 8,
  TOKEN = 9,
  HERO_POWER = 10,
  LOCATION = 11,
}
```

**Step 2: 创建 src/enums/cardclass.ts**

```typescript
export const enum CardClass {
  INVALID = 0,
  DEATHKNIGHT = 1,
  DRUID = 2,
  HUNTER = 3,
  MAGE = 4,
  PALADIN = 5,
  PRIEST = 6,
  ROGUE = 7,
  SHAMAN = 8,
  WARLOCK = 9,
  WARRIOR = 10,
  DREAM = 11,
  NEUTRAL = 12,
  WHIZBANG = 13,
  DEMONHUNTER = 14,
}
```

**Step 3: 创建 src/enums/rarity.ts**

```typescript
export const enum Rarity {
  INVALID = 0,
  COMMON = 1,
  FREE = 2,
  RARE = 3,
  EPIC = 4,
  LEGENDARY = 5,
  UNKNOWN_6 = 6,
}
```

**Step 4: 创建 src/enums/race.ts**

```typescript
export const enum Race {
  INVALID = 0,
  BLOODELF = 1,
  DRAENEI = 2,
  DWARF = 3,
  GNOME = 4,
  GOBLIN = 5,
  HUMAN = 6,
  NIGHTELF = 7,
  ORC = 8,
  TAUREN = 9,
  TROLL = 10,
  UNDEAD = 11,
  WORGEN = 12,
  GOBLIN2 = 13,
  MURLOC = 14,
  DEMON = 15,
  SCOURGE = 16,
  MECHANICAL = 17,
  ELEMENTAL = 18,
  OGRE = 19,
  BEAST = 20,
  PET = 21,
  TOTEM = 22,
  PIRATE = 23,
  DRAGON = 24,
  BLANK = 25,
  ALL = 26,
  EGG = 38,
  NAGA = 92,
}
```

**Step 5: 创建 src/enums/zone.ts**

```typescript
export const enum Zone {
  INVALID = 0,
  PLAY = 1,
  DECK = 2,
  HAND = 3,
  GRAVEYARD = 4,
  REMOVEDFROMGAME = 5,
  SETASIDE = 6,
  SECRET = 7,
}
```

**Step 6: 创建 src/enums/state.ts**

```typescript
export const enum State {
  INVALID = 0,
  RUNNING = 1,
  COMPLETE = 2,
}
```

**Step 7: 创建 src/enums/step.ts**

```typescript
export const enum Step {
  INVALID = 0,
  BEGIN_FIRST = 1,
  BEGIN_SHUFFLE = 2,
  BEGIN_DRAW = 3,
  BEGIN_MULLIGAN = 4,
  MAIN_BEGIN = 5,
  MAIN_READY = 6,
  MAIN_START_TRIGGERS = 7,
  MAIN_RESOURCE = 8,
  MAIN_DRAW = 9,
  MAIN_START = 10,
  MAIN_ACTION = 11,
  MAIN_COMBAT = 12,
  MAIN_END = 13,
  MAIN_NEXT = 14,
  FINAL_WRAPUP = 15,
  FINAL_GAMEOVER = 16,
  MAIN_CLEANUP = 17,
  MAIN_START_MULLIGAN = 18,
}
```

**Step 8: 创建 src/enums/playstate.ts**

```typescript
export const enum PlayState {
  INVALID = 0,
  PLAYING = 1,
  WINNING = 2,
  LOSING = 3,
  WON = 4,
  LOST = 5,
  TIED = 6,
  DISCONNECTED = 7,
  CONCEDED = 8,
}
```

**Step 9: 创建 src/enums/blocktype.ts**

```typescript
export const enum BlockType {
  ATTACK = 1,
  JOUST = 2,
  POWER = 3,
  TRIGGER = 5,
  DEATHS = 6,
  PLAY = 8,
  FATALITY = 9,
  RITUAL = 10,
  REVEAL_CARD = 11,
  GAME_RESET = 12,
  MOVE_MINION = 14,
}
```

**Step 10: 创建 src/enums/tags.ts**

```typescript
export const enum InternalTag {
  KILLED_THIS_TURN = -10,
  ALWAYS_WINS_BRAWLS = -11,
  CANT_OVERLOAD = -12,
  EXTRA_BATTLECRIES = -13,
  DISCARDED = -14,
  MURLOCS_COST_HEALTH = -15,
  CAST_ON_FRIENDLY_MINIONS = -16,
  UNLIMITED_ATTACKS = -17,
  ELEMENTAL_PLAYED_LAST_TURN = -18,
  HEROPOWER_DISABLED = -19,
  EXTRA_END_TURN_EFFECT = -20,
  PASSIVE_HERO_POWER = -21,
  KEEP_BUFF = -22,
  DAMAGED_THIS_TURN = -23,
  MINION_EXTRA_COMBOS = -24,
  MINION_EXTRA_BATTLECRIES = -25,
  EXTRA_TRIGGER_SECRET = -26,
  CAST_ON_FRIENDLY_CHARACTERS = -27,
  CUSTOM_CARDTEXT = -28,
  ACTIVATIONS_THIS_TURN = -29,
}
```

**Step 11: 创建 src/enums/playreq.ts**

```typescript
export const enum PlayReq {
  INVALID = -1,
  REQ_MINION_TARGET = 1,
  REQ_FRIENDLY_TARGET = 2,
  REQ_ENEMY_TARGET = 3,
  REQ_DAMAGED_TARGET = 4,
  REQ_FREEZE_TARGET = 5,
  REQ_CHARGE_TARGET = 6,
  REQ_TARGET_MAX_ATTACK = 7,
  REQ_UNDAMAGED_TARGET = 8,
  REQ_HERO_TARGET = 9,
  REQ_SECRET_ZONE_CAP = 10,
  REQ_SECRET_CAP = 11,
  REQ_SECRET_CAP_3 = 12,
  REQ_ATTACK_GREATER_THAN_0 = 13,
  REQ_ATTACK_BETWEEN_ENEMY_MINIONS = 14,
  REQ_MINION_CAP = 15,
  REQ_MINION_CAP_3 = 16,
  REQ_TARGET_IF_AVAILABLE = 17,
  REQ_MINIMUM_ENEMY_MINIONS = 18,
  REQ_TARGET_FOR_COMBO = 19,
  REQ_NOT_MINION_DESTROYED = 20,
  REQ_NOT_EXHAUSTED_SOURCE = 21,
  REQ_NOT_EXHAUSTED_TARGET = 22,
  REQ_NOT_SECRET_TARGET = 23,
  REQ_STEALTHED_TARGET = 24,
  REQ_TARGET_NOT_STEALTHED = 25,
  REQ_ATTACKABLE_BY_COMBO = 26,
  REQ_TARGET_TAUNT = 27,
  REQ_TARGET_SPELLPOWER = 28,
  REQ_TARGET_RACE = 29,
  REQ_TARGET_IS_NOT_SELF = 30,
  REQ_NON_SECRET_TARGET = 31,
  REQ_TARGET_IS_MAX_ATTACK = 32,
  REQ_TARGET_NOT_DESTROYED = 33,
  REQ_NOT_HAND_TARGET = 34,
  REQ_TARGET_NOT_GRAVEYARD = 35,
  REQ_TARGET_NOT_LOOT = 36,
  REQ_ENEMY_TARGET_NOT_LOOT = 37,
  REQ_TARGET_NOT_MARKED = 38,
  REQ_BATTLECRIE_QUALIFIER = 39,
  REQ_TARGET_6_COST = 40,
  REQ_TARGET_7_COST = 41,
  REQ_TARGET_8_COST = 42,
  REQ_TARGET_9_COST = 43,
  REQ_TARGET_10_COST = 44,
  REQ_TARGET_MIN_ATTACK = 45,
  REQ_CAN_BE_ATTACKED = 46,
  REQ_TARGET_SLUDGE_COST = 47,
  REQ_TARGET_WITH_DEATHRATTLE = 48,
  REQ_TARGET_WOTOG = 49,
  REQ_TARGET_IS_RACE = 50,
  REQ_TARGET_NOT_DORMANT = 51,
  REQ_TARGET_IS_GUARDIAN = 52,
  REQ_TARGET_IS_NOT_ASLEEP = 53,
  REQ_TARGET_NOT_BURNED = 54,
}
```

**Step 12: 创建 src/enums/index.ts**

```typescript
export * from './cardtype';
export * from './cardclass';
export * from './rarity';
export * from './race';
export * from './zone';
export * from './state';
export * from './step';
export * from './playstate';
export * from './blocktype';
export * from './tags';
export * from './playreq';
```

---

## 阶段 3：工具类

### Task 4: 创建工具类

**Files:**
- Create: `src/utils/random.ts`
- Create: `src/utils/cardlist.ts`
- Create: `src/utils/logging.ts`
- Create: `src/utils/index.ts`

**Step 1: 创建 src/utils/random.ts**

```typescript
export class Random {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: readonly T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[this.nextInt(0, array.length - 1)];
  }

  sample<T>(array: readonly T[], count: number): T[] {
    const result = [...array];
    this.shuffle(result);
    return result.slice(0, Math.min(count, result.length));
  }

  shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
```

**Step 2: 创建 src/utils/cardlist.ts`

```typescript
import { CardType, Race } from '../enums';
import { Random } from './random';

export class CardList<T = unknown> extends Array<T> {
  filter(predicate: (card: T) => boolean): CardList<T> {
    return super.filter(predicate) as CardList<T>;
  }

  includes(card: T): boolean {
    return super.includes(card);
  }

  contains(predicate: (card: T) => boolean): boolean {
    return this.some(predicate);
  }

  shuffle(random: Random): void {
    random.shuffle(this);
  }

  draw(): T | undefined {
    return this.pop();
  }

  drawCount(count: number): T[] {
    const result: T[] = [];
    for (let i = 0; i < count && this.length > 0; i++) {
      const card = this.pop();
      if (card !== undefined) result.push(card);
    }
    return result;
  }

  byType(type: CardType): CardList<T> {
    return this.filter((c) => (c as any).type === type);
  }

  byRace(race: Race): CardList<T> {
    return this.filter((c) => (c as any).race === race);
  }

  byCost(cost: number): CardList<T> {
    return this.filter((c) => (c as any).cost === cost);
  }

  first(): T | undefined {
    return this[0];
  }

  last(): T | undefined {
    return this[this.length - 1];
  }
}
```

**Step 3: 创建 src/utils/logging.ts**

```typescript
export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    console.log(`[INFO] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]): void => {
    console.debug(`[DEBUG] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`[WARN] ${message}`, ...args);
  },
};
```

**Step 4: 创建 src/utils/index.ts**

```typescript
export * from './random';
export * from './cardlist';
export * from './logging';
```

---

## 阶段 4：国际化模块

### Task 5: 创建 i18n 模块

**Files:**
- Create: `src/i18n/types.ts`
- Create: `src/i18n/index.ts`
- Create: `src/i18n/locales/en.json`
- Create: `src/i18n/locales/zh-CN.json`

**Step 1: 创建 src/i18n/types.ts**

```typescript
export type Locale = 'en' | 'zh-CN' | 'zh-TW';

export interface LocaleData {
  locale: Locale;
  cardNames: Record<string, string>;
  cardDescriptions: Record<string, string>;
  gameTexts: Record<string, string>;
  errorMessages: Record<string, string>;
  logMessages: Record<string, string>;
}
```

**Step 2: 创建 src/i18n/index.ts**

```typescript
import type { Locale, LocaleData } from './types';

export class I18n {
  private static currentLocale: Locale = 'en';
  private static data: Map<Locale, LocaleData> = new Map();

  static setLocale(locale: Locale): void {
    this.currentLocale = locale;
  }

  static getLocale(): Locale {
    return this.currentLocale;
  }

  static loadLocale(data: LocaleData): void {
    this.data.set(data.locale, data);
  }

  static getCardName(cardId: string): string {
    const localeData = this.data.get(this.currentLocale);
    return localeData?.cardNames[cardId] || cardId;
  }

  static getCardDescription(cardId: string): string {
    const localeData = this.data.get(this.currentLocale);
    return localeData?.cardDescriptions[cardId] || '';
  }

  static t(key: string, params?: Record<string, unknown>): string {
    const localeData = this.data.get(this.currentLocale);
    let template =
      localeData?.gameTexts[key] ||
      localeData?.errorMessages[key] ||
      key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return template;
  }

  static log(key: string, ...args: unknown[]): string {
    const localeData = this.data.get(this.currentLocale);
    const template = localeData?.logMessages[key] || key;
    return this.format(template, ...args);
  }

  private static format(template: string, ...args: unknown[]): string {
    let i = 0;
    return template.replace(/%[sd]/g, () => String(args[i++]));
  }
}

export const t = I18n.t.bind(I18n);
export const getCardName = I18n.getCardName.bind(I18n);
export const getCardDescription = I18n.getCardDescription.bind(I18n);
export type { Locale, LocaleData } from './types';
```

**Step 3: 创建 src/i18n/locales/en.json**

```json
{
  "locale": "en",
  "cardNames": {},
  "cardDescriptions": {},
  "gameTexts": {
    "game.start": "Game started",
    "turn.begin": "Turn {turn} begins",
    "turn.end": "Turn {turn} ends",
    "player.draw": "{player} draws {count} card(s)",
    "attack.execute": "{attacker} attacks {target}",
    "minion.death": "{minion} is destroyed"
  },
  "errorMessages": {
    "invalid_target": "Invalid target",
    "not_enough_mana": "Not enough mana (need {required}, have {current})",
    "board_full": "Board is full"
  },
  "logMessages": {
    "damage.dealt": "%s deals %d damage to %s",
    "heal.applied": "%s heals %s for %d"
  }
}
```

**Step 4: 创建 src/i18n/locales/zh-CN.json**

```json
{
  "locale": "zh-CN",
  "cardNames": {},
  "cardDescriptions": {},
  "gameTexts": {
    "game.start": "游戏开始",
    "turn.begin": "第 {turn} 回合开始",
    "turn.end": "第 {turn} 回合结束",
    "player.draw": "{player} 抽了 {count} 张牌",
    "attack.execute": "{attacker} 攻击 {target}",
    "minion.death": "{minion} 被消灭"
  },
  "errorMessages": {
    "invalid_target": "无效的目标",
    "not_enough_mana": "法力值不足（需要 {required}，当前 {current}）",
    "board_full": "场上已满"
  },
  "logMessages": {
    "damage.dealt": "%s 对 %s 造成 %d 点伤害",
    "heal.applied": "%s 为 %s 恢复 %d 点生命值"
  }
}
```

---

## 阶段 5：核心层 - Entity 和 Manager

### Task 6: 创建 Manager 类

**Files:**
- Create: `src/core/manager.ts`
- Test: `tests/core/manager.test.ts`

**Step 1: 创建测试 tests/core/manager.test.ts**

```typescript
import { Manager } from '../../src/core/manager';

class MockEntity {
  public entityId = 1;
}

describe('Manager', () => {
  let manager: Manager;
  let entity: MockEntity;

  beforeEach(() => {
    entity = new MockEntity();
    manager = new Manager(entity);
  });

  test('should store and retrieve values', () => {
    manager.set('key', 'value');
    expect(manager.get('key')).toBe('value');
  });

  test('should check if key exists', () => {
    manager.set('exists', true);
    expect(manager.has('exists')).toBe(true);
    expect(manager.has('notExists')).toBe(false);
  });

  test('should delete values', () => {
    manager.set('toDelete', 'value');
    expect(manager.delete('toDelete')).toBe(true);
    expect(manager.has('toDelete')).toBe(false);
  });

  test('should increment values', () => {
    const result = manager.increment('counter', 5);
    expect(result).toBe(5);
    expect(manager.get('counter')).toBe(5);
  });

  test('should decrement values', () => {
    manager.set('counter', 10);
    const result = manager.decrement('counter', 3);
    expect(result).toBe(7);
    expect(manager.get('counter')).toBe(7);
  });
});
```

**Step 2: 创建 src/core/manager.ts**

```typescript
import type { BaseEntity } from './entity';

export class Manager {
  protected data: Map<string | number, unknown> = new Map();

  constructor(protected owner: BaseEntity) {}

  get(key: string | number): unknown {
    return this.data.get(key);
  }

  set(key: string | number, value: unknown): void {
    this.data.set(key, value);
  }

  has(key: string | number): boolean {
    return this.data.has(key);
  }

  delete(key: string | number): boolean {
    return this.data.delete(key);
  }

  increment(key: string | number, amount: number = 1): number {
    const current = (this.get(key) as number) || 0;
    this.set(key, current + amount);
    return current + amount;
  }

  decrement(key: string | number, amount: number = 1): number {
    return this.increment(key, -amount);
  }
}
```

**Step 3: 运行测试验证**

Run: `cd /home/xjingyao/code/js_fireplace && npm test -- tests/core/manager.test.ts`
Expected: PASS

---

### Task 7: 创建 Entity 基类

**Files:**
- Create: `src/core/entity.ts`
- Test: `tests/core/entity.test.ts`

**Step 1: 创建测试 tests/core/entity.test.ts**

```typescript
import { BaseEntity, BuffableEntity, Entity } from '../../src/core/entity';
import { CardType } from '../../src/enums';

class TestEntity extends BaseEntity {
  private _entityId: number = 0;
  private static _nextId = 1;

  constructor() {
    super(null);
    this._entityId = TestEntity._nextId++;
  }

  get entityId(): number {
    return this._entityId;
  }
}

describe('BaseEntity', () => {
  let entity: TestEntity;

  beforeEach(() => {
    entity = new TestEntity();
  });

  test('should have unique UUID', () => {
    const entity2 = new TestEntity();
    expect(entity.uuid).not.toBe(entity2.uuid);
  });

  test('should have default type', () => {
    expect(entity.type).toBe(CardType.INVALID);
  });

  test('should check isCard correctly', () => {
    expect(entity.isCard).toBe(false);
    entity.type = CardType.MINION;
    expect(entity.isCard).toBe(true);
  });

  test('should initialize with empty events', () => {
    expect(entity.events).toEqual([]);
  });

  test('should get damage returning amount by default', () => {
    const target = { immune: false, dormant: false } as any;
    expect(entity.getDamage(5, target)).toBe(5);
  });

  test('should return 0 damage for immune target', () => {
    const target = { immune: true, dormant: false } as any;
    expect(entity.getDamage(5, target)).toBe(0);
  });

  test('should return 0 damage for dormant target', () => {
    const target = { immune: false, dormant: true } as any;
    expect(entity.getDamage(5, target)).toBe(0);
  });
});

describe('BuffableEntity', () => {
  let entity: TestEntity;

  beforeEach(() => {
    entity = new TestEntity();
  });

  test('should initialize with empty buffs and slots', () => {
    expect(entity.buffs).toEqual([]);
    expect(entity.slots).toEqual([]);
  });

  test('should clear buffs', () => {
    const mockBuff = { remove: jest.fn() };
    entity.buffs.push(mockBuff as any);
    entity.clearBuffs();
    expect(mockBuff.remove).toHaveBeenCalled();
    expect(entity.buffs).toEqual([]);
  });
});
```

**Step 2: 创建 src/core/entity.ts**

```typescript
import { v4 as uuidv4 } from 'uuid';
import { CardType } from '../enums';
import { Manager } from './manager';

export type EntityId = number;

export interface IBaseEntity {
  readonly entityId: EntityId;
  readonly uuid: string;
  type: CardType;
}

export interface IBuffableEntity extends IBaseEntity {
  buffs: Buff[];
  slots: Slot[];
}

export interface Buff {
  remove(): void;
  _getattr(attr: string, value: number): number;
}

export interface Slot {
  _getattr(attr: string, value: number): number;
}

export abstract class BaseEntity implements IBaseEntity {
  public readonly uuid: string;
  public type: CardType = CardType.INVALID;
  public playCounter: number = 0;
  public eventArgs: unknown = null;
  public ignoreScripts: boolean = false;

  protected manager: Manager;
  protected _events: GameEvent[] = [];
  protected baseEvents: GameEvent[] = [];

  constructor(protected data: CardData | null = null) {
    this.uuid = uuidv4();
    this.manager = new (this.constructor as any).Manager(this);
    if (this.data) {
      this._events = [...(this.data.scripts?.events || [])];
    }
  }

  abstract get entityId(): EntityId;

  get isCard(): boolean {
    return this.type > CardType.PLAYER;
  }

  get events(): GameEvent[] {
    return [...this.baseEvents, ...this._events];
  }

  get updateScripts(): Generator<UpdateScript> {
    if (this.data && !this.ignoreScripts) {
      yield* (this.data.scripts?.update || []);
    }
  }

  getActions(name: string): Action[] {
    const actions = (this.data?.scripts as any)?.[name];
    if (typeof actions === 'function') {
      return actions(this);
    }
    return actions || [];
  }

  triggerEvent(source: Entity, event: GameEvent, args: unknown[]): unknown[] {
    const actions: Action[] = [];
    for (const action of event.actions) {
      if (typeof action === 'function') {
        const result = action(this, ...args);
        if (result) {
          if (typeof result[Symbol.iterator] === 'function') {
            actions.push(...result);
          } else {
            actions.push(result);
          }
        }
      } else {
        actions.push(action);
      }
    }
    const ret = source.game?.trigger(this, actions, args);
    if (event.once) {
      const idx = this._events.indexOf(event);
      if (idx !== -1) this._events.splice(idx, 1);
    }
    return ret || [];
  }

  getDamage(amount: number, target: Character): number {
    if ((target as any).dormant) return 0;
    if ((target as any).immune) return 0;
    return amount;
  }

  getHeal(amount: number, target: Character): number {
    return amount;
  }

  log(message: string, ...args: unknown[]): void {
    console.log(`[${this.constructor.name}] ${message}`, ...args);
  }
}

export abstract class BuffableEntity extends BaseEntity implements IBuffableEntity {
  public buffs: Buff[] = [];
  public slots: Slot[] = [];

  protected _getattr(attr: string, value: number): number {
    value += (this as any)[`_${attr}`] || 0;
    for (const buff of this.buffs) {
      value = buff._getattr(attr, value);
    }
    for (const slot of this.slots) {
      value = slot._getattr(attr, value);
    }
    if (this.ignoreScripts) return value;
    return (this.data?.scripts as any)?.[attr]?.(this, value) ?? value;
  }

  clearBuffs(): void {
    if (this.buffs.length) {
      this.log('Clearing buffs');
      for (const buff of this.buffs.slice()) {
        buff.remove();
      }
    }
  }
}

export class Entity extends BuffableEntity {}

// Type aliases for backward compatibility
export type CardData = {
  scripts?: {
    events?: GameEvent[];
    update?: UpdateScript[];
    [key: string]: unknown;
  };
};

export interface GameEvent {
  actions: Action[];
  once?: boolean;
}

export interface UpdateScript {
  trigger: (entity: Entity) => void;
  priority?: number;
}

export interface Action {
  // Action interface placeholder
}

export interface Character extends IBuffableEntity {
  damage: number;
  immune: boolean;
  frozen: boolean;
}
```

**Step 3: 运行测试验证**

Run: `cd /home/xjingyao/code/js_fireplace && npm test -- tests/core/entity.test.ts`
Expected: PASS

---

### Task 8: 创建 Card 基类

**Files:**
- Create: `src/core/card.ts`
- Create: `src/core/deck.ts`
- Create: `src/core/index.ts`

**Step 1: 创建 src/core/card.ts**

```typescript
import { Entity } from './entity';
import { CardType, CardClass, Rarity, Race, Zone } from '../enums';
import { I18n } from '../i18n';

export interface CardDefinition {
  id: string;
  type: CardType;
  cardClass: CardClass;
  cost: number;
  rarity?: Rarity;
  set?: CardSet;
  collectible?: boolean;
  attack?: number;
  health?: number;
  race?: Race;
  durability?: number;
  requirements?: Partial<Record<PlayReq, number>>;
  scripts?: CardScripts;
  names?: Record<string, string>;
  descriptions?: Record<string, string>;
}

export interface CardScripts {
  play?: (card: PlayableCard, target?: Character) => Action[];
  battlecry?: (card: PlayableCard, target?: Character) => Action[];
  deathrattle?: (minion: Minion) => Action[];
  trigger?: (card: Card, event: GameEvent) => Action[];
  update?: UpdateScript[];
  events?: EventScript[];
}

export interface EventScript {
  events: GameEventType[];
  actions: Action[];
  once?: boolean;
}

export class Card extends Entity {
  public id: string;
  public cardClass: CardClass = CardClass.INVALID;
  public rarity: Rarity = Rarity.INVALID;
  public zone: Zone = Zone.INVALID;

  constructor(definition: CardDefinition) {
    super(definition);
    this.id = definition.id;
    this.type = definition.type;
    this.cardClass = definition.cardClass;
    this.rarity = definition.rarity || Rarity.INVALID;
  }

  get name(): string {
    return I18n.getCardName(this.id);
  }

  get description(): string {
    return I18n.getCardDescription(this.id);
  }

  get cost(): number {
    return this._getattr('cost', this.data?.cost || 0);
  }

  set cost(value: number) {
    (this as any)._cost = value;
  }

  getController(): Player {
    return (this as any).controller;
  }

  isPlayable(target?: Character): boolean {
    if (this.zone !== Zone.HAND) return false;
    const controller = this.getController();
    if (!controller) return false;
    if (controller.mana < this.cost) return false;
    // Check requirements
    return true;
  }
}

export class PlayableCard extends Card {
  // Playable card logic
}

export class Minion extends PlayableCard {
  public attack: number = 0;
  public maxHealth: number = 0;
  public damage: number = 0;
  public taunt: boolean = false;
  public divineShield: boolean = false;
  public frozen: boolean = false;
  public silenced: boolean = false;
  public sleeping: boolean = false;

  constructor(definition: CardDefinition) {
    super(definition);
    this.attack = definition.attack || 0;
    this.maxHealth = definition.health || 0;
  }

  get health(): number {
    return this.maxHealth - this.damage;
  }

  get realDamage(): number {
    return this.damage;
  }
}

export class Spell extends PlayableCard {
  // Spell logic
}

export class Weapon extends PlayableCard {
  public attack: number = 0;
  public durability: number = 0;

  constructor(definition: CardDefinition) {
    super(definition);
    this.attack = definition.attack || 0;
    this.durability = definition.durability || 0;
  }
}

export class Hero extends PlayableCard {
  public damage: number = 0;
  public armor: number = 0;

  constructor(definition: CardDefinition) {
    super(definition);
  }

  get health(): number {
    return 30 - this.damage;
  }
}

export class HeroPower extends Card {
  // Hero power logic
}

export class Secret extends Card {
  // Secret logic
}

export { CardType, CardClass, Rarity, Race, Zone };
export type { CardSet, PlayReq, Character, Player, Action, GameEvent, GameEventType, UpdateScript } from './types';
```

**Step 2: 创建 src/core/deck.ts**

```typescript
import { CardList } from '../utils/cardlist';
import { CardRegistry } from '../cards/registry';
import type { PlayableCard, CardDefinition } from './card';

export class Deck extends CardList<PlayableCard> {
  constructor(
    private player: Player,
    cardIds: string[]
  ) {
    super();
    for (const cardId of cardIds) {
      const definition = CardRegistry.get(cardId);
      if (definition) {
        this.push(new PlayableCard(definition));
      }
    }
  }

  shuffle(random: Random): void {
    random.shuffle(this);
  }

  draw(): PlayableCard | undefined {
    return this.pop();
  }
}
```

**Step 3: 创建 src/core/index.ts**

```typescript
export * from './entity';
export * from './manager';
export * from './card';
export * from './deck';
```

---

### Task 9: 创建 Player 类

**Files:**
- Create: `src/core/player.ts`
- Test: `tests/core/player.test.ts`

**Step 1: 创建测试 tests/core/player.test.ts`

```typescript
import { Player } from '../../src/core/player';
import { CardRegistry } from '../../src/cards/registry';
import { CardClass } from '../../src/enums';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player('TestPlayer', []);
  });

  test('should have empty hand initially', () => {
    expect(player.hand.length).toBe(0);
  });

  test('should have empty deck initially', () => {
    expect(player.deck.length).toBe(0);
  });

  test('should have empty field initially', () => {
    expect(player.field.length).toBe(0);
  });

  test('should initialize with default mana', () => {
    expect(player.mana).toBe(0);
    expect(player.maxMana).toBe(0);
  });
});
```

**Step 2: 创建 src/core/player.ts**

```typescript
import { CardType, Zone, PlayState } from '../enums';
import { Entity } from './entity';
import { CardList } from '../utils/cardlist';
import { Game } from './game';
import type { PlayableCard, Minion, Hero, HeroPower, Secret, Card } from './card';

export class Player extends Entity {
  type = CardType.PLAYER;

  public opponent!: Player;
  public game!: Game;
  public firstPlayer: boolean = false;

  // 区域
  public hand: CardList<PlayableCard> = new CardList();
  public deck: CardList<PlayableCard> = new CardList();
  public field: CardList<Minion> = new CardList();
  public graveyard: CardList<Card> = new CardList();
  public secrets: CardList<Secret> = new CardList();

  // 资源
  public mana: number = 0;
  public maxMana: number = 0;
  public usedMana: number = 0;
  public overloadLocked: number = 0;
  public overloaded: number = 0;
  public tempMana: number = 0;

  // 状态
  public playstate: PlayState = PlayState.PLAYING;
  public combo: boolean = false;
  public turn: number = 0;
  public lastTurn: number = 0;
  public turnStart: number = 0;

  // 计数器
  public cardsDrawnThisTurn: number = 0;
  public cardsPlayedThisTurn: number = 0;
  public minionsPlayedThisTurn: number = 0;
  public minionsKilledThisTurn: CardList = new CardList();
  public elementalPlayedThisTurn: number = 0;
  public elementalPlayedLastTurn: number = 0;

  // 英雄
  public hero!: Hero;
  public heroPower!: HeroPower;

  constructor(
    public readonly name: string,
    _decklist: string[]
  ) {
    super(null);
  }

  get entityId(): number {
    return this.manager.get('ENTITY_ID') as number;
  }

  get controller(): Player {
    return this;
  }

  get characters(): CardList {
    return new CardList(this.hero, ...this.field);
  }

  get entities(): CardList {
    return new CardList(
      this,
      this.hero,
      this.heroPower,
      ...this.hand,
      ...this.field,
      ...this.secrets
    );
  }

  get liveEntities(): CardList {
    return new CardList(this.hero, ...this.field);
  }

  draw(count: number = 1): PlayableCard[] {
    const drawn: PlayableCard[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.deck.draw();
      if (card) {
        this.hand.push(card);
        drawn.push(card);
      }
    }
    this.cardsDrawnThisTurn += drawn.length;
    return drawn;
  }

  give(cardId: string): PlayableCard | undefined {
    const definition = { id: cardId, type: CardType.INVALID, cardClass: CardClass.INVALID, cost: 0 };
    const card = new PlayableCard(definition);
    this.hand.push(card);
    return card;
  }

  discard(card: PlayableCard): void {
    const idx = this.hand.indexOf(card);
    if (idx !== -1) {
      this.hand.splice(idx, 1);
      this.graveyard.push(card);
    }
  }

  summon(minion: Minion, index?: number): void {
    if (this.field.length >= 7) return;
    if (index !== undefined) {
      this.field.splice(index, 0, minion);
    } else {
      this.field.push(minion);
    }
    minion.playCounter = this.game.tick++;
  }

  prepareForGame(): void {
    this.hand = new CardList();
    this.deck = new CardList();
    this.field = new CardList();
    this.graveyard = new CardList();
    this.secrets = new CardList();
  }
}
```

**Step 3: 运行测试验证**

Run: `cd /home/xjingyao/code/js_fireplace && npm test -- tests/core/player.test.ts`
Expected: PASS

---

### Task 10: 创建 Game 类

**Files:**
- Create: `src/core/game.ts`
- Test: `tests/core/game.test.ts`

**Step 1: 创建测试 tests/core/game.test.ts`

```typescript
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { State } from '../../src/enums';

describe('Game', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    game = new Game({ players: [player1, player2], seed: 12345 });
  });

  test('should initialize with invalid state', () => {
    expect(game.state).toBe(State.INVALID);
  });

  test('should have two players', () => {
    expect(game.players.length).toBe(2);
  });

  test('should link players to game', () => {
    expect(player1.game).toBe(game);
    expect(player2.game).toBe(game);
  });

  test('should have random generator', () => {
    expect(game.random).toBeDefined();
  });
});
```

**Step 2: 创建 src/core/game.ts**

```typescript
import { Random } from '../utils/random';
import { CardType, State, Step, Zone, BlockType, PlayState } from '../enums';
import { Entity } from './entity';
import { Manager } from './manager';
import { CardList } from '../utils/cardlist';
import { Player } from './player';
import type { Action } from './types';

export interface GameConfig {
  players: Player[];
  seed?: number;
}

export class GameManager extends Manager {
  // Game-specific management
}

export class Game extends Entity {
  static readonly MAX_MINIONS_ON_FIELD = 7;
  static readonly MAX_SECRETS_ON_PLAY = 5;
  static readonly Manager = GameManager;

  public readonly players: Player[];
  public readonly random: Random;
  public readonly activeAuraBuffs: CardList = new CardList();
  public readonly setaside: CardList = new CardList();

  public player1!: Player;
  public player2!: Player;
  public currentPlayer: Player | null = null;
  public nextPlayers: Player[] = [];

  public state: State = State.INVALID;
  public step: Step = Step.BEGIN_FIRST;
  public nextStep: Step = Step.BEGIN_SHUFFLE;
  public turn: number = 0;
  public tick: number = 0;
  public skin: number = 0;

  private _actionStack: number = 0;

  type = CardType.GAME;

  constructor(config: GameConfig) {
    super(null);
    this.players = config.players;
    this.random = new Random(config.seed);
    for (const player of config.players) {
      player.game = this;
    }
  }

  get entityId(): number {
    return 0;
  }

  get game(): Game {
    return this;
  }

  get board(): CardList {
    const ret = new CardList(...this.players[0].field, ...this.players[1].field);
    ret.sort((a, b) => a.playCounter - b.playCounter);
    return ret;
  }

  get decks(): CardList {
    return new CardList(...this.players[0].deck, ...this.players[1].deck);
  }

  get hands(): CardList {
    return new CardList(...this.players[0].hand, ...this.players[1].hand);
  }

  get characters(): CardList {
    const ret = new CardList(...this.players[0].characters, ...this.players[1].characters);
    ret.sort((a, b) => a.playCounter - b.playCounter);
    return ret;
  }

  get graveyard(): CardList {
    return new CardList(...this.players[0].graveyard, ...this.players[1].graveyard);
  }

  get entities(): CardList {
    const ret = new CardList(this, ...this.players[0].entities, ...this.players[1].entities);
    ret.sort((a, b) => a.playCounter - b.playCounter);
    return ret;
  }

  get liveEntities(): CardList {
    const ret = new CardList(...this.players[0].liveEntities, ...this.players[1].liveEntities);
    ret.sort((a, b) => a.playCounter - b.playCounter);
    return ret;
  }

  get minionsKilledThisTurn(): CardList {
    return new CardList(
      ...this.players[0].minionsKilledThisTurn,
      ...this.players[1].minionsKilledThisTurn
    );
  }

  get ended(): boolean {
    return this.state === State.COMPLETE;
  }

  start(): void {
    this.setup();
  }

  setup(): void {
    this.state = State.RUNNING;
    const [first, second] = this.pickFirstPlayer();
    this.player1 = first;
    this.player2 = second;
    this.player1.opponent = this.player2;
    this.player2.opponent = this.player1;
  }

  pickFirstPlayer(): [Player, Player] {
    const shuffled = this.random.sample(this.players, this.players.length);
    return [shuffled[0], shuffled[1]];
  }

  beginTurn(player: Player): void {
    this.currentPlayer = player;
    this.turn++;
    player.turn++;
    player.usedMana = 0;
    player.overloadLocked = player.overloaded;
    player.overloaded = 0;
    this._beginTurn(player);
  }

  private _beginTurn(player: Player): void {
    player.turnStart = this.tick++;
  }

  endTurn(): void {
    if (!this.currentPlayer) return;
    this._endTurn();
    this.currentPlayer = this.currentPlayer.opponent;
    this.beginTurn(this.currentPlayer);
  }

  private _endTurn(): void {
    // End turn cleanup
  }

  processDeaths(): void {
    // Process deaths
  }

  refreshAuras(): void {
    // Refresh auras
  }

  queueActions(source: Entity, actions: Action[], _eventArgs?: unknown): unknown[] {
    return this.triggerActions(source, actions);
  }

  triggerActions(source: Entity, actions: Action[]): unknown[] {
    const results: unknown[] = [];
    for (const action of actions) {
      const result = (action as any).trigger?.(source);
      if (result) {
        results.push(...result);
      }
    }
    return results;
  }

  checkForEndGame(): void {
    for (const player of this.players) {
      if (player.playstate === PlayState.WON) {
        this.state = State.COMPLETE;
        return;
      }
    }
  }
}
```

**Step 3: 运行测试验证**

Run: `cd /home/xjingyao/code/js_fireplace && npm test -- tests/core/game.test.ts`
Expected: PASS

---

## 阶段 6：卡牌注册表

### Task 11: 创建卡牌注册表

**Files:**
- Create: `src/cards/types.ts`
- Create: `src/cards/registry.ts`
- Create: `src/cards/index.ts`

**Step 1: 创建 src/cards/types.ts**

```typescript
import type { Locale } from '../i18n/types';
import type { Action } from '../core/types';
import type { CardType, CardClass, Rarity, Race, CardSet, SpellType, PlayReq, Character } from '../enums';

export interface CardDefinition {
  id: string;
  type: CardType;
  cardClass: CardClass;
  cost: number;
  rarity?: Rarity;
  set?: CardSet;
  collectible?: boolean;
  attack?: number;
  health?: number;
  race?: Race;
  durability?: number;
  spellType?: SpellType;
  requirements?: Partial<Record<PlayReq, number>>;
  scripts?: CardScripts;
  names?: Partial<Record<Locale, string>>;
  descriptions?: Partial<Record<Locale, string>>;
}

export interface CardScripts {
  play?: (card: PlayableCard, target?: Character) => Action[];
  battlecry?: (card: PlayableCard, target?: Character) => Action[];
  deathrattle?: (minion: Minion) => Action[];
  trigger?: (card: Card, event: GameEvent) => Action[];
  update?: UpdateScript[];
  events?: EventScript[];
}

export interface UpdateScript {
  trigger: (entity: Entity) => void;
  priority?: number;
}

export interface EventScript {
  events: GameEventType[];
  actions: Action[];
  once?: boolean;
}

// Re-export types
export type { Entity, PlayableCard, Minion, Spell, Weapon, Hero, HeroPower, Secret, Card, Character, Player } from '../core/types';
```

**Step 2: 创建 src/cards/registry.ts**

```typescript
import type { CardDefinition } from './types';
import type { CardSet } from '../enums';

export class CardRegistry {
  private static cards: Map<string, CardDefinition> = new Map();
  private static bySet: Map<CardSet, CardDefinition[]> = new Map();

  static register(definition: CardDefinition): void {
    this.cards.set(definition.id, definition);
    if (definition.set) {
      const setCards = this.bySet.get(definition.set) || [];
      setCards.push(definition);
      this.bySet.set(definition.set, setCards);
    }
  }

  static registerAll(definitions: CardDefinition[]): void {
    for (const def of definitions) {
      this.register(def);
    }
  }

  static get(id: string): CardDefinition | undefined {
    return this.cards.get(id);
  }

  static has(id: string): boolean {
    return this.cards.has(id);
  }

  static getBySet(cardSet: CardSet): CardDefinition[] {
    return this.bySet.get(cardSet) || [];
  }

  static getAll(): CardDefinition[] {
    return Array.from(this.cards.values());
  }

  static clear(): void {
    this.cards.clear();
    this.bySet.clear();
  }
}
```

**Step 3: 创建 src/cards/index.ts**

```typescript
export * from './types';
export * from './registry';
```

---

## 阶段 7：主入口文件

### Task 12: 创建主入口

**Files:**
- Create: `src/index.ts`

**Step 1: 创建 src/index.ts**

```typescript
// Core exports
export * from './core';
export * from './cards';
export * from './enums';
export * from './utils';
export * from './i18n';

// i18n exports
export { I18n, t, getCardName, getCardDescription } from './i18n';
export type { Locale, LocaleData } from './i18n/types';
```

---

## 阶段 8：构建和测试验证

### Task 13: 验证构建

**Step 1: 运行构建**

Run: `cd /home/xjingyao/code/js_fireplace && npm run build`
Expected: 无错误，构建成功

**Step 2: 运行所有测试**

Run: `cd /home/xjingyao/code/js_fireplace && npm test`
Expected: 所有测试通过

---

## 总结

已完成以下内容：
1. 项目配置文件 (package.json, tsconfig.json, jest.config.js, .eslintrc.js)
2. 目录结构创建
3. 枚举定义 (CardType, CardClass, Rarity, Race, Zone, State, Step 等)
4. 工具类 (Random, CardList, Logger)
5. 国际化模块 (i18n)
6. 核心层 (Manager, Entity, Card, Player, Game)
7. 卡牌注册表 (CardRegistry)

**下一步：**
- 完善 actions 动作系统
- 完善 DSL 选择器/评估器
- 完善 Aura/Targeting
- 翻译卡牌定义
