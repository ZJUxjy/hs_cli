// Test Scholomance Academy card scripts
import '../../../src/index';

import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('Scholomance Card Scripts', () => {
  test('should register SCH_199 - Transfer Student', () => {
    const transferStudent = cardScriptsRegistry.get('SCH_199');
    expect(transferStudent).toBeDefined();
  });

  test('should register SCH_199t2 - Transfer Student (Darkshire)', () => {
    const t2 = cardScriptsRegistry.get('SCH_199t2');
    expect(t2).toBeDefined();
    expect(t2?.play).toBeDefined();
  });

  test('should register SCH_199t3 - Transfer Student (Stormwind)', () => {
    const t3 = cardScriptsRegistry.get('SCH_199t3');
    expect(t3).toBeDefined();
    expect(t3?.play).toBeDefined();
  });

  test('should register SCH_199t5 - Transfer Student (Scholomance)', () => {
    const t5 = cardScriptsRegistry.get('SCH_199t5');
    expect(t5).toBeDefined();
    expect(t5?.deathrattle).toBeDefined();
  });

  test('should register SCH_199t6 - Transfer Student (Uldum)', () => {
    const t6 = cardScriptsRegistry.get('SCH_199t6');
    expect(t6).toBeDefined();
    expect(t6?.play).toBeDefined();
  });

  test('should register SCH_199t9 - Transfer Student (Dalaran)', () => {
    const t9 = cardScriptsRegistry.get('SCH_199t9');
    expect(t9).toBeDefined();
    expect(t9?.play).toBeDefined();
  });

  test('should register SCH_199t10 - Transfer Student (Northrend)', () => {
    const t10 = cardScriptsRegistry.get('SCH_199t10');
    expect(t10).toBeDefined();
    expect(t10?.play).toBeDefined();
  });
});
