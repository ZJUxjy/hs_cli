import { adaptLegacyScript, createEventListenerFromLegacy } from '../../../src/cards/mechanics/adapter';
import { cardScriptsRegistry } from '../../../src/cards/mechanics/index';
import { Action } from '../../../src/actions/base';
import { EventListenerAt } from '../../../src/actions/eventlistener';

describe('Legacy Script Adapter', () => {
  beforeEach(() => {
    cardScriptsRegistry.clear();
  });

  test('should convert legacy event script', () => {
    const legacyScript = {
      events: { DAMAGE: (ctx: any) => {} },
    };
    const adapted = adaptLegacyScript('TEST_001', legacyScript);
    expect(adapted.events).toBeDefined();
  });

  test('registry should work with legacy format', () => {
    cardScriptsRegistry.register('LEGACY_001', {
      play: (ctx) => 'played',
    });
    const script = cardScriptsRegistry.get('LEGACY_001');
    expect(script?.play).toBeDefined();
  });

  test('should preserve play function after adaptation', () => {
    const legacyScript = {
      play: (ctx: any) => 'test-result',
    };
    cardScriptsRegistry.register('TEST_PLAY', legacyScript);
    const script = cardScriptsRegistry.get('TEST_PLAY');
    expect(script?.play).toBeDefined();
  });

  test('should preserve deathrattle function after adaptation', () => {
    const legacyScript = {
      deathrattle: (ctx: any) => 'deathrattle-triggered',
    };
    cardScriptsRegistry.register('TEST_DEATHRATTLE', legacyScript);
    const script = cardScriptsRegistry.get('TEST_DEATHRATTLE');
    expect(script?.deathrattle).toBeDefined();
  });

  test('should preserve events map after adaptation', () => {
    const handler = jest.fn();
    const legacyScript = {
      events: {
        DAMAGE: handler,
        PLAY: handler,
      },
    };
    const adapted = adaptLegacyScript('TEST_EVENTS', legacyScript);
    expect(adapted.events).toBeDefined();
    expect(adapted.events?.DAMAGE).toBe(handler);
    expect(adapted.events?.PLAY).toBe(handler);
  });

  test('should preserve other script properties', () => {
    const legacyScript = {
      play: (ctx: any) => {},
      combo: (ctx: any) => {},
      inspire: (ctx: any) => {},
      overload: 2,
    };
    const adapted = adaptLegacyScript('TEST_PROPS', legacyScript);
    expect(adapted.play).toBeDefined();
    expect(adapted.combo).toBeDefined();
    expect(adapted.inspire).toBeDefined();
    expect(adapted.overload).toBe(2);
  });
});

describe('createEventListenerFromLegacy', () => {
  test('should create EventListener with correct properties', () => {
    const handler = jest.fn();
    const mockAction = new Action();

    const listener = createEventListenerFromLegacy('DAMAGE', handler, mockAction);

    expect(listener.trigger).toBe(mockAction);
    expect(listener.at).toBe(EventListenerAt.ON);
    expect(listener.actions).toHaveLength(1);
  });
});
