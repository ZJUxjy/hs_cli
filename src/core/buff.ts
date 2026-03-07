// Buff/Enchantment system
// Based on fireplace's aura.py and entity.py

import { Entity } from './entity';
import type { Game } from './game';

/**
 * Buff data interface - defines what attributes a buff modifies
 */
export interface BuffData {
  id?: string;
  atk?: number;
  maxHealth?: number;
  taunt?: boolean;
  divineShield?: boolean;
  frozen?: boolean;
  stealth?: boolean;
  windfury?: boolean;
  charge?: boolean;
  lifesteal?: boolean;
  poisonous?: boolean;
  immune?: boolean;
  silence?: boolean;
  cost?: number;
  [key: string]: unknown;
}

/**
 * Buff class - represents a buff/debuff applied to an entity
 */
export class Buff {
  public id: string;
  public source: Entity;
  public target: BuffableEntity;
  public data: BuffData;
  public tick: number = 0;
  public oneTurnEffect: boolean = false;

  constructor(source: Entity, target: BuffableEntity, id: string, data: BuffData = {}) {
    this.source = source;
    this.target = target;
    this.id = id;
    this.data = data;
  }

  /**
   * Get an attribute value, applying the buff's modifier
   */
  _getattr(attr: string, value: number): number {
    // Check for direct attribute match
    if (attr in this.data) {
      const modifier = this.data[attr];
      if (typeof modifier === 'number') {
        return value + modifier;
      }
      if (typeof modifier === 'function') {
        return modifier(this.target, value);
      }
    }

    // Check for _ prefixed attribute (internal value)
    const internalAttr = '_' + attr;
    if (internalAttr in this.data) {
      const modifier = this.data[internalAttr];
      if (typeof modifier === 'number') {
        return value + modifier;
      }
    }

    return value;
  }

  /**
   * Get a boolean attribute
   */
  getBoolean(attr: string): boolean {
    if (attr in this.data) {
      return Boolean(this.data[attr]);
    }
    return false;
  }

  /**
   * Remove this buff from the target
   */
  remove(): void {
    this.target.removeBuff(this);
  }

  toString(): string {
    return `<Buff ${this.id}>`;
  }
}

/**
 * Slot - A slot for buffs (used for aura slots)
 */
export class Slot {
  public source: Entity;
  public target: BuffableEntity;
  public tags: Map<string, unknown> = new Map();

  constructor(source: Entity, target: BuffableEntity) {
    this.source = source;
    this.target = target;
  }

  updateTags(tags: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(tags)) {
      this.tags.set(key, value);
    }
  }

  _getattr(attr: string, value: number): number {
    if (this.tags.has(attr)) {
      const tagValue = this.tags.get(attr);
      if (typeof tagValue === 'number') {
        return value + tagValue;
      }
    }
    return value;
  }
}

/**
 * Interface for entities that can have buffs
 */
export interface BuffableEntity extends Entity {
  _buffs: Buff[];
  _slots: Slot[];
  _buffValues: Record<string, number>;  // Internal base values

  buff(source: Entity, id: string, data?: BuffData): Buff;
  buff(source: Entity, buff: Buff): Buff;
  removeBuff(buff: Buff): void;
  clearBuffs(): void;
  hasBuff(id: string): boolean;
  getBuff(id: string): Buff | undefined;

  refreshBuff(source: Entity, id: string): void;
  refreshTags(source: Entity, tags: Record<string, unknown>): void;
}

/**
 * Base class for buffable entities
 */
export abstract class BuffableBase extends Entity implements BuffableEntity {
  _buffs: Buff[] = [];
  _slots: Slot[] = [];
  _buffValues: Record<string, number> = {};

