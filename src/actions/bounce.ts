import { Action } from './base';
import { Entity } from '../core/entity';

/**
 * Bounce Action - Return a minion to hand
 * Returns a minion to its controller's hand
 */
export class Bounce extends Action {
  constructor() {
    super();
  }

  trigger(_source: Entity, target: Entity): unknown[] {
    const targetAny = target as any;
    const controller = targetAny.controller;

    if (controller && controller.hand) {
      // Remove from battlefield
      const field = controller.field || [];
      const idx = field.indexOf(target);
      if (idx !== -1) {
        field.splice(idx, 1);
      }

      // Add to hand
      controller.hand.push(target);

      console.log(`[Bounce] Minion returned to hand`);
    }
    return [target];
  }
}
