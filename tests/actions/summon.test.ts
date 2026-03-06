import { Summon } from '../../src/actions/summon';
import { Entity } from '../../src/core/entity';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Minion } from '../../src/core/card';
import { CardType, CardClass } from '../../src/enums';

describe('Summon', () => {
  let game: Game;
  let player: Player;

  beforeEach(() => {
    player = new Player('Player1', []);
    const player2 = new Player('Player2', []);
    game = new Game({ players: [player, player2], seed: 12345 });
    game.setup();
  });

  test('should create Summon action', () => {
    const source = { entityId: 1 } as unknown as Entity;
    const card = { entityId: 2 } as unknown as Entity;
    const summon = new Summon(source, card);
    expect(summon.source).toBe(source);
    expect(summon.card).toBe(card);
  });

  test('should summon minion to field', () => {
    const minion = new Minion({
      id: 'minion1',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1,
      attack: 1,
      health: 1
    });
    const summon = new Summon(player, minion);
    const result = summon.trigger(player);
    expect(player.field.length).toBe(1);
    expect(result).toContain(minion);
  });

  test('should not summon if board is full', () => {
    // Fill the board
    for (let i = 0; i < 7; i++) {
      const minion = new Minion({
        id: `minion${i}`,
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1,
        attack: 1,
        health: 1
      });
      player.field.push(minion);
    }

    const minion = new Minion({
      id: 'minion_new',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1,
      attack: 1,
      health: 1
    });
    const summon = new Summon(player, minion);
    const result = summon.trigger(player);
    expect(result.length).toBe(0);
    expect(player.field.length).toBe(7);
  });

  test('should summon at specific index', () => {
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

    player.field.push(minion1);

    const summon = new Summon(player, minion2, 0);
    summon.trigger(player);

    // After summon at index 0, minion2 should be first
    expect(player.field.first()).toBe(minion2);
  });
});
