import { Action } from './base';
import type { Entity } from '../core/entity';
import { CardLoader } from '../cards/loader';
import { Minion } from '../core/card';

export class Summon extends Action {
  constructor(
    public source: Entity,
    public card: string | Entity,
    public index: number | null = null
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const controller = (source as any).controller;
    if (!controller) return [];

    const field = controller.field as Entity[];
    if (field.length >= 7) return []; // Board full

    let card: Entity;
    if (typeof this.card === 'string') {
      // Create card from card ID
      const def = CardLoader.get(this.card);
      if (!def) return [];
      card = new Minion(def) as unknown as Entity;
    } else {
      card = this.card;
    }

    if (this.index !== null && this.index >= 0) {
      field.splice(this.index, 0, card);
    } else {
      field.push(card);
    }

    (card as any).playCounter = (source as any).game.tick++;
    return [card];
  }
}
