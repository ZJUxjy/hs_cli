// brawl - ktraf.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TB_KTRAF_HP_KT_3 - Hero Power: Ruulb
cardScriptsRegistry.register('TB_KTRAF_HP_KT_3', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    if (oppField.length > 0) {
      const randomIndex = Math.floor(Math.random() * oppField.length);
      const target = oppField[randomIndex];
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(2);
      damage.trigger(ctx.source, target);
    }
  },
});

// TB_KTRAF_1 - Summon a 1/1 with Taunt
cardScriptsRegistry.register('TB_KTRAF_1', {
  events: {
    'TURN_START': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const { Summon } = require('../../../actions/summon');
      const summon = new Summon('CS2_101t');
      summon.trigger(ctx.source);
    },
  },
});

// TB_KTRAF_2 - Ruulb the Great
cardScriptsRegistry.register('TB_KTRAF_2', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Summon } = require('../../../actions/summon');
    // Summon two 1/1s with Taunt
    const summon1 = new Summon('CS2_101t');
    summon1.trigger(ctx.source);
    const summon2 = new Summon('CS2_101t');
    summon2.trigger(ctx.source);
  },
});

// TB_KTRAF_2s - Small Threat
cardScriptsRegistry.register('TB_KTRAF_2s', {
  play: (ctx: ActionContext) => {
    const { Buff } = require('../../../actions/buff');
    const buff = new Buff('CS2_101t', { ATK: 2, HEALTH: 2 });
    buff.trigger(ctx.source, ctx.source);
  },
});

// TB_KTRAF_3 - Finkle Einhorn
cardScriptsRegistry.register('TB_KTRAF_3', {
  events: {
    'TURN_START': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const { Draw } = require('../../../actions/draw');
      const draw = new Draw(ctx.source, 1);
      draw.trigger(ctx.source);
    },
  },
});

// TB_KTRAF_4 - Baron Rivendare
cardScriptsRegistry.register('TB_KTRAF_4', {
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('TB_KTRAF_4');
    summon.trigger(ctx.source);
  },
});

// TB_KTRAF_4m - Shudderwraith
cardScriptsRegistry.register('TB_KTRAF_4m', {
  events: {
    'TURN_START': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const { Summon } = require('../../../actions/summon');
      const summon = new Summon('CS2_101t');
      summon.trigger(ctx.source);
    },
  },
});

// TB_KTRAF_5 - Twisted Worgen
cardScriptsRegistry.register('TB_KTRAF_5', {
});

// TB_KTRAF_6 - Wrath of Ragnaros
cardScriptsRegistry.register('TB_KTRAF_6', {
  events: {
    'TURN_END': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      const opponent = controller.opponent;
      const oppField = opponent.field || [];
      if (oppField.length > 0) {
        const randomIndex = Math.floor(Math.random() * oppField.length);
        const target = oppField[randomIndex];
        const { Damage } = require('../../../actions/damage');
        const damage = new Damage(8);
        damage.trigger(ctx.source, target);
      }
    },
  },
});

// TB_KTRAF_7 - Sneed's Old Minion
cardScriptsRegistry.register('TB_KTRAF_7', {
  events: {
    'DEATH': (ctx: ActionContext) => {
      if (ctx.target) {
        const controller = (ctx.source as any).controller;
        const { Summon } = require('../../../actions/summon');
        // Summon a random legendary minion
        const summon = new Summon('CS2_122');
        summon.trigger(ctx.source);
      }
    },
  },
});

// TB_KTRAF_8 - High Justice Mogor
cardScriptsRegistry.register('TB_KTRAF_8', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      // All minions attack random targets
    }
  },
});

// TB_KTRAF_08w - Flamerift
cardScriptsRegistry.register('TB_KTRAF_08w', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    if (opponent.hero) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(6);
      damage.trigger(ctx.source, opponent.hero);
    }
  },
});

// TB_KTRAF_10 - Summon 3 Whelps
cardScriptsRegistry.register('TB_KTRAF_10', {
  events: {
    'TURN_START': (ctx: ActionContext) => {
      const { Summon } = require('../../../actions/summon');
      for (let i = 0; i < 3; i++) {
        const summon = new Summon('CS2_102t');
        summon.trigger(ctx.source);
      }
    },
  },
});

// TB_KTRAF_11 - Lord Overheat
cardScriptsRegistry.register('TB_KTRAF_11', {
  events: {
    'SPELL': (ctx: ActionContext) => {
      if (ctx.source !== ctx.target) {
        const { Damage } = require('../../../actions/damage');
        const opponent = (ctx.source as any).controller.opponent;
        if (opponent.hero) {
          const damage = new Damage(1);
          damage.trigger(ctx.source, opponent.hero);
        }
      }
    },
  },
});

// TB_KTRAF_12 - Faceless Summoner
cardScriptsRegistry.register('TB_KTRAF_12', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    // Summon a random 3-cost minion
    const summon = new Summon('CS2_122');
    summon.trigger(ctx.source);
  },
});

// TB_KTRAF_101 - Unstable Portal
cardScriptsRegistry.register('TB_KTRAF_101', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Give } = require('../../../actions/give');
    const give = new Give('GAME_003');
    give.trigger(ctx.source, controller.hero);
  },
});

// TB_KTRAF_104 - Flameheart
cardScriptsRegistry.register('TB_KTRAF_104', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Draw } = require('../../../actions/draw');
    const draw = new Draw(ctx.source, 2);
    draw.trigger(ctx.source);
  },
});
