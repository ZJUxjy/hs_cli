// witchwood - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy, Bounce } from '../../../actions';

// GIL_510 - Spectral Cutler - Battlecry: Gain 2 Armor. Deathrattle: Summon a 1/1 Adventurer
cardScriptsRegistry.register('GIL_510', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source.controller;
      const opponent = controller.opponent;
      const oppField = opponent.field || [];
      if (oppField.length > 0) {
        const target = oppField[Math.floor(Math.random() * oppField.length)];
        const damage = new Damage(source, target, 2);
        damage.trigger(source);
      }
    },
  },
});

// GIL_557 - Cavern Shinyfinder - Deathrattle: Discover a weapon
cardScriptsRegistry.register('GIL_557', {
  deathrattle: (ctx: ActionContext) => {
    // Discover a weapon (handled by game)
  },
});

// GIL_598 - Wanted - Choose a minion. It becomes 4/4
cardScriptsRegistry.register('GIL_598', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target as any;
    if (target) {
      const buff = new Buff(source, target, { ATK: 4, HEALTH: 4 });
      buff.trigger(source);
    }
  },
});

// GIL_677 - Face Collector - Battlecry: Discover a friendly minion
cardScriptsRegistry.register('GIL_677', {
  play: (ctx: ActionContext) => {
    // Discover a friendly minion (handled by game)
  },
});

// GIL_827 - Cursed Castaway - Battlecry: Draw a card. Combo: Return it to your hand
cardScriptsRegistry.register('GIL_827', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const draw = new Draw(controller);
    draw.trigger(source);
  },
});

// GIL_902 - Togwaggle's Scheme - Choose a minion. Shuffle 5 copies of it into your deck
cardScriptsRegistry.register('GIL_902', {
});

// GIL_506 - Pick Pocket - Add a random card to your hand (it costs 2 more)
cardScriptsRegistry.register('GIL_506', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Add a random card to your hand (handled by game)
  },
});

// GIL_687 - Unidentified Contract - Choose a minion. Destroy it
cardScriptsRegistry.register('GIL_687', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target as any;
    if (target) {
      const destroy = new Destroy();
      destroy.trigger(ctx.source, target);
    }
  },
});

// GIL_696 - Necrium Blade - Deathrattle: Trigger the Deathrattle of a random friendly minion
cardScriptsRegistry.register('GIL_696', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];
    const minionsWithDeathrattle = field.filter((m: any) => m !== source && m.deathrattle);
    if (minionsWithDeathrattle.length > 0) {
      const target = minionsWithDeathrattle[Math.floor(Math.random() * minionsWithDeathrattle.length)];
      const { executeDeathrattle } = require('../../index');
      executeDeathrattle(target);
    }
  },
});

// GIL_672 - Spectral Tracker - Battlecry: Shuffle 3 Wraiths into your deck
cardScriptsRegistry.register('GIL_672', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Shuffle 3 Wraiths into your deck (handled by game)
  },
});
