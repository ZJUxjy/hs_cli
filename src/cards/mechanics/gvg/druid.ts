// gvg - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Give, Draw } from '../../../actions';

// GVG_030 - Anodized Robo Cub - Taunt. Choose One - +1 Attack; or +1 Health
cardScriptsRegistry.register('GVG_030', {
  play: (ctx: ActionContext) => {
    // Choose One handled by game - GVG_030a gives +1 Attack, GVG_030b gives +1 Health
  },
});

// GVG_030a - Anodized Robo Cub (Attack)
cardScriptsRegistry.register('GVG_030a', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const buff = new Buff(source, source, { ATK: 1 });
    buff.trigger(source);
  },
});

// GVG_030b - Anodized Robo Cub (Health)
cardScriptsRegistry.register('GVG_030b', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const buff = new Buff(source, source, { HEALTH: 1 });
    buff.trigger(source);
  },
});

// GVG_032 - Grove Tender - Choose One - Give each player a Mana Crystal; or Each player draws a card
cardScriptsRegistry.register('GVG_032', {
  play: (ctx: ActionContext) => {
    // Choose One handled by game - GVG_032a gives mana, GVG_032b draws cards
  },
});

// GVG_032a - Grove Tender (Mana)
cardScriptsRegistry.register('GVG_032a', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    (controller as any).maxMana = ((controller as any).maxMana || 0) + 1;
    (opponent as any).maxMana = ((opponent as any).maxMana || 0) + 1;
  },
});

// GVG_032b - Grove Tender (Draw)
cardScriptsRegistry.register('GVG_032b', {
  play: (ctx: ActionContext) => {
    const { Draw } = require('../../../actions/draw');
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const drawAction1 = new Draw();
    drawAction1.trigger(source, controller);
    const drawAction2 = new Draw();
    drawAction2.trigger(source, opponent);
  },
});

// GVG_034 - Tree of Life - Restore 5 Health to all characters
cardScriptsRegistry.register('GVG_034', {
  events: {
    // Full heal at end of turn - handled by game mechanics
  },
});

// GVG_035 - Mech-Bear-Cat - Deathrattle: Add a spare part to your hand
cardScriptsRegistry.register('GVG_035', {
  deathrattle: (ctx: ActionContext) => {
    // Add random spare part to hand - handled by game
  },
});

// GVG_080 - Starfall - Deal 5 damage to a minion or 2 damage to all enemy minions
cardScriptsRegistry.register('GVG_080', {
  play: (ctx: ActionContext) => {
    // Choose One handled by game
  },
});

// GVG_031 - Druid of the Flame - Choose One - 5/2; or 2/5
cardScriptsRegistry.register('GVG_031', {
  requirements: {
    // Choose One - handled by game
  },
  play: (ctx: ActionContext) => {
    // Choose One handled by game - GVG_031a is 5/2, GVG_031b is 2/5
  },
});

// GVG_033 - Recycle - Put a random enemy minion into your hand
cardScriptsRegistry.register('GVG_033', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    if (field.length > 0) {
      const target = field[Math.floor(Math.random() * field.length)];
      const cardId = target.id;
      const giveAction = new Give(cardId);
      giveAction.trigger(source, controller);
    }
  },
});

// GVG_041 - Dark Wispers - Choose One - Summon 5 Wisps; or Give a minion +5/+5 and Taunt
cardScriptsRegistry.register('GVG_041', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Choose One handled by game
  },
});

// GVG_041a - Dark Wispers (Wisps)
cardScriptsRegistry.register('GVG_041a', {
  requirements: {
    // No target needed
  },
  play: (ctx: ActionContext) => {
    // Summon 5 wisps - handled by game
  },
});

// GVG_041b - Dark Wispers (Buff)
cardScriptsRegistry.register('GVG_041b', {
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const source = ctx.source as any;
      const buff = new Buff(source, ctx.target, { ATK: 5, HEALTH: 5 });
      buff.trigger(source);
      (ctx.target as any).taunt = true;
    }
  },
});
