// wog - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon } from '../../../actions';

// OG_109 - Renounce Darkness - Trade your Hero Power with a different one
cardScriptsRegistry.register('OG_109', {
  play: (ctx: ActionContext) => {
  },
  deathrattle: (ctx: ActionContext) => {
  },
});

// OG_113 - Chittering Tunneler - Battlecry: Discover a spell. Deal damage to your hero equal to its cost
cardScriptsRegistry.register('OG_113', {
  events: {
  },
});

// OG_121 - Possessed Villager - Deathrattle: Summon a 1/1 Shadowbeast
cardScriptsRegistry.register('OG_121', {
  play: (ctx: ActionContext) => {
  },
});

// OG_121e - Dark Power - Costs Health instead of Mana
cardScriptsRegistry.register('OG_121e', {
  events: {
    // Cost type change is handled by game engine
  },
});

// OG_241 - DOOM! - Destroy all minions
cardScriptsRegistry.register('OG_241', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      (minion as any).destroyed = true;
    }
  },
});

// OG_302 - Lakkari Felhound - Taunt. Battlecry: Discard two random cards
cardScriptsRegistry.register('OG_302', {
  events: {
  },
});

// OG_116 - Corrupted Heal - Restore 5 Health to your hero. Damage dealt by your hero becomes doubled
cardScriptsRegistry.register('OG_116', {
  play: (ctx: ActionContext) => {
  },
});

// OG_118
cardScriptsRegistry.register('OG_118', {
});

// OG_118f - New Calling - Cost reduced
cardScriptsRegistry.register('OG_118f', {
  events: {
    // Cost reduction is handled by game engine
  },
});

// OG_239
cardScriptsRegistry.register('OG_239', {
});

// OG_114 - Spreading Madness - Deal 5 damage to a random enemy minion
cardScriptsRegistry.register('OG_114', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const targets = [...(opponent?.field || [])];
    if (targets.length > 0) {
      const randomTarget = targets[Math.floor(Math.random() * targets.length)];
      const damage = new Damage(source, randomTarget, 5);
      damage.trigger(source);
    }
  },
});
