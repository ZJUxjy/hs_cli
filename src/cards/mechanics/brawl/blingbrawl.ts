// brawl - blingbrawl.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TP_Bling_HP2 - Hero Power: a random friendly minion +2 Give Attack
cardScriptsRegistry.register('TP_Bling_HP2', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    if (field.length > 0) {
      const randomIndex = Math.floor(Math.random() * field.length);
      const target = field[randomIndex];
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('TP_Bling_HP2e', { ATK: 2 });
      buff.trigger(ctx.source, target);
    }
  },
});

// TB_BlingBrawl_Blade1e - Your hero has +3 Attack this turn
cardScriptsRegistry.register('TB_BlingBrawl_Blade1e', {
  events: {
    'TURN_START': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      if (controller.hero) {
        controller.hero.attack = (controller.hero.attack || 0) + 3;
      }
    },
  },
});

// TB_BlingBrawl_Blade2 - Your weapon has +3 Attack
cardScriptsRegistry.register('TB_BlingBrawl_Blade2', {
  events: {
    'TURN_START': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      if (controller.hero?.weapon) {
        controller.hero.weapon.attack = (controller.hero.weapon.attack || 0) + 3;
      }
    },
  },
});

// TB_BlingBrawl_Hero1p - Hero Power: Give a random friendly minion +1/+1
cardScriptsRegistry.register('TB_BlingBrawl_Hero1p', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    if (field.length > 0) {
      const randomIndex = Math.floor(Math.random() * field.length);
      const target = field[randomIndex];
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('TB_BlingBrawl_Hero1pe', { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source, target);
    }
  },
});
