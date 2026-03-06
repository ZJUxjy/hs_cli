const Action = require('./Action');
const Damage = require('./Damage');

class Attack extends Action {
  constructor(source, target) {
    super({ type: 'ATTACK' }, source, target);
  }

  trigger(game) {
    if (!this.source || !this.target) return [];

    // Execute damage from attacker to target
    const damageAction = new Damage(this.source, this.target, this.source.atk);
    const result = damageAction.trigger(game);

    // Counterattack if target is a minion
    if (this.target.isMinion && !this.target.dead) {
      const counterAction = new Damage(this.target, this.source, this.target.atk);
      counterAction.trigger(game);
    }

    // Mark attacker as having attacked
    this.source.numAttacks = (this.source.numAttacks || 0) + 1;

    return result;
  }
}

module.exports = Attack;
