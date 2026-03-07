// dragons - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Heal, Damage, Draw } from '../../../actions';

// DRG_090 - Murozond (Legendary)
// Battlecry: Gain an empty Mana Crystal for each minion you control
cardScriptsRegistry.register('DRG_090', {
  play: (ctx: ActionContext) => {
    // Gain an empty Mana Crystal for each minion you control
    const controller = (ctx.source as any).controller;
    const field = controller.field || [];
    const count = field.length;
    // Gain mana crystals
    if ((controller as any).maxMana !== undefined) {
      (controller as any).maxMana += count;
    }
  },
});

// DRG_300 - Darkshire Councilman (Rare)
// After you play a minion, give it +1/+1
cardScriptsRegistry.register('DRG_300', {
  events: {
    AFTER_MINION_PLAY: (ctx: ActionContext) => {
      const target = ctx.target;
      if (target) {
        const buff = new Buff(ctx.source, target, { ATK: 1, HEALTH: 1 });
        buff.trigger(ctx.source);
      }
    },
  },
});

// DRG_300e - Darkshire Councilman buff
cardScriptsRegistry.register('DRG_300e', {
});

// DRG_303 - Dragonqueen Alexstrasza (Legendary)
// Battlecry: If your deck contains no duplicates, Discover two Dragons
cardScriptsRegistry.register('DRG_303', {
  play: (ctx: ActionContext) => {
    // If your deck contains no duplicates, Discover two Dragons
  },
});

// DRG_304 - Alexstrasza (Legendary)
// Battlecry: Set a hero's remaining Health to 15
cardScriptsRegistry.register('DRG_304', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  deathrattle: (ctx: ActionContext) => {
    // Set a hero's remaining Health to 15
    const target = ctx.target;
    if (target) {
      (target as any).health = 15;
    }
  },
  play: (ctx: ActionContext) => {
    // Set a hero's remaining Health to 15
    const target = ctx.target;
    if (target) {
      (target as any).health = 15;
    }
  },
});

// DRG_306 - Lightborn Sorcerer (Rare)
// Battlecry: If your deck contains no duplicates, restore 5 Health
cardScriptsRegistry.register('DRG_306', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // If your deck contains no duplicates, restore 5 Health
    const controller = (ctx.source as any).controller;
    const deck = controller.deck || [];
    // Check if deck has no duplicates (simplified check)
    const hasDuplicates = deck.length !== new Set(deck.map((c: any) => c.id)).size;
    if (!hasDuplicates && deck.length > 0) {
      const target = ctx.target;
      if (target) {
        const heal = new Heal(ctx.source, target, 5);
        heal.trigger(ctx.source);
      }
    }
  },
});

// DRG_308 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('DRG_308', {
  deathrattle: (ctx: ActionContext) => {
    // Your other Murlocs have +1 Attack
  },
});

// DRG_246 - Murloc Tidecaller (Common)
// Your other Murlocs have +1 Attack
cardScriptsRegistry.register('DRG_246', {
});
