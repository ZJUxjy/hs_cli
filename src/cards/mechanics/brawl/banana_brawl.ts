// brawl - banana_brawl.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TB_006 - Banana - Give a minion +1/+1
cardScriptsRegistry.register('TB_006', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('TB_006e', { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source, ctx.target);
    }
  },
});

// TB_007 - Greater Banana - Give a minion +2/+2
cardScriptsRegistry.register('TB_007', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('TB_007e', { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source, ctx.target);
    }
  },
});

// TB_008 - Banana Blast - Give all friendly minions +1/+1
cardScriptsRegistry.register('TB_008', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const { Buff } = require('../../../actions/buff');
    for (const minion of field) {
      const buff = new Buff('TB_008e', { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source, minion);
    }
  },
});
