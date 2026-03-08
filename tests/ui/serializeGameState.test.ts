/**
 * Tests for serializeGameState
 */

import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { CardLoader } from '../../src/cards/loader';
import { serializeGameState } from '../../src/ui/engine-bridge/serializeGameState';
import path from 'path';

describe('serializeGameState', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeAll(() => {
    // Load card definitions
    const xmlPath = path.join(__dirname, '../../src/cards/CardDefs.xml');
    CardLoader.loadFromXml(xmlPath);
  });

  beforeEach(() => {
    // Create players with simple decks
    const deck1 = [
      'CS2_168', // Murloc Raider
      'CS2_168', 'CS2_171', 'CS2_171',
    ];

    const deck2 = [
      'CS2_168',
      'CS2_168', 'CS2_171', 'CS2_171',
    ];

    player1 = new Player('Player 1', deck1);
    player2 = new Player('Player 2', deck2);

    player1.startingHero = 'HERO_08'; // Jaina (Mage)
    player2.startingHero = 'HERO_01'; // Garrosh (Warrior)

    game = new Game({
      players: [player1, player2],
      seed: 12345,
    });

    game.start();
  });

  it('should serialize game state without crashing', () => {
    const state = serializeGameState(game);
    expect(state).toBeDefined();
  });

  it('should have correct turn number', () => {
    const state = serializeGameState(game);
    expect(state.turn).toBe(1);
  });

  it('should have playing mode at start', () => {
    const state = serializeGameState(game);
    expect(state.mode).toBe('playing');
  });

  it('should have local player with correct structure', () => {
    const state = serializeGameState(game);

    expect(state.localPlayer).toBeDefined();
    expect(state.localPlayer.name).toBe('Player 1');
    expect(state.localPlayer.hand).toBeDefined();
    expect(Array.isArray(state.localPlayer.hand)).toBe(true);
    expect(state.localPlayer.field).toBeDefined();
    expect(Array.isArray(state.localPlayer.field)).toBe(true);
  });

  it('should have opponent player with correct structure', () => {
    const state = serializeGameState(game);

    expect(state.opponent).toBeDefined();
    expect(state.opponent.name).toBe('Player 2');
  });

  it('should have hand cards with required properties', () => {
    const state = serializeGameState(game);

    if (state.localPlayer.hand.length > 0) {
      const card = state.localPlayer.hand[0];
      expect(card.uiId).toBeDefined();
      expect(card.id).toBeDefined();
      expect(card.name).toBeDefined();
      expect(card.cost).toBeDefined();
      expect(card.type).toBeDefined();
    }
  });

  it('should have current player ID', () => {
    const state = serializeGameState(game);
    expect(state.currentPlayerId).toBeDefined();
    expect(typeof state.currentPlayerId).toBe('string');
  });

  it('should have mana information', () => {
    const state = serializeGameState(game);
    expect(state.localPlayer.mana).toBeDefined();
    expect(state.localPlayer.maxMana).toBeDefined();
  });

  it('should have deck count', () => {
    const state = serializeGameState(game);
    expect(state.localPlayer.deckCount).toBeDefined();
    expect(typeof state.localPlayer.deckCount).toBe('number');
  });

  it('should allow specifying local player as second player', () => {
    const state = serializeGameState(game, 'Player 2');

    expect(state.localPlayer.name).toBe('Player 2');
    expect(state.opponent.name).toBe('Player 1');
  });
});
