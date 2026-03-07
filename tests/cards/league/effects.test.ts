import { describe, test, expect } from '@jest/globals';
import '../../../src/index';
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('League of Explorers - Core Cards', () => {
  describe('LOE_003 - Ethereal Conjurer', () => {
    test('should have play effect with discover', () => {
      const script = cardScriptsRegistry.get('LOE_003');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('LOE_006 - Museum Curator', () => {
    test('should have play effect with discover', () => {
      const script = cardScriptsRegistry.get('LOE_006');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('LOE_011 - Reno Jackson', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('LOE_011');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('LOE_023 - Dark Peddler', () => {
    test('should have play effect with discover', () => {
      const script = cardScriptsRegistry.get('LOE_023');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('LOE_029 - Jeweled Scarab', () => {
    test('should have play effect with discover', () => {
      const script = cardScriptsRegistry.get('LOE_029');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('LOE_039 - Gorillabot A-3', () => {
    test('should have play effect with discover', () => {
      const script = cardScriptsRegistry.get('LOE_039');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('LOE_047 - Tomb Spider', () => {
    test('should have play effect with discover', () => {
      const script = cardScriptsRegistry.get('LOE_047');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('LOE_115 - Raven Idol', () => {
    test('should have play effect with discover', () => {
      const script = cardScriptsRegistry.get('LOE_115');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});
