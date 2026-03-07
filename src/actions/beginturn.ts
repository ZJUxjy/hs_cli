import { Action } from './base';
import { Entity } from '../core/entity';
import type { Player } from '../core/player';

/**
 * BeginTurn Action - Triggered when a player begins their turn
 */
export class BeginTurn extends Action {
  constructor(public player: Player) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const game = (source as any).game;
    if (game) {
      game.turn++;
      console.log(`[Game] Turn ${game.turn} begins for ${this.player.name}`);

      // Reset turn-based counters
      this.player.cardsDrawnThisTurn = 0;
      this.player.cardsPlayedThisTurn = 0;
      this.player.minionsPlayedThisTurn = 0;
      (this.player as any).minionsKilledThisTurn = [];

      // Mana crystal management
      if (this.player.maxMana < 10) {
        this.player.maxMana++;
      }
      this.player.usedMana = 0;
      this.player.overloadLocked = this.player.overloaded;
      this.player.overloaded = 0;

      // Draw a card at the start of turn
      this.player.draw(1);
    }
    return [this.player];
  }
}
