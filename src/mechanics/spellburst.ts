// Spellburst mechanism for Hearthstone
// Triggers after you cast a spell (one-time effect)

import { Minion } from '../core/card';
import { GameEvent, EventPayload } from '../events/eventtypes';
import { Action } from '../actions/base';
import type { Spell } from '../core/card';
import type { Entity } from '../core/entity';

/**
 * Interface for spellburst effect
 */
export interface SpellburstEffect {
  (caster: Entity, spell: Spell): Action | Action[] | void;
}

/**
 * Spellburst mixin for minions
 */
export interface Spellburstable {
  spellburst?: SpellburstEffect;
  spellburstTriggered: boolean;
  hasSpellburst: boolean;

  onSpellburst(caster: Entity, spell: Spell): void;
  resetSpellburst(): void;
}

/**
 * Add spellburst capability to a minion
 */
export function addSpellburst(minion: Minion, effect: SpellburstEffect): void {
  const minionAny = minion as any;

  minionAny.spellburst = effect;
  minionAny.spellburstTriggered = false;
  minionAny.hasSpellburst = true;

  // Store original setup events if exists
  const originalSetup = minionAny.setupEvents || (() => {});

  minionAny.setupEvents = function() {
    originalSetup.call(this);

    // Listen for spell cast events
    const game = this.game;
    if (game) {
      game.on(GameEvent.CAST_SPELL, (payload: EventPayload) => {
        if (this.spellburst && !this.spellburstTriggered && this.hasSpellburst) {
          const caster = payload.source;
          const spell = payload.card as Spell;

          // Only trigger if spell was cast by this minion's controller
          if (caster && (caster as any).controller === this.controller) {
            this.onSpellburst(caster, spell);
          }
        }
      });
    }
  };

  minionAny.onSpellburst = function(caster: Entity, spell: Spell) {
    if (this.spellburst && !this.spellburstTriggered) {
      console.log(`[Spellburst] ${this.id} triggered!`);

      const result = this.spellburst(caster, spell);

      if (result) {
        const actions = Array.isArray(result) ? result : [result];
        for (const action of actions) {
          if (action.trigger) {
            action.trigger(this);
          }
        }
      }

      // Consume spellburst
      this.spellburstTriggered = true;
    }
  };

  minionAny.resetSpellburst = function() {
    this.spellburstTriggered = false;
  };
}

/**
 * Spellburst manager - tracks all spellburst minions
 */
export class SpellburstManager {
  private spellburstMinions: Set<Minion> = new Set();

  register(minion: Minion): void {
    this.spellburstMinions.add(minion);
  }

  unregister(minion: Minion): void {
    this.spellburstMinions.delete(minion);
  }

  /**
   * Trigger spellburst for all active minions of a player
   */
  triggerAll(caster: Entity, spell: Spell): void {
    for (const minion of this.spellburstMinions) {
      const minionAny = minion as any;

      if (minionAny.hasSpellburst &&
          !minionAny.spellburstTriggered &&
          (minion as any).controller === (caster as any).controller) {
        minionAny.onSpellburst(caster, spell);
      }
    }
  }

  /**
   * Reset all spellburst effects (at end of turn or when needed)
   */
  resetAll(): void {
    for (const minion of this.spellburstMinions) {
      const minionAny = minion as any;
      if (minionAny.resetSpellburst) {
        minionAny.resetSpellburst();
      }
    }
  }
}

/**
 * Helper to check if a minion has spellburst
 */
export function hasSpellburst(minion: Minion): boolean {
  return (minion as any).hasSpellburst === true;
}

/**
 * Helper to trigger spellburst manually (e.g., for testing)
 */
export function triggerSpellburst(minion: Minion, caster: Entity, spell: Spell): void {
  const minionAny = minion as any;
  if (minionAny.onSpellburst) {
    minionAny.onSpellburst(caster, spell);
  }
}
