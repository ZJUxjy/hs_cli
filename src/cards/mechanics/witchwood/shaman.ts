// witchwood - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// GIL_530 - Murkspark Eel - Battlecry: If your deck has only even-Cost cards, deal 2 damage
cardScriptsRegistry.register('GIL_530', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    let hasOddCost = false;
    for (const card of deck) {
      const cost = (card as any).cost || 0;
      if (cost % 2 !== 0) {
        hasOddCost = true;
        break;
      }
    }
    if (!hasOddCost && deck.length > 0) {
      const target = ctx.target || controller.opponent?.hero;
      if (target) {
        const { Damage } = require('../../../actions/damage');
        const damage = new Damage(ctx.source, target, 2);
        damage.trigger(ctx.source);
      }
    }
  },
});

// GIL_531 - Witch's Apprentice - Taunt. Battlecry: Add a random Shaman spell to your hand
cardScriptsRegistry.register('GIL_531', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(controller);
  },
});

// GIL_583
cardScriptsRegistry.register('GIL_583', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_807
cardScriptsRegistry.register('GIL_807', {
  events: {
    // TODO: implement events
  },
});

// GIL_820
cardScriptsRegistry.register('GIL_820', {
});

// GIL_586
cardScriptsRegistry.register('GIL_586', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_600
cardScriptsRegistry.register('GIL_600', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_836
cardScriptsRegistry.register('GIL_836', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_504
cardScriptsRegistry.register('GIL_504', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// GIL_504h
cardScriptsRegistry.register('GIL_504h', {
  events: { /* TODO */ },
});
