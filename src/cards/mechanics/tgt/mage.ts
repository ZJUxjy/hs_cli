// tgt - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw, Shuffle, Summon } from '../../../actions';
import { Entity } from '../../../core/entity';

// AT_006 Fallen Hero - Your Hero Powers deal 1 more damage
cardScriptsRegistry.register('AT_006', {
});

// AT_007 Polymorph - Transform a minion into a 1/1 Sheep
cardScriptsRegistry.register('AT_007', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Morph } = require('../../../actions/morph');
      const morph = new Morph('CS2_tk1');
      morph.trigger(ctx.source, ctx.target);
    }
  },
});

// AT_008 Spellslinger - Battlecry: Add a random spell to both hands
cardScriptsRegistry.register('AT_008', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    // In full implementation, add random spell to both hands
  },
});

// AT_009 Water Elemental - No special ability
cardScriptsRegistry.register('AT_009', {
});

// AT_001 Flame Lance - Deal 8 damage to a minion
cardScriptsRegistry.register('AT_001', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 8);
      damage.trigger(ctx.source);
    }
  },
});

// AT_004 Arcane Blast - Deal 3 damage to a target
cardScriptsRegistry.register('AT_004', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const damage = new Damage(ctx.source, ctx.target, 3);
      damage.trigger(ctx.source);
    }
  },
});

// AT_005 Focus - Your next spell has double damage
cardScriptsRegistry.register('AT_005', {
  play: (ctx: ActionContext) => {
    // In full implementation, set flag for double damage
  },
});

// AT_002 Conjurer's Calling - Destroy a minion and summon two 3/2s
cardScriptsRegistry.register('AT_002', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Destroy target
      (ctx.target as any).destroyed = true;
      // Summon two 3/2s
      const { Summon } = require('../../../actions/summon');
      const summon1 = new Summon('AT_002t');
      summon1.trigger(ctx.source);
      const summon2 = new Summon('AT_002t');
      summon2.trigger(ctx.source);
    }
  },
});
