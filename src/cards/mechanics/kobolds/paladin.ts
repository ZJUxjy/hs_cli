// kobolds - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// LOOT_216
cardScriptsRegistry.register('LOOT_216', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_313
cardScriptsRegistry.register('LOOT_313', {
});

// LOOT_363
cardScriptsRegistry.register('LOOT_363', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// LOOT_398
cardScriptsRegistry.register('LOOT_398', {
  events: {
    // TODO: implement events
  },
});

// LOOT_088
cardScriptsRegistry.register('LOOT_088', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_091
cardScriptsRegistry.register('LOOT_091', {
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

// LOOT_091t1
cardScriptsRegistry.register('LOOT_091t1', {
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

// LOOT_091t2
cardScriptsRegistry.register('LOOT_091t2', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_093
cardScriptsRegistry.register('LOOT_093', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_333 Marin the Fox
// Battlecry: Add a Treasure card to your hand
cardScriptsRegistry.register('LOOT_333', {
  play: (ctx: ActionContext) => {
    // Add a random treasure to hand (LOOT_286t1-t4)
    const treasures = ['LOOT_286t1', 'LOOT_286t2', 'LOOT_286t3', 'LOOT_286t4'];
    const randomTreasure = treasures[Math.floor(Math.random() * treasures.length)];
    const { Give } = require('../../actions/give');
    const giveAction = new Give(randomTreasure);
    giveAction.trigger(ctx.source);
  },
});

// LOOT_286 (Deadly Dust - Marin the Fox's treasure, triggers when LOOT_333 triggers)
cardScriptsRegistry.register('LOOT_286', {
});

// LOOT_286t1 "Zar" (Treasure)
cardScriptsRegistry.register('LOOT_286t1', {
  play: (ctx: ActionContext) => {
    // 2 cards
    const { Draw } = require('../../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
  },
});

// LOOT_286t2 "Mimiron" (Treasure)
cardScriptsRegistry.register('LOOT_286t2', {
  play: (ctx: ActionContext) => {
    // Construct a mech
    const { Summon } = require('../../actions/summon');
    const summonAction = new Summon('LOOT_286t2t');
    summonAction.trigger(ctx.source);
    summonAction.trigger(ctx.source);
    summonAction.trigger(ctx.source);
  },
});

// LOOT_286t3 "Vault" (Treasure)
cardScriptsRegistry.register('LOOT_286t3', {
  play: (ctx: ActionContext) => {
    // Give a random minion in hand +5/+5
    const controller = (ctx.source as any).controller;
    const hand = controller?.hand || [];
    const minions = hand.filter((c: any) => c.type === 'MINION');
    if (minions.length > 0) {
      const randomMinion = minions[Math.floor(Math.random() * minions.length)];
      const { Buff } = require('../../actions/buff');
      const buffAction = new Buff('LOOT_286e', { ATK: 5, HEALTH: 5 });
      buffAction.trigger(ctx.source, randomMinion);
    }
  },
});

// LOOT_286t4 "L'ore" (Treasure)
cardScriptsRegistry.register('LOOT_286t4', {
  play: (ctx: ActionContext) => {
    // Give 3 random minions in your deck +2/+2
    const controller = (ctx.source as any).controller;
    const deck = controller?.deck || [];
    const minions = deck.filter((c: any) => c.type === 'MINION');
    for (let i = 0; i < Math.min(3, minions.length); i++) {
      const randomIndex = Math.floor(Math.random() * minions.length);
      const minion = minions[randomIndex];
      (minion as any).attack = ((minion as any).attack || 0) + 2;
      (minion as any).health = ((minion as any).health || 0) + 2;
      minions.splice(randomIndex, 1);
    }
  },
});

// LOOT_500
cardScriptsRegistry.register('LOOT_500', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// LOOT_500e
cardScriptsRegistry.register('LOOT_500e', {
  deathrattle: (ctx: ActionContext) => { /* TODO */ },
});
