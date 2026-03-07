// Action functions - building blocks for card scripts
import type { Entity } from '../../core/entity';
import { ActionContext, ScriptFunction } from './types';

// Helper to create action functions that target entities
export function targetAction(
  targetSelector: (context: ActionContext) => Entity | Entity[] | null,
  action: (source: Entity, target: Entity) => unknown
): ScriptFunction {
  return (context: ActionContext) => {
    const targets = targetSelector(context);
    if (!targets) return;
    const targetList = Array.isArray(targets) ? targets : [targets];
    for (const target of targetList) {
      action(context.source, target);
    }
  };
}

// Helper for damage action
export function dealDamage(amount: number | ((ctx: ActionContext) => number)): ScriptFunction {
  return (context: ActionContext) => {
    const damage = typeof amount === 'function' ? amount(context) : amount;
    if (context.target) {
      // Call damage action from actions module
      const { Damage } = require('../../actions/damage');
      const damageAction = new Damage(damage);
      damageAction.trigger(context.source, context.target);
    }
  };
}

// Helper for healing
export function heal(amount: number | ((ctx: ActionContext) => number)): ScriptFunction {
  return (context: ActionContext) => {
    const healAmount = typeof amount === 'function' ? amount(context) : amount;
    if (context.target) {
      const { Heal } = require('../../actions/heal');
      const healAction = new Heal(healAmount);
      healAction.trigger(context.source, context.target);
    }
  };
}

// Helper for drawing cards
export function drawCard(cardId?: string): ScriptFunction {
  return (context: ActionContext) => {
    const { Draw } = require('../../actions/draw');
    const drawAction = new Draw(context.source, 1, cardId as any);
    drawAction.trigger(context.source);
  };
}

// Helper for summoning minions
export function summonMinion(cardId: string): ScriptFunction {
  return (context: ActionContext) => {
    const { Summon } = require('../../actions/summon');
    const summonAction = new Summon(cardId);
    summonAction.trigger(context.source);
  };
}

// Helper for destroying targets
export function destroy(target: Entity | ((ctx: ActionContext) => Entity | null)): ScriptFunction {
  return (context: ActionContext) => {
    const targetEntity = typeof target === 'function' ? target(context) : target;
    if (targetEntity) {
      // Mark for destroy - actual destruction handled by game loop
      (targetEntity as any).destroyed = true;
    }
  };
}

// Helper for adding buffs
export function addBuff(buffId: string, attackBonus: number = 0, healthBonus: number = 0): ScriptFunction {
  return (context: ActionContext) => {
    const { Buff } = require('../../actions/buff');
    const buffAction = new Buff(buffId, { ATK: attackBonus, HEALTH: healthBonus });
    buffAction.trigger(context.source, context.target || context.source);
  };
}

// Helper for freezing
export function freeze(): ScriptFunction {
  return (context: ActionContext) => {
    if (context.target) {
      (context.target as any).frozen = true;
    }
  };
}

// Helper for transforming (morph)
export function morph(cardId: string): ScriptFunction {
  return (context: ActionContext) => {
    if (context.target) {
      // Transform target into new minion
      const { Morph } = require('../../actions/morph');
      const morphAction = new Morph(cardId);
      morphAction.trigger(context.source, context.target);
    }
  };
}

// Give a card to opponent
export function giveOpponent(cardId: string): ScriptFunction {
  return (context: ActionContext) => {
    const controller = (context.source as any).controller;
    const opponent = controller.opponent;
    const { Give } = require('../../actions/give');
    const giveAction = new Give(cardId);
    giveAction.trigger(context.source, opponent);
  };
}

// Shuffle into deck
export function shuffleIntoDeck(cardId: string): ScriptFunction {
  return (context: ActionContext) => {
    const { Shuffle } = require('../../actions/shuffle');
    const shuffleAction = new Shuffle(cardId);
    shuffleAction.trigger(context.source);
  };
}

// Gain armor
export function gainArmor(amount: number): ScriptFunction {
  return (context: ActionContext) => {
    const controller = (context.source as any).controller;
    if (controller.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + amount;
    }
  };
}

// Set health
export function setHealth(amount: number): ScriptFunction {
  return (context: ActionContext) => {
    if (context.target) {
      const target = context.target as any;
      target.damage = Math.max(0, (target.health || 0) - amount);
    }
  };
}

// Discard random card
export function discardRandom(): ScriptFunction {
  return (context: ActionContext) => {
    const controller = (context.source as any).controller;
    const hand = controller.hand || [];
    if (hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * hand.length);
      const discarded = hand[randomIndex];
      (discarded as any).zone = 'GRAVEYARD';
    }
  };
}

// Export all action helpers
export const Actions = {
  dealDamage,
  heal,
  drawCard,
  summonMinion,
  destroy,
  addBuff,
  freeze,
  morph,
  giveOpponent,
  shuffleIntoDeck,
  gainArmor,
  setHealth,
  discardRandom,
};
