// dalaran - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DAL_415 - Pick Pocket (Common)
// Add a random card to your hand (Copy it if opponent has a Lackey)
cardScriptsRegistry.register('DAL_415', {
  play: (ctx: ActionContext) => {
    // Add a random card to your hand
  },
});

// DAL_416 - Unidentified Contract (Epic)
// Destroy a minion. Equip a 3/2 Weapon
cardScriptsRegistry.register('DAL_416', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Destroy target minion and equip a 3/2 weapon
    const target = ctx.target;
    if (target) {
      (target as any).destroyed = true;
    }
  },
});

// DAL_417 - Shadow Sculptor (Epic)
// Combo: Add a copy of each card in your hand to your hand
cardScriptsRegistry.register('DAL_417', {
  play: (ctx: ActionContext) => {
    // Combo: Add a copy of each card in your hand to your hand
  },
});

// DAL_714 - EVIL Miscreant (Rare)
// Combo: Add two 1/1 Lackeys to your hand
cardScriptsRegistry.register('DAL_714', {
  play: (ctx: ActionContext) => {
    // Combo: Add two 1/1 Lackeys to your hand
  },
});

// DAL_719 - Myra's Unstable Element (Legendary)
// Draw 5 cards. Any minions drawn cost (0) this turn
cardScriptsRegistry.register('DAL_719', {
  play: (ctx: ActionContext) => {
    // Draw 5 cards. Any minions drawn cost (0) this turn
  },
});

// DAL_366 - Togwaggle's Scheme (Epic)
// Choose a minion. Shuffle copies of it into your deck. (Upgrades each turn)
cardScriptsRegistry.register('DAL_366', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Choose a minion, shuffle copies into deck
  },
});

// DAL_366t1 - King Togwaggle (Legendary)
// Battlecry: Swap decks with your opponent
cardScriptsRegistry.register('DAL_366t1', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Swap decks with opponent
  },
});

// DAL_366t2 - King Togwaggle (Legendary)
// Your opponent draws 7 cards
cardScriptsRegistry.register('DAL_366t2', {
  play: (ctx: ActionContext) => {
    // Your opponent draws 7 cards
  },
});

// DAL_366t3 - King Togwaggle (Legendary)
cardScriptsRegistry.register('DAL_366t3', {
});

// DAL_366t4 - King Togwaggle (Legendary)
cardScriptsRegistry.register('DAL_366t4', {
});

// DAL_716 - SI:7 Infiltrator (Rare)
// Battlecry: If you control a Lackey, destroy a random enemy minion
cardScriptsRegistry.register('DAL_716', {
  play: (ctx: ActionContext) => {
    // If you control a Lackey, destroy a random enemy minion
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
});

// DAL_728 - Anka, the Buried (Rare)
// Battlecry: Transform a friendly minion into a 1/1 with Rush
cardScriptsRegistry.register('DAL_728', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_FRIENDLY_TARGET]: 1,
  },
  play: (ctx: ActionContext) => {
    // Transform a friendly minion into a 1/1 with Rush
  },
});

// DAL_720 - Cursed Castaway (Rare)
// Combo: Add a random Lackey to your hand. Deathrattle: Add a random Lackey to your hand
cardScriptsRegistry.register('DAL_720', {
  play: (ctx: ActionContext) => {
    // Combo: Add a random Lackey to your hand
  },
  deathrattle: (ctx: ActionContext) => {
    // Deathrattle: Add a random Lackey to your hand
  },
});
