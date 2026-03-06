const Entity = require('../../../../src/game/logic/entities/Entity');

describe('Entity', () => {
  let mockGame;
  let mockPlayer;

  beforeEach(() => {
    mockGame = {
      entities: [],
      random: { choice: jest.fn(), sample: jest.fn() },
      queueActions: jest.fn()
    };
    mockPlayer = {
      game: mockGame,
      field: [],
      hand: []
    };
  });

  test('should create entity with id', () => {
    const entity = new Entity(mockGame, 'test_entity');
    expect(entity.id).toBe('test_entity');
  });

  test('should have empty buffs array', () => {
    const entity = new Entity(mockGame, 'test_entity');
    expect(entity.buffs).toEqual([]);
  });

  test('should have zone set to PLAY by default', () => {
    const entity = new Entity(mockGame, 'test_entity');
    expect(entity.zone).toBe('PLAY');
  });
});
