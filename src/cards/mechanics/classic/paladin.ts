// classic - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// CS2_088 - Blessing of Kings
cardScriptsRegistry.register('CS2_088', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give +4/+4 to target minion
    const { Buff } = require('../actions/buff');
    const buffAction = new Buff('CS2_088e', { ATK: 4, HEALTH: 4 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_362 - Blessing of Wisdom
cardScriptsRegistry.register('EX1_362', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give +1/+2 to target minion
    const { Buff } = require('../actions/buff');
    const buffAction = new Buff('EX1_362e', { ATK: 1, HEALTH: 2 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_382 - Hand of Protection
cardScriptsRegistry.register('EX1_382', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give Divine Shield to target minion
    const { Buff } = require('../actions/buff');
    const buffAction = new Buff('EX1_382e', { DIVINE_SHIELD: 1 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_382e - Hand of Protection Enchantment
cardScriptsRegistry.register('EX1_382e', {
});

// EX1_383 - Humility
cardScriptsRegistry.register('EX1_383', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Set target minion's Attack to 1
    const target = ctx.target as any;
    target.attack = 1;
  },
});

// CS2_087 - Holy Light
cardScriptsRegistry.register('CS2_087', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Restore 6 Health to target
    const { Heal } = require('../actions/heal');
    const healAction = new Heal(6);
    healAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_089 - Light's Justice
cardScriptsRegistry.register('CS2_089', {
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

// CS2_092 - Blessing of Might
cardScriptsRegistry.register('CS2_092', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give +3 Attack to target minion
    const { Buff } = require('../actions/buff');
    const buffAction = new Buff('CS2_092e', { ATK: 3 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_093 - Holy Wrath
cardScriptsRegistry.register('CS2_093', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal damage equal to card's cost
    const cardCost = (ctx.source as any).cost || 0;
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(cardCost);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_094 - Consecration
cardScriptsRegistry.register('CS2_094', {
  play: (ctx: ActionContext) => {
    // Deal 2 damage to all enemies
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;

    // Deal 2 damage to enemy hero
    const { Damage } = require('../actions/damage');
    const damageHero = new Damage(2);
    damageHero.trigger(ctx.source, opponent.hero);

    // Deal 2 damage to enemy minions
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const damageMinion = new Damage(2);
      damageMinion.trigger(ctx.source, minion);
    }
  },
});

// EX1_349 - Forgotten Torch
cardScriptsRegistry.register('EX1_349', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 3 damage
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(3);
    damageAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_354 - Humble Blessing
cardScriptsRegistry.register('EX1_354', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give +4/+4 to target, but it loses Taunt
    const { Buff } = require('../actions/buff');
    const buffAction = new Buff('EX1_354e', { ATK: 4, HEALTH: 4 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_355 - Blessing of Kings
cardScriptsRegistry.register('EX1_355', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Give +4/+4 to target minion
    const { Buff } = require('../actions/buff');
    const buffAction = new Buff('EX1_355e', { ATK: 4, HEALTH: 4 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// EX1_355e - Blessing of Kings Enchantment
cardScriptsRegistry.register('EX1_355e', {
});

// EX1_360 - Eye for an Eye
cardScriptsRegistry.register('EX1_360', {
  play: (ctx: ActionContext) => {
    // Secret: When your hero takes damage, deal that much damage to the enemy hero
    // This is handled by events
  },
});

// EX1_360e - Eye for an Eye Enchantment
cardScriptsRegistry.register('EX1_360e', {
});

// EX1_363 - Redemption
cardScriptsRegistry.register('EX1_363', {
  play: (ctx: ActionContext) => {
    // Secret: When a friendly minion dies, return it to life with 1 Health
    // This is handled by events
  },
});

// EX1_363e2
cardScriptsRegistry.register('EX1_363e2', {
  events: {
    // TODO: implement events
  },
});

// EX1_365 - Holy Wrath - Deal 5 damage. Draw a card
cardScriptsRegistry.register('EX1_365', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(5);
      damageAction.trigger(ctx.source, ctx.target);
    }
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// EX1_371 - Hand of Protection - Give a minion Divine Shield
cardScriptsRegistry.register('EX1_371', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.divineShield = true;
    }
  },
});

// EX1_384 - Avenging Wrath - Deal 6 damage randomly split among enemy characters
cardScriptsRegistry.register('EX1_384', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const targets: any[] = [...(opponent.field || [])];
    if (opponent.hero) targets.push(opponent.hero);

    // Deal 1 damage 6 times randomly
    for (let i = 0; i < 6; i++) {
      if (targets.length === 0) break;
      const randomIndex = Math.floor(Math.random() * targets.length);
      const target = targets[randomIndex];
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(1);
      damageAction.trigger(ctx.source, target);
      // Remove if destroyed
      if ((target as any).destroyed) {
        targets.splice(randomIndex, 1);
      }
    }
  },
});

// EX1_619 - Equality - Change the Health of all minions to 1
cardScriptsRegistry.register('EX1_619', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent.field || [])];
    for (const minion of allMinions) {
      (minion as any).health = 1;
      (minion as any).maxHealth = 1;
    }
  },
});

// EX1_619e
cardScriptsRegistry.register('EX1_619e', {
});

// EX1_130
cardScriptsRegistry.register('EX1_130', {
});

// EX1_132
cardScriptsRegistry.register('EX1_132', {
});

// EX1_136
cardScriptsRegistry.register('EX1_136', {
});

// EX1_379
cardScriptsRegistry.register('EX1_379', {
});

// EX1_379e
cardScriptsRegistry.register('EX1_379e', {
});

// CS2_097
cardScriptsRegistry.register('CS2_097', {
  events: {
    // TODO: implement events
  },
});

// EX1_366
cardScriptsRegistry.register('EX1_366', {
  events: {
    // TODO: implement events
  },
});

// EX1_184
cardScriptsRegistry.register('EX1_184', {
  play: (ctx: ActionContext) => { /* TODO */ },
});
