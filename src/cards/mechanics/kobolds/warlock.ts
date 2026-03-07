// kobolds - warlock.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// LOOT_013 Ravenous Pterrordax
// Battlecry: Destroy a friendly minion and gain its Attack
cardScriptsRegistry.register('LOOT_013', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 1,
    [PlayReq.REQ_FRIENDLY_TARGET]: 1,
    [PlayReq.REQ_TARGET_IF_AVAILABLE]: 1,
  },
  play: (ctx: ActionContext) => {
    const target = ctx.target;
    if (target) {
      const attack = (target as any).attack || 0;
      // Destroy the friendly minion
      (target as any).destroyed = true;
      // Gain attack equal to the destroyed minion's attack
      const source = ctx.source as any;
      source.attack = (source.attack || 0) + attack;
    }
  },
});

// LOOT_014 - Carnivorous Cube
// Battlecry: Summon 2 copies of a friendly minion
cardScriptsRegistry.register('LOOT_014', {
  play: (ctx: ActionContext) => {
    // Summon 2 copies - handled by game
  },
});

// LOOT_018 - Void Lord
// Taunt. Battlecry: Destroy a random friendly minion
cardScriptsRegistry.register('LOOT_018', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const field = controller?.field || [];

    // Exclude self
    const otherMinions = field.filter((minion: any) => minion !== source);
    if (otherMinions.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherMinions.length);
      (otherMinions[randomIndex] as any).destroyed = true;
    }
  },
});

// LOOT_306 - Possessed Lackey
// Deathrattle: Summon a random Demon
cardScriptsRegistry.register('LOOT_306', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    // Summon random Demon - handled by game
  },
});

// LOOT_368 - Voidlord
// Taunt. Deathrattle: Summon three 1/3 Demons
cardScriptsRegistry.register('LOOT_368', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    const { Summon } = require('../../../actions/summon');
    for (let i = 0; i < 3; i++) {
      const summonAction = new Summon(source, 'LOOT_368t');
      summonAction.trigger(source);
    }
  },
});

// LOOT_415 - Skull of the Man'ari
// At the end of your turn, summon a random Demon
cardScriptsRegistry.register('LOOT_415', {
  deathrattle: (ctx: ActionContext) => {
    // Summon random Demon - handled by game
  },
});

// LOOT_415t1 - Summon 5/5
cardScriptsRegistry.register('LOOT_415t1', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_415t2 - Summon 3/3
cardScriptsRegistry.register('LOOT_415t2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_415t3 - Summon 2/2
cardScriptsRegistry.register('LOOT_415t3', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_415t4 - Summon 1/1
cardScriptsRegistry.register('LOOT_415t4', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_415t5 - Summon 8/8
cardScriptsRegistry.register('LOOT_415t5', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_415t6 - Summon 3/1
cardScriptsRegistry.register('LOOT_415t6', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_017 - Doubling Imp
// Battlecry: Summon a copy of this minion
cardScriptsRegistry.register('LOOT_017', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const { Summon } = require('../../../actions/summon');
    const summonAction = new Summon(source, source);
    summonAction.trigger(source);
  },
});

// LOOT_043 - Bloodreaver Gul'dan
// Battlecry: Summon all friendly Demons that died this game
cardScriptsRegistry.register('LOOT_043', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Summon died demons - handled by game
  },
});

// Hand - Bloodreaver Gul'dan buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_043t2 - Gul'dan's hero power
cardScriptsRegistry.register('LOOT_043t2', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// Hand - Bloodreaver Gul'dan buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_043t3 - Gul'dan's hero power
cardScriptsRegistry.register('LOOT_043t3', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_417 - Hooked Reaver
// Battlecry: If you have a Demon in your hand, gain +2/+2
cardScriptsRegistry.register('LOOT_417', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const hand = controller?.hand || [];

    // Check if we have a Demon in hand
    const hasDemon = hand.some((card: any) => (card as any).race === 'demon');
    if (hasDemon) {
      (source as any).bonusAttack = ((source as any).bonusAttack || 0) + 2;
      (source as any).bonusHealth = ((source as any).bonusHealth || 0) + 2;
    }
  },
});

// LOOT_420 - Rin, the First Disciple
// Battlecry: Add a "Seal" to your hand
cardScriptsRegistry.register('LOOT_420', {
  events: {
    // Handled by game
  },
});
