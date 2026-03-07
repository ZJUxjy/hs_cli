// kobolds - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// LOOT_078 - Emerald Hive Queen
// Battlecry: Summon two 1/1 Creepers
cardScriptsRegistry.register('LOOT_078', {
  events: {
    // Handled by game
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

// LOOT_077 - Crackling Razormaw
// Battlecry: Adapt
cardScriptsRegistry.register('LOOT_077', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Adapt - handled by game
  },
});

// LOOT_079 - Swamp Leech
// Deathrattle: Deal 2 damage
cardScriptsRegistry.register('LOOT_079', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    if (opponent?.hero) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(source, opponent.hero, 2);
      damage.trigger(source);
    }
  },
});

// LOOT_080 - King Krush
// Charge
cardScriptsRegistry.register('LOOT_080', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Charge - handled by game
  },
});

// Hand - King Krush buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_080t2 - Dire Beast
cardScriptsRegistry.register('LOOT_080t2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// Hand - King Krush buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_080t3 - Stonemaul
cardScriptsRegistry.register('LOOT_080t3', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_217 - Wing Blast
// Deal 4 damage to a minion
cardScriptsRegistry.register('LOOT_217', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, ctx.target, 4);
      damage.trigger(ctx.source);
    }
  },
});

// LOOT_522 - Rhok'delar
// Battlecry: If your deck has no duplicates, summon a random minion from your hand
cardScriptsRegistry.register('LOOT_522', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const hand = controller?.hand || [];
    const minions = hand.filter((card: any) => (card as any).type === 'minion');

    if (minions.length > 0) {
      const randomIndex = Math.floor(Math.random() * minions.length);
      const randomMinion = minions[randomIndex];
      const { Summon } = require('../../../actions/summon');
      const summonAction = new Summon(source, randomMinion);
      summonAction.trigger(source);
    }
  },
});

// LOOT_085 - Dire Mole
cardScriptsRegistry.register('LOOT_085', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_222 - Shudderwraith
cardScriptsRegistry.register('LOOT_222', {
});
