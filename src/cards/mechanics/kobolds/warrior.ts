// kobolds - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Give, Damage, Buff, Draw, Shuffle, Summon } from '../../../actions';
import { Entity } from '../../../core/entity';

// LOOT_041 Bring It On! - Gain 10 Armor. Deal 10 damage to your hero
cardScriptsRegistry.register('LOOT_041', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    // Gain 10 armor
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 10;
    }
    // Deal 10 damage to own hero
    if (controller?.hero) {
      const damage = new Damage(source, controller.hero, 10);
      damage.trigger(source);
    }
  },
});

// LOOT_365 Unidentified Shield - Gain 5 Armor
cardScriptsRegistry.register('LOOT_365', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 5;
    }
  },
});

// LOOT_367 Blood Razor - Battlecry: Deal 2 damage to all minions
cardScriptsRegistry.register('LOOT_367', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    const opponent = controller?.opponent;
    // Deal 2 damage to all minions on both fields
    const myField = controller?.field || [];
    const oppField = opponent?.field || [];
    for (const minion of [...myField, ...oppField]) {
      const damage = new Damage(source, minion, 2);
      damage.trigger(source);
    }
  },
});

// LOOT_519 Reckless Flurry - Destroy your Armor
cardScriptsRegistry.register('LOOT_519', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    // Deal damage equal to armor
    const armor = (controller?.hero as any)?.armor || 0;
    if (armor > 0) {
      const opponent = controller?.opponent;
      if (opponent?.hero) {
        const damage = new Damage(source, opponent.hero, armor);
        damage.trigger(source);
      }
      // Remove armor
      (controller.hero as any).armor = 0;
    }
  },
});

// LOOT_203 - Lesser Mithril Spellstone - Summon one 5/5 Mithril Golem
cardScriptsRegistry.register('LOOT_203', {
  play: (ctx: ActionContext) => {
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('LOOT_203t');
    summonAction.trigger(ctx.source);
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// LOOT_203t2
cardScriptsRegistry.register('LOOT_203t2', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// LOOT_203t3
cardScriptsRegistry.register('LOOT_203t3', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_285 - Unidentified Shield - Gain 5 Armor. Gains a bonus effect in your hand
cardScriptsRegistry.register('LOOT_285', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 5;
    }
  },
});

// LOOT_285t
cardScriptsRegistry.register('LOOT_285t', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_285t2 - Serrated Shield - Gain 5 Armor. Deal $5 damage
cardScriptsRegistry.register('LOOT_285t2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    // Gain 5 armor
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 5;
    }
    // Deal 5 damage to target
    if (ctx.target) {
      const damage = new Damage(source, ctx.target, 5);
      damage.trigger(source);
    }
  },
});

// LOOT_285t3 - Runed Shield - Gain 5 Armor. Summon a 5/5 Golem
cardScriptsRegistry.register('LOOT_285t3', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    // Gain 5 armor
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 5;
    }
    // Summon a 5/5 Golem
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon('LOOT_285t3t');
    summonAction.trigger(source);
  },
});

// LOOT_285t4 - Spiked Shield - Gain 5 Armor. Equip a 5/2 weapon
cardScriptsRegistry.register('LOOT_285t4', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source?.controller;
    // Gain 5 armor
    if (controller?.hero) {
      (controller.hero as any).armor = ((controller.hero as any).armor || 0) + 5;
    }
    // Equip a 5/2 weapon
    // Simplified: add attack to hero
    if (controller?.hero) {
      (controller.hero as any).attack = 5;
    }
  },
});

// LOOT_364
cardScriptsRegistry.register('LOOT_364', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_370
cardScriptsRegistry.register('LOOT_370', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_044
cardScriptsRegistry.register('LOOT_044', {
});

// LOOT_380
cardScriptsRegistry.register('LOOT_380', {
  events: { /* TODO */ },
});
