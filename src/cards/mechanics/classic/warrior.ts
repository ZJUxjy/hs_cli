// classic - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// EX1_398 - Arathi Weaponsmith
cardScriptsRegistry.register('EX1_398', {
  play: (ctx: ActionContext) => {
    // Summon a 4/2 weapon
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('EX1_398t');
    summonAction.trigger(ctx.source);
  },
});

// EX1_402 - Frothing Berserker - Gain +1 Attack whenever a minion takes damage
cardScriptsRegistry.register('EX1_402', {
  events: {
    DAMAGE: (ctx: ActionContext) => {
      const source = ctx.source as any;
      source.attack = (source.attack || 2) + 1;
    },
  },
});

// EX1_414 - Warsong Commander - Your Charge minions have +1 Attack
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

      const { Damage } = require('../../../actions/damage');
      const damage1 = new Damage(4);
      damage1.trigger(ctx.source, target1);
      const damage2 = new Damage(4);
      damage2.trigger(ctx.source, target2);
    }
  },
});

// EX1_604 - Armorsmith - Gain 1 Armor whenever a friendly minion takes damage
cardScriptsRegistry.register('EX1_604', {
  events: {
    DAMAGE: (ctx: ActionContext) => {
      if (ctx.target) {
        const target = ctx.target as any;
        const controller = (ctx.source as any).controller;
        const isFriendly = target.controller === controller;
        if (isFriendly) {
          if (controller.hero) {
            controller.hero.armor = (controller.hero.armor || 0) + 1;
          }
        }
      }
    },
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
    const { Damage } = require('../../../actions/damage');
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
    const { Damage } = require('../../../actions/damage');
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
    const { Buff } = require('../../../actions/buff');
    const buffAction = new Buff('CS2_108e', { ATK: 2 });
    buffAction.trigger(ctx.source, ctx.target!);
  },
});

// CS2_114 - Shield Block - Gain 5 Armor. Draw a card
cardScriptsRegistry.register('CS2_114', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 5;
    }
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// EX1_391 - Slam - Deal 2 damage to a minion. If it survives, draw a card
cardScriptsRegistry.register('EX1_391', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, ctx.target, 2);
      damage.trigger(ctx.source);
      // If target survives, draw a card
      const target = ctx.target as any;
      if (!target.destroyed) {
        const { Draw } = require('../../../actions/draw');
        const drawAction = new Draw(ctx.source, 1);
        drawAction.trigger(ctx.source);
      }
    }
  },
});

// EX1_392 - Battle Rage - Draw a card for each damaged friendly minion
cardScriptsRegistry.register('EX1_392', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    let damagedCount = 0;
    for (const minion of field) {
      if ((minion as any).damage > 0) {
        damagedCount++;
      }
    }
    for (let i = 0; i < damagedCount; i++) {
      const { Draw } = require('../../../actions/draw');
      const drawAction = new Draw(ctx.source, 1);
      drawAction.trigger(ctx.source);
    }
  },
});

// EX1_400 - Whirlwind - Deal 1 damage to ALL minions
cardScriptsRegistry.register('EX1_400', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, minion, 1);
      damage.trigger(ctx.source);
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, minion, 1);
      damage.trigger(ctx.source);
    }
  },
});

// EX1_407 - Brawl - Destroy all minions except one
cardScriptsRegistry.register('EX1_407', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const myField = controller.field || [];
    const oppField = opponent.field || [];
    const allMinions = [...myField, ...oppField];

    if (allMinions.length > 0) {
      // Keep one random minion alive
      const keepIndex = Math.floor(Math.random() * allMinions.length);
      for (let i = 0; i < allMinions.length; i++) {
        if (i !== keepIndex) {
          (allMinions[i] as any).destroyed = true;
        }
      }
    }
  },
});

// EX1_408 - Mortal Strike - Deal 4 damage. If your hero has 12 or less Health, deal 6 instead
cardScriptsRegistry.register('EX1_408', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const controller = (ctx.source as any).controller;
      const heroHealth = controller.hero?.health || 30;
      const damage = heroHealth <= 12 ? 6 : 4;
      const { Damage } = require('../../../actions/damage');
      const dmg = new Damage(ctx.source, ctx.target, damage);
      dmg.trigger(ctx.source);
    }
  },
});

// EX1_409 - Upgrade! - If you have a weapon, give it +1/+1. Otherwise equip a 1/3 weapon
cardScriptsRegistry.register('EX1_409', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Check if hero has a weapon - would need game state
    // For now, just gain armor as fallback
    if (controller.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 1;
    }
  },
});

// EX1_410 - Shieldmaiden - Battlecry: Gain 6 Armor
cardScriptsRegistry.register('EX1_410', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 6;
    }
  },
});

// EX1_606 - Inner Rage - Deal 1 damage to a minion and give it +3 Attack
cardScriptsRegistry.register('EX1_606', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, ctx.target, 1);
      damage.trigger(ctx.source);
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('EX1_607e', { ATK: 3 });
      buff.trigger(ctx.source, ctx.target);
    }
  },
});

// EX1_607 - Rampage - Give a damaged minion +3/+3
cardScriptsRegistry.register('EX1_607', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      if ((target.damage || 0) > 0) {
        const { Buff } = require('../../../actions/buff');
        const buff = new Buff('EX1_607e', { ATK: 3, HEALTH: 3 });
        buff.trigger(ctx.source, ctx.target);
      }
    }
  },
});

// NEW1_036 - Inner Fire - Change a minion's Attack to be equal to its Health
cardScriptsRegistry.register('NEW1_036', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const health = target.health || 1;
      target.attack = health;
    }
  },
});

// NEW1_036e2 - Commanding Shout - Your minions can't be reduced below 1 Health this turn
cardScriptsRegistry.register('NEW1_036e2', {
  events: {
    'TURN_START': (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      // Mark all friendly minions as affected by Commanding Shout
      for (const minion of (controller.field || [])) {
        (minion as any).commandingShout = true;
      }
    },
  },
});

// EX1_084
cardScriptsRegistry.register('EX1_084', {
});

// EX1_411 - Gorehowl - Attack gain +1 Attack each time this attacks a minion
cardScriptsRegistry.register('EX1_411', {
  events: {
    'ATTACK': (ctx: ActionContext) => {
      if (ctx.target) {
        const target = ctx.target as any;
        if ((target as any).type === 'minion') {
          const source = ctx.source as any;
          source.attack = (source.attack || 7) + 1;
        }
      }
    },
  },
});
