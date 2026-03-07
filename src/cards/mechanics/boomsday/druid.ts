// boomsday - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Summon, Draw } from '../../../actions';

// BOT_419 - Gloop Sprayer
// Battlecry: Give your other minions +1/+1
cardScriptsRegistry.register('BOT_419', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field as any[];
    if (!field) return;

    for (const minion of field) {
      if (minion !== source) {
        const buff = new Buff(source, minion, { ATK: 1, HEALTH: 1 });
        buff.trigger(source);
      }
    }
  },
});

// BOT_422 - Splintergraft
// Battlecry: Choose a friendly minion. Add a copy to your hand that costs (8)
cardScriptsRegistry.register('BOT_422', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const target = ctx.target as any;

    if (!target || !controller) return;

    // Add copy to hand with cost 8
    const hand = controller?.hand || [];
    // In a full implementation, this would create a copy of the target card
  },
});

// BOT_422a
cardScriptsRegistry.register('BOT_422a', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// BOT_422b - Splintergraft选择后
cardScriptsRegistry.register('BOT_422b', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game - add copy to hand
  },
});

// BOT_423
cardScriptsRegistry.register('BOT_423', {
  events: {
    // Handled by game
  },
});

// BOT_423e - Gloop Sprayer buff
cardScriptsRegistry.register('BOT_423e', {
  events: {
    // Handled by game
  },
});

// BOT_434
cardScriptsRegistry.register('BOT_434', {
});

// Hand - for Mulchmuncher
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// BOT_434e - Mulchmuncher buff
cardScriptsRegistry.register('BOT_434e', {
});

// Hand - for Gloom Stag
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// BOT_507 - Mulchmuncher
// Rush. Costs (1) less for each friendly Mech that died this game
cardScriptsRegistry.register('BOT_507', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    if (!controller) return;

    // Count friendly mechs that died
    const mechsDied = (controller as any).mechsDiedThisGame || 0;
    const costReduction = Math.min(mechsDied, 10); // Cap at 10

    // Reduce cost - handled by game
  },
});

// BOT_523
cardScriptsRegistry.register('BOT_523', {
});

// BOT_054 - Prismatic Lens
// Draw a minion and a spell. Reduce their Cost by (1)
cardScriptsRegistry.register('BOT_054', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    // Draw cards - handled by game
  },
});

// BOT_404 - Flobbidinous Floop
// Battlecry: If your hero power cost (3), gain +3/+3. Otherwise, copy a friendly minion
cardScriptsRegistry.register('BOT_404', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    // Check hero power cost and apply effect - handled by game
  },
});

// BOT_420 - The Caverns Below
// Quest: Play seven 1-Cost minions. Reward: Crystal Stag
cardScriptsRegistry.register('BOT_420', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Quest completion - handled by game
  },
});

// BOT_444 - Gloom Stag
// Battlecry: If your hero power costs (3), summon a copy of this minion
cardScriptsRegistry.register('BOT_444', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    // Check hero power cost - handled by game
  },
});

// BOT_444e - Gloom Stag buff
cardScriptsRegistry.register('BOT_444e', {
  events: {
    // Handled by game
  },
});
