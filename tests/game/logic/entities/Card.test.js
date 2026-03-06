const Card = require('../../../../src/game/logic/entities/Card');

describe('Card', () => {
  let mockGame;

  beforeEach(() => {
    mockGame = {
      nextEntityId: 1,
      entities: [],
      random: { choice: jest.fn(), sample: jest.fn() },
      queueActions: jest.fn()
    };
  });

  test('should create card with cost and atk/health', () => {
    const card = new Card(mockGame, 'CS2_101', {
      name: 'Illidan',
      type: 'MINION',
      cost: 5,
      atk: 7,
      health: 5
    });
    expect(card.id).toBe('CS2_101');
    expect(card.name).toBe('Illidan');
    expect(card.cost).toBe(5);
    expect(card.atk).toBe(7);
    expect(card.maxHealth).toBe(5);
    expect(card.health).toBe(5);
  });

  test('should have damaged state', () => {
    const card = new Card(mockGame, 'CS2_101', { cost: 5, atk: 7, health: 5 });
    card.health = 3;
    expect(card.damaged).toBe(true);
  });

  test('should track deathrattle flag', () => {
    const card = new Card(mockGame, 'CS2_101', { cost: 5, atk: 7, health: 5, deathrattle: true });
    expect(card.hasDeathrattle).toBe(true);
  });
});
