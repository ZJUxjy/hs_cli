import { Action } from './base';
import { Entity } from '../core/entity';
import { Player } from '../core/player';

/**
 * SpendMana - Spend mana from a player's pool
 * Uses temp mana first, then regular mana (increasing usedMana)
 */
export class SpendMana extends Action {
  constructor(
    public readonly player: Player,
    public readonly amount: number
  ) {
    super();
  }

  override trigger(source: Entity): unknown[] {
    let remaining = this.amount;

    // Use temp mana first
    if (this.player.tempMana > 0) {
      const fromTemp = Math.min(remaining, this.player.tempMana);
      this.player.tempMana -= fromTemp;
      remaining -= fromTemp;
      console.log(`[Mana] ${this.player.name} spent ${fromTemp} temp mana`);
    }

    // Then use regular mana
    if (remaining > 0) {
      this.player.usedMana += remaining;
      console.log(`[Mana] ${this.player.name} spent ${remaining} mana`);
    }

    return [[]];
  }
}
