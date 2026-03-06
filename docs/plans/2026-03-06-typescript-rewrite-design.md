# js-fireplace TypeScript 重写设计文档

## 概述

将 Python 项目 [fireplace](https://github.com/jleclanche/fireplace)（炉石传说模拟器）翻译为 TypeScript 实现。

**目标：**
1. Node.js 服务端模拟器（纯逻辑）
2. 后续支持 Web UI
3. 支持 AI 训练
4. 从最初支持多语言（中英文切换）

**技术选型：**
- 模块系统：CommonJS
- 编译目标：ES2020
- 测试框架：Jest
- 状态管理：保持 Manager 模式（便于对照翻译）
- 卡牌定义：.ts 文件，与原项目类似结构

---

## 项目结构

```
js_fireplace/
├── src/
│   ├── core/                    # 核心层
│   │   ├── entity.ts            # 实体基类
│   │   ├── game.ts              # 游戏主逻辑
│   │   ├── player.ts            # 玩家逻辑
│   │   ├── manager.ts           # 状态管理器
│   │   ├── card.ts              # 卡牌基类
│   │   ├── deck.ts              # 牌组
│   │   └── index.ts             # 核心层导出
│   │
│   ├── actions/                 # 动作层
│   │   ├── base.ts              # Action 基类
│   │   ├── attack.ts            # 攻击
│   │   ├── play.ts              # 出牌
│   │   ├── death.ts             # 死亡
│   │   ├── turn.ts              # 回合
│   │   ├── draw.ts              # 抽牌
│   │   ├── heal.ts              # 治疗
│   │   ├── damage.ts            # 伤害
│   │   ├── summon.ts            # 召唤
│   │   ├── destroy.ts           # 摧毁
│   │   └── index.ts             # 动作导出
│   │
│   ├── cards/                   # 卡牌定义层
│   │   ├── types.ts             # 卡牌类型、接口
│   │   ├── registry.ts          # 卡牌注册表
│   │   ├── base.ts              # 基础卡包
│   │   ├── classic/             # 经典卡包
│   │   ├── naxx/                # 纳克萨玛斯
│   │   ├── gvg/                 # 地精大战侏儒
│   │   ├── tgt/                 # 冠军的试炼
│   │   ├── wog/                 # 上古之神
│   │   ├── karazhan/            # 卡拉赞
│   │   ├── gadgetzan/           # 加基森
│   │   ├── ungoro/              # 安戈洛
│   │   ├── icecrown/            # 冰封王座
│   │   ├── kobolds/             # 狗头人
│   │   ├── witchwood/           # 女巫森林
│   │   ├── boomsday/            # 砰砰计划
│   │   ├── rastakhan/           # 拉斯塔哈
│   │   ├── dalaran/             # 达拉然
│   │   ├── uldum/               # 奥丹姆
│   │   ├── dragons/             # 巨龙降临
│   │   ├── outlands/            # 外域
│   │   └── index.ts             # 卡牌导出
│   │
│   ├── dsl/                     # 领域特定语言
│   │   ├── selector.ts          # 选择器
│   │   ├── evaluator.ts         # 评估器
│   │   ├── lazynum.ts           # 懒加载数值
│   │   ├── random_picker.ts     # 随机选择
│   │   ├── copy.ts              # 复制
│   │   ├── switch.ts            # 条件分支
│   │   └── index.ts             # DSL 导出
│   │
│   ├── aura/                    # 光环系统
│   │   ├── aura.ts              # 光环基类
│   │   └── index.ts             # 光环导出
│   │
│   ├── targeting/               # 目标选择
│   │   ├── targeting.ts         # 目标选择逻辑
│   │   └── index.ts             # 目标导出
│   │
│   ├── enums/                   # 枚举和常量
│   │   ├── tags.ts              # 内部标签
│   │   ├── playreq.ts           # 出牌要求
│   │   ├── cardtype.ts          # 卡牌类型
│   │   ├── cardclass.ts         # 职业
│   │   ├── rarity.ts            # 稀有度
│   │   ├── race.ts              # 种族
│   │   ├── zone.ts              # 区域
│   │   ├── state.ts             # 游戏状态
│   │   ├── step.ts              # 回合步骤
│   │   ├── board.ts             # 棋盘
│   │   ├── spelltype.ts         # 法术类型
│   │   └── index.ts             # 枚举导出
│   │
│   ├── i18n/                    # 国际化模块
│   │   ├── index.ts             # i18n 核心
│   │   ├── types.ts             # 类型定义
│   │   ├── locales/             # 语言文件
│   │   │   ├── en.json          # 英文
│   │   │   ├── zh-CN.json       # 简体中文
│   │   │   └── zh-TW.json       # 繁体中文（可选）
│   │   └── index.ts             # i18n 导出
│   │
│   ├── utils/                   # 工具函数
│   │   ├── cardlist.ts          # 卡牌列表
│   │   ├── logging.ts           # 日志
│   │   ├── random.ts            # 随机数
│   │   └── index.ts             # 工具导出
│   │
│   ├── exceptions.ts            # 异常定义
│   ├── events.ts                # 事件定义
│   ├── rules.ts                 # 规则定义
│   └── index.ts                 # 主入口
│
├── tests/                       # 测试目录
│   ├── core/
│   ├── actions/
│   ├── cards/
│   ├── dsl/
│   └── i18n/
│
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
└── README.md
```

---

## 核心类型设计

### Entity 基类

```typescript
// src/core/entity.ts
import { v4 as uuidv4 } from 'uuid';
import { CardType } from '../enums';
import { Manager } from './manager';
import type { CardData } from '../cards/types';

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

export abstract class BaseEntity implements IBaseEntity {
  public readonly uuid: string;
  public type: CardType = CardType.INVALID;
  public playCounter: number = 0;
  public eventArgs: unknown = null;
  public ignoreScripts: boolean = false;

  protected manager: Manager;
  protected _events: Event[] = [];
  protected baseEvents: Event[] = [];

  constructor(protected data: CardData | null = null) {
    this.uuid = uuidv4();
    this.manager = new (this.constructor as any).Manager(this);
    if (this.data) {
      this._events = [...this.data.scripts.events];
    }
  }

  abstract get entityId(): EntityId;

  get isCard(): boolean {
    return this.type > CardType.PLAYER;
  }

  get events(): Event[] {
    return [...this.baseEvents, ...this._events];
  }

  get updateScripts(): Generator<UpdateScript> {
    if (this.data && !this.ignoreScripts) {
      yield* this.data.scripts.update;
    }
  }

  getActions(name: string): Action[] {
    const actions = (this.data?.scripts as any)?.[name];
    if (typeof actions === 'function') {
      return actions(this);
    }
    return actions || [];
  }

  triggerEvent(source: Entity, event: Event, args: unknown[]): unknown[] {
    // 事件触发逻辑
  }

  getDamage(amount: number, target: Character): number {
    if ((target as any).dormant) return 0;
    if ((target as any).immune) return 0;
    return amount;
  }

  getHeal(amount: number, target: Character): number {
    return amount;
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
    for (const buff of this.buffs.slice()) {
      buff.remove();
    }
  }
}

export class Entity extends BuffableEntity {}
```

### Manager 状态管理器

```typescript
// src/core/manager.ts
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

---

## 游戏核心设计

### Game 类

```typescript
// src/core/game.ts
import { Random } from '../utils/random';
import { CardType, State, Step, Zone, BlockType, PlayState } from '../enums';
import { Entity } from './entity';
import { Manager } from './manager';
import { CardList } from '../utils/cardlist';
import { GameOver } from '../exceptions';
import type { Player } from './player';
import type { Action } from '../actions/base';

export interface GameConfig {
  players: Player[];
  seed?: number;
}

export class GameManager extends Manager {
  // 游戏特定管理逻辑
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
  public skin: BoardEnum = BoardEnum.STORMWIND;

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

  // 核心方法
  start(): void;
  endTurn(): void;
  attack(source: Character, target: Character): void;
  playCard(card: PlayableCard, target?: Character, index?: number, choose?: string): void;

  // 内部方法
  setup(): void;
  beginTurn(player: Player): void;
  _beginTurn(player: Player): void;
  _endTurn(): void;
  endTurnCleanup(): void;
  processDeaths(): void;
  refreshAuras(): void;
  queueActions(source: Entity, actions: Action[], eventArgs?: unknown): unknown[];
  triggerActions(source: Entity, actions: Action[]): unknown[];
  actionBlock(source: Entity, actions: Action[], type: BlockType, ...): unknown[];
  actionStart(type: BlockType, source: Entity, index: number, target: Entity | null): void;
  actionEnd(type: BlockType, source: Entity): void;
  checkForEndGame(): void;
  pickFirstPlayer(): [Player, Player];
}
```

### Player 类

```typescript
// src/core/player.ts
import { CardType, Zone, PlayState } from '../enums';
import { Entity } from './entity';
import { CardList } from '../utils/cardlist';
import type { Game } from './game';
import type { PlayableCard, Minion, Hero, HeroPower, Secret } from './card';

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
    decklist: string[]
  ) {
    super(null);
  }

  get controller(): Player {
    return this;
  }

  get characters(): CardList {
    return new CardList(this.hero, ...this.field);
  }

  get entities(): CardList {
    return new CardList(this, this.hero, this.heroPower, ...this.hand, ...this.field, ...this.secrets);
  }

  get liveEntities(): CardList {
    return new CardList(this.hero, ...this.field);
  }

  // 核心方法
  draw(count?: number): PlayableCard[];
  give(cardId: string): PlayableCard;
  discard(card: PlayableCard): void;
  summon(minion: Minion, index?: number): void;
  prepareForGame(): void;
}
```

---

## 卡牌系统设计

### 卡牌类型定义

```typescript
// src/cards/types.ts
import type { Locale } from '../i18n/types';
import type { Action } from '../actions/base';
import type { CardType, CardClass, Rarity, Race, CardSet, SpellType, PlayReq } from '../enums';

