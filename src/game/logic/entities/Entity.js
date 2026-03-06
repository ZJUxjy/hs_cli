class Entity {
  constructor(game, id) {
    this.game = game;
    this.id = id;
    this.buffs = [];
    this.slots = [];
    this.zone = 'PLAY';
    this.entity_id = game ? game.nextEntityId++ : null;
    this.type = 'INVALID';
    this.events = [];
  }

  addBuff(buff) {
    this.buffs.push(buff);
  }

  removeBuff(buff) {
    const index = this.buffs.indexOf(buff);
    if (index > -1) {
      this.buffs.splice(index, 1);
    }
  }

  getAttr(attr) {
    let value = 0;
    for (const buff of this.buffs) {
      value += buff.getAttr(attr) || 0;
    }
    return value;
  }
}

module.exports = Entity;
