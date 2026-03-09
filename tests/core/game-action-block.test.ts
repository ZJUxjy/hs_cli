import { Game } from '../../src/core/game';
import { Player } from '../../src/core/player';
import { Entity, EntityGameEvent } from '../../src/core/entity';
import { Action } from '../../src/actions/base';
import { EventListener, EventListenerAt } from '../../src/actions/eventlistener';
import { BlockType, CardType } from '../../src/enums';

// Mock action for testing
class TestAction extends Action {
  public name: string;
  public triggerCalled = false;
  public triggerSource: Entity | null = null;

  constructor(name: string) {
    super();
    this.name = name;
  }

  trigger(source: Entity): unknown[] {
    this.triggerCalled = true;
    this.triggerSource = source;
    return [`result-${this.name}`];
  }
}

// Mock entity with _events for testing
class TestEntity extends Entity {
  public type = CardType.MINION;
  public _events: EntityGameEvent[] = [];

  constructor() {
    super();
  }
}

// Mock spell entity
class TestSpellEntity extends Entity {
  public type = CardType.SPELL;
  public controller: TestEntity;
  public _events: EntityGameEvent[] = [];

  constructor(controller: TestEntity) {
    super();
    this.controller = controller;
  }
}

describe('Game Action Block', () => {
  let game: Game;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    player1 = new Player('Player1', []);
    player2 = new Player('Player2', []);
    game = new Game({ players: [player1, player2], seed: 12345 });
    game.setup();
  });

  test('should execute action block', () => {
    const source = new TestEntity();
    const action1 = new TestAction('action1');
    const action2 = new TestAction('action2');

    const results = game.actionBlock(source, [action1, action2], BlockType.PLAY, 0);

    expect(action1.triggerCalled).toBe(true);
    expect(action2.triggerCalled).toBe(true);
    expect(action1.triggerSource).toBe(source);
    expect(action2.triggerSource).toBe(source);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual(['result-action1']);
    expect(results[1]).toEqual(['result-action2']);
  });

  test('should handle empty actions array', () => {
    const source = new TestEntity();

    const results = game.actionBlock(source, [], BlockType.PLAY);

    expect(results).toEqual([]);
  });

  test('should handle actionTrigger method with event args', () => {
    const source = new TestEntity();
    const action1 = new TestAction('action1');
    const eventArgs = { someData: 'test' };

    // Mock queueActions to verify eventArgs are passed
    const queueActionsSpy = jest.spyOn(game, 'queueActions').mockReturnValue([['result']]);

    const results = game.actionTrigger(source, [action1], eventArgs);

    expect(queueActionsSpy).toHaveBeenCalledWith(source, [action1], eventArgs);
    expect(results).toEqual([['result']]);

    queueActionsSpy.mockRestore();
  });

  test('should queue actions with event args', () => {
    const source = new TestEntity();
    const action1 = new TestAction('action1');
    const eventArgs = { testData: 'value' };

    // Store original eventArgs
    source.eventArgs = { original: true };

    const results = game.queueActions(source, [action1], eventArgs);

    // During execution, eventArgs should be set
    expect(action1.triggerCalled).toBe(true);
    // After execution, eventArgs should be restored
    expect(source.eventArgs).toEqual({ original: true });
    expect(results).toHaveLength(1);
  });

  test('should detect and register EventListeners', () => {
    const source = new TestEntity();
    const triggerAction = new TestAction('trigger');
    const listenerAction = new TestAction('listenerAction');
    const eventListener = new EventListener(triggerAction, [listenerAction], EventListenerAt.ON);

    // Initially no events
    expect(source._events).toHaveLength(0);

    game.triggerActions(source, [eventListener as unknown as Action]);

    // EventListener should be registered with once=true
    expect(source._events).toHaveLength(1);
    expect(source._events[0]).toBe(eventListener);
    expect(eventListener.once).toBe(true);
  });

  test('should use controller for SPELL type when registering EventListeners', () => {
    const controller = new TestEntity();
    const spellSource = new TestSpellEntity(controller);
    const triggerAction = new TestAction('trigger');
    const listenerAction = new TestAction('listenerAction');
    const eventListener = new EventListener(triggerAction, [listenerAction], EventListenerAt.ON);

    // Initially no events on controller
    expect(controller._events).toHaveLength(0);
    expect(spellSource._events).toHaveLength(0);

    game.triggerActions(spellSource, [eventListener as unknown as Action]);

    // EventListener should be registered on controller, not the spell
    expect(controller._events).toHaveLength(1);
    expect(spellSource._events).toHaveLength(0);
    expect(controller._events[0]).toBe(eventListener);
  });

  test('should trigger regular actions and return results', () => {
    const source = new TestEntity();
    const action1 = new TestAction('action1');
    const action2 = new TestAction('action2');

    const results = game.triggerActions(source, [action1, action2]);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual(['result-action1']);
    expect(results[1]).toEqual(['result-action2']);
  });

  test('should handle mixed EventListeners and regular actions', () => {
    const source = new TestEntity();
    const regularAction = new TestAction('regular');
    const triggerAction = new TestAction('trigger');
    const listenerAction = new TestAction('listenerAction');
    const eventListener = new EventListener(triggerAction, [listenerAction], EventListenerAt.ON);

    const results = game.triggerActions(source, [regularAction, eventListener as unknown as Action]);

    // Regular action should return result
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(['result-regular']);

    // EventListener should be registered
    expect(source._events).toHaveLength(1);
    expect(source._events[0]).toBe(eventListener);
  });

  test('cheatAction should be alias for actionTrigger', () => {
    const source = new TestEntity();
    const action1 = new TestAction('action1');

    const triggerSpy = jest.spyOn(game, 'actionTrigger').mockReturnValue([['result']]);

    const results = game.cheatAction(source, [action1]);

    expect(triggerSpy).toHaveBeenCalledWith(source, [action1]);
    expect(results).toEqual([['result']]);

    triggerSpy.mockRestore();
  });

  test('actionTrigger should use BlockType.TRIGGER', () => {
    const source = new TestEntity();
    const action1 = new TestAction('action1');

    const actionBlockSpy = jest.spyOn(game, 'actionBlock').mockReturnValue([]);

    game.actionTrigger(source, [action1], { event: 'data' });

    expect(actionBlockSpy).toHaveBeenCalledWith(
      source,
      [action1],
      BlockType.TRIGGER,
      -1,
      undefined,
      { event: 'data' }
    );

    actionBlockSpy.mockRestore();
  });

  test('actionBlock should call actionStart and actionEnd', () => {
    const source = new TestEntity();
    const action1 = new TestAction('action1');

    const actionStartSpy = jest.spyOn(game, 'actionStart');
    const actionEndSpy = jest.spyOn(game, 'actionEnd');

    game.actionBlock(source, [action1], BlockType.PLAY, 5, undefined, { test: 'args' });

    expect(actionStartSpy).toHaveBeenCalledWith(BlockType.PLAY, source, 5, undefined);
    expect(actionEndSpy).toHaveBeenCalledWith(BlockType.PLAY, source);

    actionStartSpy.mockRestore();
    actionEndSpy.mockRestore();
  });

  test('queueActions should handle undefined eventArgs', () => {
    const source = new TestEntity();
    const action1 = new TestAction('action1');

    // Store original eventArgs
    source.eventArgs = { original: true };

    const results = game.queueActions(source, [action1]);

    expect(action1.triggerCalled).toBe(true);
    // After execution, eventArgs should be restored to original
    expect(source.eventArgs).toEqual({ original: true });
    expect(results).toHaveLength(1);
  });

  test('actionBlock should handle null actions', () => {
    const source = new TestEntity();

    const results = game.actionBlock(source, null as unknown as Action[], BlockType.PLAY);

    expect(results).toEqual([]);
  });
});
