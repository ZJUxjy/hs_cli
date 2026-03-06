import { Action } from './base';
import type { Entity } from '../core/entity';

export class Heal extends Action {
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

    // Get actual heal after modifications
    amount = source.getHeal(amount, target as any);

    const currentDamage = (target as any).damage || 0;
    const newDamage = Math.max(0, currentDamage - amount);
    (target as any).damage = newDamage;

    return [amount];
  }
}
