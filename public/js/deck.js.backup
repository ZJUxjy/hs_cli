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
      <div class="card-item ${this.getRarityClass(card.rarity)}"
           data-id="${card.id}"
           data-cost="${card.cost || 0}"
           data-name="${card.name || ''}"
           data-type="${card.type || ''}"
           data-card-class="${card.cardClass || 'NEUTRAL'}"
           data-rarity="${card.rarity || ''}"
           draggable="true">
        <div class="card-rarity-gem ${this.getRarityClass(card.rarity)}"></div>
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

      // 单击显示详情，双击添加卡牌
      item.addEventListener('click', (e) => {
        const card = this.allCards.find(c => c.id === item.dataset.id);
        if (card) {
          this.showCardDetail(card);
        }
      });

      item.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.addCardToDeck(item.dataset.id);
      });
    });
  }

  // 显示卡牌详情弹窗
  showCardDetail(card) {
    const modal = document.getElementById('card-detail-modal');
    if (!modal) return;

    // 填充卡牌信息
    modal.querySelector('.card-detail-cost').textContent = card.cost || 0;
    modal.querySelector('.card-detail-name').textContent = card.name || i18n.t('ui.deck.unknown');
    modal.querySelector('.card-detail-type').textContent = this.getTypeName(card.type);

    // 处理卡牌描述
    let text = card.text || '';
    // 替换卡牌描述中的符号
    text = text.replace(/\$/g, '').replace(/\[x\]/g, '');
    text = text.replace(/@/g, ' <span style="color:#f0c040">[]</span> ');
    modal.querySelector('.card-detail-text').innerHTML = text || i18n.t('ui.deck.noDescription');

    // 显示攻击/生命
    const statsEl = modal.querySelector('.card-detail-stats');
    if (card.type === 'MINION' || card.type === 'WEAPON') {
      statsEl.innerHTML = `
        <span class="card-detail-attack">${card.attack !== undefined ? card.attack : '-'}</span>
        <span class="card-detail-health">${card.health !== undefined ? card.health : '-'}</span>
      `;
      statsEl.style.display = 'flex';
    } else {
      statsEl.style.display = 'none';
    }

    // 显示机制标签
    const mechanicsEl = modal.querySelector('.card-detail-mechanics');
    const mechanics = card.mechanics || [];
    if (mechanics.length > 0) {
      mechanicsEl.innerHTML = mechanics.map(m => `
        <span class="mechanic-tag">${this.getMechanicName(m)}</span>
      `).join('');
      mechanicsEl.style.display = 'flex';
    } else {
      mechanicsEl.style.display = 'none';
    }

    // 显示稀有度和卡牌包
    modal.querySelector('.card-detail-rarity').textContent = this.getRarityName(card.rarity);
    modal.querySelector('.card-detail-set').textContent = this.getSetName(card.set);

    // 显示弹窗
    modal.classList.remove('hidden');

    // 绑定关闭事件
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.onclick = () => this.closeCardDetail();

    modal.onclick = (e) => {
      if (e.target === modal) {
        this.closeCardDetail();
      }
    };
  }

  closeCardDetail() {
    const modal = document.getElementById('card-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  getMechanicName(mechanic) {
    return i18n.t(`ui.mechanics.${mechanic}`, { defaultValue: mechanic });
  }

  getRarityClass(rarity) {
    const classes = {
      'COMMON': 'rarity-common',
      'RARE': 'rarity-rare',
      'EPIC': 'rarity-epic',
      'LEGENDARY': 'rarity-legendary'
    };
    return classes[rarity] || '';
  }

  getRarityName(rarity) {
    return i18n.t(`ui.rarity.${rarity}`, { defaultValue: rarity });
  }

  getSetName(set) {
    return i18n.t(`ui.set.${set}`, { defaultValue: set });
  }

  getTypeName(type) {
    return i18n.t(`ui.type.${type}`, { defaultValue: type });
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
        this.filterCards(searchInput?.value || '', e.target.value, document.getElementById('card-rarity-filter')?.value || '');
      });
    }

    // Rarity filter
    const rarityFilter = document.getElementById('card-rarity-filter');
    if (rarityFilter) {
      rarityFilter.addEventListener('change', (e) => {
        this.filterCards(searchInput?.value || '', document.getElementById('card-class-filter')?.value || '', e.target.value);
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
        // 切换职业时，自动筛选该职业+中立的卡
        this.autoFilterByHero();
      });
    }

    // 初始加载时自动筛选
    this.autoFilterByHero();

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

  filterCards(query = '', classFilter = '', rarityFilter = '', autoHeroClass = '') {
    let filtered = this.allCards;

    // Filter by search query
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(card =>
        (card.name && card.name.toLowerCase().includes(q)) ||
        (card.text && card.text.toLowerCase().includes(q))
      );
    }

    // Filter by class (手动选择或自动根据hero)
    const heroClass = autoHeroClass || classFilter;
    if (heroClass) {
      filtered = filtered.filter(card =>
        card.cardClass === heroClass || card.cardClass === 'NEUTRAL'
      );
    } else if (classFilter) {
      // 手动选择职业
      filtered = filtered.filter(card =>
        card.cardClass === classFilter || card.cardClass === 'NEUTRAL'
      );
    }

    // Filter by rarity
    if (rarityFilter) {
      filtered = filtered.filter(card =>
        card.rarity === rarityFilter
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
      alert(i18n.t('ui.deck.deckFull'));
      return;
    }

    // Find card
    const card = this.allCards.find(c => c.id === cardId);
    if (!card) return;

    // Check card class (only allow hero's class + neutral)
    const heroClass = this.currentDeck.hero.toUpperCase();
    const cardClass = (card.cardClass || 'NEUTRAL').toUpperCase();
    if (cardClass !== heroClass && cardClass !== 'NEUTRAL') {
      alert(i18n.t('ui.deck.classCardOnly', { class: this.getClassName(cardClass), hero: this.getClassName(heroClass) }));
      return;
    }

    // Check card copy limit
    const existing = this.currentDeck.cards.find(c => c.cardId === cardId);
    const maxCopies = (card.rarity === 'LEGENDARY' || card.rarity === 'EPIC') ? 1 : 2;

    if (existing) {
      if (existing.count >= maxCopies) {
        alert(maxCopies === 1 ? i18n.t('ui.deck.maxCopiesLegendary') : i18n.t('ui.deck.maxCopiesNormal'));
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

  getClassName(cardClass) {
    return i18n.t(`ui.hero.${cardClass.toLowerCase()}`, { defaultValue: cardClass });
  }

  // 根据选择的职业自动筛选卡牌列表
  autoFilterByHero() {
    const heroClass = this.currentDeck.hero.toUpperCase();
    // 获取当前搜索和筛选条件
    const searchInput = document.getElementById('card-search');
    const classFilter = document.getElementById('card-class-filter');
    const rarityFilter = document.getElementById('card-rarity-filter');

    // 暂时禁用职业筛选，使用自动筛选
    if (classFilter) {
      classFilter.value = ''; // 重置职业筛选，使用自动筛选
    }

    // 调用筛选函数，只显示该职业+中立的卡
    this.filterCards(
      searchInput?.value || '',
      '', // 清除手动职业筛选
      rarityFilter?.value || '',
      heroClass // 添加自动职业过滤
    );
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
          <div class="deck-slot-actions">
            <span class="card-count">x${deckCard.count}</span>
            <button class="remove-card-btn" data-card-id="${deckCard.cardId}">&times;</button>
          </div>
        </div>
      `;
    }).join('');

    // Add click handlers to remove cards (点击X按钮移除)
    slots.querySelectorAll('.remove-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeCardFromDeck(btn.dataset.cardId);
      });
    });

    // 点击卡牌查看详情
    slots.querySelectorAll('.deck-slot').forEach(slot => {
      slot.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-card-btn')) return;
        const card = this.allCards.find(c => c.id === slot.dataset.cardId);
        if (card) {
          this.showCardDetail(card);
        }
      });
    });
  }

  updateDeckCount() {
    const countEl = document.getElementById('deck-count');
    if (countEl) {
      const total = this.currentDeck.cards.reduce((sum, c) => sum + c.count, 0);
      countEl.textContent = i18n.t('ui.deck.deckCount', { count: total });
      countEl.style.color = total === 30 ? '#4ad94a' : '#f0c040';
    }
  }

  clearDeck() {
    if (confirm(i18n.t('ui.deck.confirmClear'))) {
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
      alert(i18n.t('ui.deck.enterDeckName'));
      return;
    }

    const total = this.currentDeck.cards.reduce((sum, c) => sum + c.count, 0);
    if (total < 30) {
      alert(i18n.t('ui.deck.need30Cards', { count: total }));
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

      alert(i18n.t('ui.deck.saveSuccess'));

      // Clear current deck after saving
      this.clearDeck();
    } catch (err) {
      console.error('Failed to save deck:', err);
      alert(i18n.t('ui.deck.saveFailed'));
    }
  }
}

// Export for use in other modules
window.DeckBuilderUI = DeckBuilderUI;
