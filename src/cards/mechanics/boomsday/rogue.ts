// boomsday - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Draw, Damage, Give, Buff, Summon } from '../../../actions';

// BOT_243 - Cursed Cast
// Quest: Cast 10 spells. Reward: The Cauldrons
cardScriptsRegistry.register('BOT_243', {
  play: (ctx: ActionContext) => {
    // Quest completion - handled by game
  },
});

// BOT_283 - Lab Recruit
// Battlecry: Set your Hero Power to "Deal 2 damage"
cardScriptsRegistry.register('BOT_283', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    if (controller?.heroPower) {
      (controller.heroPower as any).damage = 2;
    }
  },
});

// BOT_288 - Edwin VanCleef
// Combo: Gain +2/+2 for each other card played this turn
cardScriptsRegistry.register('BOT_288', {
  requirements: {
    // Combo handled by game
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const cardsPlayedThisTurn = (controller as any).cardsPlayedThisTurn || 0;
    const buff = new Buff(source, source, { ATK: cardsPlayedThisTurn * 2, HEALTH: cardsPlayedThisTurn * 2 });
    buff.trigger(source);
  },
});

// BOT_565 - Blightnozzle Crawler
// Deathrattle: Summon a 1/1 Ooze with Poisonous
cardScriptsRegistry.register('BOT_565', {
  deathrattle: (ctx: ActionContext) => {
    const summonAction = new Summon(ctx.source, 'BOT_565t');
    summonAction.trigger(ctx.source);
  },
});

// BOT_576 - Violet Haze
// Add 2 random cards to your hand
cardScriptsRegistry.register('BOT_576', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hand = controller?.hand || [];
    // Add 2 random cards - handled by game
  },
});

// BOT_084 - Academic Espionage
// Shuffle 1 card from your opponent's class into your deck (10 cards)
cardScriptsRegistry.register('BOT_084', {
  play: (ctx: ActionContext) => {
    // Shuffle opponent cards into deck - handled by game
  },
});

// BOT_087 - Myra's Unstable Element
// Draw the rest of your deck
cardScriptsRegistry.register('BOT_087', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const deck = controller?.deck as any[] || [];
    const hand = controller?.hand || [];

    // Draw all cards from deck
    while (deck.length > 0) {
      hand.push(deck.pop());
    }
  },
});

// BOT_087e - Myra's Unstable Element buff
cardScriptsRegistry.register('BOT_087e', {
  events: {
    // Handled by game
  },
});

// BOT_242 - Tess Greymane
// Battlecry: Replay every card from another class you've played this game
cardScriptsRegistry.register('BOT_242', {
  play: (ctx: ActionContext) => {
    // Replay cards from another class - handled by game
  },
});

// BOT_508 - Pogo-Hopper
// Battlecry: Deal 2 damage to all other minions
cardScriptsRegistry.register('BOT_508', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field as any[];
    if (!field) return;

    for (const minion of field) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 2);
        damage.trigger(source);
      }
    }
  },
});

// BOT_286 - Sonya Shadowdancer
// Deathrattle: Summon a 1/1 copy of a friendly minion
cardScriptsRegistry.register('BOT_286', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const field = controller?.field || [];

    // Find the first friendly minion (excluding self)
    const otherMinions = field.filter((minion: any) => minion !== source);
    if (otherMinions.length > 0) {
      const target = otherMinions[0];
      const { Summon } = require('../../../actions/summon');
      const summonAction = new Summon(source, target);
      summonAction.trigger(source);
    }
  },
});
