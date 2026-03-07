// troll - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Summon } from '../../../actions';

// TRL_405 - Gravedigger
// Battlecry: Draw a Deathrattle minion from your deck
cardScriptsRegistry.register('TRL_405', {
  events: {
    // Draw deathrattle minion - simplified
  },
});

// TRL_516 - Sneaky Devil
// Stealth. Battlecry: Give other friendly minions +1 Attack
cardScriptsRegistry.register('TRL_516', {
  events: {
    // Battlecry: +1 Attack to others
  },
});

// TRL_527 - Waxadred
// Deathrattle: Shuffle a Candle into your deck
cardScriptsRegistry.register('TRL_527', {
  play: (ctx: ActionContext) => {
    // Minion body - deathrattle handled by game
  },
});

// TRL_528 - Waxadred's Candle
cardScriptsRegistry.register('TRL_528', {
});

// TRL_528e - Waxadred's Candle buff
cardScriptsRegistry.register('TRL_528e', {
});

// TRL_530 - Shudderwraith
// Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('TRL_530', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const myField = controller?.field || [];
    const oppField = opponent?.field || [];

    // Damage all other friendly minions
    for (const minion of myField) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 2);
        damage.trigger(source);
      }
    }
    // Damage all enemy minions
    for (const minion of oppField) {
      const damage = new Damage(source, minion, 2);
      damage.trigger(source);
    }
  },
});

// TRL_532 - Fungal Enchanter
// Battlecry: Restore 2 Health to all other minions
cardScriptsRegistry.register('TRL_532', {
  events: {
    // Battlecry: restore health
  },
});

// TRL_533 - Rabid Worgen
// (just a 2/1 with no special effect)
cardScriptsRegistry.register('TRL_533', {
  play: (ctx: ActionContext) => {
    // Just a minion
  },
});

// TRL_535 - Bog Meerkat
// Battlecry: Add a random Murloc to your hand
cardScriptsRegistry.register('TRL_535', {
  events: {
    // Battlecry: add random murloc - simplified
  },
});

// TRL_569 - Former Champ
// Battlecry: Summon a 5/5 Hotshot
cardScriptsRegistry.register('TRL_569', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'TRL_151t');
    summon.trigger(ctx.source);
  },
});
