// tgt - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// AT_038 - Darnassus Aspirant - Battlecry: Gain an empty Mana Crystal. Deathrattle: Lose a Mana Crystal
cardScriptsRegistry.register('AT_038', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    (controller as any).maxMana = ((controller as any).maxMana || 0) + 1;
  },
  deathrattle: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    (controller as any).maxMana = Math.max(0, ((controller as any).maxMana || 0) - 1);
  },
});

// AT_039 - Druid of the Flame
cardScriptsRegistry.register('AT_039', {
});

// AT_040 - Wildwalker - Battlecry: Give a friendly Beast +3 Health
cardScriptsRegistry.register('AT_040', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
    [PlayReq.REQ_FRIENDLY_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const { Buff } = require('../../../actions/buff');
      const buffAction = new Buff('AT_040e', { HEALTH: 3 });
      buffAction.trigger(ctx.source, ctx.target);
    }
  },
});

// AT_041
cardScriptsRegistry.register('AT_041', {
});

// Hand
cardScriptsRegistry.register('Hand', {
  events: {
    // TODO: implement events
  },
});

// AT_041e
cardScriptsRegistry.register('AT_041e', {
  events: {
    // TODO: implement events
  },
});

// AT_042
cardScriptsRegistry.register('AT_042', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// AT_042a
cardScriptsRegistry.register('AT_042a', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// AT_042b
cardScriptsRegistry.register('AT_042b', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// AT_045
cardScriptsRegistry.register('AT_045', {
});

// AT_037
cardScriptsRegistry.register('AT_037', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// AT_037a
cardScriptsRegistry.register('AT_037a', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// AT_037b
cardScriptsRegistry.register('AT_037b', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// AT_043 - Astral Communion - Gain 10 Mana Crystals. Discard your hand
cardScriptsRegistry.register('AT_043', {
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    (controller as any).maxMana = 10;
    (controller as any).mana = 10;
    // Discard hand
    (controller as any).hand = [];
  },
});

// AT_044 - Mulch - Destroy a minion. Add its Attack to your opponent's hand
cardScriptsRegistry.register('AT_044', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const target = ctx.target as any;
      const attack = target.attack || 0;
      // Destroy target
      const { Destroy } = require('../../../actions/destroy');
      const destroyAction = new Destroy();
      destroyAction.trigger(ctx.source, target);
      // Give attack to opponent
      const controller = (ctx.source as any).controller;
      const opponent = controller.opponent;
      // In a full implementation, this would add a card to opponent's hand
      console.log(`Mulch: Add ${attack} attack to opponent's hand`);
    }
  },
});
