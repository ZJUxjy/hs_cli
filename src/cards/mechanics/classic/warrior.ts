// classic - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// EX1_398 - Arathi Weaponsmith
cardScriptsRegistry.register('EX1_398', {
  play: (ctx: ActionContext) => {
    // Summon a 4/2 weapon
    const { Summon } = require('../actions/summon');
    const summonAction = new Summon('EX1_398t');
    summonAction.trigger(ctx.source);
  },
});

// EX1_402 - Frothing Berserker
cardScriptsRegistry.register('EX1_402', {
  events: {
    // TODO: implement events - gain +1 attack when a minion takes damage
  },
});

// EX1_414 - Warsong Commander
cardScriptsRegistry.register('EX1_414', {
});

// EX1_603 - Cleave
cardScriptsRegistry.register('EX1_603', {
  requirements: {
    [PlayReq.REQ_MINIMUM_ENEMY_MINIONS]: 1,
  },
  play: (ctx: ActionContext) => {
    // Deal 4 damage to two random enemy minions
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];

    if (enemyMinions.length >= 2) {
      // Pick two random minions
      const indices = Array.from({ length: enemyMinions.length }, (_, i) => i);
      const idx1 = Math.floor(Math.random() * indices.length);
      indices.splice(idx1, 1);
      const idx2 = Math.floor(Math.random() * indices.length);

      const target1 = enemyMinions[idx1];
      const target2 = enemyMinions[idx2];

      const { Damage } = require('../actions/damage');
      const damage1 = new Damage(4);
      damage1.trigger(ctx.source, target1);
      const damage2 = new Damage(4);
      damage2.trigger(ctx.source, target2);
    }
  },
});

// EX1_604 - Armorsmith
cardScriptsRegistry.register('EX1_604', {
  events: {
    // TODO: implement events - gain 1 armor when a friendly minion takes damage
  },
});

// CS2_103 - Execute
cardScriptsRegistry.register('CS2_103', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Destroy damaged target minion
    const target = ctx.target as any;
    if ((target.damage || 0) > 0) {
      target.destroyed = true;
    }
  },
});

// CS2_103e - Execute Enchantment
cardScriptsRegistry.register('CS2_103e', {
});

// CS2_104 - Heroic Strike
cardScriptsRegistry.register('CS2_104', {
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

// CS2_105 - Shield Slam
cardScriptsRegistry.register('CS2_105', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 1 damage for each armor
    const controller = (ctx.source as any).controller;
    const armor = controller.hero?.armor || 0;
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(armor);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_108 - Charge
cardScriptsRegistry.register('CS2_108', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give target +2 Attack and Charge
    const { Buff } = require('../actions/buff');
    const buffAction = new Buff('CS2_108e', { ATK: 2 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_114
cardScriptsRegistry.register('CS2_114', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_391
cardScriptsRegistry.register('EX1_391', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_392
cardScriptsRegistry.register('EX1_392', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_400
cardScriptsRegistry.register('EX1_400', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_407
cardScriptsRegistry.register('EX1_407', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_408
cardScriptsRegistry.register('EX1_408', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_409
cardScriptsRegistry.register('EX1_409', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_410
cardScriptsRegistry.register('EX1_410', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_606
cardScriptsRegistry.register('EX1_606', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_607
cardScriptsRegistry.register('EX1_607', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// NEW1_036
cardScriptsRegistry.register('NEW1_036', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// NEW1_036e2
cardScriptsRegistry.register('NEW1_036e2', {
  events: {
    // TODO: implement events
  },
});

// EX1_084
cardScriptsRegistry.register('EX1_084', {
});

// EX1_411
cardScriptsRegistry.register('EX1_411', {
  events: { /* TODO */ },
});
