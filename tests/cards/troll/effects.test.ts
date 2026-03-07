// Test Troll card scripts
import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Troll Card Scripts', () => {
  // TRL_096 - High Priest Thekal (Legendary)
  test('should register TRL_096 - High Priest Thekal', () => {
    const thekal = cardScriptsRegistry.get('TRL_096');
    expect(thekal).toBeDefined();
    expect(thekal?.play).toBeDefined();
  });

  // TRL_537 - Scepter of Summoning (Legendary)
  test('should register TRL_537 - Scepter of Summoning', () => {
    const scepter = cardScriptsRegistry.get('TRL_537');
    expect(scepter).toBeDefined();
    expect(scepter?.play).toBeDefined();
  });

  // TRL_541 - Gral's Shark (Rare)
  test('should register TRL_541 - Gral\'s Shark', () => {
    const shark = cardScriptsRegistry.get('TRL_541');
    expect(shark).toBeDefined();
    expect(shark?.deathrattle).toBeDefined();
  });

  // TRL_541t - Gral (Legendary)
  test('should register TRL_541t - Gral', () => {
    const gral = cardScriptsRegistry.get('TRL_541t');
    expect(gral).toBeDefined();
    expect(gral?.play).toBeDefined();
  });

  // TRL_542 - Gral'sdir (Legendary)
  test('should register TRL_542 - Gral\'sdir', () => {
    const gralsdir = cardScriptsRegistry.get('TRL_542');
    expect(gralsdir).toBeDefined();
    expect(gralsdir?.play).toBeDefined();
  });

  // TRL_564 - Amani War Bear (Rare)
  test('should register TRL_564 - Amani War Bear', () => {
    const bear = cardScriptsRegistry.get('TRL_564');
    expect(bear).toBeDefined();
    expect(bear?.play).toBeDefined();
  });
});
