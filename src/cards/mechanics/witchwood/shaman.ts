// witchwood - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy, Freeze } from '../../../actions';

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

// GIL_583 - Murkspark Eel - Battlecry: If your deck has only even-Cost cards, deal 2 damage
cardScriptsRegistry.register('GIL_583', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
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
        const damage = new Damage(source, target, 2);
        damage.trigger(source);
      }
    }
  },
});

// GIL_807 - Swampqueen Hagatha - Battlecry: Add a 5/5 Horror to your hand
cardScriptsRegistry.register('GIL_807', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      // Add a random Shaman spell to your hand (handled by game)
    },
  },
});

// GIL_820 - Bogshaper - Your spells that cost 5 or more cost (3)
cardScriptsRegistry.register('GIL_820', {
});

// GIL_586 - Ghost Light Angler - Battlecry: Add a random Murloc to your hand
cardScriptsRegistry.register('GIL_586', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Add a random Murloc to your hand (handled by game)
  },
});

// GIL_600 - Horror - Battlecry: Freeze all enemy minions
cardScriptsRegistry.register('GIL_600', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const enemyField = opponent.field || [];
    for (const minion of enemyField) {
      const freeze = new Freeze();
      freeze.trigger(source, minion);
    }
  },
});

// GIL_836 - Totem Cruncher - Battlecry: Destroy a friendly Totem. Gain +2/+2 for each destroyed
cardScriptsRegistry.register('GIL_836', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    const totems = field.filter((m: any) => m.race === 'TOTEM' && m !== source);
    if (totems.length > 0) {
      const target = totems[0];
      const destroy = new Destroy();
      destroy.trigger(source, target);
      const buff = new Buff(source, source, { ATK: 2 * totems.length, HEALTH: 2 * totems.length });
      buff.trigger(source);
    }
  },
});

// GIL_504 - Terrorscale Stalker - Battlecry: Trigger a friendly minion's Deathrattle
cardScriptsRegistry.register('GIL_504', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target as any;
    if (target && target.deathrattle) {
      const { executeDeathrattle } = require('../../index');
      executeDeathrattle(target);
    }
  },
});

// GIL_504h - Hero - Hero card
cardScriptsRegistry.register('GIL_504h', {
});
