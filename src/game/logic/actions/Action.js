class Action {
  constructor(data = {}, source = null, target = null) {
    this.type = data.type || this.constructor.name;
    this.source = source;
    this.target = target;
    this.buff = data.buff || null;
    this.amount = data.amount || 0;
    this.cardId = data.cardId || null;
    this.requirements = data.requirements || {};
  }

  trigger(game) {
    // Base trigger - to be overridden by subclasses
    return [];
  }

  checkRequirements(source, game) {
    for (const [req, value] of Object.entries(this.requirements)) {
      switch (req) {
        case 'REQ_MINION_TARGET':
          if (!this.target || this.target.type !== 'MINION') return false;
          break;
        case 'REQ_ENEMY_TARGET':
          if (!this.target || this.target.controller === source.controller) return false;
          break;
        case 'REQ_HERO_TARGET':
          if (!this.target || this.target.type !== 'HERO') return false;
          break;
        // Add more requirements as needed
      }
    }
    return true;
  }
}

module.exports = Action;
