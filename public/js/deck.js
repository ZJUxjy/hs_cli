// public/js/deck.js - Deck Builder UI
class DeckBuilderUI {
  constructor() {
    this.currentDeck = {
      id: null,
      name: '',
      hero: 'mage',
      cards: []  // Array of {cardId, count}
    };
    this.allCards = [];
    this.filteredCards = [];
    this.currentEditingDeckId = null;
  }

  async init() {
    this.loadFromStorage();
    await this.loadCards();
    this.bindEvents();
    this.renderDeckSlots();
    this.updateDeckCount();
  }

  loadFromStorage() {
    const saved = localStorage.getItem('currentDeck');
    if (saved) {
      try {
        this.currentDeck = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load deck from storage:', e);
      }
    }
  }

  saveToStorage() {
    localStorage.setItem('currentDeck', JSON.stringify(this.currentDeck));
  }

  async loadCards() {
    try {
      this.allCards = await API.getCards();
      // Filter to only show relevant cards (with cost and proper types)
      this.filteredCards = this.allCards.filter(card =>
        card.type === 'MINION' || card.type === 'SPELL' || card.type === 'WEAPON'
      );
      this.renderCardList(this.filteredCards);
    } catch (err) {
      console.error('Failed to load cards:', err);
    }
  }

  renderCardList(cards) {
    const list = document.getElementById('card-list');
    if (!list) return;

    // Show first 100 cards to avoid performance issues
    const displayCards = cards.slice(0, 200);

    list.innerHTML = displayCards.map(card => `
      <div class="card-item"
           data-id="${card.id}"
           data-cost="${card.cost || 0}"
           data-name="${card.name || ''}"
           data-type="${card.type || ''}"
           data-card-class="${card.cardClass || 'NEUTRAL'}"
           draggable="true">
        <div class="card-header">
          <span class="card-cost">${card.cost || 0}</span>
        </div>
        <div class="card-name">${card.name || 'Unknown'}</div>
        <div class="card-type">${this.getTypeName(card.type)}</div>
        <div class="card-stats">
          ${card.attack !== undefined ? `<span class="card-attack">${card.attack}</span>` : ''}
          ${card.health !== undefined ? `<span class="card-health">${card.health}</span>` : ''}
        </div>
      </div>
    `).join('');

    // Add drag events
    list.querySelectorAll('.card-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('cardId', item.dataset.id);
        item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });

