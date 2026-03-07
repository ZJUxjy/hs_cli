// outlands - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Heal, Summon, Destroy, Give } from '../../../actions';
import { Race } from '../../../enums';

// BT_106 - Serpentstone - Deal 3 damage. Quest: Play 3 spells with different names
cardScriptsRegistry.register('BT_106', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// BT_109 - Totem Cruncher - Taunt. Deathrattle: Summon a 2/1 Cruncher with Taunt
cardScriptsRegistry.register('BT_109', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'BT_109t');
    summon.trigger(ctx.source);
  },
});

// BT_109t - Cruncher (token)
cardScriptsRegistry.register('BT_109t', {
  play: (ctx: ActionContext) => {
    // 2/1 Taunt minion
  },
});

// BT_109te - Cruncher enchantment
cardScriptsRegistry.register('BT_109te', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Periodically grows - simplified
    },
  },
});

// BT_114 - Vivid Spores - Choose a minion. Your other minions get +1/+1
cardScriptsRegistry.register('BT_114', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const controller = (ctx.source as any).controller;
      const field = controller.field || [];
      for (const minion of field) {
        if (minion !== ctx.target) {
          const buff = new Buff(ctx.source, minion, { ATK: 1, HEALTH: 1 });
          buff.trigger(ctx.source);
        }
      }
    }
  },
});

// BT_115 - Shudderwraith - Battlecry: Deal 3 damage
cardScriptsRegistry.register('BT_115', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Deal 3 damage to a random enemy
    const enemyMinions = opponent.field || [];
    if (enemyMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * enemyMinions.length);
      const target = enemyMinions[randomIndex];
      const damage = new Damage(ctx.source, target, 3);
      damage.trigger(ctx.source);
    } else if (opponent.hero) {
      const damage = new Damage(ctx.source, opponent.hero, 3);
      damage.trigger(ctx.source);
    }
  },
});

// BT_230 - Boggspine Knuckles - Battlecry: Give a friendly minion +5 Attack
cardScriptsRegistry.register('BT_230', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
});

// BT_100 - Furious Ettin - Taunt. Battlecry: Deal 6 damage
cardScriptsRegistry.register('BT_100', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 6);
      damage.trigger(ctx.source);
    }
  },
});

// BT_101 - Lady of the Lake - Battlecry: Add a 'Lake' spell to your hand
cardScriptsRegistry.register('BT_101', {
  play: (ctx: ActionContext) => {
    // Add a spell to hand - simplified
  },
});

// BT_101e - Lake enchantment
cardScriptsRegistry.register('BT_101e', {
  deathrattle: (ctx: ActionContext) => {
    // Return to hand effect
  },
});

// BT_110 - Sand Drudge - Battlecry: Summon two 1/1 Scarabs
cardScriptsRegistry.register('BT_110', {
  requirements: {
    [PlayReq.REQ_NUM_MINION_SLOTS]: 1,
  },
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon(ctx.source, 'BT_110t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon(ctx.source, 'BT_110t');
    summon2.trigger(ctx.source);
  },
});

// BT_113 - Weaponized Wasp - Battlecry: Deal 3 damage
cardScriptsRegistry.register('BT_113', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// BT_102 - Swampqueen Hagaga - Battlecry: Deal 1 damage
cardScriptsRegistry.register('BT_102', {
  events: {
    SPELL_PLAY: (ctx: ActionContext) => {
      const source = ctx.source as any;
      // After casting a spell, deal 1 damage
      const controller = source.controller;
      const opponent = controller.opponent;
      const targets = [...(opponent.field || [])];
      if (opponent.hero) targets.push(opponent.hero);
      if (targets.length > 0) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        const damage = new Damage(source, target, 1);
        damage.trigger(source);
      }
    },
  },
});
