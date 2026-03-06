import { Action } from './base';
import { Entity } from '../core/entity';

export class GainArmor extends Action {
  constructor(
    public source: Entity,
    public target: Entity,
    public amount: number
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const target = this.target;
    const targetAny = target as any;
    if (targetAny.armor !== undefined) {
      targetAny.armor += this.amount;
    } else {
      targetAny.armor = this.amount;
    }
    return [target];
  }
}
