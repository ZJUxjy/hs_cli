import { Entity } from '../../src/core/entity';
import { CardType } from '../../src/enums';

describe('Entity', () => {
  let entity: Entity;

  beforeEach(() => {
    entity = new Entity();
  });

  test('should have unique UUID', () => {
    const entity2 = new Entity();
    expect(entity.uuid).not.toBe(entity2.uuid);
  });

  test('should have default type', () => {
    expect(entity.type).toBe(CardType.INVALID);
  });

  test('should check isCard correctly', () => {
    expect(entity.isCard).toBe(false);
    entity.type = CardType.MINION;
    expect(entity.isCard).toBe(true);
  });

  test('should initialize with empty events', () => {
    expect(entity.events).toEqual([]);
  });

  test('should get damage returning amount by default', () => {
    const target = { immune: false, dormant: false } as any;
    expect(entity.getDamage(5, target)).toBe(5);
  });

  test('should return 0 damage for immune target', () => {
    const target = { immune: true, dormant: false } as any;
    expect(entity.getDamage(5, target)).toBe(0);
  });

  test('should return 0 damage for dormant target', () => {
    const target = { immune: false, dormant: true } as any;
    expect(entity.getDamage(5, target)).toBe(0);
  });
});
