// kobolds - rogue.py
import { cardScriptsRegistry, ActionContext } from '../../index';
import { PlayReq } from '../../../enums/playreq';

// LOOT_026
cardScriptsRegistry.register('LOOT_026', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_026e
cardScriptsRegistry.register('LOOT_026e', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_033
cardScriptsRegistry.register('LOOT_033', {
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_165
cardScriptsRegistry.register('LOOT_165', {
  events: {
    // TODO: implement events
  },
});

// LOOT_165e
cardScriptsRegistry.register('LOOT_165e', {
});

// LOOT_211
cardScriptsRegistry.register('LOOT_211', {
  requirements: {
    // TODO: add requirements
  },
});

// LOOT_412
cardScriptsRegistry.register('LOOT_412', {
  deathrattle: (ctx: ActionContext) => {
    // TODO: implement deathrattle
  },
});

// LOOT_412e
cardScriptsRegistry.register('LOOT_412e', {
});

// LOOT_204
cardScriptsRegistry.register('LOOT_204', {
});

// LOOT_204e
cardScriptsRegistry.register('LOOT_204e', {
  events: {
    // TODO: implement events
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
    const { Give } = require('../../actions/give');
    const giveAction = new Give('LOOT_214t2');
    giveAction.trigger(ctx.source);
  },
});

// LOOT_214t2 The Kings
cardScriptsRegistry.register('LOOT_214t2', {
  play: (ctx: ActionContext) => {
    // Discover a card from opponent's class
  },
});

// LOOT_503
cardScriptsRegistry.register('LOOT_503', {
  requirements: {
    // TODO: add requirements
  },
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

// LOOT_503t
cardScriptsRegistry.register('LOOT_503t', {
  requirements: {
    // TODO: add requirements
  },
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

// LOOT_503t2
cardScriptsRegistry.register('LOOT_503t2', {
  requirements: {
    // TODO: add requirements
  },
  play: (ctx: ActionContext) => {
    // TODO: implement play effect
  },
});

// LOOT_542
cardScriptsRegistry.register('LOOT_542', {
  deathrattle: (ctx: ActionContext) => { /* TODO */ },
});
