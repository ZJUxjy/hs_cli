import { Action } from './base';
import { EventListenerAt } from './eventlistener';
import type { Entity } from '../core/entity';

export class Damage extends Action {
  constructor(
    private amount: number,
    public target?: Entity
  ) {
    super(amount);
  }

  getArgs(_source: Entity): [number] {
    return [this.amount];
  }

  do(source: Entity, amount: number): void {
    // Broadcast ON
    this.broadcast(source, EventListenerAt.ON, amount);

    // Apply damage
    const target = this.target || source;
    const targetAny = target as any;

    // Get actual damage after modifications (if target has getDamage method)
    const actualAmount = targetAny.getDamage?.(amount, source) ?? amount;

    if (actualAmount > 0) {
      targetAny.damage = (targetAny.damage || 0) + actualAmount;
    }

    // Broadcast AFTER
    this.broadcast(source, EventListenerAt.AFTER, amount);

    // Trigger callbacks
    if (this.callback.length > 0) {
      const game = targetAny.game;
      if (game?.queueActions) {
        game.queueActions(source, this.callback);
      }
    }
  }
}
