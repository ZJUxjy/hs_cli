// brawl - underdog_rules.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TBUD_1 - At the end of your turn, give your lowest Attack minion +1/+1
cardScriptsRegistry.register('TBUD_1', {
  events: {
    'TURN_END': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const field = controller.field || [];
      if (field.length > 0) {
        // Find the minion with lowest attack
        let lowestAtk = Infinity;
        let lowestMinion = null;
        for (const minion of field) {
          const atk = (minion as any).attack || 0;
          if (atk < lowestAtk) {
            lowestAtk = atk;
            lowestMinion = minion;
          }
        }
        if (lowestMinion) {
          const { Buff } = require('../../../actions/buff');
          const buff = new Buff('TBUD_1e', { ATK: 1, HEALTH: 1 });
          buff.trigger(ctx.source, lowestMinion);
        }
      }
    },
  },
});
