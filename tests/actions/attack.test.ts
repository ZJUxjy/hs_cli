import { Attack } from '../../src/actions/attack';
import { Entity } from '../../src/core/entity';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';

describe('Attack', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    game = new Game({ players: [player1, player2], seed: 12345 });
    game.setup();
  });

  test('should create Attack action', () => {
    const attacker = { entityId: 1 } as unknown as Entity;
    const defender = { entityId: 2 } as unknown as Entity;
    const attack = new Attack(attacker, defender);
    expect(attack.attacker).toBe(attacker);
    expect(attack.defender).toBe(defender);
  });

  test('should deal damage to defender', () => {
    const attacker = { entityId: 1, attack: 3 } as unknown as Entity;
    const defender = { entityId: 2, damage: 0 } as unknown as Entity;
    const attack = new Attack(attacker, defender);
    attack.trigger(attacker);
    expect((defender as any).damage).toBe(3);
  });

  test('should deal counter damage to attacker', () => {
    const attacker = { entityId: 1, attack: 3, damage: 0 } as unknown as Entity;
    const defender = { entityId: 2, attack: 2 } as unknown as Entity;
    const attack = new Attack(attacker, defender);
    attack.trigger(attacker);
    expect((attacker as any).damage).toBe(2);
  });

  test('should not deal damage if attacker has 0 attack', () => {
    const attacker = { entityId: 1, attack: 0 } as unknown as Entity;
    const defender = { entityId: 2, damage: 0 } as unknown as Entity;
    const attack = new Attack(attacker, defender);
    attack.trigger(attacker);
    expect((defender as any).damage).toBe(0);
  });
});
