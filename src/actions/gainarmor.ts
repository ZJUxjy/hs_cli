import { Action } from './base';
import { Entity } from '../core/entity';
import { triggerEvent } from '../cards/mechanics';

export class GainArmor extends Action {
  constructor(
    public source: Entity,
    public target: Entity,
    public amount: number
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const target = this.target;
    const targetAny = target as any;
    if (targetAny.armor !== undefined) {
      targetAny.armor += this.amount;
    } else {
      targetAny.armor = this.amount;
    }
    // Trigger ARMOR_GAIN event
    const game = (source as any).game;
    if (game) {
      triggerEvent(game, 'ARMOR_GAIN', {
        type: 'ARMOR_GAIN',
        source: source,
        target: target,
        value: this.amount,
      });
    }
    return [target];
  }
}
