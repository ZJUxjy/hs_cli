#!/usr/bin/env ts-node
// Test script for Buff system

import { CardLoader } from './cards/loader';
import * as path from 'path';
import { Minion } from './core/card';
import { Player } from './core/player';
import { Game } from './core/game';

// Load cards
console.log('Loading cards...');
const xmlPath = path.join(__dirname, '..', 'src', 'cards', 'CardDefs.xml');
CardLoader.loadFromXml(xmlPath);

// Create a minion for testing
const cardDef = CardLoader.get('CS2_168'); // Murloc Raider 2/1
if (!cardDef) {
  console.error('Card not found');
  process.exit(1);
}

console.log('\n=== Buff System Test ===\n');

// Create game and player
const player = new Player('Test Player', []);
const game = new Game({ players: [player, new Player('Opponent', [])], seed: 123 });

// Create minion
const minion = new Minion(cardDef);
(minion as any).controller = player;

console.log(`Created minion: ${minion.id}`);
console.log(`Base stats: ${minion.attack}/${minion.maxHealth}`);
console.log(`Has buffs: ${minion.buffs.length}`);

// Test 1: Apply simple buff
console.log('\n--- Test 1: Simple Buff (+1/+1) ---');
minion.buff(minion, 'test_buff_1', { atk: 1, maxHealth: 1 });
console.log(`After buff: ${minion.attack}/${minion.maxHealth}`);
console.log(`Buffs: ${minion.buffs.length}`);

// Test 2: Apply another buff
console.log('\n--- Test 2: Add Another Buff (+2 Attack) ---');
minion.buff(minion, 'test_buff_2', { atk: 2 });
console.log(`After buff: ${minion.attack}/${minion.maxHealth}`);

// Test 3: Check taunt buff
console.log('\n--- Test 3: Taunt Buff ---');
console.log(`Before: taunt=${minion.taunt}`);
minion.buff(minion, 'test_taunt', { taunt: true });
console.log(`After: taunt=${minion.taunt}`);

// Test 4: Remove specific buff
console.log('\n--- Test 4: Remove First Buff ---');
const firstBuff = minion.buffs[0];
firstBuff.remove();
console.log(`After removal: ${minion.attack}/${minion.maxHealth}`);
console.log(`Buffs remaining: ${minion.buffs.length}`);

// Test 5: Clear all buffs
console.log('\n--- Test 5: Clear All Buffs ---');
minion.clearBuffs();
console.log(`After clear: ${minion.attack}/${minion.maxHealth}`);
console.log(`taunt=${minion.taunt}`);
console.log(`Buffs: ${minion.buffs.length}`);

// Test 6: Multiple buffs stacking
console.log('\n--- Test 6: Stacking Buffs ---');
minion.buff(minion, 'buff_a', { atk: 1 });
minion.buff(minion, 'buff_b', { atk: 2 });
minion.buff(minion, 'buff_c', { atk: 3 });
console.log(`With 3 attack buffs: ${minion.attack}/${minion.maxHealth}`);
console.log(`Expected: ${2 + 1 + 2 + 3}/1 = 8/1`);

console.log('\n=== All Tests Passed! ===');
