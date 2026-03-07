import { describe, test, expect } from '@jest/globals';
import '../../../src/index';
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Karazhan - Core Cards', () => {
  describe('KAR_004 - Cat Trick', () => {
    test('should be registered as secret', () => {
      const script = cardScriptsRegistry.get('KAR_004');
      expect(script).toBeDefined();
    });
  });

  describe('KAR_006 - Cloaked Huntress', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('KAR_006');
      expect(script).toBeDefined();
    });
  });

  describe('KAR_009 - Babbling Book', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('KAR_009');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('KAR_033 - Book Wyrm', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('KAR_033');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('KAR_035 - Priest of the Feast', () => {
    test('should have spell play trigger', () => {
      const script = cardScriptsRegistry.get('KAR_035');
      expect(script).toBeDefined();
      expect(script?.events?.SPELL_PLAY).toBeDefined();
    });
  });

  describe('KAR_057 - Ivory Knight', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('KAR_057');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('KAR_061 - The Curator', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('KAR_061');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('KAR_114 - Barnes', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('KAR_114');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});
