import { Action } from './base';
import { Entity } from '../core/entity';

/**
 * Dormant Action - Set a minion to dormant state for N turns
 * Used by Ashes of Outlands dormant minions
 */
export class Dormant extends Action {
  constructor(
    public readonly target: Entity,
    public readonly turns: number
  ) {
    super();
  }

  override trigger(source: Entity): unknown[] {
    const target = this.target as any;
    target.dormant = true;
    target.dormantTurns = this.turns;
    target.canAttack = false;

    console.log(`[Dormant] ${target.id} is dormant for ${this.turns} turns`);

    return [[]];
  }
}

/**
 * Awaken Action - Remove dormant state from a minion
 * Triggered when dormant_turns reaches 0
 */
export class Awaken extends Action {
  constructor(public readonly target: Entity) {
    super();
  }

  override trigger(source: Entity): unknown[] {
    const target = this.target as any;
    target.dormant = false;
    target.dormantTurns = 0;
    target.canAttack = true;

    console.log(`[Awaken] ${target.id} has awakened!`);

    // Trigger awaken effects would be handled by card scripts

    return [[]];
  }
}
