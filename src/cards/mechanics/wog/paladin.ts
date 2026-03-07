// wog - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon, Heal } from '../../../actions';
import type { Entity } from '../../../core/entity';

// OG_006 - Forbidden Healing - Spend all your Mana. Heal that much
cardScriptsRegistry.register('OG_006', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const manaSpent = controller.currentMana || 0;
    if (ctx.target && manaSpent > 0) {
      const heal = new Heal(ctx.source, ctx.target, manaSpent);
      heal.trigger(ctx.source);
    }
    controller.currentMana = 0;
  },
});

// OG_006b - The Tidal Hand - Summon a 1/1 Murloc
cardScriptsRegistry.register('OG_006b', {
  play: (ctx: ActionContext) => {
    const summon = new Summon(ctx.source, 'CS2_101');
    summon.trigger(ctx.source);
  },
});

// OG_221 - Competitive Spirit - Battlecry: Give your minions +1/+1
cardScriptsRegistry.register('OG_221', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      const buff = new Buff(source, minion, { ATK: 1, HEALTH: 1 });
      buff.trigger(source);
    }
  },
});

// OG_229 - Ragnaros - Lightlord - Taunt. At the end of your turn, restore 8 health to your hero
cardScriptsRegistry.register('OG_229', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const hero = (controller as any)?.hero;
      if (hero) {
        const heal = new Heal(source, hero, 8);
        heal.trigger(source);
      }
    },
  },
});

// OG_310 - Stand Against Darkness - Summon three 1/1 Silver Hand Recruits
cardScriptsRegistry.register('OG_310', {
  events: {
  },
});

// OG_223 - A Light in the Darkness - Discover a minion. Give it +1/+1
cardScriptsRegistry.register('OG_223', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
  },
});

// OG_273 - Light's Sorrow - At the end of your turn, give a friendly minion +1 Attack
cardScriptsRegistry.register('OG_273', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
  },
});

// OG_311 - Wickerflame Burnbristle - Taunt. Divine Shield. Damage dealing events trigger twice
cardScriptsRegistry.register('OG_311', {
  play: (ctx: ActionContext) => {
  },
});

// OG_222 - Grimestreet Protector - Battlecry: Give adjacent minions Taunt
cardScriptsRegistry.register('OG_222', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    const idx = field.indexOf(source);
    if (idx > 0) {
      const buff = new Buff(source, field[idx - 1], { TAUNT: 1 });
      buff.trigger(source);
    }
    if (idx < field.length - 1) {
      const buff = new Buff(source, field[idx + 1], { TAUNT: 1 });
      buff.trigger(source);
    }
  },
});

// OG_198 - Grimestreet Enforcer - At the end of your turn, give all minions in your hand +1/+1
cardScriptsRegistry.register('OG_198', {
  play: (ctx: ActionContext) => {
  },
});
