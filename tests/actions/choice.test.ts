import { Choice } from '../../src/actions/choice';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { Card, Minion, createCard } from '../../src/core/card';
import { CardType, CardClass } from '../../src/enums';

describe('Choice Action', () => {
  let game: Game;
  let player: Player;
  let opponent: Player;

  beforeEach(() => {
    // Create players with empty decks
    player = new Player('Test', []);
    opponent = new Player('Opp', []);
    game = new Game({ players: [player, opponent], seed: 12345 });
    player.startingHero = 'HERO_01';
    game.setup();
  });

  test('Choice presents options to player', () => {
    const option1 = createCard({ id: 'OPT_1', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 1, health: 1 } as any) as Minion;
    const option2 = createCard({ id: 'OPT_2', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 2, health: 2 } as any) as Minion;

    const choice = new Choice(player, [option1, option2]);
    choice.trigger(player);

    expect(player.choice).toBeDefined();
    expect(player.choice?.cards.length).toBe(2);
  });

  test('Choice resolves with selected option', () => {
    const option1 = createCard({ id: 'OPT_1', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 1, health: 1 } as any) as Minion;
    const option2 = createCard({ id: 'OPT_2', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 2, health: 2 } as any) as Minion;

    const choice = new Choice(player, [option1, option2]);
    choice.trigger(player);

    // Simulate choosing option 2
    choice.resolve(option2);

    expect(player.choice).toBeUndefined();
  });

  test('Choice sets minCount and maxCount correctly', () => {
    const option1 = createCard({ id: 'OPT_1', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 1, health: 1 } as any) as Minion;
    const option2 = createCard({ id: 'OPT_2', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 2, health: 2 } as any) as Minion;

    const choice = new Choice(player, [option1, option2], 1, 1);
    choice.trigger(player);

    expect(player.choice?.minCount).toBe(1);
    expect(player.choice?.maxCount).toBe(1);
  });

  test('Choice supports multiple selections', () => {
    const option1 = createCard({ id: 'OPT_1', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 1, health: 1 } as any) as Minion;
    const option2 = createCard({ id: 'OPT_2', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 2, health: 2 } as any) as Minion;
    const option3 = createCard({ id: 'OPT_3', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 3, health: 3 } as any) as Minion;

    const choice = new Choice(player, [option1, option2, option3], 1, 2);
    choice.trigger(player);

    expect(player.choice?.minCount).toBe(1);
    expect(player.choice?.maxCount).toBe(2);
  });

  test('Choice resolve accepts array of chosen cards', () => {
    const option1 = createCard({ id: 'OPT_1', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 1, health: 1 } as any) as Minion;
    const option2 = createCard({ id: 'OPT_2', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 2, health: 2 } as any) as Minion;

    const choice = new Choice(player, [option1, option2]);
    choice.trigger(player);

    // Simulate choosing multiple options
    choice.resolve([option1, option2]);

    expect(player.choice).toBeUndefined();
  });

  test('Choice sets source on player choice', () => {
    const option1 = createCard({ id: 'OPT_1', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 1, health: 1 } as any) as Minion;
    const option2 = createCard({ id: 'OPT_2', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 2, health: 2 } as any) as Minion;

    const choice = new Choice(player, [option1, option2]);
    choice.trigger(player);

    expect(player.choice?.source).toBe(player);
  });

  test('Choice default minCount and maxCount are 1', () => {
    const option1 = createCard({ id: 'OPT_1', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 1, health: 1 } as any) as Minion;
    const option2 = createCard({ id: 'OPT_2', type: CardType.MINION, cardClass: CardClass.DRUID, cost: 1, attack: 2, health: 2 } as any) as Minion;

    const choice = new Choice(player, [option1, option2]);
    expect(choice.minCount).toBe(1);
    expect(choice.maxCount).toBe(1);
  });
});
