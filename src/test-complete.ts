#!/usr/bin/env ts-node
// Complete integration test for js_fireplace

import { CardLoader } from './cards/loader';
import * as path from 'path';
import { Minion, Card } from './core/card';
import { Player } from './core/player';
import { Game } from './core/game';
import { TargetValidator } from './targeting/targetvalidator';
import { GameEvent } from './events/eventtypes';
import { DamageSpell, DrawCards, HealSpell } from './dsl/cardscripts';
import { ENEMY_MINIONS, FRIENDLY_MINIONS, TARGET } from './dsl/selector';
import { PlayReq } from './enums';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║       JS Fireplace - Complete System Integration Test        ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Load cards
console.log('📦 Loading cards...');
const xmlPath = path.join(__dirname, '..', 'src', 'cards', 'CardDefs.xml');
CardLoader.loadFromXml(xmlPath);
console.log(`✅ Loaded ${Object.keys((CardLoader as any).cards || {}).length} card definitions\n`);

// Setup game
console.log('🎮 Setting up game...');
const player1 = new Player('Player 1', []);
const player2 = new Player('Player 2', []);
const game = new Game({ players: [player1, player2], seed: 123 });
game.setup();
console.log('✅ Game initialized\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (e: any) {
    console.log(`❌ ${name}: ${e.message}`);
    testsFailed++;
  }
}

// ============== Phase 1: Buff System Tests ==============
console.log('\n📌 Phase 1: Buff System Tests');
console.log('─────────────────────────────────────────');

test('Buff System - Create minion and apply buff', () => {
  const minion = new Minion(CardLoader.get('CS2_168')!);
  (minion as any).controller = player1;
  minion.buff(minion, 'test_buff', { atk: 2, maxHealth: 2 });
  if (minion.attack !== 4) throw new Error('Attack buff not applied');
});

test('Buff System - Clear buffs', () => {
  const minion = new Minion(CardLoader.get('CS2_168')!);
  minion.buff(minion, 'test_buff', { atk: 2 });
  minion.clearBuffs();
  if (minion.buffs.length !== 0) throw new Error('Buffs not cleared');
});

// ============== Phase 2: Targeting System Tests ==============
console.log('\n📌 Phase 2: Targeting System Tests');
console.log('─────────────────────────────────────────');

test('Targeting - REQ_MINION_TARGET', () => {
  const spell = new Card({
    id: 'TEST_SPELL',
    type: 5,
    cardClass: 0,
    cost: 1,
    requirements: { [PlayReq.REQ_MINION_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 }
  });
  (spell as any).controller = player1;

  const minion = new Minion(CardLoader.get('CS2_168')!);
  (minion as any).controller = player2;
  player2.field.push(minion as any);

  if (!spell.canTarget(minion as any)) throw new Error('Should be able to target minion');
});

test('Targeting - REQ_ENEMY_TARGET', () => {
  const spell = new Card({
    id: 'TEST_SPELL',
    type: 5,
    cardClass: 0,
    cost: 1,
    requirements: { [PlayReq.REQ_ENEMY_TARGET]: 0, [PlayReq.REQ_TARGET_TO_PLAY]: 0 }
  });
  (spell as any).controller = player1;

  const enemyMinion = new Minion(CardLoader.get('CS2_168')!);
  (enemyMinion as any).controller = player2;

  const friendlyMinion = new Minion(CardLoader.get('CS2_168')!);
  (friendlyMinion as any).controller = player1;

  if (!spell.canTarget(enemyMinion as any)) throw new Error('Should target enemy');
});

// ============== Phase 2: Event System Tests ==============
console.log('\n📌 Phase 2: Event System Tests');
console.log('─────────────────────────────────────────');

test('Event System - Register and trigger event', () => {
  let triggered = false;
  game.on(GameEvent.TURN_BEGIN, () => { triggered = true; });
  game.trigger(GameEvent.TURN_BEGIN, { player: player1 });
  if (!triggered) throw new Error('Event not triggered');
});

test('Event System - One-time listener', () => {
  let count = 0;
  game.once(GameEvent.TURN_END, () => { count++; });
  game.trigger(GameEvent.TURN_END, { player: player1 });
  game.trigger(GameEvent.TURN_END, { player: player1 });
  if (count !== 1) throw new Error('One-time listener triggered multiple times');
});

// ============== Phase 2: DSL Tests ==============
console.log('\n📌 Phase 2: DSL Tests');
console.log('─────────────────────────────────────────');

test('DSL - Selector ALL_MINIONS', () => {
  const minion1 = new Minion(CardLoader.get('CS2_168')!);
  const minion2 = new Minion(CardLoader.get('CS2_172')!);
  player1.field.push(minion1 as any, minion2 as any);

  const { ALL_MINIONS } = require('./dsl/selector');
  const result = ALL_MINIONS.eval({ game, source: minion1 });
  if (result.length < 2) throw new Error('Selector not finding minions');

  // Clear field
  while (player1.field.length > 0) {
    player1.field.pop();
  }
});

test('DSL - DamageSpell factory', () => {
  const spell = DamageSpell(TARGET, 6);
  if (typeof spell !== 'function') throw new Error('DamageSpell should return a function');
});

// ============== Phase 3: Mechanic Tests ==============
console.log('\n📌 Phase 3: Mechanic Tests');
console.log('─────────────────────────────────────────');

test('Mechanics - Adapt options exist', () => {
  const { ADAPT_EFFECTS, AdaptOption } = require('./mechanics/adapt');
  if (Object.keys(ADAPT_EFFECTS).length !== 10) throw new Error('Should have 10 adapt options');
});

test('Mechanics - Discover action', () => {
  const { Discover } = require('./mechanics/discover');
  const discover = new Discover({ cardType: 4 }); // MINION type
  if (!discover) throw new Error('Discover action not created');
});

test('Mechanics - Keyword checks', () => {
  const { checkCombo, checkManathirst } = require('./mechanics/keywords');
  (player1 as any).cardsPlayedThisTurn = 1;
  if (!checkCombo(player1)) throw new Error('Combo check should pass');
});

// ============== Summary ==============
console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                        Test Summary                          ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log(`║  ✅ Tests Passed: ${testsPassed.toString().padEnd(43)} ║`);
console.log(`║  ❌ Tests Failed: ${testsFailed.toString().padEnd(43)} ║`);
console.log('╚══════════════════════════════════════════════════════════════╝\n');

if (testsFailed > 0) {
  process.exit(1);
}
console.log('🎉 All integration tests passed!\n');
