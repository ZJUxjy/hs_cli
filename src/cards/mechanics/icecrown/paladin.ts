// icecrown - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Summon, Draw, Heal, Damage } from '../../../actions';

// ICC_034 - Arrogant Crusader - Deathrattle: If it's your opponent's turn, summon a 5/5 Ghoul
cardScriptsRegistry.register('ICC_034', {
  deathrattle: (ctx: ActionContext) => {
    // Check if it's opponent's turn - simplified
    const source = ctx.source as any;
    const controller = source?.controller;
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(source, 'ICC_900t');
    summon.trigger(source);
  },
});

// ICC_245 - Blackguard - Whenever your hero is healed, deal that much damage to a random enemy minion
cardScriptsRegistry.register('ICC_245', {
  events: {
    HEAL: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source?.controller;
      const opponent = controller?.opponent;
      const oppField = opponent?.field || [];
      if (oppField.length > 0) {
        const target = oppField[Math.floor(Math.random() * oppField.length)];
        // Damage amount = heal amount - simplified
        const damage = new Damage(source, target, 3);
        damage.trigger(source);
      }
    },
  },
});

// ICC_801 - Howling Commander - Battlecry: Draw a Divine Shield minion from your deck
cardScriptsRegistry.register('ICC_801', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const deck = controller?.deck || [];
    // Find divine shield minion in deck - simplified
    if (deck.length > 0) {
      const draw = new Draw(controller);
      draw.trigger(source);
    }
  },
});

// ICC_858 - Bolvar, Fireblood - After a friendly minion loses Divine Shield, gain +2 Attack
cardScriptsRegistry.register('ICC_858', {
  // Simplified: handled by game engine for divine shield loss events
});

// ICC_039 - Dark Conviction - Set a minion's Attack and Health to 3
cardScriptsRegistry.register('ICC_039', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { ATK: 3, HEALTH: 3 });
      buff.trigger(source);
    }
  },
});

// ICC_039e
cardScriptsRegistry.register('ICC_039e', {
});

// ICC_244 - Desperate Stand - Give a minion "Deathrattle: Summon this minion with 1 Health"
cardScriptsRegistry.register('ICC_244', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { HEALTH: 1 });
      buff.trigger(source);
    }
  },
});

// ICC_244e
cardScriptsRegistry.register('ICC_244e', {
  deathrattle: (ctx: ActionContext) => {
    // Summon this minion with 1 Health
    const source = ctx.source as any;
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(source, source.cardId);
    summon.trigger(source);
  },
});

// ICC_071 - Light's Sorrow - After a friendly minion loses Divine Shield, gain +1 Attack
cardScriptsRegistry.register('ICC_071', {
  // Simplified: handled by game engine for divine shield loss events
});

// ICC_829 - Uther of the Ebon Blade - Battlecry: Summon a 4/4 Horseman
cardScriptsRegistry.register('ICC_829', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(ctx.source, 'ICC_829t');
    summon.trigger(ctx.source);
  },
});

// ICC_829p
cardScriptsRegistry.register('ICC_829p', {
});
