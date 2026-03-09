import { ActionArg } from '../../src/actions/actionarg';

describe('ActionArg', () => {
  test('should create ActionArg with metadata', () => {
    const arg = new ActionArg();
    arg['_setup'](0, 'testArg', { name: 'TestAction' });

    expect(arg.index).toBe(0);
    expect(arg.name).toBe('testArg');
    expect(arg.owner).toEqual({ name: 'TestAction' });
  });

  test('evaluate should return null by default', () => {
    const arg = new ActionArg();
    expect(arg.evaluate({} as any)).toBeNull();
  });
});
