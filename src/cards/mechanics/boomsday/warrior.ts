// boomsday - warrior.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// BOT_059 - Eternium Rover
// Whenever this minion takes damage, gain +2 Attack
cardScriptsRegistry.register('BOT_059', {
  events: {
    // Handled by game
  },
});

// BOT_104 - Rocket Boots
// Give a minion Rush
cardScriptsRegistry.register('BOT_104', {
  play: (ctx: ActionContext) => {
    // Give Rush - handled by game
  },
});

// BOT_218 - Beryllium Nullifier
// Taunt. Can't be targeted by spells
cardScriptsRegistry.register('BOT_218', {
  events: {
    // Handled by game
  },
});

// BOT_237 - Security Rover
// Battlecry: Summon two 1/1 Mech-Drones
cardScriptsRegistry.register('BOT_237', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon(source, 'BOT_237t');
    summon1.trigger(source);
    const summon2 = new Summon(source, 'BOT_237t');
    summon2.trigger(source);
  },
});

// BOT_042 - Claw Machine
// Battlecry: Deal 3 damage. Draw a card
cardScriptsRegistry.register('BOT_042', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;

    // Deal 3 damage to enemy hero
    if (opponent?.hero) {
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(source, opponent.hero, 3);
      damage.trigger(source);
    }
    // Draw a card
    const { Draw } = require('../../../actions/draw');
    const drawAction = new Draw();
    drawAction.trigger(controller);
  },
});

// BOT_067 - The Boomship
cardScriptsRegistry.register('BOT_067', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Already implemented in neutral_legendary.ts - The Boomship
  },
});

// BOT_069 - The Boomship
cardScriptsRegistry.register('BOT_069', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Already implemented in neutral_legendary.ts - The Boomship
  },
});

// BOT_299 -Omega Assembly
// Discover a Mech
cardScriptsRegistry.register('BOT_299', {
  play: (ctx: ActionContext) => {
    // Discover a Mech - handled by game
  },
});

// BOT_406 - Dyn-o-matic
// Battlecry: Deal 3 damage to all other minions
cardScriptsRegistry.register('BOT_406', {
  events: {
    // Handled by game
  },
});

// BOT_238 - Dr. Boom, Mad Genius
cardScriptsRegistry.register('BOT_238', {
  play: (ctx: ActionContext) => {
    // Already implemented in neutral_legendary.ts
  },
});

// BOT_238e - Dr. Boom buff
cardScriptsRegistry.register('BOT_238e', {
});

// BOT_238p - Dr. Boom's hero power
cardScriptsRegistry.register('BOT_238p', {
  events: {
    // Handled by game
  },
});

// BOT_238p1 - Boom Barrage
cardScriptsRegistry.register('BOT_238p1', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  events: {
    // Handled by game
  },
});

// BOT_238p2 - Mega-Bomb
cardScriptsRegistry.register('BOT_238p2', {
  events: {
    // Handled by game
  },
});

// BOT_238p3 - Research
cardScriptsRegistry.register('BOT_238p3', {
  events: {
    // Handled by game
  },
});

// BOT_238p4 - Recycling
cardScriptsRegistry.register('BOT_238p4', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  events: {
    // Handled by game
  },
});

// BOT_238p6 - Unused hero power
cardScriptsRegistry.register('BOT_238p6', {
  events: {
    // Handled by game
  },
});
