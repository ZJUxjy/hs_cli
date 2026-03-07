// dragons - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import type { Entity } from '../../../core/entity';

// DRG_055 - Dragon Breeder (Rare)
// Battlecry: Choose a friendly Dragon. Give it +2/+2
cardScriptsRegistry.register('DRG_055', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_FRIENDLY_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('DRG_055e', { ATK: 2, HEALTH: 2 });
      buffAction.trigger(ctx.source, target);
    }
  },
});

// DRG_063 - Gryphon (Rare)
// Charge
cardScriptsRegistry.register('DRG_063', {
  play: (ctx: ActionContext) => {
    // Charge is intrinsic ability
  },
});

// DRG_064 - Hippogryph (Rare)
// Taunt. Rush
cardScriptsRegistry.register('DRG_064', {
  play: (ctx: ActionContext) => {
    // Taunt and Rush are intrinsic abilities
  },
});

// DRG_070 - Amber Watcher (Rare)
// Battlecry: Restore 8 Health
cardScriptsRegistry.register('DRG_070', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Heal } = require('../../../actions/heal');
      const healAction = new Heal(8);
      healAction.trigger(ctx.source, target);
    }
  },
});

// DRG_071 - Scalerider (Rare)
// Battlecry: Deal 3 damage
cardScriptsRegistry.register('DRG_071', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(3);
      damageAction.trigger(ctx.source, target);
    }
  },
});

// DRG_075 - Zixor, Apex Predator (Rare)
// Battlecry: Set this minion's Attack to 3
cardScriptsRegistry.register('DRG_075', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    // Set attack to 3
    source.attack = 3;
  },
});

// DRG_076 - Living Dragonbreath (Epic)
// Battlecry: Transform into a 4/2 with Charge
cardScriptsRegistry.register('DRG_076', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Morph } = require('../../../actions/morph');
      const morphAction = new Morph('DRG_076t');
      morphAction.trigger(ctx.source, target);
    }
  },
});

// DRG_077 - Skyfin (Rare)
// Battlecry: If you're holding a Dragon, summon two 1/1 Otters
cardScriptsRegistry.register('DRG_077', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const hand = controller?.hand as Entity[];
    // Check if holding a Dragon
    const hasDragon = hand?.some((card: any) => card.race === 'DRAGON');
    if (hasDragon) {
      const { Summon } = require('../../../actions/summon');
      const summonAction1 = new Summon(ctx.source, 'DRG_077t');
      summonAction1.trigger(ctx.source);
      const summonAction2 = new Summon(ctx.source, 'DRG_077t');
      summonAction2.trigger(ctx.source);
    }
  },
});

// DRG_078
cardScriptsRegistry.register('DRG_078', {
  events: { /* TODO */ },
});
