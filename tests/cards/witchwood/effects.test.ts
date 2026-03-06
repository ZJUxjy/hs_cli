// witchwood - Card Effects Tests
import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Witchwood - Core Card Effects', () => {
  // GIL_558 - Emeriss (Legendary Dragon)
  describe('GIL_558 Emeriss', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('GIL_558');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // GIL_565 - Dreadscale (Legendary Beast)
  describe('GIL_565 Dreadscale', () => {
    test('should be registered with events for turn end effect', () => {
      const script = cardScriptsRegistry.get('GIL_565');
      expect(script).toBeDefined();
      expect(script?.events).toBeDefined();
      expect(script?.events?.TURN_END).toBeDefined();
    });
  });

  // GIL_587 - Morgl the Oracle (Legendary Murloc)
  describe('GIL_587 Morgl the Oracle', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('GIL_587');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // GIL_803 - Countess Ashmore (Legendary)
  describe('GIL_803 Countess Ashmore', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('GIL_803');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // GIL_553 - Vex Crow (Epic)
  describe('GIL_553 Vex Crow', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('GIL_553');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // GIL_557 - Swamp Dragon Egg (Rare)
  describe('GIL_557 Swamp Dragon Egg', () => {
    test('should be registered with deathrattle effect', () => {
      const script = cardScriptsRegistry.get('GIL_557');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  // GIL_618 - Witch's Cauldron (Epic)
  describe('GIL_618 Witch\'s Cauldron', () => {
    test('should be registered with events for turn end', () => {
      const script = cardScriptsRegistry.get('GIL_618');
      expect(script).toBeDefined();
      expect(script?.events).toBeDefined();
    });
  });

  // GIL_614 - Sandbinder (Rare)
  describe('GIL_614 Sandbinder', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('GIL_614');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // GIL_578 - Splintergraft (Legendary)
  describe('GIL_578 Splintergraft', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('GIL_578');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // GIL_198 - Genn Greymane (Legendary DK)
  describe('GIL_198 Genn Greymane', () => {
    test('should be registered with start of game effect', () => {
      const script = cardScriptsRegistry.get('GIL_198');
      expect(script).toBeDefined();
    });
  });

  // GIL_826 - Tess Greymane (Legendary DK)
  describe('GIL_826 Tess Greymane', () => {
    test('should be registered with deathrattle effect', () => {
      const script = cardScriptsRegistry.get('GIL_826');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  // GIL_620 - Nightmare (Epic)
  describe('GIL_620 Nightmare', () => {
    test('should be registered with events', () => {
      const script = cardScriptsRegistry.get('GIL_620');
      expect(script).toBeDefined();
      expect(script?.events).toBeDefined();
    });
  });

  // GIL_692 - Totem Crunch (Rare)
  describe('GIL_692 Totem Crunch', () => {
    test('should be registered with deathrattle effect', () => {
      const script = cardScriptsRegistry.get('GIL_692');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });
});
