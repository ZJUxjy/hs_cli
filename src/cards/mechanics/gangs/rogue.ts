// gangs - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Give } from '../../../actions';

// CFM_342 - Luckydo Buccaneer - Battlecry: If you have a weapon with 3+ Attack, gain +4/+4
cardScriptsRegistry.register('CFM_342', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const weapon = controller?.weapon;
    if (weapon && (weapon.atk >= 3 || weapon.attack >= 3)) {
      const buff = new Buff(source, source, { ATK: 4, HEALTH: 4 });
      buff.trigger(source);
    }
  },
});

// CFM_634 - Lotus Assassin - Combo: If this killed a minion, gain Stealth
cardScriptsRegistry.register('CFM_634', {
  events: {
    ATTACK: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const target = ctx.target;
      if (target && (target as any).dead) {
        // Gain stealth - handled by game engine
      }
    },
  },
});

// CFM_693 - Gadgetzan Ferryman - Combo: Return a friendly minion to your hand
cardScriptsRegistry.register('CFM_693', {
  requirements: {
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_TARGET_FOR_COMBO]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target;
    if (target) {
      const { Bounce } = require('../../../actions/bounce');
      const bounce = new Bounce(source, target);
      bounce.trigger(source);
    }
  },
});

// CFM_694 - Shadow Sensei - Battlecry: Give a Stealthed minion +2/+2
cardScriptsRegistry.register('CFM_694', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_STEALTHED_TARGET]: 0,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target;
    if (target) {
      const buff = new Buff(source, target, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
    }
  },
});

// CFM_781 - Shaku, the Collector - After this minion attacks, add a random card to your hand
cardScriptsRegistry.register('CFM_781', {
  events: {
    ATTACK: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const controller = source?.controller;
      // Add random card from enemy class - simplified
      const cardId = 'CS2_101'; // placeholder
      const give = new Give(cardId);
      give.trigger(source, controller);
    },
  },
});

// CFM_630 - Counterfeit Coin - Gain 1 Mana this turn
cardScriptsRegistry.register('CFM_630', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    if (controller) {
      controller.mana = (controller.mana || 0) + 1;
    }
  },
});
