const Action = require('../../../../src/game/logic/actions/Action');

describe('Action', () => {
  test('Action should be callable', () => {
    const action = new Action({ type: 'TEST' });
    expect(action.type).toBe('TEST');
  });

  test('Action should store source', () => {
    const source = { id: 'test' };
    const action = new Action({ type: 'TEST' }, source);
    expect(action.source).toBe(source);
  });
});
