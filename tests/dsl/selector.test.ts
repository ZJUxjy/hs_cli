import { SELF, ALL_MINIONS, FRIENDLY_MINIONS, ENEMY_MINIONS, TAUNT } from '../../src/dsl/selector';
import { Entity } from '../../src/core/entity';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Minion } from '../../src/core/card';
import { CardType, CardClass } from '../../src/enums';

describe('Selector', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    game = new Game({ players: [player1, player2], seed: 12345 });
    game.setup();
  });

  test('SELF should return source entity', () => {
    const source = player1 as unknown as Entity;
    const result = SELF([], source);
    expect(result).toContain(source);
  });

  test('ALL_MINIONS should return all minions from both players', () => {
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

    const result = ALL_MINIONS([], player1 as unknown as Entity);
    expect(result.length).toBe(2);
  });

  test('FRIENDLY_MINIONS should return friendly minions', () => {
    const minion1 = new Minion({
      id: 'minion1',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1,
      attack: 1,
      health: 1
    });

    player1.field.push(minion1);

    const result = FRIENDLY_MINIONS([], player1 as unknown as Entity);
    expect(result.length).toBe(1);
  });

  test('ENEMY_MINIONS should return enemy minions', () => {
    const minion1 = new Minion({
      id: 'minion1',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1,
      attack: 1,
      health: 1
    });

    player2.field.push(minion1);

    const result = ENEMY_MINIONS([], player1 as unknown as Entity);
    expect(result.length).toBe(1);
  });

  test('TAUNT should filter taunt minions', () => {
    const minion1 = new Minion({
      id: 'minion1',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1,
      attack: 1,
      health: 1
    });
    minion1.taunt = true;

    const minion2 = new Minion({
      id: 'minion2',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1,
      attack: 1,
      health: 1
    });

    player1.field.push(minion1, minion2);

    const result = TAUNT([], player1 as unknown as Entity);
    expect(result.length).toBe(1);
  });

  test('Selector should be callable', () => {
    expect(typeof SELF).toBe('function');
  });
});
