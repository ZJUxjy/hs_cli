#!/usr/bin/env ts-node
// Simple game runner example

import { Game, Player } from './src/core';
import { CardLoader } from './src/cards/loader';
import { CardClass } from './src/enums';

// Load card definitions
console.log('Loading cards...');
CardLoader.loadFromXML('./src/cards/CardDefs.xml');
console.log(`Loaded ${CardLoader.getAll().length} cards`);

// Create players
const player1 = new Player({
  name: 'Player 1',
  cardClass: CardClass.MAGE,
});

const player2 = new Player({
  name: 'Player 2',
  cardClass: CardClass.WARRIOR,
});

// Create game
const game = new Game({
  players: [player1, player2],
  seed: Date.now(),
});

console.log('\n=== Hearthstone JS Fireplace ===');
console.log(`Player 1: ${player1.name} (${CardClass[player1.cardClass]})`);
console.log(`Player 2: ${player2.name} (${CardClass[player2.cardClass]})`);
console.log('\nGame initialized!');
console.log('Note: Full game loop not yet implemented.');
console.log('This is a library for card game simulation.');

// Example: Get a card and show its info
const fireball = CardLoader.get('CS2_029');
if (fireball) {
  console.log(`\nExample card: ${fireball.name}`);
  console.log(`Cost: ${fireball.cost}, Type: ${fireball.type}`);
}
