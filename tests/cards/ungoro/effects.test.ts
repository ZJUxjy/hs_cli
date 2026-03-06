import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('UNGORO Hunter Card Effects - Core Cards', () => {
  describe('UNG_912 Jeweled Macaw', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('UNG_912');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('UNG_800 Terrorscale Stalker', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('UNG_800');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('UNG_914 Raptor Hatchling', () => {
    test('should be registered with deathrattle', () => {
      const script = cardScriptsRegistry.get('UNG_914');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  describe('UNG_913 Tolvir Warden', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('UNG_913');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('UNG_915 Crackling Razormaw', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('UNG_915');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('UNG_919 Swamp King Dred', () => {
    test('should be registered with events', () => {
      const script = cardScriptsRegistry.get('UNG_919');
      expect(script).toBeDefined();
      expect(script?.events).toBeDefined();
    });
  });
});
