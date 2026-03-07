// wog - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon, Heal } from '../../../actions';

// OG_096 - Embrace the Shadow - Your healing effects deal damage instead
cardScriptsRegistry.register('OG_096', {
  play: (ctx: ActionContext) => {
  },
});

// OG_334 - Spawn of N'Zoth - Deathrattle: Give your minions +1/+1
cardScriptsRegistry.register('OG_334', {
  events: {
  },
});

// OG_234 - Shadow Word: Horror - Destroy all minions with 2 or less Attack
cardScriptsRegistry.register('OG_234', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    // Destroy all minions with 2 or less attack
    const allMinions = [...(controller.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      if ((minion as any).attack <= 2) {
        (minion as any).destroyed = true;
      }
    }
  },
});

// OG_335 - Faceless Shambler - Taunt
cardScriptsRegistry.register('OG_335', {
  deathrattle: (ctx: ActionContext) => {
  },
});

// OG_316 - Embrace Darkness - Choose a minion. It sleeps for 3 turns
cardScriptsRegistry.register('OG_316', {
  play: (ctx: ActionContext) => {
  },
});

// OG_316k
cardScriptsRegistry.register('OG_316k', {
});

// OG_104 - Power Word: Tentacles - Give a minion +2/+2
cardScriptsRegistry.register('OG_104', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// OG_104e
cardScriptsRegistry.register('OG_104e', {
});

// OG_094 - Shadow Word: Death - Destroy a minion with 5 or more Attack
cardScriptsRegistry.register('OG_094', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).destroyed = true;
    }
  },
});

// OG_100 - Forbidden Shaping - Spend all your mana. Summon a random minion with that cost
cardScriptsRegistry.register('OG_100', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const manaSpent = controller.currentMana || 0;
    if (manaSpent > 0) {
      // Summon random minion with that cost - simplified
      controller.currentMana = 0;
    }
  },
});

// OG_101 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('OG_101', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    // Deal 2 damage to all other minions
    const allMinions = [...(controller.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 2);
        damage.trigger(source);
      }
    }
  },
});
