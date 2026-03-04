// public/js/api.js - API Client
const API = {
  baseUrl: '/api',

  // Helper to handle API responses
  async _handleResponse(res) {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // Card APIs
  async getCards() {
    const res = await fetch(`${this.baseUrl}/cards`);
    return this._handleResponse(res);
  },

  async getCard(id) {
    const res = await fetch(`${this.baseUrl}/cards/${id}`);
    return this._handleResponse(res);
  },

  async getCardsByClass(cardClass) {
    const res = await fetch(`${this.baseUrl}/cards/class/${cardClass}`);
    return this._handleResponse(res);
  },

  // Deck APIs
  async getDecks() {
    const res = await fetch(`${this.baseUrl}/decks`);
    return this._handleResponse(res);
  },

  async getDeck(id) {
    const res = await fetch(`${this.baseUrl}/decks/${id}`);
    return this._handleResponse(res);
  },

  async createDeck(name, hero, mode = 'standard') {
    const res = await fetch(`${this.baseUrl}/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, hero, mode })
    });
    return this._handleResponse(res);
  },

  async updateDeck(id, data) {
    const res = await fetch(`${this.baseUrl}/decks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this._handleResponse(res);
  },

  async deleteDeck(id) {
    const res = await fetch(`${this.baseUrl}/decks/${id}`, {
      method: 'DELETE'
    });
    return this._handleResponse(res);
  },

  async addCardToDeck(deckId, cardId) {
    const res = await fetch(`${this.baseUrl}/decks/${deckId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId })
    });
    return this._handleResponse(res);
  },

  async removeCardFromDeck(deckId, cardId) {
    const res = await fetch(`${this.baseUrl}/decks/${deckId}/cards/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId })
    });
    return this._handleResponse(res);
  },

  // Game APIs
  async startGame(playerClass, opponentClass = 'warrior', difficulty = 'normal') {
    const res = await fetch(`${this.baseUrl}/game/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerClass, opponentClass, difficulty })
    });
    return this._handleResponse(res);
  },

  async getGameState() {
    const res = await fetch(`${this.baseUrl}/game/state`);
    return this._handleResponse(res);
  },

  async playCard(cardIndex) {
    const res = await fetch(`${this.baseUrl}/game/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardIndex })
    });
    return this._handleResponse(res);
  },

  async attack(attackerIndex, targetIndex, targetType) {
    const res = await fetch(`${this.baseUrl}/game/attack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attackerIndex, targetIndex, targetType })
    });
    return this._handleResponse(res);
  },

  async endTurn() {
    const res = await fetch(`${this.baseUrl}/game/endTurn`, {
      method: 'POST'
    });
    return this._handleResponse(res);
  },

  async useHeroPower() {
    const res = await fetch(`${this.baseUrl}/game/heroPower`, {
      method: 'POST'
    });
    return this._handleResponse(res);
  },

  async concede() {
    const res = await fetch(`${this.baseUrl}/game/concede`, {
      method: 'POST'
    });
    return this._handleResponse(res);
  },

  // Locale APIs
  async getLocale() {
    const res = await fetch(`${this.baseUrl}/game/locale`);
    return this._handleResponse(res);
  },

  async setLocale(locale) {
    const res = await fetch(`${this.baseUrl}/game/locale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale })
    });
    return this._handleResponse(res);
  },

  // 抉择选择
  async chooseOption(option) {
    const res = await fetch(`${this.baseUrl}/game/choose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option })
    });
    return this._handleResponse(res);
  },

  // 获取当前抉择状态
  async getChoiceState() {
    const res = await fetch(`${this.baseUrl}/game/choice`);
    return this._handleResponse(res);
  },

  // 适应选择
  async selectAdapt(optionIndex) {
    const res = await fetch(`${this.baseUrl}/game/adapt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionIndex })
    });
    return this._handleResponse(res);
  },

  // 获取当前适应状态
  async getAdaptState() {
    const res = await fetch(`${this.baseUrl}/game/adapt`);
    return this._handleResponse(res);
  },

  // 存档 API
  async saveGame(profileId = 'default') {
    const res = await fetch(`${this.baseUrl}/game/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId })
    });
    return this._handleResponse(res);
  },

  async getSaves(profileId = 'default') {
    const res = await fetch(`${this.baseUrl}/game/saves?profileId=${profileId}`);
    return this._handleResponse(res);
  },

  async loadGame(saveId, profileId = 'default') {
    const res = await fetch(`${this.baseUrl}/game/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saveId, profileId })
    });
    return this._handleResponse(res);
  }
};

// Export for use in other modules
window.API = API;
