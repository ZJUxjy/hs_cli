import { Action } from './base';
import { Entity } from '../core/entity';
import type { Card } from '../core/card';

/**
 * Death Action - Process death of entities
 */
export class Death extends Action {
  constructor(public entities: Card[]) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const deadEntities: Card[] = [];

    for (const entity of this.entities) {
      const entityAny = entity as any;
      if (entityAny.dead && entityAny.zone !== 'GRAVEYARD') {
        // Move to graveyard
        entityAny.zone = 'GRAVEYARD';

        // Remove from field if it's a minion
        const controller = entityAny.controller;
        if (controller && controller.field) {
          const idx = controller.field.indexOf(entity);
          if (idx !== -1) {
            controller.field.splice(idx, 1);
            controller.graveyard.push(entity);
            console.log(`[Death] ${entity.id} died and moved to graveyard`);
            deadEntities.push(entity);
          }
        }

        // Trigger deathrattle if present
        if (entityAny.deathrattle) {
          console.log(`[Death] Triggering deathrattle for ${entity.id}`);
          // Deathrattle would be triggered here
        }
      }
    }

    return deadEntities;
  }
}
