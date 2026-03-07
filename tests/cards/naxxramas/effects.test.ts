import { describe, test, expect } from '@jest/globals';
import '../../../src/index';
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Naxxramas - Core Cards', () => {
  describe('FP1_001 - Zombie Chow', () => {
    test('should have deathrattle effect', () => {
      const script = cardScriptsRegistry.get('FP1_001');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  describe('FP1_002 - Haunted Creeper', () => {
    test('should have deathrattle effect', () => {
      const script = cardScriptsRegistry.get('FP1_002');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  describe('FP1_007 - Nerubian Egg', () => {
    test('should have deathrattle effect', () => {
      const script = cardScriptsRegistry.get('FP1_007');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  describe('FP1_012 - Sludge Belcher', () => {
    test('should have deathrattle effect', () => {
      const script = cardScriptsRegistry.get('FP1_012');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  describe('FP1_013 - KelThuzad', () => {
    test('should have turn end effect', () => {
      const script = cardScriptsRegistry.get('FP1_013');
      expect(script).toBeDefined();
      expect(script?.events?.TURN_END).toBeDefined();
    });
  });

  describe('FP1_021 - Deaths Bite', () => {
    test('should have deathrattle effect', () => {
      const script = cardScriptsRegistry.get('FP1_021');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  describe('FP1_030 - Loatheb', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('FP1_030');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});
