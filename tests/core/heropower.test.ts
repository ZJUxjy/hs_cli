import { HeroPower } from '../../src/core/heropower';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { CardType, CardClass } from '../../src/enums';

describe('HeroPower', () => {
  test('HeroPower tracks activations per turn', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const heropower = new HeroPower({
      id: 'CS2_034',
      type: CardType.HERO_POWER,
      cardClass: CardClass.MAGE,
      cost: 2
    });
    (heropower as any).controller = player;
    player.maxMana = 2;

    expect(heropower.activationsThisTurn).toBe(0);
    expect(heropower.isUsable()).toBe(true);
  });

  test('HeroPower can only be used once per turn by default', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const heropower = new HeroPower({
      id: 'CS2_034',
      type: CardType.HERO_POWER,
      cardClass: CardClass.MAGE,
      cost: 2
    });
    (heropower as any).controller = player;
    player.heroPower = heropower;
    player.maxMana = 2;

    heropower.activate();
    expect(heropower.activationsThisTurn).toBe(1);
    expect(heropower.isUsable()).toBe(false);
  });

  test('HeroPower resets activations on new turn', () => {
    const heropower = new HeroPower({
      id: 'CS2_034',
      type: CardType.HERO_POWER,
      cardClass: CardClass.MAGE,
      cost: 2
    });

    heropower.activationsThisTurn = 1;
    heropower.resetForNewTurn();

    expect(heropower.activationsThisTurn).toBe(0);
  });

  test('HeroPower requires enough mana to activate', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const heropower = new HeroPower({
      id: 'CS2_034',
      type: CardType.HERO_POWER,
      cardClass: CardClass.MAGE,
      cost: 2
    });
    (heropower as any).controller = player;
    player.heroPower = heropower;
    player.maxMana = 1; // Not enough mana

    expect(heropower.isUsable()).toBe(false);

    const result = heropower.activate();
    expect(result).toBe(false);
    expect(heropower.activationsThisTurn).toBe(0);
  });

  test('HeroPower additionalActivationsThisTurn allows extra uses', () => {
    const player = new Player('Test', []);
    const game = new Game({ players: [player, new Player('Opp', [])] });
    player.startingHero = 'HERO_01';
    game.setup();

    const heropower = new HeroPower({
      id: 'CS2_034',
      type: CardType.HERO_POWER,
      cardClass: CardClass.MAGE,
      cost: 2
    });
    (heropower as any).controller = player;
    player.heroPower = heropower;
    player.maxMana = 4;

    // Give extra activation (like from Shadowform or Justicar Trueheart)
    heropower.additionalActivationsThisTurn = 1;

    heropower.activate();
    expect(heropower.activationsThisTurn).toBe(1);
    expect(heropower.isUsable()).toBe(true); // Can use again

    heropower.activate();
    expect(heropower.activationsThisTurn).toBe(2);
    expect(heropower.isUsable()).toBe(false); // No more uses
  });

  test('HeroPower resetForNewTurn preserves additionalActivationsThisTurn', () => {
    const heropower = new HeroPower({
      id: 'CS2_034',
      type: CardType.HERO_POWER,
      cardClass: CardClass.MAGE,
      cost: 2
    });

    heropower.activationsThisTurn = 2;
    heropower.additionalActivationsThisTurn = 1;
    heropower.resetForNewTurn();

    expect(heropower.activationsThisTurn).toBe(0);
    // additionalActivationsThisTurn is preserved because it represents permanent upgrades
    expect(heropower.additionalActivationsThisTurn).toBe(1);
  });
});
