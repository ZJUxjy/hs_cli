import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Step } from '../../src/enums';

describe('Game Mulligan Flow', () => {
  test('startWithMulligan should enter mulligan phase', () => {
    const player1 = new Player('P1', ['CS2_120', 'CS2_121', 'CS2_122']);
    const player2 = new Player('P2', ['CS2_120', 'CS2_121', 'CS2_122', 'CS2_123']);
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';

    const game = new Game({ players: [player1, player2] });
    game.startWithMulligan();

    expect(game.step).toBe(Step.BEGIN_MULLIGAN);
    expect(player1.choice).toBeDefined();
    expect(player2.choice).toBeDefined();
  });

  test('resolveMulligan should transition to game start', () => {
    const player1 = new Player('P1', ['CS2_120']);
    const player2 = new Player('P2', ['CS2_120']);
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_01';

    const game = new Game({ players: [player1, player2] });
    game.startWithMulligan();

    // Resolve both mulligans
    game.resolveMulligan(player1, []);
    game.resolveMulligan(player2, []);

    expect(game.currentPlayer).toBe(player1);
  });
});
