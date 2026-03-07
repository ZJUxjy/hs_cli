#!/usr/bin/env ts-node
// Simple game runner example

import { Game } from './core';
import { Player } from './core/player';
import { CardLoader } from './cards/loader';
import * as path from 'path';

// Load card definitions
console.log('Loading cards...');
const xmlPath = path.join(__dirname, '..', 'src', 'cards', 'CardDefs.xml');
CardLoader.loadFromXml(xmlPath);
console.log(`Loaded ${CardLoader.getAll().length} cards`);

// Create players (with empty decklists for now)
const player1 = new Player('Player 1', []);
const player2 = new Player('Player 2', []);

// Create game
const game = new Game({
  players: [player1, player2],
  seed: Date.now(),
});

console.log('\n=== Hearthstone JS Fireplace ===');
console.log(`Player 1: ${player1.name}`);
console.log(`Player 2: ${player2.name}`);
console.log('\nGame initialized!');
console.log('Note: Full game loop not yet implemented.');
console.log('This is a library for card game simulation.');

// Example: Get a card and show its info
const fireball = CardLoader.get('CS2_029');
if (fireball) {
  const cardName = fireball.names?.enUS || fireball.id;
  console.log(`\nExample card: ${cardName}`);
  console.log(`Cost: ${fireball.cost}, Type: ${fireball.type}`);
}
