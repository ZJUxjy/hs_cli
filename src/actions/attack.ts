import { Action } from './base';
import type { Entity } from '../core/entity';
import type { Game } from '../core/game';
import { GameRules } from '../core/rules';

export class Attack extends Action {
  constructor(
    public attacker: Entity,
    public defender: Entity
  ) {
    super();
  }

  trigger(source: Entity): unknown[] {
    const attacker = this.attacker as any;
    const defender = this.defender as any;
    const game = (source as any).game;

    // Validate the attack using centralized rules
    const validation = GameRules.canAttack(attacker, defender, game);
    if (!validation.valid) {
      console.warn(`[Attack] Invalid attack: ${validation.reason}`);
      throw new Error(validation.reason || 'Invalid attack');
    }

    console.log(`[Attack] ${attacker.name || attacker.id} attacks ${defender.name || defender.id}`);

    // Get attack values
    const attackerAttack = attacker.attack || 0;
    const defenderAttack = defender.attack || 0;

    console.log(`[Attack] Attacker attack: ${attackerAttack}, Defender attack: ${defenderAttack}`);

    // Track that attacker has attacked this turn
    attacker.attacksThisTurn = (attacker.attacksThisTurn || 0) + 1;

    // Reduce weapon durability if hero is attacking
    const attackerType = attacker.type;
    if (attackerType === 3 || attackerType === 'HERO') {
      const controller = attacker.controller;
      if (controller?.weapon) {
        controller.weapon.durability = (controller.weapon.durability || 1) - 1;
        console.log(`[Attack] Weapon durability reduced to ${controller.weapon.durability}`);
        if (controller.weapon.durability <= 0) {
          // Weapon destroyed - will be handled by death processing
          controller.weapon.dead = true;
        }
      }
    }

    // Deal damage to defender
    if (attackerAttack > 0) {
      // Check for divine shield
      if (defender.divineShield) {
        defender.divineShield = false;
        console.log(`[Attack] Divine Shield absorbs damage`);
      } else {
        // Check for armor (heroes)
        let damageToDeal = attackerAttack;
        if (defender.armor && defender.armor > 0) {
          const armorAbsorbed = Math.min(defender.armor, damageToDeal);
          defender.armor -= armorAbsorbed;
          damageToDeal -= armorAbsorbed;
          console.log(`[Attack] Armor absorbs ${armorAbsorbed} damage, ${damageToDeal} remaining`);
        }
        if (damageToDeal > 0) {
          const currentDamage = defender.damage || 0;
          defender.damage = currentDamage + damageToDeal;
          console.log(`[Attack] Defender takes ${damageToDeal} damage, total damage: ${defender.damage}`);
        }
      }
    }

    // Deal damage to attacker (counter attack) - only if defender has attack
    if (defenderAttack > 0) {
      // Check for divine shield on attacker
      if (attacker.divineShield) {
        attacker.divineShield = false;
        console.log(`[Attack] Attacker's Divine Shield absorbs counter damage`);
      } else {
        const currentDamage = attacker.damage || 0;
        attacker.damage = currentDamage + defenderAttack;
        console.log(`[Attack] Attacker takes ${defenderAttack} counter damage, total damage: ${attacker.damage}`);
      }
    }

    // Freeze if attacker is frosty (simplified - real game has freeze keyword)
    // This would be handled by keywords

    // Poisonous - destroy if damaged (simplified)
    if (attacker.poisonous && attackerAttack > 0 && !defender.divineShield) {
      defender.dead = true;
      console.log(`[Attack] Poisonous destroys defender`);
    }
    if (defender.poisonous && defenderAttack > 0 && !attacker.divineShield) {
      attacker.dead = true;
      console.log(`[Attack] Poisonous destroys attacker`);
    }

    // Lifesteal - heal attacker's hero
    if (attacker.lifesteal && attackerAttack > 0) {
      const hero = attacker.controller?.hero;
      if (hero && hero.damage > 0) {
        const healAmount = Math.min(attackerAttack, hero.damage);
        hero.damage -= healAmount;
        console.log(`[Attack] Lifesteal heals hero for ${healAmount}`);
      }
    }

    return [];
  }
}
