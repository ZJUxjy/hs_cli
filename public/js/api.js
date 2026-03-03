// public/js/api.js - API Client
const API = {
  baseUrl: '/api',

  // Card APIs
  async getCards() {
    const res = await fetch(`${this.baseUrl}/cards`);
    return res.json();
  },

  async getCard(id) {
    const res = await fetch(`${this.baseUrl}/cards/${id}`);
    return res.json();
  },

  async getCardsByClass(cardClass) {
    const res = await fetch(`${this.baseUrl}/cards/class/${cardClass}`);
    return res.json();
  },

  // Deck APIs
  async getDecks() {
    const res = await fetch(`${this.baseUrl}/decks`);
    return res.json();
  },

  async getDeck(id) {
    const res = await fetch(`${this.baseUrl}/decks/${id}`);
    return res.json();
  },

  async createDeck(name, hero, mode = 'standard') {
    const res = await fetch(`${this.baseUrl}/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, hero, mode })
    });
    return res.json();
  },

  async updateDeck(id, data) {
    const res = await fetch(`${this.baseUrl}/decks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteDeck(id) {
    const res = await fetch(`${this.baseUrl}/decks/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async addCardToDeck(deckId, cardId) {
    const res = await fetch(`${this.baseUrl}/decks/${deckId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId })
    });
    return res.json();
  },

  async removeCardFromDeck(deckId, cardId) {
    const res = await fetch(`${this.baseUrl}/decks/${deckId}/cards/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId })
    });
    return res.json();
  },

  // Game APIs
  async startGame(playerClass, opponentClass = 'warrior', difficulty = 'normal') {
    const res = await fetch(`${this.baseUrl}/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerClass, opponentClass, difficulty })
    });
    return res.json();
  },

  async getGameState() {
    const res = await fetch(`${this.baseUrl}/game/state`);
    return res.json();
  },

  async playCard(cardIndex) {
    const res = await fetch(`${this.baseUrl}/game/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardIndex })
    });
    return res.json();
  },

  async attack(attackerIndex, targetIndex, targetType) {
    const res = await fetch(`${this.baseUrl}/game/attack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attackerIndex, targetIndex, targetType })
    });
    return res.json();
  },

  async endTurn() {
    const res = await fetch(`${this.baseUrl}/game/endTurn`, {
      method: 'POST'
    });
    return res.json();
  },

  async useHeroPower() {
    const res = await fetch(`${this.baseUrl}/game/heroPower`, {
      method: 'POST'
    });
    return res.json();
  },

  async concede() {
    const res = await fetch(`${this.baseUrl}/game/concede`, {
      method: 'POST'
    });
    return res.json();
  }
};

// Export for use in other modules
window.API = API;
