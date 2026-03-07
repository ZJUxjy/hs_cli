// Test Dragons card scripts
import { describe, test, expect } from '@jest/globals';
import '../../../src/index'; // Load all card scripts
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Dragons Card Scripts', () => {
  // DRG_055 - Dragon Breeder
  test('should register DRG_055 - Dragon Breeder', () => {
    const breeder = cardScriptsRegistry.get('DRG_055');
    expect(breeder).toBeDefined();
    expect(breeder?.play).toBeDefined();
    expect(breeder?.requirements).toBeDefined();
  });

  // DRG_063 - Gryphon
  test('should register DRG_063 - Gryphon', () => {
    const gryphon = cardScriptsRegistry.get('DRG_063');
    expect(gryphon).toBeDefined();
    expect(gryphon?.play).toBeDefined();
  });

  // DRG_064 - Hippogryph
  test('should register DRG_064 - Hippogryph', () => {
    const hippo = cardScriptsRegistry.get('DRG_064');
    expect(hippo).toBeDefined();
    expect(hippo?.play).toBeDefined();
  });

  // DRG_070 - Amber Watcher
  test('should register DRG_070 - Amber Watcher', () => {
    const watcher = cardScriptsRegistry.get('DRG_070');
    expect(watcher).toBeDefined();
    expect(watcher?.play).toBeDefined();
    expect(watcher?.requirements).toBeDefined();
  });

  // DRG_071 - Scalerider
  test('should register DRG_071 - Scalerider', () => {
    const rider = cardScriptsRegistry.get('DRG_071');
    expect(rider).toBeDefined();
    expect(rider?.play).toBeDefined();
    expect(rider?.requirements).toBeDefined();
  });

  // DRG_075 - Zixor, Apex Predator
  test('should register DRG_075 - Zixor, Apex Predator', () => {
    const zixor = cardScriptsRegistry.get('DRG_075');
    expect(zixor).toBeDefined();
    expect(zixor?.play).toBeDefined();
  });

  // DRG_076 - Living Dragonbreath
  test('should register DRG_076 - Living Dragonbreath', () => {
    const breath = cardScriptsRegistry.get('DRG_076');
    expect(breath).toBeDefined();
    expect(breath?.play).toBeDefined();
    expect(breath?.requirements).toBeDefined();
  });

  // DRG_077 - Skyfin
  test('should register DRG_077 - Skyfin', () => {
    const skyfin = cardScriptsRegistry.get('DRG_077');
    expect(skyfin).toBeDefined();
    expect(skyfin?.play).toBeDefined();
  });

  // DRG_089 - Nozdormu
  test('should register DRG_089 - Nozdormu', () => {
    const nozdormu = cardScriptsRegistry.get('DRG_089');
    expect(nozdormu).toBeDefined();
    expect(nozdormu?.play).toBeDefined();
  });

  // DRG_091 - Dragonqueen Alexstrasza
  test('should register DRG_091 - Dragonqueen Alexstrasza', () => {
    const alex = cardScriptsRegistry.get('DRG_091');
    expect(alex).toBeDefined();
  });

  // DRG_099 - Dr. Morrigan
  test('should register DRG_099 - Dr. Morrigan', () => {
    const morrigan = cardScriptsRegistry.get('DRG_099');
    expect(morrigan).toBeDefined();
    expect(morrigan?.play).toBeDefined();
  });

  // DRG_257 - Evasive Drakonid
  test('should register DRG_257 - Evasive Drakonid', () => {
    const drakonid = cardScriptsRegistry.get('DRG_257');
    expect(drakonid).toBeDefined();
  });

  // DRG_402 - Murozond
  test('should register DRG_402 - Murozond', () => {
    const murozond = cardScriptsRegistry.get('DRG_402');
    expect(murozond).toBeDefined();
    expect(murozond?.play).toBeDefined();
  });
});
