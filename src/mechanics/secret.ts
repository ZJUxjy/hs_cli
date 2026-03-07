// Secret system for Hearthstone
// Based on fireplace's secret implementation

import { CardType, Zone } from '../enums';
import { Spell } from '../core/card';
import type { Entity } from '../core/entity';
import type { Player } from '../core/player';
import type { Game } from '../core/game';
import { GameEvent, EventPayload } from '../events/eventtypes';

/**
 * Secret card class
 */
export class Secret extends Spell {
  public revealed: boolean = false;

  /**
   * Check if secret can be triggered
   */
  canTrigger(event: GameEvent, payload: EventPayload): boolean {
    // Override in specific secret implementations
    return false;
  }

  /**
   * Trigger the secret effect
   */
  trigger(event: GameEvent, payload: EventPayload): void {
    if (!this.canTrigger(event, payload)) return;

    console.log(`[Secret] ${this.id} revealed!`);
    this.revealed = true;

    // Execute secret effect
    this.onTrigger(event, payload);

    // Remove from secrets zone and move to graveyard
    this.moveToGraveyard();
  }

  /**
   * Override this in subclasses for specific secret effects
   */
  onTrigger(event: GameEvent, payload: EventPayload): void {
    // Override in specific secret implementations
  }

  /**
   * Move secret to graveyard after triggering
   */
  moveToGraveyard(): void {
    const controller = this.getController();
    if (!controller) return;

    // Remove from secrets
    const secrets = (controller as any).secrets;
    const idx = secrets?.indexOf(this as any) ?? -1;
    if (idx !== -1) {
      secrets.splice(idx, 1);
    }

    // Add to graveyard
    (this as any).zone = Zone.GRAVEYARD;
    (controller as any).graveyard?.push(this as any);
  }
}

/**
 * Secret Manager - handles secret triggering
 */
export class SecretManager {
  constructor(private game: Game) {}

  /**
   * Check all secrets for a triggering event
   */
  checkSecrets(event: GameEvent, payload: EventPayload): void {
    for (const player of this.game.players) {
      const secrets = (player as any).secrets;
      if (!secrets) continue;
      for (const secret of secrets.toArray?.() || []) {
        const secretAny = secret as any;
        if (typeof secretAny.canTrigger === 'function' &&
            typeof secretAny.trigger === 'function') {
          if (secretAny.canTrigger(event, payload)) {
            secretAny.trigger(event, payload);
          }
        }
      }
    }
  }

  /**
   * Check if player can play a secret
   */
  canPlaySecret(player: Player): boolean {
    return (player as any).secrets?.length < 5; // Max 5 secrets
  }
}

// ============== Common Secret Types ==============

/**
 * Attack-triggered secret (e.g., Freezing Trap, Explosive Trap)
 */
export abstract class AttackTriggeredSecret extends Secret {
  protected attackerIsEnemy(payload: EventPayload): boolean {
    const attacker = payload.source;
    if (!attacker) return false;
    const controller = this.getController();
    if (!controller) return false;
    return (attacker as any).controller !== controller;
  }

  protected targetIsFriendly(payload: EventPayload): boolean {
    const target = payload.target;
    if (!target) return false;
    const controller = this.getController();
    if (!controller) return false;
    return (target as any).controller === controller;
  }
}

/**
 * Spell-triggered secret (e.g., Counterspell, Spellbender)
 */
export abstract class SpellTriggeredSecret extends Secret {
  canTrigger(event: GameEvent, payload: EventPayload): boolean {
    if (event !== GameEvent.CAST_SPELL) return false;

    // Check if spell is cast by opponent
    const caster = payload.source;
    if (!caster) return false;

    const controller = this.getController();
    if (!controller) return false;

    return (caster as any).controller !== controller;
  }
}

/**
 * Minion-play-triggered secret (e.g., Mirror Entity, Repentance)
 */
export abstract class MinionPlayTriggeredSecret extends Secret {
  canTrigger(event: GameEvent, payload: EventPayload): boolean {
    if (event !== GameEvent.MINION_SUMMON && event !== GameEvent.AFTER_SUMMON) return false;

    // Check if minion is played by opponent
    const player = payload.player || (payload.source as any)?.controller;
    if (!player) return false;

    const controller = this.getController();
    if (!controller) return false;

    return player !== controller;
  }
}

/**
 * Damage-triggered secret (e.g., Eye for an Eye)
 */
export abstract class DamageTriggeredSecret extends Secret {
  canTrigger(event: GameEvent, payload: EventPayload): boolean {
    return event === GameEvent.DAMAGE || event === GameEvent.TAKE_DAMAGE;
  }
}
