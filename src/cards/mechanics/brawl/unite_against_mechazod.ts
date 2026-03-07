// brawl - unite_against_mechazod.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// TB_CoOp_Mechazod - Boss: Mechazod
cardScriptsRegistry.register('TB_CoOp_Mechazod', {
  events: {
    'TURN_END': (ctx: ActionContext) => {
      const controller = (ctx.source as any).controller;
      // Deal 1 damage to both heroes
      if (controller.hero) {
        const { Damage } = require('../../../actions/damage');
        const damage = new Damage(1);
        damage.trigger(ctx.source, controller.hero);
      }
      const opponent = controller.opponent;
      if (opponent.hero) {
        const { Damage } = require('../../../actions/damage');
        const damage = new Damage(1);
        damage.trigger(ctx.source, opponent.hero);
      }
    },
  },
});

// TB_CoOpBossSpell_1 - Zapper
cardScriptsRegistry.register('TB_CoOpBossSpell_1', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(2);
      damage.trigger(ctx.source, minion);
    }
  },
});

// TB_CoOpBossSpell_2 - Whomp
cardScriptsRegistry.register('TB_CoOpBossSpell_2', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('CS2_101t');
    summon.trigger(ctx.source);
  },
});

// TB_CoOpBossSpell_3 -拆
cardScriptsRegistry.register('TB_CoOpBossSpell_3', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Destroy a random enemy minion
    const oppField = opponent.field || [];
    if (oppField.length > 0) {
      const randomIndex = Math.floor(Math.random() * oppField.length);
      const target = oppField[randomIndex];
      (target as any).destroyed = true;
    }
  },
});

// TB_CoOpBossSpell_4 - Eye Beam
cardScriptsRegistry.register('TB_CoOpBossSpell_4', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(3);
      damage.trigger(ctx.source, minion);
    }
    if (opponent.hero) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(3);
      damage.trigger(ctx.source, opponent.hero);
    }
  },
});

// TB_CoOpBossSpell_5 - Supercharge
cardScriptsRegistry.register('TB_CoOpBossSpell_5', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    for (const minion of field) {
      const { Buff } = require('../../../actions/buff');
      const buff = new Buff('TB_CoOpBossSpell_5e', { ATK: 2, HEALTH: 2 });
      buff.trigger(ctx.source, minion);
    }
  },
});

// TB_CoOpBossSpell_6 - Volley
cardScriptsRegistry.register('TB_CoOpBossSpell_6', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(1);
      damage.trigger(ctx.source, minion);
    }
  },
});
