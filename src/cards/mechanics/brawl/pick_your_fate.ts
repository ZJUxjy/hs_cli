// brawl - pick_your_fate.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TB_PickYourFateRandom - Fate card
cardScriptsRegistry.register('TB_PickYourFateRandom', {
  events: {
    'TURN_START': (ctx: ActionContext) => {
      // Random effect
    },
  },
});

// TB_PickYourFate_2nd - Fate card
cardScriptsRegistry.register('TB_PickYourFate_2nd', {
  events: {
    'TURN_END': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const { Draw } = require('../../../actions/draw');
      const draw = new Draw(ctx.source, 1);
      draw.trigger(ctx.source);
    },
  },
});

// TB_PickYourFate_2 - Unstable Portal
cardScriptsRegistry.register('TB_PickYourFate_2', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Give } = require('../../../actions/give');
    const give = new Give('GAME_003');
    give.trigger(ctx.source, controller.hero);
  },
});

// TB_PickYourFate_2_Ench - Unstable Portal buff
cardScriptsRegistry.register('TB_PickYourFate_2_Ench', {
  events: {
    'TURN_END': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const { Draw } = require('../../../actions/draw');
      const draw = new Draw(ctx.source, 1);
      draw.trigger(ctx.source);
    },
  },
});

// TB_PickYourFate_2_EnchMinion - Unstable Portal minion buff
cardScriptsRegistry.register('TB_PickYourFate_2_EnchMinion', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Give } = require('../../../actions/give');
    const give = new Give('GAME_003');
    give.trigger(ctx.source, controller.hero);
  },
});

// TB_PickYourFate_5 - Bananas
cardScriptsRegistry.register('TB_PickYourFate_5', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('TB_PickYourFate_5_Ench', { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source, minion);
    }
  },
});

// TB_PickYourFate_5_Ench - Bananas buff
cardScriptsRegistry.register('TB_PickYourFate_5_Ench', {
});

// TB_PickYourFate_6 - Murloc
cardScriptsRegistry.register('TB_PickYourFate_6', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('CS2_168');
    summon.trigger(ctx.source);
  },
});

// TB_PickYourFate_7 - Spells cost 0
cardScriptsRegistry.register('TB_PickYourFate_7', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Set all spells in hand to 0 cost
  },
});

// TB_PickYourFate_7Ench - Spells cost 0 buff
cardScriptsRegistry.register('TB_PickYourFate_7Ench', {
  events: {
    'PLAY_SPELL': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(2);
      damage.trigger(ctx.source, controller.opponent.hero);
    },
  },
});

// TB_PickYourFate_7_EnchMinion - Spells cost 0 minion buff
cardScriptsRegistry.register('TB_PickYourFate_7_EnchMinion', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Draw } = require('../../../actions/draw');
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// TB_PickYourFate_8rand - Random minion
cardScriptsRegistry.register('TB_PickYourFate_8rand', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('CS2_122');
    summon.trigger(ctx.source);
  },
});

// TB_PickYourFate_8_EnchRand - Random minion buff
cardScriptsRegistry.register('TB_PickYourFate_8_EnchRand', {
  events: {
    'DEATH': (ctx: ActionContext) => {
      if (ctx.target) {
        const controller = (ctx.source as any).controller;
        const { Summon } = require('../../../actions/summon');
        const summon = new Summon('CS2_122');
        summon.trigger(ctx.source);
      }
    },
  },
});

// TB_PickYourFate_12 - Taunt
cardScriptsRegistry.register('TB_PickYourFate_12', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('TB_PickYourFate_12_Ench', { TAUNT: true });
      buff.trigger(ctx.source, minion);
    }
  },
});

// TB_PickYourFate_12_Ench - Taunt buff
cardScriptsRegistry.register('TB_PickYourFate_12_Ench', {
});

// TB_PickYourFate_1 - +1/+1 to all minions
cardScriptsRegistry.register('TB_PickYourFate_1', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const myField = controller.field || [];
    const oppField = opponent.field || [];
    const { Buff } = require('../../../actions/buff');
    for (const minion of [...myField, ...oppField]) {
      const buff = new Buff('TB_PickYourFate_1_Ench', { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source, minion);
    }
  },
});

// TB_PickYourFate_1_Ench - +1/+1 buff
cardScriptsRegistry.register('TB_PickYourFate_1_Ench', {
  events: {
    'TURN_START': (ctx: ActionContext) => {
      // Refresh buff
    },
  },
});

// TB_PickYourFate_3 - Deathrattle: Summon 2 1/1s
cardScriptsRegistry.register('TB_PickYourFate_3', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon('CS2_101t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon('CS2_101t');
    summon2.trigger(ctx.source);
  },
});

// TB_PickYourFate_3_Ench - Deathrattle buff
cardScriptsRegistry.register('TB_PickYourFate_3_Ench', {
  events: {
    'DEATH': (ctx: ActionContext) => {
      const { Summon } = require('../../../actions/summon');
      const summon1 = new Summon('CS2_101t');
      summon1.trigger(ctx.source);
      const summon2 = new Summon('CS2_101t');
      summon2.trigger(ctx.source);
    },
  },
});

// TB_PickYourFate_4 - Deathrattle: Destroy a random enemy minion
cardScriptsRegistry.register('TB_PickYourFate_4', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    if (oppField.length > 0) {
      const randomIndex = Math.floor(Math.random() * oppField.length);
      const target = oppField[randomIndex];
      (target as any).destroyed = true;
    }
  },
});

