const Action = require('./Action');

class Buff extends Action {
  constructor(source, target, atk = 0, health = 0) {
    super({ type: 'BUFF', atk, health }, source, target);
    this.atk = atk;
    this.health = health;
  }

  trigger(game) {
    if (!this.target) return [];

    const buff = {
      atk: this.atk,
      health: this.health,
      source: this.source,
      getAttr(attr) {
        return this[attr] || 0;
      }
    };

    this.target.addBuff(buff);
    return [{ action: 'BUFF', target: this.target, atk: this.atk, health: this.health }];
  }
}

module.exports = Buff;
