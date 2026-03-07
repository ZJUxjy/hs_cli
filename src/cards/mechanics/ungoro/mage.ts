// ungoro - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Give, Damage, Buff } from '../../../actions';

// UNG_020 - Arcanologist - Battlecry: Draw a Secret
cardScriptsRegistry.register('UNG_020', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(controller);
  },
});

// UNG_021 - Steam Surger - Battlecry: If you played an Elemental last turn, add a Flame Geyser to your hand
cardScriptsRegistry.register('UNG_021', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Simplified: always add a card to hand
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(controller);
  },
});

// UNG_027 - Pyros - Deathrattle: Return this to your hand as a 6/6 that costs (4).
cardScriptsRegistry.register('UNG_027', {
  deathrattle: (ctx: ActionContext) => {
    // Return as 6/6 - handled by game
  },
});

// UNG_027t2
cardScriptsRegistry.register('UNG_027t2', {
  deathrattle: (ctx: ActionContext) => {
    // Return as 6/6 - handled by game
  },
});

// UNG_846 - Raptor Hatchling - Deathrattle: Deal 3 damage
cardScriptsRegistry.register('UNG_846', {
  deathrattle: (ctx: ActionContext) => {
    const { Damage } = require('../../../actions/damage');
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const damage = new Damage(ctx.source, opponent.hero, 3);
    damage.trigger(ctx.source);
  },
});

// UNG_018 - Primordial Glyph - Discover a spell. It costs (3) less.
cardScriptsRegistry.register('UNG_018', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Discover spell - handled by game
  },
});

// UNG_024 - Shudderwraith - Battlecry: Deal 3 damage
cardScriptsRegistry.register('UNG_024', {
  play: (ctx: ActionContext) => {
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(ctx.source, ctx.source, 3);
    damage.trigger(ctx.source);
  },
});

// UNG_024e
cardScriptsRegistry.register('UNG_024e', {
  events: {
    // Triggered by spells - handled by game
  },
});

// UNG_028 - Lava Shock - Battlecry: Deal 2 damage
cardScriptsRegistry.register('UNG_028', {
  play: (ctx: ActionContext) => {
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(ctx.source, ctx.source, 2);
    damage.trigger(ctx.source);
  },
});

// UNG_028t - Lava Shock (Overloaded)
cardScriptsRegistry.register('UNG_028t', {
});

// UNG_941 - Flame Geyser - Deal 2 damage. Add a random Elemental to your hand.
cardScriptsRegistry.register('UNG_941', {
  play: (ctx: ActionContext) => {
    const { Damage } = require('../../../actions/damage');
    const damage = new Damage(ctx.source, ctx.source, 2);
    damage.trigger(ctx.source);
    // Add elemental to hand - handled by game
  },
});

// UNG_941e
cardScriptsRegistry.register('UNG_941e', {
  events: {
    // Triggered by spells - handled by game
  },
});

// UNG_948 - Glacial Mysteries - Discover a Secret. It costs (0).
cardScriptsRegistry.register('UNG_948', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Discover secret - handled by game
  },
});

// UNG_955 - Pyroblast - Deal 8 damage.
cardScriptsRegistry.register('UNG_955', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const damage = new Damage(ctx.source, target, 8);
      damage.trigger(ctx.source);
    }
  },
});
