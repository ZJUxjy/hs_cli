const EventListener = require('../../../../src/game/logic/events/EventListener');

describe('EventListener', () => {
  test('should create event listener', () => {
    const listener = new EventListener('PLAY', (game, source, target) => {});
    expect(listener.event).toBe('PLAY');
    expect(typeof listener.handler).toBe('function');
  });

  test('should trigger handler', () => {
    const handler = jest.fn();
    const listener = new EventListener('PLAY', handler);
    const game = {};
    const source = {};

    listener.trigger(game, source);
    expect(handler).toHaveBeenCalledWith(game, source);
  });
});
