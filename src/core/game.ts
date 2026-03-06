import { Random } from '../utils/random';
import { CardType, State, Step, PlayState } from '../enums';
import { Entity } from './entity';
import { Manager } from './manager';
import { CardList } from '../utils/cardlist';
import { Player } from './player';

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
    const p1Field = this.players[0].field;
    const p2Field = this.players[1].field;
    const result = new CardList();
    p1Field.forEach((m) => result.push(m as unknown as unknown));
    p2Field.forEach((m) => result.push(m as unknown as unknown));
    return result;
  }

  get decks(): CardList {
    const result = new CardList();
    this.players[0].deck.forEach((c) => result.push(c as unknown as unknown));
    this.players[1].deck.forEach((c) => result.push(c as unknown as unknown));
    return result;
  }

  get characters(): CardList {
    const result = new CardList();
    this.players[0].characters.forEach((c) => result.push(c as unknown as unknown));
    this.players[1].characters.forEach((c) => result.push(c as unknown as unknown));
    return result;
  }

  get graveyard(): CardList {
    const result = new CardList();
    this.players[0].graveyard.forEach((c) => result.push(c as unknown as unknown));
    this.players[1].graveyard.forEach((c) => result.push(c as unknown as unknown));
    return result;
  }

  get entities(): CardList {
    const result = new CardList();
    result.push(this as unknown as unknown);
    this.players[0].entities.forEach((e) => result.push(e as unknown as unknown));
    this.players[1].entities.forEach((e) => result.push(e as unknown as unknown));
    return result;
  }

  get liveEntities(): CardList {
    const result = new CardList();
    this.players[0].liveEntities.forEach((e) => result.push(e as unknown as unknown));
    this.players[1].liveEntities.forEach((e) => result.push(e as unknown as unknown));
    return result;
  }

  get minionsKilledThisTurn(): CardList {
    const result = new CardList();
    this.players[0].minionsKilledThisTurn.forEach((m) => result.push(m as unknown as unknown));
    this.players[1].minionsKilledThisTurn.forEach((m) => result.push(m as unknown as unknown));
    return result;
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

  queueActions(source: Entity, actions: unknown[], _eventArgs?: unknown): unknown[] {
    return this.triggerActions(source, actions);
  }

  triggerActions(source: Entity, actions: unknown[]): unknown[] {
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
