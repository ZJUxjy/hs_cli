import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { State } from '../../src/enums';

describe('Game', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    game = new Game({ players: [player1, player2], seed: 12345 });
  });

  test('should initialize with invalid state', () => {
    expect(game.state).toBe(State.INVALID);
  });

  test('should have two players', () => {
    expect(game.players.length).toBe(2);
  });

  test('should link players to game', () => {
    expect(player1.game).toBe(game);
    expect(player2.game).toBe(game);
  });

  test('should have random generator', () => {
    expect(game.random).toBeDefined();
  });
});
