// brawl - masked_ball.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TB_Pilot1 - Deathrattle: Return a random friendly minion to your hand
cardScriptsRegistry.register('TB_Pilot1', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    // Filter out self
    const otherMinions = field.filter((m: any) => m !== ctx.source);
    if (otherMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherMinions.length);
      const target = otherMinions[randomIndex];
      const { Bounce } = require('../../../actions/bounce');
      const bounce = new Bounce();
      bounce.trigger(ctx.source, target);
    }
  },
});
