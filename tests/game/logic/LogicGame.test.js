const LogicGame = require('../../../src/game/logic/LogicGame');

describe('LogicGame', () => {
  test('should create game with players', () => {
    const game = new LogicGame(['Player1', 'Player2']);
    expect(game.players.length).toBe(2);
  });

  test('should have event system', () => {
    const game = new LogicGame(['Player1', 'Player2']);
    expect(game.events).toBeDefined();
  });

  test('should initialize mana correctly', () => {
    const game = new LogicGame(['Player1', 'Player2']);
    game.start();
    expect(game.players[0].maxMana).toBe(1);
  });
});
