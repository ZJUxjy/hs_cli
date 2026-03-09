import { Action } from './base';
import { EventListenerAt } from './eventlistener';
import type { Entity } from '../core/entity';

export class Draw extends Action {
  constructor(
    private count: number = 1,
    public card?: Entity | null
  ) {
    super(count);
  }

  getArgs(_source: Entity): [number] {
    return [this.count];
  }

  do(source: Entity, count: number): void {
    // Broadcast ON
    this.broadcast(source, EventListenerAt.ON, count);

    const player = source as any;
    const controller = player.controller || player;

    if (!controller) return;

    const drawn: unknown[] = [];
    for (let i = 0; i < count; i++) {
      // If a specific card is provided, use it
      if (this.card && i === 0) {
        controller.hand?.push(this.card);
        drawn.push(this.card);
      } else {
        // Draw from deck
        const card = controller.deck?.draw?.();
        if (card) {
          controller.hand?.push(card);
          drawn.push(card);
        }
      }
    }

    // Broadcast AFTER
    this.broadcast(source, EventListenerAt.AFTER, count);

    // Trigger callbacks
    if (this.callback.length > 0) {
      const game = controller.game;
      if (game?.queueActions) {
        game.queueActions(source, this.callback);
      }
    }
  }
}
