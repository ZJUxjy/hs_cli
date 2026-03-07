// witchwood - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Race } from '../../../enums';
import { Damage, Draw, Buff, Summon, Heal, Give } from '../../../actions';

// GIL_130 - Gloom Stag - Taunt. Battlecry: If you have 3 or more minions, give +2/+2
cardScriptsRegistry.register('GIL_130', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    if (field.length >= 3) {
      const buff = new Buff(ctx.source, ctx.source, { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// GIL_188 - Witchwood Grizzly - Taunt. Battlecry: Deal 1 damage to all other minions
cardScriptsRegistry.register('GIL_188', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Damage all other friendly minions
    const myField = controller.field || [];
    for (const minion of myField) {
      if (minion !== ctx.source) {
        const damage = new Damage(ctx.source, minion, 1);
        damage.trigger(ctx.source);
      }
    }
    // Damage all enemy minions
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const damage = new Damage(ctx.source, minion, 1);
      damage.trigger(ctx.source);
    }
  },
});

// GIL_188a - (Choice 1) +3/+3
cardScriptsRegistry.register('GIL_188a', {
});

// GIL_188b - (Choice 2) +4/+4
cardScriptsRegistry.register('GIL_188b', {
});

// GIL_507 - Root Wall - Gain 10 Armor
cardScriptsRegistry.register('GIL_507', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    if (controller.hero) {
      controller.hero.armor = (controller.hero.armor || 0) + 10;
    }
  },
});

// GIL_658 - Forest Guide - At the end of your turn, draw a card if you have more minions
cardScriptsRegistry.register('GIL_658', {
  events: {
    TURN_END: (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const myField = controller.field || [];
      const oppField = (controller.opponent?.field || []).length;
      if (myField.length > oppField) {
        const drawAction = new Draw(ctx.source, 1);
        drawAction.trigger(ctx.source);
      }
    },
  },
});

// GIL_658e - Forest Guide Enchantment
cardScriptsRegistry.register('GIL_658e', {
});

// GIL_800 - Bewhispered - Add 2 random minions to your hand
cardScriptsRegistry.register('GIL_800', {
  play: (ctx: ActionContext) => {
    // Add 2 random minions - placeholder
  },
});

// GIL_800e2 - Whisper Enchantment
cardScriptsRegistry.register('GIL_800e2', {
});

// GIL_833 - Ferocious Howl - Draw a card. If you have 7 or more cards in hand, draw 3
cardScriptsRegistry.register('GIL_833', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const hand = controller.hand || [];
    const count = hand.length >= 7 ? 3 : 1;
    for (let i = 0; i < count; i++) {
      const drawAction = new Draw(ctx.source, 1);
      drawAction.trigger(ctx.source);
    }
  },
});

// GIL_553 - Druid of the Scythe - Choose One - Transform into a 4/2 with Charge or 2/4 with Taunt
cardScriptsRegistry.register('GIL_553', {
});

// GIL_571 - Druid of the Fang - Battlecry: If you have a Beast, gain +2/+2
cardScriptsRegistry.register('GIL_571', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      if ((minion as any).race === Race.BEAST) {
        const buff = new Buff(ctx.source, ctx.source, { ATK: 2, HEALTH: 2 });
        buff.trigger(ctx.source);
        break;
      }
    }
  },
});

// GIL_637 - Ironwood Golem - Taunt. Can only attack if you have 3 or more cards in hand
cardScriptsRegistry.register('GIL_637', {
});

// GIL_663 - Gloom Stag - Already registered above
cardScriptsRegistry.register('GIL_663', {
});

// GIL_555 - Predatory Instincts - Draw 2 cards
cardScriptsRegistry.register('GIL_555', {
  play: (ctx: ActionContext) => {
    const drawAction = new Draw(ctx.source, 1);
    drawAction.trigger(ctx.source);
    drawAction.trigger(ctx.source);
  },
});
