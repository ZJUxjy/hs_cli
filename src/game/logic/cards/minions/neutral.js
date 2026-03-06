const { RegisterCard } = require('../registry');
const Summon = require('../../actions/Summon');

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

/**
 * Argent Commander - 6/4/2 Charge, Divine Shield
 */
RegisterCard('CS2_173', {
  name: 'Argent Commander',
  type: 'MINION',
  cost: 6,
  atk: 4,
  health: 2,
  hasCharge: true,
  hasDivineShield: true
});

/**
 * Leeroy Jenkins - 5/6/2 Battlecry: Summon two 1/1 Whelps for your opponent
 */
RegisterCard('NEW1_016', {
  name: 'Leeroy Jenkins',
  type: 'MINION',
  cost: 5,
  atk: 6,
  health: 2,
  hasCharge: true,
  battlecry: function(game, source, player) {
    // Summon two whelps for opponent
    const opponent = player.opponent;
    game.queueActions(source, [
      new Summon(opponent, 'EX1_116t', { name: 'Whelp', cost: 1, atk: 1, health: 1 }),
      new Summon(opponent, 'EX1_116t', { name: 'Whelp', cost: 1, atk: 1, health: 1 })
    ]);
  }
});

/**
 * Sylvanas Windrunner - 5/5/6 Deathrattle: Take control of a random enemy minion
 */
RegisterCard('EX1_016', {
  name: 'Sylvanas Windrunner',
  type: 'MINION',
  cost: 5,
  atk: 5,
  health: 6,
  hasDeathrattle: true,
  deathrattle: function(game, source) {
    const enemyMinions = source.opponent.field.filter(m => !m.dead);
    if (enemyMinions.length > 0) {
      const random = Math.floor(Math.random() * enemyMinions.length);
      const stolen = enemyMinions[random];
      // Move to controller's field
      source.controller.field.push(stolen);
      source.opponent.field.splice(source.opponent.field.indexOf(stolen), 1);
    }
  }
});
