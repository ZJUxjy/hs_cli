// tgt - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// AT_028 - Shudderwraith - Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('AT_028', {
});

// AT_029 - Burgle - Add 2 random cards to your hand (from opponent's class)
cardScriptsRegistry.register('AT_029', {
  events: {
    // Add 2 random cards from opponent's class - handled by game
  },
});

// AT_030 - Beneath the Grounds - Shuffle 3 'Nerubian' eggs into your opponent's deck
cardScriptsRegistry.register('AT_030', {
  requirements: {
    // No target needed
  },
});

// AT_031 - Anub'arak - Deathrattle: Return this to your hand. Summon a 4/4 Nerubian
cardScriptsRegistry.register('AT_031', {
  events: {
    // Return to hand and summon Nerubian - handled by game
  },
});

// AT_032 - Unearthed Raptor - Battlecry: Choose a friendly minion. Gain a copy of its Deathrattle
cardScriptsRegistry.register('AT_032', {
  play: (ctx: ActionContext) => {
    // Gain copy of Deathrattle - handled by game
  },
});

// AT_036 - Shade of Naxxramas - Stealth. At the start of your turn, gain +2/+2
cardScriptsRegistry.register('AT_036', {
  deathrattle: (ctx: ActionContext) => {
    // Return to hand - handled by game
  },
});

// AT_033 - Poisoned Blade - Your Hero Power gives your weapon +2 Attack instead of +1
cardScriptsRegistry.register('AT_033', {
  play: (ctx: ActionContext) => {
    // Hero Power gives +2 Attack - handled by game
  },
});

// AT_035 - Cursed Blade - Double all damage dealt to your hero
cardScriptsRegistry.register('AT_035', {
  play: (ctx: ActionContext) => {
    // Double damage dealt to hero - handled by game
  },
});

// AT_035t - Cursed Blade buff
cardScriptsRegistry.register('AT_035t', {
  play: (ctx: ActionContext) => {
    // Double damage - handled by game
  },
});

// AT_034 - Shadow Strike - Deal 5 damage to a minion
cardScriptsRegistry.register('AT_034', {
});
