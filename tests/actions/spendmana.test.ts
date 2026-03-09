import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { SpendMana } from '../../src/actions/spendmana';

describe('SpendMana Action', () => {
  test('SpendMana should deduct from player mana', () => {
    const player = new Player('Test', []);
    const opponent = new Player('Opp', []);
    const game = new Game({ players: [player, opponent] });
    player.maxMana = 5;
    player.usedMana = 0;

    const spend = new SpendMana(player, 3);
    spend.trigger(game);

    expect(player.usedMana).toBe(3);
  });

  test('SpendMana should use temp mana first', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.maxMana = 3;
    player.usedMana = 0;
    player.tempMana = 2;

    const spend = new SpendMana(player, 4);
    spend.trigger(game);

    expect(player.tempMana).toBe(0); // All temp mana used
    expect(player.usedMana).toBe(2); // Remaining from regular mana
  });
});