// TB_PickYourFate_4_Ench - Deathrattle destroy buff
cardScriptsRegistry.register('TB_PickYourFate_4_Ench', {
  events: {
    'DEATH': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const opponent = controller.opponent;
      const oppField = opponent.field || [];
      if (oppField.length > 0) {
        const randomIndex = Math.floor(Math.random() * oppField.length);
        const target = oppField[randomIndex];
        (target as any).destroyed = true;
      }
    },
  },
});

// TB_PickYourFate_4_EnchMinion - Deathrattle minion buff
cardScriptsRegistry.register('TB_PickYourFate_4_EnchMinion', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    if (oppField.length > 0) {
      const randomIndex = Math.floor(Math.random() * oppField.length);
      const target = oppField[randomIndex];
      (target as any).destroyed = true;
    }
  },
});

// TB_PickYourFate_6_2nd - Murloc 2nd
cardScriptsRegistry.register('TB_PickYourFate_6_2nd', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    for (let i = 0; i < 2; i++) {
      const summon = new Summon('CS2_168');
      summon.trigger(ctx.source);
    }
  },
});

// TB_PickYourFate_7_2nd - Spells cost 0 2nd
cardScriptsRegistry.register('TB_PickYourFate_7_2nd', {
  play: (ctx: ActionContext) => {
    // Spells cost 0 this turn
  },
});

// TB_PickYourFate_7_Ench_2nd - Spells cost 0 2nd buff
cardScriptsRegistry.register('TB_PickYourFate_7_Ench_2nd', {
  events: {
    'PLAY_SPELL': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(4);
      damage.trigger(ctx.source, controller.opponent.hero);
    },
  },
});

// TB_PickYourFate_7_EnchMiniom2nd - Spells cost 0 2nd minion buff
cardScriptsRegistry.register('TB_PickYourFate_7_EnchMiniom2nd', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Draw } = require('../../../actions/draw');
    const draw = new Draw(ctx.source, 2);
    draw.trigger(ctx.source);
  },
});

// TB_PickYourFate_7_EnchMiniom2nde - Spells cost 0 2nd minion enchant
cardScriptsRegistry.register('TB_PickYourFate_7_EnchMiniom2nde', {
  events: {
    'PLAY_SPELL': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(3);
      damage.trigger(ctx.source, controller.opponent.hero);
    },
  },
});

// TB_PickYourFate_11rand - Inspire: Summon a random minion
cardScriptsRegistry.register('TB_PickYourFate_11rand', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('CS2_122');
    summon.trigger(ctx.source);
  },
});

// TB_PickYourFate_11 - Inspire
cardScriptsRegistry.register('TB_PickYourFate_11', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Draw } = require('../../../actions/draw');
    const draw = new Draw(ctx.source, 1);
    draw.trigger(ctx.source);
  },
});

// TB_PickYourFate_11_Ench - Inspire buff
cardScriptsRegistry.register('TB_PickYourFate_11_Ench', {
  events: {
    'INSPIRE': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const { Draw } = require('../../../actions/draw');
      const draw = new Draw(ctx.source, 1);
      draw.trigger(ctx.source);
    },
  },
});

// TB_PickYourFate_8 - Start of Game: Draw cards
cardScriptsRegistry.register('TB_PickYourFate_8', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Draw } = require('../../../actions/draw');
    const draw = new Draw(ctx.source, 3);
    draw.trigger(ctx.source);
  },
});

// TB_PickYourFate_8_Ench - Start of Game buff
cardScriptsRegistry.register('TB_PickYourFate_8_Ench', {
});

// TB_PickYourFate_9 - +3/+3 to all minions
cardScriptsRegistry.register('TB_PickYourFate_9', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const myField = controller.field || [];
    const oppField = opponent.field || [];
    const { Buff } = require('../../../actions/buff');
    for (const minion of [...myField, ...oppField]) {
      const buff = new Buff('TB_PickYourFate_9_Ench', { ATK: 3, HEALTH: 3 });
      buff.trigger(ctx.source, minion);
    }
  },
});

// TB_PickYourFate_9_Ench - +3/+3 buff
cardScriptsRegistry.register('TB_PickYourFate_9_Ench', {
});

// TB_PickYourFate_10 - +5/+5 to all minions
cardScriptsRegistry.register('TB_PickYourFate_10', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const myField = controller.field || [];
    const oppField = opponent.field || [];
    const { Buff } = require('../../../actions/buff');
    for (const minion of [...myField, ...oppField]) {
      const buff = new Buff('TB_PickYourFate_10_Ench', { ATK: 5, HEALTH: 5 });
      buff.trigger(ctx.source, minion);
    }
  },
});

// TB_PickYourFate_10_Ench - +5/+5 buff
cardScriptsRegistry.register('TB_PickYourFate_10_Ench', {
});

// TB_PickYourFate_11b - Inspire: Give +1/+1
cardScriptsRegistry.register('TB_PickYourFate_11b', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const { Buff } = require('../../../actions/buff');
    for (const minion of field) {
      const buff = new Buff('TB_PickYourFate_11_Ench', { ATK: 1, HEALTH: 1 });
      buff.trigger(ctx.source, minion);
    }
  },
});
