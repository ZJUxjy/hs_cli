import { CardType, PlayState } from '../enums';
import { Entity } from './entity';
import { CardList } from '../utils/cardlist';
import { Card, PlayableCard, Minion, Hero, HeroPower, Secret } from './card';
import type { Game } from './game';

export class Player extends Entity {
  type = CardType.PLAYER;

  public opponent!: Player;
  public game!: Game;
  public firstPlayer: boolean = false;

  // 区域
  public hand = new CardList<PlayableCard>();
  public deck = new CardList<PlayableCard>();
  public field = new CardList<Minion>();
  public graveyard = new CardList<Card>();
  public secrets = new CardList<Secret>();

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
  public minionsKilledThisTurn = new CardList();
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

  get controller(): Player {
    return this;
  }

  get characters(): CardList {
    return new CardList([this.hero as unknown as Card, ...this.field as unknown as Card[]]);
  }

  get entities(): CardList {
    return new CardList([
      this as unknown as Card,
      this.hero as unknown as Card,
      this.heroPower as unknown as Card,
      ...this.hand as unknown as Card[],
      ...this.field as unknown as Card[],
      ...this.secrets as unknown as Card[]
    ]);
  }

  get liveEntities(): CardList {
    return new CardList([this.hero as unknown as Card, ...this.field as unknown as Card[]]);
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
    const definition = { id: cardId, type: CardType.INVALID, cardClass: 0, cost: 0 };
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
