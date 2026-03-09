import { EventListener, EventListenerAt } from '../../src/actions/eventlistener';
import { Action } from '../../src/actions/base';

describe('EventListener', () => {
  test('should create EventListener with ON timing', () => {
    const trigger = { constructor: { name: 'Damage' } } as Action;
    const actions: Action[] = [];
    const listener = new EventListener(trigger, actions, EventListenerAt.ON);

    expect(listener.trigger).toBe(trigger);
    expect(listener.actions).toBe(actions);
    expect(listener.at).toBe(EventListenerAt.ON);
    expect(listener.once).toBe(false);
  });

  test('should create EventListener with AFTER timing', () => {
    const trigger = { constructor: { name: 'Play' } } as Action;
    const actions: Action[] = [];
    const listener = new EventListener(trigger, actions, EventListenerAt.AFTER);

    expect(listener.at).toBe(EventListenerAt.AFTER);
  });
});
