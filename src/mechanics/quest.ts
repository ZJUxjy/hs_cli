// Quest and SideQuest system for Hearthstone
// Based on fireplace's quest implementation

import { Spell } from '../core/card';
import type { Entity } from '../core/entity';
import type { Player } from '../core/player';
import type { Game } from '../core/game';
import { GameEvent, EventPayload } from '../events/eventtypes';

/**
 * Quest base class
 */
export class Quest extends Spell {
  public progress: number = 0;
  public progressTotal: number = 0;
  public rewardCardId: string = '';
  public sideQuest: boolean = false;
  public completed: boolean = false;

  /**
   * Check if quest progress should be incremented
   */
  checkProgress(event: GameEvent, payload: EventPayload): boolean {
    // Override in subclasses
    return false;
  }

  /**
   * Add progress to quest
   */
  addProgress(amount: number = 1): void {
    if (this.completed) return;

    this.progress += amount;
    console.log(`[Quest] ${this.id} progress: ${this.progress}/${this.progressTotal}`);

    if (this.progress >= this.progressTotal) {
      this.complete();
    }
  }

  /**
   * Complete the quest and give reward
   */
  complete(): void {
    if (this.completed) return;

    this.completed = true;
    console.log(`[Quest] ${this.id} completed! Reward: ${this.rewardCardId}`);

    // Give reward card
    const controller = this.getController();
    if (controller && this.rewardCardId) {
      const { Give } = require('../actions');
      const giveAction = new Give(this.rewardCardId);
      giveAction.trigger(this, controller as unknown as Entity);
    }

    // Move to graveyard
    this.moveToGraveyard();
  }

  /**
   * Move quest to graveyard after completion
   */
  moveToGraveyard(): void {
    const controller = this.getController();
    if (!controller) return;

    // Remove from secrets (quests are stored there)
    const secrets = (controller as any).secrets;
    const idx = secrets?.indexOf(this as any) ?? -1;
    if (idx !== -1) {
      secrets.splice(idx, 1);
    }

    // Add to graveyard
    const { Zone } = require('../enums');
    (this as any).zone = Zone.GRAVEYARD;
    (controller as any).graveyard?.push(this as any);
  }
}

/**
 * Helper function to create quest progress conditions
 */
export function createPlayCardCondition(
  cardType?: number,
  cardClass?: number,
  costRange?: { min?: number; max?: number }
): (event: GameEvent, payload: EventPayload, quest: Quest) => boolean {
  return (event, payload, quest) => {
    if (event !== GameEvent.PLAY_CARD) return false;

    const card = payload.card;
    if (!card) return false;

    const cardAny = card as any;

    // Check card type
    if (cardType !== undefined && cardAny.type !== cardType) return false;

    // Check card class
    if (cardClass !== undefined && cardAny.cardClass !== cardClass) return false;

    // Check cost range
    if (costRange) {
      const cost = cardAny.cost || 0;
      if (costRange.min !== undefined && cost < costRange.min) return false;
      if (costRange.max !== undefined && cost > costRange.max) return false;
    }

    // Check if played by quest owner
    const player = payload.player || cardAny.controller;
    const controller = quest.getController();
    if (!controller || player !== controller) return false;

    return true;
  };
}

/**
 * Helper function to create summon minion condition
 */
export function createSummonCondition(
  race?: number,
  attackRange?: { min?: number; max?: number }
): (event: GameEvent, payload: EventPayload, quest: Quest) => boolean {
  return (event, payload, quest) => {
    if (event !== GameEvent.MINION_SUMMON && event !== GameEvent.AFTER_SUMMON) return false;

    const minion = payload.source;
    if (!minion) return false;

    const minionAny = minion as any;

    // Check race
    if (race !== undefined && minionAny.race !== race) return false;

    // Check attack range
    if (attackRange) {
      const attack = minionAny.attack || 0;
      if (attackRange.min !== undefined && attack < attackRange.min) return false;
      if (attackRange.max !== undefined && attack > attackRange.max) return false;
    }

    // Check if summoned by quest owner
    const player = payload.player || minionAny.controller;
    const controller = quest.getController();
    if (!controller || player !== controller) return false;

    return true;
  };
}

/**
 * Helper function to create damage dealt condition
 */
export function createDealDamageCondition(): (event: GameEvent, payload: EventPayload, quest: Quest) => boolean {
  return (event, payload, quest) => {
    if (event !== GameEvent.DEAL_DAMAGE) return false;

    const source = payload.source;
    if (!source) return false;

    // Check if damage dealt by quest owner
    const controller = quest.getController();
    if (!controller) return false;

    return (source as any).controller === controller;
  };
}

/**
 * Helper function to create hero power use condition
 */
export function createHeroPowerCondition(): (event: GameEvent, payload: EventPayload, quest: Quest) => boolean {
  return (event, payload, quest) => {
    if (event !== GameEvent.HERO_POWER && event !== GameEvent.AFTER_HERO_POWER) return false;

    const player = payload.player;
    if (!player) return false;

    const controller = quest.getController();
    if (!controller) return false;

    return player === controller;
  };
}
