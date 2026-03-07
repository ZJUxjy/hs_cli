// tgt - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Damage, Heal, Give, Draw } from '../../../actions';

// AT_017 - Ravaging Ghoul - Battlecry: Deal 1 damage to all other minions
cardScriptsRegistry.register('AT_017', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent.field || [])];
    for (const minion of allMinions) {
      if (minion !== source) {
        const damage = new Damage(source, minion, 1);
        damage.trigger(source);
      }
    }
  },
});

// AT_080 - Clockwork Giant - Costs (1) less for each card in your hand
cardScriptsRegistry.register('AT_080', {
});

// AT_098 - Pit Fighter - Battlecry: Deal 5 damage to a random enemy minion
cardScriptsRegistry.register('AT_098', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const field = opponent.field || [];
    if (field.length > 0) {
      const target = field[Math.floor(Math.random() * field.length)];
      const damage = new Damage(source, target, 5);
      damage.trigger(source);
    }
  },
});

// AT_099 - Spinal Snap - Battlecry: Deal 3 damage to a random enemy minion
cardScriptsRegistry.register('AT_099', {
});

// AT_113 - Faceless Behemoth - Taunt
cardScriptsRegistry.register('AT_113', {
});

// AT_117 - Skycap'n Kragg - Battlecry: If you have a Dragon, gain +2/+2 and Taunt
cardScriptsRegistry.register('AT_117', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];
    const hasDragon = hand.some((card: any) => card.race === 'DRAGON');
    if (hasDragon) {
      const buff = new Buff(source, source, { ATK: 2, HEALTH: 2 });
      buff.trigger(source);
      (source as any).taunt = true;
    }
  },
});

// AT_118 - Chillmaw - Battlecry: If you're holding a Dragon, deal 3 damage to all other minions
cardScriptsRegistry.register('AT_118', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const hand = controller.hand || [];
    const hasDragon = hand.some((card: any) => card.race === 'DRAGON');
    if (hasDragon) {
      const opponent = controller.opponent;
      const allMinions = [...(controller.field || []), ...(opponent.field || [])];
      for (const minion of allMinions) {
        if (minion !== source) {
          const damage = new Damage(source, minion, 3);
          damage.trigger(source);
        }
      }
    }
  },
});

// AT_120 - Druid of the Mountain - 6/4
cardScriptsRegistry.register('AT_120', {
});

// AT_121 - Master of Ceremonies - Battlecry: If you have a minion with no enchantments, gain +2/+2
cardScriptsRegistry.register('AT_121', {
  events: {
    // If you have a minion with no enchantments, gain +2/+2 - handled by game
  },
});
