const { RegisterCard } = require('../registry');

/**
 * River Crocolisk - 2/2/3
 */
RegisterCard('CS2_101', {
  name: 'River Crocolisk',
  type: 'MINION',
  cost: 2,
  atk: 2,
  health: 3,
  races: ['BEAST']
});

/**
 * Bloodfen Raptor - 3/2/2 Beast
 */
RegisterCard('CS2_102', {
  name: 'Bloodfen Raptor',
  type: 'MINION',
  cost: 2,
  atk: 3,
  health: 2,
  races: ['BEAST']
});

/**
 * Frostwolf Grunt - 5/2/2 Taunt
 */
RegisterCard('CS2_121', {
  name: 'Frostwolf Grunt',
  type: 'MINION',
  cost: 2,
  atk: 2,
  health: 2,
  hasTaunt: true
});

/**
 * Chillwind Yeti - 4/4/5
 */
RegisterCard('CS2_182', {
  name: 'Chillwind Yeti',
  type: 'MINION',
  cost: 4,
  atk: 4,
  health: 5
});

/**
 * Boulderfist Ogre - 6/6/7
 */
RegisterCard('CS2_200', {
  name: 'Boulderfist Ogre',
  type: 'MINION',
  cost: 6,
  atk: 6,
  health: 7
});
