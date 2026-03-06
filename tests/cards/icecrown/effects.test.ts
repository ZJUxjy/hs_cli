import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('ICCROWN Death Knight Hero Cards - Core Cards', () => {
  // ICC_831 - Uther of the Ebon Blade (Paladin DK)
  describe('ICC_831 Uther of the Ebon Blade', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('ICC_831');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    test('ICC_831p (Hero Power) should be registered', () => {
      const script = cardScriptsRegistry.get('ICC_831p');
      expect(script).toBeDefined();
    });
  });

  // ICC_832 - Garrosh Hellscream (Warrior DK)
  describe('ICC_832 Garrosh Hellscream', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('ICC_832');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    test('ICC_832p (Hero Power) should be registered', () => {
      const script = cardScriptsRegistry.get('ICC_832p');
      expect(script).toBeDefined();
    });
  });

  // ICC_833 - Rexxar (Hunter DK)
  describe('ICC_833 Rexxar', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('ICC_833');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    test('ICC_833h (Hero Power) should be registered', () => {
      const script = cardScriptsRegistry.get('ICC_833h');
      expect(script).toBeDefined();
    });
  });

  // ICC_834 - Frost Lich Jaina (Mage DK)
  describe('ICC_834 Frost Lich Jaina', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('ICC_834');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    test('ICC_834h (Hero Power) should be registered', () => {
      const script = cardScriptsRegistry.get('ICC_834h');
      expect(script).toBeDefined();
    });
  });

  // ICC_835 - Thrall (Shaman DK)
  describe('ICC_835 Thrall', () => {
    test('should be registered with deathrattle effect', () => {
      const script = cardScriptsRegistry.get('ICC_835');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });

    test('ICC_835p (Hero Power) should be registered', () => {
      const script = cardScriptsRegistry.get('ICC_835p');
      expect(script).toBeDefined();
    });
  });

  // ICC_836 - Malfurion the Pestilent (Druid DK)
  describe('ICC_836 Malfurion the Pestilent', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('ICC_836');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    test('ICC_836p (Hero Power) should be registered', () => {
      const script = cardScriptsRegistry.get('ICC_836p');
      expect(script).toBeDefined();
    });
  });

  // ICC_837 - Gul'dan (Warlock DK)
  describe('ICC_837 Gul\'dan', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('ICC_837');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    test('ICC_837p (Hero Power) should be registered', () => {
      const script = cardScriptsRegistry.get('ICC_837p');
      expect(script).toBeDefined();
    });
  });

  // ICC_838 - Valeera the Unholy (Rogue DK)
  describe('ICC_838 Valeera the Unholy', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('ICC_838');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    test('ICC_838t (Deathrattle) should be registered', () => {
      const script = cardScriptsRegistry.get('ICC_838t');
      expect(script).toBeDefined();
    });
  });

  // ICC_839 - Shadowreaper Anduin (Priest DK)
  describe('ICC_839 Shadowreaper Anduin', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('ICC_839');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    test('ICC_839 (Hero Power) should be registered', () => {
      const script = cardScriptsRegistry.get('ICC_839');
      expect(script).toBeDefined();
    });
  });
});
