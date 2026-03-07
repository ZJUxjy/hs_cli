// Frenzy mechanism for Hearthstone
// Triggers when the minion takes damage and survives

import { Minion } from '../core/card';
import { GameEvent, EventPayload } from '../events/eventtypes';
import { Action } from '../actions/base';
import type { Entity } from '../core/entity';

/**
 * Interface for frenzy effect
 */
export interface FrenzyEffect {
  (minion: Entity): Action | Action[] | void;
}

/**
 * Frenzy mixin for minions
 */
export interface Frenziable {
  frenzy?: FrenzyEffect;
  frenzyTriggered: boolean;
  hasFrenzy: boolean;

  onFrenzy(): void;
  resetFrenzy(): void;
}

/**
 * Add frenzy capability to a minion
 */
export function addFrenzy(minion: Minion, effect: FrenzyEffect): void {
  const minionAny = minion as any;

  minionAny.frenzy = effect;
  minionAny.frenzyTriggered = false;
  minionAny.hasFrenzy = true;

  // Store original setup events if exists
  const originalSetup = minionAny.setupEvents || (() => {});

  minionAny.setupEvents = function() {
    originalSetup.call(this);

    // Listen for damage taken events
    const game = this.game;
    if (game) {
      game.on(GameEvent.AFTER_TAKE_DAMAGE, (payload: EventPayload) => {
        // Check if this minion was damaged
        if (payload.target === this && this.hasFrenzy && !this.frenzyTriggered) {
          // Check if minion survived (health > 0)
          if (this.health > 0) {
            this.onFrenzy();
          }
        }
      });
    }
  };

  minionAny.onFrenzy = function() {
    if (this.frenzy && !this.frenzyTriggered) {
      console.log(`[Frenzy] ${this.id} triggered!`);

      const result = this.frenzy(this);

      if (result) {
        const actions = Array.isArray(result) ? result : [result];
        for (const action of actions) {
          if (action.trigger) {
            action.trigger(this);
          }
        }
      }

      // Consume frenzy (can only trigger once)
      this.frenzyTriggered = true;
    }
  };

  minionAny.resetFrenzy = function() {
    // Frenzy typically doesn't reset, but provide the method for completeness
    this.frenzyTriggered = false;
  };
}

/**
 * Frenzy manager - tracks all frenzy minions
 */
export class FrenzyManager {
  private frenzyMinions: Set<Minion> = new Set();

  register(minion: Minion): void {
    this.frenzyMinions.add(minion);
  }

  unregister(minion: Minion): void {
    this.frenzyMinions.delete(minion);
  }

  /**
   * Check and trigger frenzy for a damaged minion
   */
  checkAndTrigger(minion: Minion): void {
    const minionAny = minion as any;

    if (minionAny.hasFrenzy &&
        !minionAny.frenzyTriggered &&
        minion.health > 0) {
      minionAny.onFrenzy();
    }
  }

  /**
   * Reset all frenzy effects (for new game/round)
   */
  resetAll(): void {
    for (const minion of this.frenzyMinions) {
      const minionAny = minion as any;
      if (minionAny.resetFrenzy) {
        minionAny.resetFrenzy();
      }
    }
  }
}

/**
 * Helper to check if a minion has frenzy
 */
export function hasFrenzy(minion: Minion): boolean {
  return (minion as any).hasFrenzy === true;
}

/**
 * Helper to trigger frenzy manually (e.g., for testing)
 */
export function triggerFrenzy(minion: Minion): void {
  const minionAny = minion as any;
  if (minionAny.onFrenzy) {
    minionAny.onFrenzy();
  }
}
