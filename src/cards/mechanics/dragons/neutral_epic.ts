// dragons - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DRG_062 - Cobalt Scalebane (Rare)
// At the end of your turn, give a random friendly Dragon +3 Attack
cardScriptsRegistry.register('DRG_062', {
  play: (ctx: ActionContext) => {
    // At the end of your turn, give a random friendly Dragon +3 Attack
  },
});

// DRG_072 - Twilight Ember (Common)
// Battlecry: Give your minions "Deathrattle: Deal 1 damage to your hero"
cardScriptsRegistry.register('DRG_072', {
  play: (ctx: ActionContext) => {
    // Battlecry: Give your minions "Deathrattle: Deal 1 damage to your hero"
  },
});

// DRG_082 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('DRG_082', {
  play: (ctx: ActionContext) => {
    // Trigger all friendly minions' Deathrattles
  },
});

// DRG_084 - Evasive Wyrm (Common)
// Divine Shield
cardScriptsRegistry.register('DRG_084', {
  play: (ctx: ActionContext) => {
    // Divine Shield
  },
});

// DRG_084e - Wyrm buff
cardScriptsRegistry.register('DRG_084e', {
});

// DRG_086 - Bronze Explorer (Common)
// Battlecry: Discover a Dragon
cardScriptsRegistry.register('DRG_086', {
  play: (ctx: ActionContext) => {
    // Battlecry: Discover a Dragon
  },
});

// DRG_086e - Bronze Explorer buff
cardScriptsRegistry.register('DRG_086e', {
  deathrattle: (ctx: ActionContext) => {
    // Bronze Explorer buff
  },
});

// DRG_088 - Dragonmaw Sky Stalker (Rare)
// Deathrattle: Summon a 5/6 Dragon with Taunt
cardScriptsRegistry.register('DRG_088', {
});

// DRG_092 - Dragonqueen Alexstrasza (Legendary)
// Battlecry: If your deck contains no duplicates, Discover two Dragons
cardScriptsRegistry.register('DRG_092', {
  events: {
    // If your deck contains no duplicates, Discover two Dragons
  },
});

// DRG_310 - Frizz Kindleroost (Legendary)
// You can use your Hero Power twice. The first Dragon you play each turn costs (2) less
cardScriptsRegistry.register('DRG_310', {
  play: (ctx: ActionContext) => {
    // You can use your Hero Power twice. The first Dragon you play each turn costs (2) less
  },
});
