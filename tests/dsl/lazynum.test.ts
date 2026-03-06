import { Count, Attr, SelfAttr, Const, Sum, Minus, Multiply } from '../../src/dsl/lazynum';
import { ALL_MINIONS } from '../../src/dsl/selector';
import { Entity } from '../../src/core/entity';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Minion } from '../../src/core/card';
import { CardType, CardClass } from '../../src/enums';

describe('LazyValue', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    game = new Game({ players: [player1, player2], seed: 12345 });
    game.setup();
  });

  test('Const should return fixed value', () => {
    const lazy = new Const(5);
    const source = {} as unknown as Entity;
    const gameAny = {} as unknown as any;
    expect(lazy.evaluate(source, gameAny)).toBe(5);
  });

  test('Count should count entities', () => {
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

    const count = new Count(ALL_MINIONS);
    const result = count.evaluate(player1 as unknown as Entity, game as unknown as any);
    expect(result).toBe(2);
  });

  test('Attr should sum attribute from entities', () => {
    const minion1 = new Minion({
      id: 'minion1',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1,
      attack: 3,
      health: 1
    });
    const minion2 = new Minion({
      id: 'minion2',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1,
      attack: 2,
      health: 1
    });

    player1.field.push(minion1, minion2);

    const attr = new Attr(ALL_MINIONS, 'attack');
    const result = attr.evaluate(player1 as unknown as Entity, game as unknown as any);
    expect(result).toBe(5);
  });

  test('SelfAttr should return entity attribute', () => {
    const source = { attack: 5 } as unknown as Entity;
    const attr = new SelfAttr('attack');
    const result = attr.evaluate(source, {} as unknown as any);
    expect(result).toBe(5);
  });

  test('SelfAttr should return 0 for missing attribute', () => {
    const source = {} as unknown as Entity;
    const attr = new SelfAttr('attack');
    const result = attr.evaluate(source, {} as unknown as any);
    expect(result).toBe(0);
  });

  test('Sum should sum multiple values', () => {
    const sum = new Sum([new Const(1), new Const(2), new Const(3)]);
    const result = sum.evaluate({} as unknown as Entity, {} as unknown as any);
    expect(result).toBe(6);
  });

  test('Minus should subtract values', () => {
    const minus = new Minus(new Const(10), new Const(3));
    const result = minus.evaluate({} as unknown as Entity, {} as unknown as any);
    expect(result).toBe(7);
  });

  test('Multiply should multiply values', () => {
    const multiply = new Multiply(new Const(3), new Const(4));
    const result = multiply.evaluate({} as unknown as Entity, {} as unknown as any);
    expect(result).toBe(12);
  });
});
