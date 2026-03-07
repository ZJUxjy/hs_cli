// icecrown - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Summon, Destroy } from '../../../actions';

// ICC_065 - Bone Prince
// Deathrattle: Add a random 4-cost minion to your hand
cardScriptsRegistry.register('ICC_065', {
  deathrattle: (ctx: ActionContext) => {
    // Add random 4-cost minion to hand - simplified
  },
});

// ICC_240 - Plague Scientist
// Battlecry: Give a friendly minion Poisonous
cardScriptsRegistry.register('ICC_240', {
});

// ICC_809 - Spectral Pillager
// Combo: Deal 4 damage
cardScriptsRegistry.register('ICC_809', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// ICC_811 - Roll the Bones
// Draw a card. If it's a Deathrattle card, draw another
cardScriptsRegistry.register('ICC_811', {
  play: (ctx: ActionContext) => {
    const { Draw } = require('../../../actions/draw');
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// ICC_910 - Shadowblade
// Battlecry: Your hero is Immune this turn
cardScriptsRegistry.register('ICC_910', {
  requirements: {
    // Immune this turn
  },
});

// ICC_201 - Snowflipper Penguin
// (just a 2/1 with no special effect)
cardScriptsRegistry.register('ICC_201', {
  play: (ctx: ActionContext) => {
    // Just a minion
  },
});

// ICC_221 - Shallow-Finned Snapper
// Battlecry: Deal 2 damage
cardScriptsRegistry.register('ICC_221', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 2);
      damage.trigger(ctx.source);
    }
  },
});

// ICC_233 - Vilespine Slayer
// Battlecry: Destroy a minion. Combo: Gain +3/+3
cardScriptsRegistry.register('ICC_233', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Destroy } = require('../../../actions/destroy');
      const destroy = new Destroy();
      destroy.trigger(ctx.source, ctx.target);
    }
  },
});

// ICC_850 - Saddle Up
// Draw 2 minions
cardScriptsRegistry.register('ICC_850', {
  play: (ctx: ActionContext) => {
    const { Draw } = require('../../../actions/draw');
    const draw1 = new Draw(ctx.source, 1);
    draw1.trigger(ctx.source);
    const draw2 = new Draw(ctx.source, 1);
    draw2.trigger(ctx.source);
  },
});

// ICC_827 - Dead Man's Hand
// Shuffle a copy of your hand into your deck
cardScriptsRegistry.register('ICC_827', {
  play: (ctx: ActionContext) => {
    // Shuffle copy of hand into deck - simplified
  },
});

// ICC_827e3 - Dead Man's Hand buff
cardScriptsRegistry.register('ICC_827e3', {
  events: {
    // End of turn shuffle
  },
});

// ICC_827p - Kingsbane buff
cardScriptsRegistry.register('ICC_827p', {
  events: {
    // Leeching poison
  },
});

// ICC_827t - Valeera's Hollow
cardScriptsRegistry.register('ICC_827t', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// Hand - Un'Goro Pack
cardScriptsRegistry.register('Hand', {
  events: {
    // Draw 3 cards - handled by game
  },
});

// ICC_827e - Kingsbane buff
cardScriptsRegistry.register('ICC_827e', {
});

// Hand - Un'Goro Pack
cardScriptsRegistry.register('Hand', {
  events: { },
});
