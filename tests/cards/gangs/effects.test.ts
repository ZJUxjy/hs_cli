// Test Gangs card scripts
import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Gangs Card Scripts', () => {
  // CFM_341 - Patches the Pirate (Legendary)
  test('should register CFM_341 - Patches the Pirate', () => {
    const patches = cardScriptsRegistry.get('CFM_341');
    expect(patches).toBeDefined();
    expect(patches?.play).toBeDefined();
  });

  // CFM_621 - Kazakus (Legendary)
  test('should register CFM_621 - Kazakus', () => {
    const kazakus = cardScriptsRegistry.get('CFM_621');
    expect(kazakus).toBeDefined();
    expect(kazakus?.play).toBeDefined();
  });

  // CFM_670 - Burgly Bully (Epic)
  test('should register CFM_670 - Burgly Bully', () => {
    const bully = cardScriptsRegistry.get('CFM_670');
    expect(bully).toBeDefined();
    expect(bully?.events).toBeDefined();
  });

  // CFM_806 - Shudderwraith (Rare)
  test('should register CFM_806 - Shudderwraith', () => {
    const shudderwraith = cardScriptsRegistry.get('CFM_806');
    expect(shudderwraith).toBeDefined();
    expect(shudderwraith?.play).toBeDefined();
  });

  // CFM_807 - Fandral Staghelm (Legendary)
  test('should register CFM_807 - Fandral Staghelm', () => {
    const fandral = cardScriptsRegistry.get('CFM_807');
    expect(fandral).toBeDefined();
    expect(fandral?.play).toBeDefined();
  });

  // CFM_808 - Blightnozzle Crawler (Rare)
  test('should register CFM_808 - Blightnozzle Crawler', () => {
    const crawler = cardScriptsRegistry.get('CFM_808');
    expect(crawler).toBeDefined();
    expect(crawler?.play).toBeDefined();
    expect(crawler?.deathrattle).toBeDefined();
  });

  // CFM_061 - Jade Lightning (Common)
  test('should register CFM_061 - Jade Lightning', () => {
    const lightning = cardScriptsRegistry.get('CFM_061');
    expect(lightning).toBeDefined();
    expect(lightning?.play).toBeDefined();
    expect(lightning?.requirements).toBeDefined();
  });

  // CFM_696 - Fire Plume Phoenix (Rare)
  test('should register CFM_696 - Fire Plume Phoenix', () => {
    const phoenix = cardScriptsRegistry.get('CFM_696');
    expect(phoenix).toBeDefined();
    expect(phoenix?.play).toBeDefined();
  });
});
