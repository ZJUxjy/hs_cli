// witchwood - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// GIL_508
cardScriptsRegistry.register('GIL_508', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_515
cardScriptsRegistry.register('GIL_515', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_565 - Dreadscale (Legendary Beast)
cardScriptsRegistry.register('GIL_565', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // At the end of your turn, deal 1 damage to all your other minions
      const controller = (ctx.source as any).controller;
      if (controller?.isCurrentPlayer && controller.field) {
        for (const minion of controller.field) {
          if (minion !== ctx.source && minion !== (ctx.source as any)) {
            (minion as any).damage = ((minion as any).damage || 0) + 1;
          }
        }
      }
    },
  },
});

// GIL_608
cardScriptsRegistry.register('GIL_608', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// GIL_618 - Witch's Cauldron
cardScriptsRegistry.register('GIL_618', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // At the end of your turn, summon a random enemy minion's copy
      const controller = (ctx.source as any).controller;
      const opponent = controller?.opponent;
      if (opponent?.field?.length > 0 && controller?.field?.length < 7) {
        const randomEnemy = opponent.field[Math.floor(Math.random() * opponent.field.length)];
        controller.field.push({ id: randomEnemy.id } as any);
      }
    },
  },
});

// GIL_693
cardScriptsRegistry.register('GIL_693', {
  events: {
    // TODO: implement events
  },
});

// GIL_825
cardScriptsRegistry.register('GIL_825', {
});

// GIL_191
cardScriptsRegistry.register('GIL_191', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_543
cardScriptsRegistry.register('GIL_543', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_665
cardScriptsRegistry.register('GIL_665', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_665e
cardScriptsRegistry.register('GIL_665e', {
  events: { /* TODO */ },
});
