import { Manager } from '../../src/core/manager';

class MockEntity {
  public entityId = 1;
}

describe('Manager', () => {
  let manager: Manager;
  let entity: MockEntity;

  beforeEach(() => {
    entity = new MockEntity();
    manager = new Manager(entity as any);
  });

  test('should store and retrieve values', () => {
    manager.set('key', 'value');
    expect(manager.get('key')).toBe('value');
  });

  test('should check if key exists', () => {
    manager.set('exists', true);
    expect(manager.has('exists')).toBe(true);
    expect(manager.has('notExists')).toBe(false);
  });

  test('should delete values', () => {
    manager.set('toDelete', 'value');
    expect(manager.delete('toDelete')).toBe(true);
    expect(manager.has('toDelete')).toBe(false);
  });

  test('should increment values', () => {
    const result = manager.increment('counter', 5);
    expect(result).toBe(5);
    expect(manager.get('counter')).toBe(5);
  });

  test('should decrement values', () => {
    manager.set('counter', 10);
    const result = manager.decrement('counter', 3);
    expect(result).toBe(7);
    expect(manager.get('counter')).toBe(7);
  });
});
