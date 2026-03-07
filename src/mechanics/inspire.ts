// Inspire mechanism for Hearthstone
// Triggers when you use your Hero Power

import { Minion } from '../core/card';
import { GameEvent, EventPayload } from '../events/eventtypes';
import { Action } from '../actions/base';
import type { Entity } from '../core/entity';

/**
 * Interface for inspire effect
 */
export interface InspireEffect {
  (minion: Entity): Action | Action[] | void;
}

/**
 * Inspire mixin for minions
 */
export interface Inspireable {
  inspire?: InspireEffect;
  hasInspire: boolean;

  onInspire(): void;
}

/**
 * Add inspire capability to a minion
 */
export function addInspire(minion: Minion, effect: InspireEffect): void {
  const minionAny = minion as any;

  minionAny.inspire = effect;
  minionAny.hasInspire = true;

  // Store original setup events if exists
  const originalSetup = minionAny.setupEvents || (() => {});

  minionAny.setupEvents = function() {
    originalSetup.call(this);

    // Listen for hero power events
    const game = this.game;
    if (game) {
      game.on(GameEvent.HERO_POWER, (payload: EventPayload) => {
        if (this.hasInspire && this.inspire) {
          // Check if hero power was used by this minion's controller
          const heroPowerUser = payload.player || payload.source;
          const controller = this.controller;

          if (heroPowerUser === controller) {
            this.onInspire();
          }
        }
      });
    }
  };

  minionAny.onInspire = function() {
    if (this.inspire) {
      console.log(`[Inspire] ${this.id} triggered!`);

      const result = this.inspire(this);

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
 * Inspire manager - tracks all inspire minions
 */
export class InspireManager {
  private inspireMinions: Set<Minion> = new Set();

  register(minion: Minion): void {
    this.inspireMinions.add(minion);
  }

  unregister(minion: Minion): void {
    this.inspireMinions.delete(minion);
  }

  /**
   * Trigger inspire for all minions of a player
   */
  triggerAll(player: any): void {
    for (const minion of this.inspireMinions) {
      const minionAny = minion as any;

      if (minionAny.hasInspire && minionAny.controller === player) {
        minionAny.onInspire();
      }
    }
  }

  /**
   * Get all inspire minions for a player
   */
  getInspireMinions(player: any): Minion[] {
    return Array.from(this.inspireMinions).filter(m => {
      const mAny = m as any;
      return mAny.hasInspire && mAny.controller === player;
    });
  }
}

/**
 * Helper to check if a minion has inspire
 */
export function hasInspire(minion: Minion): boolean {
  return (minion as any).hasInspire === true;
}

/**
 * Helper to trigger inspire manually (e.g., for testing)
 */
export function triggerInspire(minion: Minion): void {
  const minionAny = minion as any;
  if (minionAny.onInspire) {
    minionAny.onInspire();
  }
}
