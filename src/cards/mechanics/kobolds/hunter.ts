// kobolds - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// LOOT_078
cardScriptsRegistry.register('LOOT_078', {
  events: {
    // TODO: implement events
  },
});

// LOOT_511 - Kathrena Winterwisp - Battlecry and Deathrattle: Recruit a Beast
cardScriptsRegistry.register('LOOT_511', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    const beasts = deck.filter((c: any) => (c as any).race === 'beast');

    if (beasts.length > 0) {
      const randomIndex = Math.floor(Math.random() * beasts.length);
      const randomBeast = beasts[randomIndex];
      const { Summon } = require('../../../actions/summon');
      const summonAction = new Summon(randomBeast);
      summonAction.trigger(ctx.source);
    }
  },
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    const beasts = deck.filter((c: any) => (c as any).race === 'beast');

    if (beasts.length > 0) {
      const randomIndex = Math.floor(Math.random() * beasts.length);
      const randomBeast = beasts[randomIndex];
      const { Summon } = require('../../../actions/summon');
      const summonAction = new Summon(randomBeast);
      summonAction.trigger(ctx.source);
    }
  },
});

// LOOT_520 - Seeping Oozeling - Battlecry: Gain the Deathrattle of a random minion in your deck
cardScriptsRegistry.register('LOOT_520', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    const minions = deck.filter((c: any) => c.type === 'minion');

    if (minions.length > 0) {
      const randomIndex = Math.floor(Math.random() * minions.length);
      // Copy deathrattle effect from random minion
    }
  },
});

// LOOT_077
cardScriptsRegistry.register('LOOT_077', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_079
cardScriptsRegistry.register('LOOT_079', {
});

// LOOT_080
cardScriptsRegistry.register('LOOT_080', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// LOOT_080t2
cardScriptsRegistry.register('LOOT_080t2', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// LOOT_080t3
cardScriptsRegistry.register('LOOT_080t3', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_217
cardScriptsRegistry.register('LOOT_217', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_522
cardScriptsRegistry.register('LOOT_522', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_085
cardScriptsRegistry.register('LOOT_085', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_222
cardScriptsRegistry.register('LOOT_222', {
});
