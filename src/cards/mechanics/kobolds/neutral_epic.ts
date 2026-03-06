// kobolds - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// LOOT_130
cardScriptsRegistry.register('LOOT_130', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// LOOT_130e
cardScriptsRegistry.register('LOOT_130e', {
  events: {
    // TODO: implement events
  },
});

// LOOT_149
cardScriptsRegistry.register('LOOT_149', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// LOOT_149e
cardScriptsRegistry.register('LOOT_149e', {
  events: {
    // TODO: implement events
  },
});

// LOOT_161 Shudderwraith
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('LOOT_161', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const game = ctx.game;

    // Get all friendly minions on board
    const friendlyMinions = controller?.board || [];

    // Trigger deathrattle for each friendly minion that has one
    for (const minion of friendlyMinions) {
      if (minion.id && minion !== source) {
        const script = cardScriptsRegistry.get(minion.id);
        if (script?.deathrattle) {
          try {
            script.deathrattle({ source: minion, game, target: undefined });
          } catch (e) {
            // Ignore errors in deathrattle triggers
          }
        }
      }
    }
  },
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// LOOT_193
cardScriptsRegistry.register('LOOT_193', {
});

// LOOT_389
cardScriptsRegistry.register('LOOT_389', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_414
cardScriptsRegistry.register('LOOT_414', {
  events: {
    // TODO: implement events
  },
});

// LOOT_529
cardScriptsRegistry.register('LOOT_529', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_539
cardScriptsRegistry.register('LOOT_539', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_540
cardScriptsRegistry.register('LOOT_540', {
  events: { /* TODO */ },
});
