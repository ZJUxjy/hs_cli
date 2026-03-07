// kobolds - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// LOOT_216 - Crystallizer
// Battlecry: Deal 5 damage to your hero. Gain 5 Armor
cardScriptsRegistry.register('LOOT_216', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    // Deal 5 damage to hero
    if (controller.hero) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(source, controller.hero, 5);
      damage.trigger(source);
    }
    // Gain 5 Armor
    (controller as any).armor = ((controller as any).armor || 0) + 5;
  },
});

// LOOT_313 - Wickerflame Burnbristle
// Taunt. Divine Shield. Deathrattle: Deal 3 damage
cardScriptsRegistry.register('LOOT_313', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;

    // Deal 3 damage to enemy hero
    if (opponent?.hero) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(source, opponent.hero, 3);
      damage.trigger(source);
    }
  },
});

// LOOT_363 - Stonehill Defender
// Taunt. Deathrattle: Discover a Taunt minion
cardScriptsRegistry.register('LOOT_363', {
  deathrattle: (ctx: ActionContext) => {
    // Discover a Taunt minion - handled by game
  },
});

// LOOT_398 - Lynessa Sunsorrow
// Battlecry: Recolor all Paladin cards in your deck
cardScriptsRegistry.register('LOOT_398', {
  events: {
    // Handled by game
  },
});

// LOOT_088 - Potion of Heroism
// Give a minion Divine Shield
cardScriptsRegistry.register('LOOT_088', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).divineShield = true;
    }
  },
});

// LOOT_091 - Lynessa Sunsorrow
// Battlecry: Discover a Paladin card
cardScriptsRegistry.register('LOOT_091', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Discover a Paladin card - handled by game
  },
});

// Hand - Lynessa buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_091t1 - Lynessa choice 1
cardScriptsRegistry.register('LOOT_091t1', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// Hand - Lynessa buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_091t2 - Lynessa choice 2
cardScriptsRegistry.register('LOOT_091t2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_093 - Glow-Tron
// Battlecry: Give a friendly Mech Divine Shield
cardScriptsRegistry.register('LOOT_093', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).divineShield = true;
    }
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
    const source = ctx.source as any;
    const controller = source.controller;
    const giveAction = new Give(randomTreasure);
    giveAction.trigger(source, controller);
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
    const drawAction = new Draw(ctx.source, 1);
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

// LOOT_500 - Crystalsmith Kangor
// Divine Shield. Deathrattle: Give your hero +2 Attack this game
cardScriptsRegistry.register('LOOT_500', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    (controller as any).heroAttackBonus = ((controller as any).heroAttackBonus || 0) + 2;
  },
});

// LOOT_500e - Crystalsmith Kangor buff
cardScriptsRegistry.register('LOOT_500e', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});
