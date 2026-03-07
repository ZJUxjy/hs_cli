// gvg - mage.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw, Shuffle, Summon } from '../../../actions';
import { Entity } from '../../../core/entity';

// GVG_002 Snowchugger - Battlecry: Freeze an enemy
cardScriptsRegistry.register('GVG_002', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      (ctx.target as any).frozen = true;
    }
  },
});

// GVG_004 Unstable Portal - Add a random minion to your hand
cardScriptsRegistry.register('GVG_004', {
  play: (ctx: ActionContext) => {
    // In full implementation, add random minion to hand
  },
});

// GVG_007 Echo of Medivh - Put a copy of each friendly minion into your hand
cardScriptsRegistry.register('GVG_007', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    const { Give } = require('../../../actions/give');
    for (const minion of field) {
      const cardId = (minion as any).id;
      const giveAction = new Give(cardId);
      giveAction.trigger(source, controller);
    }
  },
});

// GVG_001 Flamecannon - Deal 4 damage to a random enemy minion
cardScriptsRegistry.register('GVG_001', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    const field = opponent?.field || [];
    if (field.length > 0) {
      const target = field[Math.floor(Math.random() * field.length)];
      const damage = new Damage(source, target, 4);
      damage.trigger(source);
    }
  },
});

// GVG_003 Duplicate - Secret: When a friendly minion dies, put 2 copies of it into your hand
cardScriptsRegistry.register('GVG_003', {
  events: {
    DEATH: (ctx: ActionContext) => {
      const event = ctx.event;
      if (event?.source) {
        const minion = event.source as any;
        const controller = minion?.controller;
        if (controller === (ctx.source as any).controller) {
          const cardId = minion.id;
          const { Give } = require('../../../actions/give');
          const giveAction1 = new Give(cardId);
          giveAction1.trigger(ctx.source, controller);
          const giveAction2 = new Give(cardId);
          giveAction2.trigger(ctx.source, controller);
        }
      }
    },
  },
});

// GVG_003e
cardScriptsRegistry.register('GVG_003e', {
});

// GVG_005 Soot Spewer - Battlecry: Give your other Mechs +1 Attack
cardScriptsRegistry.register('GVG_005', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    for (const minion of field) {
      if (minion !== source && (minion as any).race === 'MECH') {
        const buff = new Buff(source, minion, { ATK: 1 });
        buff.trigger(source);
      }
    }
  },
});
