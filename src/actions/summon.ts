import { Action } from './base';
import { EventListenerAt } from './eventlistener';
import type { Entity } from '../core/entity';
import { CardLoader } from '../cards/loader';
import { Minion } from '../core/card';

export class Summon extends Action {
  constructor(
    private card: string | Entity,
    public index: number | null = null
  ) {
    super(card);
  }

  getArgs(_source: Entity): [string | Entity] {
    return [this.card];
  }

  do(source: Entity, cardRef: string | Entity): void {
    // Broadcast ON
    this.broadcast(source, EventListenerAt.ON, cardRef);

    const controller = (source as any).controller;
    if (!controller) return;

    const field = controller.field as Entity[];
    if (field.length >= 7) return; // Board full

    let card: Entity | undefined;
    if (typeof cardRef === 'string') {
      // Create card from card ID
      const def = CardLoader.get(cardRef);
      if (!def) return;
      card = new Minion(def) as unknown as Entity;
    } else {
      card = cardRef;
    }

    if (!card) return;

    if (this.index !== null && this.index >= 0) {
      field.splice(this.index, 0, card);
    } else {
      field.push(card);
    }

    const game = (source as any).game;
    if (game) {
      (card as any).playCounter = game.tick++;
    }

    // Broadcast AFTER
    this.broadcast(source, EventListenerAt.AFTER, cardRef);

    // Trigger callbacks
    if (this.callback.length > 0) {
      const game = controller.game;
      if (game?.queueActions) {
        game.queueActions(source, this.callback);
      }
    }
  }
}
