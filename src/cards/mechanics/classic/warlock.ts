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
    const { Damage } = require('../../../actions/damage');
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
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source, 1);
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
    const { Damage } = require('../../../actions/damage');
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
    const { Damage } = require('../../../actions/damage');
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
    const { Heal } = require('../../../actions/heal');
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

    const { Damage } = require('../../../actions/damage');

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

// CS2_061 - Drain Life - Deal 2 damage. Restore 2 Health to your hero
cardScriptsRegistry.register('CS2_061', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(ctx.source, ctx.target);
    }
    const controller = (ctx.source as any).controller;
    const hero = controller.hero;
    if (hero) {
      const { Heal } = require('../../../actions/heal');
      const healAction = new Heal(2);
      healAction.trigger(ctx.source, hero);
    }
  },
});

// CS2_062 - Hellfire - Deal 3 damage to ALL characters
cardScriptsRegistry.register('CS2_062', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;

    // Damage all friendly characters
    const friendlyHero = controller.hero;
    if (friendlyHero) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(3);
      damageAction.trigger(ctx.source, friendlyHero);
    }
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(3);
      damageAction.trigger(ctx.source, minion);
    }

    // Damage all enemy characters
    const enemyHero = opponent.hero;
    if (enemyHero) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(3);
      damageAction.trigger(ctx.source, enemyHero);
    }
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(3);
      damageAction.trigger(ctx.source, minion);
    }
  },
});

// CS2_063 - Corruption - Choose an enemy minion. At the start of your turn, destroy it
cardScriptsRegistry.register('CS2_063', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_ENEMY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      // Add delayed destroy effect
      (target as any).corruption = true;
    }
  },
});

// CS2_063e - Corruption Enchantment
cardScriptsRegistry.register('CS2_063e', {
});

// CS2_057 - Shadow Bolt - Deal 4 damage to a minion
cardScriptsRegistry.register('CS2_057', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(4);
      damageAction.trigger(ctx.source, ctx.target);
    }
  },
});

// EX1_302 - Mortal Coil - Deal 1 damage. If that kills the minion, draw a card
cardScriptsRegistry.register('EX1_302', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(1);
      damageAction.trigger(ctx.source, target);
      // If killed, draw a card
      if ((target.health || 1) <= 1) {
        const { Draw } = require('../../../actions/draw');
        const drawAction = new Draw(ctx.source);
        drawAction.trigger(ctx.source);
      }
    }
  },
});

// EX1_303 - Shadowflame - Destroy a minion and deal its Attack damage to all enemy minions
cardScriptsRegistry.register('EX1_303', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const attackDamage = target.attack || 0;

      // Destroy target
      const { Destroy } = require('../../../actions/destroy');
      const destroyAction = new Destroy();
      destroyAction.trigger(ctx.source, target);

      // Deal damage to all enemy minions
      const controller = (ctx.source as any).controller;
      const opponent = controller.opponent;
      const enemyMinions = opponent.field || [];
      for (const minion of enemyMinions) {
        const { Damage } = require('../../../actions/damage');
        const damageAction = new Damage(attackDamage);
        damageAction.trigger(ctx.source, minion);
      }
    }
  },
});

// EX1_308 - Soulfire - Deal 4 damage. Discard a random card
cardScriptsRegistry.register('EX1_308', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(4);
      damageAction.trigger(ctx.source, ctx.target);
    }
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    if (hand.length > 0) {
      const randomIndex = Math.floor(Math.random() * hand.length);
      const card = hand[randomIndex];
      // Discard random card
      (controller as any).hand = hand.filter((c: any) => c !== card);
    }
  },
});

// EX1_309 - Siphon Soul - Destroy a minion. Restore 3 Health to your hero
cardScriptsRegistry.register('EX1_309', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Destroy } = require('../../../actions/destroy');
      const destroyAction = new Destroy();
      destroyAction.trigger(ctx.source, ctx.target);
    }
    const controller = (ctx.source as any).controller;
    const hero = controller.hero;
    if (hero) {
      const { Heal } = require('../../../actions/heal');
      const healAction = new Heal(3);
      healAction.trigger(ctx.source, hero);
    }
  },
});

