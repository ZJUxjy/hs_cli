// classic - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// EX1_131 - Patient Assassin
cardScriptsRegistry.register('EX1_131', {
});

// EX1_134 - Eviscerate
cardScriptsRegistry.register('EX1_134', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 4 damage
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(4);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_613 - Sinister Strike
cardScriptsRegistry.register('EX1_613', {
  play: (ctx: ActionContext) => {
    // Deal 3 damage to enemy hero
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(3);
    damageAction.trigger(ctx.source, opponent.hero);
  },
});

// NEW1_005 - Fan of Knives
cardScriptsRegistry.register('NEW1_005', {
  play: (ctx: ActionContext) => {
    // Deal 1 damage to all enemy minions, draw a card
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;

    // Deal 1 damage to enemy minions
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(1);
      damageAction.trigger(ctx.source, minion);
    }

    // Draw a card
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// NEW1_014 - Headcrack
cardScriptsRegistry.register('NEW1_014', {
  play: (ctx: ActionContext) => {
    // Deal 2 damage to enemy hero, return this to your hand next turn
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(2);
    damageAction.trigger(ctx.source, opponent.hero);
  },
});

// NEW1_014e - Headcrack Enchantment
cardScriptsRegistry.register('NEW1_014e', {
});

// CS2_072 - Shiv
cardScriptsRegistry.register('CS2_072', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 1 damage, draw a card
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(1);
    damageAction.trigger(ctx.source, ctx.target!);

    // Draw a card
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// CS2_073 - Fan of Knives
cardScriptsRegistry.register('CS2_073', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 1 damage
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(1);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_074 - Fan of Knives
cardScriptsRegistry.register('CS2_074', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 1 damage
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(1);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_075 - Sprint
cardScriptsRegistry.register('CS2_075', {
  play: (ctx: ActionContext) => {
    // Draw 4 cards
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// CS2_076 - Vanish
cardScriptsRegistry.register('CS2_076', {
  play: (ctx: ActionContext) => {
    // Return all minions to their owner's hand
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;

    // Return friendly minions to hand
    const friendlyField = controller.field || [];
    for (const minion of friendlyField) {
      minion.zone = 'HAND';
    }

    // Return enemy minions to hand
    const enemyField = opponent.field || [];
    for (const minion of enemyField) {
      minion.zone = 'HAND';
    }
  },
});

// CS2_077 - Backstab
cardScriptsRegistry.register('CS2_077', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 2 damage to undamaged minion
    const target = ctx.target as any;
    if ((target.damage || 0) === 0) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(ctx.source, target);
    }
  },
});

// CS2_233 - Sap
cardScriptsRegistry.register('CS2_233', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Return enemy minion to hand
    const target = ctx.target as any;
    target.zone = 'HAND';
    // Remove from field
    const opponent = (target as any).controller;
    if (opponent.field) {
      opponent.field = opponent.field.filter((m: any) => m !== target);
    }
  },
});

// EX1_124 - Fan of Knives
cardScriptsRegistry.register('EX1_124', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 2 damage
    const { Damage } = require('../../../actions/damage');
    const damageAction = new Damage(2);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_126 - Fan of Knives
cardScriptsRegistry.register('EX1_126', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give target +2/+2
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('EX1_126e', { ATK: 2, HEALTH: 2 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_128 - Fan of Knives
cardScriptsRegistry.register('EX1_128', {
  play: (ctx: ActionContext) => {
    // Draw a card
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// EX1_128e - Fan of Knives Enchantment
cardScriptsRegistry.register('EX1_128e', {
});

// EX1_129 - Fan of Knives
cardScriptsRegistry.register('EX1_129', {
  play: (ctx: ActionContext) => {
    // Give your other minions +1/+1
    const controller = (ctx.source as any).controller;
    const friendlyMinions = (controller.field || []).filter((m: any) => m !== ctx.source);
    for (const minion of friendlyMinions) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('EX1_129e', { ATK: 1, HEALTH: 1 });
      buffAction.trigger(ctx.source, minion);
    }
  },
});

// EX1_137 - Fan of Knives - Deal $1 damage to all enemy minions. Draw a card
cardScriptsRegistry.register('EX1_137', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const enemyField = opponent.field || [];

    // Deal 1 damage to all enemy minions
    for (const minion of enemyField) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(1);
      damageAction.trigger(source, minion);
    }

    // Draw a card
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(source);
    drawAction.trigger(source);
  },
});

// EX1_144 - Shadowstep - Return a friendly minion to your hand. It costs (2) less
cardScriptsRegistry.register('EX1_144', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.zone = 'HAND';
      const controller = (ctx.source as any).controller;
      controller.field = controller.field.filter((m: any) => m !== target);
      // Reduce cost by 2
      target.cost = Math.max(0, (target.cost || 0) - 2);
    }
  },
});

// EX1_144e - Shadowstep Enchantment
cardScriptsRegistry.register('EX1_144e', {
});

// EX1_145 - Preparation - The next spell you cast this turn costs (3) less
cardScriptsRegistry.register('EX1_145', {
  play: (ctx: ActionContext) => {
    // In a full implementation, this would reduce the next spell cost
  },
});

// EX1_145o - Preparation Enchantment
cardScriptsRegistry.register('EX1_145o', {
});

// EX1_278 - Shiv - Deal 1 damage. Draw a card
cardScriptsRegistry.register('EX1_278', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(1);
      damageAction.trigger(ctx.source, ctx.target);
    }
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// EX1_581 - Sap - Return an enemy minion to your hand
cardScriptsRegistry.register('EX1_581', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_ENEMY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.zone = 'HAND';
      const controller = (ctx.source as any).controller;
      const opponent = controller.opponent;
      opponent.field = opponent.field.filter((m: any) => m !== target);
    }
  },
});

// NEW1_004 - Vanish - Return all minions to your hand
cardScriptsRegistry.register('NEW1_004', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Return all friendly minions to hand
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      minion.zone = 'HAND';
    }
    controller.field = [];
    // Return all enemy minions to hand
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      minion.zone = 'HAND';
    }
    opponent.field = [];
  },
});

// EX1_133 - Perdition's Blade - Battlecry: Deal 1 damage. Combo: Deal 2 damage instead
cardScriptsRegistry.register('EX1_133', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const controller = (ctx.source as any).controller;
      const comboCount = (controller as any).comboCount || 0;
      const damage = comboCount > 0 ? 2 : 1;
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(damage);
      damageAction.trigger(ctx.source, ctx.target);
    }
  },
});

// EX1_182 - Pilfer - Add a random card from your opponent's hand to your hand
cardScriptsRegistry.register('EX1_182', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const hand = opponent.hand || [];
    if (hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * hand.length);
      const card = hand[randomIndex];
      // Add to controller's hand
      (controller as any).hand = [...(controller.hand || []), card];
    }
  },
});

// EX1_191 - Plaguebringer - Battlecry: Give your other minions +1 Attack
cardScriptsRegistry.register('EX1_191', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const source = ctx.source as any;
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      if (minion !== source) {
        const { Buff } = require('../../../actions/buff');
        const buffAction = new Buff('EX1_191e', { ATK: 1 });
        buffAction.trigger(ctx.source, minion);
      }
    }
  },
});
