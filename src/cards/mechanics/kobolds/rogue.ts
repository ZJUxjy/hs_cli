// kobolds - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';
import { Draw, Give, Buff, Summon } from '../../../actions';

// LOOT_026 - Cutlass
// Deal 1 damage. Combo: Deal 2 instead
cardScriptsRegistry.register('LOOT_026', {
  play: (ctx: ActionContext) => {
    // Combo effect handled by game
  },
});

// LOOT_026e
cardScriptsRegistry.register('LOOT_026e', {
});

// LOOT_033 - Sonya Shadowdancer
// After a friendly minion dies, add a 1/1 copy to your hand
cardScriptsRegistry.register('LOOT_033', {
  play: (ctx: ActionContext) => {
    // This is handled by the events system
  },
});

// LOOT_165 - Fal'dorei Strider
// Battlecry: Shuffle 3 Amet/3Raptors into your deck
cardScriptsRegistry.register('LOOT_165', {
  events: {
    // This is a complex effect handled by game
  },
});

// LOOT_165e
cardScriptsRegistry.register('LOOT_165e', {
});

// LOOT_211 - Elven Minstrel
// Battlecry: Draw a card
cardScriptsRegistry.register('LOOT_211', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
});

// LOOT_412 - Cavern Shinyfinder
// Battlecry: Draw a weapon from your deck
cardScriptsRegistry.register('LOOT_412', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const deck = controller?.deck as any[];
    if (!deck) return;

    // Find a weapon in deck
    const weapon = deck.find((card: any) => (card as any).type === 'WEAPON');
    if (weapon) {
      // Draw the weapon
      const hand = controller?.hand || [];
      hand.push(weapon);
      // Remove from deck
      const deckIndex = deck.indexOf(weapon);
      if (deckIndex !== -1) {
        deck.splice(deckIndex, 1);
      }
    }
  },
});

// LOOT_412e
cardScriptsRegistry.register('LOOT_412e', {
});

// LOOT_204
cardScriptsRegistry.register('LOOT_204', {
});

// LOOT_204e - Kobold Illusionist buff
cardScriptsRegistry.register('LOOT_204e', {
  events: {
    // Handled by game
  },
});

// LOOT_210
cardScriptsRegistry.register('LOOT_210', {
});

// LOOT_214 King Togwaggle
// Battlecry: Swap decks with your opponent
cardScriptsRegistry.register('LOOT_214', {
  play: (ctx: ActionContext) => {
    const source = ctx.source as any;
    const controller = source.controller;
    const opponent = controller.opponent;
    const game = ctx.game;

    // Swap decks between controller and opponent
    const controllerDeck = controller.deck || [];
    const opponentDeck = opponent.deck || [];

    // Store deck contents
    const controllerDeckCopy = [...controllerDeck];
    const opponentDeckCopy = [...opponentDeck];

    // Clear and swap
    controller.deck = opponentDeckCopy;
    opponent.deck = controllerDeckCopy;

    // Give the King Togwaggle's至尊盗王 to opponent (LOOT_214t)
    const { Give } = require('../../actions/give');
    const giveAction = new Give('LOOT_214t');
    giveAction.trigger(source, opponent);
  },
});

// LOOT_214t Togwaggle's Treasure
cardScriptsRegistry.register('LOOT_214t', {
  play: (ctx: ActionContext) => {
    // When played, add a "The Kings" card to hand
    const source = ctx.source as any;
    const controller = source.controller;
    const { Give } = require('../../actions/give');
    const giveAction = new Give('LOOT_214t2');
    giveAction.trigger(source, controller);
  },
});

// LOOT_214t2 The Kings
cardScriptsRegistry.register('LOOT_214t2', {
  play: (ctx: ActionContext) => {
    // Discover a card from opponent's class
  },
});

// LOOT_503 - Valeera the Hollow
// Battlecry: Gain Stealth until end of turn
cardScriptsRegistry.register('LOOT_503', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    const source = ctx.source;
    (source as any).stealth = true;
  },
});

// Hand - Valeera the Hollow buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_503t - Valeera's hero power
cardScriptsRegistry.register('LOOT_503t', {
  requirements: {
    [PlayReq.REQ_TARGET_TO_PLAY]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// Hand - Valeera the Hollow buff
cardScriptsRegistry.register('Hand', {
  events: {
    // Handled by game
  },
});

// LOOT_503t2 - Shadow Reflection
cardScriptsRegistry.register('LOOT_503t2', {
  requirements: {
    [PlayReq.REQ_MINION_TARGET]: 0,
  },
  play: (ctx: ActionContext) => {
    // Handled by game
  },
});

// LOOT_542 - Spectral Pillager
// Deathrattle: Deal 6 damage to a random enemy
cardScriptsRegistry.register('LOOT_542', {
  deathrattle: (ctx: ActionContext) => {
    const source = ctx.source;
    const controller = (source as any).controller;
    const opponent = controller?.opponent;

    if (!opponent) return;

    const targets = [...(opponent.field || []), opponent.hero];
    const validTargets = targets.filter((t: any) => t !== undefined);

    if (validTargets.length > 0) {
      const randomIndex = Math.floor(Math.random() * validTargets.length);
      const target = validTargets[randomIndex];
      const { Damage } = require('../../../actions/damage');
      const damage = new Damage(source, target, 6);
      damage.trigger(source);
    }
  },
});
