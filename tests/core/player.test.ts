import { Player } from '../../src/core/player';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player('TestPlayer', []);
  });

  test('should have empty hand initially', () => {
    expect(player.hand.length).toBe(0);
  });

  test('should have empty deck initially', () => {
    expect(player.deck.length).toBe(0);
  });

  test('should have empty field initially', () => {
    expect(player.field.length).toBe(0);
  });

  test('should initialize with default mana', () => {
    expect(player.mana).toBe(0);
    expect(player.maxMana).toBe(0);
  });
});
