import { Action } from './base';
import { Entity } from '../core/entity';
import { Player } from '../core/player';
import { Game } from '../core/game';
import { Zone } from '../enums';

export interface MulliganChoiceCallback {
  (): void;
}

export interface PlayerChoice {
  cards: Entity[];
  minCount: number;
  maxCount: number;
  source?: Entity;
}

/**
 * MulliganChoice action - presents the player with a choice to replace cards.
 * Used during the mulligan phase at the start of the game.
 */
export class MulliganChoice extends Action {
  /** Callback to execute when mulligan is complete */
  private _mulliganCallback?: MulliganChoiceCallback;

  constructor(
    public readonly player: Player,
    mulliganCallback?: MulliganChoiceCallback
  ) {
    super();
    this._mulliganCallback = mulliganCallback;
  }

  override trigger(source: Entity): void[][] {
    const game = (source as any).game as Game;

    // Set player's choice to their current hand
    this.player.choice = {
      cards: [...this.player.hand] as unknown as Entity[],
      minCount: 0,
      maxCount: this.player.hand.length,
      source: game
    };

    console.log(`[Mulligan] ${this.player.name} is choosing cards to keep`);

    // If no callback, immediately resolve with no replacements (for AI/testing)
    if (!this._mulliganCallback) {
      this.resolve([]);
    }

    return [[]];
  }

  /**
   * Resolve the mulligan by replacing selected cards.
   * @param cardsToReplace - Array of cards the player wants to replace
   */
  resolve(cardsToReplace: Entity[]): void {
    // Put chosen cards back in deck
    for (const card of cardsToReplace) {
      const idx = this.player.hand.indexOf(card as any);
      if (idx !== -1) {
        const [removed] = this.player.hand.splice(idx, 1);
        (removed as any).zone = Zone.DECK;
        this.player.deck.push(removed);
      }
    }

    // Shuffle deck before drawing replacement cards
    // This ensures the returned cards are mixed in with the rest of the deck
    this.player.shuffleDeck();

    // Draw replacement cards
    const replacementCount = cardsToReplace.length;
    this.player.draw(replacementCount);

    // Clear choice
    this.player.choice = undefined;

    console.log(`[Mulligan] ${this.player.name} replaced ${replacementCount} cards`);

    // Call callback if provided
    if (this._mulliganCallback) {
      this._mulliganCallback();
    }
  }
}
