// brawl - mechwar.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TB_MechWar_Boss1_HeroPower - Repair: Restore 5 Health to a Mech
cardScriptsRegistry.register('TB_MechWar_Boss1_HeroPower', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_TARGET_RACE]: 17, // Mech
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(5);
      heal.trigger(ctx.source, ctx.target);
    }
  },
});

// TB_MechWar_Boss2_HeroPower - Magnetic: Give a friendly Mech +2/+2
cardScriptsRegistry.register('TB_MechWar_Boss2_HeroPower', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if ((minion as any).race === 'Mech') {
        const { Buff } = require('../../../actions/buff');
        const buff = new Buff('TB_MechWar_Boss2_HeroPowere', { ATK: 2, HEALTH: 2 });
        buff.trigger(ctx.source, minion);
      }
    }
  },
});