      item.addEventListener('click', () => {
        this.addCardToDeck(item.dataset.id);
      });
    });
  }

  getTypeName(type) {
    const types = {
      'MINION': '随从',
      'SPELL': '法术',
      'WEAPON': '武器',
      'HERO': '英雄'
    };
    return types[type] || type;
  }

  bindEvents() {
    // Search
    const searchInput = document.getElementById('card-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterCards(e.target.value);
      });
    }

    // Class filter
    const classFilter = document.getElementById('card-class-filter');
    if (classFilter) {
      classFilter.addEventListener('change', (e) => {
        this.filterCards(searchInput?.value || '', e.target.value);
      });
    }

    // Deck name
    const deckNameInput = document.getElementById('deck-name');
    if (deckNameInput) {
      deckNameInput.value = this.currentDeck.name;
      deckNameInput.addEventListener('input', (e) => {
        this.currentDeck.name = e.target.value;
        this.saveToStorage();
      });
    }

    // Hero selection
    const deckHeroSelect = document.getElementById('deck-hero');
    if (deckHeroSelect) {
      deckHeroSelect.value = this.currentDeck.hero;
      deckHeroSelect.addEventListener('change', (e) => {
        this.currentDeck.hero = e.target.value;
        this.saveToStorage();
      });
    }

    // Save button
    const saveBtn = document.getElementById('btn-save-deck');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveDeck());
    }

    // Clear button
    const clearBtn = document.getElementById('btn-clear-deck');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearDeck());
    }

    // Deck slots drop zone
    const deckSlots = document.getElementById('deck-slots');
    if (deckSlots) {
      deckSlots.addEventListener('dragover', (e) => {
        e.preventDefault();
        deckSlots.classList.add('drag-over');
      });

      deckSlots.addEventListener('dragleave', () => {
        deckSlots.classList.remove('drag-over');
      });

      deckSlots.addEventListener('drop', (e) => {
        e.preventDefault();
        deckSlots.classList.remove('drag-over');
        const cardId = e.dataTransfer.getData('cardId');
        if (cardId) {
          this.addCardToDeck(cardId);
        }
      });
    }
  }

  filterCards(query = '', classFilter = '') {
    let filtered = this.allCards;

    // Filter by search query
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(card =>
        (card.name && card.name.toLowerCase().includes(q)) ||
        (card.text && card.text.toLowerCase().includes(q))
      );
    }

    // Filter by class
    if (classFilter) {
      filtered = filtered.filter(card =>
        card.cardClass === classFilter || card.cardClass === 'NEUTRAL'
      );
    }

    // Filter by type
    filtered = filtered.filter(card =>
      card.type === 'MINION' || card.type === 'SPELL' || card.type === 'WEAPON'
    );

    this.renderCardList(filtered);
  }

  addCardToDeck(cardId) {
    // Check deck size (max 30)
    const totalCards = this.currentDeck.cards.reduce((sum, c) => sum + c.count, 0);
    if (totalCards >= 30) {
      alert('卡组已满（30张）');
      return;
    }

    // Find card
    const card = this.allCards.find(c => c.id === cardId);
    if (!card) return;

    // Check card copy limit
    const existing = this.currentDeck.cards.find(c => c.cardId === cardId);
    const maxCopies = (card.rarity === 'LEGENDARY' || card.rarity === 'EPIC') ? 1 : 2;

    if (existing) {
      if (existing.count >= maxCopies) {
        alert(`${maxCopies === 1 ? '传说卡' : '史诗/传说卡'}最多只能有1张，其他卡最多2张`);
        return;
      }
      existing.count++;
    } else {
      this.currentDeck.cards.push({ cardId, count: 1 });
    }

    this.saveToStorage();
    this.renderDeckSlots();
    this.updateDeckCount();
  }

  removeCardFromDeck(cardId) {
    const index = this.currentDeck.cards.findIndex(c => c.cardId === cardId);
    if (index !== -1) {
      this.currentDeck.cards[index].count--;
      if (this.currentDeck.cards[index].count <= 0) {
        this.currentDeck.cards.splice(index, 1);
      }
    }

    this.saveToStorage();
    this.renderDeckSlots();
    this.updateDeckCount();
  }

  renderDeckSlots() {
    const slots = document.getElementById('deck-slots');
    if (!slots) return;

    // Show cards in deck
    slots.innerHTML = this.currentDeck.cards.map(deckCard => {
      const card = this.allCards.find(c => c.id === deckCard.cardId);
      if (!card) return '';

      return `
        <div class="deck-slot has-card" data-card-id="${deckCard.cardId}">
          <div class="deck-slot-info">
            <span class="card-cost">${card.cost || 0}</span>
            <span class="card-name">${card.name}</span>
          </div>
          <span class="card-count">x${deckCard.count}</span>
        </div>
      `;
    }).join('');

    // Add click handlers to remove cards
    slots.querySelectorAll('.deck-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        this.removeCardFromDeck(slot.dataset.cardId);
      });
    });
  }

  updateDeckCount() {
    const countEl = document.getElementById('deck-count');
    if (countEl) {
      const total = this.currentDeck.cards.reduce((sum, c) => sum + c.count, 0);
      countEl.textContent = `${total}/30`;
      countEl.style.color = total === 30 ? '#4ad94a' : '#f0c040';
    }
  }

  clearDeck() {
    if (confirm('确定要清空卡组吗？')) {
      this.currentDeck.cards = [];
      this.currentDeck.name = '';
      this.currentDeck.id = null;
      this.saveToStorage();
      this.renderDeckSlots();
      this.updateDeckCount();

      document.getElementById('deck-name').value = '';
    }
  }

  async saveDeck() {
    const name = this.currentDeck.name.trim();
    if (!name) {
      alert('请输入卡组名称');
      return;
    }

    const total = this.currentDeck.cards.reduce((sum, c) => sum + c.count, 0);
    if (total < 30) {
      alert(`卡组需要30张，当前只有${total}张`);
      return;
    }

    try {
      // Get full card data for the deck
      const deckCards = this.currentDeck.cards.map(dc => {
        const card = this.allCards.find(c => c.id === dc.cardId);
        return { ...card, count: dc.count };
      });

      let deckId = this.currentDeck.id;

      if (deckId) {
        // Update existing deck
        await API.updateDeck(deckId, {
          name,
          hero: this.currentDeck.hero,
          cards: deckCards
        });
      } else {
        // Create new deck
        const newDeck = await API.createDeck(name, this.currentDeck.hero);
        deckId = newDeck.id;

        // Add cards to deck
        for (const dc of this.currentDeck.cards) {
          for (let i = 0; i < dc.count; i++) {
            await API.addCardToDeck(deckId, dc.cardId);
          }
        }
      }

      alert('卡组保存成功！');

      // Clear current deck after saving
      this.clearDeck();
    } catch (err) {
      console.error('Failed to save deck:', err);
      alert('保存卡组失败');
    }
  }
}

// Export for use in other modules
window.DeckBuilderUI = DeckBuilderUI;
