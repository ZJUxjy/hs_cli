// gangs - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// CFM_610 - Doubling Imp (Rare)
// Battlecry: Summon a copy of this minion
cardScriptsRegistry.register('CFM_610', {
  play: (ctx: ActionContext) => {
    // Summon a copy of this minion
  },
});

// CFM_663 - Hex (Common)
// Transform a minion into a 0/1 Frog with Taunt
cardScriptsRegistry.register('CFM_663', {
  events: {
    // Transform a minion into a 0/1 Frog with Taunt
  },
});

// CFM_699 - Possessed Villager (Common)
// Deathrattle: Summon a 1/1 Shadow
cardScriptsRegistry.register('CFM_699', {
  play: (ctx: ActionContext) => {
    // Deathrattle: Summon a 1/1 Shadow
  },
});

// CFM_699e - Possessed Villager buff
cardScriptsRegistry.register('CFM_699e', {
  events: {
    // ???
  },
});

// CFM_750 - Burgly Bully (Epic)
// Whenever your opponent casts a spell, add a Coin to your hand
cardScriptsRegistry.register('CFM_750', {
  play: (ctx: ActionContext) => {
    // Whenever your opponent casts a spell, add a Coin
  },
});

// CFM_751 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('CFM_751', {
  play: (ctx: ActionContext) => {
    // Trigger all friendly minions' Deathrattles
  },
});

// CFM_900 - Fist of Jaraxxus (Rare)
// Destroy a random enemy minion
cardScriptsRegistry.register('CFM_900', {
  events: {
    // Destroy a random enemy minion
  },
});

// CFM_094 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('CFM_094', {
  play: (ctx: ActionContext) => {
    // Your other Murlocs have +1 Attack
  },
});

// CFM_608 - Kabal Trafficker (Rare)
// Deathrattle: Add a random Demon to your hand
cardScriptsRegistry.register('CFM_608', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // Add a random Demon to your hand
  },
});

// CFM_611 - Reno Jackson (Legendary)
// Battlecry: Restore 10 Health
cardScriptsRegistry.register('CFM_611', {
  play: (ctx: ActionContext) => {
    // Restore 10 Health
  },
});

// CFM_695 - Felguard (Rare)
// Taunt. Battlecry: Destroy a random enemy minion
cardScriptsRegistry.register('CFM_695', {
  play: (ctx: ActionContext) => {
    // Taunt. Battlecry: Destroy a random enemy minion
  },
});
