// Targeting system for card play requirements
// Based on fireplace's targeting system

import { CardType, Race, PlayReq, Zone } from '../enums';
import { Entity } from '../core/entity';
import { Card, Minion } from '../core/card';
import { Player } from '../core/player';
import { Game } from '../core/game';

/**
 * Target validation result
 */
export interface TargetValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * TargetValidator - validates if a target meets play requirements
 */
export class TargetValidator {
  /**
   * Check if a card can be played (has valid targets if required)
   */
  static canPlay(card: Card, player: Player, game: Game): boolean {
    const requirements = (card as any).requirements as Record<number, number> | undefined;

    if (!requirements) {
      return true;
    }

    // Check if card requires a target
    const needsTarget = this.requiresTarget(requirements);

    if (!needsTarget) {
      return true;
    }

    // Check if there are any valid targets
    const validTargets = this.getValidTargets(card, player, game);
    return validTargets.length > 0;
  }

  /**
   * Check if requirements include a target requirement
   */
  static requiresTarget(requirements: Record<number, number>): boolean {
    const targetingReqs = [
      PlayReq.REQ_TARGET_TO_PLAY,
      PlayReq.REQ_TARGET_IF_AVAILABLE,
      PlayReq.REQ_TARGET_FOR_COMBO,
    ];

    return Object.keys(requirements).some(req => {
      const reqNum = parseInt(req);
      return targetingReqs.includes(reqNum);
    });
  }

  /**
   * Get all valid targets for a card
   */
  static getValidTargets(card: Card, player: Player, game: Game): Entity[] {
    const requirements = (card as any).requirements as Record<number, number> | undefined;
    const targets: Entity[] = [];

    // Collect all potential targets (filter out null/undefined)
    const characters = game.characters.toArray().filter(c => c != null);

    for (const target of characters) {
      if (this.isValidTarget(card, target as unknown as Entity, requirements).valid) {
        targets.push(target as unknown as Entity);
      }
    }

    return targets;
  }

  /**
   * Validate if a specific target is valid for a card
   */
  static isValidTarget(
    source: Card,
    target: Entity,
    requirements?: Record<number, number>
  ): TargetValidationResult {
    const reqs = requirements || (source as any).requirements;

    // Cannot target self
    if (target === source) {
      return { valid: false, reason: 'Cannot target self' };
    }

    const targetAny = target as any;
    const sourceController = (source as any).controller as Player;

    // Check basic target rules
    if (targetAny.type === CardType.MINION) {
      // Dormant minions cannot be targeted
      if (targetAny.dormant) {
        return { valid: false, reason: 'Target is dormant' };
      }

      // Dead/destroyed minions cannot be targeted
      if (targetAny.destroyed || targetAny.dead) {
        return { valid: false, reason: 'Target is destroyed' };
      }

      // Stealthed minions cannot be targeted by opponent
      if (targetAny.stealth && targetAny.controller !== sourceController) {
        return { valid: false, reason: 'Target has stealth' };
      }

      // Immune minions cannot be targeted by opponent
      if (targetAny.immune && targetAny.controller !== sourceController) {
        return { valid: false, reason: 'Target is immune' };
      }
    }

    // If no requirements, basic targeting is valid
    if (!reqs) {
      return { valid: true };
    }

    // Check each requirement
    for (const [reqStr, param] of Object.entries(reqs)) {
      const reqNum = parseInt(reqStr);
      const result = this.checkRequirement(reqNum, param as number, source, target);
      if (!result.valid) {
        return result;
      }
    }

    return { valid: true };
  }

