// wog - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon } from '../../../actions';

// OG_042 - Deathwing - Battlecry: Destroy all other minions
cardScriptsRegistry.register('OG_042', {
  events: {
  },
});

// OG_122 - Murloc Tidecaller - Battlecry: Give your other Murlocs +1 Attack
cardScriptsRegistry.register('OG_122', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== source && (minion as any).race === 'MURLOC') {
        const buff = new Buff(source, minion, { ATK: 1 });
        buff.trigger(source);
      }
    }
  },
});

// OG_317 - N'Zoth - Battlecry: Summon your deathrattle minions
cardScriptsRegistry.register('OG_317', {
  deathrattle: (ctx: ActionContext) => {
  },
});

// OG_318 - Yogg-Saron - Battlecry: Cast a random spell for each card in your hand
cardScriptsRegistry.register('OG_318', {
  events: {
  },
});

// OG_338 - Y'Shaarj - Battlecry: Put a minion from your deck into the battlefield
cardScriptsRegistry.register('OG_338', {
  events: {
  },
});

// OG_123
cardScriptsRegistry.register('OG_123', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // Buff effect handled by game engine
  },
});

// OG_123e
cardScriptsRegistry.register('OG_123e', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // Buff effect handled by game engine
  },
});

// OG_300 - Shudderwraith - Taunt. Battlecry: Copy a random minion from your hand
cardScriptsRegistry.register('OG_300', {
  events: {
  },
});

// OG_133 - Bog Creeper - Taunt
cardScriptsRegistry.register('OG_133', {
  play: (ctx: ActionContext) => {
  },
});

// OG_134
cardScriptsRegistry.register('OG_134', {
});

// OG_280 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('OG_280', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 2);
        damage.trigger(source);
      }
    }
  },
});

// OG_131 - Soggoth the Slitherer - Taunt. Can't be targeted by spells or Hero Powers
cardScriptsRegistry.register('OG_131', {
  play: (ctx: ActionContext) => {
  },
});
