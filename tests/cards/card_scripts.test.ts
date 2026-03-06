// Test that card scripts are registered correctly
import '../../src/index'; // This imports all card scripts via main entry point

import { cardScriptsRegistry } from '../../src/cards/mechanics';

describe('Card Scripts Registry', () => {
  test('should register Naxxramas cards', () => {
    // FP1_001 - Zombie Chow
    const zombieChow = cardScriptsRegistry.get('FP1_001');
    expect(zombieChow).toBeDefined();
    expect(zombieChow?.deathrattle).toBeDefined();
  });

  test('should register GVG cards', () => {
    // GVG_013 - Cogmaster
    const cogmaster = cardScriptsRegistry.get('GVG_013');
    expect(cogmaster).toBeDefined();
    // Cogmaster has aura effect, not events
  });

  test('should register TGT cards', () => {
    // AT_043 - Savage Combatant (has inspire effect)
    const savageCombatant = cardScriptsRegistry.get('AT_043');
    expect(savageCombatant).toBeDefined();
    expect(savageCombatant?.events).toBeDefined();
    expect(savageCombatant?.events?.HERO_POWER).toBeDefined();
  });

  test('should register BRM cards', () => {
    // BRM_028 - Emperor Thaurissan
    const thaurissan = cardScriptsRegistry.get('BRM_028');
    expect(thaurissan).toBeDefined();
    expect(thaurissan?.events).toBeDefined();
  });

  test('should register WOG cards', () => {
    // OG_280 - C'Thun
    const cthun = cardScriptsRegistry.get('OG_280');
    expect(cthun).toBeDefined();
    expect(cthun?.play).toBeDefined();
  });

  test('should register Karazhan cards', () => {
    // KAR_009 - Babbling Book
    const babblingBook = cardScriptsRegistry.get('KAR_009');
    expect(babblingBook).toBeDefined();
    expect(babblingBook?.play).toBeDefined();
  });

  test('should register League cards', () => {
    // LOE_011 - Reno Jackson
    const reno = cardScriptsRegistry.get('LOE_011');
    expect(reno).toBeDefined();
    expect(reno?.play).toBeDefined();
  });

});
