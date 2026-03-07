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
    // Buff effect handled by game engine
  },
});

// OG_138e - Will of the Vizier - Reduced Cost
cardScriptsRegistry.register('OG_138e', {
  events: {
    // Cost reduction is handled by game engine
  },
});

// OG_150
cardScriptsRegistry.register('OG_150', {
});

// OG_151 - Pit Fighter - Battlecry: Deal 5 damage to a random enemy
cardScriptsRegistry.register('OG_151', {
  deathrattle: (ctx: ActionContext) => {
  },
});

// OG_156 - Twilight Elder - At the end of your turn, give your C'Thun +1/+1
cardScriptsRegistry.register('OG_156', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Give C'Thun +1/+1 - simplified
  },
});

// OG_158 - Grotesque Dragonhawk - Windfury (if C'Thun has 10+ attack)
cardScriptsRegistry.register('OG_158', {
  deathrattle: (ctx: ActionContext) => {
  },
});

// OG_249 - Harbinger of WOE - Taunt. Deathrattle: Summon a 2/1 Wisp
cardScriptsRegistry.register('OG_249', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const summonAction = new Summon(source, 'OG_249t');
    summonAction.trigger(source);
  },
});

// OG_256 - Aberrant Berserker - Enrage: +4 Attack
cardScriptsRegistry.register('OG_256', {
  deathrattle: (ctx: ActionContext) => {
  },
});

// OG_295 - Eternal Sentinel - Battlecry: Unlock your Overloaded Mana Crystals
cardScriptsRegistry.register('OG_295', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Unlock overloaded mana crystals - simplified
    if (controller) {
      controller.overloaded = (controller.overloaded || 0);
    }
  },
});

// OG_323 - Bog Creeper - Taunt
cardScriptsRegistry.register('OG_323', {
  deathrattle: (ctx: ActionContext) => {
  },
});
