// dragons - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DRG_089 - Nozdormu (Legendary)
// Players only have 15 seconds to take their turns
cardScriptsRegistry.register('DRG_089', {
  play: (ctx: ActionContext) => {
    // Players only have 15 seconds to take their turns
  },
});

// DRG_089e - Nozdormu buff
cardScriptsRegistry.register('DRG_089e', {
});

// DRG_091 - Dragonqueen Alexstrasza (Legendary)
// Battlecry: If your deck contains no duplicates, Discover two Dragons
cardScriptsRegistry.register('DRG_091', {
  events: {
    // If your deck contains no duplicates, Discover two Dragons
  },
});

// DRG_099 - Dr. Morrigan (Legendary)
// Deathrattle: Shuffle a copy of this minion into your deck
cardScriptsRegistry.register('DRG_099', {
  play: (ctx: ActionContext) => {
    // Deathrattle: Shuffle a copy into deck
  },
});

// DRG_099t1 - Dr. Morrigan's Portal
cardScriptsRegistry.register('DRG_099t1', {
  play: (ctx: ActionContext) => {
    // Summon a random minion from your deck
  },
});

// DRG_099t2 - Dr. Morrigan's Portal
cardScriptsRegistry.register('DRG_099t2', {
  play: (ctx: ActionContext) => {
    // Draw a card
  },
});

// DRG_099t3 - Dr. Morrigan's Portal
cardScriptsRegistry.register('DRG_099t3', {
});

// DRG_099t4 - Dr. Morrigan's Portal
cardScriptsRegistry.register('DRG_099t4', {
});

// DRG_257 - Evasive Drakonid (Epic)
// Taunt. Can't be targeted by spells or Hero Powers
cardScriptsRegistry.register('DRG_257', {
  play: (ctx: ActionContext) => {
    // Taunt. Can't be targeted by spells or Hero Powers
  },
});

// DRG_257e3 - Evasive buff
cardScriptsRegistry.register('DRG_257e3', {
});

// DRG_402 - Murozond (Legendary)
// Battlecry: Gain an empty Mana Crystal for each minion you control
cardScriptsRegistry.register('DRG_402', {
  play: (ctx: ActionContext) => {
    // Gain an empty Mana Crystal for each minion you control
  },
});
