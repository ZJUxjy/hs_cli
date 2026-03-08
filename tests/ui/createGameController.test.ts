/**
 * Tests for createGameController
 */

import { createGameController } from '../../src/ui/engine-bridge/createGameController';
import { CardLoader } from '../../src/cards/loader';
import path from 'path';

describe('createGameController', () => {
  beforeAll(() => {
    // Load card definitions
    const xmlPath = path.join(__dirname, '../../src/cards/CardDefs.xml');
    CardLoader.loadFromXml(xmlPath);
  });

  it('should create a controller with default config', () => {
    const controller = createGameController();
    expect(controller).toBeDefined();
    expect(controller.getState).toBeDefined();
    expect(controller.dispatch).toBeDefined();
    expect(controller.subscribe).toBeDefined();
    expect(controller.reset).toBeDefined();
  });

  it('should return initial state', () => {
    const controller = createGameController();
    const state = controller.getState();

    expect(state).toBeDefined();
    expect(state.mode).toBe('playing');
    expect(state.turn).toBe(1);
  });

  it('should subscribe to state changes', () => {
    const controller = createGameController();
    const listener = jest.fn();

    const unsubscribe = controller.subscribe(listener);

    // Listener should be called immediately with current state
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'playing',
    }));

    unsubscribe();
  });

  it('should unsubscribe correctly', () => {
    const controller = createGameController();
    const listener = jest.fn();

    const unsubscribe = controller.subscribe(listener);
    listener.mockClear();

    unsubscribe();

    // Dispatch should not call the unsubscribed listener
    controller.dispatch({ type: 'END_TURN' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('should handle END_TURN command', () => {
    const controller = createGameController();
    const initialTurn = controller.getState().turn;

    const result = controller.dispatch({ type: 'END_TURN' });

    expect(result.success).toBe(true);
    expect(controller.getState().turn).toBe(initialTurn + 1);
  });

  it('should handle invalid PLAY_CARD command (index out of bounds)', () => {
    const controller = createGameController();

    const result = controller.dispatch({
      type: 'PLAY_CARD',
      handIndex: 999,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('No card');
  });

  it('should return game instance for debugging', () => {
    const controller = createGameController();
    const game = controller.getGame();

    expect(game).toBeDefined();
    expect(game.turn).toBeDefined();
  });

  it('should reset the game', () => {
    const controller = createGameController();

    // Play some turns
    controller.dispatch({ type: 'END_TURN' });
    controller.dispatch({ type: 'END_TURN' });

    const turnBeforeReset = controller.getState().turn;
    expect(turnBeforeReset).toBeGreaterThan(1);

    // Reset
    controller.reset();

    const stateAfterReset = controller.getState();
    expect(stateAfterReset.turn).toBe(1);
  });

  it('should accept custom player names', () => {
    const controller = createGameController({
      player1Name: 'Alice',
      player2Name: 'Bob',
    });

    const state = controller.getState();

    expect(state.localPlayer.name).toBe('Alice');
    expect(state.opponent.name).toBe('Bob');
  });
});
