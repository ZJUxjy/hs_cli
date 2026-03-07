// icecrown - shaman.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// ICC_058 - Brrrloc - Battlecry: Freeze an enemy
cardScriptsRegistry.register('ICC_058', {
  requirements: {
    [PlayReq.REQ_ENEMY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Freeze the target
      (ctx.target as any).frozen = true;
    }
  },
});

// ICC_088 - Snowfury Giant
// Costs (1) less for each overload you have this game
cardScriptsRegistry.register('ICC_088', {
  events: {
    // Reduce cost based on overload - handled by game
  },
});

// ICC_090 - Moorabi
// Whenever another Frozen minion is added to your hand, give it +2/+2
cardScriptsRegistry.register('ICC_090', {
});

// ICC_289 - Drakkari Defender
// Taunt. Battlecry: Deal 1 damage to your hero
cardScriptsRegistry.register('ICC_289', {
  events: {
    // Triggered effect on frozen minion added to hand
  },
});

// ICC_056 - Cryostasis - Give a minion +3/+3 and Freeze it
cardScriptsRegistry.register('ICC_056', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.attack = (target.attack || 0) + 3;
      target.health = (target.health || 0) + 3;
      target.maxHealth = (target.maxHealth || 0) + 3;
      target.frozen = true;
    }
  },
});

// ICC_078 - Avalanche - Freeze a minion and deal $3 damage to adjacent ones
cardScriptsRegistry.register('ICC_078', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.frozen = true;

      // Deal 3 damage to adjacent minions
      const controller = (ctx.source as any).controller;
      const field = controller.field || [];
      const targetIndex = field.indexOf(target);

      if (targetIndex > 0) {
        const leftMinion = field[targetIndex - 1];
        const { Damage } = require('../../../actions/damage');
        const damage = new Damage(ctx.source, leftMinion, 3);
        damage.trigger(ctx.source);
      }

      if (targetIndex < field.length - 1) {
        const rightMinion = field[targetIndex + 1];
        const { Damage } = require('../../../actions/damage');
        const damage = new Damage(ctx.source, rightMinion, 3);
        damage.trigger(ctx.source);
      }
    }
  },
});

// ICC_089 - Ice Fishing - Draw 2 Murlocs from your deck
cardScriptsRegistry.register('ICC_089', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Draw } = require('../../../actions/draw');
    const drawAction1 = new Draw();
    drawAction1.trigger(controller);
    const drawAction2 = new Draw();
    drawAction2.trigger(controller);
  },
});

// ICC_236 - Kalimos, Primal Lord
// Battlecry: If you overload this turn, summon a 6/6 Elemental
cardScriptsRegistry.register('ICC_236', {
  events: {
    // Check for overload - handled by game
  },
});

// ICC_481 - Un'Goro Pack
// Draw 3 cards
cardScriptsRegistry.register('ICC_481', {
  play: (ctx: ActionContext) => {
    const { Draw } = require('../../../actions/draw');
    const draw1 = new Draw(ctx.source, 1);
    draw1.trigger(ctx.source);
    const draw2 = new Draw(ctx.source, 1);
    draw2.trigger(ctx.source);
    const draw3 = new Draw(ctx.source, 1);
    draw3.trigger(ctx.source);
  },
});

// ICC_481p
cardScriptsRegistry.register('ICC_481p', {
});

// ICC_835p
cardScriptsRegistry.register('ICC_835p', {
});
