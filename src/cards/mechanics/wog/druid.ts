// wog - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// OG_051 - Forbidden Ancient - Battlecry: Spend all your Mana. Gain +1/+1 for each Mana spent.
cardScriptsRegistry.register('OG_051', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const manaSpent = controller.currentMana || 0;

    // Gain +1/+1 for each Mana spent
    const { Buff } = require('../../../actions/buff');
    const buff = new Buff(source, 'OG_051e');
    buff.setTag('ATK', manaSpent);
    buff.setTag('HEALTH', manaSpent);
    buff.apply(source);

    // Spend all mana
    controller.currentMana = 0;
  },
});

// OG_044
cardScriptsRegistry.register('OG_044', {
});

// OG_202 - Mire Keeper - Choose One - Summon a 2/2 Slime; or Gain an empty Mana Crystal.
cardScriptsRegistry.register('OG_202', {
  play: (ctx: ActionContext) => {
    // Choose One - implemented via OG_202a and OG_202b
  },
});

// OG_202a - Y'Shaarj's Strength - Summon a 2/2 Slime.
cardScriptsRegistry.register('OG_202a', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon(source, 'OG_202t');
    summon.trigger(source);
  },
});

// OG_202b - Yogg-Saron's Magic - Gain an empty Mana Crystal.
cardScriptsRegistry.register('OG_202b', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const { GainMana } = require('../../../actions/mana');
    const gainMana = new GainMana(controller, 1);
    gainMana.trigger(source);
  },
});

// OG_313 - Addled Grizzly - After you summon a Beast, give it +1/+1.
cardScriptsRegistry.register('OG_313', {
  events: {
    MINION_SUMMON: (ctx: ActionContext) => {
      const source = ctx.source as any;
      const target = ctx.target as any;

      // If a beast was summoned, give it +1/+1
      if (target.race === 'BEAST') {
        const { Buff } = require('../../../actions/buff');
        const buff = new Buff(source, 'OG_313e');
        buff.apply(target);
      }
    },
  },
});

// OG_188 - Klaxxi Amber-Weaver - Taunt. Battlecry: If your C'Thun has at least 10 Attack, gain +5 Health.
cardScriptsRegistry.register('OG_188', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;

    // Check C'Thun attack - simplified
    // In full implementation, would check actual C'Thun
    const { Buff } = require('../../../actions/buff');
    const buff = new Buff(source, 'OG_188e');
    buff.setTag('HEALTH', 5);
    buff.apply(source);
  },
});

// OG_293 - Dark Arakkoa - Taunt. Battlecry: Give your C'Thun +4/+4 (wherever it is).
cardScriptsRegistry.register('OG_293', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;

    // Give C'Thun +4/+4 - simplified
    // In full implementation, would buff C'Thun anywhere
  },
});

// OG_047 - Feral Rage - Choose One - Give your hero +4 Attack this turn; or Gain 8 Armor.
cardScriptsRegistry.register('OG_047', {
  play: (ctx: ActionContext) => {
    // Choose One - implemented via OG_047a and OG_047b
  },
});

// OG_047a - Evolve Spines - Give your hero +4 Attack this turn.
cardScriptsRegistry.register('OG_047a', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    // Give hero +4 Attack this turn - simplified
    const { Buff } = require('../../../actions/buff');
    const buff = new Buff(source, 'OG_047ae');
    buff.setTag('ATK', 4);
    buff.apply(controller.hero);
  },
});

// OG_047b - Evolve Scales - Gain 8 Armor.
cardScriptsRegistry.register('OG_047b', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;

    const { GainArmor } = require('../../../actions/gainarmor');
    const gainArmor = new GainArmor(controller, 8);
    gainArmor.trigger(source);
  },
});

// OG_048 - Mark of Y'Shaarj - Give a minion +2/+2. If it's a Beast, draw a card.
cardScriptsRegistry.register('OG_048', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
    [PlayReq.REQ_MINION_TARGET]: 1,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const target = ctx.target as any;
    const controller = source.controller;

    // Give +2/+2
    const { Buff } = require('../../../actions/buff');
    const buff = new Buff(source, 'OG_048e');
    buff.setTag('ATK', 2);
    buff.setTag('HEALTH', 2);
    buff.apply(target);

    // If it's a Beast, draw a card
    if (target.race === 'BEAST') {
      const { Draw } = require('../../../actions/draw');
      const draw = new Draw();
      draw.trigger(source);
    }
  },
});

// OG_195 - Wisps of the Old Gods - Choose One - Summon seven 1/1 Wisps; or Give your minions +2/+2.
cardScriptsRegistry.register('OG_195', {
  play: (ctx: ActionContext) => {
    // Choose One - implemented via OG_195a and OG_195b
  },
});

// OG_195a - Many Wisps - Summon seven 1/1 Wisps.
cardScriptsRegistry.register('OG_195a', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const { Summon } = require('../../../actions/summon');
    for (let i = 0; i < 7; i++) {
      const summon = new Summon(source, 'OG_195t');
      summon.trigger(source);
    }
  },
});

// OG_195b - Big Wisps - Give your minions +2/+2.
cardScriptsRegistry.register('OG_195b', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const field = controller.field || [];

    // Give all minions +2/+2
    const { Buff } = require('../../../actions/buff');
    for (const minion of field) {
      const buff = new Buff(source, 'OG_195be');
      buff.setTag('ATK', 2);
      buff.setTag('HEALTH', 2);
      buff.apply(minion);
    }
  },
});