  /**
   * Apply a buff to this entity
   */
  buff(source: Entity, idOrBuff: string | Buff, data?: BuffData): Buff {
    let buff: Buff;

    if (typeof idOrBuff === 'string') {
      buff = new Buff(source, this, idOrBuff, data || {});
    } else {
      buff = idOrBuff;
      buff.target = this;
    }

    this._buffs.push(buff);
    console.log(`[Buff] Applied ${buff} to ${(this as any).id || this.constructor.name}`);

    return buff;
  }

  /**
   * Remove a buff from this entity
   */
  removeBuff(buff: Buff): void {
    const idx = this._buffs.indexOf(buff);
    if (idx !== -1) {
      this._buffs.splice(idx, 1);
      console.log(`[Buff] Removed ${buff} from ${(this as any).id || this.constructor.name}`);
    }
  }

  /**
   * Clear all buffs
   */
  clearBuffs(): void {
    if (this._buffs.length > 0) {
      console.log(`[Buff] Clearing ${this._buffs.length} buffs from ${(this as any).id || this.constructor.name}`);
      for (const buff of [...this._buffs]) {
        buff.remove();
      }
    }
  }

  /**
   * Check if entity has a specific buff
   */
  hasBuff(id: string): boolean {
    return this._buffs.some(b => b.id === id);
  }

  /**
   * Get a specific buff by id
   */
  getBuff(id: string): Buff | undefined {
    return this._buffs.find(b => b.id === id);
  }

  /**
   * Refresh a buff (for auras) - creates if doesn't exist, updates tick
   */
  refreshBuff(source: Entity, id: string): void {
    const existing = this._buffs.find(b => b.source === source && b.id === id);
    const game = (this as any).game as Game | undefined;
    if (existing) {
      existing.tick = game?.tick || 0;
    } else {
      const buff = new Buff(source, this, id);
      buff.tick = game?.tick || 0;
      this._buffs.push(buff);
      console.log(`[Aura] Applied ${buff} to ${(this as any).id || this.constructor.name}`);
    }
  }

  /**
   * Refresh tags on a slot (for aura tags)
   */
  refreshTags(source: Entity, tags: Record<string, unknown>): void {
    const existing = this._slots.find(s => s.source === source);
    if (existing) {
      existing.updateTags(tags);
    } else {
      const slot = new Slot(source, this);
      slot.updateTags(tags);
      this._slots.push(slot);
      console.log(`[Aura] Created slot on ${(this as any).id || this.constructor.name}`);
    }
  }

  /**
   * Get an attribute with buff modifiers applied
   */
  protected _getattr(attr: string, value: number): number {
    // Start with internal value
    let result = this._buffValues[attr] ?? value;

    // Apply script modifier if exists
    if (this.data?.scripts && attr in this.data.scripts) {
      const script = (this.data.scripts as any)[attr];
      if (typeof script === 'function') {
        result = script(this, result);
      }
    }

    // Apply buffs
    for (const buff of this._buffs) {
      result = buff._getattr(attr, result);
    }

    // Apply slots (auras)
    for (const slot of this._slots) {
      result = slot._getattr(attr, result);
    }

    return result;
  }

  /**
   * Get boolean attribute (checks buffs and slots)
   */
  protected _getbool(attr: string): boolean {
    // Check direct property
    if ((this as any)['_' + attr]) return true;

    // Check buffs
    for (const buff of this._buffs) {
      if (buff.getBoolean(attr)) return true;
    }

    // Check slots
    for (const slot of this._slots) {
      if (slot.tags.has(attr) && slot.tags.get(attr)) return true;
    }

    return false;
  }
}

/**
 * Refresh class - represents an aura refresh action
 */
export class Refresh {
  constructor(
    public selector: any,  // Will be Selector when implemented
    public tags?: Record<string, unknown>,
    public buff?: string,
    public priority: number = 50
  ) {}

  trigger(source: Entity): void {
    // This will be implemented when Selector is ready
    // For now, it's a placeholder
    console.log(`[Refresh] Triggering refresh from ${(source as any).id}`);
  }
}
