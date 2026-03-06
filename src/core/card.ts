import { CardType, CardClass, Rarity, Race, Zone } from '../enums';
import { I18n } from '../i18n';
import { Entity } from './entity';

export interface CardDefinition {
  id: string;
  type: CardType;
  cardClass: CardClass;
  cost: number;
  rarity?: Rarity;
  set?: number;
  collectible?: boolean;
  attack?: number;
  health?: number;
  race?: Race;
  durability?: number;
  requirements?: Record<string, number>;
  scripts?: CardScripts;
  names?: Record<string, string>;
  descriptions?: Record<string, string>;
}

export interface CardScripts {
  play?: (card: PlayableCard, target?: unknown) => unknown[];
  battlecry?: (card: PlayableCard, target?: unknown) => unknown[];
  deathrattle?: (minion: Minion) => unknown[];
  trigger?: (card: Card, event: unknown) => unknown[];
  update?: unknown[];
  events?: unknown[];
}

export class Card extends Entity {
  public id: string;
  public cardClass: CardClass = CardClass.INVALID;
  public rarity: Rarity = Rarity.INVALID;
  public zone: Zone = Zone.INVALID;
  public race: Race = Race.INVALID;

  constructor(definition: CardDefinition) {
    super(definition as unknown as null);
    this.id = definition.id;
    this.type = definition.type;
    this.cardClass = definition.cardClass;
    this.rarity = definition.rarity || Rarity.INVALID;
    this.race = definition.race || Race.INVALID;
  }

  get name(): string {
    return I18n.getCardName(this.id);
  }

  get description(): string {
    return I18n.getCardDescription(this.id);
  }

  get cost(): number {
    return this._getattr('cost', (this.data as any)?.cost || 0);
  }

  set cost(value: number) {
    (this as any)._cost = value;
  }

  getController(): Player {
    return (this as any).controller;
  }

  isPlayable(): boolean {
    if (this.zone !== Zone.HAND) return false;
    const controller = this.getController();
    if (!controller) return false;
    if ((controller as any).mana < this.cost) return false;
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

// Forward declaration for Player (circular dependency)
export class Player extends Entity {}

// Re-export enums
export { CardType, CardClass, Rarity, Race, Zone };
