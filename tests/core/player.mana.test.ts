import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { BeginTurn } from '../../src/actions/beginturn';

describe('Player Mana System', () => {
  test('max mana should increment by 1 each turn (max 10)', () => {
    const player = new Player('Test', []);
    const opponent = new Player('Opp', []);
    player.startingHero = 'HERO_01';
    opponent.startingHero = 'HERO_01';
    const game = new Game({ players: [player, opponent] });
    game.setup();

    expect(player.maxMana).toBe(0);

    // Turn 1
    new BeginTurn(player).trigger(game);
    expect(player.maxMana).toBe(1);
    expect(player.usedMana).toBe(0);

    // Turn 2
    new BeginTurn(player).trigger(game);
    expect(player.maxMana).toBe(2);

    // Turn 10+ should cap at 10
    for (let i = 0; i < 10; i++) {
      new BeginTurn(player).trigger(game);
    }
    expect(player.maxMana).toBe(10);
  });

  test('mana calculation should account for overload', () => {
    const player = new Player('Test', []);
    player.maxMana = 5;
    player.usedMana = 2;
    player.overloadLocked = 1;

    expect(player.mana).toBe(2); // 5 - 2 - 1 = 2
  });

  test('temp mana should be consumed first', () => {
    const player = new Player('Test', []);
    player.maxMana = 3;
    player.usedMana = 0;
    player.tempMana = 2;

    expect(player.mana).toBe(5); // 3 + 2 = 5
  });
});
