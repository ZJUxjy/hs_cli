import { Action } from './base';
import { Entity } from '../core/entity';

/**
 * Steal Action - Take control of an enemy minion
 * Transfers control of a minion to the caster
 */
export class Steal extends Action {
  constructor() {
    super();
  }

  trigger(_source: Entity, target: Entity, newController?: any): unknown[] {
    const targetAny = target as any;
    const oldController = targetAny.controller;

    if (newController && oldController && newController !== oldController) {
      // Remove from old controller's field
      const oldField = oldController.field || [];
      const idx = oldField.indexOf(target);
      if (idx !== -1) {
        oldField.splice(idx, 1);
      }

      // Add to new controller's field
      if (!newController.field) {
        newController.field = [];
      }
      newController.field.push(target);

      // Update minion's controller reference
      targetAny.controller = newController;

      console.log(`[Steal] Took control of minion`);
    }
    return [target];
  }
}
