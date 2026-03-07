// witchwood - neutral_common.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw, Shuffle, Summon } from '../../../actions';
import { Entity } from '../../../core/entity';

// GIL_118 Wyrmrest Agent - Deathrattle: Give a random friendly minion +1 Attack
cardScriptsRegistry.register('GIL_118', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    const others = field.filter((m: any) => m !== source);
    if (others.length > 0) {
      const target = others[Math.floor(Math.random() * others.length)];
      const buff = new Buff(source, target, { ATK: 1 });
      buff.trigger(source);
    }
  },
});

// GIL_119 Vryghoul - No special ability
cardScriptsRegistry.register('GIL_119', {
});

// GIL_201 Marsh Drake - No special ability
cardScriptsRegistry.register('GIL_201', {
});

// GIL_212 Azuredon - Battlecry: Give all minions in your hand +2/+2
cardScriptsRegistry.register('GIL_212', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const hand = controller?.hand || [];
    for (const card of hand) {
      if ((card as any).type === 'MINION') {
        const buff = new Buff(source, card, { ATK: 2, HEALTH: 2 });
        buff.trigger(source);
      }
    }
  },
});

// GIL_213 Swamp Dragon - No special ability
cardScriptsRegistry.register('GIL_213', {
});

// GIL_513 Sandbinder - Deathrattle: Draw a minion
cardScriptsRegistry.register('GIL_513', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const deck = controller?.deck || [];
    const minions = deck.filter((c: any) => (c as any).type === 'MINION');
    if (minions.length > 0) {
      const card = minions[Math.floor(Math.random() * minions.length)];
      const drawAction = new Draw((card as any).id);
      drawAction.trigger(source);
    }
  },
});

// GIL_526 Cenarius - Choose one - Give your minions +2/+2 or Summon two 5/5 Treants
cardScriptsRegistry.register('GIL_526', {
  play: (ctx: ActionContext) => {
    // Simplified: Summon two 5/5 Treants
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon('GIL_526t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon('GIL_526t');
    summon2.trigger(ctx.source);
  },
});

// GIL_528 Witchwood Grizzly - No special ability
cardScriptsRegistry.register('GIL_528', {
});

// GIL_534 Dollmaster Dorian - At the end of your turn, put a copy of a minion into your hand
cardScriptsRegistry.register('GIL_534', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source?.controller;
      const field = controller?.field || [];
      if (field.length === 0) return;
      const randomMinion = field[Math.floor(Math.random() * field.length)];
      const cardId = (randomMinion as any).id;
      const giveAction = new Give(cardId);
      giveAction.trigger(source, controller);
    },
  },
});

// GIL_561 Night Prowler - Battlecry: If this is the only minion on your board, gain +3/+3
cardScriptsRegistry.register('GIL_561', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const field = controller?.field || [];
    // Only self on field
    if (field.length === 1) {
      const buff = new Buff(source, source, { ATK: 3, HEALTH: 3 });
      buff.trigger(source);
    }
  },
});

// GIL_646 Worgen Abomination - No special ability
cardScriptsRegistry.register('GIL_646', {
});

// GIL_667 Murloc Tastyfin - Deathrattle: Summon two 1/1 Murlocs
cardScriptsRegistry.register('GIL_667', {
  deathrattle: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon('GIL_667t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon('GIL_667t');
    summon2.trigger(ctx.source);
  },
});

// GIL_683 Duskfallen Aviana - At the end of your turn, give a random friend +3 Attack
cardScriptsRegistry.register('GIL_683', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source?.controller;
      const field = controller?.field || [];
      const others = field.filter((m: any) => m !== source);
      if (others.length > 0) {
        const target = others[Math.floor(Math.random() * others.length)];
        const buff = new Buff(source, target, { ATK: 3 });
        buff.trigger(source);
      }
    },
  },
});

// GIL_816 Shirvallah - Battlecry: Restore 7 Health
cardScriptsRegistry.register('GIL_816', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(7);
      heal.trigger(ctx.source, ctx.target);
    }
  },
});
