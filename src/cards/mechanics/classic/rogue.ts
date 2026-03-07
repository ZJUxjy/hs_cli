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
    const { Damage } = require('../actions/damage');
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
    const { Damage } = require('../actions/damage');
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
      const { Damage } = require('../actions/damage');
      const damageAction = new Damage(1);
      damageAction.trigger(ctx.source, minion);
    }

    // Draw a card
    const { Draw } = require('../actions/draw');
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
    const { Damage } = require('../actions/damage');
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
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(1);
    damageAction.trigger(ctx.source, ctx.target!);

    // Draw a card
    const { Draw } = require('../actions/draw');
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
    const { Damage } = require('../actions/damage');
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
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(1);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_075 - Sprint
cardScriptsRegistry.register('CS2_075', {
  play: (ctx: ActionContext) => {
    // Draw 4 cards
    const { Draw } = require('../actions/draw');
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
      const { Damage } = require('../actions/damage');
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
    const { Damage } = require('../actions/damage');
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
    const { Buff } = require('../actions/buff');
    const buffAction = new Buff('EX1_126e', { ATK: 2, HEALTH: 2 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_128 - Fan of Knives
cardScriptsRegistry.register('EX1_128', {
  play: (ctx: ActionContext) => {
    // Draw a card
    const { Draw } = require('../actions/draw');
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
      const { Buff } = require('../actions/buff');
      const buffAction = new Buff('EX1_129e', { ATK: 1, HEALTH: 1 });
      buffAction.trigger(ctx.source, minion);
    }
  },
});

// EX1_137 - Fan of Knives
cardScriptsRegistry.register('EX1_137', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_144
cardScriptsRegistry.register('EX1_144', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_144e
cardScriptsRegistry.register('EX1_144e', {
  events: {
    // TODO: implement events
  },
});

// EX1_145
cardScriptsRegistry.register('EX1_145', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_145o
cardScriptsRegistry.register('EX1_145o', {
  events: {
    // TODO: implement events
  },
});

// EX1_278
cardScriptsRegistry.register('EX1_278', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_581
cardScriptsRegistry.register('EX1_581', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// NEW1_004
cardScriptsRegistry.register('NEW1_004', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_133
cardScriptsRegistry.register('EX1_133', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_182
cardScriptsRegistry.register('EX1_182', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_191
cardScriptsRegistry.register('EX1_191', {
  play: (ctx: ActionContext) => { /* TODO */ },
});
