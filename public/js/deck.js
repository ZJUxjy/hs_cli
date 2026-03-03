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
    modal.querySelector('.card-detail-name').textContent = card.name || '未知';
    modal.querySelector('.card-detail-type').textContent = this.getTypeName(card.type);

    // 处理卡牌描述
    let text = card.text || '';
    // 替换卡牌描述中的符号
    text = text.replace(/\$/g, '').replace(/\[x\]/g, '');
    text = text.replace(/@/g, ' <span style="color:#f0c040">[]</span> ');
    modal.querySelector('.card-detail-text').innerHTML = text || '无描述';

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
    const names = {
      'BATTLECRY': '战吼',
      'DEATHRATTLE': '亡语',
      'CHARGE': '冲锋',
      'TAUNT': '嘲讽',
      'WINDFURY': '风怒',
      'DIVINE_SHIELD': '圣盾',
      'STEALTH': '潜行',
      'POISONOUS': '剧毒',
      'LIFESTEAL': '生命偷取',
      'OVERLOAD': '过载',
      'COMBO': '连击',
      'INSPIRE': '激励',
      'SECRET': '奥秘',
      'FROZEN': '冰冻',
      'FREEZE': '冻结',
      'DISCOVER': '发现',
      'CHOOSE_ONE': '抉择',
      'QUEST': '任务',
      'RECRUIT': '招募',
      'START_OF_GAME': '游戏开始',
      'DEATHRATTLE': '亡语',
      'ECHO': '回响',
      'OUTCAST': '异变',
      'SPELLPOWER': '法术伤害',
      'AURA': '光环',
      'ADJACENT_BUFF': '相邻加成',
      'ENRAGE': '激怒',
      'INSPIRE': '激励',
      'RITUAL': '仪式'
    };
    return names[mechanic] || mechanic;
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
    const names = {
      'COMMON': '普通',
      'RARE': '稀有',
      'EPIC': '史诗',
      'LEGENDARY': '传说'
    };
    return names[rarity] || rarity;
  }

  getSetName(set) {
    const names = {
      'CORE': '核心',
      'EXPERT1': '专家',
      'TGT': '探险者',
      'LOE': '探险者协会',
      'MISSIONS': '冒险',
      'HERO_SKINS': '皮肤',
      'UNGORO': '安戈洛',
      'ICECROWN': '冰封王座',
      'LOOTAPALOOZA': '狗头人',
      'GILNEAS': '女巫森林',
      'BOOMSDAY': '砰砰计划',
      'RUMBLE': '拉斯塔哈',
      'DALARAN': '暗影崛起',
      'ULDUM': '奥丹姆',
      'DRAGONS': '巨龙降临',
      'SCHOLOMANCE': '通灵学园',
      'DARKMOON_FAIRE': '暗月马戏团',
      'THE_BARRENS': '贫瘠之地',
      'STORMWIND': '暴风城',
      'ALTERAC_VALLEY': '奥特兰克',
      'RETURNING': '回归',
      'LEGACY': '经典',
      'WILD': '狂野'
    };
    return names[set] || set;
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
      alert('卡组已满（30张）');
      return;
    }

    // Find card
    const card = this.allCards.find(c => c.id === cardId);
    if (!card) return;

    // Check card class (only allow hero's class + neutral)
    const heroClass = this.currentDeck.hero.toUpperCase();
    const cardClass = (card.cardClass || 'NEUTRAL').toUpperCase();
    if (cardClass !== heroClass && cardClass !== 'NEUTRAL') {
      alert(`这张卡是${this.getClassName(cardClass)}职业卡，只能放入${this.getClassName(heroClass)}卡组`);
      return;
    }

    // Check card copy limit
    const existing = this.currentDeck.cards.find(c => c.cardId === cardId);
    const maxCopies = (card.rarity === 'LEGENDARY' || card.rarity === 'EPIC') ? 1 : 2;

    if (existing) {
      if (existing.count >= maxCopies) {
        alert(`${maxCopies === 1 ? '传说/史诗卡' : '普通/稀有卡'}最多只能有${maxCopies}张`);
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
    const names = {
      'MAGE': '法师',
      'WARRIOR': '战士',
      'HUNTER': '猎人',
      'DRUID': '德鲁伊',
      'ROGUE': '盗贼',
      'PRIEST': '牧师',
      'PALADIN': '圣骑士',
      'SHAMAN': '萨满',
      'WARLOCK': '术士',
      'DEMONHUNTER': '恶魔猎手',
      'DEATHKNIGHT': '死亡骑士',
      'NEUTRAL': '中立'
    };
    return names[cardClass] || cardClass;
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
