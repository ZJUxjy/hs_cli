// outlands - neutral_rare.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Draw, Damage, Heal, Give, Shuffle, Summon, Destroy } from '../../../actions';

// BT_155 - Rustsworn Cultist - Deathrattle: Give your other minions +1/+1
cardScriptsRegistry.register('BT_155', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if (minion !== ctx.source) {
        const buff = new Buff(ctx.source, minion, { ATK: 1, HEALTH: 1 });
        buff.trigger(ctx.source);
      }
    }
  },
});

// BT_721 - Rustsworn Incubator - At the end of your turn, summon two 1/1 Vilefiends
cardScriptsRegistry.register('BT_721', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      for (let i = 0; i < 2; i++) {
        const summon = new Summon(ctx.source, 'BT_728t');
        summon.trigger(ctx.source);
      }
    },
  },
});

// BT_731 - Dragonmaw Sentinel - Battlecry: If you're holding a Dragon, gain +2/+2
cardScriptsRegistry.register('BT_731', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // If you're holding a Dragon, gain +2/+2
    },
  },
});
