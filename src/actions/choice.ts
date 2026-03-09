import { Action } from './base';
import { EventListenerAt } from './eventlistener';
import type { Entity } from '../core/entity';
import { Player } from '../core/player';
import { Game } from '../core/game';
import { Card } from '../core/card';

/**
 * Choice action - presents player with a choice of card options.
 * Used for Druid's Choose One mechanic and similar card effects.
 *
 * Players can choose between predefined card options.
 * Matches Python fireplace's Choice action.
 */
export class Choice extends Action {
  constructor(
    public readonly player: Player,
    public readonly options: Card[],
    public readonly minCount: number = 1,
    public readonly maxCount: number = 1
  ) {
    super(player, options, minCount, maxCount);
  }

  getArgs(_source: Entity): [Player, Card[], number, number] {
    return [this.player, this.options, this.minCount, this.maxCount];
  }

  do(source: Entity, player: Player, options: Card[], minCount: number, maxCount: number): void {
    // Broadcast ON
    this.broadcast(source, EventListenerAt.ON, player, options, minCount, maxCount);

    const game = player.game as Game;

    // Set player choice
    player.choice = {
      cards: options,
      minCount: minCount,
      maxCount: maxCount,
      source: source
    };

    console.log(`[Choice] ${player.name} choosing from ${options.length} options`);

    // Broadcast AFTER
    this.broadcast(source, EventListenerAt.AFTER, player, options, minCount, maxCount);

    // Trigger callbacks
    if (this.callback.length > 0) {
      if (game?.queueActions) {
        game.queueActions(source, this.callback);
      }
    }
  }

  /**
   * Resolve the choice with the selected card(s).
   * Called by the game when player makes their choice.
   * @param chosen - The chosen card or array of chosen cards
   */
  resolve(chosen: Card | Card[]): void {
    const cards = Array.isArray(chosen) ? chosen : [chosen];

    // Clear choice
    this.player.choice = undefined;

    console.log(`[Choice] ${this.player.name} chose ${cards.map(c => c.id).join(', ')}`);

    // Return chosen cards for processing by caller
    // The actual effect would be handled by the card script
  }
}
