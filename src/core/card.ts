import { CardType, CardClass, Rarity, Race, Zone } from '../enums';
import { I18n } from '../i18n';
import { Entity } from './entity';
import { TargetValidator } from '../targeting/targetvalidator';
import { Buff } from './buff';

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
  charge?: boolean;
  taunt?: boolean;
  divineShield?: boolean;
  windfury?: boolean;
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

    // Check targeting requirements using TargetValidator
    const game = (controller as any).game as import('./game').Game;
    if (game) {
      const playerReqCheck = TargetValidator.checkPlayerRequirements(this, controller);
      if (!playerReqCheck.valid) return false;

      const canPlayCheck = TargetValidator.canPlay(this, controller, game);
      if (!canPlayCheck) return false;
    }

    return true;
  }

  /**
   * Check if a specific entity is a valid target for this card
   */
  canTarget(target: Entity): boolean {
    const result = TargetValidator.isValidTarget(this, target);
    return result.valid;
  }

  /**
   * Get all valid targets for this card
   */
  getValidTargets(): Entity[] {
    const controller = this.getController();
    if (!controller) return [];

    const game = (controller as any).game as import('./game').Game;
    if (!game) return [];

    return TargetValidator.getValidTargets(this, controller, game);
  }
}

export class PlayableCard extends Card {
  // Playable card logic
}

export class Minion extends PlayableCard {
  public _attack: number = 0;
  public _maxHealth: number = 0;
  public damage: number = 0;
  public _taunt: boolean = false;
  public _divineShield: boolean = false;
  public _frozen: boolean = false;
  public silenced: boolean = false;
  public sleeping: boolean = false;
  public windfury: boolean = false;
  public charge: boolean = false;
  public lifesteal: boolean = false;
  public poisonous: boolean = false;
  public _immune: boolean = false;
  public stealth: boolean = false;

  _buffs: import('./buff').Buff[] = [];
  _slots: import('./buff').Slot[] = [];
  _buffValues: Record<string, number> = {};

  constructor(definition: CardDefinition) {
    super(definition);
    this._attack = definition.attack || 0;
    this._maxHealth = definition.health || 0;
  }

  get attack(): number {
    let value = this._attack;
    for (const buff of this._buffs) {
      // Check both 'attack' and 'atk' keys
      value = buff._getattr('attack', value);
      if ('atk' in buff.data) {
        value += (buff.data.atk as number) || 0;
      }
    }
    for (const slot of this._slots) {
      value = slot._getattr('attack', value);
    }
    return value;
  }

  set attack(value: number) {
    this._attack = value;
  }

  get maxHealth(): number {
    let value = this._maxHealth;
    for (const buff of this._buffs) {
      value = buff._getattr('maxHealth', value);
      if ('health' in buff.data) {
        value += (buff.data.health as number) || 0;
      }
    }
    for (const slot of this._slots) {
      value = slot._getattr('maxHealth', value);
    }
    return value;
  }

  set maxHealth(value: number) {
    this._maxHealth = value;
  }

  get health(): number {
    return this.maxHealth - this.damage;
  }

  get taunt(): boolean {
    if (this._taunt) return true;
    for (const buff of this._buffs) {
      if (buff.getBoolean('taunt')) return true;
    }
    for (const slot of this._slots) {
      if (slot.tags.get('taunt')) return true;
    }
    return false;
  }

  set taunt(value: boolean) {
    this._taunt = value;
  }

  get divineShield(): boolean {
    if (this._divineShield) return true;
    for (const buff of this._buffs) {
      if (buff.getBoolean('divineShield')) return true;
    }
    for (const slot of this._slots) {
      if (slot.tags.get('divineShield')) return true;
    }
    return false;
  }

  set divineShield(value: boolean) {
    this._divineShield = value;
  }

  get frozen(): boolean {
    if (this._frozen) return true;
    for (const buff of this._buffs) {
      if (buff.getBoolean('frozen')) return true;
    }
    for (const slot of this._slots) {
      if (slot.tags.get('frozen')) return true;
    }
    return false;
  }

  set frozen(value: boolean) {
    this._frozen = value;
  }

  get immune(): boolean {
    if (this._immune) return true;
    for (const buff of this._buffs) {
      if (buff.getBoolean('immune')) return true;
    }
    for (const slot of this._slots) {
      if (slot.tags.get('immune')) return true;
    }
    return false;
  }

  set immune(value: boolean) {
    this._immune = value;
  }

  // Buff accessors
  get buffs(): import('./buff').Buff[] {
    return this._buffs;
  }

  get slots(): import('./buff').Slot[] {
    return this._slots;
  }

