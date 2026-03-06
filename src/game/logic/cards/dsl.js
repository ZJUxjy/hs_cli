/**
 * DSL (Domain Specific Language) for defining card effects
 * Similar to fireplace's card definition system
 */

const DSL = {
  // Buff definition
  buff(id, buffs = {}) {
    return { id, ...buffs };
  },

  // Action creators
  Summon(player, cardId) {
    return { type: 'SUMMON', player, cardId };
  },

  Damage(target, amount) {
    return { type: 'DAMAGE', target, amount };
  },

  Buff(target, buffId, buffs = {}) {
    return { type: 'BUFF', target, buffId, ...buffs };
  },

  Draw(player) {
    return { type: 'DRAW', player };
  },

  Destroy(target) {
    return { type: 'DESTROY', target };
  },

  // Condition helpers
  CONTROLLER: 'CONTROLLER',
  OPPONENT: 'OPPONENT',
  SELF: 'SELF',
  TARGET: 'TARGET',
  RANDOM: 'RANDOM',
  ALL: 'ALL',
  ENEMY: 'ENEMY',
  FRIENDLY: 'FRIENDLY',
};

module.exports = DSL;
