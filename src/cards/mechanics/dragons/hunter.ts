// dragons - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DRG_010 - Druid of the Swarm (Rare)
// Choose One - Transform into a 2/1 with Rush, or a 1/3 with Taunt
cardScriptsRegistry.register('DRG_010', {
  play: (ctx: ActionContext) => {
    // Transform into a 2/1 with Rush, or a 1/3 with Taunt
  },
});

// DRG_095 - Emeriss (Legendary)
// Battlecry: Change the Cost of minions in your hand to (5)
cardScriptsRegistry.register('DRG_095', {
  play: (ctx: ActionContext) => {
    // Change the cost of minions in your hand to 5
  },
});

// DRG_095e - Emeriss buff
cardScriptsRegistry.register('DRG_095e', {
});

// DRG_252 - Swamp Dragon (Common)
// Deathrattle: Add a random Dragon to your hand
cardScriptsRegistry.register('DRG_252', {
  events: {
    // Deathrattle: Add a random Dragon to your hand
  },
});

// DRG_253 - Dragonmaw Sky Stalker (Rare)
// Deathrattle: Summon a 5/6 Dragon with Taunt
cardScriptsRegistry.register('DRG_253', {
  deathrattle: (ctx: ActionContext) => {
    // Summon a 5/6 Dragon with Taunt
  },
});

// DRG_254 - Riding Yeti (Common)
// Deathrattle: Give a random minion in your hand +2/+2
cardScriptsRegistry.register('DRG_254', {
  play: (ctx: ActionContext) => {
    // Give a random minion in your hand +2/+2
  },
});

// DRG_256 - Bronze Explorer (Common)
// Battlecry: Discover a Dragon
cardScriptsRegistry.register('DRG_256', {
  events: {
    // Battlecry: Discover a Dragon
  },
});

// DRG_006 - Twilight Ember (Common)
// Battlecry: Give your minions "Deathrattle: Deal 1 damage to your hero"
cardScriptsRegistry.register('DRG_006', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // Give your minions "Deathrattle: Deal 1 damage to your hero"
  },
});

// DRG_251 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('DRG_251', {
});

// DRG_255 - Scaleworm (Rare)
// Deathrattle: Give a random friendly Dragon +1/+1
cardScriptsRegistry.register('DRG_255', {
});

// DRG_007 - Green Jelly (Common)
// Deathrattle: Give a random minion in your hand +3/+3
cardScriptsRegistry.register('DRG_007', {
});
