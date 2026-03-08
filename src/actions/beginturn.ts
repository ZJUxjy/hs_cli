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
    // source is the Game instance when called from game.queueActions()
    const game = source as any;
    if (game) {
      console.log(`[Game] Turn ${game.turn} begins for ${this.player.name}`);

      // Reset turn-based counters
      this.player.cardsDrawnThisTurn = 0;
      this.player.cardsPlayedThisTurn = 0;
      this.player.minionsPlayedThisTurn = 0;
      (this.player as any).minionsKilledThisTurn = [];

      // Wake up minions - they can attack this turn
      for (const minion of this.player.field) {
        const minionAny = minion as any;
        if (minionAny.sleeping) {
          minionAny.sleeping = false;
          console.log(`[BeginTurn] ${minionAny.name} wakes up`);
        }
        // Increment turns in play counter
        minionAny.turnsInPlay = (minionAny.turnsInPlay ?? 0) + 1;
        // Reset attacks this turn counter
        minionAny.attacksThisTurn = 0;
      }

      // Mana crystal management
      // First, apply overload from previous turn
      this.player.overloadLocked = this.player.overloaded;
      this.player.overloaded = 0;

      // Then add mana crystal
      if (this.player.maxMana < 10) {
        this.player.maxMana++;
      }

      // Finally, set available mana (after overload is applied)
      this.player.mana = this.player.maxMana - this.player.overloadLocked;
      this.player.usedMana = 0;

      // Draw a card at the start of turn
      this.player.draw(1);
    }
    return [this.player];
  }
}
