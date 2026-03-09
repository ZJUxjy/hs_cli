import { PlayableCard, CardDefinition } from './card';
import type { Player } from './player';

export interface HeroPowerDefinition extends CardDefinition {
  cost: number;
}

export class HeroPower extends PlayableCard {
  public activationsThisTurn: number = 0;
  public additionalActivationsThisTurn: number = 0;

  constructor(def: HeroPowerDefinition) {
    super(def);
  }

  isUsable(): boolean {
    // Check if already used max times this turn
    const maxActivations = 1 + this.additionalActivationsThisTurn;
    if (this.activationsThisTurn >= maxActivations) {
      return false;
    }

    // Check if controller has enough mana
    const controller = this.controller as Player;
    if (!controller) {
      return false;
    }
    if (controller.mana < this.cost) {
      return false;
    }

    return true;
  }

  activate(): boolean {
    if (!this.isUsable()) {
      return false;
    }

    const controller = this.controller as Player;
    controller.payCost(this.cost);
    this.activationsThisTurn++;

    console.log(`[HeroPower] ${controller.name} used ${this.name || this.id}`);

    // Trigger hero power effect (would be handled by card script)
    return true;
  }

  resetForNewTurn(): void {
    this.activationsThisTurn = 0;
    // Note: additionalActivationsThisTurn is NOT reset because it represents
    // permanent upgrades (like Justicar Trueheart), not temporary buffs
  }
}
