const Selectors = {
  // Return source entity
  SELF(game, source) {
    return source;
  },

  // Return opponent
  ENEMY(game, source) {
    return source.opponent;
  },

  // Return friendly minions on field
  FRIENDLY_MINIONS(game, source) {
    return source.field || [];
  },

  // Return enemy minions on field
  ENEMY_MINIONS(game, source) {
    return (source.opponent && source.opponent.field) || [];
  },

  // Return all minions
  ALL_MINIONS(game, source) {
    const p1 = game.players[0];
    const p2 = game.players[1];
    return [...(p1.field || []), ...(p2.field || [])];
  },

  // Random from target
  RANDOM(targets) {
    if (!targets || targets.length === 0) return null;
    const index = Math.floor(Math.random() * targets.length);
    return targets[index];
  },

  // Random count from targets
  RANDOM_COUNT(targets, count) {
    if (!targets || targets.length === 0) return [];
    const shuffled = [...targets].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
};

module.exports = Selectors;
