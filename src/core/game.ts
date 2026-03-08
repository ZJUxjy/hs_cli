import { Random } from '../utils/random';
import { CardType, State, Step, PlayState, Zone, BlockType } from '../enums';
import { Entity } from './entity';
import { Manager } from './manager';
import { CardList } from '../utils/cardlist';
import { Player } from './player';
import { Card } from './card';
import { GameStart, BeginTurn, EndTurn, Death, Action } from '../actions';
import { EventManager } from '../events/eventmanager';
import { GameEvent, EventPayload, EventHandler } from '../events/eventtypes';

export interface GameConfig {
  players: Player[];
  seed?: number;
}

// Block type names for logging
const blockTypeNames: Record<number, string> = {
  [BlockType.ATTACK]: 'ATTACK',
  [BlockType.JOUST]: 'JOUST',
  [BlockType.POWER]: 'POWER',
  [BlockType.TRIGGER]: 'TRIGGER',
  [BlockType.DEATHS]: 'DEATHS',
  [BlockType.PLAY]: 'PLAY',
  [BlockType.FATALITY]: 'FATALITY',
  [BlockType.RITUAL]: 'RITUAL',
  [BlockType.REVEAL_CARD]: 'REVEAL_CARD',
  [BlockType.GAME_RESET]: 'GAME_RESET',
  [BlockType.MOVE_MINION]: 'MOVE_MINION',
};

// Step names for logging
const stepNames: Record<number, string> = {
  [Step.INVALID]: 'INVALID',
  [Step.BEGIN_FIRST]: 'BEGIN_FIRST',
  [Step.BEGIN_SHUFFLE]: 'BEGIN_SHUFFLE',
  [Step.BEGIN_DRAW]: 'BEGIN_DRAW',
  [Step.BEGIN_MULLIGAN]: 'BEGIN_MULLIGAN',
  [Step.MAIN_BEGIN]: 'MAIN_BEGIN',
  [Step.MAIN_READY]: 'MAIN_READY',
  [Step.MAIN_START_TRIGGERS]: 'MAIN_START_TRIGGERS',
  [Step.MAIN_RESOURCE]: 'MAIN_RESOURCE',
  [Step.MAIN_DRAW]: 'MAIN_DRAW',
  [Step.MAIN_START]: 'MAIN_START',
  [Step.MAIN_ACTION]: 'MAIN_ACTION',
  [Step.MAIN_COMBAT]: 'MAIN_COMBAT',
  [Step.MAIN_END]: 'MAIN_END',
  [Step.MAIN_NEXT]: 'MAIN_NEXT',
  [Step.FINAL_WRAPUP]: 'FINAL_WRAPUP',
  [Step.FINAL_GAMEOVER]: 'FINAL_GAMEOVER',
  [Step.MAIN_CLEANUP]: 'MAIN_CLEANUP',
  [Step.MAIN_START_MULLIGAN]: 'MAIN_START_MULLIGAN',
};

// PlayState names for logging
const playStateNames: Record<number, string> = {
  [PlayState.INVALID]: 'INVALID',
  [PlayState.PLAYING]: 'PLAYING',
  [PlayState.WINNING]: 'WINNING',
  [PlayState.LOSING]: 'LOSING',
  [PlayState.WON]: 'WON',
  [PlayState.LOST]: 'LOST',
  [PlayState.TIED]: 'TIED',
  [PlayState.DISCONNECTED]: 'DISCONNECTED',
  [PlayState.CONCEDED]: 'CONCEDED',
};

export class GameManager extends Manager {
  // Game-specific management
  actionStart(type: BlockType, source: Entity, index: number, target?: Entity): void {
    console.log(`[Block] Start ${blockTypeNames[type] || type} from ${(source as any).id || 'game'}`);
  }

  actionEnd(type: BlockType, source: Entity): void {
    console.log(`[Block] End ${blockTypeNames[type] || type}`);
  }

  step(from: Step, to: Step): void {
    console.log(`[Step] ${stepNames[from] || from} -> ${stepNames[to] || to}`);
  }

  turn(player: Player): void {
    console.log(`[Turn] Now ${player.name}'s turn`);
  }

  startGame(): void {
    console.log('[Game] Starting');
  }

  newEntity(entity: Entity): void {
    // console.log(`[Entity] New entity ${(entity as any).id}`);
  }
}

