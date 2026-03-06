// dragons - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DRG_049 - Twilight Whelp (Common)
// Battlecry: If you're holding a Dragon, gain +2/+2
cardScriptsRegistry.register('DRG_049', {
  deathrattle: (ctx: ActionContext) => {
    // Deathrattle: Gain +2/+2 if holding a Dragon
  },
  play: (ctx: ActionContext) => {
    // If you're holding a Dragon, gain +2/+2
  },
});

// DRG_050 - Bronze Explorer (Common)
// Battlecry: Discover a Dragon
cardScriptsRegistry.register('DRG_050', {
  play: (ctx: ActionContext) => {
    // Discover a Dragon
  },
});

// DRG_054 - Hoarding Dragon (Common)
// Deathrattle: Give your opponent a Coin
cardScriptsRegistry.register('DRG_054', {
  play: (ctx: ActionContext) => {
    // Give your opponent a Coin
  },
});

// DRG_056 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('DRG_056', {
  aura: {
    // Your other Murlocs have +1 Attack
  },
});

// DRG_057 - Dragonmaw Scuttler (Common)
// Your other Dragons have +1/+1
cardScriptsRegistry.register('DRG_057', {
  events: {
    // Your other Dragons have +1/+1
  },
});

// DRG_058 - Evil Cable Rat (Common)
// Battlecry: Add a 1/1 Lackey to your hand
cardScriptsRegistry.register('DRG_058', {
  play: (ctx: ActionContext) => {
    // Add a 1/1 Lackey to your hand
  },
});

// DRG_059 - Traveling Healer (Common)
// Battlecry: Restore 4 Health
cardScriptsRegistry.register('DRG_059', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Restore 4 Health
  },
});

// DRG_060 - Wyrmguard (Common)
// Battlecry: If you're holding a Dragon, gain +1/+1
cardScriptsRegistry.register('DRG_060', {
  play: (ctx: ActionContext) => {
    // If you're holding a Dragon, gain +1/+1
  },
});
