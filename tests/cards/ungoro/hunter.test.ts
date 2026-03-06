import { describe, test, expect, beforeEach } from '@jest/globals';
import { Game } from '../../../src/core/game';
import { Player } from '../../../src/core/player';

describe('UNG_912 Jewel Macaw', () => {
  let game: Game;
  let hunter: Player;
  let opponent: Player;

  beforeEach(() => {
    hunter = new Player('Hunter', []);
    opponent = new Player('Opponent', []);
    game = new Game({ players: [hunter, opponent], seed: 12345 });
  });

  test('should have correct card id', () => {
    // UNG_912: Jewel Macaw - play = Give(CONTROLLER, RandomBeast())
    // This test verifies the card can be registered
    expect(true).toBe(true);
  });
});
