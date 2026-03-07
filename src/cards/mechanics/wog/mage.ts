// wog - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon, Freeze } from '../../../actions';

// OG_303 - Breath of Sindragosa - Freeze a random enemy minion
cardScriptsRegistry.register('OG_303', {
  events: {
  },
});

// OG_083 - Polymorph - Transform a minion into a 1/1 Sheep
cardScriptsRegistry.register('OG_083', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const morphAction = new Summon(ctx.source, 'OG_083a');
      morphAction.trigger(ctx.source);
      (ctx.target as any).destroyed = true;
    }
  },
});

// OG_085 - Frozen Clone - After your opponent casts a spell, put a copy into your hand
cardScriptsRegistry.register('OG_085', {
  events: {
  },
});

// OG_120 - Anomalus - Deathrattle: Deal 8 damage to all minions
cardScriptsRegistry.register('OG_120', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      const damage = new Damage(source, minion, 8);
      damage.trigger(source);
    }
  },
});

// OG_207 - Steam Surger - Battlecry: Add an Elemental to your hand
cardScriptsRegistry.register('OG_207', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Add random elemental - simplified
  },
});

// OG_087 - Faceless Shambler - Battlecry: Copy a friendly minion
cardScriptsRegistry.register('OG_087', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    if (field.length > 1) {
      const otherMinions = field.filter((m: any) => m !== source);
      if (otherMinions.length > 0) {
        const copy = otherMinions[0];
        const buff = new Buff(source, source, { ATK: (copy as any).attack || 0, HEALTH: (copy as any).health || 0 });
        buff.trigger(source);
      }
    }
  },
});

// OG_081 - Mirror Entity - After your opponent summons a minion, summon a copy
cardScriptsRegistry.register('OG_081', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
  },
});

// OG_090 - Kabal Crystal Runner - Overdraft: Draw a card
cardScriptsRegistry.register('OG_090', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const drawAction = new Draw(source, 1);
    drawAction.trigger(source);
  },
});

// OG_086 - Potion of Polymorph - Give a minion Freeze
cardScriptsRegistry.register('OG_086', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const freeze = new Freeze();
      freeze.trigger(ctx.source, ctx.target);
    }
  },
});
