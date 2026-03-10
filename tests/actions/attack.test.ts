import { Attack } from '../../src/actions/attack';
import { Entity } from '../../src/core/entity';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Minion } from '../../src/core/card';
import { CardType, CardClass } from '../../src/enums';

describe('Attack', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    game = new Game({ players: [player1, player2], seed: 12345 });
    player1.startingHero = 'HERO_01';
    player2.startingHero = 'HERO_02';
    game.setup();
    game.start();
    game.resolveMulligan(player1, []);
    game.resolveMulligan(player2, []);
  });

  function createMinion(options: { attack?: number; health?: number; controller?: Player } = {}): Minion {
    const minion = new Minion({
      id: 'TEST_MINION',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1,
      attack: options.attack ?? 1,
      health: options.health ?? 1
    });
    const controller = options.controller || player1;
    (minion as any).controller = controller;
    // Set game on controller so minion.game getter works
    (controller as any).game = game;
    (minion as any).sleeping = false;
    (minion as any).turnsInPlay = 1;
    (minion as any).attacksThisTurn = 0;
    return minion;
  }

  test('should create Attack action', () => {
    const attacker = { entityId: 1 } as unknown as Entity;
    const defender = { entityId: 2 } as unknown as Entity;
    const attack = new Attack(attacker, defender);
    expect(attack.attacker).toBe(attacker);
    expect(attack.defender).toBe(defender);
  });

  test('should deal damage to defender', () => {
    const attacker = createMinion({ attack: 3, health: 5 });
    const defender = createMinion({ attack: 0, health: 5, controller: player2 });
    attacker.damage = 0;
    defender.damage = 0;

    const attack = new Attack(attacker, defender);
    attack.trigger(game);

    expect(defender.damage).toBe(3);
  });

  test('should deal counter damage to attacker', () => {
    const attacker = createMinion({ attack: 3, health: 5 });
    const defender = createMinion({ attack: 2, health: 5, controller: player2 });
    attacker.damage = 0;
    defender.damage = 0;

    const attack = new Attack(attacker, defender);
    attack.trigger(game);

    expect(attacker.damage).toBe(2);
  });

  test('should throw error if attacker has 0 attack', () => {
    const attacker = createMinion({ attack: 0, health: 5 });
    const defender = createMinion({ attack: 0, health: 5, controller: player2 });
    attacker.damage = 0;
    defender.damage = 0;

    const attack = new Attack(attacker, defender);
    expect(() => attack.trigger(game)).toThrow('Minion has 0 attack');
  });
});