export class Game extends Entity {
  static readonly MAX_MINIONS_ON_FIELD = 7;
  static readonly MAX_SECRETS_ON_PLAY = 5;

  public readonly players: Player[];
  public readonly random: Random;
  public readonly activeAuraBuffs = new CardList();
  public readonly setaside = new CardList();

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

  public manager: GameManager;
  public eventManager: EventManager;
  private _actionStack = 0;

  type = CardType.GAME;

  constructor(config: GameConfig) {
    super(null);
    this.players = config.players;
    this.random = new Random(config.seed);
    this.manager = new GameManager(this);
    this.eventManager = new EventManager(this);
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

  get ended(): boolean {
    return this.state === State.COMPLETE;
  }

  get board(): CardList {
    const result = new CardList();
    this.players[0].field.forEach((m) => result.push(m as unknown as Card));
    this.players[1].field.forEach((m) => result.push(m as unknown as Card));
    return result;
  }

  get decks(): CardList {
    const result = new CardList();
    this.players[0].deck.forEach((c) => result.push(c as unknown as Card));
    this.players[1].deck.forEach((c) => result.push(c as unknown as Card));
    return result;
  }

  get hands(): CardList {
    const result = new CardList();
    this.players[0].hand.forEach((c) => result.push(c as unknown as Card));
    this.players[1].hand.forEach((c) => result.push(c as unknown as Card));
    return result;
  }

  get characters(): CardList {
    const result = new CardList();
    this.players[0].characters.forEach((c) => result.push(c as unknown as Card));
    this.players[1].characters.forEach((c) => result.push(c as unknown as Card));
    return result;
  }

  get graveyard(): CardList {
    const result = new CardList();
    this.players[0].graveyard.forEach((c) => result.push(c as unknown as Card));
    this.players[1].graveyard.forEach((c) => result.push(c as unknown as Card));
    return result;
  }

  get entities(): CardList {
    const result = new CardList();
    result.push(this as unknown as Card);
    this.players[0].entities.forEach((e) => result.push(e as unknown as Card));
    this.players[1].entities.forEach((e) => result.push(e as unknown as Card));
    return result;
  }

  get liveEntities(): CardList {
    const result = new CardList();
    this.players[0].liveEntities.forEach((e) => result.push(e as unknown as Card));
    this.players[1].liveEntities.forEach((e) => result.push(e as unknown as Card));
    return result;
  }

  // ============== Game Setup ==============

  start(): void {
    this.setup();
    this.queueActions(this, [new GameStart()]);
    this.beginTurn(this.player1);
  }

  setup(): void {
    console.log('[Game] Setting up');
    this.state = State.RUNNING;
    this.step = Step.BEGIN_DRAW;
    (this as any).zone = Zone.PLAY;

    // Player 1 is always first player (no random shuffle for web demo)
    this.player1 = this.players[0];
    this.player1.firstPlayer = true;
    this.player2 = this.players[1];
    this.player2.firstPlayer = false;

    this.player1.opponent = this.player2;
    this.player2.opponent = this.player1;

    for (const player of this.players) {
      player.zone = Zone.PLAY;
      this.manager.newEntity(player);
      player.prepareForGame();
    }

    this.manager.startGame();
  }

  pickFirstPlayer(): [Player, Player] {
    // Second player gets The Coin
    const shuffled = this.random.sample(this.players, this.players.length);
    return [shuffled[0], shuffled[1]];
  }

  // ============== Turn Management ==============

  beginTurn(player: Player): void {
    this.currentPlayer = player;
    this.turn++;

    // Trigger turn begin events
    this.trigger(GameEvent.TURN_BEGIN, { player });
    this.trigger(GameEvent.OWN_TURN_BEGIN, { player });

    this.queueActions(this, [new BeginTurn(player)]);
    this.manager.turn(player);
  }

  endTurn(): void {
    if (!this.currentPlayer) return;

    // Trigger turn end events
    this.trigger(GameEvent.TURN_END, { player: this.currentPlayer });
    this.trigger(GameEvent.OWN_TURN_END, { player: this.currentPlayer });

    this.queueActions(this, [new EndTurn(this.currentPlayer)]);
    this.endTurnCleanup();
  }

  private endTurnCleanup(): void {
    // Reset counters for the ending player
    for (const player of this.players) {
      (player as any).minionsKilledThisTurn = [];
    }

    // Switch to next player
    this.currentPlayer = this.currentPlayer!.opponent;
    this.beginTurn(this.currentPlayer);
  }

  // ============== Action System ==============

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
    if (!this._actionStack) {
      this.refreshAuras();
      this.processDeaths();
    }
  }

