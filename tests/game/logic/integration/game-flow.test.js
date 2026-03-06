const LogicGame = require('../../../../src/game/logic/LogicGame');
const Card = require('../../../../src/game/logic/entities/Card');
const Attack = require('../../../../src/game/logic/actions/Attack');
const Summon = require('../../../../src/game/logic/actions/Summon');

describe('Game Flow Integration', () => {
  let game;

  beforeEach(() => {
    game = new LogicGame(['P1', 'P2']);
    game.start();
  });

  test('should setup initial game state', () => {
    expect(game.turn).toBe(1);
    expect(game.players[0].mana).toBe(1);
    expect(game.players[1].mana).toBe(0);
  });

  test('should summon minion and attack', () => {
    const p1 = game.players[0];

    // Give P1 enough mana to play a 1-cost card
    p1.maxMana = 5;
    p1.usedMana = 0;

    // P1 summon a minion (give card first)
    const card = new Card(game, 'CS2_101', { cost: 1, atk: 2, health: 3, type: 'MINION' });
    p1.hand.push(card);

    // Play card
    const result = game.playCard(p1, 'CS2_101', null, 0);

    expect(result).toBe(true);
    expect(p1.field.length).toBe(1);
    expect(p1.hand.length).toBe(0);
  });

  test('should handle attack and damage', () => {
    const p1 = game.players[0];
    const p2 = game.players[1];

    // Add minion to both fields using Card instances
    // m2 needs more health so it doesn't die immediately and can counterattack
    const m1 = new Card(game, 'CS2_101', { cost: 2, atk: 2, health: 3, type: 'MINION' });
    const m2 = new Card(game, 'CS2_102', { cost: 2, atk: 1, health: 5, type: 'MINION' });
    p1.field.push(m1);
    p2.field.push(m2);

    const initialHealthM2 = m2.health;
    const initialHealthM1 = m1.health;

    // Attack
    game.attack(m1, m2);

    // m2 should take 2 damage
    expect(m2.health).toBe(initialHealthM2 - 2);
    // m1 should take counterattack (1 damage)
    expect(m1.health).toBe(initialHealthM1 - 1);
  });

  test('should handle divine shield', () => {
    const p1 = game.players[0];
    const p2 = game.players[1];

    const m1 = new Card(game, 'CS2_101', { cost: 2, atk: 3, health: 2, type: 'MINION', divineShield: true });
    const m2 = new Card(game, 'CS2_102', { cost: 2, atk: 2, health: 3, type: 'MINION' });
    p1.field.push(m1);
    p2.field.push(m2);

    // Attack shielded minion
    game.attack(m2, m1);

    // Divine shield should be consumed, but no damage taken
    expect(m1.hasDivineShield).toBe(false);
    expect(m1.health).toBe(2);
  });

  test('should handle end turn', () => {
    const p1 = game.players[0];
    const p2 = game.players[1];

    game.endTurn();

    expect(p1.currentPlayer).toBe(false);
    expect(p2.currentPlayer).toBe(true);
    expect(p2.maxMana).toBe(1);
    expect(game.turn).toBe(2);
  });
});
