// troll - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TRL_096 - High Priest Thekal (Legendary)
// Battlecry: Transform all other minions into 1/1s
cardScriptsRegistry.register('TRL_096', {
  play: (ctx: ActionContext) => {
    // Transform all other minions into 1/1s
  },
});

// TRL_537 - Scepter of Summoning (Legendary)
// Your minions that cost 5 or more cost (5)
cardScriptsRegistry.register('TRL_537', {
  play: (ctx: ActionContext) => {
    // Your minions that cost 5 or more cost (5)
  },
});

// TRL_541 - Gral's Shark (Rare)
// Deathrattle: Add a random Hunter minion to your hand
cardScriptsRegistry.register('TRL_541', {
  deathrattle: (ctx: ActionContext) => {
    // Add a random Hunter minion to your hand
  },
});

// TRL_541t - Gral (Legendary)
// Battlecry: Eat a minion to gain its stats
cardScriptsRegistry.register('TRL_541t', {
  play: (ctx: ActionContext) => {
    // Eat a minion to gain its stats
  },
});

// TRL_542 - Gral'sdir (Legendary)
// Battlecry: Choose a friendly minion to get +2/+2
cardScriptsRegistry.register('TRL_542', {
});

// TRL_564 - Amani War Bear (Rare)
// Rush. Taunt
cardScriptsRegistry.register('TRL_564', {
  play: (ctx: ActionContext) => {
    // Rush. Taunt
  },
});
