import { Action } from './base';
import { Entity } from '../core/entity';
import type { Player } from '../core/player';

/**
 * Fatigue Action - Deal fatigue damage when drawing from empty deck
 */
export class Fatigue extends Action {
  constructor(public player: Player) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const fatigueDamage = ++(this.player as any).fatigueCounter;
    console.log(`[Fatigue] ${this.player.name} takes ${fatigueDamage} fatigue damage`);

    const hero = this.player.hero;
    if (hero) {
      const heroAny = hero as any;
      heroAny.damage = (heroAny.damage || 0) + fatigueDamage;
    }

    return [fatigueDamage];
  }
}
