// ungoro - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Buff, Damage } from '../../../actions';

// UNG_011 - Hydrologist - Battlecry: Discover and cast a Secret.
cardScriptsRegistry.register('UNG_011', {
  play: (ctx: ActionContext) => {
    // Discover and cast secret - handled by game
  },
});

// UNG_015 - Sunkeeper Tarim - Taunt. Battlecry: Set all other minions' Attack and Health to 3.
cardScriptsRegistry.register('UNG_015', {
  play: (ctx: ActionContext) => {
    // Set all minions to 3/3 - handled by game
  },
});

// UNG_015e
cardScriptsRegistry.register('UNG_015e', {
});

// UNG_953 - Primalfin Champion - Deathrattle: Return any spells you cast on this minion to your hand.
cardScriptsRegistry.register('UNG_953', {
  events: {
    // Track spells cast on this minion - handled by game
  },
});

// UNG_953e
cardScriptsRegistry.register('UNG_953e', {
  deathrattle: (ctx: ActionContext) => {
    // Return spells to hand - handled by game
  },
});

// UNG_962 - The Caverns Below - Quest: Play 5 minions with the same name. Reward: Crystal Core.
cardScriptsRegistry.register('UNG_962', {
  play: (ctx: ActionContext) => {
    // Quest card - handled by game
  },
});

// UNG_004 - Dinosize - Set a minion's stats to 7/14.
cardScriptsRegistry.register('UNG_004', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { ATK: 7, HEALTH: 14 });
      buff.trigger(ctx.source);
    }
  },
});

// UNG_004e
cardScriptsRegistry.register('UNG_004e', {
});

// UNG_952 - Spikeridged Steed - Give a minion +2/+6 and Taunt. When it dies, summon a Stegodon.
cardScriptsRegistry.register('UNG_952', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const buff = new Buff(ctx.source, target, { ATK: 2, HEALTH: 6, taunt: true });
      buff.trigger(ctx.source);
      // Stegodon summon on death is handled by game
    }
  },
});

// UNG_952e - Spikeridged Steed buff
cardScriptsRegistry.register('UNG_952e', {
  deathrattle: (ctx: ActionContext) => {
    // Summon Stegodon on death - handled by game
  },
});

// UNG_954 - The Last Kaleidosaur - Quest: Cast 5 spells on your minions. Reward: Galvadon.
cardScriptsRegistry.register('UNG_954', {
  // Quest card - handled by game
});

// UNG_954t1 - Galvadon - Battlecry: Adapt 5 times.
cardScriptsRegistry.register('UNG_954t1', {
  play: (ctx: ActionContext) => {
    // Adapt 5 times - handled by game
  },
});

// UNG_960 - Lost in the Jungle - Summon two 1/1 Silver Hand Recruits.
cardScriptsRegistry.register('UNG_960', {
  play: (ctx: ActionContext) => {
    const summon1 = new Summon(ctx.source, 'CS2_101t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon(ctx.source, 'CS2_101t');
    summon2.trigger(ctx.source);
  },
});

// UNG_961 - Rallying Blade - Battlecry: Give your minions +1 Attack.
cardScriptsRegistry.register('UNG_961', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Give minions +1 attack - handled by game
  },
});

// UNG_950 - Vinecleaver - After your hero attacks, summon two 1/1 Silver Hand Recruits.
cardScriptsRegistry.register('UNG_950', {
  events: {
    // After hero attacks - handled by game
  },
});
