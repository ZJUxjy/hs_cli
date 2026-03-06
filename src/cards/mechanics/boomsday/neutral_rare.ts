// boomsday - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon } from '../../../actions';

// BOT_066 - Mechanical Whelp
// Deathrattle: Summon a 7/7 Mechanical Dragon
cardScriptsRegistry.register('BOT_066', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    const summonAction = new Summon(source, 'BOT_066t');
    summonAction.trigger(source);
  },
});

// BOT_098
cardScriptsRegistry.register('BOT_098', {
});

// BOT_102
cardScriptsRegistry.register('BOT_102', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BOT_107
cardScriptsRegistry.register('BOT_107', {
  events: {
    // TODO: implement events
  },
});

// BOT_107e
cardScriptsRegistry.register('BOT_107e', {
  events: {
    // TODO: implement events
  },
});

// BOT_270
cardScriptsRegistry.register('BOT_270', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_312 - Replicating Menace
// Magnetic. Deathrattle: Summon three 1/1 Microbots
cardScriptsRegistry.register('BOT_312', {
  magnetic: true,
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    // Summon three 1/1 Microbots (BOT_312t)
    for (let i = 0; i < 3; i++) {
      const summonAction = new Summon(source, 'BOT_312t');
      summonAction.trigger(source);
    }
  },
});

// BOT_312e
cardScriptsRegistry.register('BOT_312e', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// BOT_538
cardScriptsRegistry.register('BOT_538', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_539
cardScriptsRegistry.register('BOT_539', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_907
cardScriptsRegistry.register('BOT_907', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// BOT_907e
cardScriptsRegistry.register('BOT_907e', {
  events: { /* TODO */ },
});
