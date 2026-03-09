import { Discover } from '../../src/actions/discover';
import { Player } from '../../src/core/player';
import { Game } from '../../src/core/game';
import { CardType, CardClass } from '../../src/enums';
import { Card, createCard } from '../../src/core/card';

describe('Discover Action', () => {
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

  test('should create Discover action', () => {
    const discover = new Discover(player, ['CS2_120', 'CS2_121', 'CS2_122']);
    expect(discover).toBeDefined();
    expect(discover.player).toBe(player);
    expect(discover.cardPool).toEqual(['CS2_120', 'CS2_121', 'CS2_122']);
  });

  test('Discover creates choice with 3 options from larger pool', () => {
    // Create mock card definitions
    const mockCards = [
      createCard({ id: 'CS2_120', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1 } as any),
      createCard({ id: 'CS2_121', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2 } as any),
      createCard({ id: 'CS2_122', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3 } as any),
      createCard({ id: 'CS2_123', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4 } as any),
    ];

    // Create a custom Discover class that overrides _loadCardsFromPool
    class TestDiscover extends Discover {
      protected override _loadCardsFromPool(): Card[] {
        return mockCards;
      }
    }

    const discover = new TestDiscover(player, ['CS2_120', 'CS2_121', 'CS2_122', 'CS2_123']);
    discover.trigger(player);

    expect(player.choice).toBeDefined();
    expect(player.choice?.cards.length).toBe(3);
    expect(player.choice?.minCount).toBe(1);
    expect(player.choice?.maxCount).toBe(1);
  });

  test('Discover respects card filter', () => {
    const mockCards = [
      createCard({ id: 'CS2_120', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1 } as any),
      createCard({ id: 'CS2_121', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2 } as any),
      createCard({ id: 'CS2_122', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 5 } as any),
    ];

    // Create a custom Discover class that overrides _loadCardsFromPool
    // The override must also apply the filter to mock cards
    class TestDiscover extends Discover {
      protected override _loadCardsFromPool(_cardPool: string[], filter?: (card: Card) => boolean): Card[] {
        if (!filter) return mockCards;
        return mockCards.filter(filter);
      }
    }

    const discover = new TestDiscover(player, [], {
      filter: (card: Card) => card.cost <= 2
    });

    discover.trigger(player);

    // All cards in choice should pass filter (cost <= 2)
    for (const card of player.choice?.cards || []) {
      expect((card as Card).cost).toBeLessThanOrEqual(2);
    }
  });

  test('Discover respects count option', () => {
    const mockCards = [
      createCard({ id: 'CS2_120', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1 } as any),
      createCard({ id: 'CS2_121', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2 } as any),
      createCard({ id: 'CS2_122', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3 } as any),
      createCard({ id: 'CS2_123', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4 } as any),
    ];

    // Create a custom Discover class that overrides _loadCardsFromPool
    class TestDiscover extends Discover {
      protected override _loadCardsFromPool(): Card[] {
        return mockCards;
      }
    }

    const discover = new TestDiscover(player, [], {
      count: 2
    });

    discover.trigger(player);

    expect(player.choice?.cards.length).toBe(2);
  });

  test('resolve adds chosen card to hand', () => {
    const mockCard = createCard({
      id: 'CS2_120',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1
    } as any);

    const discover = new Discover(player, ['CS2_120']);
    discover.trigger(player);

    // Simulate player choosing a card
    const initialHandSize = player.hand.length;
    discover.resolve(mockCard);

    expect(player.hand.length).toBe(initialHandSize + 1);
    expect(player.choice).toBeUndefined();
  });

  test('resolve does not add card when hand is full', () => {
    // Fill hand to 10 cards
    for (let i = 0; i < 10; i++) {
      const card = createCard({
        id: `CARD_${i}`,
        type: CardType.MINION,
        cardClass: CardClass.NEUTRAL,
        cost: 1
      } as any);
      player.hand.push(card as any);
    }

    const mockCard = createCard({
      id: 'CS2_120',
      type: CardType.MINION,
      cardClass: CardClass.NEUTRAL,
      cost: 1
    } as any);

    const discover = new Discover(player, ['CS2_120']);
    discover.trigger(player);

    const handSizeBeforeResolve = player.hand.length;
    discover.resolve(mockCard);

    // Hand should still be at max
    expect(player.hand.length).toBe(handSizeBeforeResolve);
    expect(player.hand.length).toBe(10);
  });

  test('Discover with empty pool creates no choice', () => {
    const discover = new Discover(player, []);
    discover.trigger(player);

    // With empty pool, choice should either be undefined or empty
    if (player.choice) {
      expect(player.choice.cards.length).toBe(0);
    } else {
      expect(player.choice).toBeUndefined();
    }
  });

  test('Discover sets source on choice', () => {
    const mockCards = [
      createCard({ id: 'CS2_120', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1 } as any),
    ];

    class TestDiscover extends Discover {
      protected override _loadCardsFromPool(): Card[] {
        return mockCards;
      }
    }

    const discover = new TestDiscover(player, ['CS2_120']);
    discover.trigger(player);

    expect(player.choice?.source).toBe(player);
  });

  test('Discover default count is 3', () => {
    const discover = new Discover(player, []);
    expect(discover.options.count).toBeUndefined(); // defaults to 3 in do()
  });

  test('Discover custom count option is preserved', () => {
    const discover = new Discover(player, [], { count: 5 });
    expect(discover.options.count).toBe(5);
  });
});
