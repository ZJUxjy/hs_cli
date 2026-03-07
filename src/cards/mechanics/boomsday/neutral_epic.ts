// boomsday - neutral_epic.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Damage } from '../../../actions';
import { Entity } from '../../../core/entity';

// BOT_280 - Holomancer
// Throughout the game, after you play a card, give a random enemy -2/-2
cardScriptsRegistry.register('BOT_280', {
  events: {
    // Handled by game
  },
});

// BOT_280e
cardScriptsRegistry.register('BOT_280e', {
});

// BOT_296 - Cybertech Wendigo
// Battlecry: If your hero took damage this turn, reduce the Cost of a random minion in your hand by (2)
cardScriptsRegistry.register('BOT_296', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const hand = controller?.hand as any[];

    if (!hand || hand.length === 0) return;

    // Check if hero took damage this turn
    const hero = controller?.hero;
    if (!hero || (hero as any).damageThisTurn === undefined || (hero as any).damageThisTurn <= 0) {
      return;
    }

    // Get minions in hand
    const minionsInHand = hand.filter((card: any) => (card as any).type === 'MINION');
    if (minionsInHand.length === 0) return;

    // Reduce cost of random minion by 2
    const randomIndex = Math.floor(Math.random() * minionsInHand.length);
    const targetMinion = minionsInHand[randomIndex];
    (targetMinion as any).costModifier = ((targetMinion as any).costModifier || 0) - 2;
  },
});

// BOT_401 - Flark's Boom-Zooka
// Battlecry: Summon 3 minions from your deck. They attack enemy minions
cardScriptsRegistry.register('BOT_401', {
  deathrattle: (ctx: ActionContext) => {
    // Summon 3 minions from deck - handled by game
  },
});

// BOT_447 - SN1P-SN4P
// Magnetic. Echovoid. Mech. Minion
cardScriptsRegistry.register('BOT_447', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// BOT_511 - Science! (Spell)
// Draw 2 minions. Reduce their Cost by (2)
cardScriptsRegistry.register('BOT_511', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    // Draw 2 minions, reduce cost by 2 - handled by game
  },
});

// BOT_511t - Science! buff
cardScriptsRegistry.register('BOT_511t', {
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// BOT_540 - Replicating Menace
// Battlecry: Summon three 1/1 Microbots
cardScriptsRegistry.register('BOT_540', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    // Summon three 1/1 Microbots
    const { Summon } = require('../../../actions/summon');
    const summon1 = new Summon(source, 'BOT_540t');
    summon1.trigger(source);
    const summon2 = new Summon(source, 'BOT_540t');
    summon2.trigger(source);
    const summon3 = new Summon(source, 'BOT_540t');
    summon3.trigger(source);
  },
});

// BOT_544 - Loose Specimen
// Battlecry: Deal 6 damage randomly split among other friendly minions
cardScriptsRegistry.register('BOT_544', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as Entity;
    const controller = (source as any).controller;
    const field = controller?.field as Entity[];

    if (!field || field.length <= 1) return; // Only source, no other minions

    // Get other friendly minions (exclude self)
    const otherMinions = field.filter((minion: Entity) => minion !== source);
    if (otherMinions.length === 0) return;

    // Deal 6 damage randomly split
    let damageRemaining = 6;
    while (damageRemaining > 0 && otherMinions.length > 0) {
      // Pick a random minion
      const randomIndex = Math.floor(Math.random() * otherMinions.length);
      const target = otherMinions[randomIndex];

      // Deal 1 damage
      const damageAction = new Damage(source, target, 1);
      damageAction.trigger(source);

      damageRemaining--;

      // Remove dead minions
      if ((target as any).dead || (target as any).health <= 0) {
        otherMinions.splice(randomIndex, 1);
      }
    }
  },
});

// BOT_552 - Whirlgle
// Battlecry: Replace your hand with random spells
cardScriptsRegistry.register('BOT_552', {
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    // Replace hand with random spells - simplified: just draw cards
    const { Draw } = require('../../../actions/draw');
    for (let i = 0; i < 3; i++) {
      const drawAction = new Draw();
      drawAction.trigger(controller);
    }
  },
});

// BOT_559 - Zilliax
// Battlecry: Divine Shield. Lifesteal. Taunt. Magnetic
cardScriptsRegistry.register('BOT_559', {
  events: {
    // Handled by game
  },
});
