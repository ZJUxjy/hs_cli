// troll - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Summon, Draw } from '../../../actions';

// TRL_059 - Bog Slosher
// Battlecry: Return a friendly minion to your hand and give it +2/+2
cardScriptsRegistry.register('TRL_059', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    if (ctx.target) {
      const target = ctx.target as any;
      const controller = source?.controller;

      // Return to hand
      const { Bounce } = require('../../../actions/bounce');
      const bounce = new Bounce();
      bounce.trigger(source, target);

      // Give +2/+2
      const buff = new Buff(source, target, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
    }
  },
});

// TRL_060 - Murkspark
// (Elemental with a spell damage effect)
cardScriptsRegistry.register('TRL_060', {
  events: {
    // Elemental synergy
  },
});

// TRL_085 - Fire Plume Phoenix
// Battlecry: Deal 2 damage
cardScriptsRegistry.register('TRL_085', {
  events: {
    // Battlecry
  },
});

// TRL_345 - Zentimo
// Whenever you cast a spell, give your minions +1 Attack
cardScriptsRegistry.register('TRL_345', {
  play: (ctx: ActionContext) => {
    // Just a minion
  },
});

// TRL_522 - Swampqueen Hagaga
// Battlecry: Deal 1 damage
cardScriptsRegistry.register('TRL_522', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 1);
      damage.trigger(ctx.source);
    }
  },
});

// TRL_012 - Totem Smash
// Destroy a Totem. Deal 2 damage
cardScriptsRegistry.register('TRL_012', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    if (ctx.target) {
      const damage = new Damage(source, ctx.target, 2);
      damage.trigger(source);
    }
  },
});

// TRL_058 - Saurid
cardScriptsRegistry.register('TRL_058', {
  play: (ctx: ActionContext) => {
    // Minion body
  },
});

// TRL_058e - Saurid enchantment
cardScriptsRegistry.register('TRL_058e', {
  events: {
    // Aftermath effect
  },
});

// TRL_082 - Krag'wa the Frog
// Battlecry: Return a spell to your hand
cardScriptsRegistry.register('TRL_082', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Return spell to hand
  },
});

// TRL_082e - Krag'wa buff
cardScriptsRegistry.register('TRL_082e', {
  deathrattle: (ctx: ActionContext) => {
    // Return spell to hand
  },
});

// TRL_351 - Bog Mosh
// Summon a random 4-Cost minion
cardScriptsRegistry.register('TRL_351', {
  requirements: {
    // Summon random 4-cost
  },
  play: (ctx: ActionContext) => {
    // Summon random 4-cost minion
  },
});

// TRL_352 - Air Elemental
// (just a 2/1 element with no special effect)
cardScriptsRegistry.register('TRL_352', {
});
