// kobolds - priest.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage, Draw, Buff, Give, Shuffle, Summon, Heal } from '../../../actions';

// LOOT_410 - Psychic Scream - Shuffle all minions into your opponent's deck
cardScriptsRegistry.register('LOOT_410', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const allMinions = [...(controller.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      const shuffleAction = new Shuffle((minion as any).cardId);
      shuffleAction.trigger(source);
      (minion as any).destroyed = true;
    }
  },
});

// LOOT_528 - Shadow Ascendant - Battlecry: Give a friendly minion +2 Health
cardScriptsRegistry.register('LOOT_528', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    if (ctx.target) {
      const buff = new Buff(ctx.source, ctx.target, { HEALTH: 2 });
      buff.trigger(ctx.source);
    }
  },
});

// LOOT_528e
cardScriptsRegistry.register('LOOT_528e', {
});

// LOOT_534 - Obsidian Statue - Taunt. Deathrattle: Restore 5 health to your hero
cardScriptsRegistry.register('LOOT_534', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    if (controller?.hero) {
      const heal = new Heal(source, controller.hero, 5);
      heal.trigger(source);
    }
  },
});

// LOOT_538
cardScriptsRegistry.register('LOOT_538', {
});

// LOOT_008 - Awaken the Makers - Restore 7 Health to your hero
cardScriptsRegistry.register('LOOT_008', {
  requirements: {
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    if (controller?.hero) {
      const heal = new Heal(source, controller.hero, 7);
      heal.trigger(source);
    }
  },
});

// LOOT_187 - Eternal Servitude
// Discover a friendly minion that died this game
cardScriptsRegistry.register('LOOT_187', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Discover a friendly minion - handled by game
  },
});

// LOOT_187e - Eternal Servitude buff
cardScriptsRegistry.register('LOOT_187e', {
});

// LOOT_278 - Shadowreaper Anduin
// Battlecry: Destroy all minions with 5 or more Attack
cardScriptsRegistry.register('LOOT_278', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;

    // Destroy all minions with 5+ Attack
    const allMinions = [...(controller?.field || []), ...(opponent?.field || [])];
    for (const minion of allMinions) {
      if ((minion as any).attack >= 5) {
        (minion as any).destroyed = true;
      }
    }
  },
});

// LOOT_278t1 - Voidform
cardScriptsRegistry.register('LOOT_278t1', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_278t2 - Embrace Darkness
cardScriptsRegistry.register('LOOT_278t2', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_278t2e - Embrace Darkness buff
cardScriptsRegistry.register('LOOT_278t2e', {
});

// LOOT_278t3 - Shadow Word: Ruin
cardScriptsRegistry.register('LOOT_278t3', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_278t3e2 - Shadow Word: Ruin buff
cardScriptsRegistry.register('LOOT_278t3e2', {
});

// LOOT_278t4 - Purify
cardScriptsRegistry.register('LOOT_278t4', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_278t4e - Purify buff
cardScriptsRegistry.register('LOOT_278t4e', {
  deathrattle: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_353 - G'huun
// Battlecry: Draw 2 cards
cardScriptsRegistry.register('LOOT_353', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    // Draw 2 cards
    for (let i = 0; i < 2; i++) {
      const drawAction = new Draw(source);
      drawAction.trigger(source);
    }
  },
});

// LOOT_507 - Temporus
// Battlecry: Your opponent takes an extra turn
cardScriptsRegistry.register('LOOT_507', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// Hand - Temporus buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_507t - Time Warp
cardScriptsRegistry.register('LOOT_507t', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// Hand - Temporus buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_507t2 - Time Warp buff
cardScriptsRegistry.register('LOOT_507t2', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_209 - Zola the Gorgon
// Battlecry: Choose a friendly minion and summon a copy of it
cardScriptsRegistry.register('LOOT_209', {
  events: {
    // Handled by game
  },
});
