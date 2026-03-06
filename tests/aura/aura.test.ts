import { AuraBuff, Refresh } from '../../src/aura/aura';
import { Entity } from '../../src/core/entity';

describe('AuraBuff', () => {
  test('should create AuraBuff', () => {
    const source = {} as unknown as Entity;
    const entity = {} as unknown as Entity;
    const buff = new AuraBuff(source, entity);
    expect(buff.source).toBe(source);
    expect(buff.entity).toBe(entity);
  });

  test('should update tags', () => {
    const source = {} as unknown as Entity;
    const entity = {} as unknown as Entity;
    const buff = new AuraBuff(source, entity);
    buff.updateTags({ ATK: 1, HEALTH: 2 });
    expect(buff.tags.get('ATK')).toBe(1);
    expect(buff.tags.get('HEALTH')).toBe(2);
  });

  test('should calculate _getattr', () => {
    const source = {} as unknown as Entity;
    const entity = {} as unknown as Entity;
    const buff = new AuraBuff(source, entity);
    buff.updateTags({ ATK: 2 });
    expect(buff._getattr('ATK', 1)).toBe(3);
  });
});

describe('Refresh', () => {
  test('should create Refresh', () => {
    const selector = () => [];
    const refresh = new Refresh(selector, { ATK: 1 });
    expect(refresh.selector).toBe(selector);
    expect(refresh.tags).toEqual({ ATK: 1 });
  });

  test('should have default priority', () => {
    const selector = () => [];
    const refresh = new Refresh(selector);
    expect(refresh.priority).toBe(50);
  });
});
