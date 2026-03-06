const { GetCard } = require('../../../../../src/game/logic/cards/registry');

// Import to register all cards
require('../../../../../src/game/logic/cards/minions/neutral');

describe('Battlecry Cards', () => {
  test('CS2_173 (Argent Commander) should have charge and divine shield', () => {
    const card = GetCard('CS2_173');
    expect(card.id).toBe('CS2_173');
    expect(card.hasCharge).toBe(true);
    expect(card.hasDivineShield).toBe(true);
  });

  test('NEW1_016 (Leeroy Jenkins) should have charge', () => {
    const card = GetCard('NEW1_016');
    expect(card.id).toBe('NEW1_016');
    expect(card.hasCharge).toBe(true);
    expect(card.battlecry).toBeDefined();
  });

  test('EX1_016 (Sylvanas) should have deathrattle', () => {
    const card = GetCard('EX1_016');
    expect(card.id).toBe('EX1_016');
    expect(card.hasDeathrattle).toBe(true);
    expect(card.deathrattle).toBeDefined();
  });
});
