// uldum - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// ULD_207 - Candlebreaker (Common)
// Your Candles cost (1) less
cardScriptsRegistry.register('ULD_207', {
  aura: {
    // Your Candles cost (1) less
  },
});

// ULD_209 - Wrapped Murloc (Common)
// Deathrattle: Add a 1/1 Murloc to your hand
cardScriptsRegistry.register('ULD_209', {
  play: (ctx: ActionContext) => {
    // Add a 1/1 Murloc to your hand
  },
});

// ULD_229 - Mortarbite (Epic)
// Battlecry: Add a "BOOM!" bot to your hand
cardScriptsRegistry.register('ULD_229', {
  play: (ctx: ActionContext) => {
    // Add a "BOOM!" bot to your hand
  },
});

// ULD_290 - Pharaoh's Blessing (Rare)
// Give a minion +8/+8. Divine Shield
cardScriptsRegistry.register('ULD_290', {
  events: {
    // Give a minion +8/+8 and Divine Shield
  },
});

// ULD_309 - Plague of Wrath (Rare)
// Destroy all minions. (Cards that didn't start in your deck restore 5 Health instead)
cardScriptsRegistry.register('ULD_309', {
  events: {
    // Destroy all minions
  },
});

// ULD_309e - Plague of Wrath buff
cardScriptsRegistry.register('ULD_309e', {
  events: {
    // ???
  },
});

// ULD_702 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('ULD_702', {
  events: {
    // Battlecry: Trigger all friendly minions' Deathrattles
  },
});

// ULD_703 - Tortollan Pilgrim (Rare)
// Battlecry: Discover a minion from your deck
cardScriptsRegistry.register('ULD_703', {
  events: {
    // Discover a minion from your deck
  },
});

// ULD_705 - Sunreaver Spy (Rare)
// Battlecry: If you control a Secret, gain +1/+1
cardScriptsRegistry.register('ULD_705', {
  play: (ctx: ActionContext) => {
    // If you control a Secret, gain +1/+1
  },
});

// ULD_705t - ???
cardScriptsRegistry.register('ULD_705t', {
  events: {
    // ???
  },
});

// ULD_706 - Wrapped Murloc (Common)
// Deathrattle: Add a 1/1 Murloc to your hand
cardScriptsRegistry.register('ULD_706', {
  deathrattle: (ctx: ActionContext) => {
    // Add a 1/1 Murloc to your hand
  },
});

// ULD_727 - Sunreaver Spy (Rare)
// Battlecry: If you control a Secret, gain +1/+1
cardScriptsRegistry.register('ULD_727', {
  play: (ctx: ActionContext) => {
    // If you control a Secret, gain +1/+1
  },
});