// EX1_312 - Twisting Nether - Destroy all minions
cardScriptsRegistry.register('EX1_312', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;

    // Destroy all friendly minions
    const friendlyMinions = controller.field || [];
    for (const minion of friendlyMinions) {
      const { Destroy } = require('../../../actions/destroy');
      const destroyAction = new Destroy();
      destroyAction.trigger(ctx.source, minion);
    }

    // Destroy all enemy minions
    const enemyMinions = opponent.field || [];
    for (const minion of enemyMinions) {
      const { Destroy } = require('../../../actions/destroy');
      const destroyAction = new Destroy();
      destroyAction.trigger(ctx.source, minion);
    }
  },
});

// EX1_316 - Power Overwhelming - Give a minion +4/+4 until end of turn
cardScriptsRegistry.register('EX1_316', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('EX1_316e', { ATK: 4, HEALTH: 4 });
      buffAction.trigger(ctx.source, ctx.target);
    }
  },
});

// EX1_316e - Power Overwhelming Enchantment
cardScriptsRegistry.register('EX1_316e', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Destroy at end of turn
      const source = ctx.source as any;
      if (source && source.zone === 'PLAY') {
        const { Destroy } = require('../../../actions/destroy');
        const destroyAction = new Destroy();
        destroyAction.trigger(ctx.source, source);
      }
    },
  },
});

// EX1_317 - Sense Demons - Put 2 random Demons from your deck into your hand
cardScriptsRegistry.register('EX1_317', {
  play: (ctx: ActionContext) => {
    // In a full implementation, this would find random Demons from deck
    console.log('Sense Demons: Add 2 random Demons to hand');
  },
});

// EX1_320 - Bane of Doom - Deal 2 damage to a character. If this kills it, summon a random Demon
cardScriptsRegistry.register('EX1_320', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(ctx.source, target);
      // If kills, summon a Demon
      if ((target.health || 1) <= 2) {
        const demons = ['CS2_059', 'CS2_057', 'EX1_301'];
        const randomDemon = demons[Math.floor(Math.random() * demons.length)];
        const { Summon } = require('../../../actions/summon');
        const summonAction = new Summon(randomDemon);
        summonAction.trigger(ctx.source);
      }
    }
  },
});

// EX1_596 - Demonfire - Deal 2 damage to a minion. If it's a Demon, give it +2/+2
cardScriptsRegistry.register('EX1_596', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(ctx.source, target);

      // If it's a Demon, give +2/+2
      if ((target as any).race === 'DEMON') {
        const { Buff } = require('../../../actions/buff');
        const buffAction = new Buff('EX1_596e', { ATK: 2, HEALTH: 2 });
        buffAction.trigger(ctx.source, target);
      }
    }
  },
});

// NEW1_003 - Sacrificial Pact - Destroy a Demon. Restore 5 Health to your hero
cardScriptsRegistry.register('NEW1_003', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      if ((target as any).race === 'DEMON') {
        const { Destroy } = require('../../../actions/destroy');
        const destroyAction = new Destroy();
        destroyAction.trigger(ctx.source, target);
      }
    }
    const controller = (ctx.source as any).controller;
    const hero = controller.hero;
    if (hero) {
      const { Heal } = require('../../../actions/heal');
      const healAction = new Heal(5);
      healAction.trigger(ctx.source, hero);
    }
  },
});

// EX1_181 - Call of the Void - Add a random Demon to your hand
cardScriptsRegistry.register('EX1_181', {
  play: (ctx: ActionContext) => {
    // In a full implementation, this would add a random Demon
    console.log('Call of the Void: Add random Demon to hand');
  },
});

// EX1_185
cardScriptsRegistry.register('EX1_185', {
});
