// dalaran - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DAL_546 - Khadgar (Legendary)
// Your cards that summon minions summon twice as many
cardScriptsRegistry.register('DAL_546', {
  aura: {
    // Your cards that summon minions summon twice as many
  },
});

// DAL_554 - Whirlwind Tempest (Epic)
// Your minions with "Battlecry" have +1 Attack and Rush
cardScriptsRegistry.register('DAL_554', {
  aura: {
    // Aura: +1 Attack and Rush to all friendly minions with Battlecry
  },
});

// DAL_558 - Prismatic Lens (Rare)
// Draw a minion and a spell. Reduce their Cost by (1)
cardScriptsRegistry.register('DAL_558', {
  play: (ctx: ActionContext) => {
    // Draw a minion and a spell, reduce their cost by 1
    // Simplified: just draw cards
  },
});

// DAL_736 - Dalaran Librarian (Common)
// Battlecry: Silence adjacent minions
cardScriptsRegistry.register('DAL_736', {
  play: (ctx: ActionContext) => {
    // Silence adjacent minions
  },
});

// DAL_752 - Hench-Clan Hogsteed (Common)
// Deathrattle: Summon a 1/1 Squire
cardScriptsRegistry.register('DAL_752', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../actions/summon');
    const summonAction = new Summon('DAL_752t');
    summonAction.trigger(ctx.source);
  },
});

// DAL_752e - Hogsteed's Grant buff
cardScriptsRegistry.register('DAL_752e', {
});

// DAL_752e2 - Squire buff
cardScriptsRegistry.register('DAL_752e2', {
});
