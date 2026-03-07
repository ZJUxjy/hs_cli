// boomsday - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// BOT_291 - Shudderwraith
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('BOT_291', {
  play: (ctx: ActionContext) => {
    // Trigger Deathrattles - handled by game
  },
});

// BOT_407 - Omega Mind
// Battlecry: If you have 10 Mana Crystals, give your spells Lifesteal
cardScriptsRegistry.register('BOT_407', {
  events: {
    // Handled by game
  },
});

// BOT_411 - Electra Stormsurge
// Battlecry: Your next spell casts twice
cardScriptsRegistry.register('BOT_411', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    // Mark that next spell casts twice
    (controller as any).spellDouble = true;
  },
});

// BOT_411e - Electra Stormsurge buff
cardScriptsRegistry.register('BOT_411e', {
  events: {
    // Handled by game
  },
});

// BOT_533 - Starke
// Battlecry: Give all friendly Mechs +2/+2
cardScriptsRegistry.register('BOT_533', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const field = controller?.field || [];

    for (const minion of field) {
      if ((minion as any).race === 'MECHANICAL') {
        (minion as any).bonusAttack = ((minion as any).bonusAttack || 0) + 2;
        (minion as any).bonusHealth = ((minion as any).bonusHealth || 0) + 2;
      }
    }
  },
});

// BOT_543 - Kil'Jaeden
// Battlecry: Take 2 turns in a row
cardScriptsRegistry.register('BOT_543', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    // Take an extra turn - handled by game
    (controller as any).extraTurn = true;
  },
});

// BOT_543e - Kil'Jaeden buff
cardScriptsRegistry.register('BOT_543e', {
});

// BOT_093 - Unstable Evolution
// Transform a minion into a random minion with the same Cost
cardScriptsRegistry.register('BOT_093', {
  play: (ctx: ActionContext) => {
    // Transform into random minion - handled by game
  },
});

// BOT_099 - Eureka!
// Summon a copy of a random Mech from your hand
cardScriptsRegistry.register('BOT_099', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const hand = controller?.hand || [];

    // Find mechs in hand
    const mechs = hand.filter((card: any) => (card as any).race === 'MECHANICAL');
    if (mechs.length > 0) {
      const randomIndex = Math.floor(Math.random() * mechs.length);
      const mechToSummon = mechs[randomIndex];
      const { Summon } = require('../../../actions/summon');
      const summonAction = new Summon(source, mechToSummon);
      summonAction.trigger(source);
    }
  },
});

// BOT_245 - Science!
cardScriptsRegistry.register('BOT_245', {
  play: (ctx: ActionContext) => {
    // Draw cards - handled by game
  },
});

// BOT_246 - Thunderhead
// Battlecry: Summon two 1/1 Sparks with Rush
cardScriptsRegistry.register('BOT_246', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon(source, 'BOT_246t');
    summon1.trigger(source);
    const summon2 = new Summon(source, 'BOT_246t');
    summon2.trigger(source);
  },
});

// BOT_451 - Shudderwraith
cardScriptsRegistry.register('BOT_451', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});
