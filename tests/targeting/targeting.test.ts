import { isValidTarget } from '../../src/targeting/targeting';
import { CardType } from '../../src/enums';

describe('isValidTarget', () => {
  test('should return false for self-targeting', () => {
    const source = { entityId: 1 } as any;
    const target = source;
    expect(isValidTarget(source, target)).toBe(false);
  });

  test('should return false for dormant minions', () => {
    const source = { entityId: 1, type: CardType.SPELL } as any;
    const target = { entityId: 2, type: CardType.MINION, dormant: true } as any;
    expect(isValidTarget(source, target)).toBe(false);
  });

  test('should return false for dead minions', () => {
    const source = { entityId: 1, type: CardType.SPELL } as any;
    const target = { entityId: 2, type: CardType.MINION, dead: true } as any;
    expect(isValidTarget(source, target)).toBe(false);
  });

  test('should return false for stealthed enemy minions', () => {
    const source = { entityId: 1, controller: 'player1', type: CardType.SPELL } as any;
    const target = { entityId: 2, type: CardType.MINION, stealthed: true, controller: 'player2' } as any;
    expect(isValidTarget(source, target)).toBe(false);
  });

  test('should allow targeting stealthed friendly minions', () => {
    const source = { entityId: 1, controller: 'player1', type: CardType.SPELL } as any;
    const target = { entityId: 2, type: CardType.MINION, stealthed: true, controller: 'player1' } as any;
    expect(isValidTarget(source, target)).toBe(true);
  });

  test('should require REQ_MINION_TARGET for minion target', () => {
    const source = { entityId: 1, type: CardType.SPELL, requirements: { 1: 0 } } as any;
    const target = { entityId: 2, type: CardType.HERO } as any;
    expect(isValidTarget(source, target)).toBe(false);
  });

  test('should require REQ_FRIENDLY_TARGET', () => {
    const source = { entityId: 1, controller: 'player1', requirements: { 2: 0 } } as any;
    const target = { entityId: 2, controller: 'player2' } as any;
    expect(isValidTarget(source, target)).toBe(false);
  });

  test('should require REQ_ENEMY_TARGET', () => {
    const source = { entityId: 1, controller: 'player1', requirements: { 3: 0 } } as any;
    const target = { entityId: 2, controller: 'player1' } as any;
    expect(isValidTarget(source, target)).toBe(false);
  });

  test('should require damaged target', () => {
    const source = { entityId: 1, requirements: { 4: 0 } } as any;
    const target = { entityId: 2, damage: 0 } as any;
    expect(isValidTarget(source, target)).toBe(false);
  });

  test('should work with damaged target', () => {
    const source = { entityId: 1, requirements: { 4: 0 } } as any;
    const target = { entityId: 2, damage: 3 } as any;
    expect(isValidTarget(source, target)).toBe(true);
  });
});
