// Honorable Kill mechanism for Hearthstone
// Triggers when your attack/spell exactly kills a target

import { Minion } from '../core/card';
import { GameEvent, EventPayload } from '../events/eventtypes';
import { Action } from '../actions/base';
import type { Entity } from '../core/entity';

/**
 * Interface for honorable kill effect
 */
export interface HonorableKillEffect {
  (source: Entity, target: Entity): Action | Action[] | void;
}

/**
 * Honorable Kill mixin for minions/spells
 */
export interface HonorableKillable {
  honorableKill?: HonorableKillEffect;
  hasHonorableKill: boolean;

  onHonorableKill(target: Entity): void;
  checkHonorableKill(target: Entity, damageDealt: number): boolean;
}

/**
 * Add honorable kill capability to a minion/spell
 */
export function addHonorableKill(entity: Minion, effect: HonorableKillEffect): void {
  const entityAny = entity as any;

  entityAny.honorableKill = effect;
  entityAny.hasHonorableKill = true;

  // Store original setup events if exists
  const originalSetup = entityAny.setupEvents || (() => {});

  entityAny.setupEvents = function() {
    originalSetup.call(this);

    // Listen for damage dealt events to check for honorable kill
    const game = this.game;
    if (game) {
      game.on(GameEvent.AFTER_DEAL_DAMAGE, (payload: EventPayload) => {
        // Check if this entity dealt damage
        if (payload.source === this && this.hasHonorableKill) {
          const target = payload.target;
          const amount = payload.amount || 0;

          if (target && this.checkHonorableKill(target, amount)) {
            this.onHonorableKill(target);
          }
        }
      });
    }
  };

  /**
   * Check if this was an honorable kill
   * Honorable kill = damage dealt exactly equals target's remaining health
   */
  entityAny.checkHonorableKill = function(target: Entity, damageDealt: number): boolean {
    // Target must be a character with health
    if ((target as any).health === undefined) return false;

    const targetHealth = (target as any).health;
    const targetMaxHealth = (target as any).maxHealth;
    const targetDamage = (target as any).damage || 0;

    // Calculate health before the damage
    const healthBefore = targetMaxHealth - targetDamage + damageDealt;

    // Honorable kill: damage dealt exactly equals health before damage
    // And target is now dead (or dying)
    const isExactKill = damageDealt === healthBefore;
    const targetDying = (target as any).health <= 0 || (target as any).dead;

    return isExactKill && targetDying;
  };

  entityAny.onHonorableKill = function(target: Entity) {
    if (this.honorableKill) {
      console.log(`[Honorable Kill] ${this.id} honorable killed ${(target as any).id || 'target'}!`);

      const result = this.honorableKill(this, target);

      if (result) {
        const actions = Array.isArray(result) ? result : [result];
        for (const action of actions) {
          if (action.trigger) {
            action.trigger(this);
          }
        }
      }
    }
  };
}

/**
 * Honorable Kill manager - tracks all entities with honorable kill
 */
export class HonorableKillManager {
  private honorableKillEntities: Set<Minion> = new Set();

  register(minion: Minion): void {
    this.honorableKillEntities.add(minion);
  }

  unregister(minion: Minion): void {
    this.honorableKillEntities.delete(minion);
  }

  /**
   * Check and trigger honorable kill
   * Called from damage resolution when a target dies
   */
  checkHonorableKill(source: Entity, target: Entity, damageDealt: number): void {
    const sourceAny = source as any;

    if (sourceAny.hasHonorableKill && sourceAny.checkHonorableKill) {
      if (sourceAny.checkHonorableKill(target, damageDealt)) {
        sourceAny.onHonorableKill(target);
      }
    }
  }
}

/**
 * Helper to check if an entity has honorable kill
 */
export function hasHonorableKill(entity: Minion): boolean {
  return (entity as any).hasHonorableKill === true;
}

/**
 * Helper to check honorable kill condition manually
 */
export function checkHonorableKill(target: Entity, damageDealt: number): boolean {
  if ((target as any).health === undefined) return false;

  const targetMaxHealth = (target as any).maxHealth;
  const targetDamage = (target as any).damage || 0;

  // Health before this damage
  const healthBefore = targetMaxHealth - targetDamage + damageDealt;

  return damageDealt === healthBefore;
}
