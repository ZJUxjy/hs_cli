// kobolds - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// LOOT_013 Ravenous Pterrordax
// Battlecry: Destroy a friendly minion and gain its Attack
cardScriptsRegistry.register('LOOT_013', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_FRIENDLY_TARGET]: 1,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const attack = (target as any).attack || 0;
      // Destroy the friendly minion
      (target as any).destroyed = true;
      // Gain attack equal to the destroyed minion's attack
      const source = ctx.source as any;
      source.attack = (source.attack || 0) + attack;
    }
  },
});

// LOOT_014
cardScriptsRegistry.register('LOOT_014', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_018
cardScriptsRegistry.register('LOOT_018', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_306
cardScriptsRegistry.register('LOOT_306', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// LOOT_368
cardScriptsRegistry.register('LOOT_368', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// LOOT_415
cardScriptsRegistry.register('LOOT_415', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// LOOT_415t1
cardScriptsRegistry.register('LOOT_415t1', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_415t2
cardScriptsRegistry.register('LOOT_415t2', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_415t3
cardScriptsRegistry.register('LOOT_415t3', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_415t4
cardScriptsRegistry.register('LOOT_415t4', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_415t5
cardScriptsRegistry.register('LOOT_415t5', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_415t6
cardScriptsRegistry.register('LOOT_415t6', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_017
cardScriptsRegistry.register('LOOT_017', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_043
cardScriptsRegistry.register('LOOT_043', {
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

// LOOT_043t2
cardScriptsRegistry.register('LOOT_043t2', {
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

// LOOT_043t3
cardScriptsRegistry.register('LOOT_043t3', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_417
cardScriptsRegistry.register('LOOT_417', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_420
cardScriptsRegistry.register('LOOT_420', {
  events: { /* TODO */ },
});
