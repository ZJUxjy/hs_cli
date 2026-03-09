import { Secret } from '../../src/core/secret';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { CardType, CardClass, Zone } from '../../src/enums';

describe('Secret', () => {
  test('Secret can be played to secrets zone', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const secret = new Secret({
      id: 'EX1_130',
      type: CardType.SPELL,
      cardClass: CardClass.HUNTER,
      cost: 2,
      secret: true
    });
    (secret as any).controller = player;

    secret.playToSecretZone();

    expect(player.secrets.includes(secret)).toBe(true);
    expect(secret.zone).toBe(Zone.SECRET);
  });

  test('Secret reacts to trigger event', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const secret = new Secret({
      id: 'EX1_130',
      type: CardType.SPELL,
      cardClass: CardClass.HUNTER,
      cost: 2,
      secret: true
    });
    (secret as any).controller = player;
    secret.playToSecretZone();

    // Simulate trigger condition
    const shouldTrigger = secret.checkTrigger('AFTER_ATTACK', { attacker: player.opponent.hero });

    expect(typeof shouldTrigger).toBe('boolean');
  });

  test('Secret limit is 5 per player', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    // Add 5 secrets
    for (let i = 0; i < 5; i++) {
      const secret = new Secret({
        id: `SECRET_${i}`,
        type: CardType.SPELL,
        cardClass: CardClass.HUNTER,
        cost: 2,
        secret: true
      });
      (secret as any).controller = player;
      secret.playToSecretZone();
    }

    expect(player.secrets.length).toBe(5);

    // Try to add 6th secret - should fail
    const sixthSecret = new Secret({
      id: 'SECRET_6',
      type: CardType.SPELL,
      cardClass: CardClass.HUNTER,
      cost: 2,
      secret: true
    });
    (sixthSecret as any).controller = player;
    sixthSecret.playToSecretZone();

    expect(player.secrets.length).toBe(5);
    expect(player.secrets.includes(sixthSecret)).toBe(false);
  });

  test('Secret reveal removes from secrets zone', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const secret = new Secret({
      id: 'EX1_130',
      type: CardType.SPELL,
      cardClass: CardClass.HUNTER,
      cost: 2,
      secret: true
    });
    (secret as any).controller = player;
    secret.playToSecretZone();

    expect(player.secrets.length).toBe(1);

    secret.reveal();

    expect(player.secrets.length).toBe(0);
    expect(player.secrets.includes(secret)).toBe(false);
  });

  test('Secret destroy moves to graveyard', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const secret = new Secret({
      id: 'EX1_130',
      type: CardType.SPELL,
      cardClass: CardClass.HUNTER,
      cost: 2,
      secret: true
    });
    (secret as any).controller = player;
    secret.playToSecretZone();

    secret.destroy();

    expect(player.secrets.includes(secret)).toBe(false);
    expect(secret.zone).toBe(Zone.GRAVEYARD);
  });
});
