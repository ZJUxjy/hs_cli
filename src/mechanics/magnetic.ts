// Magnetic mechanism for Hearthstone
// Allows Mech minions to merge with other Mech minions on the field

import { Minion } from '../core/card';
import { Race, Zone } from '../enums';
import { GameEvent } from '../events/eventtypes';
import type { Entity } from '../core/entity';
import type { Player } from '../core/player';

/**
 * Magnetic capability interface
 */
export interface Magnetic {
  magnetic: boolean;

  /**
   * Check if this minion can magnetize to a target
   */
  canMagnetizeTo(target: Minion): boolean;

  /**
   * Merge this minion into the target (magnetize)
   */
  magnetizeTo(target: Minion): void;

  /**
   * Get all valid magnetize targets for this minion
   */
  getMagnetizeTargets(player: Player): Minion[];
}

/**
 * Add magnetic capability to a minion
 */
export function addMagnetic(minion: Minion): void {
  const minionAny = minion as any;

  minionAny.magnetic = true;

  /**
   * Check if this minion can magnetize to a target
   * Requirements:
   * 1. Target must be a Mech
   * 2. Target must be on the field
   * 3. Target must be controlled by the same player
   */
  minionAny.canMagnetizeTo = function(target: Minion): boolean {
    // Cannot magnetize to self
    if (target === this) return false;

    const targetAny = target as any;

    // Target must be a Mech
    if (targetAny.race !== Race.MECHANICAL) return false;

    // Target must be on the field (PLAY zone)
    if (targetAny.zone !== Zone.PLAY) return false;

    // Must be controlled by same player
    if (targetAny.controller !== this.controller) return false;

    // Target cannot be dormant
    if (targetAny.isDormant) return false;

    return true;
  };

  /**
   * Merge this minion's stats and keywords into the target
   * The magnetic minion is consumed in the process
   */
  minionAny.magnetizeTo = function(target: Minion): void {
    if (!this.canMagnetizeTo(target)) {
      console.log(`[Magnetic] Cannot magnetize ${this.id} to ${(target as any).id}`);
      return;
    }

    const targetAny = target as any;

    console.log(`[Magnetic] ${this.id} is magnetizing to ${targetAny.id}`);

    // Merge attack
    targetAny._attack = (targetAny._attack || 0) + (this._attack || 0);

    // Merge health
    const healthIncrease = this._maxHealth || 0;
    targetAny._maxHealth = (targetAny._maxHealth || 0) + healthIncrease;

    // Keep the target's current damage (it doesn't heal from magnetize)
    // But if the magnetic minion had damage, it doesn't transfer

    // Merge keywords (only add, never remove)
    if (this.taunt) targetAny._taunt = true;
    if (this.divineShield) targetAny._divineShield = true;
    if (this.windfury) targetAny.windfury = true;
    if (this.lifesteal) targetAny.lifesteal = true;
    if (this.poisonous) targetAny.poisonous = true;
    if (this.stealth) targetAny.stealth = true;
    if (this.charge) targetAny.charge = true;
    if (this._immune) targetAny._immune = true;

    // Copy buffs from the magnetic minion to the target
    for (const buff of this._buffs || []) {
      target.buff(this, buff);
    }

    // Trigger magnetize event
    const game = this.game;
    if (game) {
      game.trigger(GameEvent.MAGNETIZE, { source: this, target: target });
    }

    // Remove this minion from hand (it was played as a magnetize)
    // Note: The caller is responsible for removing the magnetic minion from hand

    console.log(`[Magnetic] ${targetAny.id} is now ${targetAny._attack}/${targetAny._maxHealth}`);
  };

  /**
   * Get all valid magnetize targets for this minion
   */
  minionAny.getMagnetizeTargets = function(player: Player): Minion[] {
    if (!player || !player.field) return [];

    const targets: Minion[] = [];
    for (const m of player.field as any) {
      if (this.canMagnetizeTo(m as Minion)) {
        targets.push(m as Minion);
      }
    }
    return targets;
  };
}

/**
 * Check if a minion has magnetic
 */
export function isMagnetic(minion: Minion): boolean {
  return (minion as any).magnetic === true;
}

/**
 * Try to perform a magnetic merge
 * Returns true if successful
 */
export function tryMagnetize(source: Minion, target: Minion): boolean {
  const sourceAny = source as any;

  if (!sourceAny.magnetic || !sourceAny.canMagnetizeTo || !sourceAny.magnetizeTo) {
    return false;
  }

  if (!sourceAny.canMagnetizeTo(target)) {
    return false;
  }

  sourceAny.magnetizeTo(target);
  return true;
}

/**
 * Magnetic play handler - called when a magnetic minion is played
 * If there's a valid target, performs magnetize instead of summoning
 */
export function handleMagneticPlay(minion: Minion, target?: Minion): boolean {
  const minionAny = minion as any;

  // Check if this is a magnetic minion
  if (!minionAny.magnetic) {
    return false; // Not magnetic, proceed with normal summon
  }

  // If a specific target is provided, try to magnetize to it
  if (target) {
    if (tryMagnetize(minion, target)) {
      return true; // Magnetize successful
    }
    // If target provided but can't magnetize, fail
    return false;
  }

  // If no target, check if there are any valid targets
  const controller = minionAny.controller as Player;
  if (!controller || !controller.field) {
    return false; // No field, summon normally
  }

  const targets = minionAny.getMagnetizeTargets?.(controller) || [];

  if (targets.length === 0) {
    // No valid targets, summon normally as a minion
    return false;
  }

  // There are valid targets - in a real game, player would choose
  // For now, we'll just summon normally (AI would need selection logic)
  return false;
}

/**
 * Magnetic manager
 */
export class MagneticManager {
  private magneticMinions: Set<Minion> = new Set();

  register(minion: Minion): void {
    this.magneticMinions.add(minion);
  }

  unregister(minion: Minion): void {
    this.magneticMinions.delete(minion);
  }

  /**
   * Get all magnetic minions for a player
   */
  getMagneticMinions(player: Player): Minion[] {
    return Array.from(this.magneticMinions).filter(m => {
      const mAny = m as any;
      return mAny.magnetic && mAny.controller === player;
    });
  }

  /**
   * Check if a minion is valid magnetize target
   */
  isValidTarget(source: Minion, target: Minion): boolean {
    const sourceAny = source as any;
    if (!sourceAny.canMagnetizeTo) return false;
    return sourceAny.canMagnetizeTo(target);
  }
}
