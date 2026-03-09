import { Action } from './base';
import { EventListenerAt } from './eventlistener';
import type { Entity } from '../core/entity';
import { Player } from '../core/player';
import { Game } from '../core/game';
import { Card, createCard } from '../core/card';
import { CardLoader } from '../cards/loader';
import { Zone } from '../enums';

export interface DiscoverOptions {
  filter?: (card: Card) => boolean;
  count?: number;
}

/**
 * Discover action - presents player with a choice of cards from a pool.
 * Used for the discover mechanic introduced in League of Explorers.
 *
 * Players can discover cards from a pool with optional filtering.
 * Matches Python fireplace's Discover action.
 */
export class Discover extends Action {
  constructor(
    public readonly player: Player,
    public readonly cardPool: string[],
    public readonly options: DiscoverOptions = {}
  ) {
    super(player, cardPool, options);
  }

  getArgs(_source: Entity): [Player, string[], DiscoverOptions] {
    return [this.player, this.cardPool, this.options];
  }

  do(source: Entity, player: Player, cardPool: string[], options: DiscoverOptions): void {
    // Broadcast ON
    this.broadcast(source, EventListenerAt.ON, player, cardPool, options);

    const game = player.game as Game;
    const count = options.count ?? 3;

    // Load cards from pool and apply filter
    const availableCards = this._loadCardsFromPool(cardPool, options.filter);

    // Random selection
    const choices = game.random.sample(availableCards, Math.min(count, availableCards.length));

    // Set player choice
    player.choice = {
      cards: choices,
      minCount: 1,
      maxCount: 1,
      source: source
    };

    console.log(`[Discover] ${player.name} choosing from ${choices.length} cards`);

    // Broadcast AFTER
    this.broadcast(source, EventListenerAt.AFTER, player, cardPool, options);

    // Trigger callbacks
    if (this.callback.length > 0) {
      const game = player.game;
      if (game?.queueActions) {
        game.queueActions(source, this.callback);
      }
    }
  }

  /**
   * Load cards from the card pool, applying optional filter.
   * Can be overridden in tests for mocking.
   */
  protected _loadCardsFromPool(cardPool: string[], filter?: (card: Card) => boolean): Card[] {
    const availableCards: Card[] = [];

    for (const cardId of cardPool) {
      const cardDef = CardLoader.get(cardId);
      if (cardDef) {
        const card = createCard(cardDef);
        if (!filter || filter(card)) {
          availableCards.push(card);
        }
      }
    }

    return availableCards;
  }

  /**
   * Resolve the discover choice by adding the chosen card to hand.
   * Called by the game when player makes their choice.
   */
  resolve(chosenCard: Card): void {
    // Add chosen card to hand if not full
    if (this.player.hand.length < 10) {
      this.player.hand.push(chosenCard as any);
      (chosenCard as any).zone = Zone.HAND;
      (chosenCard as any).controller = this.player;
      console.log(`[Discover] ${this.player.name} discovered ${chosenCard.id}`);
    } else {
      console.log(`[Discover] ${this.player.name} hand is full, ${chosenCard.id} burned`);
    }

    // Clear choice
    this.player.choice = undefined;
  }
}
