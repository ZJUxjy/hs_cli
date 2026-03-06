const Action = require('./Action');

class Damage extends Action {
  constructor(source, target, amount) {
    super({ type: 'DAMAGE', amount }, source, target);
    this.amount = amount;
  }

  trigger(game) {
    if (!this.target) return [];

    const damage = this.source.getDamage
      ? this.source.getDamage(this.amount, this.target)
      : this.amount;

    const actualDamage = this.target.takeDamage(damage, this.source);
    return [{ action: 'DAMAGE', target: this.target, amount: actualDamage }];
  }
}

module.exports = Damage;
