const Action = require('./Action');
const Card = require('../entities/Card');

class Summon extends Action {
  constructor(player, cardId, data = {}) {
    super({ type: 'SUMMON', cardId }, player, null);
    this.player = player;
    this.cardId = cardId;
    this.cardData = data;
  }

  trigger(game) {
    const card = new Card(game, this.cardId, this.cardData);
    card.controller = this.player;
    card.zone = 'PLAY';
    this.player.field.push(card);

    // Trigger battlecry if any
    if (card.hasBattlecry && card.battlecry) {
      card.battlecry(game, card, this.player);
    }

    return [{ action: 'SUMMON', card }];
  }
}

module.exports = Summon;
