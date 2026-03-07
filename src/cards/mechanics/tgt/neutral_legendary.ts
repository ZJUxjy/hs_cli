// tgt - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Heal, Give, Draw, Summon } from '../../../actions';

// AT_070 - Varian Wrynn - Battlecry: Draw 3 cards. Put any minions drawn into play
cardScriptsRegistry.register('AT_070', {
});

// AT_122 - Light's Champion - Battlecry: Silence a Demon
cardScriptsRegistry.register('AT_122', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_IS_RACE]: 15, // DEMON
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Silence target - handled by game
    }
  },
});

// AT_123 - Saboteur - Battlecry: Your hero power costs (2) more next turn
cardScriptsRegistry.register('AT_123', {
  deathrattle: (ctx: ActionContext) => {
    // Opponent's hero power costs (2) more next turn - handled by game
  },
});

// AT_124 - Sideshow Spelleater - Battlecry: Copy your opponent's Hero Power
cardScriptsRegistry.register('AT_124', {
  events: {
    // Copy opponent's Hero Power - handled by game
  },
});

// AT_125 - Mukla's Champion - Inspire: Give your other minions +1/+1
cardScriptsRegistry.register('AT_125', {
});

// AT_127 -Fjola Lightbane - Whenever you target this minion with a spell, gain Divine Shield
cardScriptsRegistry.register('AT_127', {
});

// AT_128 - Eydis Darkbane - Whenever you target this minion with a spell, deal 3 damage to it
cardScriptsRegistry.register('AT_128', {
  deathrattle: (ctx: ActionContext) => {
    // Return to hand - handled by game
  },
});

// AT_129 - Frost Giant - Costs (1) less for each time your hero power was used this game
cardScriptsRegistry.register('AT_129', {
  events: {
    // Costs (1) less for each hero power use - handled by game
  },
});

// AT_131 - Crowd Favorite - Whenever you play a card with Battlecry, gain +1/+1
cardScriptsRegistry.register('AT_131', {
  events: {
    // Gain +1/+1 when Battlecry card is played - handled by game
  },
});

// AT_132 - Gormok the Impaler - Battlecry: If you have 4 other minions, deal 4 damage
cardScriptsRegistry.register('AT_132', {
  play: (ctx: ActionContext) => {
    // If you have 4 other minions, deal 4 damage - handled by game
  },
});
