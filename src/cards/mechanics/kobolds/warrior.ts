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

// LOOT_203
cardScriptsRegistry.register('LOOT_203', {
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

// LOOT_285
cardScriptsRegistry.register('LOOT_285', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_285t
cardScriptsRegistry.register('LOOT_285t', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_285t2
cardScriptsRegistry.register('LOOT_285t2', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_285t3
cardScriptsRegistry.register('LOOT_285t3', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_285t4
cardScriptsRegistry.register('LOOT_285t4', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
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
