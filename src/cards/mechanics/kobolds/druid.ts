// kobolds - druid.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Buff, Summon } from '../../../actions';

// LOOT_048
cardScriptsRegistry.register('LOOT_048', {
});

// LOOT_056 - Ironwood Golem
// Taunt. Deathrattle: Gain +1/+1 for each Armor you have
cardScriptsRegistry.register('LOOT_056', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const armor = (controller as any).armor || 0;
    const buff = new (require('../../../actions/buff').Buff)(source, source, { ATK: armor, HEALTH: armor });
    buff.trigger(source);
  },
});

// LOOT_314 - Grizzled Guardian
// Taunt. Deathrattle: Summon two 2/2 Treants
cardScriptsRegistry.register('LOOT_314', {
  deathrattle: (ctx: ActionContext) => {
    const summonAction1 = new Summon(ctx.source, 'LOOT_314t');
    summonAction1.trigger(ctx.source);
    const summonAction2 = new Summon(ctx.source, 'LOOT_314t');
    summonAction2.trigger(ctx.source);
  },
});

// LOOT_329 - Kun the Forgotten King
// Battlecry: Refresh your Mana Crystals. Gain 10 Armor
cardScriptsRegistry.register('LOOT_329', {
  events: {
    // Refresh mana crystals and gain armor - handled by game
  },
});

// LOOT_351 - Wispering Woods
// Taunt. Deathrattle: Summon a 1/1 Wisp for each spell in your hand
cardScriptsRegistry.register('LOOT_351', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const hand = controller?.hand as any[];
    if (!hand) return;

    const spellCount = hand.filter((card: any) => (card as any).type === 'SPELL').length;

    for (let i = 0; i < spellCount; i++) {
      const summonAction = new Summon(source, 'LOOT_351t');
      summonAction.trigger(source);
    }
  },
});

// LOOT_047 Elise the Trailblazer
// Battlecry: Shuffle a "Missing!" card into your deck. When drawn, discover a Treasure
cardScriptsRegistry.register('LOOT_047', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 1,
  },
  play: (ctx: ActionContext) => {
    // Shuffle LOOT_047t (Unidentified Contract) into deck
    const { Shuffle } = require('../../actions/shuffle');
    const shuffleAction = new Shuffle('LOOT_047t');
    shuffleAction.trigger(ctx.source);
  },
});

// LOOT_047t Unidentified Contract (Treasure discover)
cardScriptsRegistry.register('LOOT_047t', {
  play: (ctx: ActionContext) => {
    // This card triggers a discover effect for treasures
    // In a full implementation, this would open a discover choice
  },
});

// LOOT_051 - Fandral Staghelm
// Choose One - Gain +1/+1; or Restore 4 Health
cardScriptsRegistry.register('LOOT_051', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Choose One - handled by game
  },
});

// Hand - Fandral Staghelm buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_051t1 - Fandral choice 1
cardScriptsRegistry.register('LOOT_051t1', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// Hand - Fandral Staghelm buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_051t2 - Fandral choice 2
cardScriptsRegistry.register('LOOT_051t2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_054 - Oakheart
// Battlecry: Choose a minion. Summon a 5/5 Oakheart with Taunt
cardScriptsRegistry.register('LOOT_054', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon(source, 'LOOT_054t');
    summonAction.trigger(source);
  },
});

// LOOT_054b - Oakheart choose 1
cardScriptsRegistry.register('LOOT_054b', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_054c - Oakheart choose 2
cardScriptsRegistry.register('LOOT_054c', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_054d - Oakheart choose 3
cardScriptsRegistry.register('LOOT_054d', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_309 - Twig of the World Tree
// Battlecry: Gain +10 Attack
cardScriptsRegistry.register('LOOT_309', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const buff = new Buff(source, source, { ATK: 10 });
    buff.trigger(source);
  },
});

// LOOT_392 - Ironwood Tree
// Deathrattle: Gain 6 Armor
cardScriptsRegistry.register('LOOT_392', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    (controller as any).armor = ((controller as any).armor || 0) + 6;
  },
});
