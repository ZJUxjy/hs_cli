import { Action, ActionArg, EventListener, EventListenerAt } from '../../src/actions/base';
import { Entity } from '../../src/core/entity';
import { CardType, BlockType } from '../../src/enums';

// Mock Action class for testing
class TestAction extends Action {
  public doCalled = false;
  public doArgs: unknown[] = [];

  constructor(
    private testArgs: unknown[] = [],
    private testKwargs: Record<string, unknown> = {}
  ) {
    super(...testArgs);
    (this as any)._kwargs = testKwargs;
  }

  getArgs(_source: Entity): unknown[] {
    return (this as any)._args;
  }

  do(_source: Entity, ...args: unknown[]): void {
    this.doCalled = true;
    this.doArgs = args;
  }
}

// Mock Selector class for testing
class MockSelector {
  public evalValue: unknown[] = [];

  eval(_source: Entity): unknown[] {
    return this.evalValue;
  }
}

// Mock Entity with events for testing
class MockEntity extends Entity {
  type = CardType.MINION;
  public eventsTriggered: Array<{ action: Action; args: unknown[] }> = [];
  public game: MockGame | null = null;

  constructor() {
    super(null);
  }

  triggerEvent(source: Entity, event: { actions: Action[] }, args: unknown[]): unknown[] {
    for (const action of event.actions) {
      this.eventsTriggered.push({ action, args });
    }
    return [];
  }
}

// Mock Game for testing
class MockGame {
  public actionStartCalls: Array<{ type: BlockType; source: Entity; index: number; target?: Entity }> = [];
  public actionEndCalls: Array<{ type: BlockType; source: Entity }> = [];
  public _entities: Entity[] = [];
  public _hands: Entity[] = [];
  public _decks: Entity[] = [];

  actionStart(type: BlockType, source: Entity, index: number, target?: Entity): void {
    this.actionStartCalls.push({ type, source, index, target });
  }

  actionEnd(type: BlockType, source: Entity): void {
    this.actionEndCalls.push({ type, source });
  }

  get entities(): Iterable<unknown> {
    return this._entities;
  }

  get hands(): Iterable<unknown> {
    return this._hands;
  }

  get decks(): Iterable<unknown> {
    return this._decks;
  }
}

describe('Action', () => {
  test('should store args and callbacks', () => {
    const action = new TestAction(['arg1', 'arg2'], { key: 'value' });
    expect((action as any)._args).toEqual(['arg1', 'arg2']);
    expect((action as any)._kwargs).toEqual({ key: 'value' });
  });

  test('should initialize with empty args and kwargs by default', () => {
    const action = new TestAction();
    expect((action as any)._args).toEqual([]);
    expect((action as any)._kwargs).toEqual({});
    expect(action.callback).toEqual([]);
    expect(action.times).toBe(1);
    expect(action.eventQueue).toEqual([]);
  });

  test('should create ON event listener', () => {
    const trigger = new TestAction();
    const callback1 = new TestAction();
    const callback2 = new TestAction();

    const listener = trigger.on(callback1, callback2);

    expect(listener).toBeInstanceOf(EventListener);
    expect(listener.trigger).toBe(trigger);
    expect(listener.actions).toEqual([callback1, callback2]);
    expect(listener.at).toBe(EventListenerAt.ON);
    expect(listener.once).toBe(false);
  });

  test('should create AFTER event listener', () => {
    const trigger = new TestAction();
    const callback1 = new TestAction();
    const callback2 = new TestAction();

    const listener = trigger.after(callback1, callback2);

    expect(listener).toBeInstanceOf(EventListener);
    expect(listener.trigger).toBe(trigger);
    expect(listener.actions).toEqual([callback1, callback2]);
    expect(listener.at).toBe(EventListenerAt.AFTER);
    expect(listener.once).toBe(false);
  });

  test('should create copy with callbacks using then()', () => {
    const action = new TestAction(['arg1']);
    const callback1 = new TestAction();
    const callback2 = new TestAction();

    const newAction = action.then(callback1, callback2);

    expect(newAction).not.toBe(action);
    expect((newAction as any)._args).toEqual((action as any)._args);
    expect(newAction.callback).toEqual([callback1, callback2]);
  });

  test('trigger should get args and call do()', () => {
    const action = new TestAction(['testArg']);
    const source = {} as Entity;

    const results = action.trigger(source);

    expect(action.doCalled).toBe(true);
    expect(action.doArgs).toEqual(['testArg']);
    expect(results).toEqual([undefined]);
  });

  test('trigger should execute multiple times based on times property', () => {
    const action = new TestAction(['testArg']);
    action.times = 3;
    const source = {} as Entity;

    const results = action.trigger(source);

    expect(action.doCalled).toBe(true);
    expect(results.length).toBe(3);
  });

  test('should match action with same args', () => {
    const action = new TestAction(['arg1', 'arg2']);
    const source = {} as Entity;
    const entity = {} as Entity;

    const matches = action.matches(entity, source, ['arg1', 'arg2']);

    expect(matches).toBe(true);
  });

  test('should not match action with different args', () => {
    const action = new TestAction(['arg1', 'arg2']);
    const source = {} as Entity;
    const entity = {} as Entity;

    const matches = action.matches(entity, source, ['arg1', 'different']);

    expect(matches).toBe(false);
  });

  test('should match with Selector that has eval method', () => {
    const selector = new MockSelector();
    selector.evalValue = ['matched'];

    const action = new TestAction([selector]);
    const source = {} as Entity;
    const entity = {} as Entity;

    const matches = action.matches(entity, source, ['matched']);

    expect(matches).toBe(true);
  });

  test('should match with callable (function)', () => {
    const callable = () => 'computed';
    const action = new TestAction([callable]);
    const source = {} as Entity;
    const entity = {} as Entity;

    const matches = action.matches(entity, source, ['computed']);

    expect(matches).toBe(true);
  });

  test('should not match when args length differs', () => {
    const action = new TestAction(['arg1']);
    const source = {} as Entity;
    const entity = {} as Entity;

    const matches = action.matches(entity, source, ['arg1', 'arg2']);

    expect(matches).toBe(false);
  });

  test('queueBroadcast should add to eventQueue', () => {
    const action = new TestAction();
    const entity = {} as Entity;
    const args = ['arg1', 'arg2'];

    action.queueBroadcast(entity, args);

    expect(action.eventQueue).toHaveLength(1);
    expect(action.eventQueue[0]).toEqual([entity, args]);
  });

  test('resolveBroadcasts should process queued broadcasts', () => {
    const action = new TestAction();
    const mockEntity = new MockEntity();

    action.queueBroadcast(mockEntity, ['arg1']);
    action.queueBroadcast(mockEntity, ['arg2']);

    // Mock the broadcastSingle method
    const broadcastSingleSpy = jest.spyOn(action as any, 'broadcastSingle').mockImplementation(() => {});

    action.resolveBroadcasts();

    expect(broadcastSingleSpy).toHaveBeenCalledTimes(2);
    expect(action.eventQueue).toHaveLength(0);

    broadcastSingleSpy.mockRestore();
  });
});

