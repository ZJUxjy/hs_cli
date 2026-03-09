import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { Minion } from '../../src/core/card';
import { Play } from '../../src/actions/play';
import { Race, CardType, CardClass } from '../../src/enums';

describe('Elemental Chain Tracking', () => {
  test('Playing elemental increments this turn counter', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const elemental = new Minion({
      id: 'ELEMENTAL_01',
      type: CardType.MINION,
      cardClass: CardClass.MAGE,
      cost: 2,
      attack: 2,
      health: 2,
      race: Race.ELEMENTAL
    });
    (elemental as any).controller = player;
    player.hand.push(elemental);

    player.elementalPlayedThisTurn = 0;
    const play = new Play(player, elemental, undefined, undefined);
    play.trigger(player);

    expect(player.elementalPlayedThisTurn).toBe(1);
  });

  test('Elemental last turn tracks previous turn', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();
    game.currentPlayer = player; // Set current player

    player.elementalPlayedThisTurn = 2;
    game.endTurn(); // End player's turn - this triggers EndTurn which transfers elemental counts

    expect(player.elementalPlayedLastTurn).toBe(2);
    expect(player.elementalPlayedThisTurn).toBe(0);
  });

  test('Playing non-elemental does not increment counter', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const nonElemental = new Minion({
      id: 'MINION_01',
      type: CardType.MINION,
      cardClass: CardClass.MAGE,
      cost: 2,
      attack: 2,
      health: 2,
      race: Race.MURLOC // Not an elemental
    });
    (nonElemental as any).controller = player;
    player.hand.push(nonElemental);

    player.elementalPlayedThisTurn = 0;
    const play = new Play(player, nonElemental, undefined, undefined);
    play.trigger(player);

    expect(player.elementalPlayedThisTurn).toBe(0);
  });

  test('Playing minion without race does not increment counter', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const noRaceMinion = new Minion({
      id: 'MINION_02',
      type: CardType.MINION,
      cardClass: CardClass.MAGE,
      cost: 2,
      attack: 2,
      health: 2
      // No race property
    });
    (noRaceMinion as any).controller = player;
    player.hand.push(noRaceMinion);

    player.elementalPlayedThisTurn = 0;
    const play = new Play(player, noRaceMinion, undefined, undefined);
    play.trigger(player);

    expect(player.elementalPlayedThisTurn).toBe(0);
  });
});
