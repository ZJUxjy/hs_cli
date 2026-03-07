// ungoro - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

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

// UNG_027
cardScriptsRegistry.register('UNG_027', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// UNG_027t2
cardScriptsRegistry.register('UNG_027t2', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// UNG_846
cardScriptsRegistry.register('UNG_846', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// UNG_018
cardScriptsRegistry.register('UNG_018', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_024
cardScriptsRegistry.register('UNG_024', {
});

// UNG_024e
cardScriptsRegistry.register('UNG_024e', {
  events: {
    // TODO: implement events
  },
});

// UNG_028
cardScriptsRegistry.register('UNG_028', {
});

// UNG_028t
cardScriptsRegistry.register('UNG_028t', {
});

// UNG_941
cardScriptsRegistry.register('UNG_941', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_941e
cardScriptsRegistry.register('UNG_941e', {
  events: {
    // TODO: implement events
  },
});

// UNG_948
cardScriptsRegistry.register('UNG_948', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// UNG_955
cardScriptsRegistry.register('UNG_955', {
  play: (ctx: ActionContext) => { /* TODO */ },
});
