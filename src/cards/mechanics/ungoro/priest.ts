// ungoro - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Give, Buff } from '../../../actions';

// UNG_022 - Mirage Caller - Battlecry: Choose a minion. Summon a 1/1 copy of it.
cardScriptsRegistry.register('UNG_022', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const summon = new Summon(ctx.source, (target as any).id);
      summon.trigger(ctx.source);
    }
  },
});

// UNG_022e
cardScriptsRegistry.register('UNG_022e', {
});

// UNG_032 - Crystalline Oracle - Deathrattle: Copy a card from your opponent's deck and add it to your hand.
cardScriptsRegistry.register('UNG_032', {
  deathrattle: (ctx: ActionContext) => {
    // Copy a card from opponent's deck - handled by game
  },
});

// UNG_034 - Radiant Elemental - Your spells cost (1) less (but not less than 1)
cardScriptsRegistry.register('UNG_034', {
  // Passive aura effect - handled by game
});

// UNG_035 - Shadow Ascendant - Battlecry: If your hero took damage this turn, give minions +1/+1
cardScriptsRegistry.register('UNG_035', {
  requirements: {
    // Requirement: your hero took damage this turn - handled by game
  },
  play: (ctx: ActionContext) => {
    // Give all minions +1/+1 - handled by game
  },
});

// UNG_037 - Tortollan Shellraiser - Taunt. Deathrattle: Give a random friendly minion +1/+1.
cardScriptsRegistry.register('UNG_037', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const targets = field.filter((m: any) => m !== ctx.source);
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const buff = new Buff(ctx.source, target, { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source);
    }
  },
});

// UNG_963 - Lyra the Sunshard - Whenever you cast a spell, add a random Priest spell to your hand.
cardScriptsRegistry.register('UNG_963', {
  events: {
    // Spell cast event - handled by game
  },
});

// UNG_029 - Shadow Visions - Discover a copy of a spell in your deck.
cardScriptsRegistry.register('UNG_029', {
  play: (ctx: ActionContext) => {
    // Discover effect - handled by game
  },
});

// UNG_030 - Embrace Darkness - Battlecry: Take control of an enemy minion until end of turn.
cardScriptsRegistry.register('UNG_030', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Take control until end of turn - handled by game
  },
});

// UNG_854 - Free From Amber - Discover a minion that costs (8) or more. Summon it.
cardScriptsRegistry.register('UNG_854', {
  play: (ctx: ActionContext) => {
    // Discover and summon - handled by game
  },
});

// UNG_940 - Awaken the Makers - Quest: Summon 6 Deathrattle minions. Reward: Amara, Warden of Hope
cardScriptsRegistry.register('UNG_940', {
  // Quest card - handled by game
});

// UNG_940t8 - Amara, Warden of Hope - Taunt. Battlecry: Set your hero's Health to 40.
cardScriptsRegistry.register('UNG_940t8', {
  play: (ctx: ActionContext) => {
    // Set hero health to 40 - handled by game
  },
});

// UNG_940t8e
cardScriptsRegistry.register('UNG_940t8e', {
});
