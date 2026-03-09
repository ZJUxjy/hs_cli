import { Entity, EntityGameEvent, CardData, Buff, Slot } from '../../src/core/entity';
import { CardType } from '../../src/enums';
import { EventListenerAt } from '../../src/actions/eventlistener';

describe('Entity Event System', () => {
  let entity: Entity;

  beforeEach(() => {
    entity = new Entity();
  });

  test('should initialize events from data', () => {
    const mockAction = jest.fn();
    const data: CardData = {
      scripts: {
        events: [
          { actions: [mockAction], once: false },
          { actions: [mockAction], once: true }
        ]
      }
    };
    const entityWithEvents = new Entity(data);

    expect(entityWithEvents.events).toHaveLength(2);
    expect(entityWithEvents.events[0].actions).toHaveLength(1);
    expect(entityWithEvents.events[0].once).toBe(false);
    expect(entityWithEvents.events[1].once).toBe(true);
  });

  test('triggerEvent should execute event actions', () => {
    const mockAction = jest.fn();
    const mockActionResult = { type: 'TEST_ACTION' };
    mockAction.mockReturnValue(mockActionResult);

    const event: EntityGameEvent = {
      actions: [mockAction],
      once: false
    };

    // Create a mock game with actionTrigger
    const mockActionTrigger = jest.fn().mockReturnValue(['result1']);
    (entity as any).game = {
      actionTrigger: mockActionTrigger
    };

    const source = new Entity();
    const args = ['arg1', 'arg2'];

    const result = entity.triggerEvent(source, event, args);

    expect(mockAction).toHaveBeenCalledWith(entity, 'arg1', 'arg2');
    expect(mockActionTrigger).toHaveBeenCalled();
    expect(result).toEqual(['result1']);
  });

  test('triggerEvent should handle function actions returning arrays', () => {
    const mockAction = jest.fn().mockReturnValue([{ type: 'ACTION1' }, { type: 'ACTION2' }]);

    const event: EntityGameEvent = {
      actions: [mockAction],
      once: false
    };

    const mockActionTrigger = jest.fn().mockReturnValue([]);
    (entity as any).game = {
      actionTrigger: mockActionTrigger
    };

    entity.triggerEvent(entity, event, []);

    const passedActions = mockActionTrigger.mock.calls[0][1];
    expect(passedActions).toHaveLength(2);
  });

  test('triggerEvent should handle non-function actions', () => {
    const staticAction = { type: 'STATIC_ACTION' };

    const event: EntityGameEvent = {
      actions: [staticAction],
      once: false
    };

    const mockActionTrigger = jest.fn().mockReturnValue([]);
    (entity as any).game = {
      actionTrigger: mockActionTrigger
    };

    entity.triggerEvent(entity, event, []);

    const passedActions = mockActionTrigger.mock.calls[0][1];
    expect(passedActions).toContain(staticAction);
  });

  test('triggerEvent should remove once events', () => {
    const data: CardData = {
      scripts: {
        events: [
          { actions: [], once: true },
          { actions: [], once: false }
        ]
      }
    };
    const entityWithOnce = new Entity(data);

    expect(entityWithOnce.events).toHaveLength(2);

    const onceEvent = entityWithOnce.events[0];
    entityWithOnce.triggerEvent(entityWithOnce, onceEvent, []);

    // After triggering, the once event should be removed
    expect(entityWithOnce.events).toHaveLength(1);
    expect(entityWithOnce.events[0].once).toBe(false);
  });

  test('should have buffs getter returning empty array by default', () => {
    expect(entity.buffs).toEqual([]);
    expect(Array.isArray(entity.buffs)).toBe(true);
  });

  test('should have slots getter returning empty array by default', () => {
    expect(entity.slots).toEqual([]);
    expect(Array.isArray(entity.slots)).toBe(true);
  });

  test('should support trigger and at properties in EntityGameEvent', () => {
    const mockTrigger = { type: 'TRIGGER' };
    const event: EntityGameEvent = {
      actions: [],
      trigger: mockTrigger,
      at: EventListenerAt.ON,
      once: false
    };

    expect(event.trigger).toBe(mockTrigger);
    expect(event.at).toBe(EventListenerAt.ON);
  });

  test('should support AFTER timing in EntityGameEvent', () => {
    const event: EntityGameEvent = {
      actions: [],
      at: EventListenerAt.AFTER
    };

    expect(event.at).toBe(EventListenerAt.AFTER);
  });

  test('should return empty array when game or actionTrigger is not available', () => {
    const event: EntityGameEvent = {
      actions: [{ type: 'ACTION' }],
      once: false
    };

    // No game set
    const result = entity.triggerEvent(entity, event, []);
    expect(result).toEqual([]);

    // Game set but no actionTrigger
    (entity as any).game = {};
    const result2 = entity.triggerEvent(entity, event, []);
    expect(result2).toEqual([]);
  });

  test('should use source.game if available', () => {
    const mockActionTrigger = jest.fn().mockReturnValue(['result']);
    const source = new Entity();
    (source as any).game = {
      actionTrigger: mockActionTrigger
    };

    const event: EntityGameEvent = {
      actions: [{ type: 'ACTION' }],
      once: false
    };

    entity.triggerEvent(source, event, []);

    expect(mockActionTrigger).toHaveBeenCalled();
  });
});

