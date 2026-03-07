// Twinspell mechanism for Hearthstone
// When you cast a Twinspell, add a copy to your hand (without Twinspell)

import { Spell } from '../core/card';
import { CardType, Zone } from '../enums';
import { CardLoader } from '../cards/loader';
import type { Entity } from '../core/entity';
import type { Player } from '../core/player';

/**
 * Twinspell card class
 * Adds a copy of itself to hand when played (once)
 */
export class Twinspell extends Spell {
  public twinspellTriggered: boolean = false;

  /**
   * Override play to add twinspell copy
   */
  onPlay(): void {
    super.onPlay();

    if (!this.twinspellTriggered) {
      this.addTwinspellCopy();
      this.twinspellTriggered = true;
    }
  }

  /**
   * Add a copy of this spell to hand (without twinspell keyword)
   */
  addTwinspellCopy(): void {
    const controller = this.getController() as any;
    if (!controller) return;

    // Check hand size limit (10 cards)
    if (controller.hand?.length >= 10) {
      console.log(`[Twinspell] Hand full, cannot add copy of ${this.id}`);
      return;
    }

    // Create a copy of this card
    const cardDef = CardLoader.get(this.id);
    if (!cardDef) return;

    const copy = new Spell(cardDef);

    // Mark as twinspell copy (so it won't generate another copy)
    (copy as any).twinspellTriggered = true;
    (copy as any).isTwinspellCopy = true;

    // Set controller and zone
    (copy as any).controller = controller;
    (copy as any).zone = Zone.HAND;

    // Add to hand
    controller.hand?.push(copy as any);

    console.log(`[Twinspell] Added copy of ${this.id} to hand`);
  }
}

/**
 * Helper function to check if a card is a twinspell copy
 */
export function isTwinspellCopy(card: Spell): boolean {
  return (card as any).isTwinspellCopy === true;
}

/**
 * Helper function to create a twinspell card
 */
export function createTwinspell(cardId: string, cardClass: number, cost: number): Twinspell {
  const def = CardLoader.get(cardId);

  if (def) {
    return new Twinspell(def);
  }

  // Fallback: create basic twinspell
  return new Twinspell({
    id: cardId,
    type: CardType.SPELL,
    cardClass: cardClass,
    cost: cost,
  });
}
