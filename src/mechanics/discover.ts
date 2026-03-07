// Discover mechanism for Hearthstone
// Based on fireplace's discover implementation

import { Action } from '../actions/base';
import type { Entity } from '../core/entity';
import type { Player } from '../core/player';
import type { Game } from '../core/game';
import type { Card } from '../core/card';
import { CardLoader } from '../cards/loader';
import { CardType, CardClass } from '../enums';

/**
 * Discover options
 */
export interface DiscoverOptions {
  cardType?: CardType;
  cardClass?: CardClass;
  cost?: number;
  attack?: number;
  health?: number;
  race?: number;
  excludeIds?: string[];
  fromPool?: string[];
  random?: boolean;
}

/**
 * Discover action - presents 3 cards to choose from
 */
export class Discover extends Action {
  constructor(
    private options: DiscoverOptions = {},
    private count: number = 3
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const controller = (source as any).controller as Player;
    const game = (source as any).game as Game;

    const candidates = this.getCandidates(controller, game) as any[];
    const choices = this.selectChoices(candidates, this.count);

    console.log(`[Discover] Presenting ${choices.length} cards to choose from`);

    // Return the choices - in a real implementation,
    // this would involve player input or AI decision
    return [choices];
  }

  /**
   * Get candidate cards for discover
   */
  private getCandidates(player: Player, game: Game): any[] {
    // Use custom pool if provided
    if (this.options.fromPool) {
      return this.options.fromPool
        .map(id => CardLoader.get(id))
        .filter((def): def is NonNullable<typeof def> => def !== undefined)
        .map(def => ({ ...def, id: def.id }) as unknown as Card);
    }

    // Get all collectible cards
    const allCards = CardLoader.getCollectible?.() || [];

    // Filter by criteria
    return allCards.filter((card: any) => {
      const cardAny = card as any;

      // Exclude specific IDs
      if (this.options.excludeIds?.includes(cardAny.id)) return false;

      // Filter by card type
      if (this.options.cardType && cardAny.type !== this.options.cardType) return false;

      // Filter by class (neutral or player's class)
      if (this.options.cardClass) {
        if (cardAny.cardClass !== CardClass.NEUTRAL &&
            cardAny.cardClass !== this.options.cardClass) return false;
      } else {
        // Default: only neutral or same class as player
        if (cardAny.cardClass !== CardClass.NEUTRAL &&
            cardAny.cardClass !== (player as any).cardClass) return false;
      }

      // Filter by cost
      if (this.options.cost !== undefined && cardAny.cost !== this.options.cost) return false;

      // Filter by attack
      if (this.options.attack !== undefined && cardAny.attack !== this.options.attack) return false;

      // Filter by health
      if (this.options.health !== undefined && cardAny.health !== this.options.health) return false;

      // Filter by race
      if (this.options.race !== undefined && cardAny.race !== this.options.race) return false;

      return true;
    });
  }

  /**
   * Randomly select N choices from candidates
   */
  private selectChoices(candidates: Card[], count: number): Card[] {
    if (candidates.length <= count) return candidates;

    const shuffled = [...candidates];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }
}

/**
 * Helper to create discover actions
 */
export function DiscoverSpell(options?: DiscoverOptions): Discover {
  return new Discover({ ...options, cardType: CardType.SPELL });
}

export function DiscoverMinion(options?: DiscoverOptions): Discover {
  return new Discover({ ...options, cardType: CardType.MINION });
}

export function DiscoverWeapon(options?: DiscoverOptions): Discover {
  return new Discover({ ...options, cardType: CardType.WEAPON });
}

export function DiscoverSameCost(cost: number, options?: DiscoverOptions): Discover {
  return new Discover({ ...options, cost });
}
