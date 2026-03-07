import { Action } from './base';
import { Entity } from '../core/entity';
import type { Player } from '../core/player';

/**
 * EndTurn Action - Triggered when a player ends their turn
 */
export class EndTurn extends Action {
  constructor(public player: Player) {
    super();
  }

  trigger(source: Entity): unknown[] {
    console.log(`[Game] ${this.player.name} ends turn`);

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
