import { describe, test, expect } from '@jest/globals';
import '../../../src/index';
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('TGT (The Grand Tournament) - Core Cards', () => {
  describe('AT_042 - Darnassus Aspirant', () => {
    test('should have play effect for inspire', () => {
      const script = cardScriptsRegistry.get('AT_042');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('AT_043 - Savage Combatant', () => {
    test('should have inspire effect', () => {
      const script = cardScriptsRegistry.get('AT_043');
      expect(script).toBeDefined();
      expect(script?.events?.HERO_POWER).toBeDefined();
    });
  });

  describe('AT_076 - Murloc Knight', () => {
    test('should have inspire effect', () => {
      const script = cardScriptsRegistry.get('AT_076');
      expect(script).toBeDefined();
      expect(script?.events?.HERO_POWER).toBeDefined();
    });
  });

  describe('AT_073 - Competitive Spirit', () => {
    test('should have inspire effect', () => {
      const script = cardScriptsRegistry.get('AT_073');
      expect(script).toBeDefined();
      expect(script?.events?.TURN_START).toBeDefined();
    });
  });

  describe('AT_079 - Mysterious Challenger', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('AT_079');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('AT_081 - Eadric the Pure', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('AT_081');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('AT_100 - Varian Wrynn', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('AT_100');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('AT_038 - Chillmaw', () => {
    test('should have deathrattle effect', () => {
      const script = cardScriptsRegistry.get('AT_038');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });
});
