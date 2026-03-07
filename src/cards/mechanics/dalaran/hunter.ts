// dalaran - hunter.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DAL_372 - Corrosive Breath (Common)
// Deal 2 damage to a minion. If it dies, gain +2/+1
cardScriptsRegistry.register('DAL_372', {
  events: {
    // Deal 2 damage to a minion
  },
});

// DAL_376 - Dwarven Sharpshooter (Common)
// Your Hero Power can target Secrets
cardScriptsRegistry.register('DAL_376', {
  deathrattle: (ctx: ActionContext) => {
    // Your Hero Power can target Secrets
  },
});

// DAL_379 - Resizing Pouch (Common)
// Discover a 1, 2, or 3-Cost minion
cardScriptsRegistry.register('DAL_379', {
  play: (ctx: ActionContext) => {
    // Discover a 1, 2, or 3-Cost minion
  },
});

// DAL_379t - ???
cardScriptsRegistry.register('DAL_379t', {
  events: {
    // ???
  },
});

// DAL_587 - Oblivitron (Rare)
// Deathrattle: Summon a Mech and trigger its Deathrattle
cardScriptsRegistry.register('DAL_587', {
  deathrattle: (ctx: ActionContext) => {
    // Summon a Mech and trigger its Deathrattle
  },
});

// DAL_604 - Vendetta (Rare)
// Deal 4 damage to a minion. Costs (0) if your opponent played a Plot card this turn
cardScriptsRegistry.register('DAL_604', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Deal 4 damage to a minion
  },
});

// DAL_371 - Shudderwraith (Rare)
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('DAL_371', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Trigger all friendly minions' Deathrattles - handled by game
  },
});

// DAL_373 - Boommaster Flark (Legendary)
// Battlecry: Deal 3 damage to all other minions
cardScriptsRegistry.register('DAL_373', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const field = controller?.field as any[];
    if (!field) return;

    for (const minion of field) {
      if (minion !== source) {
        const { Damage } = require('../../../actions/damage');
        const damageAction = new Damage(source, minion, 3);
        damageAction.trigger(source);
      }
    }
  },
});

// DAL_377 - Arch-Villain Rafaam (Legendary)
// Battlecry: Discover two 1-Turn minions. They gain Rush
cardScriptsRegistry.register('DAL_377', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    // Discover two 1-Turn minions. They gain Rush - handled by game
  },
});

// DAL_378 - Rafaam's Scheme (Epic)
// Summon a 2/2 Legionnaire with Taunt
cardScriptsRegistry.register('DAL_378', {
  requirements: {
    // Handled by game
  },
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon(ctx.source, 'DAL_378t');
    summonAction.trigger(ctx.source);
  },
});

// DAL_589 - Ursatron (Common)
// Deathrattle: Draw a Mech from your deck
cardScriptsRegistry.register('DAL_589', {
  play: (ctx: ActionContext) => {
    // Draw a Mech from your deck
  },
});
