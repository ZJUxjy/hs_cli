// classic - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// CS2_059 - Life Tap
cardScriptsRegistry.register('CS2_059', {
  events: {
    // Hero power triggers damage to self and draw
  },
});

// CS2_064 - Hellfire
cardScriptsRegistry.register('CS2_064', {
  play: (ctx: ActionContext) => {
    // Deal 3 damage to ALL characters
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;

    // Damage to enemy hero
    const { Damage } = require('../actions/damage');
    const damageHero = new Damage(3);
    damageHero.trigger(ctx.source, opponent.hero);

    // Damage to friendly hero
    const damageFriendlyHero = new Damage(3);
    damageFriendlyHero.trigger(ctx.source, controller.hero);

    // Damage to enemy minions
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const damageMinion = new Damage(3);
      damageMinion.trigger(ctx.source, minion);
    }

    // Damage to friendly minions
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      const damageMinion = new Damage(3);
      damageMinion.trigger(ctx.source, minion);
    }
  },
});

// EX1_301 - Sense Demons
cardScriptsRegistry.register('EX1_301', {
  play: (ctx: ActionContext) => {
    // Put two random Demons from your deck into your hand
    // In this implementation, just draw cards
    const { Draw } = require('../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// EX1_304 - Void Walker
cardScriptsRegistry.register('EX1_304', {
  play: (ctx: ActionContext) => {
    // Deal 3 damage to enemy hero
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(3);
    damageAction.trigger(ctx.source, opponent.hero);
  },
});

// EX1_306 - Felguard
cardScriptsRegistry.register('EX1_306', {
  play: (ctx: ActionContext) => {
    // Destroy a random enemy minion
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const enemyMinions = opponent.field || [];

    if (enemyMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * enemyMinions.length);
      const target = enemyMinions[randomIndex];
      (target as any).destroyed = true;
    }
  },
});

// EX1_310 - Soulfire
cardScriptsRegistry.register('EX1_310', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Deal 4 damage, discard a random card
    const { Damage } = require('../actions/damage');
    const damageAction = new Damage(4);
    damageAction.trigger(ctx.source, ctx.target!);

    // Discard random card
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    if (hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * hand.length);
      hand.splice(randomIndex, 1);
    }
  },
});

// EX1_313 - Siphon Soul
cardScriptsRegistry.register('EX1_313', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Destroy target minion, restore 3 health to your hero
    const target = ctx.target as any;
    target.destroyed = true;

    // Heal hero
    const controller = (ctx.source as any).controller;
    const { Heal } = require('../actions/heal');
    const healAction = new Heal(3);
    healAction.trigger(ctx.source, controller.hero);
  },
});

// EX1_315 - Pit Lord
cardScriptsRegistry.register('EX1_315', {
});

// EX1_319 - Corruption
cardScriptsRegistry.register('EX1_319', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Destroy enemy minion at the start of your turn
    const target = ctx.target as any;
    target.destroyed = true;
  },
});

// EX1_323 - Dread Infernal
cardScriptsRegistry.register('EX1_323', {
  play: (ctx: ActionContext) => {
    // Deal 1 damage to ALL characters
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;

    const { Damage } = require('../actions/damage');

    // Damage to enemy hero
    const damageHero = new Damage(1);
    damageHero.trigger(ctx.source, opponent.hero);

    // Damage to friendly hero
    const damageFriendlyHero = new Damage(1);
    damageFriendlyHero.trigger(ctx.source, controller.hero);

    // Damage to enemy minions
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const damageMinion = new Damage(1);
      damageMinion.trigger(ctx.source, minion);
    }

    // Damage to friendly minions
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      const damageMinion = new Damage(1);
      damageMinion.trigger(ctx.source, minion);
    }
  },
});

// EX1_tk33 - Flame Imp
cardScriptsRegistry.register('EX1_tk33', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// CS2_061
cardScriptsRegistry.register('CS2_061', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// CS2_062
cardScriptsRegistry.register('CS2_062', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// CS2_063
cardScriptsRegistry.register('CS2_063', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// CS2_063e
cardScriptsRegistry.register('CS2_063e', {
  events: {
    // TODO: implement events
  },
});

// CS2_057
cardScriptsRegistry.register('CS2_057', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_302
cardScriptsRegistry.register('EX1_302', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_303
cardScriptsRegistry.register('EX1_303', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_308
cardScriptsRegistry.register('EX1_308', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_309
cardScriptsRegistry.register('EX1_309', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_312
cardScriptsRegistry.register('EX1_312', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_316
cardScriptsRegistry.register('EX1_316', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_316e
cardScriptsRegistry.register('EX1_316e', {
  events: {
    // TODO: implement events
  },
});

// EX1_317
cardScriptsRegistry.register('EX1_317', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_320
cardScriptsRegistry.register('EX1_320', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_596
cardScriptsRegistry.register('EX1_596', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// NEW1_003
cardScriptsRegistry.register('NEW1_003', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_181
cardScriptsRegistry.register('EX1_181', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// EX1_185
cardScriptsRegistry.register('EX1_185', {
});
