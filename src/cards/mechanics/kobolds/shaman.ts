// kobolds - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon, Freeze } from '../../../actions';

// LOOT_062 - Unstable Evolution - Transform a friendly minion into one that costs (1) more
cardScriptsRegistry.register('LOOT_062', {
  play: (ctx: ActionContext) => {
  },
});

// LOOT_358 - Murkspark - Battlecry: If your deck has no duplicates, gain +2/+2
cardScriptsRegistry.register('LOOT_358', {
  play: (ctx: ActionContext) => {
  },
});

// LOOT_358e - Murkspark buff
cardScriptsRegistry.register('LOOT_358e', {
  events: {
    // Handled by game
  },
});

// LOOT_517 - Gral, the Shark - Battlecry: Add a Loot card to your hand
cardScriptsRegistry.register('LOOT_517', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const lootCards = ['LOOT_013', 'LOOT_014', 'LOOT_017', 'LOOT_018', 'LOOT_043'];
    const randomLoot = lootCards[Math.floor(Math.random() * lootCards.length)];
    const giveAction = new Give(randomLoot);
    giveAction.trigger(source, controller);
  },
});

// LOOT_517e - Gral buff
cardScriptsRegistry.register('LOOT_517e', {
  events: {
    // Handled by game
  },
});

// LOOT_518 - Marsh Hydra - Battlecry: Deal damage equal to this minion's Attack
cardScriptsRegistry.register('LOOT_518', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const attack = (source as any).attack || 0;
    if (ctx.target) {
      const damage = new Damage(source, ctx.target, attack);
      damage.trigger(source);
    }
  },
});

// LOOT_060 - Volcano - Deal 15 damage to all minions. Overload: (2)
cardScriptsRegistry.register('LOOT_060', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      const damage = new Damage(source, minion, 15);
      damage.trigger(source);
    }
  },
});

// LOOT_064 - LESSER SAPPHIRE - Summon a 5/5 Elemental
cardScriptsRegistry.register('LOOT_064', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    const summonAction = new Summon(ctx.source, 'LOOT_064t');
    summonAction.trigger(ctx.source);
  },
});

// Hand - Shudderwraith buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_064t1 - LESSER SAPPHIRE choice 1
cardScriptsRegistry.register('LOOT_064t1', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// Hand - LESSER SAPPHIRE buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_064t2 - LESSER SAPPHIRE choice 2
cardScriptsRegistry.register('LOOT_064t2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_344 - Kalimos
// Battlecry: If you control an Elemental, summon 3 2/3 Elementals
cardScriptsRegistry.register('LOOT_344', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const field = controller?.field || [];

    // Check for Elemental
    const hasElemental = field.some((minion: any) => (minion as any).race === 'elemental');
    if (hasElemental) {
      const { Summon } = require('../../../actions/summon');
      for (let i = 0; i < 3; i++) {
        const summonAction = new Summon(source, 'LOOT_344t');
        summonAction.trigger(source);
      }
    }
  },
});

// LOOT_344e - Kalimos buff
cardScriptsRegistry.register('LOOT_344e', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_373 - Unstable Elemental
// Battlecry: Draw a card
cardScriptsRegistry.register('LOOT_373', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const drawAction = new Draw(source);
    drawAction.trigger(source);
  },
});

// LOOT_504 - Hagatha the Witch
// Battlecry: Discover a spell
cardScriptsRegistry.register('LOOT_504', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Discover a spell - handled by game
  },
});

// LOOT_504t - Hagatha's hero power
cardScriptsRegistry.register('LOOT_504t', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
  events: {
    // Handled by game
  },
});

// LOOT_506 - Shudderwraith
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('LOOT_506', {
  events: {
    // Handled by game
  },
});
