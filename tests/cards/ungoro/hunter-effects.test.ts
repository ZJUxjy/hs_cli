import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('UNGORO Hunter Cards', () => {
  test('UNG_800 Terrorscale Stalker should be registered with play effect', () => {
    const script = cardScriptsRegistry.get('UNG_800');
    expect(script).toBeDefined();
    expect(script?.play).toBeDefined();
  });

  test('UNG_912 Jeweled Macaw should be registered with play effect', () => {
    const script = cardScriptsRegistry.get('UNG_912');
    expect(script).toBeDefined();
    expect(script?.play).toBeDefined();
  });

  test('UNG_913 Tolvir Warden should be registered with play effect', () => {
    const script = cardScriptsRegistry.get('UNG_913');
    expect(script).toBeDefined();
    expect(script?.play).toBeDefined();
  });

  test('UNG_914 Raptor Hatchling should be registered with deathrattle', () => {
    const script = cardScriptsRegistry.get('UNG_914');
    expect(script).toBeDefined();
    expect(script?.deathrattle).toBeDefined();
  });

  test('UNG_915 Crackling Razormaw should be registered with play effect', () => {
    const script = cardScriptsRegistry.get('UNG_915');
    expect(script).toBeDefined();
    expect(script?.play).toBeDefined();
  });

  test('UNG_919 Swamp King Dred should be registered with events', () => {
    const script = cardScriptsRegistry.get('UNG_919');
    expect(script).toBeDefined();
    expect(script?.events).toBeDefined();
  });
});
