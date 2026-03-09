import { SELF, ALL_MINIONS, makeCallable } from '../../src/dsl/selector';
import { Entity } from '../../src/core/entity';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Minion } from '../../src/core/card';
import { CardType, CardClass } from '../../src/enums';

describe('Selector Action Matching', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    game = new Game({ players: [player1, player2], seed: 12345 });
    game.setup();
  });

  test('SELF should match the source entity', () => {
    const source = player1 as unknown as Entity;

    const result = SELF.eval({ game, source });
    expect(result).toContain(source);
  });

  test('Selector should support callable interface', () => {
    const selector = makeCallable(ALL_MINIONS);
    const minion1 = new Minion({
      id: 'minion1',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1,
      attack: 1,
      health: 1
    });
    const minion2 = new Minion({
      id: 'minion2',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1,
      attack: 1,
      health: 1
    });

    player1.field.push(minion1);
    player2.field.push(minion2);

    const source = player1 as unknown as Entity;

    // Both calling styles should work
    const result1 = selector.eval({ game, source });
    const result2 = selector([], source);
    expect(result1).toEqual(result2);
    expect(result1.length).toBe(2);
  });

  test('SELF should be callable as a function', () => {
    const source = player1 as unknown as Entity;

    // SELF should be callable as a function
    const result = SELF([], source);
    expect(result).toContain(source);
  });

  test('Callable selector should maintain prototype chain', () => {
    const selector = makeCallable(ALL_MINIONS);

    // Should have Selector methods
    expect(typeof selector.or).toBe('function');
    expect(typeof selector.and).toBe('function');
    expect(typeof selector.filter).toBe('function');
    expect(typeof selector.random).toBe('function');
    expect(typeof selector.first).toBe('function');
  });
});