  // Buff methods
  buff(source: Entity, idOrBuff: string | Buff, data?: import('./buff').BuffData): Buff {
    let buff: Buff;

    if (typeof idOrBuff === 'string') {
      buff = new Buff(source, this as any, idOrBuff, data || {});
    } else {
      buff = idOrBuff;
      buff.target = this as any;
    }

    this._buffs.push(buff);
    console.log(`[Buff] Applied ${buff.id} to ${this.id}`);
    return buff;
  }

  removeBuff(buff: import('./buff').Buff): void {
    const idx = this._buffs.indexOf(buff);
    if (idx !== -1) {
      this._buffs.splice(idx, 1);
      console.log(`[Buff] Removed ${buff.id} from ${this.id}`);
    }
  }

  clearBuffs(): void {
    for (const buff of [...this._buffs]) {
      buff.remove();
    }
  }

  hasBuff(id: string): boolean {
    return this._buffs.some(b => b.id === id);
  }

  getBuff(id: string): import('./buff').Buff | undefined {
    return this._buffs.find(b => b.id === id);
  }
}

export class Spell extends PlayableCard {
  // Spell logic

  /**
   * Called when the spell is played/cast
   * Override this method to add custom spell behavior
   */
  onPlay(): void {
    // Base implementation - can be overridden
  }
}

export class Weapon extends PlayableCard {
  public _attack: number = 0;
  public _durability: number = 0;
  public damage: number = 0;

  _buffs: import('./buff').Buff[] = [];
  _slots: import('./buff').Slot[] = [];
  _buffValues: Record<string, number> = {};

  constructor(definition: CardDefinition) {
    super(definition);
    this._attack = definition.attack || 0;
    this._durability = definition.durability || 0;
  }

  get attack(): number {
    let value = this._attack;
    for (const buff of this._buffs) {
      value = buff._getattr('attack', value);
    }
    for (const slot of this._slots) {
      value = slot._getattr('attack', value);
    }
    return value;
  }

  set attack(value: number) {
    this._attack = value;
  }

  get durability(): number {
    let value = this._durability;
    for (const buff of this._buffs) {
      value = buff._getattr('durability', value);
    }
    for (const slot of this._slots) {
      value = slot._getattr('durability', value);
    }
    return value - this.damage;
  }

  get maxDurability(): number {
    let value = this._durability;
    for (const buff of this._buffs) {
      value = buff._getattr('durability', value);
    }
    for (const slot of this._slots) {
      value = slot._getattr('durability', value);
    }
    return value;
  }

  set durability(value: number) {
    this._durability = value;
  }

  // Buff accessors
  get buffs(): import('./buff').Buff[] {
    return this._buffs;
  }

  get slots(): import('./buff').Slot[] {
    return this._slots;
  }

  // Buff methods
  buff(source: Entity, idOrBuff: string | Buff, data?: import('./buff').BuffData): Buff {
    let buff: Buff;

    if (typeof idOrBuff === 'string') {
      buff = new Buff(source, this as any, idOrBuff, data || {});
    } else {
      buff = idOrBuff;
      buff.target = this as any;
    }

    this._buffs.push(buff);
    console.log(`[Buff] Applied ${buff.id} to ${this.id}`);
    return buff;
  }

  removeBuff(buff: import('./buff').Buff): void {
    const idx = this._buffs.indexOf(buff);
    if (idx !== -1) {
      this._buffs.splice(idx, 1);
      console.log(`[Buff] Removed ${buff.id} from ${this.id}`);
    }
  }

  clearBuffs(): void {
    for (const buff of [...this._buffs]) {
      buff.remove();
    }
  }

  hasBuff(id: string): boolean {
    return this._buffs.some(b => b.id === id);
  }

  getBuff(id: string): import('./buff').Buff | undefined {
    return this._buffs.find(b => b.id === id);
  }

  loseDurability(amount: number = 1): void {
    this.damage += amount;
    console.log(`[Weapon] ${this.id} durability: ${this.durability}/${this.maxDurability}`);

    if (this.durability <= 0) {
      this.destroy();
    }
  }

  destroy(): void {
    const controller = this.getController();
    if (controller && (controller as any).weapon === this) {
      (controller as any).weapon = null;
      console.log(`[Weapon] ${this.id} destroyed`);
    }
    this.zone = Zone.GRAVEYARD;
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

/**
 * Factory function to create the correct card type based on definition
 */
export function createCard(definition: CardDefinition): PlayableCard {
  switch (definition.type) {
    case CardType.MINION:
      return new Minion(definition);
    case CardType.SPELL:
      return new Spell(definition);
    case CardType.WEAPON:
      return new Weapon(definition);
    case CardType.HERO:
      return new Hero(definition);
    case CardType.HERO_POWER:
      return new HeroPower(definition);
    default:
      return new PlayableCard(definition);
  }
}

// Re-export enums
export { CardType, CardClass, Rarity, Race, Zone };
