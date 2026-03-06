// boomsday - Card Effects Tests
import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Boomsday - Core Card Effects', () => {
  // BOT_238 - Dr. Boom, Mad Genius (Legendary)
  // Battlecry: For the rest of the game, your Mechs have Rush
  describe('BOT_238 Dr. Boom, Mad Genius', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('BOT_238');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // BOT_907 - Galvanizer (Rare)
  // Battlecry: Reduce the Attack of your other Mechs by 1 and give them +2 Health
  describe('BOT_907 Galvanizer', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('BOT_907');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // BOT_544 - Loose Specimen (Epic)
  // Battlecry: Discover a Beast, Mech, or Murloc
  describe('BOT_544 Loose Specimen', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('BOT_544');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // BOT_066 - Mechanical Whelp (Rare)
  // Deathrattle: Summon a 7/6 Mechanical Dragon
  describe('BOT_066 Mechanical Whelp', () => {
    test('should be registered with deathrattle effect', () => {
      const script = cardScriptsRegistry.get('BOT_066');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  // BOT_020 - Skaterbot (Common)
  // Magnetic, Rush
  describe('BOT_020 Skaterbot', () => {
    test('should be registered with magnetic mechanic', () => {
      const script = cardScriptsRegistry.get('BOT_020');
      expect(script).toBeDefined();
      expect(script?.magnetic).toBeDefined();
    });
  });

  // BOT_069 - The Boomship (Legendary)
  // Summon 3 random minions from your hand. Give them Rush
  describe('BOT_069 The Boomship', () => {
    test('should be registered with battlecry effect', () => {
      const script = cardScriptsRegistry.get('BOT_069');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // BOT_031 - Goblin Bomb (Common)
  // Deathrattle: Deal 2 damage to the enemy hero
  describe('BOT_031 Goblin Bomb', () => {
    test('should be registered with deathrattle effect', () => {
      const script = cardScriptsRegistry.get('BOT_031');
      expect(script).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });

  // BOT_312 - Replicating Menace (Rare)
  // Magnetic. Deathrattle: Summon three 1/1 Microbots
  describe('BOT_312 Replicating Menace', () => {
    test('should be registered with magnetic and deathrattle', () => {
      const script = cardScriptsRegistry.get('BOT_312');
      expect(script).toBeDefined();
      expect(script?.magnetic).toBeDefined();
      expect(script?.deathrattle).toBeDefined();
    });
  });
});
