// troll - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, GainArmor } from '../../../actions';

// TRL_323 - War Master Voone
// Battlecry: Copy all Taunt minions from your opponent's deck
cardScriptsRegistry.register('TRL_323', {
  play: (ctx: ActionContext) => {
    // Copy taunt minions from opponent's deck - simplified
  },
});

// TRL_326 - Overlord's Whip
// After your hero attacks, give your other minions +1 Attack
cardScriptsRegistry.register('TRL_326', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Weapon with after attack effect - simplified
  },
});

// TRL_327 - Boompistoneer's Bunker
// After your hero attacks, deal 3 damage to a random enemy
cardScriptsRegistry.register('TRL_327', {
  events: {
    ATTACK: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source?.controller;
      if (controller?.hero === source) {
        const opponent = controller?.opponent;
        const oppField = opponent?.field || [];
        if (oppField.length > 0) {
          const randomIndex = Math.floor(Math.random() * oppField.length);
          const target = oppField[randomIndex];
          const damage = new Damage(source, target, 3);
          damage.trigger(source);
        } else if (opponent?.hero) {
          const damage = new Damage(source, opponent.hero, 3);
          damage.trigger(source);
        }
      }
    },
  },
});

// TRL_328 - Boom Bot Jr.
// Deathrattle: Deal 4 damage to a random enemy
cardScriptsRegistry.register('TRL_328', {
  play: (ctx: ActionContext) => {
    // Minion body
  },
});

// TRL_329 - Boompistone Bunker
// (just a 2/6 with no special effect)
cardScriptsRegistry.register('TRL_329', {
});

// TRL_321 - Into the Fray
// Give all Taunt minions in your deck +2/+2
cardScriptsRegistry.register('TRL_321', {
  requirements: {
    // Give buff to deck
  },
  play: (ctx: ActionContext) => {
    // Buff taunt minions in deck
  },
});

// TRL_324 - Grommash Hellscream
// Charge. Battlecry: Deal 6 damage
cardScriptsRegistry.register('TRL_324', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 6);
      damage.trigger(ctx.source);
    }
  },
});

// TRL_362 - Sul'thraze
// Overkill: Deal 4 damage to a random enemy
cardScriptsRegistry.register('TRL_362', {
  play: (ctx: ActionContext) => {
    // Weapon with overkill - simplified
  },
});

// TRL_325 - Ornery Direhorn
// Taunt. Battlecry: Deal 1 damage to all other minions
cardScriptsRegistry.register('TRL_325', {
});

// TRL_360 - Dr. Morr's Experiment
// (experimental - simplified)
cardScriptsRegistry.register('TRL_360', {
  events: { },
});
