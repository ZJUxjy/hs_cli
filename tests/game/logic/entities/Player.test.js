const Player = require('../../../../src/game/logic/entities/Player');

describe('Player', () => {
  let mockGame;

  beforeEach(() => {
    mockGame = {
      nextEntityId: 1,
      entities: [],
      random: { choice: jest.fn(), sample: jest.fn() },
      queueActions: jest.fn()
    };
  });

  test('should create player with deck', () => {
    const player = new Player(mockGame, 'Player1', ['CS2_101', 'CS2_102'], 'HERO_DRUID');
    expect(player.name).toBe('Player1');
    expect(player.deck.length).toBe(2);
  });

  test('should have mana system', () => {
    const player = new Player(mockGame, 'Player1', [], 'HERO_DRUID');
    expect(player.maxMana).toBe(0);
    expect(player.mana).toBe(0);
    player.maxMana = 10;
    expect(player.mana).toBe(10);
  });

  test('should track hand and field', () => {
    const player = new Player(mockGame, 'Player1', [], 'HERO_DRUID');
    expect(player.hand).toEqual([]);
    expect(player.field).toEqual([]);
  });
});
