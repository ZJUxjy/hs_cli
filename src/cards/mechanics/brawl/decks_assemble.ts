// brawl - decks_assemble.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TB_010 - Shudderwraith
cardScriptsRegistry.register('TB_010', {
  events: {
    'INSPIRE': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const field = controller.field || [];
      for (const minion of field) {
        const { Buff } = require('../../../actions/buff');
        const buff = new Buff('TB_010e', { ATK: 1, HEALTH: 1 });
        buff.trigger(ctx.source, minion);
      }
    },
  },
});

// TB_011 - Neferset Risen
cardScriptsRegistry.register('TB_011', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    // Deal 3 damage to all enemy minions
    for (const minion of oppField) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(3);
      damage.trigger(ctx.source, minion);
    }
  },
});
