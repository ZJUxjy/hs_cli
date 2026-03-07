// dalaran - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import type { Entity } from '../../../core/entity';

// DAL_163 - Kalecgos (Legendary)
// Your first Dragon each turn costs (0)
cardScriptsRegistry.register('DAL_163', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Mark that first Dragon each turn costs 0
    (controller as any).kalecgosActive = true;
  },
});

// DAL_182 - Magic Trick (Common)
// Discover a spell
cardScriptsRegistry.register('DAL_182', {
  play: (ctx: ActionContext) => {
    // Discover a spell
  },
});

// DAL_575 - Conjurer's Calling (Rare)
// Transform a minion into two 1/1 minions
cardScriptsRegistry.register('DAL_575', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      // Summon two 1/1s (DAL_575t)
      const { Summon } = require('../../../actions/summon');
      const summonAction1 = new Summon(ctx.source, 'DAL_575t');
      summonAction1.trigger(ctx.source);
      const summonAction2 = new Summon(ctx.source, 'DAL_575t');
      summonAction2.trigger(ctx.source);
      // Destroy the target
      const { Destroy } = require('../../../actions/destroy');
      const destroyAction = new Destroy();
      destroyAction.trigger(ctx.source, target);
    }
  },
});

// DAL_576 - Magic Carpet (Epic)
// Your 1-cost minions have +1 Attack and Rush
cardScriptsRegistry.register('DAL_576', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Mark that 1-cost minions get +1 attack and rush
    (controller as any).magicCarpetActive = true;
  },
});

// DAL_603 - Ray of Frost (Common)
// Freeze a minion. If it's already Frozen, deal 2 damage to it
cardScriptsRegistry.register('DAL_603', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Freeze a minion, if already frozen deal 2 damage
    const target = ctx.target;
    if (target) {
      if ((target as any).frozen) {
        const { Damage } = require('../../actions/damage');
        const damageAction = new Damage(2);
        damageAction.trigger(ctx.source, target);
      } else {
        (target as any).frozen = true;
      }
    }
  },
});

// DAL_609 - Mana Cyclone (Rare)
// Battlecry: Add a random Mage spell to your hand
cardScriptsRegistry.register('DAL_609', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // This would need a card database to get random mage spell
    // Simplified: draw a card
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(source);
  },
});

// DAL_609e - Mana Cyclone buff
cardScriptsRegistry.register('DAL_609e', {
});

// DAL_177 - Kirin Tor Tricaster (Rare)
// Battlecry: Add three 1/1 minions to your hand
cardScriptsRegistry.register('DAL_177', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Add three 1/1sorcerer's apprentices to hand
    const { Give } = require('../../../actions/give');
    const giveAction1 = new Give('DAL_177t');
    giveAction1.trigger(source, controller);
    const giveAction2 = new Give('DAL_177t');
    giveAction2.trigger(source, controller);
    const giveAction3 = new Give('DAL_177t');
    giveAction3.trigger(source, controller);
  },
});

// DAL_577 - Jaina Proudmoore (Legendary)
// Battlecry: Summon a 3/3 Water Elemental. Your Elementals have Lifesteal
cardScriptsRegistry.register('DAL_577', {
  play: (ctx: ActionContext) => {
    // Summon a 3/3 Water Elemental
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon(ctx.source, 'DAL_577t');
    summonAction.trigger(ctx.source);
    // Mark that Elementals have Lifesteal
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    (controller as any).jainaElementalsLifesteal = true;
  },
});

// DAL_578 - Frost Lich Jaina (Hero)
// Battlecry: Summon a 3/3 Water Elemental. Your Elementals have Lifesteal
cardScriptsRegistry.register('DAL_578', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // Summon a 3/3 Water Elemental
  },
});

// DAL_608 - Messenger Raven (Common)
// Battlecry: Add a random Mage minion to your hand
cardScriptsRegistry.register('DAL_608', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    // Simplified: draw a card
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(source);
  },
});