describe('Action with Game', () => {
  let game: MockGame;

  beforeEach(() => {
    game = new MockGame();
  });

  test('broadcast should trigger entity events', () => {
    const action = new TestAction(['testArg']);

    // Create a source entity with a game reference
    const source = new MockEntity();
    source.game = game;

    action.broadcast(source, EventListenerAt.ON, 'extraArg');

    expect(game.actionStartCalls.length).toBe(1);
    expect(game.actionStartCalls[0]).toEqual({
      type: BlockType.TRIGGER,
      source,
      index: -1,
      target: undefined
    });
    expect(game.actionEndCalls.length).toBe(1);
    expect(game.actionEndCalls[0]).toEqual({
      type: BlockType.TRIGGER,
      source
    });
  });

  test('broadcast should iterate through game entities, hands, and decks', () => {
    const action = new TestAction(['testArg']);

    // Track which entities were processed
    const processedEntities: Entity[] = [];

    // Override broadcastSingle to track calls
    const originalBroadcastSingle = (action as any).broadcastSingle;
    (action as any).broadcastSingle = function(obj: Entity, _at: EventListenerAt, _source: Entity, ..._args: unknown[]) {
      processedEntities.push(obj);
    };

    // Add some mock entities to the game
    const entity1 = new MockEntity();
    const entity2 = new MockEntity();
    const handEntity = new MockEntity();
    const deckEntity = new MockEntity();

    game._entities = [entity1, entity2];
    game._hands = [handEntity];
    game._decks = [deckEntity];

    const source = new MockEntity();
    source.game = game;

    action.broadcast(source, EventListenerAt.ON);

    // Should have processed entities from game.entities, game.hands, and game.decks
    expect(processedEntities.length).toBe(4);
    expect(processedEntities).toContain(entity1);
    expect(processedEntities).toContain(entity2);
    expect(processedEntities).toContain(handEntity);
    expect(processedEntities).toContain(deckEntity);

    // Restore original method
    (action as any).broadcastSingle = originalBroadcastSingle;
  });

  test('broadcast should do nothing if source has no game', () => {
    const action = new TestAction(['testArg']);

    // Create a source entity without a game reference
    const source = new MockEntity();
    source.game = null;

    action.broadcast(source, EventListenerAt.ON);

    expect(game.actionStartCalls.length).toBe(0);
    expect(game.actionEndCalls.length).toBe(0);
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

  test('evaluate should return null by default', () => {
    const arg = new ActionArg();
    const source = {} as Entity;
    expect(arg.evaluate(source)).toBe(null);
  });
});

describe('EventListener', () => {
  test('should create EventListener', () => {
    const trigger = new TestAction();
    const listener = new EventListener(trigger, [], EventListenerAt.ON);
    expect(listener.trigger).toBe(trigger);
    expect(listener.at).toBe(EventListenerAt.ON);
  });

  test('should have once false by default', () => {
    const trigger = new TestAction();
    const listener = new EventListener(trigger, [], EventListenerAt.ON);
    expect(listener.once).toBe(false);
  });
});
