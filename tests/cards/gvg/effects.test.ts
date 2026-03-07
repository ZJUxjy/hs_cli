import { describe, test, expect } from '@jest/globals';
import '../../../src/index';
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('GVG (Goblins vs Gnomes) - Core Cards', () => {
  describe('GVG_006 - Mechwarper', () => {
    test('should be registered', () => {
      const script = cardScriptsRegistry.get('GVG_006');
      expect(script).toBeDefined();
    });
  });

  describe('GVG_013 - Cogmaster', () => {
    test('should be registered', () => {
      const script = cardScriptsRegistry.get('GVG_013');
      expect(script).toBeDefined();
    });
  });

  describe('GVG_082 - Clockwork Gnome', () => {
    test('should have deathrattle effect', () => {
      const script = cardScriptsRegistry.get('GVG_082');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  describe('GVG_078 - Mechanical Yeti', () => {
    test('should have deathrattle effect', () => {
      const script = cardScriptsRegistry.get('GVG_078');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  describe('GVG_096 - Piloted Shredder', () => {
    test('should have deathrattle effect', () => {
      const script = cardScriptsRegistry.get('GVG_096');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  describe('GVG_110 - Dr. Boom', () => {
    test('should have play effect with battlecries', () => {
      const script = cardScriptsRegistry.get('GVG_110');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  describe('GVG_110t - Boom Bot', () => {
    test('should have deathrattle effect', () => {
      const script = cardScriptsRegistry.get('GVG_110t');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  describe('GVG_034 - Mech-Bear-Cat', () => {
    test('should have damage trigger effect', () => {
      const script = cardScriptsRegistry.get('GVG_034');
      expect(script).toBeDefined();
      expect(script?.events?.DAMAGE).toBeDefined();
    });
  });

  describe('GVG_119 - Blingtron 3000', () => {
    test('should have play effect', () => {
      const script = cardScriptsRegistry.get('GVG_119');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });
});
