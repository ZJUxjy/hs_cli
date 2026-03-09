import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { MulliganChoice } from '../../src/actions/mulligan';
import { CardType, CardClass, Zone } from '../../src/enums';
import { PlayableCard } from '../../src/core/card';

describe('MulliganChoice Action', () => {
  let game: Game;
  let player: Player;
  let player2: Player;

  beforeEach(() => {
    player = new Player('Player1', []);
    player2 = new Player('Player2', []);
    game = new Game({ players: [player, player2], seed: 12345 });
    game.setup();

    // Add cards to hand (simulating initial draw)
    const card1 = new PlayableCard({ id: 'CS2_120', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1 });
    const card2 = new PlayableCard({ id: 'CS2_121', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2 });
    const card3 = new PlayableCard({ id: 'CS2_122', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3 });
    (card1 as any).zone = Zone.HAND;
    (card2 as any).zone = Zone.HAND;
    (card3 as any).zone = Zone.HAND;
    (card1 as any).controller = player;
    (card2 as any).controller = player;
    (card3 as any).controller = player;
    player.hand.push(card1, card2, card3);
  });

  test('MulliganChoice creates choice for player with callback', () => {
    const mulligan = new MulliganChoice(player, () => {});
    mulligan.trigger(game);

    expect(player.choice).toBeDefined();
    expect(player.choice?.cards.length).toBe(3);
    expect(player.choice?.minCount).toBe(0);
    expect(player.choice?.maxCount).toBe(3);
  });

  test('MulliganChoice callback resolves mulligan', () => {
    let callbackCalled = false;
    const mulligan = new MulliganChoice(player, () => {
      callbackCalled = true;
    });
    mulligan.trigger(game);

    // Simulate player choice (keep all cards - no replacements)
    mulligan.resolve([]);

    expect(callbackCalled).toBe(true);
    expect(player.choice).toBeUndefined();
  });

  test('MulliganChoice resolve replaces selected cards', () => {
    // Add cards to deck for replacement (more cards to reduce chance of drawing same ones back)
    const deckCard1 = new PlayableCard({ id: 'CS2_130', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 1 });
    const deckCard2 = new PlayableCard({ id: 'CS2_131', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 2 });
    const deckCard3 = new PlayableCard({ id: 'CS2_132', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 3 });
    const deckCard4 = new PlayableCard({ id: 'CS2_133', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 4 });
    const deckCard5 = new PlayableCard({ id: 'CS2_134', type: CardType.MINION, cardClass: CardClass.NEUTRAL, cost: 5 });
    for (const card of [deckCard1, deckCard2, deckCard3, deckCard4, deckCard5]) {
      (card as any).zone = Zone.DECK;
      (card as any).controller = player;
      player.deck.push(card);
    }

    const mulligan = new MulliganChoice(player, () => {});
    mulligan.trigger(game);

    // Verify choice was set up correctly
    expect(player.choice).toBeDefined();
    expect(player.choice?.cards.length).toBe(3);

    const cardsToReplace = [player.hand.at(0)!, player.hand.at(1)!];
    const originalHandSize = player.hand.length;

    // Debug: verify cardsToReplace contains valid cards from hand
    expect(player.hand).toContain(cardsToReplace[0]);
    expect(player.hand).toContain(cardsToReplace[1]);

    mulligan.resolve(cardsToReplace);

    // Hand should still have the same number of cards
    expect(player.hand.length).toBe(originalHandSize);
    // Replaced cards should be in deck
    expect(player.deck).toContain(cardsToReplace[0]);
    expect(player.deck).toContain(cardsToReplace[1]);
  });

  test('MulliganChoice with no callback resolves immediately', () => {
    const mulligan = new MulliganChoice(player);
    mulligan.trigger(game);

    // Without callback, it should resolve immediately with no replacements
    expect(player.choice).toBeUndefined();
  });

  test('MulliganChoice resolve with empty selection keeps all cards', () => {
    const mulligan = new MulliganChoice(player, () => {});
    mulligan.trigger(game);

    const originalHand = [...player.hand];
    mulligan.resolve([]);

    expect(player.hand.length).toBe(originalHand.length);
    // All original cards should still be in hand
    for (const card of originalHand) {
      expect(player.hand).toContain(card);
    }
  });
});