export interface CardScripts {
  play?: (card: PlayableCard, target?: Character) => Action[];
  battlecry?: (card: PlayableCard, target?: Character) => Action[];
  deathrattle?: (minion: Minion) => Action[];
  trigger?: (card: Card, event: GameEvent) => Action[];
  update?: UpdateScript[];
  events?: EventScript[];
  [key: string]: unknown;
}

export interface CardDefinition {
  id: string;
  type: CardType;
  cardClass: CardClass;
  cost: number;
  rarity?: Rarity;
  set?: CardSet;
  collectible?: boolean;

  // 随从专属
  attack?: number;
  health?: number;
  race?: Race;

  // 法术专属
  spellType?: SpellType;

  // 武器专属
  durability?: number;

  // 出牌要求
  requirements?: Partial<Record<PlayReq, number>>;

  // 脚本
  scripts?: CardScripts;

  // 内联多语言（备用）
  names?: Partial<Record<Locale, string>>;
  descriptions?: Partial<Record<Locale, string>>;
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
```

### 卡牌注册表

```typescript
// src/cards/registry.ts
import type { CardDefinition } from './types';

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

---

## 动作系统设计

```typescript
// src/actions/base.ts
import type { Entity } from '../core/entity';

export interface ActionResult {
  success: boolean;
  value?: unknown;
}

export abstract class Action {
  abstract trigger(source: Entity): ActionResult[];
}

// src/actions/attack.ts
import type { Character } from '../core/card';

export class Attack extends Action {
  constructor(
    public attacker: Character,
    public defender: Character
  ) {
    super();
  }

  trigger(source: Entity): ActionResult[] {
    // 攻击逻辑实现
  }
}

// src/actions/play.ts
import type { PlayableCard, Character } from '../core/card';

export class Play extends Action {
  constructor(
    public card: PlayableCard,
    public target?: Character,
    public index?: number,
    public choose?: string
  ) {
    super();
  }

  trigger(source: Entity): ActionResult[] {
    // 出牌逻辑实现
  }
}

// 其他动作类...
```

---

## DSL 设计

### 选择器

```typescript
// src/dsl/selector.ts
import type { Entity } from '../core/entity';
import type { Game } from '../core/game';
import type { Character, Minion } from '../core/card';

export type SelectorFn = (source: Entity, game: Game) => Entity[];

export const SELECTORS = {
  // 基础选择器
  SELF: (source: Entity): Entity[] => [source],
  TARGET: (source: Entity): Entity[] => [source.eventArgs as Entity],
  ALL_MINIONS: (source: Entity, game: Game): Entity[] =>
    [...game.player1.field, ...game.player2.field],
  FRIENDLY_MINIONS: (source: Entity): Entity[] =>
    (source as any).controller?.field || [],
  ENEMY_MINIONS: (source: Entity): Entity[] =>
    (source as any).controller?.opponent?.field || [],

  // 条件过滤
  DAMAGED: (entities: Entity[]): Entity[] =>
    entities.filter(e => (e as Character).damage > 0),
  TAUNT: (entities: Entity[]): Entity[] =>
    entities.filter(e => (e as Minion).taunt),
  DIVINE_SHIELD: (entities: Entity[]): Entity[] =>
    entities.filter(e => (e as Minion).divineShield),
  FROZEN: (entities: Entity[]): Entity[] =>
    entities.filter(e => (e as Character).frozen),

  // 随机
  RANDOM: (count: number) => (entities: Entity[], game: Game): Entity[] =>
    game.random.sample(entities, count),
};

// 组合选择器
export class Selector {
  static where(predicate: (e: Entity) => boolean): SelectorFn;
  static random(count: number, selector: SelectorFn): SelectorFn;
  static sum(...selectors: SelectorFn[]): SelectorFn;
}
```

### 懒加载数值

```typescript
// src/dsl/lazynum.ts
import type { Entity } from '../core/entity';
import type { Game } from '../core/game';

export abstract class LazyValue<T> {
  abstract evaluate(source: Entity, game: Game): T;
}

export class Count extends LazyValue<number> {
  constructor(private selector: (s: Entity, g: Game) => Entity[]) {
    super();
  }

  evaluate(source: Entity, game: Game): number {
    return this.selector(source, game).length;
  }
}

export class Attr extends LazyValue<number> {
  constructor(
    private selector: (s: Entity, g: Game) => Entity[],
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

  evaluate(source: Entity, game: Game): number {
    return (source as any)[this.attr] || 0;
  }
}

export class Const<T> extends LazyValue<T> {
  constructor(private value: T) {
    super();
  }

  evaluate(source: Entity, game: Game): T {
    return this.value;
  }
}
```

---

## 国际化设计

### i18n 核心

```typescript
// src/i18n/types.ts
export type Locale = 'en' | 'zh-CN' | 'zh-TW';

export interface LocaleData {
  locale: Locale;
  cardNames: Record<string, string>;
  cardDescriptions: Record<string, string>;
  gameTexts: Record<string, string>;
  errorMessages: Record<string, string>;
  logMessages: Record<string, string>;
}

// src/i18n/index.ts
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
    let template = localeData?.gameTexts[key] ||
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
```

### 语言文件结构

```json
// src/i18n/locales/en.json
{
  "locale": "en",
  "cardNames": {
    "CS1_042": "Kobold Geomancer",
    "EX1_015": "Novice Engineer"
  },
  "cardDescriptions": {
    "CS1_042": "<b>Spell Damage +1</b>",
    "EX1_015": "<b>Battlecry:</b> Draw a card."
  },
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

// src/i18n/locales/zh-CN.json
{
  "locale": "zh-CN",
  "cardNames": {
    "CS1_042": "狗头人地卜师",
    "EX1_015": "工程师学徒"
  },
  "cardDescriptions": {
    "CS1_042": "<b>法术伤害+1</b>",
    "EX1_015": "<b>战吼：</b>抽一张牌。"
  },
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

## 枚举定义

```typescript
// src/enums/cardtype.ts
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

// src/enums/cardclass.ts
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

// src/enums/rarity.ts
export const enum Rarity {
  INVALID = 0,
  COMMON = 1,
  FREE = 2,
  RARE = 3,
  EPIC = 4,
  LEGENDARY = 5,
  UNKNOWN_6 = 6,
}

// src/enums/race.ts
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

// src/enums/zone.ts
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

// src/enums/state.ts
export const enum State {
  INVALID = 0,
  RUNNING = 1,
  COMPLETE = 2,
}

// src/enums/step.ts
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

// src/enums/playstate.ts
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

// src/enums/blocktype.ts
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

// src/enums/tags.ts（内部标签）
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

// src/enums/playreq.ts（出牌要求）
export const enum PlayReq {
  INVALID = -1,
  REQ_MINION_TARGET = 1,
  REQ_FRIENDLY_TARGET = 2,
  REQ_ENEMY_TARGET = 3,
  // ... 完整列表见原项目
}
```

---

## 工具类

```typescript
// src/utils/cardlist.ts
import type { Card } from '../core/card';
import { CardType, Race } from '../enums';
import { Random } from './random';

export class CardList<T extends Card = Card> extends Array<T> {
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
    for (let i = this.length - 1; i > 0; i--) {
      const j = random.nextInt(0, i);
      [this[i], this[j]] = [this[j], this[i]];
    }
  }

