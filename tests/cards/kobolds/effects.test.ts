import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('KOBOLDS Core Card Effects', () => {
  // LOOT_013 - Ravenous Pterrordax (Warlock)
  // Battlecry: Destroy a friendly minion to gain its Attack
  describe('LOOT_013 Ravenous Pterrordax', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('LOOT_013');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    test('should have requirements for targeting a friendly minion', () => {
      const script = cardScriptsRegistry.get('LOOT_013');
      expect(script?.requirements).toBeDefined();
    });
  });

  // LOOT_047 - Elise the Trailblazer (Druid)
  // Battlecry: Shuffle a "Missing!" card into your deck. When drawn, discover a Treasure
  describe('LOOT_047 Elise the Trailblazer', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('LOOT_047');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    test('LOOT_047t (Unidentified Contract) should be registered', () => {
      const script = cardScriptsRegistry.get('LOOT_047t');
      expect(script).toBeDefined();
    });
  });

  // LOOT_161 - Shudderwraith (Neutral Epic)
  // Battlecry: Trigger all friendly minions' Deathrattles
  describe('LOOT_161 Shudderwraith', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('LOOT_161');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });
  });

  // LOOT_214 - King Togwaggle (Rogue)
  // Battlecry: Swap decks with your opponent
  describe('LOOT_214 King Togwaggle', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('LOOT_214');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    test('LOOT_214t (Togwaggle) should be registered', () => {
      const script = cardScriptsRegistry.get('LOOT_214t');
      expect(script).toBeDefined();
    });
  });

  // LOOT_333 - Marin the Fox (Paladin)
  // Battlecry: Add a Treasure card to your hand
  describe('LOOT_333 Marin the Fox', () => {
    test('should be registered with play effect', () => {
      const script = cardScriptsRegistry.get('LOOT_333');
      expect(script).toBeDefined();
      expect(script?.play).toBeDefined();
    });

    // Treasure tokens: LOOT_286t1, LOOT_286t2, LOOT_286t3, LOOT_286t4
    test('LOOT_286t1 (Treasure) should be registered', () => {
      const script = cardScriptsRegistry.get('LOOT_286t1');
      expect(script).toBeDefined();
    });

    test('LOOT_286t2 (Treasure) should be registered', () => {
      const script = cardScriptsRegistry.get('LOOT_286t2');
      expect(script).toBeDefined();
    });

    test('LOOT_286t3 (Treasure) should be registered', () => {
      const script = cardScriptsRegistry.get('LOOT_286t3');
      expect(script).toBeDefined();
    });

    test('LOOT_286t4 (Treasure) should be registered', () => {
      const script = cardScriptsRegistry.get('LOOT_286t4');
      expect(script).toBeDefined();
    });
  });
});
