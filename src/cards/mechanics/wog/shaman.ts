// wog - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon, Freeze } from '../../../actions';

// OG_023 - Evolve - Transform your minions into ones that cost (1) more
cardScriptsRegistry.register('OG_023', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Evolve all minions - simplified
  },
});

// OG_026 - Thing from Below - Taunt. Costs (1) less for each Totem you've summoned this game
cardScriptsRegistry.register('OG_026', {
  play: (ctx: ActionContext) => {
  },
});

// OG_209 - Hammer of Twilight - Deathrattle: Summon a 4/2 Elemental
cardScriptsRegistry.register('OG_209', {
  events: {
  },
});

// OG_328 - Murloc Tidecaller - After you summon a Murloc, gain +1 Attack
cardScriptsRegistry.register('OG_328', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
  },
});

// OG_028
cardScriptsRegistry.register('OG_028', {
});

// OG_027 - Primalfin Totem - At the end of your turn, summon a 1/1 Murloc
cardScriptsRegistry.register('OG_027', {
  play: (ctx: ActionContext) => {
  },
});

// OG_206 - Fire Elemental - Battlecry: Deal 3 damage
cardScriptsRegistry.register('OG_206', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// OG_031 - Siltfin Spiritwalker - Deathrattle: Give your minions +2/+1
cardScriptsRegistry.register('OG_031', {
  deathrattle: (ctx: ActionContext) => {
  },
});
