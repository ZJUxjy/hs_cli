// Test Outlands card scripts
import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Outlands Card Scripts', () => {
  // BT_187 - Aldrachi Warblades
  test('should register BT_187 - Aldrachi Warblades', () => {
    const warblades = cardScriptsRegistry.get('BT_187');
    expect(warblades).toBeDefined();
  });

  // BT_321 - Chaos Strike
  test('should register BT_321 - Chaos Strike', () => {
    const chaos = cardScriptsRegistry.get('BT_321');
    expect(chaos).toBeDefined();
    expect(chaos?.play).toBeDefined();
  });

  // BT_480 - Immolation Aura
  test('should register BT_480 - Immolation Aura', () => {
    const immolation = cardScriptsRegistry.get('BT_480');
    expect(immolation).toBeDefined();
    expect(immolation?.play).toBeDefined();
  });

  // BT_486 - Soul Cleave
  test('should register BT_486 - Soul Cleave', () => {
    const soulCleave = cardScriptsRegistry.get('BT_486');
    expect(soulCleave).toBeDefined();
    expect(soulCleave?.play).toBeDefined();
  });

  // BT_493 - Felosophy
  test('should register BT_493 - Felosophy', () => {
    const felosophy = cardScriptsRegistry.get('BT_493');
    expect(felosophy).toBeDefined();
    expect(felosophy?.play).toBeDefined();
  });

  // BT_496 - Glaivebound Adept
  test('should register BT_496 - Glaivebound Adept', () => {
    const adept = cardScriptsRegistry.get('BT_496');
    expect(adept).toBeDefined();
    expect(adept?.play).toBeDefined();
    expect(adept?.requirements).toBeDefined();
  });

  // BT_509 - Wrathscale Naga
  test('should register BT_509 - Wrathscale Naga', () => {
    const naga = cardScriptsRegistry.get('BT_509');
    expect(naga).toBeDefined();
    expect(naga?.events).toBeDefined();
  });

  // BT_761 - Coilfang Warlord
  test('should register BT_761 - Coilfang Warlord', () => {
    const warlord = cardScriptsRegistry.get('BT_761');
    expect(warlord).toBeDefined();
    expect(warlord?.deathrattle).toBeDefined();
  });

  // BT_934 - Eye Beam
  test('should register BT_934 - Eye Beam', () => {
    const eyeBeam = cardScriptsRegistry.get('BT_934');
    expect(eyeBeam).toBeDefined();
    expect(eyeBeam?.play).toBeDefined();
    expect(eyeBeam?.requirements).toBeDefined();
  });

  // BT_429 - Il'gynoth
  test('should register BT_429 - Il\'gynoth', () => {
    const ilgynoth = cardScriptsRegistry.get('BT_429');
    expect(ilgynoth).toBeDefined();
    expect(ilgynoth?.play).toBeDefined();
  });

  // BT_491 - Warglaives of Azzinoth
  test('should register BT_491 - Warglaives of Azzinoth', () => {
    const warglaives = cardScriptsRegistry.get('BT_491');
    expect(warglaives).toBeDefined();
    expect(warglaives?.play).toBeDefined();
    expect(warglaives?.events).toBeDefined();
  });

  // BT_514 - Skull of Gul'dan
  test('should register BT_514 - Skull of Gul\'dan', () => {
    const skull = cardScriptsRegistry.get('BT_514');
    expect(skull).toBeDefined();
    expect(skull?.play).toBeDefined();
  });

  // BT_601 - Metamorphosis
  test('should register BT_601 - Metamorphosis', () => {
    const metamorphosis = cardScriptsRegistry.get('BT_601');
    expect(metamorphosis).toBeDefined();
    expect(metamorphosis?.play).toBeDefined();
    expect(metamorphosis?.requirements).toBeDefined();
  });
});
