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
    this.translation = {};  // 卡牌翻译
  }

  async init() {
    this.loadFromStorage();
    await this.loadCards();
    await this.loadTranslation();  // 加载翻译
    this.bindEvents();
    this.renderDeckSlots();
    this.updateDeckCount();
  }

  // 加载卡牌翻译
  async loadTranslation() {
    try {
      const res = await fetch('/api/cards/translation?locale=zh');
      this.translation = await res.json();
    } catch (e) {
      console.warn('Failed to load translation:', e);
      this.translation = {};
    }
  }

  // 获取卡牌翻译名称
  getCardName(card) {
    if (this.translation[card.id]) {
      return this.translation[card.id].name;
    }
    return card.name || 'Unknown';
  }

  // 获取卡牌翻译描述
  getCardText(card) {
    if (this.translation[card.id]) {
      return this.translation[card.id].text;
    }
    return card.text || '';
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
      // Filter to only show collectible cards (MINION, SPELL, WEAPON)
      // Exclude: The Coin (GAME_005), non-collectible cards
      this.filteredCards = this.allCards.filter(card =>
        card.collectible &&
        (card.type === 'MINION' || card.type === 'SPELL' || card.type === 'WEAPON')
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
           data-name="${this.getCardName(card)}"
           data-type="${card.type || ''}"
           data-card-class="${card.cardClass || 'NEUTRAL'}"
           data-rarity="${card.rarity || ''}"
           draggable="true">
        <div class="card-rarity-gem ${this.getRarityClass(card.rarity)}"></div>
        <div class="card-header">
          <span class="card-cost">${card.cost || 0}</span>
        </div>
        <div class="card-name">${this.getCardName(card)}</div>
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

        // 设置自定义拖拽图像 - 只显示卡牌信息
        const card = this.allCards.find(c => c.id === item.dataset.id);
        if (card) {
          const dragImage = document.createElement('div');
          dragImage.style.cssText = `
            position: absolute;
            top: -1000px;
            padding: 8px 12px;
            background: linear-gradient(180deg, #2a2a4a 0%, #1a1a2e 100%);
            border: 2px solid #f0c040;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: bold;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 8px;
          `;
          dragImage.innerHTML = `
            <span style="background: #4a90d9; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">${card.cost || 0}</span>
            <span>${this.getCardName(card)}</span>
          `;
          document.body.appendChild(dragImage);
          e.dataTransfer.setDragImage(dragImage, 50, 20);

          // 延迟移除临时元素
          setTimeout(() => dragImage.remove(), 0);
        }
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
    modal.querySelector('.card-detail-name').textContent = this.getCardName(card);
    modal.querySelector('.card-detail-type').textContent = this.getTypeName(card.type);

    // 处理卡牌描述 - 使用翻译
    let text = this.getCardText(card);
    // 替换卡牌描述中的符号
    text = text.replace(/\$/g, '').replace(/\[x\]/g, '');
    text = text.replace(/@/g, ' <span style="color:#f0c040">[]</span> ');
    text = text.replace(/b>/g, 'b>').replace(/<\//g, '</');
    modal.querySelector('.card-detail-text').innerHTML = text || i18n.t('ui.deck.noDescription');

    // 使用 active 类显示 modal
    modal.classList.remove('hidden');
    modal.classList.add('active');

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
      modal.classList.remove('active');
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

    // Auto fill button
    const autoFillBtn = document.getElementById('btn-auto-fill');
    if (autoFillBtn) {
      autoFillBtn.addEventListener('click', () => this.autoFillDeck());
    }

    // Import deck code button
    const importBtn = document.getElementById('btn-import-deckcode');
    if (importBtn) {
      importBtn.addEventListener('click', () => this.showImportDialog());
    }

    // Export deck code button
    const exportBtn = document.getElementById('btn-export-deckcode');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.showExportDialog());
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

    // Filter by search query - 支持中英文搜索
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(card => {
        const translatedName = this.getCardName(card);
        const translatedText = this.getCardText(card);
        return (card.name && card.name.toLowerCase().includes(q)) ||
               (translatedName && translatedName.toLowerCase().includes(q)) ||
               (card.text && card.text.toLowerCase().includes(q)) ||
               (translatedText && translatedText.toLowerCase().includes(q));
      });
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
      window.app.showMessageDialog({
        title: i18n.t('ui.deck.deckFullTitle', { defaultValue: '卡组已满' }),
        message: i18n.t('ui.deck.deckFull', { defaultValue: '卡组最多30张卡牌' }),
        type: 'warning'
      });
      return;
    }

    // Find card
    const card = this.allCards.find(c => c.id === cardId);
    if (!card) return;

    // Check card class (only allow hero's class + neutral)
    const heroClass = this.currentDeck.hero.toUpperCase();
    const cardClass = (card.cardClass || 'NEUTRAL').toUpperCase();
    if (cardClass !== heroClass && cardClass !== 'NEUTRAL') {
      window.app.showMessageDialog({
        title: i18n.t('ui.deck.classMismatchTitle', { defaultValue: '职业不符' }),
        message: i18n.t('ui.deck.classCardOnly', { class: this.getClassName(cardClass), hero: this.getClassName(heroClass), defaultValue: `${this.getClassName(cardClass)}卡牌只能用于${this.getClassName(heroClass)}卡组` }),
        type: 'warning'
      });
      return;
    }

    // Check card copy limit
    const existing = this.currentDeck.cards.find(c => c.cardId === cardId);
    const maxCopies = (card.rarity === 'LEGENDARY' || card.rarity === 'EPIC') ? 1 : 2;

    if (existing) {
      if (existing.count >= maxCopies) {
        const isLegendary = maxCopies === 1;
        window.app.showMessageDialog({
          title: i18n.t('ui.deck.maxCopiesTitle', { defaultValue: '已达上限' }),
          message: i18n.t('ui.deck.maxCopiesMsg', { defaultValue: isLegendary ? '传说/史诗卡牌最多1张' : '普通卡牌最多2张' }),
          type: 'warning'
        });
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
            <span class="card-name">${this.getCardName(card)}</span>
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
    const saveBtn = document.getElementById('btn-save-deck');

    if (countEl) {
      const total = this.currentDeck.cards.reduce((sum, c) => sum + c.count, 0);
      const maxCards = 30;
      countEl.textContent = `${total}/${maxCards}`;
      countEl.style.color = total >= 30 ? '#4ad94a' : '#f0c040';
    }

    // 根据卡组是否满30张来启用/禁用保存按钮
    if (saveBtn) {
      const total = this.currentDeck.cards.reduce((sum, c) => sum + c.count, 0);
      const isValid = total === 30;
      saveBtn.disabled = !isValid;
      saveBtn.style.opacity = isValid ? '1' : '0.5';
      saveBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    }
  }

  clearDeck() {
    window.app.showGenericConfirm({
      title: i18n.t('ui.deck.confirmClearTitle', { defaultValue: '确认清空' }),
      message: i18n.t('ui.deck.confirmClear', { defaultValue: '确定要清空当前卡组吗？' }),
      type: 'warning',
      onConfirm: () => {
        this.currentDeck.cards = [];
        this.currentDeck.name = '';
        this.currentDeck.id = null;
        this.saveToStorage();
        this.renderDeckSlots();
        this.updateDeckCount();

        document.getElementById('deck-name').value = '';
      }
    });
  }

  autoFillDeck() {
    // 获取当前职业
    const heroClass = this.currentDeck.hero?.toUpperCase() || 'MAGE';
    const classMap = {
      mage: 'MAGE', warrior: 'WARRIOR', hunter: 'HUNTER',
      druid: 'DRUID', rogue: 'ROGUE', priest: 'PRIEST',
      paladin: 'PALADIN', shaman: 'SHAMAN', warlock: 'WARLOCK',
      demonhunter: 'DEMONHUNTER', deathknight: 'DEATHKNIGHT'
    };
    const playerClass = classMap[heroClass] || 'MAGE';

    // 筛选可用卡牌（当前职业 + 中立）
    const availableCards = this.allCards.filter(card => {
      return card.collectible &&
        (card.cardClass === playerClass || card.cardClass === 'NEUTRAL') &&
        card.type !== 'HERO';
    });

    if (availableCards.length === 0) {
      window.app.showMessageDialog({
        title: i18n.t('ui.deck.noCardsTitle', { defaultValue: '无法填充' }),
        message: i18n.t('ui.deck.noCardsAvailable', { defaultValue: '没有可用的卡牌' }),
        type: 'warning'
      });
      return;
    }

    // 清空当前卡组
    this.currentDeck.cards = [];

    // 随机填充直到30张
    const maxCards = 30;
    const cardCountMap = new Map(); // 跟踪每张卡的数量

    while (this.currentDeck.cards.reduce((sum, c) => sum + c.count, 0) < maxCards) {
      // 随机选择一张卡
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      const cardId = randomCard.id;

      // 检查数量限制
      const isLegendary = randomCard.rarity === 'LEGENDARY';
      const currentCount = cardCountMap.get(cardId) || 0;

      if (isLegendary && currentCount >= 1) {
        continue; // 传说卡最多1张
      }
      if (!isLegendary && currentCount >= 2) {
        continue; // 普通卡最多2张
      }

      // 添加卡牌
      const existing = this.currentDeck.cards.find(c => c.cardId === cardId);
      if (existing) {
        existing.count++;
      } else {
        this.currentDeck.cards.push({ cardId, count: 1 });
      }
      cardCountMap.set(cardId, (cardCountMap.get(cardId) || 0) + 1);
    }

    // 保存并更新UI
    this.saveToStorage();
    this.renderDeckSlots();
    this.updateDeckCount();
  }

  async saveDeck() {
    // 如果没有输入名称，使用默认名称
    let name = this.currentDeck.name.trim();
    if (!name) {
      const heroName = this.getHeroName(this.currentDeck.hero);
      name = `${heroName}卡组`;
    }

    const total = this.currentDeck.cards.reduce((sum, c) => sum + c.count, 0);
    if (total < 30) {
      window.app.showMessageDialog({
        title: i18n.t('ui.deck.need30CardsTitle', { defaultValue: '卡组不足' }),
        message: i18n.t('ui.deck.need30Cards', { count: total, defaultValue: `卡组需要30张卡牌（当前${total}张）` }),
        type: 'warning'
      });
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

      window.app.showMessageDialog({
        title: i18n.t('ui.deck.saveSuccessTitle', { defaultValue: '保存成功' }),
        message: i18n.t('ui.deck.saveSuccess', { defaultValue: '卡组已保存' }),
        type: 'success'
      });

      // 清空当前卡组
      this.currentDeck.cards = [];
      this.currentDeck.name = '';
      this.currentDeck.id = null;
      this.saveToStorage();
      this.renderDeckSlots();
      this.updateDeckCount();
      const deckNameInput = document.getElementById('deck-name');
      if (deckNameInput) deckNameInput.value = '';
    } catch (err) {
      console.error('Failed to save deck:', err);
      window.app.showMessageDialog({
        title: i18n.t('ui.deck.saveFailedTitle', { defaultValue: '保存失败' }),
        message: i18n.t('ui.deck.saveFailed', { defaultValue: '保存卡组失败，请重试' }),
        type: 'error'
      });
    }
  }

  // 显示导入卡组代码弹窗
  showImportDialog() {
    const dialog = document.getElementById('deckcode-dialog');
    const input = document.getElementById('deckcode-input');
    const importBtn = document.getElementById('btn-deckcode-import');
    const cancelBtn = document.getElementById('btn-deckcode-cancel');

    input.value = '';
    dialog.classList.remove('hidden');

    const closeDialog = () => {
      dialog.classList.add('closing');
      setTimeout(() => {
        dialog.classList.add('hidden');
        dialog.classList.remove('closing');
      }, 200);
    };

    importBtn.onclick = () => {
      const code = input.value.trim();
      if (code) {
        this.importDeckCode(code);
      }
      closeDialog();
    };

    cancelBtn.onclick = closeDialog;

    dialog.querySelector('.confirm-dialog-overlay').onclick = closeDialog;
  }

  // 导入卡组代码
  async importDeckCode(code) {
    const deckCode = new DeckCode();
    const decoded = deckCode.decode(code);

    if (!decoded) {
      window.app.showMessageDialog({
        title: i18n.t('ui.deck.importFailedTitle', { defaultValue: '导入失败' }),
        message: i18n.t('ui.deck.invalidDeckCode', { defaultValue: '无效的卡组代码' }),
        type: 'error'
      });
      return;
    }

    // 验证职业
    if (!this.allCards.length) {
      await this.loadCards();
    }

    // 设置职业
    this.currentDeck.hero = decoded.hero;
    const heroSelect = document.getElementById('deck-hero');
    if (heroSelect) heroSelect.value = decoded.hero;

    // 清空当前卡组
    this.currentDeck.cards = [];

    // 添加卡牌
    let failedCards = 0;
    for (const cardData of decoded.cards) {
      const card = this.allCards.find(c => c.dbfId === cardData.dbfId);
      if (card && card.collectible) {
        this.currentDeck.cards.push({
          cardId: card.id,
          count: Math.min(cardData.count, card.rarity === 'LEGENDARY' ? 1 : 2)
        });
      } else {
        failedCards++;
      }
    }

    // 设置默认名称
    const heroName = this.getHeroName(decoded.hero);
    this.currentDeck.name = `${heroName}卡组`;
    const nameInput = document.getElementById('deck-name');
    if (nameInput) nameInput.value = this.currentDeck.name;

    this.saveToStorage();
    this.renderDeckSlots();
    this.updateDeckCount();
    this.autoFilterByHero();

    const message = failedCards > 0
      ? i18n.t('ui.deck.importSuccessWithFailed', { count: failedCards, defaultValue: `卡组导入成功，有 ${failedCards} 张卡牌无法识别` })
      : i18n.t('ui.deck.importSuccess', { defaultValue: '卡组导入成功' });

    window.app.showMessageDialog({
      title: i18n.t('ui.deck.importSuccessTitle', { defaultValue: '导入成功' }),
      message: message,
      type: 'success'
    });
  }

  // 显示导出卡组代码弹窗
  showExportDialog() {
    const total = this.currentDeck.cards.reduce((sum, c) => sum + c.count, 0);
    if (total === 0) {
      window.app.showMessageDialog({
        title: i18n.t('ui.deck.cannotExportTitle', { defaultValue: '无法导出' }),
        message: i18n.t('ui.deck.emptyDeckExport', { defaultValue: '卡组为空，无法生成代码' }),
        type: 'warning'
      });
      return;
    }

    const deckCode = new DeckCode();

    // 构建卡组数据
    const deckData = {
      format: 'wild',
      hero: this.currentDeck.hero,
      cards: this.currentDeck.cards.map(dc => {
        const card = this.allCards.find(c => c.id === dc.cardId);
        return {
          dbfId: card ? card.dbfId : 0,
          count: dc.count
        };
      }).filter(c => c.dbfId > 0)
    };

    const code = deckCode.encode(deckData);

    const dialog = document.getElementById('export-dialog');
    const output = document.getElementById('export-code-output');
    const copyBtn = document.getElementById('btn-export-copy');
    const closeBtn = document.getElementById('btn-export-close');

    output.value = code;
    dialog.classList.remove('hidden');

    const closeDialog = () => {
      dialog.classList.add('closing');
      setTimeout(() => {
        dialog.classList.add('hidden');
        dialog.classList.remove('closing');
      }, 200);
    };

    copyBtn.onclick = () => {
      output.select();
      document.execCommand('copy');
      window.app.showMessageDialog({
        title: i18n.t('ui.deck.copiedTitle', { defaultValue: '已复制' }),
        message: i18n.t('ui.deck.copiedMessage', { defaultValue: '卡组代码已复制到剪贴板' }),
        type: 'success'
      });
      closeDialog();
    };

    closeBtn.onclick = closeDialog;

    dialog.querySelector('.confirm-dialog-overlay').onclick = closeDialog;

    // 自动选中文本
    setTimeout(() => {
      output.select();
    }, 100);
  }
}

// Export for use in other modules
window.DeckBuilderUI = DeckBuilderUI;
