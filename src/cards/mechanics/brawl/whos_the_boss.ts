// brawl - whos_the_boss.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// BRMA01_2H_2_TB - Hero Power: Pardon
cardScriptsRegistry.register('BRMA01_2H_2_TB', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Remove all enchantments from target
      (ctx.target as any).silenced = true;
    }
  },
});

// BRMA02_2_2_TB - Hero Power: Dark Command
cardScriptsRegistry.register('BRMA02_2_2_TB', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Take control of enemy minion
      const controller = (ctx.source as any).controller;
      const opponent = controller.opponent;
      const target = ctx.target as any;
      target.controller = controller;
    }
  },
});

// BRMA02_2_2c_TB - Summon a Skeleton
cardScriptsRegistry.register('BRMA02_2_2c_TB', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('CS2_201');
    summon.trigger(ctx.source);
  },
});

// BRMA06_2H_TB - Hero Power: Freeze
cardScriptsRegistry.register('BRMA06_2H_TB', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Freeze } = require('../../../actions/freeze');
      const freeze = new Freeze();
      freeze.trigger(ctx.source, ctx.target);
    }
  },
});

// BRMA07_2_2_TB - Hero Power: Sacrifice
cardScriptsRegistry.register('BRMA07_2_2_TB', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      target.destroyed = true;
    }
  },
});

// BRMA07_2_2c_TB - Summon a Demon
cardScriptsRegistry.register('BRMA07_2_2c_TB', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summon = new Summon('CS2_121');
    summon.trigger(ctx.source);
  },
});

// BRMA09_2_TB - Hero Power: Heal
cardScriptsRegistry.register('BRMA09_2_TB', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(8);
      heal.trigger(ctx.source, ctx.target);
    }
  },
});

// BRMA14_10H_TB - Hero Power: Deal 10
cardScriptsRegistry.register('BRMA14_10H_TB', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(10);
      damage.trigger(ctx.source, ctx.target);
    }
  },
});

// BRMA13_4_2_TB - Hero Power: Deal 4
cardScriptsRegistry.register('BRMA13_4_2_TB', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    if (opponent.hero) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(4);
      damage.trigger(ctx.source, opponent.hero);
    }
  },
});

// BRMA17_5_TB - Hero Power: Deal 5
cardScriptsRegistry.register('BRMA17_5_TB', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(5);
      damage.trigger(ctx.source, ctx.target);
    }
  },
});

// NAX3_02_TB - Hero Power: Web
cardScriptsRegistry.register('NAX3_02_TB', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Freeze } = require('../../../actions/freeze');
      const freeze = new Freeze();
      freeze.trigger(ctx.source, ctx.target);
    }
  },
});

// NAX8_02H_TB - Hero Power: Raise Dead
cardScriptsRegistry.register('NAX8_02H_TB', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Deal 3 damage to your hero
    if (controller.hero) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(3);
      damage.trigger(ctx.source, controller.hero);
    }
  },
});

// NAX11_02H_2_TB - Hero Power: Unbalance
cardScriptsRegistry.register('NAX11_02H_2_TB', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    const oppField = opponent.field || [];
    for (const minion of oppField) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(4);
      damage.trigger(ctx.source, minion);
    }
  },
});

// NAX12_02H_2_TB - Hero Power: Polarity
cardScriptsRegistry.register('NAX12_02H_2_TB', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      // Swap Attack and Health
      const target = ctx.target as any;
      const temp = target.attack;
      target.attack = target.health;
      target.health = temp;
    }
  },
});

// NAX12_02H_2c_TB - Switch Sides
cardScriptsRegistry.register('NAX12_02H_2c_TB', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    const opponent = controller.opponent;
    // Swap decks
    const tempDeck = controller.deck;
    controller.deck = opponent.deck;
    opponent.deck = tempDeck;
  },
});
