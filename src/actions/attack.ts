import { Action } from './base';
import type { Entity } from '../core/entity';

export class Attack extends Action {
  constructor(
    public attacker: Entity,
    public defender: Entity
  ) {
    super();
  }

  trigger(_source: Entity): unknown[] {
    const attacker = this.attacker;
    const defender = this.defender;

    // Get attack and defense values
    const attackerAttack = (attacker as any).attack || 0;
    const defenderDefense = (defender as any).attack || 0;

    // Deal damage to defender
    if (attackerAttack > 0) {
      const currentDamage = (defender as any).damage || 0;
      (defender as any).damage = currentDamage + attackerAttack;
    }

    // Deal damage to attacker (counter attack)
    if (defenderDefense > 0) {
      const currentDamage = (attacker as any).damage || 0;
      (attacker as any).damage = currentDamage + defenderDefense;
    }

    return [];
  }
}
