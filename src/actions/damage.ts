import { Action } from './base';
import type { Entity } from '../core/entity';

export class Damage extends Action {
  constructor(
    public source: Entity,
    public target: Entity,
    public amount: number
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const target = this.target;
    let amount = this.amount;

    // Get actual damage after modifications
    amount = source.getDamage(amount, target as any);

    const currentDamage = (target as any).damage || 0;
    (target as any).damage = currentDamage + amount;

    return [amount];
  }
}