  actionBlock(
    source: Entity,
    actions: Action[],
    type: BlockType,
    index = -1,
    target?: Entity,
    eventArgs?: unknown
  ): unknown[] {
    this.actionStart(type, source, index, target);
    let ret: unknown[] = [];
    if (actions.length > 0) {
      ret = this.queueActions(source, actions, eventArgs);
    }
    this.actionEnd(type, source);
    return ret;
  }

  queueActions(source: Entity, actions: Action[], _eventArgs?: unknown): unknown[] {
    return this.triggerActions(source, actions);
  }

  triggerActions(source: Entity, actions: Action[]): unknown[] {
    const results: unknown[] = [];
    for (const action of actions) {
      const result = action.trigger(source);
      if (result) {
        results.push(result);
      }
    }
    return results;
  }

  cheatAction(source: Entity, actions: Action[]): unknown[] {
    return this.queueActions(source, actions);
  }

  // ============== Combat ==============

  attack(source: Entity, target: Entity): void {
    // Attack logic would go here
    console.log(`[Attack] ${(source as any).id} attacks ${(target as any).id}`);
  }

  // ============== Death Processing ==============

  processDeaths(): void {
    const deadEntities: Entity[] = [];

    for (const entity of this.liveEntities) {
      const entityAny = entity as any;
      // Check if entity should die:
      // - explicitly marked as dead, OR
      // - is a character (has maxHealth) and damage >= maxHealth
      const shouldDie = entityAny.dead ||
        (entityAny.maxHealth !== undefined && entityAny.damage >= entityAny.maxHealth);

      if (shouldDie) {
        console.log(`[Death] ${entityAny.name || entityAny.id} marked for death (damage: ${entityAny.damage}, maxHealth: ${entityAny.maxHealth})`);
        deadEntities.push(entity as any);
      }
    }

    if (deadEntities.length > 0) {
      this.actionBlock(this, [new Death(deadEntities as any)], BlockType.DEATHS);
    }
  }

  refreshAuras(): void {
    // Aura refresh logic
    this.tick++;
  }

  // ============== Game End ==============

  checkForEndGame(): void {
    let gameOver = false;

    for (const player of this.players) {
      if (player.playstate === PlayState.CONCEDED || player.playstate === PlayState.DISCONNECTED) {
        player.playstate = PlayState.LOSING;
      }
      if (player.playstate === PlayState.LOSING) {
        gameOver = true;
      }
      // Check hero health
      const hero = player.hero;
      if (hero) {
        const heroAny = hero as any;
        if (heroAny.health !== undefined && heroAny.damage >= heroAny.health) {
          player.playstate = PlayState.LOSING;
          gameOver = true;
        }
      }
    }

    if (gameOver) {
      if (this.players[0].playstate === this.players[1].playstate) {
        for (const player of this.players) {
          player.playstate = PlayState.TIED;
        }
      } else {
        for (const player of this.players) {
          if (player.playstate === PlayState.LOSING) {
            player.playstate = PlayState.LOST;
          } else {
            player.playstate = PlayState.WON;
          }
        }
      }
      this.state = State.COMPLETE;
      console.log('[Game] Game Over!');
      console.log(`  ${this.players[0].name}: ${playStateNames[this.players[0].playstate] || this.players[0].playstate}`);
      console.log(`  ${this.players[1].name}: ${playStateNames[this.players[1].playstate] || this.players[1].playstate}`);
    }
  }

  // ============== Event System ==============

  trigger(event: GameEvent, payload: Partial<EventPayload> = {}): any[] {
    return this.eventManager.trigger(event, payload);
  }

  on(event: GameEvent, handler: EventHandler, condition?: (payload: EventPayload) => boolean): number {
    return this.eventManager.on(this, { event, handler, condition });
  }

  once(event: GameEvent, handler: EventHandler, condition?: (payload: EventPayload) => boolean): number {
    return this.eventManager.once(this, { event, handler, condition });
  }

  off(listenerId: number): boolean {
    return this.eventManager.off(listenerId);
  }
}
