// src/data/DeckBuilder.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DeckBuilder {
  constructor() {
    this.decksDir = path.join(__dirname, '../../data/decks');
    this.indexFile = path.join(this.decksDir, 'index.json');
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.decksDir)) {
      fs.mkdirSync(this.decksDir, { recursive: true });
    }
    if (!fs.existsSync(this.indexFile)) {
      fs.writeFileSync(this.indexFile, JSON.stringify([]));
    }
  }

  getDecks() {
    return JSON.parse(fs.readFileSync(this.indexFile, 'utf8'));
  }

  saveDecks(decks) {
    fs.writeFileSync(this.indexFile, JSON.stringify(decks, null, 2));
  }

  create(name, hero, mode = 'standard') {
    const deck = {
      id: uuidv4(),
      name,
      hero,
      mode,
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const decks = this.getDecks();
    decks.push(deck);
    this.saveDecks(decks);
    return deck;
  }

  getDeck(id) {
    const decks = this.getDecks();
    const deck = decks.find(d => d.id === id);
    if (!deck) return null;
    return {
      ...deck,
      cardCount: deck.cards.reduce((sum, c) => sum + c.count, 0)
    };
  }

  delete(id) {
    const decks = this.getDecks();
    const filtered = decks.filter(d => d.id !== id);
    this.saveDecks(filtered);
  }

  addCard(deckId, cardId) {
    const deck = this.getDeck(deckId);
    if (!deck) return null;
    const card = deck.cards.find(c => c.id === cardId);
    if (card) {
      card.count++;
    } else {
      deck.cards.push({ id: cardId, count: 1 });
    }
    deck.updatedAt = new Date().toISOString();
    this.saveDecks(this.getDecks().map(d => d.id === deckId ? deck : d));
    return deck;
  }

  removeCard(deckId, cardId) {
    const deck = this.getDeck(deckId);
    if (!deck) return null;
    const idx = deck.cards.findIndex(c => c.id === cardId);
    if (idx > -1) {
      deck.cards[idx].count--;
      if (deck.cards[idx].count <= 0) {
        deck.cards.splice(idx, 1);
      }
    }
    deck.updatedAt = new Date().toISOString();
    this.saveDecks(this.getDecks().map(d => d.id === deckId ? deck : d));
    return deck;
  }

  validate(deckId) {
    const deck = this.getDeck(deckId);
    if (!deck) return { valid: false, errors: ['Deck not found'] };

    const errors = [];
    const CardData = require('./CardData');

    // 检查卡组数量
    const totalCards = deck.cards.reduce((sum, c) => sum + c.count, 0);
    if (totalCards < 30) {
      errors.push(`卡组只有${totalCards}张卡，需要30张`);
    }

    // 检查每张卡
    deck.cards.forEach(card => {
      const cardData = CardData.getCard(card.id);
      if (!cardData) {
        errors.push(`卡牌 ${card.id} 不存在`);
        return;
      }

      // 检查职业
      if (cardData.cardClass !== 'NEUTRAL' && cardData.cardClass !== deck.hero.toUpperCase()) {
        errors.push(`${cardData.name} 不是${deck.hero}职业卡`);
      }

      // 检查数量限制
      const rarity = cardData.rarity;
      if (rarity === 'LEGENDARY' || rarity === 'EPIC') {
        if (card.count > 1) {
          errors.push(`${cardData.name} 只能带1张`);
        }
      } else {
        if (card.count > 2) {
          errors.push(`${cardData.name} 只能带2张`);
        }
      }
    });

    return { valid: errors.length === 0, errors };
  }

  update(id, updates) {
    const decks = this.getDecks();
    const idx = decks.findIndex(d => d.id === id);
    if (idx === -1) return null;
    decks[idx] = { ...decks[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveDecks(decks);
    return decks[idx];
  }

  list() {
    const decks = this.getDecks();
    // Add cardCount to each deck
    return decks.map(d => ({
      ...d,
      cardCount: d.cards.reduce((sum, c) => sum + c.count, 0)
    }));
  }

  listByHero(hero) {
    return this.list().filter(d => d.hero === hero);
  }

  listByMode(mode) {
    return this.getDecks().filter(d => d.mode === mode);
  }
}

module.exports = new DeckBuilder();
