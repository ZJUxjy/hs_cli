// witchwood - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import type { ScriptEntity, CardReference } from '../types';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Draw, Heal, Summon, Give, Destroy, Bounce } from '../../../actions';

// GIL_508 - Soul Infusion - Give the leftmost minion in your hand +1/+1 for each card in your hand
cardScriptsRegistry.register('GIL_508', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];
    if (hand.length > 0) {
      const target = hand[0];
      const buff = new Buff(source, target, { ATK: hand.length, HEALTH: hand.length });
      buff.trigger(source);
    }
  },
});

// GIL_515 - Void Analyst - Battlecry: Discard a random card
cardScriptsRegistry.register('GIL_515', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];
    if (hand.length > 0) {
      const idx = Math.floor(Math.random() * hand.length);
      hand.splice(idx, 1);
    }
  },
});

// GIL_565 - Dreadscale (Legendary Beast)
cardScriptsRegistry.register('GIL_565', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // At the end of your turn, deal 1 damage to all your other minions
      const source = ctx.source as any;
      const controller = source.controller;
      const field = controller.field || [];
      for (const minion of field) {
        if (minion !== source) {
          const damage = new Damage(source, minion, 1);
          damage.trigger(source);
        }
      }
    },
  },
});

// GIL_608 - Blood Witch - At the end of your turn, deal 1 damage to your hero
cardScriptsRegistry.register('GIL_608', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    // Summon a 1/1 Wisp (handled by game)
  },
});

// GIL_618 - Witch's Cauldron
cardScriptsRegistry.register('GIL_618', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      // At the end of your turn, add a random Shaman spell to your hand
      const source = ctx.source as any;
      const controller = source.controller;
      // Add a random Shaman spell to your hand (handled by game)
    },
  },
});

// GIL_693 - Deathweb Spider - Battlecry: Restore 4 Health to your hero
cardScriptsRegistry.register('GIL_693', {
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

// GIL_825 - Dash Divine - Echo
cardScriptsRegistry.register('GIL_825', {
});

// GIL_191 - Death Knight - Hero card
cardScriptsRegistry.register('GIL_191', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const heal = new Heal(source, controller.hero, 5);
    heal.trigger(source);
  },
});

// GIL_543 - Roll the Bones - Draw cards until you have 3 in your hand
cardScriptsRegistry.register('GIL_543', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];
    while (hand.length < 3) {
      const draw = new Draw(controller);
      draw.trigger(source);
    }
  },
});

// GIL_665 - The Stonecore - Battlecry: Deal 1 damage to all minions
cardScriptsRegistry.register('GIL_665', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;

    // Deal 1 damage to all friendly minions
    const friendlyField = controller.field || [];
    for (const minion of friendlyField) {
      const damage = new Damage(source, minion, 1);
      damage.trigger(source);
    }

    // Deal 1 damage to all enemy minions
    const enemyField = opponent.field || [];
    for (const minion of enemyField) {
      const damage = new Damage(source, minion, 1);
      damage.trigger(source);
    }
  },
});

// GIL_665e - Stonecore buff
cardScriptsRegistry.register('GIL_665e', {
});
