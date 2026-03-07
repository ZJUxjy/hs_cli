// uldum - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import type { Entity } from '../../../core/entity';

// ULD_195 - Barrage (Quest: Deal 5 damage to your hero)
cardScriptsRegistry.register('ULD_195', {
  play: (ctx: ActionContext) => {
    // Quest warrior - mark as active
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    (controller as any).barrageQuestActive = true;
  },
  events: {
    DAMAGE: (ctx: ActionContext) => {
      const source = ctx.source as Entity;
      const controller = (source as any).controller;
      const event = ctx.event;
      // Check if hero took 5 damage
      if ((controller as any).barrageQuestActive && event?.target === controller?.hero) {
        // Quest complete - draw a card (simplified reward)
        const { Draw } = require('../../../actions/draw');
        const drawAction = new Draw();
        drawAction.trigger(source);
      }
    },
  },
});

// ULD_253 - Execute (Deal 5 damage to a damaged minion)
cardScriptsRegistry.register('ULD_253', {
  requirements: {
    [PlayReq.REQ_DAMAGED_TARGET]: 1,
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const { Damage } = require('../../../actions/damage');
      const damageAction = new Damage(5);
      damageAction.trigger(ctx.source, target);
    }
  },
});

// ULD_258
cardScriptsRegistry.register('ULD_258', {
  events: {
    // TODO: implement events
  },
});

// ULD_709
cardScriptsRegistry.register('ULD_709', {
  events: {
    // TODO: implement events
  },
});

// ULD_720
cardScriptsRegistry.register('ULD_720', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// ULD_256
cardScriptsRegistry.register('ULD_256', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// ULD_707
cardScriptsRegistry.register('ULD_707', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// ULD_711
cardScriptsRegistry.register('ULD_711', {
});

// ULD_711p3
cardScriptsRegistry.register('ULD_711p3', {
  requirements: {
    // TODO: add requirements
  },
  events: {
    // TODO: implement events
  },
});

// ULD_708
cardScriptsRegistry.register('ULD_708', {
  events: { /* TODO */ },
});
