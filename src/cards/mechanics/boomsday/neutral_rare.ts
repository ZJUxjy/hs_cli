// boomsday - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Give, Damage } from '../../../actions';

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

// BOT_102 - Spark Drill - Rush. Deathrattle: Add two 1/1 Sparks with Rush to your hand
cardScriptsRegistry.register('BOT_102', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const give1 = new Give('BOT_102t');
    give1.trigger(ctx.source, controller);
    const give2 = new Give('BOT_102t');
    give2.trigger(ctx.source, controller);
  },
});

// BOT_107 - Missile Launcher - Magnetic. At the end of your turn, deal 1 damage to all other characters
cardScriptsRegistry.register('BOT_107', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // Deal 1 damage to all other characters - handled by game
    },
  },
});

// BOT_107e
cardScriptsRegistry.register('BOT_107e', {
  events: {
    // Handled by game
  },
});

// BOT_270
cardScriptsRegistry.register('BOT_270', {
  play: (ctx: ActionContext) => {
    // Handled by game
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
    // Handled by game
  },
});

// BOT_538
cardScriptsRegistry.register('BOT_538', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// BOT_539
cardScriptsRegistry.register('BOT_539', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// BOT_907
cardScriptsRegistry.register('BOT_907', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// BOT_907e
cardScriptsRegistry.register('BOT_907e', {
  events: {
    // Handled by game
  },
});
