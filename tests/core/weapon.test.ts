import { Weapon } from '../../src/core/card';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { CardType, CardClass } from '../../src/enums';

describe('Weapon', () => {
  test('Weapon should have attack and durability', () => {
    const weapon = new Weapon({
      id: 'CS2_106',
      type: CardType.WEAPON,
      cardClass: CardClass.WARRIOR,
      cost: 2,
      attack: 2,
      durability: 3
    });

    expect(weapon.attack).toBe(2);
    expect(weapon.durability).toBe(3);
  });

  test('Weapon loses durability on attack', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    game.setup();

    const weapon = new Weapon({
      id: 'TEST_WEAPON',
      type: CardType.WEAPON,
      cardClass: CardClass.WARRIOR,
      cost: 1,
      attack: 2,
      durability: 2
    });
    (weapon as any).controller = player;

    player.weapon = weapon;
    weapon.loseDurability();

    expect(weapon.durability).toBe(1);
  });

  test('Weapon is destroyed at 0 durability', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    game.setup();

    const weapon = new Weapon({
      id: 'TEST_WEAPON',
      type: CardType.WEAPON,
      cardClass: CardClass.WARRIOR,
      cost: 1,
      attack: 2,
      durability: 1
    });
    (weapon as any).controller = player;

    player.weapon = weapon;
    weapon.loseDurability();

    expect(player.weapon).toBeNull();
  });
});
