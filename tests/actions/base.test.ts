import { Action, ActionArg, EventListener, EventListenerAt } from '../../src/actions/base';
import { Entity } from '../../src/core/entity';

describe('Action', () => {
  test('Action should have trigger method', () => {
    const action = new Action();
    expect(typeof action.trigger).toBe('function');
  });

  test('Action trigger returns empty array by default', () => {
    const action = new Action();
    const source = {} as unknown as Entity;
    const result = action.trigger(source);
    expect(result).toEqual([]);
  });
});

describe('EventListener', () => {
  test('should create EventListener', () => {
    const trigger = new Action();
    const listener = new EventListener(trigger, [], EventListenerAt.ON);
    expect(listener.trigger).toBe(trigger);
    expect(listener.at).toBe(EventListenerAt.ON);
  });

  test('should have once false by default', () => {
    const trigger = new Action();
    const listener = new EventListener(trigger, [], EventListenerAt.ON);
    expect(listener.once).toBe(false);
  });
});

describe('ActionArg', () => {
  test('should create ActionArg', () => {
    const arg = new ActionArg();
    expect(arg.index).toBe(0);
    expect(arg.name).toBe('');
    expect(arg.owner).toBe(null);
  });

  test('should have evaluate method', () => {
    const arg = new ActionArg();
    expect(typeof arg.evaluate).toBe('function');
  });
});
