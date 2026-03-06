import { Action } from './base';
import { Entity } from '../core/entity';
import { CardLoader } from '../cards/loader';

export class Morph extends Action {
  constructor(private cardId: string) {
    super();
  }

  trigger(_source: Entity, target: Entity): unknown[] {
    const targetAny = target as any;
    const controller = targetAny.controller;

    if (!controller) return [];

    // Get the new card definition
    const newCardDef = CardLoader.get(this.cardId);
    if (!newCardDef) {
      console.warn(`Morph: card ${this.cardId} not found`);
      return [];
    }

    // Transform the target
    // In a full implementation, this would replace the entity with a new one
    // For now, we mark it as transformed
    targetAny.transformed = true;
    targetAny.transformedInto = this.cardId;

    // Update stats based on new card
    if (newCardDef.attack !== undefined) {
      targetAny.attack = newCardDef.attack;
    }
    if (newCardDef.health !== undefined) {
      targetAny.maxHealth = newCardDef.health;
      targetAny.damage = 0;
    }

    return [target];
  }
}
