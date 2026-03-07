// kobolds - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Summon, Damage, Draw, Heal } from '../../../actions';

// LOOT_357 - Shudderwraith
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('LOOT_357', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_357l - Shudderwraith buff
cardScriptsRegistry.register('LOOT_357l', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_998h - The Lich King hero
cardScriptsRegistry.register('LOOT_998h', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_998j - Frostmourne
cardScriptsRegistry.register('LOOT_998j', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_998l - The Frozen Throne
cardScriptsRegistry.register('LOOT_998l', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_998le - Frostmourne buff
cardScriptsRegistry.register('LOOT_998le', {
  events: {
    // Handled by game
  },
});

// LOOT_998k - Trap
cardScriptsRegistry.register('LOOT_998k', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_516 - Charged Devilsaur
// Charge
cardScriptsRegistry.register('LOOT_516', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_521 - Shudderwraith
// Battlecry: Trigger all friendly minions' Deathrattles
cardScriptsRegistry.register('LOOT_521', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_526 - Corrupted Healbot
// Deathrattle: Restore 8 Health to your hero
cardScriptsRegistry.register('LOOT_526', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    // Restore 8 health to hero
    if (controller?.hero) {
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(source, controller.hero, 8);
      heal.trigger(source);
    }
  },
});

// LOOT_526t - Corrupted Healbot deathrattle
cardScriptsRegistry.register('LOOT_526t', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_541
cardScriptsRegistry.register('LOOT_541', {
});

// LOOT_541t
cardScriptsRegistry.register('LOOT_541t', {
});
