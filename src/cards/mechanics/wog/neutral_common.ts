// wog - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon, Destroy } from '../../../actions';

// OG_281 - Shudderwraith - Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('OG_281', {
  play: (ctx: ActionContext) => {
    // Trigger all friendly minions' Deathrattles - handled by game
  },
});

// OG_283 - Faceless Shambler - Battlecry: Copy a friendly minion
cardScriptsRegistry.register('OG_283', {
  play: (ctx: ActionContext) => {
    // Copy a friendly minion - handled by game
  },
});

// OG_284 - Validated Doomsayer - Battlecry: Gain +5/+5
cardScriptsRegistry.register('OG_284', {
  play: (ctx: ActionContext) => {
    const buff = new Buff(ctx.source, ctx.source, { ATK: 5, HEALTH: 5 });
    buff.trigger(ctx.source);
  },
});

// OG_286 - Darkshire Councilman - After you summon a minion, gain +1 Attack
cardScriptsRegistry.register('OG_286', {
  events: {
    MINION_SUMMON: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      if (ctx.source.controller === controller) {
        const buff = new Buff(ctx.source, ctx.source, { ATK: 1 });
        buff.trigger(ctx.source);
      }
    },
  },
});

// OG_138
cardScriptsRegistry.register('OG_138', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// OG_138e
cardScriptsRegistry.register('OG_138e', {
  events: {
    // TODO: implement events
  },
});

// OG_150
cardScriptsRegistry.register('OG_150', {
});

// OG_151
cardScriptsRegistry.register('OG_151', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// OG_156
cardScriptsRegistry.register('OG_156', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// OG_158
cardScriptsRegistry.register('OG_158', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// OG_249
cardScriptsRegistry.register('OG_249', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// OG_256
cardScriptsRegistry.register('OG_256', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// OG_295
cardScriptsRegistry.register('OG_295', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// OG_323
cardScriptsRegistry.register('OG_323', {
  deathrattle: (ctx: ActionContext) => { /* TODO */ },
});
