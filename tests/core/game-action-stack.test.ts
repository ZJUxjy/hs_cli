import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { BlockType } from '../../src/enums/blocktype';
import { State } from '../../src/enums';

describe('Game Action Stack', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    game = new Game({ players: [player1, player2], seed: 12345 });
    game.setup();
  });

  test('should initialize action stack to 0', () => {
    // The action stack should start at 0
    expect((game as any)._actionStack).toBe(0);
  });

  test('should increment action stack on actionStart', () => {
    const initialStack = (game as any)._actionStack;
    game.actionStart(BlockType.ATTACK, game, 0);
    expect((game as any)._actionStack).toBe(initialStack + 1);
  });

  test('should decrement action stack on actionEnd', () => {
    game.actionStart(BlockType.ATTACK, game, 0);
    const stackAfterStart = (game as any)._actionStack;
    game.actionEnd(BlockType.ATTACK, game);
    expect((game as any)._actionStack).toBe(stackAfterStart - 1);
  });

  test('should handle PLAY type differently', () => {
    // PLAY type should NOT increment the action stack
    const initialStack = (game as any)._actionStack;
    game.actionStart(BlockType.PLAY, game, 0);
    expect((game as any)._actionStack).toBe(initialStack);

    // PLAY type should NOT decrement the action stack
    game.actionEnd(BlockType.PLAY, game);
    expect((game as any)._actionStack).toBe(initialStack);
  });

  test('should throw error when actionEnd called on ended game', () => {
    game.state = State.COMPLETE;
    expect(() => game.actionEnd(BlockType.ATTACK, game)).toThrow('The game has ended.');
  });

  test('should call refreshAuras and processDeaths when action stack reaches 0', () => {
    const refreshAurasSpy = jest.spyOn(game, 'refreshAuras');
    const processDeathsSpy = jest.spyOn(game, 'processDeaths');

    game.actionStart(BlockType.ATTACK, game, 0);
    expect(refreshAurasSpy).not.toHaveBeenCalled();
    expect(processDeathsSpy).not.toHaveBeenCalled();

    game.actionEnd(BlockType.ATTACK, game);
    expect(refreshAurasSpy).toHaveBeenCalled();
    expect(processDeathsSpy).toHaveBeenCalled();

    refreshAurasSpy.mockRestore();
    processDeathsSpy.mockRestore();
  });

  test('should not call refreshAuras or processDeaths when action stack is not 0', () => {
    const refreshAurasSpy = jest.spyOn(game, 'refreshAuras');
    const processDeathsSpy = jest.spyOn(game, 'processDeaths');

    // Start two actions
    game.actionStart(BlockType.ATTACK, game, 0);
    game.actionStart(BlockType.TRIGGER, game, 0);

    expect((game as any)._actionStack).toBe(2);

    // End one action - stack should be 1, so no refresh/process
    game.actionEnd(BlockType.TRIGGER, game);
    expect((game as any)._actionStack).toBe(1);
    expect(refreshAurasSpy).not.toHaveBeenCalled();
    expect(processDeathsSpy).not.toHaveBeenCalled();

    // End the second action - stack should be 0, so refresh/process should be called
    game.actionEnd(BlockType.ATTACK, game);
    expect((game as any)._actionStack).toBe(0);
    expect(refreshAurasSpy).toHaveBeenCalled();
    expect(processDeathsSpy).toHaveBeenCalled();

    refreshAurasSpy.mockRestore();
    processDeathsSpy.mockRestore();
  });

  test('should handle nested non-PLAY actions correctly', () => {
    const refreshAurasSpy = jest.spyOn(game, 'refreshAuras');
    const processDeathsSpy = jest.spyOn(game, 'processDeaths');

    // Start multiple nested actions
    game.actionStart(BlockType.ATTACK, game, 0);
    game.actionStart(BlockType.TRIGGER, game, 0);
    game.actionStart(BlockType.POWER, game, 0);

    expect((game as any)._actionStack).toBe(3);

    // End them one by one
    game.actionEnd(BlockType.POWER, game);
    expect((game as any)._actionStack).toBe(2);
    expect(refreshAurasSpy).not.toHaveBeenCalled();

    game.actionEnd(BlockType.TRIGGER, game);
    expect((game as any)._actionStack).toBe(1);
    expect(refreshAurasSpy).not.toHaveBeenCalled();

    game.actionEnd(BlockType.ATTACK, game);
    expect((game as any)._actionStack).toBe(0);
    expect(refreshAurasSpy).toHaveBeenCalledTimes(1);
    expect(processDeathsSpy).toHaveBeenCalledTimes(1);

    refreshAurasSpy.mockRestore();
    processDeathsSpy.mockRestore();
  });

  test('should handle mixed PLAY and non-PLAY actions', () => {
    const refreshAurasSpy = jest.spyOn(game, 'refreshAuras');
    const processDeathsSpy = jest.spyOn(game, 'processDeaths');

    // PLAY actions should not affect the stack
    game.actionStart(BlockType.PLAY, game, 0);
    expect((game as any)._actionStack).toBe(0);

    game.actionStart(BlockType.ATTACK, game, 0);
    expect((game as any)._actionStack).toBe(1);

    game.actionStart(BlockType.PLAY, game, 0);
    expect((game as any)._actionStack).toBe(1);

    game.actionEnd(BlockType.PLAY, game);
    expect((game as any)._actionStack).toBe(1);
    expect(refreshAurasSpy).not.toHaveBeenCalled();

    game.actionEnd(BlockType.ATTACK, game);
    expect((game as any)._actionStack).toBe(0);
    expect(refreshAurasSpy).toHaveBeenCalledTimes(1);
    expect(processDeathsSpy).toHaveBeenCalledTimes(1);

    game.actionEnd(BlockType.PLAY, game);
    expect((game as any)._actionStack).toBe(0);

    refreshAurasSpy.mockRestore();
    processDeathsSpy.mockRestore();
  });
});
