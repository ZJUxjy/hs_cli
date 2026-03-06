// dragons - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DRG_090 - Murozond (Legendary)
// Battlecry: Gain an empty Mana Crystal for each minion you control
cardScriptsRegistry.register('DRG_090', {
  play: (ctx: ActionContext) => {
    // Gain an empty Mana Crystal for each minion you control
  },
});

// DRG_300 - Darkshire Councilman (Rare)
// After you play a minion, give it +1/+1
cardScriptsRegistry.register('DRG_300', {
  play: (ctx: ActionContext) => {
    // After you play a minion, give it +1/+1
  },
});

// DRG_300e - Darkshire Councilman buff
cardScriptsRegistry.register('DRG_300e', {
});

// DRG_303 - Dragonqueen Alexstrasza (Legendary)
// Battlecry: If your deck contains no duplicates, Discover two Dragons
cardScriptsRegistry.register('DRG_303', {
  play: (ctx: ActionContext) => {
    // If your deck contains no duplicates, Discover two Dragons
  },
});

// DRG_304 - Alexstrasza (Legendary)
// Battlecry: Set a hero's remaining Health to 15
cardScriptsRegistry.register('DRG_304', {
  deathrattle: (ctx: ActionContext) => {
    // Set a hero's remaining Health to 15
  },
  play: (ctx: ActionContext) => {
    // Set a hero's remaining Health to 15
  },
});

// DRG_306 - Lightborn Sorcerer (Rare)
// Battlecry: If your deck contains no duplicates, restore 5 Health
cardScriptsRegistry.register('DRG_306', {
  play: (ctx: ActionContext) => {
    // If your deck contains no duplicates, restore 5 Health
  },
});

// DRG_308 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('DRG_308', {
  requirements: {
    // TODO: add requirements
  },
  deathrattle: (ctx: ActionContext) => {
    // Your other Murlocs have +1 Attack
  },
});

// DRG_246 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('DRG_246', {
  requirements: {
    // TODO: add requirements
  },
});
