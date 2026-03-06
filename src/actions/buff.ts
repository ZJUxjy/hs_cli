import { Action } from './base';
import { Entity } from '../core/entity';

export interface BuffActionParams {
  ATK?: number;
  HEALTH?: number;
  damage?: number;
  taunt?: boolean;
  divineShield?: boolean;
  stealth?: boolean;
}

export class Buff extends Action {
  constructor(
    public source: Entity,
    public target: Entity,
    private params: BuffActionParams = {}
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const target = this.target;
    const targetAny = target as any;

    // Apply attack buff
    if (this.params.ATK !== undefined) {
      if (!targetAny.buffs) targetAny.buffs = [];
      targetAny.buffs.push({ type: 'ATK', value: this.params.ATK });
      targetAny.attack = (targetAny.attack || 0) + this.params.ATK;
    }

    // Apply health buff
    if (this.params.HEALTH !== undefined) {
      if (!targetAny.buffs) targetAny.buffs = [];
      targetAny.buffs.push({ type: 'HEALTH', value: this.params.HEALTH });
      targetAny.maxHealth = (targetAny.maxHealth || 0) + this.params.HEALTH;
      // If damaged, heal for the buff amount
      if (targetAny.damage && targetAny.damage > 0) {
        targetAny.damage = Math.max(0, targetAny.damage - this.params.HEALTH);
      }
    }

    // Apply taunt
    if (this.params.taunt) {
      targetAny.taunt = true;
    }

    // Apply divine shield
    if (this.params.divineShield) {
      targetAny.divineShield = true;
    }

    // Apply stealth
    if (this.params.stealth) {
      targetAny.stealthed = true;
    }

    return [target];
  }
}

export class Debuff extends Action {
  constructor(
    _buffId: string,
    private params: BuffActionParams = {}
  ) {
    super();
  }

  trigger(_source: Entity, target: Entity): unknown[] {
    const targetAny = target as any;

    // Apply attack debuff
    if (this.params.ATK !== undefined) {
      const currentAtk = targetAny.attack || 0;
      const newAtk = Math.max(0, currentAtk - Math.abs(this.params.ATK));
      targetAny.attack = newAtk;
    }

    // Apply health debuff (set damage)
    if (this.params.HEALTH !== undefined) {
      const maxHealth = targetAny.maxHealth || 0;
      const damage = maxHealth - this.params.HEALTH;
      if (damage > 0) {
        targetAny.damage = (targetAny.damage || 0) + damage;
      }
    }

    return [target];
  }
}
