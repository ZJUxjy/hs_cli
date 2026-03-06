import { Action } from './base';
import type { Entity } from '../core/entity';

export class Silence extends Action {
  constructor(
    public source: Entity,
    public target: Entity
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const target = this.target;
    const entity = target as any;

    // Clear all buff/effect properties from the target
    entity.buffs = [];
    entity.attack = entity.baseAttack || entity.ATK || entity.attack || 0;
    entity.health = entity.baseHealth || entity.HEALTH || entity.health;
    entity.maxHealth = entity.baseHealth || entity.HEALTH || entity.maxHealth;
    entity.taunt = false;
    entity.divineShield = false;
    entity.stealthed = false;
    entity.frozen = false;
    entity.silenced = true;

    return [target];
  }
}
