import { CardType, PlayState, Zone } from '../enums';
import { Entity } from './entity';
import { CardList } from '../utils/cardlist';
import { Card, PlayableCard, Minion, Hero, HeroPower, Secret, createCard } from './card';
import type { Game } from './game';
import { Draw, Fatigue, Give } from '../actions';
import { CardLoader } from '../cards/loader';

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

  // 其他
  public fatigueCounter: number = 0;
  public startingDeck: string[] = [];
  public startingHero: string = '';
  public weapon: Entity | null = null;
  public zone: Zone = Zone.INVALID;
  public cthun?: Entity;
  public jadeGolem: number = 1;

  constructor(
    public readonly name: string,
    decklist: string[]
  ) {
    super(null);
    this.startingDeck = decklist;
  }

  get controller(): Player {
    return this;
  }

  get characters(): CardList {
    return new CardList([this.hero as unknown as Card, ...this.field as unknown as Card[]]);
  }

  get entities(): CardList {
    const result = new CardList([
      this as unknown as Card,
      this.hero as unknown as Card,
      this.heroPower as unknown as Card,
      ...this.hand as unknown as Card[],
      ...this.field as unknown as Card[],
      ...this.secrets as unknown as Card[]
    ]);
    if (this.weapon) {
      result.push(this.weapon as unknown as Card);
    }
    return result;
  }

  get liveEntities(): CardList {
    const result = new CardList([this.hero as unknown as Card, ...this.field as unknown as Card[]]);
    if (this.weapon) {
      result.push(this.weapon as unknown as Card);
    }
    return result;
  }

  get actionableEntities(): CardList {
    return new CardList([
      ...this.characters as unknown as Card[],
      ...this.hand as unknown as Card[]
    ]);
  }

  // ============== Game Setup ==============

  prepareForGame(): void {
    console.log(`[Player] ${this.name} preparing for game`);

    // Clear all zones
    this.hand = new CardList();
    this.deck = new CardList();
    this.field = new CardList();
    this.graveyard = new CardList();
    this.secrets = new CardList();

    // Create hero if specified (NOT summoned to field!)
    if (this.startingHero) {
      const heroDef = CardLoader.get(this.startingHero);
      if (heroDef) {
        this.hero = new Hero(heroDef);
        (this.hero as any).controller = this;
        (this.hero as any).zone = Zone.PLAY;
        console.log(`[Player] ${this.name} created hero: ${this.hero.name}`);
      } else {
        console.warn(`[Player] Hero not found: ${this.startingHero}`);
      }
    }

    // Create deck from card IDs
    let loadedCount = 0;
    for (const cardId of this.startingDeck) {
      const cardDef = CardLoader.get(cardId);
      if (cardDef) {
        const card = createCard(cardDef);
        (card as any).controller = this;
        (card as any).zone = Zone.DECK;
        this.deck.push(card);
        loadedCount++;
      } else {
        console.warn(`[Player] Card not found: ${cardId}`);
      }
    }
    console.log(`[Player] ${this.name} loaded ${loadedCount}/${this.startingDeck.length} cards`);

    // Shuffle deck
    this.shuffleDeck();

    // Create C'Thun tracking card (for Old Gods mechanics)
    // this.cthun = this.card('OG_280');

    this.playstate = PlayState.PLAYING;

    // Draw initial hand (3 cards for first player, 4 for second)
    const handSize = this.firstPlayer ? 3 : 4;
    for (let i = 0; i < Math.min(handSize, this.deck.length); i++) {
      this.draw(1);
    }

    console.log(`[Player] ${this.name} ready with ${this.deck.length} cards in deck, ${this.hand.length} in hand`);
  }

  // ============== Card Operations ==============

  draw(count: number = 1): PlayableCard[] {
    const drawn: PlayableCard[] = [];

    for (let i = 0; i < count; i++) {
      if (this.deck.length === 0) {
        // Fatigue
        this.game.cheatAction(this, [new Fatigue(this)]);
        continue;
      }

      const card = this.deck.draw();
      if (card) {
        this.hand.push(card);
        (card as any).zone = Zone.HAND;
        drawn.push(card);
        console.log(`[Draw] ${this.name} drew ${card.id}`);
      }
    }

    this.cardsDrawnThisTurn += drawn.length;
    return drawn;
  }

  give(cardId: string): PlayableCard | undefined {
    const cardDef = CardLoader.get(cardId);
    if (!cardDef) {
      console.warn(`[Give] Card ${cardId} not found`);
      return undefined;
    }

    const card = createCard(cardDef);
    (card as any).controller = this;

    if (this.hand.length < 10) {
      this.hand.push(card);
      (card as any).zone = Zone.HAND;
      console.log(`[Give] ${this.name} received ${cardId}`);
      return card;
    } else {
      // Hand is full - card is burned
      this.graveyard.push(card);
      console.log(`[Give] ${this.name} burned ${cardId} (hand full)`);
      return undefined;
    }
  }

  discard(card: PlayableCard): void {
    const idx = this.hand.indexOf(card);
    if (idx !== -1) {
      this.hand.splice(idx, 1);
      this.graveyard.push(card);
      (card as any).zone = Zone.GRAVEYARD;
      console.log(`[Discard] ${this.name} discarded ${card.id}`);
    }
  }

  summon(cardOrId: string | Minion, index?: number): Minion | undefined {
    let minion: Minion;

    if (typeof cardOrId === 'string') {
      const cardDef = CardLoader.get(cardOrId);
      if (!cardDef) {
        console.warn(`[Summon] Card ${cardOrId} not found`);
        return undefined;
      }
      minion = new Minion(cardDef);
    } else {
      minion = cardOrId;
    }

    if (this.field.length >= 7) {
      console.log(`[Summon] Field full, ${minion.id} not summoned`);
      return undefined;
    }

    (minion as any).controller = this;
    (minion as any).zone = Zone.PLAY;
    (minion as any).turnsInPlay = 0;

    if (index !== undefined && index >= 0 && index <= this.field.length) {
      this.field.splice(index, 0, minion);
    } else {
      this.field.push(minion);
    }

    minion.playCounter = this.game.tick++;
    console.log(`[Summon] ${this.name} summoned ${minion.id}`);

    return minion;
  }

  shuffleDeck(): void {
    this.deck.shuffle(this.game.random);
    console.log(`[Shuffle] ${this.name} shuffled their deck`);
  }

  // ============== Cost Management ==============

  canPayCost(card: PlayableCard): boolean {
    return this.mana >= card.cost;
  }

  payCost(amount: number): boolean {
    if (this.mana >= amount) {
      this.usedMana += amount;
      return true;
    }
    return false;
  }

  // ============== Utility ==============

  card(id: string, source?: Entity, parent?: Entity, zone: Zone = Zone.SETASIDE): PlayableCard {
    const cardDef = CardLoader.get(id);
    const card = createCard(cardDef || { id, type: CardType.INVALID, cardClass: 0, cost: 0 });
    (card as any).controller = this;
    (card as any).zone = zone;

    if (source) {
      (card as any).creator = source;
    }
    if (parent) {
      (card as any).parentCard = parent;
    }

    return card;
  }

  concede(): void {
    this.playstate = PlayState.CONCEDED;
    this.game.checkForEndGame();
  }
}
