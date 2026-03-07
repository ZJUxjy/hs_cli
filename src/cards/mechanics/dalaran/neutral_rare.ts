// dalaran - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DAL_058 - Hench-Clan Burglar (Common)
// Battlecry: Add a random Lackey to your hand
cardScriptsRegistry.register('DAL_058', {
  play: (ctx: ActionContext) => {
    // Add a random Lackey to your hand
  },
});

// DAL_081 - Witchy Lackey (Epic)
// Battlecry: Transform a minion into a 0/2 with Taunt
cardScriptsRegistry.register('DAL_081', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Transform a minion into a 0/2 with Taunt
  },
});

// DAL_081e - Witchy Lackey buff
cardScriptsRegistry.register('DAL_081e', {
});

// DAL_434 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('DAL_434', {
});

// DAL_539 - Portal Keeper (Rare)
// Battlecry: Open a portal that summons two 2/1 Demons
cardScriptsRegistry.register('DAL_539', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    // Open a portal that summons two 2/1 Demons
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon(source, 'DAL_539t');
    summon1.trigger(source);
    const summon2 = new Summon(source, 'DAL_539t');
    summon2.trigger(source);
  },
});

// DAL_550 - Fel Lord (Rare)
// Taunt. Battlecry: Destroy a random enemy minion
cardScriptsRegistry.register('DAL_550', {
  events: {
    // Taunt is handled by card data
  },
  play: (ctx: ActionContext) => {
    // Destroy a random enemy minion
  },
});

// DAL_582 - Togwaggle (Legendary)
// Battlecry: Swap decks with your opponent
cardScriptsRegistry.register('DAL_582', {
  play: (ctx: ActionContext) => {
    // Swap decks with your opponent
  },
});

// DAL_582t - King Togwaggle (Legendary)
cardScriptsRegistry.register('DAL_582t', {
});

// DAL_749 - Arcane Dynamo (Rare)
// Battlecry: Discover a spell that costs (5) or more
cardScriptsRegistry.register('DAL_749', {
  deathrattle: (ctx: ActionContext) => {
    // Discover a spell that costs (5) or more
  },
});

// DAL_751 - Safeguard (Rare)
// Deathrattle: Summon a 0/2 with Taunt
cardScriptsRegistry.register('DAL_751', {
  play: (ctx: ActionContext) => {
    // Summon a 0/2 with Taunt
  },
});

// DAL_774 - Vault Safe (Common)
// Taunt. Battlecry: Add a Lackey to your hand
cardScriptsRegistry.register('DAL_774', {
  events: {
    // Taunt is handled by card data
  },
  play: (ctx: ActionContext) => {
    // Add a Lackey to your hand
  },
});

// DAL_775 - Mad Summoner (Rare)
// Battlecry: Summon a random Demon. Give it +2/+2
cardScriptsRegistry.register('DAL_775', {
  deathrattle: (ctx: ActionContext) => {
    // Summon a random Demon with +2/+2
  },
});
