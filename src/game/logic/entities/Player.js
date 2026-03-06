const Entity = require('./Entity');
const Card = require('./Card');

class Player extends Entity {
  constructor(game, name, deck = [], heroClass) {
    super(game, 'player_' + name);
    this.name = name;
    this.heroClass = heroClass;
    this.deck = deck.map(cardId => new Card(game, cardId, { cost: 0, atk: 0, health: 1 }));
    this.hand = [];
    this.field = [];
    this.graveyard = [];
    this.secrets = [];
    // Mana
    this.maxMana = 0;
    this.usedMana = 0;
    this.overload = 0;
    // Stats
    this.health = 30;
    this.armor = 0;
    // State
    this.currentPlayer = false;
    this.firstPlayer = false;
  }

  get mana() {
    return Math.max(0, this.maxMana - this.usedMana);
  }

  drawCard() {
    if (this.deck.length === 0) {
      return null;
    }
    const card = this.deck.pop();
    this.hand.push(card);
    return card;
  }

  playCard(card, target, index) {
    const handIndex = this.hand.indexOf(card);
    if (handIndex === -1) return false;

    this.hand.splice(handIndex, 1);
    card.zone = 'PLAY';
    this.field.push(card);
    return true;
  }
}

module.exports = Player;
