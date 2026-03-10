import { Action } from './base';
import { Entity } from '../core/entity';
import type { Player } from '../core/player';
import { GameEvent } from '../events/eventtypes';

/**
 * EndTurn Action - Triggered when a player ends their turn
 */
export class EndTurn extends Action {
  constructor(public player: Player) {
    super();
  }

  trigger(source: Entity): unknown[] {
    console.log(`[Game] ${this.player.name} ends turn`);

    // Broadcast TURN_END event for cards that trigger at end of turn
    const game = (this.player as any).game;
    if (game?.eventManager) {
      game.eventManager.broadcast(GameEvent.TURN_END, {
        player: this.player,
      });

      // Also broadcast OWN_TURN_END for the ending player
      game.eventManager.broadcast(GameEvent.OWN_TURN_END, {
        player: this.player,
      });
    }

    // Clear temporary mana
    this.player.tempMana = 0;

    // Reset combo
    this.player.combo = false;

    // Track elementals
    this.player.elementalPlayedLastTurn = this.player.elementalPlayedThisTurn;
    this.player.elementalPlayedThisTurn = 0;

    return [this.player];
  }
}
