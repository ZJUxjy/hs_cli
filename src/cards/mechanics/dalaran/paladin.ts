// dalaran - paladin.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// DAL_146 - Bronze Herald (Common)
// Battlecry: Add two 1/1 Whelps to your hand
cardScriptsRegistry.register('DAL_146', {
  deathrattle: (ctx: ActionContext) => {
    // Add two 1/1 Whelps to your hand
  },
  play: (ctx: ActionContext) => {
    // Add two 1/1 Whelps to your hand
  },
});

// DAL_147 - Lightforged Zealot (Rare)
// Battlecry: If your deck contains no duplicates, gain Divine Shield
cardScriptsRegistry.register('DAL_147', {
  play: (ctx: ActionContext) => {
    // If your deck contains no duplicates, gain Divine Shield
  },
});

// DAL_573 - Bronze Dragon (Common)
// Battlecry: Give a friendly minion +1/+1
cardScriptsRegistry.register('DAL_573', {
});

// DAL_581 - Nozdormu (Legendary)
// Players only have 15 seconds to take their turns
cardScriptsRegistry.register('DAL_581', {
  play: (ctx: ActionContext) => {
    // Players only have 15 seconds to take their turns
  },
});

// DAL_141 - Crystalizer (Rare)
// Battlecry: Deal 5 damage to your hero. Gain 5 Armor
cardScriptsRegistry.register('DAL_141', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Deal 5 damage to your hero
    if (controller.hero) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(ctx.source, controller.hero, 5);
      damage.trigger(ctx.source);
    }
    // Gain 5 Armor
    (controller as any).armor = ((controller as any).armor || 0) + 5;
  },
});

// DAL_568 - Amber Watcher (Rare)
// Battlecry: Restore 8 Health
cardScriptsRegistry.register('DAL_568', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const controller = (ctx.source as any).controller;
    // Restore 8 Health to hero
    if (controller.hero) {
      const { Heal } = require('../../../actions/heal');
      const heal = new Heal(ctx.source, controller.hero, 8);
      heal.trigger(ctx.source);
    }
  },
});

// DAL_570 - Shirvallah, the Tiger (Legendary)
// Restore 5 Health. Draw cards until your hand is full
cardScriptsRegistry.register('DAL_570', {
});

// DAL_727 - Sandwasp Queen (Common)
// Battlecry: Add two 1/1 Wasps to your hand
cardScriptsRegistry.register('DAL_727', {
  play: (ctx: ActionContext) => {
    // Add two 1/1 Wasps to your hand
  },
});

// DAL_731 - Sir Finley of the Sands (Legendary)
// Battlecry: If your deck contains no duplicates, Discover a new Hero Power
cardScriptsRegistry.register('DAL_731', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // If your deck contains no duplicates, Discover a new Hero Power - handled by game
  },
});

// DAL_571 - EVIL Miscreant (Rare)
// Combo: Add two 1/1 Lackeys to your hand
cardScriptsRegistry.register('DAL_571', {
  play: (ctx: ActionContext) => {
    // Combo: Add two 1/1 Lackeys to your hand
  },
});