describe('Entity Buffs and Slots', () => {
  test('should access _buffs through buffs getter', () => {
    const entity = new Entity();
    const mockBuff: Buff = {
      remove: jest.fn(),
      _getattr: jest.fn().mockImplementation((attr, value) => value)
    };

    // Access internal storage to add buff
    (entity as any)._buffs = [mockBuff];

    expect(entity.buffs).toHaveLength(1);
    expect(entity.buffs[0]).toBe(mockBuff);
  });

  test('should access _slots through slots getter', () => {
    const entity = new Entity();
    const mockSlot: Slot = {
      _getattr: jest.fn().mockImplementation((attr, value) => value)
    };

    // Access internal storage to add slot
    (entity as any)._slots = [mockSlot];

    expect(entity.slots).toHaveLength(1);
    expect(entity.slots[0]).toBe(mockSlot);
  });
});

describe('Entity _getattr method', () => {
  test('should return base value when no modifiers', () => {
    const entity = new Entity();
    const result = (entity as any)._getattr('attack', 5);
    expect(result).toBe(5);
  });

  test('should add private attribute value', () => {
    const entity = new Entity();
    (entity as any)._attack = 3;

    const result = (entity as any)._getattr('attack', 5);
    expect(result).toBe(8);
  });

  test('should apply buff modifications', () => {
    const entity = new Entity();
    const mockBuff: Buff = {
      remove: jest.fn(),
      _getattr: jest.fn().mockImplementation((attr, value) => value + 2)
    };

    (entity as any)._buffs = [mockBuff];

    const result = (entity as any)._getattr('attack', 5);
    expect(result).toBe(7);
    expect(mockBuff._getattr).toHaveBeenCalledWith('attack', 5);
  });

  test('should apply slot modifications', () => {
    const entity = new Entity();
    const mockSlot: Slot = {
      _getattr: jest.fn().mockImplementation((attr, value) => value + 3)
    };

    (entity as any)._slots = [mockSlot];

    const result = (entity as any)._getattr('attack', 5);
    expect(result).toBe(8);
    expect(mockSlot._getattr).toHaveBeenCalledWith('attack', 5);
  });

  test('should apply data.scripts function if available', () => {
    const mockScriptFn = jest.fn().mockImplementation((entity, value) => value * 2);
    const data: CardData = {
      scripts: {
        attack: mockScriptFn as any
      }
    };
    const entity = new Entity(data);

    const result = (entity as any)._getattr('attack', 5);
    expect(result).toBe(10);
    expect(mockScriptFn).toHaveBeenCalledWith(entity, 5);
  });

  test('should not apply data.scripts when ignoreScripts is true', () => {
    const mockScriptFn = jest.fn().mockImplementation((entity, value) => value * 2);
    const data: CardData = {
      scripts: {
        attack: mockScriptFn as any
      }
    };
    const entity = new Entity(data);
    entity.ignoreScripts = true;

    const result = (entity as any)._getattr('attack', 5);
    expect(result).toBe(5);
    expect(mockScriptFn).not.toHaveBeenCalled();
  });

  test('should chain all modifications correctly', () => {
    const mockBuff: Buff = {
      remove: jest.fn(),
      _getattr: jest.fn().mockImplementation((attr, value) => value + 2)
    };
    const mockSlot: Slot = {
      _getattr: jest.fn().mockImplementation((attr, value) => value + 3)
    };
    const mockScriptFn = jest.fn().mockImplementation((entity, value) => value * 2);
    const data: CardData = {
      scripts: {
        attack: mockScriptFn as any
      }
    };

    const entity = new Entity(data);
    (entity as any)._attack = 5;
    (entity as any)._buffs = [mockBuff];
    (entity as any)._slots = [mockSlot];

    // Base: 10 (5 base + 5 from _attack)
    // After buff: 12 (10 + 2)
    // After slot: 15 (12 + 3)
    // After script: 30 (15 * 2)
    const result = (entity as any)._getattr('attack', 5);
    expect(result).toBe(30);
  });
});
