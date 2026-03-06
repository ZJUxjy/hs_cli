const Selectors = require('../../../../src/game/logic/selectors');

describe('Selectors', () => {
  let mockGame, mockPlayer1, mockPlayer2;

  beforeEach(() => {
    mockPlayer1 = {
      field: [
        { id: 'c1', type: 'MINION', dead: false },
        { id: 'c2', type: 'MINION', dead: false }
      ],
      hand: [],
      controller: mockPlayer1
    };
    mockPlayer2 = {
      field: [{ id: 'c3', type: 'MINION', dead: false }],
      hand: [],
      controller: mockPlayer2
    };
    mockGame = {
      players: [mockPlayer1, mockPlayer2]
    };
    mockPlayer1.opponent = mockPlayer2;
    mockPlayer2.opponent = mockPlayer1;
  });

  test('SELF should return source', () => {
    const result = Selectors.SELF(mockGame, mockPlayer1);
    expect(result).toBe(mockPlayer1);
  });

  test('ENEMY should return opponent', () => {
    const result = Selectors.ENEMY(mockGame, mockPlayer1);
    expect(result).toBe(mockPlayer2);
  });

  test('FRIENDLY_MINIONS should return own field', () => {
    const result = Selectors.FRIENDLY_MINIONS(mockGame, mockPlayer1);
    expect(result).toEqual(mockPlayer1.field);
  });

  test('ENEMY_MINIONS should return opponent field', () => {
    const result = Selectors.ENEMY_MINIONS(mockGame, mockPlayer1);
    expect(result).toEqual(mockPlayer2.field);
  });

  test('ALL_MINIONS should return both fields', () => {
    const result = Selectors.ALL_MINIONS(mockGame, mockPlayer1);
    expect(result.length).toBe(3);
  });
});
