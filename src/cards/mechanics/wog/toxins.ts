// wog - toxins.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon } from '../../../actions';

// OG_080b - Kingsblood Toxin - Draw a card
cardScriptsRegistry.register('OG_080b', {
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// OG_080c - Blood Toxin - Deal 3 damage to a minion
cardScriptsRegistry.register('OG_080c', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// OG_080ae - Bloodthistle - Costs (2) less
cardScriptsRegistry.register('OG_080ae', {
  events: {
    // Cost reduction is handled by game engine
  },
});

// OG_080d - Frozen Core - Draw a card
cardScriptsRegistry.register('OG_080d', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
  },
});

// OG_080e - Lead
cardScriptsRegistry.register('OG_080e', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
  },
});

// OG_080de - Fadeleaf - Stealthed until your next turn
cardScriptsRegistry.register('OG_080de', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      if (source.controller === (ctx.source as any).controller) {
        source.stealthed = false;
      }
    },
  },
});

// OG_080f - Necrotic
cardScriptsRegistry.register('OG_080f', {
  play: (ctx: ActionContext) => {
  },
});
