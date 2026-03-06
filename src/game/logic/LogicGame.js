const Player = require('./entities/Player');
const EventRegistry = require('./events/EventRegistry');
const Attack = require('./actions/Attack');
const Summon = require('./actions/Summon');

class LogicGame {
  constructor(playerNames) {
    this.nextEntityId = 1;
    this.entities = [];
    this.events = new EventRegistry();
    this.players = playerNames.map(name => new Player(this, name, [], 'NEUTRAL'));

    // Set up opponent references
    this.players[0].opponent = this.players[1];
    this.players[1].opponent = this.players[0];

    this.currentPlayer = null;
    this.turn = 0;
    this.phase = 'INVALID';
  }

  start() {
    this.phase = 'PLAYING';
    this.players[0].currentPlayer = true;
    this.players[0].maxMana = 1;
    this.currentPlayer = this.players[0];
    this.turn = 1;
  }

  queueActions(source, actions) {
    const results = [];
    for (const action of actions) {
      if (action.trigger) {
        results.push(action.trigger(this));
      }
    }
    return results;
  }

  playCard(player, cardId, target, index) {
    const card = player.hand.find(c => c.id === cardId);
    if (!card) return false;

    // Check mana
    if (player.mana < card.cost) return false;

    player.usedMana += card.cost;

    // Play the card
    player.playCard(card, target, index);

    // Trigger battlecry
    if (card.battlecry) {
      card.battlecry(this, card, player, target);
    }

    return true;
  }

  attack(attacker, target) {
    const action = new Attack(attacker, target);
    return action.trigger(this);
  }

  endTurn() {
    this.currentPlayer.currentPlayer = false;
    this.currentPlayer = this.currentPlayer.opponent;
    this.currentPlayer.currentPlayer = true;

    // Increase max mana (up to 10)
    if (this.currentPlayer.maxMana < 10) {
      this.currentPlayer.maxMana++;
    }

    this.turn++;
  }
}

module.exports = LogicGame;
