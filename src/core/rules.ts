/**
 * Game Rules Engine
 *
 * Centralized rule validation for both player and AI actions.
 * All game rules should be enforced through this module to ensure consistency.
 */

import type { Entity } from './entity';
import type { Player } from './player';
import type { Card, Minion } from './card';
import type { Game } from './game';

/**
 * Result of a validation check
 */
export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Game Rules Engine
 * Provides centralized validation for all game actions
 */
export class GameRules {
  /**
   * Check if a minion can attack
   */
  static canMinionAttack(minion: any): ValidationResult {
    // Check sleeping (just summoned without Charge)
    if (minion.sleeping) {
      return { valid: false, reason: 'Minion is sleeping (just summoned)' };
    }

    // Check frozen
    if (minion.frozen) {
      return { valid: false, reason: 'Minion is frozen' };
    }

    // Check attack value
    const attack = minion.attack ?? 0;
    if (attack <= 0) {
      return { valid: false, reason: 'Minion has 0 attack' };
    }

    // Check attacks per turn limit
    const attacksThisTurn = minion.attacksThisTurn ?? 0;
    const maxAttacks = minion.windfury ? 2 : 1;
    if (attacksThisTurn >= maxAttacks) {
      return { valid: false, reason: `Minion has already attacked ${attacksThisTurn} time(s) this turn` };
    }

    // Check if minion has been in play long enough (unless Charge)
    const turnsInPlay = minion.turnsInPlay ?? 0;
    const hasCharge = minion.charge ?? false;
    if (!hasCharge && turnsInPlay < 1) {
      return { valid: false, reason: 'Minion cannot attack the turn it is played (no Charge)' };
    }

    return { valid: true };
  }

  /**
   * Check if a hero can attack (has weapon)
   */
  static canHeroAttack(hero: any, player: any): ValidationResult {
    const weapon = player?.weapon;
    if (!weapon) {
      return { valid: false, reason: 'Hero has no weapon equipped' };
    }

    const durability = weapon.durability ?? 0;
    if (durability <= 0) {
      return { valid: false, reason: 'Weapon has no durability' };
    }

    const attack = hero.attack ?? 0;
    if (attack <= 0) {
      return { valid: false, reason: 'Hero has 0 attack' };
    }

    return { valid: true };
  }

  /**
   * Check if an entity can attack a target
   */
  static canAttack(attacker: any, defender: any, game: Game): ValidationResult {
    // Basic null checks
    if (!attacker) {
      return { valid: false, reason: 'No attacker specified' };
    }
    if (!defender) {
      return { valid: false, reason: 'No defender specified' };
    }

    // Can't attack self
    if (attacker === defender) {
      return { valid: false, reason: 'Cannot attack self' };
    }

    // Check if it's the attacker's turn
    const attackerController = attacker.controller as Player;
    const currentPlayer = game.currentPlayer;
    if (attackerController !== currentPlayer) {
      return { valid: false, reason: 'Can only attack on your turn' };
    }

    // Check attacker type
    const attackerType = attacker.type;

    // Minion attacker
    if (attackerType === 4 || attackerType === 'MINION') {
      const canAttackResult = this.canMinionAttack(attacker);
      if (!canAttackResult.valid) {
        return canAttackResult;
      }
    }

    // Hero attacker
    if (attackerType === 3 || attackerType === 'HERO') {
      const canAttackResult = this.canHeroAttack(attacker, attackerController);
      if (!canAttackResult.valid) {
        return canAttackResult;
      }
    }

    // Check defender validity
    const defenderType = defender.type;

    // Can't attack stealthed minions (unless attacker is friendly)
    if ((defenderType === 4 || defenderType === 'MINION') && defender.stealth) {
      const defenderController = defender.controller as Player;
      if (defenderController !== attackerController) {
        return { valid: false, reason: 'Cannot attack stealthed minions' };
      }
    }

    // Can't attack immune targets
    if (defender.immune) {
      return { valid: false, reason: 'Target is immune' };
    }

    // Check taunt - must attack taunt minions first
    const defenderController = defender.controller as Player;
    if (defenderController && defenderController !== attackerController) {
      const enemyField = defenderController.field ?? [];
      const hasTauntMinion = enemyField.some((m: any) => m.taunt && !m.stealth);

      if (hasTauntMinion) {
        // If there's a taunt minion, can only attack taunt minions or the taunt minion itself
        if (defenderType !== 4 && defenderType !== 'MINION' && !defender.taunt) {
          return { valid: false, reason: 'Must attack minions with Taunt first' };
        }
        if ((defenderType === 4 || defenderType === 'MINION') && !defender.taunt) {
          return { valid: false, reason: 'Must attack minions with Taunt first' };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Check if a card can be played
   */
  static canPlayCard(card: any, player: Player, game: Game): ValidationResult {
    // Check mana cost
    const cost = card.cost ?? 0;
    if (player.mana < cost) {
      return { valid: false, reason: `Not enough mana (need ${cost}, have ${player.mana})` };
    }

    // Check if it's the player's turn
    if (game.currentPlayer !== player) {
      return { valid: false, reason: 'Can only play cards on your turn' };
    }

    // Check field space for minions
    const cardType = card.type;
    if (cardType === 4 || cardType === 'MINION') {
      if (player.field.length >= 7) {
        return { valid: false, reason: 'Board is full (max 7 minions)' };
      }
    }

    // Check targeting requirements
    const requirements = card.requirements as Record<number, number> | undefined;
    if (requirements) {
      const needsTarget = requirements[1] !== undefined || // REQ_TARGET_TO_PLAY
                          requirements[22] !== undefined;   // REQ_TARGET_IF_AVAILABLE
      if (needsTarget) {
        // This should be validated when target is provided
        // For now, just note that target is required
      }
    }

    return { valid: true };
  }

  /**
   * Check if a minion should die
   */
  static shouldDie(entity: any): boolean {
    // Check explicit dead flag
    if (entity.dead) return true;

    // Check damage >= maxHealth for characters
    if (entity.maxHealth !== undefined && entity.damage !== undefined) {
      return entity.damage >= entity.maxHealth;
    }

    // Check for destroyed durability on weapons
    if (entity.durability !== undefined && entity.durability <= 0) {
      return true;
    }

    return false;
  }

  /**
   * Get all dead entities from a game
   */
  static getDeadEntities(game: Game): Entity[] {
    const dead: Entity[] = [];

    for (const entity of game.liveEntities) {
      if (this.shouldDie(entity)) {
        dead.push(entity as Entity);
      }
    }

    return dead;
  }
}

export default GameRules;
