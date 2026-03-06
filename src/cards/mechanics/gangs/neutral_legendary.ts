// gangs - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// CFM_341 - Patches the Pirate (Legendary)
// Charge. Battlecry: If your deck contains no duplicates, add Patches to your hand
cardScriptsRegistry.register('CFM_341', {
  deathrattle: (ctx: ActionContext) => {
    // Battlecry: If your deck contains no duplicates, add Patches
  },
  play: (ctx: ActionContext) => {
    // Battlecry: If your deck contains no duplicates, add Patches
  },
});

// CFM_344 - Small-Time Buccaneer (Rare)
// Has +2 Attack while you have a weapon
cardScriptsRegistry.register('CFM_344', {
  events: {
    // Has +2 Attack while you have a weapon
  },
});

// CFM_621 - Kazakus (Legendary)
// Battlecry: Discover a spell
cardScriptsRegistry.register('CFM_621', {
  play: (ctx: ActionContext) => {
    // Discover a spell
  },
});

// CFM_637 - Grimestreet Enforcer (Rare)
// At the end of your turn, give a random minion in your hand +1/+1
cardScriptsRegistry.register('CFM_637', {
});

// Deck - ???
cardScriptsRegistry.register('Deck', {
  events: {
    // ???
  },
});

// CFM_670 - Burgly Bully (Epic)
// Whenever your opponent casts a spell, add a Coin to your hand
cardScriptsRegistry.register('CFM_670', {
  events: {
    // Whenever your opponent casts a spell, add a Coin
  },
});

// CFM_672 - Jade Lightning (Common)
// Deal 4 damage. Summon a 1/1 Jade Golem
cardScriptsRegistry.register('CFM_672', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Deal 4 damage. Summon a 1/1 Jade Golem
  },
});

// CFM_685 - Felguard (Rare)
// Taunt. Battlecry: Destroy a random enemy minion
cardScriptsRegistry.register('CFM_685', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // Destroy a random enemy minion
  },
});

// CFM_806 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('CFM_806', {
  play: (ctx: ActionContext) => {
    // Trigger all friendly minions' Deathrattles
  },
});

// CFM_807 - Fandral Staghelm (Legendary)
// Your Deathrattle cards trigger twice
cardScriptsRegistry.register('CFM_807', {
  events: {
    // Your Deathrattle cards trigger twice
  },
});

// CFM_808 - Blightnozzle Crawler (Rare)
// Deathrattle: Summon a 1/1 Ooze with Rush. Battlecry: Deal 2 damage
cardScriptsRegistry.register('CFM_808', {
  play: (ctx: ActionContext) => {
    // Deal 2 damage
  },
  deathrattle: (ctx: ActionContext) => {
    // Summon a 1/1 Ooze with Rush
  },
});
