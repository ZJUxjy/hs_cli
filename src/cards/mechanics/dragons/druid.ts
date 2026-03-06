// dragons - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DRG_312 - Emerald Explorer (Common)
// Battlecry: Discover a Dragon
cardScriptsRegistry.register('DRG_312', {
  play: (ctx: ActionContext) => {
    // Discover a Dragon
  },
});

// DRG_313 - Emerald Hive Queen (Rare)
// Your minions cost (2) more
cardScriptsRegistry.register('DRG_313', {
  aura: {
    // Your minions cost (2) more
  },
});

// DRG_319 - Adorable Malorne (Rare)
// Deathrattle: Return this to your hand
cardScriptsRegistry.register('DRG_319', {
  play: (ctx: ActionContext) => {
    // Deathrattle: Return this to your hand
  },
});

// DRG_319e4 - Malorne buff
cardScriptsRegistry.register('DRG_319e4', {
});

// DRG_320 - Shredder (Common)
// Deathrattle: Summon two 2/1 Orphans
cardScriptsRegistry.register('DRG_320', {
  play: (ctx: ActionContext) => {
    // Summon two 2/1 Orphans
  },
});

// DRG_320t - Orphan
cardScriptsRegistry.register('DRG_320t', {
});

// DRG_051 - Dragon Roar (Common)
// Add 2 random Dragons to your hand
cardScriptsRegistry.register('DRG_051', {
  play: (ctx: ActionContext) => {
    // Add 2 random Dragons to your hand
  },
});

// DRG_311 - Emerald Dream (Legendary)
// Choose a minion. Your minions attack it, then return to their original positions
cardScriptsRegistry.register('DRG_311', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Your minions attack the target
  },
});

// DRG_311a - Emerald Dream power
cardScriptsRegistry.register('DRG_311a', {
  requirements: {
    // Add requirements
  },
  play: (ctx: ActionContext) => {
    // Choose a minion
  },
});

// DRG_311b - Emerald Dream power
cardScriptsRegistry.register('DRG_311b', {
  requirements: {
    // Add requirements
  },
  play: (ctx: ActionContext) => {
    // Refresh Mana Crystals
  },
});

// DRG_314 - Keeper of the Grove (Rare)
// Battlecry: Transform into a 2/2 with Rush or a 4/4 with Taunt
cardScriptsRegistry.register('DRG_314', {
  play: (ctx: ActionContext) => {
    // Transform into a 2/2 with Rush or a 4/4 with Taunt
  },
});

// DRG_315 - Alexstrasza's Champion (Rare)
// Battlecry: If you're holding a Dragon, gain +1/+1
cardScriptsRegistry.register('DRG_315', {
  play: (ctx: ActionContext) => {
    // If you're holding a Dragon, gain +1/+1
  },
});

// DRG_315e2 - Champion buff
cardScriptsRegistry.register('DRG_315e2', {
});

// DRG_317 - Malorne (Legendary)
// Deathrattle: Return this to your hand
cardScriptsRegistry.register('DRG_317', {
});

// DRG_318 - Cenarius (Legendary)
// Choose - Give your minions +2/+2, or Summon two 2/2 Treants with Taunt
cardScriptsRegistry.register('DRG_318', {
  play: (ctx: ActionContext) => {
    // Choose - Give your minions +2/+2, or Summon two 2/2 Treants with Taunt
  },
});
