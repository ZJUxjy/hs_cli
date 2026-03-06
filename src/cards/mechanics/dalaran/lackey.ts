// dalaran - lackey.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DAL_613 - Kobold Lackey (Common)
// Battlecry: Deal 2 damage
cardScriptsRegistry.register('DAL_613', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Deal 2 damage to target
    const target = ctx.target;
    if (target) {
      const { Damage } = require('../../actions/damage');
      const damageAction = new Damage(2);
      damageAction.trigger(ctx.source, target);
    }
  },
});

// DAL_614 - Treant Lackey (Common)
// Battlecry: Restore 4 Health
cardScriptsRegistry.register('DAL_614', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Restore 4 Health to target
    const target = ctx.target;
    if (target) {
      const { Heal } = require('../../actions/heal');
      const healAction = new Heal(4);
      healAction.trigger(ctx.source, target);
    }
  },
});

// DAL_615 - Demon Lackey (Common)
// Battlecry: Deal 1 damage to all other minions
cardScriptsRegistry.register('DAL_615', {
  play: (ctx: ActionContext) => {
    // Deal 1 damage to all other minions
    const source = ctx.source as any;
    const controller = source.controller;
    const game = ctx.game;
    const board = controller?.board || [];
    for (const minion of board) {
      if (minion !== source) {
        const { Damage } = require('../../actions/damage');
        const damageAction = new Damage(1);
        damageAction.trigger(source, minion);
      }
    }
  },
});

// DAL_739 - Priestess Valishj (Legendary)
// Battlecry: Summon a copy of a friendly minion
cardScriptsRegistry.register('DAL_739', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_FRIENDLY_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target as any;
    if (target) {
      const { Summon } = require('../../actions/summon');
      const summonAction = new Summon(target.id);
      summonAction.trigger(ctx.source);
    }
  },
});

// DAL_741 - Clockwork Automation (Common)
// Deathrattle: Summon a 1/1 Mechanical
cardScriptsRegistry.register('DAL_741', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../actions/summon');
    const summonAction = new Summon('Mechbot');
    summonAction.trigger(ctx.source);
  },
});

// ULD_616 - Underbelly Angler (Rare)
// After you play a Murloc, add a random Murloc to your hand
cardScriptsRegistry.register('ULD_616', {
  events: {
    // After you play a Murloc, add a random Murloc to your hand
  },
});

// DRG_052 - Whelp (Common)
// No special abilities
cardScriptsRegistry.register('DRG_052', {
});
