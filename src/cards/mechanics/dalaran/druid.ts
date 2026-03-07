// dalaran - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Summon, Draw } from '../../../actions';

// DAL_354 - Dalaran Creeper (Rare)
// Deathrattle: Summon a 2/1 Spider
cardScriptsRegistry.register('DAL_354', {
  deathrattle: (ctx: ActionContext) => {
    const summonAction = new Summon(ctx.source, 'DAL_354t');
    summonAction.trigger(ctx.source);
  },
});

// DAL_355 - Emerald HiveQueen
// Your minions are Elusive
cardScriptsRegistry.register('DAL_355', {
  events: {
    // Your minions are Elusive - handled by game
  },
});

// DAL_357 - Lucentbark (Legendary)
// Deathrattle: Go dormant. Restore 5 Health to awaken this minion.
cardScriptsRegistry.register('DAL_357', {
  deathrattle: (ctx: ActionContext) => {
    // Go dormant and heal 5 to awaken
    // This is a complex effect handled by game logic
    const source = ctx.source;
    (source as any).dormant = true;
    (source as any).awakenHealth = 5;
  },
});

// DAL_357t
cardScriptsRegistry.register('DAL_357t', {
});

// DAL_732 - The Forest's Aid
// Twinspell: Summon two 2/2 Treants
cardScriptsRegistry.register('DAL_732', {
  play: (ctx: ActionContext) => {
    const summonAction1 = new Summon(ctx.source, 'DAL_732t');
    summonAction1.trigger(ctx.source);
    const summonAction2 = new Summon(ctx.source, 'DAL_732t');
    summonAction2.trigger(ctx.source);
  },
  events: {
    // Twinspell: Summon two 2/2 Treants - handled by game
  },
});

// DAL_256 - Blessing of the Ancients
// Twinspell: Give your minions +1/+2
cardScriptsRegistry.register('DAL_256', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const field = controller?.field as any[];
    if (!field) return;

    for (const minion of field) {
      const buff = new (require('../../../actions/buff').Buff)(source, minion, { ATK: 1, HEALTH: 2 });
      buff.trigger(source);
    }
  },
});

// DAL_350 - Acornbearer
// Battlecry: Add a 1/1 Squirrel to your hand
cardScriptsRegistry.register('DAL_350', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const { Give } = require('../../../actions/give');
    const giveAction = new Give('DAL_350t');
    giveAction.trigger(source, controller);
  },
});

// DAL_350a - Squirrel
cardScriptsRegistry.register('DAL_350a', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Basic minion
  },
});

// DAL_350b - Hidden Cache (Choose One)
cardScriptsRegistry.register('DAL_350b', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Choose one effect
  },
});

// DAL_351 - Crystal Stag
// Battlecry: If your hero power costs (3), summon a copy of this minion
cardScriptsRegistry.register('DAL_351', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // If hero power costs 3, summon copy - handled by game
  },
});

// DAL_352 - Keeper Stalladris (Legendary)
// Give your other Elementals "Deathrattle: Draw a card"
cardScriptsRegistry.register('DAL_352', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const field = controller?.field as any[];

    if (!field) return;

    // Give deathrattle: draw a card to other elementals
    for (const minion of field) {
      if (minion !== source && (minion as any).race === 'ELEMENTAL') {
        (minion as any).deathrattleDraw = true;
      }
    }
  },
});

// DAL_733 - Emerald Explorer
// Battlecry: Discover an Elemental. Deathrattle: Discover an Elemental
cardScriptsRegistry.register('DAL_733', {
  play: (ctx: ActionContext) => {
    // Discover an Elemental - handled by game
  },
});
