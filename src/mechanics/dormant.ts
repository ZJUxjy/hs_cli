// Dormant mechanism for Hearthstone
// Minions that are dormant cannot attack, be targeted, or take actions
// They awaken after certain conditions are met

import { Minion } from '../core/card';
import { GameEvent, EventPayload } from '../events/eventtypes';
import type { Entity } from '../core/entity';

/**
 * Awaken condition types
 */
export type AwakenCondition =
  | { type: 'turns'; turns: number }
  | { type: 'event'; event: GameEvent; filter?: (payload: EventPayload) => boolean }
  | { type: 'custom'; check: (minion: Entity) => boolean };

/**
 * Dormant state for minions
 */
export interface DormantState {
  isDormant: boolean;
  awakenCondition?: AwakenCondition;
  remainingTurns?: number;
  onAwaken?: (minion: Entity) => void;
}

/**
 * Dormant mixin for minions
 */
export interface Dormant extends DormantState {
  hasDormant: boolean;

  /**
   * Put the minion into dormant state
   */
  goDormant(condition: AwakenCondition, onAwaken?: (minion: Entity) => void): void;

  /**
   * Awaken the minion
   */
  awaken(): void;

  /**
   * Check if the minion can awaken
   */
  canAwaken(): boolean;

  /**
   * Setup dormant listeners
   */
  setupDormantListeners(): void;
}

/**
 * Add dormant capability to a minion
 */
export function addDormant(minion: Minion, awakenCondition?: AwakenCondition, onAwaken?: (minion: Entity) => void): void {
  const minionAny = minion as any;

  minionAny.hasDormant = true;
  minionAny.isDormant = false;
  minionAny.awakenCondition = awakenCondition;
  minionAny.onAwaken = onAwaken;

  // Store original setup events if exists
  const originalSetup = minionAny.setupEvents || (() => {});

  minionAny.setupEvents = function() {
    originalSetup.call(this);
    this.setupDormantListeners();
  };

  /**
   * Put the minion into dormant state
   */
  minionAny.goDormant = function(condition: AwakenCondition, awakenCallback?: (minion: Entity) => void) {
    this.isDormant = true;
    this.awakenCondition = condition;

    if (awakenCallback) {
      this.onAwaken = awakenCallback;
    }

    console.log(`[Dormant] ${this.id} has gone dormant`);

    // Initialize turn counter if needed
    if (condition.type === 'turns') {
      this.remainingTurns = condition.turns;
    }

    // Setup listeners for the awaken condition
    this.setupDormantListeners();
  };

  /**
   * Awaken the minion from dormant state
   */
  minionAny.awaken = function() {
    if (!this.isDormant) return;

    this.isDormant = false;
    this.awakenCondition = undefined;
    this.remainingTurns = undefined;

    console.log(`[Dormant] ${this.id} has awakened!`);

    // Trigger awaken effect
    if (this.onAwaken) {
      this.onAwaken(this);
    }

    // Trigger game event
    const game = this.game;
    if (game) {
      game.trigger(GameEvent.MINION_SUMMON, { source: this, target: this });
    }
  };

  /**
   * Check if the minion can awaken
   */
  minionAny.canAwaken = function(): boolean {
    if (!this.isDormant || !this.awakenCondition) return false;

    const condition = this.awakenCondition;

    switch (condition.type) {
      case 'turns':
        return (this.remainingTurns || 0) <= 0;

      case 'event':
        // Event-based awakening is checked in the event listener
        return false;

      case 'custom':
        return condition.check(this);

      default:
        return false;
    }
  };

  /**
   * Setup listeners for dormant awakening
   */
  minionAny.setupDormantListeners = function() {
    if (!this.isDormant || !this.awakenCondition) return;

    const game = this.game;
    if (!game) return;

    const condition = this.awakenCondition;

    switch (condition.type) {
      case 'turns':
        // Listen for turn start to count down
        game.on(GameEvent.TURN_BEGIN, (payload: EventPayload) => {
          if (!this.isDormant) return;

          // Only count controller's turns (or any turn depending on design)
          const isControllerTurn = payload.player === this.controller;

          if (isControllerTurn && this.remainingTurns !== undefined) {
            this.remainingTurns--;
            console.log(`[Dormant] ${this.id} will awaken in ${this.remainingTurns} turns`);

            if (this.remainingTurns <= 0) {
              this.awaken();
            }
          }
        });
        break;

      case 'event':
        // Listen for specific event
        game.on(condition.event, (payload: EventPayload) => {
          if (!this.isDormant) return;

          // Check custom filter if provided
          if (condition.filter && !condition.filter(payload)) return;

          this.awaken();
        });
        break;

      case 'custom':
        // Custom conditions are checked on relevant game state changes
        // This might need to be hooked into specific game events
        break;
    }
  };

  // If initial condition was provided, go dormant immediately
  if (awakenCondition) {
    minionAny.goDormant(awakenCondition, onAwaken);
  }
}

/**
 * Dormant manager - tracks all dormant minions
 */
export class DormantManager {
  private dormantMinions: Set<Minion> = new Set();

  register(minion: Minion): void {
    this.dormantMinions.add(minion);
  }

  unregister(minion: Minion): void {
    this.dormantMinions.delete(minion);
  }

  /**
   * Process turn start for all dormant minions
   */
  onTurnBegin(player: any): void {
    for (const minion of this.dormantMinions) {
      const minionAny = minion as any;

      if (minionAny.isDormant &&
          minionAny.awakenCondition?.type === 'turns' &&
          minionAny.remainingTurns !== undefined) {

        // Check if it's the controller's turn
        const controller = minionAny.controller;
        if (controller === player && minionAny.remainingTurns > 0) {
          minionAny.remainingTurns--;

          if (minionAny.remainingTurns <= 0) {
            minionAny.awaken();
          }
        }
      }
    }
  }

  /**
   * Check if a minion can be targeted
   * Dormant minions cannot be targeted
   */
  canBeTargeted(minion: Minion): boolean {
    const minionAny = minion as any;
    return !minionAny.isDormant;
  }

  /**
   * Check if a minion can attack
   * Dormant minions cannot attack
   */
  canAttack(minion: Minion): boolean {
    const minionAny = minion as any;
    return !minionAny.isDormant;
  }

  /**
   * Get all dormant minions
   */
  getDormantMinions(): Minion[] {
    return Array.from(this.dormantMinions).filter(m => (m as any).isDormant);
  }

  /**
   * Force awaken a minion
   */
  forceAwaken(minion: Minion): void {
    const minionAny = minion as any;
    if (minionAny.awaken) {
      minionAny.awaken();
    }
  }
}

/**
 * Helper to check if a minion is dormant
 */
export function isDormant(minion: Minion): boolean {
  return (minion as any).isDormant === true;
}

/**
 * Helper to check if a minion can be targeted (not dormant)
 */
export function canTargetMinion(minion: Minion): boolean {
  return !isDormant(minion);
}

/**
 * Helper to awaken a minion
 */
export function awakenMinion(minion: Minion): void {
  const minionAny = minion as any;
  if (minionAny.awaken) {
    minionAny.awaken();
  }
}