  draw(): T | undefined {
    return this.pop();
  }

  drawCount(count: number): T[] {
    const result: T[] = [];
    for (let i = 0; i < count && this.length > 0; i++) {
      result.push(this.pop()!);
    }
    return result;
  }

  byType(type: CardType): CardList<T> {
    return this.filter(c => c.type === type);
  }

  byRace(race: Race): CardList<T> {
    return this.filter(c => (c as any).race === race);
  }

  byCost(cost: number): CardList<T> {
    return this.filter(c => c.cost === cost);
  }

  first(): T | undefined {
    return this[0];
  }

  last(): T | undefined {
    return this[this.length - 1];
  }
}

// src/utils/random.ts
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

  choice<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[this.nextInt(0, array.length - 1)];
  }

  sample<T>(array: T[], count: number): T[] {
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

---

## 配置文件

### package.json

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
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": [
    "hearthstone",
    "simulator",
    "game",
    "typescript"
  ],
  "author": "",
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

### tsconfig.json

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

### jest.config.js

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
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### .eslintrc.js

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

---

## 实施阶段

| 阶段 | 内容 | 文件 |
|------|------|------|
| 1 | 项目初始化 + 配置文件 | package.json, tsconfig.json, jest.config.js, .eslintrc.js |
| 2 | 枚举定义 | enums/*.ts |
| 3 | 工具类 | utils/*.ts |
| 4 | i18n 模块 | i18n/*.ts, locales/*.json |
| 5 | Entity + Manager 基础类 | core/entity.ts, core/manager.ts |
| 6 | Card 基类 | core/card.ts |
| 7 | Player 类 | core/player.ts |
| 8 | Game 类 | core/game.ts |
| 9 | Actions 动作系统 | actions/*.ts |
| 10 | DSL 选择器/评估器 | dsl/*.ts |
| 11 | Aura + Targeting | aura/*.ts, targeting/*.ts |
| 12 | 卡牌注册表 | cards/registry.ts, cards/types.ts |
| 13 | 基础卡牌翻译 | cards/basic/*.ts |
| 14 | 测试用例 | tests/**/*.test.ts |
| 15 | 完整卡牌翻译 | cards/*/*.ts |
