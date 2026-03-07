// Test Initiate (Demon Hunter Initiate) card scripts
import '../../../src/index';

import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Initiate Card Scripts', () => {
  test('should register BT_351 - Battlefiend', () => {
    const battlefiend = cardScriptsRegistry.get('BT_351');
    expect(battlefiend).toBeDefined();
    expect(battlefiend?.events).toBeDefined();
  });

  test('should register BT_355 - Wrathscale Naga', () => {
    const naga = cardScriptsRegistry.get('BT_355');
    expect(naga).toBeDefined();
    expect(naga?.events).toBeDefined();
  });

  test('should register BT_407 - Urzul Horror', () => {
    const horror = cardScriptsRegistry.get('BT_407');
    expect(horror).toBeDefined();
    expect(horror?.deathrattle).toBeDefined();
  });

  test('should register BT_416 - Raging Felscreamer', () => {
    const felscreamer = cardScriptsRegistry.get('BT_416');
    expect(felscreamer).toBeDefined();
    expect(felscreamer?.play).toBeDefined();
  });

  test('should register BT_481 - Nethrandamus', () => {
    const nethrandamus = cardScriptsRegistry.get('BT_481');
    expect(nethrandamus).toBeDefined();
    expect(nethrandamus?.play).toBeDefined();
  });

  test('should register BT_510 - Abyssal Summoner', () => {
    const summoner = cardScriptsRegistry.get('BT_510');
    expect(summoner).toBeDefined();
    expect(summoner?.play).toBeDefined();
  });
});
