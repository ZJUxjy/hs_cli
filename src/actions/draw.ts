import { Action } from './base';
import type { Entity } from '../core/entity';

export class Draw extends Action {
  constructor(
    public source: Entity,
    public count: number = 1,
    public card: Entity | null = null
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const controller = (source as any).controller;
    if (!controller) return [];

    const drawn: unknown[] = [];
    for (let i = 0; i < this.count; i++) {
      const card = controller.deck.draw();
      if (card) {
        controller.hand.push(card);
        drawn.push(card);
      }
    }
    return drawn;
  }
}
