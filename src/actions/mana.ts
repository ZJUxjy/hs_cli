import { Action } from './base';
import type { Entity } from '../core/entity';

export class ManaThisTurn extends Action {
  constructor(
    public source: Entity,
    public amount: number
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const controller = (this.source as any).controller;
    if (controller) {
      // Add temporary mana crystals that expire at end of turn
      controller.tempMana = (controller.tempMana || 0) + this.amount;
    }
    return [];
  }
}

export class GainMana extends Action {
  constructor(
    public source: Entity,
    public amount: number
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const controller = (this.source as any).controller;
    if (controller) {
      // Add mana crystals (permanent)
      controller.mana = (controller.mana || 0) + this.amount;
    }
    return [];
  }
}
