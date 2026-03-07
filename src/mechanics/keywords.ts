// Special keywords for Hearthstone card mechanics
// Recruit, Tradeable, Infuse, Manathirst, Combo, Outcast, Corrupt

import { Action } from '../actions/base';
import type { Entity } from '../core/entity';
import type { Player } from '../core/player';
import type { Card, Minion } from '../core/card';
import { CardType, Zone } from '../enums';

// ============== Recruit ==============

/**
 * Recruit - Summon a minion from your deck
 */
export class Recruit extends Action {
  constructor(
    private costRestriction?: { min?: number; max?: number }
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const controller = (source as any).controller as Player;
    if (!controller) return [];

    // Find valid minions in deck
    const validMinions = controller.deck.toArray().filter(card => {
      if (card.type !== CardType.MINION) return false;

      const cost = (card as any).cost || 0;
      if (this.costRestriction?.min !== undefined && cost < this.costRestriction.min) return false;
      if (this.costRestriction?.max !== undefined && cost > this.costRestriction.max) return false;

      return true;
    });

    if (validMinions.length === 0) return [];

    // Randomly select one
    const randomIndex = Math.floor(Math.random() * validMinions.length);
    const selected = validMinions[randomIndex];

    // Remove from deck
    const deckIndex = controller.deck.indexOf(selected as any);
    if (deckIndex !== -1) {
      controller.deck.splice(deckIndex, 1);
    }

    // Summon
    const { Summon } = require('../actions');
    const summonAction = new Summon(source, selected as any);
    return summonAction.trigger(source);
  }
}

// ============== Tradeable ==============

/**
 * Tradeable - Pay 1 mana to draw a new card and shuffle this back
 */
export class Trade extends Action {
  trigger(source: Entity): unknown[] {
    const controller = (source as any).controller as Player;
    if (!controller) return [];

    // Check mana
    if ((controller as any).mana < 1) return [];

    // Spend mana
    (controller as any).mana -= 1;

    // Return card to deck
    const card = source as Card;
    const handIndex = controller.hand.indexOf(card as any);
    if (handIndex !== -1) {
      controller.hand.splice(handIndex, 1);
    }

    (card as any).zone = Zone.DECK;
    controller.deck.push(card as any);

    // Shuffle deck
    controller.shuffleDeck();

    // Draw a card
    const { Draw } = require('../actions');
    const drawAction = new Draw(source, 1);
    return drawAction.trigger(source);
  }
}

// ============== Infuse ==============

/**
 * Infuse counter - tracks friendly minion deaths while card is in hand
 */
export class InfuseCounter {
  private count: number = 0;

  constructor(
    private card: Card,
    private required: number
  ) {}

  /**
   * Increment infuse counter
   */
  increment(): void {
    const cardAny = this.card as any;
    if (cardAny.zone !== Zone.HAND) return;

    this.count++;
    console.log(`[Infuse] ${this.card.id}: ${this.count}/${this.required}`);

    if (this.count >= this.required) {
      this.activate();
    }
  }

  /**
   * Check if infused
   */
  isInfused(): boolean {
    return this.count >= this.required;
  }

  /**
   * Activate infused version
   */
  private activate(): void {
    console.log(`[Infuse] ${this.card.id} is now infused!`);
    (this.card as any).infused = true;
  }
}

// ============== Manathirst ==============

/**
 * Manathirst - Effect is stronger if you have X mana crystals
 */
export function checkManathirst(player: Player, requiredMana: number): boolean {
  return (player as any).maxMana >= requiredMana;
}

// ============== Combo ==============

/**
 * Combo - Effect is stronger if you've played another card this turn
 */
export function checkCombo(player: Player): boolean {
  return (player as any).cardsPlayedThisTurn > 0;
}

/**
 * Get combo multiplier (for effects that scale with combo)
 */
export function getComboMultiplier(player: Player): number {
  const cardsPlayed = (player as any).cardsPlayedThisTurn || 0;
  return Math.max(1, cardsPlayed);
}

// ============== Outcast ==============

/**
 * Outcast - Effect triggers if card is played from left/rightmost position in hand
 */
export function checkOutcast(card: Card, player: Player): boolean {
  const hand = player.hand;
  const index = hand.indexOf(card as any);

  // Leftmost (0) or rightmost
  return index === 0 || index === hand.length - 1;
}

// ============== Corrupt ==============

/**
 * Corrupt - Upgrade when a higher cost card is played while this is in hand
 */
export class CorruptTracker {
  private corrupted: boolean = false;

  constructor(
    private card: Card,
    private originalId: string,
    private corruptedId: string
  ) {}

  /**
   * Check if a played card should corrupt this card
   */
  checkCorruption(playedCard: Card): void {
    if (this.corrupted) return;

    const cardAny = this.card as any;
    if (cardAny.zone !== Zone.HAND) return;

    const playedCost = (playedCard as any).cost || 0;
    const thisCost = cardAny.cost || 0;

    if (playedCost > thisCost) {
      this.corrupt();
    }
  }

  /**
   * Apply corruption upgrade
   */
  private corrupt(): void {
    this.corrupted = true;
    console.log(`[Corrupt] ${this.originalId} has been corrupted into ${this.corruptedId}!`);

    // Replace card data with corrupted version
    const { CardLoader } = require('../cards/loader');
    const corruptedDef = CardLoader.get(this.corruptedId);
    if (corruptedDef) {
      (this.card as any).data = corruptedDef;
      (this.card as any).id = this.corruptedId;
    }
  }

  isCorrupted(): boolean {
    return this.corrupted;
  }
}

// ============== Helper Exports ==============

export const Keywords = {
  Recruit,
  Trade,
  InfuseCounter,
  CorruptTracker,
  checkManathirst,
  checkCombo,
  getComboMultiplier,
  checkOutcast,
};