  /**
   * Check a specific play requirement
   */
  static checkRequirement(
    req: number,
    param: number,
    source: Card,
    target: Entity
  ): TargetValidationResult {
    const targetAny = target as any;
    const sourceController = (source as any).controller as Player;
    const targetController = targetAny.controller as Player;

    switch (req) {
      case PlayReq.REQ_MINION_TARGET:
        if (targetAny.type !== CardType.MINION) {
          return { valid: false, reason: 'Target must be a minion' };
        }
        break;

      case PlayReq.REQ_FRIENDLY_TARGET:
        if (targetController !== sourceController) {
          return { valid: false, reason: 'Target must be friendly' };
        }
        break;

      case PlayReq.REQ_ENEMY_TARGET:
        if (targetController === sourceController) {
          return { valid: false, reason: 'Target must be enemy' };
        }
        break;

      case PlayReq.REQ_DAMAGED_TARGET:
        if (!targetAny.damage || targetAny.damage === 0) {
          return { valid: false, reason: 'Target must be damaged' };
        }
        break;

      case PlayReq.REQ_UNDAMAGED_TARGET:
        if (targetAny.damage && targetAny.damage > 0) {
          return { valid: false, reason: 'Target must be undamaged' };
        }
        break;

      case PlayReq.REQ_HERO_TARGET:
        if (targetAny.type !== CardType.HERO) {
          return { valid: false, reason: 'Target must be a hero' };
        }
        break;

      case PlayReq.REQ_TARGET_TAUNT:
        if (!targetAny.taunt) {
          return { valid: false, reason: 'Target must have taunt' };
        }
        break;

      case PlayReq.REQ_TARGET_WITH_DEATHRATTLE:
        if (!targetAny.scripts?.deathrattle && !targetAny.deathrattle) {
          return { valid: false, reason: 'Target must have deathrattle' };
        }
        break;

      case PlayReq.REQ_TARGET_RACE:
      case PlayReq.REQ_TARGET_IS_RACE:
        if (targetAny.race !== param) {
          return { valid: false, reason: `Target must be race ${param}` };
        }
        break;

      case PlayReq.REQ_TARGET_MAX_ATTACK:
        if ((targetAny.attack || 0) > param) {
          return { valid: false, reason: `Target attack must be <= ${param}` };
        }
        break;

      case PlayReq.REQ_TARGET_MIN_ATTACK:
        if ((targetAny.attack || 0) < param) {
          return { valid: false, reason: `Target attack must be >= ${param}` };
        }
        break;

      case PlayReq.REQ_TARGET_IS_NOT_SELF:
        if (target === source) {
          return { valid: false, reason: 'Cannot target self' };
        }
        break;

      case PlayReq.REQ_TARGET_NOT_STEALTHED:
        if (targetAny.stealth) {
          return { valid: false, reason: 'Target cannot have stealth' };
        }
        break;

      case PlayReq.REQ_FREEZE_TARGET:
        if (!targetAny.frozen) {
          return { valid: false, reason: 'Target must be frozen' };
        }
        break;

      case PlayReq.REQ_CHARGE_TARGET:
        if (!targetAny.charge) {
          return { valid: false, reason: 'Target must have charge' };
        }
        break;

      case PlayReq.REQ_TARGET_SPELLPOWER:
        if (!targetAny.spellpower) {
          return { valid: false, reason: 'Target must have spellpower' };
        }
        break;

      case PlayReq.REQ_TARGET_NOT_DESTROYED:
        if (targetAny.destroyed || targetAny.dead) {
          return { valid: false, reason: 'Target cannot be destroyed' };
        }
        break;

      case PlayReq.REQ_TARGET_IS_NOT_ASLEEP:
        if (targetAny.sleeping) {
          return { valid: false, reason: 'Target cannot be asleep' };
        }
        break;

      case PlayReq.REQ_TARGET_NOT_DORMANT:
        if (targetAny.dormant) {
          return { valid: false, reason: 'Target cannot be dormant' };
        }
        break;

      case PlayReq.REQ_WEAPON_EQUIPPED:
        // This is a player requirement, not a target requirement
        // Handled in canPlay check
        break;

      case PlayReq.REQ_TARGET_TO_PLAY:
      case PlayReq.REQ_TARGET_IF_AVAILABLE:
      case PlayReq.REQ_TARGET_FOR_COMBO:
        // These just require a target to be selected, validation is implicit
        break;
    }

    return { valid: true };
  }

  /**
   * Check player-level play requirements (non-target requirements)
   */
  static checkPlayerRequirements(card: Card, player: Player): TargetValidationResult {
    const requirements = (card as any).requirements as Record<number, number> | undefined;

    if (!requirements) {
      return { valid: true };
    }

    const playerAny = player as any;

    for (const [reqStr, param] of Object.entries(requirements)) {
      const reqNum = parseInt(reqStr);

      switch (reqNum) {
        case PlayReq.REQ_WEAPON_EQUIPPED:
          if (!playerAny.weapon) {
            return { valid: false, reason: 'Player must have a weapon equipped' };
          }
          break;

        case PlayReq.REQ_MINIMUM_ENEMY_MINIONS:
          if (!player.opponent || player.opponent.field.length < param) {
            return { valid: false, reason: `Need at least ${param} enemy minions` };
          }
          break;

        case PlayReq.REQ_NUM_MINION_SLOTS:
          if (player.field.length + param > 7) {
            return { valid: false, reason: 'Not enough minion slots' };
          }
          break;

        case PlayReq.REQ_MINION_CAP:
          if (player.field.length >= param) {
            return { valid: false, reason: `Maximum ${param} minions allowed` };
          }
          break;

        case PlayReq.REQ_SECRET_CAP:
          if (player.secrets.length >= param) {
            return { valid: false, reason: `Maximum ${param} secrets allowed` };
          }
          break;

        case PlayReq.REQ_MINIMUM_ENEMY_MINIONS:
          if (!player.opponent || player.opponent.field.length < param) {
            return { valid: false, reason: `Need at least ${param} enemy minions` };
          }
          break;
      }
    }

    return { valid: true };
  }
}

/**
 * Legacy function for backward compatibility
 */
export function isValidTarget(
  source: any,
  target: any,
  requirements?: Record<number, number>
): boolean {
  const result = TargetValidator.isValidTarget(source, target, requirements);
  return result.valid;
}

/**
 * Legacy constant for backward compatibility
 */
export const TARGETING_PREREQUISITES: number[] = [
  PlayReq.REQ_TARGET_TO_PLAY,
  PlayReq.REQ_TARGET_FOR_COMBO,
  PlayReq.REQ_TARGET_IF_AVAILABLE,
];
