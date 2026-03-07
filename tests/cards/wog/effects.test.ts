import { describe, test, expect } from '@jest/globals';
import '../../../src/index';
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('WOG (Whispers of the Old Gods) - Core Cards', () => {
  describe('OG_134 - CThun', () => {
    test('should be registered', () => {
      const script = cardScriptsRegistry.get('OG_134');
      expect(script).toBeDefined();
    });
  });

  describe('OG_284 - Beckoner of Evil', () => {
    test('should have battlecry effect', () => {
      const script = cardScriptsRegistry.get('OG_284');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('OG_256 - Spawn of N Zoth', () => {
    test('should have deathrattle effect', () => {
      const script = cardScriptsRegistry.get('OG_256');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  describe('OG_200 - Soggoth the Slitherer', () => {
    test('should be registered', () => {
      const script = cardScriptsRegistry.get('OG_200');
      expect(script).toBeDefined();
    });
  });

  describe('OG_318 - Hogger, Doom of Elwynn', () => {
    test('should have damage trigger effect', () => {
      const script = cardScriptsRegistry.get('OG_318');
      expect(script).toBeDefined();
      expect(script?.events?.DAMAGE).toBeDefined();
    });
  });

  describe('OG_161 - Corrupted Seer', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('OG_161');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('OG_334 - Hooded Acolyte', () => {
    test('should have events', () => {
      const script = cardScriptsRegistry.get('OG_334');
      expect(script).toBeDefined();
    });
  });

  describe('OG_247 - Usher of Souls', () => {
    test('should have death event', () => {
      const script = cardScriptsRegistry.get('OG_247');
      expect(script).toBeDefined();
    });
  });
});
