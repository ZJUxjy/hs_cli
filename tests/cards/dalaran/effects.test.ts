// Test Dalaran card scripts
import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Dalaran Card Scripts', () => {
  // DAL_163 - Kalecgos
  test('should register DAL_163 - Kalecgos', () => {
    const kalecgos = cardScriptsRegistry.get('DAL_163');
    expect(kalecgos).toBeDefined();
    expect(kalecgos?.play).toBeDefined();
  });

  // DAL_575 - Conjurer's Calling
  test('should register DAL_575 - Conjurer\'s Calling', () => {
    const conjurer = cardScriptsRegistry.get('DAL_575');
    expect(conjurer).toBeDefined();
    expect(conjurer?.play).toBeDefined();
    expect(conjurer?.requirements).toBeDefined();
  });

  // DAL_576 - Magic Carpet
  test('should register DAL_576 - Magic Carpet', () => {
    const carpet = cardScriptsRegistry.get('DAL_576');
    expect(carpet).toBeDefined();
    expect(carpet?.play).toBeDefined();
  });

  // DAL_609 - Mana Cyclone
  test('should register DAL_609 - Mana Cyclone', () => {
    const cyclone = cardScriptsRegistry.get('DAL_609');
    expect(cyclone).toBeDefined();
    expect(cyclone?.play).toBeDefined();
  });

  // DAL_177 - Kirin Tor Tricaster
  test('should register DAL_177 - Kirin Tor Tricaster', () => {
    const tricaster = cardScriptsRegistry.get('DAL_177');
    expect(tricaster).toBeDefined();
    expect(tricaster?.play).toBeDefined();
  });

  // DAL_577 - Jaina Proudmoore
  test('should register DAL_577 - Jaina Proudmoore', () => {
    const jaina = cardScriptsRegistry.get('DAL_577');
    expect(jaina).toBeDefined();
    expect(jaina?.play).toBeDefined();
  });

  // DAL_608 - Messenger Raven
  test('should register DAL_608 - Messenger Raven', () => {
    const raven = cardScriptsRegistry.get('DAL_608');
    expect(raven).toBeDefined();
    expect(raven?.play).toBeDefined();
  });

  // DAL_603 - Ray of Frost
  test('should register DAL_603 - Ray of Frost', () => {
    const ray = cardScriptsRegistry.get('DAL_603');
    expect(ray).toBeDefined();
    expect(ray?.play).toBeDefined();
    expect(ray?.requirements).toBeDefined();
  });
});
