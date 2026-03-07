// Test Uldum card scripts
import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Uldum Card Scripts', () => {
  // ULD_003 - Tirion Fordring (Legendary)
  test('should register ULD_003 - Tirion Fordring', () => {
    const tirion = cardScriptsRegistry.get('ULD_003');
    expect(tirion).toBeDefined();
    expect(tirion?.deathrattle).toBeDefined();
  });

  // ULD_429 - Zephrys the Great (Legendary)
  test('should register ULD_429 - Zephrys the Great', () => {
    const zephrys = cardScriptsRegistry.get('ULD_429');
    expect(zephrys).toBeDefined();
    expect(zephrys?.play).toBeDefined();
  });

  // ULD_177 - Reno Jackson (Legendary)
  test('should register ULD_177 - Reno Jackson', () => {
    const reno = cardScriptsRegistry.get('ULD_177');
    expect(reno).toBeDefined();
    expect(reno?.play).toBeDefined();
  });

  // ULD_178 - Sir Finley of the Sands (Legendary)
  test('should register ULD_178 - Sir Finley of the Sands', () => {
    const finley = cardScriptsRegistry.get('ULD_178');
    expect(finley).toBeDefined();
    expect(finley?.play).toBeDefined();
  });

  // ULD_195 - Barrage (Quest)
  test('should register ULD_195 - Barrage', () => {
    const barrage = cardScriptsRegistry.get('ULD_195');
    expect(barrage).toBeDefined();
    expect(barrage?.play).toBeDefined();
    expect(barrage?.events).toBeDefined();
  });

  // ULD_253 - Execute
  test('should register ULD_253 - Execute', () => {
    const execute = cardScriptsRegistry.get('ULD_253');
    expect(execute).toBeDefined();
    expect(execute?.play).toBeDefined();
    expect(execute?.requirements).toBeDefined();
  });
});
