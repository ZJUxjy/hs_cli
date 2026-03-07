// brawl - southshore_tarren_mill.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TBST_002 - Shadow Word: Pain
cardScriptsRegistry.register('TBST_002', {
  requirements: {
    [PlayReq.REQ_TARGET_MAX_ATTACK]: 3,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).destroyed = true;
    }
  },
});

// TBST_003 - Holy Wrath
cardScriptsRegistry.register('TBST_003', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(5);
      damage.trigger(ctx.source, ctx.target);
    }
  },
});

// TBST_004 - Holy Nova
cardScriptsRegistry.register('TBST_004', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const myField = controller.field || [];
    const oppField = opponent.field || [];
    const { Damage } = require('../../../actions/damage');
    // Deal 2 damage to all enemies
    for (const minion of oppField) {
      const damage = new Damage(2);
      damage.trigger(ctx.source, minion);
    }
    // Heal 2 to all friends
    const { Heal } = require('../../../actions/heal');
    for (const minion of myField) {
      const heal = new Heal(2);
      heal.trigger(ctx.source, minion);
    }
  },
});

// TBST_005 - Northshire Cleric
cardScriptsRegistry.register('TBST_005', {
  events: {
    'HEAL': (ctx: ActionContext) => {
      if (ctx.target) {
        const controller = (ctx.source as any).controller;
        const { Draw } = require('../../../actions/draw');
        const draw = new Draw(ctx.source, 1);
        draw.trigger(ctx.source);
      }
    },
  },
});

// TBST_006 - Lightwell
cardScriptsRegistry.register('TBST_006', {
  events: {
    'TURN_START': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const myField = controller.field || [];
      const { Heal } = require('../../../actions/heal');
      for (const minion of myField) {
        const heal = new Heal(3);
        heal.trigger(ctx.source, minion);
      }
    },
  },
});
