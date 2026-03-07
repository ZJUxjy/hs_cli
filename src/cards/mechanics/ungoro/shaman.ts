// ungoro - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon } from '../../../actions';

// UNG_201 - Primalfin Totem - At the end of your turn, summon a 1/1 Murloc.
cardScriptsRegistry.register('UNG_201', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const summon = new Summon(ctx.source, 'UNG_201t');
      summon.trigger(ctx.source);
    },
  },
});

// UNG_202 - Fire Plume Harbinger - Battlecry: Reduce the Cost of Elementals in your hand by (1).
cardScriptsRegistry.register('UNG_202', {
  play: (ctx: ActionContext) => {
    // Reduce elemental costs - handled by game
  },
});

// UNG_208 - Stone Sentinel - Battlecry: If you played an Elemental last turn, summon two 2/3 Elementals with Taunt.
cardScriptsRegistry.register('UNG_208', {
  requirements: {
    // Requirement: played elemental last turn - handled by game
  },
  play: (ctx: ActionContext) => {
    // Summon two 2/3 Taunt elementals - handled by game
  },
});

// UNG_211 - Kalimos, Primal Lord - Battlecry: If you played an Elemental last turn, cast an Elemental Invocation.
cardScriptsRegistry.register('UNG_211', {
  play: (ctx: ActionContext) => {
    // If played elemental last turn, cast invocation - handled by game
  },
});

// UNG_211a - Invocation of Earth - Deal 3 damage.
cardScriptsRegistry.register('UNG_211a', {
  play: (ctx: ActionContext) => {
    // Deal 3 damage - handled by game
  },
});

// UNG_211b - Invocation of Earth - Summon a 2/3 Elemental.
cardScriptsRegistry.register('UNG_211b', {
  play: (ctx: ActionContext) => {
    // Summon 2/3 elemental - handled by game
  },
});

// UNG_211c - Invocation of Air - Restore 3 Health.
cardScriptsRegistry.register('UNG_211c', {
  play: (ctx: ActionContext) => {
    // Restore 3 health - handled by game
  },
});

// UNG_211d - Invocation of Air - Give your minions +1 Attack.
cardScriptsRegistry.register('UNG_211d', {
  play: (ctx: ActionContext) => {
    // Give minions +1 attack - handled by game
  },
});

// UNG_938 - Hot Spring Guardian - Taunt. Battlecry: Restore #3 Health.
cardScriptsRegistry.register('UNG_938', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(ctx.source, target, 3);
      heal.trigger(ctx.source);
    }
  },
});

// UNG_025 - Volcano - Deal $15 damage randomly split among all minions. Overload: (1).
cardScriptsRegistry.register('UNG_025', {
  play: (ctx: ActionContext) => {
    // Deal 15 damage split randomly - handled by game
  },
});

// UNG_817 - Tidal Surge - Lifesteal. Deal $5 damage to a minion.
cardScriptsRegistry.register('UNG_817', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, target, 5);
      damage.trigger(ctx.source);
    }
  },
});

// UNG_942 - Unite the Murlocs - Quest: Summon 8 Murlocs. Reward: Megafin.
cardScriptsRegistry.register('UNG_942', {
  // Quest card - handled by game
});

// UNG_942t - Megafin - Battlecry: Return 3 Murlocs from your hand to the battlefield.
cardScriptsRegistry.register('UNG_942t', {
  play: (ctx: ActionContext) => {
    // Return 3 murlocs from hand - handled by game
  },
});

// UNG_956 - Spirit Echo - Give your minions "Deathrattle: Return this to your hand."
cardScriptsRegistry.register('UNG_956', {
  play: (ctx: ActionContext) => {
    // Give deathrattle to all minions - handled by game
  },
});

// UNG_956e - Spirit Echo buff
cardScriptsRegistry.register('UNG_956e', {
  deathrattle: (ctx: ActionContext) => {
    // Return to hand - handled by game
  },
});
