import { Draw } from '../../src/actions/draw';
import { Entity } from '../../src/core/entity';
import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { PlayableCard } from '../../src/core/card';
import { CardType, CardClass } from '../../src/enums';

describe('Draw', () => {
  let game: Game;
  let player: Player;

  beforeEach(() => {
    player = new Player('Player1', []);
    const player2 = new Player('Player2', []);
    game = new Game({ players: [player, player2], seed: 12345 });
    game.setup();

    // Add cards to deck
    const card1 = new PlayableCard({ id: 'card1', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 1 });
    const card2 = new PlayableCard({ id: 'card2', type: CardType.SPELL, cardClass: CardClass.MAGE, cost: 2 });
    player.deck.push(card1, card2);
  });

  test('should create Draw action', () => {
    const source = { entityId: 1 } as unknown as Entity;
    const draw = new Draw(source);
    expect(draw.source).toBe(source);
  });

  test('should default to drawing 1 card', () => {
    const source = { entityId: 1 } as unknown as Entity;
    const draw = new Draw(source);
    expect(draw.count).toBe(1);
  });

  test('should draw cards from deck to hand', () => {
    const draw = new Draw(player, 1);
    const drawn = draw.trigger(player);
    expect(drawn.length).toBe(1);
    expect(player.hand.length).toBe(1);
    expect(player.deck.length).toBe(1);
  });

  test('should draw multiple cards', () => {
    const draw = new Draw(player, 2);
    const drawn = draw.trigger(player);
    expect(drawn.length).toBe(2);
    expect(player.hand.length).toBe(2);
    expect(player.deck.length).toBe(0);
  });

  test('should not draw more than available', () => {
    const draw = new Draw(player, 5);
    const drawn = draw.trigger(player);
    expect(drawn.length).toBe(2);
    expect(player.hand.length).toBe(2);
  });
});
