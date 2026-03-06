const Entity = require('./Entity');

class Card extends Entity {
  constructor(game, id, data = {}) {
    super(game, id);
    this.id = id;
    this.name = data.name || id;
    this.type = data.type || 'MINION';
    this.cost = data.cost || 0;
    this.atk = data.atk || 0;
    this.maxHealth = data.health || data.maxHealth || 1;
    this.health = this.maxHealth;
    this.races = data.races || [];
    this.hasDeathrattle = data.deathrattle || false;
    this.hasBattlecry = data.battlecry || false;
    this.hasCharge = data.charge || false;
    this.hasWindfury = data.windfury || false;
    this.hasTaunt = data.taunt || false;
    this.hasDivineShield = data.divineShield || false;
    this.hasPoisonous = data.poisonous || false;
    this.hasLifesteal = data.lifesteal || false;
    this.hasStealth = data.stealth || false;
    this.hasRush = data.rush || false;
    this.hasReborn = data.reborn || false;
    this.hasEcho = data.echo || false;
    this.dormant = data.dormant || 0;
    // State
    this.canAttack = this.hasCharge;
    this.exhausted = true;
    this.frozen = false;
    this.silenced = false;
    this._damaged = false;
    this.dead = false;
    this.numAttacks = 0;
  }

  get isMinion() {
    return this.type === 'MINION';
  }

  get damaged() {
    return this.health < this.maxHealth;
  }

  takeDamage(amount, source) {
    if (this.hasDivineShield) {
      this.hasDivineShield = false;
      return 0;
    }
    const actualDamage = Math.min(this.health, amount);
    this.health -= actualDamage;
    if (this.health <= 0) {
      this.dead = true;
    }
    return actualDamage;
  }

  destroy() {
    this.dead = true;
    this.zone = 'GRAVEYARD';
  }
}

module.exports = Card;
