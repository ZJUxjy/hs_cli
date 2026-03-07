// troll - neutral_legendary.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import type { Entity } from '../../../core/entity';

// TRL_096 - High Priest Thekal (Legendary)
// Battlecry: Transform all other minions into 1/1s
cardScriptsRegistry.register('TRL_096', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;
    const field = controller?.field as Entity[];
    const oppField = opponent?.field as Entity[];

    // Transform all other friendly minions into 1/1s
    if (field) {
      for (const minion of field) {
        if (minion !== source) {
          const { Morph } = require('../../../actions/morph');
          const morphAction = new Morph('TRL_096t'); // 1/1 token
          morphAction.trigger(source, minion);
        }
      }
    }
    // Transform enemy minions into 1/1s
    if (oppField) {
      for (const minion of oppField) {
        const { Morph } = require('../../../actions/morph');
        const morphAction = new Morph('TRL_096t');
        morphAction.trigger(source, minion);
      }
    }
  },
});

// TRL_537 - Scepter of Summoning (Legendary)
// Your minions that cost 5 or more cost (5)
cardScriptsRegistry.register('TRL_537', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Mark that 5+ cost minions are reduced
    (controller as any).scepterActive = true;
  },
});

// TRL_541 - Gral's Shark (Rare)
// Deathrattle: Add a random Hunter minion to your hand
cardScriptsRegistry.register('TRL_541', {
  deathrattle: (ctx: ActionContext) => {
    // This would need a card database to get random hunter minion
    // Simplified: just draw a card
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(ctx.source);
  },
});

// TRL_541t - Gral (Legendary)
// Battlecry: Eat a minion to gain its stats
cardScriptsRegistry.register('TRL_541t', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target as any;
    if (target) {
      const source = ctx.source as any;
      // Gain the target's attack and health
      const attackBonus = target.attack || 0;
      const healthBonus = target.health || 0;
      // Apply buff
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('TRL_541te', { ATK: attackBonus, HEALTH: healthBonus });
      buffAction.trigger(source, source);
      // Destroy the target
      const { Destroy } = require('../../../actions/destroy');
      const destroyAction = new Destroy();
      destroyAction.trigger(source, target);
    }
  },
});

// TRL_542 - Gral'sdir (Legendary)
// Battlecry: Choose a friendly minion to get +2/+2
cardScriptsRegistry.register('TRL_542', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_FRIENDLY_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('TRL_542e', { ATK: 2, HEALTH: 2 });
      buffAction.trigger(ctx.source, target);
    }
  },
});

// TRL_564 - Amani War Bear (Rare)
// Rush. Taunt - these are intrinsic abilities
cardScriptsRegistry.register('TRL_564', {
  play: (ctx: ActionContext) => {
    // Rush and Taunt are set on the card definition
    // This is a placeholder for any additional effects
  },
});
