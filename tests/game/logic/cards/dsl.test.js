const DSL = require('../../../../src/game/logic/cards/dsl');

describe('DSL', () => {
  test('buff should create buff data', () => {
    const buff = DSL.buff('EX1_014te', { atk: 1, health: 1 });
    expect(buff.id).toBe('EX1_014te');
    expect(buff.atk).toBe(1);
    expect(buff.health).toBe(1);
  });

  test('Summon should create summon action', () => {
    const summon = DSL.Summon('PLAYER1', 'CS2_101');
    expect(summon.cardId).toBe('CS2_101');
    expect(summon.player).toBe('PLAYER1');
  });

  test('Damage should create damage action', () => {
    const damage = DSL.Damage('TARGET', 3);
    expect(damage.amount).toBe(3);
  });
});
