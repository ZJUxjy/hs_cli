import { Action } from './base';
import { Entity } from '../core/entity';
import type { Player } from '../core/player';
import { Awaken } from './dormant';
import { GameEvent } from '../events/eventtypes';

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

      // Broadcast TURN_BEGIN event for cards that trigger at start of turn
      if (game.eventManager) {
        game.eventManager.broadcast(GameEvent.TURN_BEGIN, {
          player: this.player,
        });

        // Also broadcast OWN_TURN_BEGIN for the active player
        game.eventManager.broadcast(GameEvent.OWN_TURN_BEGIN, {
          player: this.player,
        });
      }

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

      // Process dormant minions - decrement dormant turns and awaken if needed
      for (const entity of this.player.field) {
        const entityAny = entity as any;
        if (entityAny.dormantTurns && entityAny.dormantTurns > 0) {
          entityAny.dormantTurns--;
          console.log(`[BeginTurn] ${entityAny.id} dormant turns remaining: ${entityAny.dormantTurns}`);
          if (entityAny.dormantTurns === 0) {
            game.queueActions(game, [new Awaken(entity)]);
          }
        }
      }

      // Mana crystal management
      // First, apply overload from previous turn
      this.player.overloadLocked = this.player.overloaded;
      this.player.overloaded = 0;

      // Then add mana crystal (capped at 10)
      this.player.maxMana = Math.min(10, this.player.maxMana + 1);

      // Reset used mana and temp mana
      this.player.usedMana = 0;
      this.player.tempMana = 0;

      // Draw a card at the start of turn
      this.player.draw(1);
    }
    return [this.player];
  }
}
