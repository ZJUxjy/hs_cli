const { GetCard } = require('../../../../../src/game/logic/cards/registry');

// Import to register cards
require('../../../../../src/game/logic/cards/minions/neutral');

describe('Neutral Minions', () => {
  test('CS2_101 (River Crocolisk) should have correct stats', () => {
    const card = GetCard('CS2_101');
    expect(card.id).toBe('CS2_101');
    expect(card.cost).toBe(2);
    expect(card.atk).toBe(2);
    expect(card.health).toBe(3);
  });

  test('CS2_102 (Bloodfen Raptor) should have correct stats', () => {
    const card = GetCard('CS2_102');
    expect(card.id).toBe('CS2_102');
    expect(card.cost).toBe(2);
    expect(card.atk).toBe(3);
    expect(card.health).toBe(2);
    expect(card.races).toContain('BEAST');
  });

  test('CS2_121 (Frostwolf Grunt) should have taunt', () => {
    const card = GetCard('CS2_121');
    expect(card.hasTaunt).toBe(true);
  });

  test('CS2_182 (Chillwind Yeti) should have correct stats', () => {
    const card = GetCard('CS2_182');
    expect(card.cost).toBe(4);
    expect(card.atk).toBe(4);
    expect(card.health).toBe(5);
  });

  test('CS2_200 (Boulderfist Ogre) should have correct stats', () => {
    const card = GetCard('CS2_200');
    expect(card.cost).toBe(6);
    expect(card.atk).toBe(6);
    expect(card.health).toBe(7);
  });
});
