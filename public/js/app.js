// public/js/app.js - Main Application Controller

// Client-side i18n
const i18n = {
  locale: 'zh',
  translations: {},

  async init(locale = 'zh') {
    this.locale = locale;
    await this.loadTranslations(locale);
  },

  async loadTranslations(locale) {
    // Try to load from server
    try {
      const res = await fetch(`/i18n/locales/${locale}.json`);
      if (res.ok) {
        this.translations = await res.json();
      }
    } catch (e) {
      console.warn('Failed to load translations, using empty object');
    }
  },

  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return defaultValue if provided, otherwise return key
        return params.defaultValue !== undefined ? params.defaultValue : key;
      }
    }

    if (typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match;
      });
    }
    return params.defaultValue !== undefined ? params.defaultValue : key;
  }
};

// Export for use in other modules
window.i18n = i18n;

class App {
  constructor() {
    this.currentScreen = 'menu';
    this.screens = {
      menu: document.getElementById('menu-screen'),
      menuInitial: document.getElementById('menu-screen-initial'),
      deckSelect: document.getElementById('deck-select-screen'),
      deckBuilder: document.getElementById('deck-builder-screen'),
      classSelect: document.getElementById('class-select-screen'),
      game: document.getElementById('game-screen')
    };

    // Sub-modules
    this.deckBuilder = null;
    this.gameUI = null;

    this.initLanguageSelector();
    this.init();
  }

  initLanguageSelector() {
    // 处理初始菜单的语言选择器
    const initialSelector = document.getElementById('language-select-initial');
    if (initialSelector) {
      // 从 localStorage 读取保存的语言
      const savedLocale = localStorage.getItem('locale') || 'zh';
      initialSelector.value = savedLocale;

      // 绑定 change 事件
      initialSelector.onchange = (e) => {
        const locale = e.target.value;
        localStorage.setItem('locale', locale);
      };
    }

    // 处理正式菜单的语言选择器
    const selector = document.getElementById('language-select');
    if (selector) {
      // 从 localStorage 读取保存的语言
      const savedLocale = localStorage.getItem('locale') || 'zh';
      selector.value = savedLocale;

      // 绑定 change 事件
      selector.onchange = async (e) => {
        const locale = e.target.value;
        localStorage.setItem('locale', locale);
        await i18n.init(locale);
        // 刷新当前屏幕
        this.refreshCurrentScreen();
      };
    }
  }

  refreshCurrentScreen() {
    const current = this.currentScreen;
    if (current === 'game' && this.gameUI) {
      this.gameUI.render();
    } else if (current === 'deckBuilder' && this.deckBuilder) {
      this.deckBuilder.render();
    } else if (current === 'deckSelect') {
      this.loadDeckList();
    }
    // 更新所有静态文本
    this.updateStaticText();
  }

  // 更新所有静态文本
  updateStaticText() {
    // 更新主菜单按钮
    const newGameBtn = document.querySelector('#btn-new-game span');
    if (newGameBtn) newGameBtn.textContent = i18n.t('ui.menu.start', { defaultValue: '新游戏' });

    const deckBuilderBtn = document.querySelector('#btn-deck-builder span');
    if (deckBuilderBtn) deckBuilderBtn.textContent = i18n.t('ui.menu.deckBuilder', { defaultValue: '卡组构建' });

    const deckListBtn = document.querySelector('#btn-deck-list span');
    if (deckListBtn) deckListBtn.textContent = i18n.t('ui.deck.myDecks', { defaultValue: '我的卡组' });

    // 更新初始菜单按钮
    const startInitialBtn = document.querySelector('#btn-start-initial span');
    if (startInitialBtn) startInitialBtn.textContent = i18n.t('ui.menu.start', { defaultValue: '开始游戏' });

    const deckInitialBtn = document.querySelector('#btn-deck-initial span');
    if (deckInitialBtn) deckInitialBtn.textContent = i18n.t('ui.menu.deckBuilder', { defaultValue: '卡组构建' });

    // 更新语言标签
    const langLabels = document.querySelectorAll('label[for^="language-select"]');
    langLabels.forEach(label => label.textContent = i18n.t('ui.settings.language', { defaultValue: '语言' }));

    // 更新卡组选择界面
    const backBtn = document.querySelector('#btn-back-to-menu span');
    if (backBtn) backBtn.textContent = i18n.t('ui.button.back', { defaultValue: '返回' });

    const startGameBtn = document.querySelector('#btn-start-game .btn-text');
    if (startGameBtn) startGameBtn.textContent = i18n.t('ui.menu.start', { defaultValue: '开始游戏' });

    // 更新卡组构建界面
    const backFromBuilderBtn = document.getElementById('btn-back-from-builder');
    if (backFromBuilderBtn) backFromBuilderBtn.textContent = i18n.t('ui.button.back', { defaultValue: '返回' });

    const deckNameInput = document.getElementById('deck-name');
    if (deckNameInput) deckNameInput.placeholder = i18n.t('ui.deck.deckName', { defaultValue: '卡组名称' });

    const cardSearchInput = document.getElementById('card-search');
    if (cardSearchInput) cardSearchInput.placeholder = i18n.t('ui.deck.searchCards', { defaultValue: '搜索卡牌...' });

    // 更新游戏界面
    const endTurnBtn = document.getElementById('btn-end-turn');
    if (endTurnBtn && this.gameUI) {
      endTurnBtn.textContent = this.gameUI.isPlayerTurn ? i18n.t('ui.game.endTurn', { defaultValue: '结束回合' }) : i18n.t('ui.game.enemyTurn', { defaultValue: '对手回合' });
    }

    // 更新所有标题
    const deckSelectTitle = document.querySelector('.deck-select-title');
    if (deckSelectTitle) deckSelectTitle.textContent = i18n.t('ui.deck.myDecks', { defaultValue: '我的卡组' });

    const builderTitle = document.querySelector('#deck-builder-screen h2');
    if (builderTitle) builderTitle.textContent = i18n.t('ui.menu.deckBuilder', { defaultValue: '卡组构建' });
  }

  // 初始化完成后切换到正式的菜单界面
  async initComplete() {
    if (this.screens.menuInitial) {
      this.screens.menuInitial.classList.add('hidden');
    }
    if (this.screens.menu) {
      this.screens.menu.classList.remove('hidden');
    }
    // 同步语言选择器的值
    const initialSelector = document.getElementById('language-select-initial');
    const selector = document.getElementById('language-select');
    if (initialSelector && selector) {
      selector.value = initialSelector.value;
    }
    // 初始化 i18n
    const savedLocale = localStorage.getItem('locale') || 'zh';
    await i18n.init(savedLocale);
    // 更新静态文本
    this.updateStaticText();
  }

  init() {
    // Main menu buttons
    document.getElementById('btn-new-game').addEventListener('click', () => {
      this.showScreen('deckSelect');
      this.loadDeckList();
    });

    document.getElementById('btn-deck-builder').addEventListener('click', () => {
      this.showScreen('deckBuilder');
      if (window.deckBuilder) {
        window.deckBuilder.init();
      }
    });

    document.getElementById('btn-deck-list').addEventListener('click', () => {
      this.showScreen('deckSelect');
      this.loadDeckList();
    });

    // Back buttons
    document.getElementById('btn-back-from-deck-select').addEventListener('click', () => {
      this.showScreen('menu');
    });

    // 开始游戏按钮
    document.getElementById('btn-start-game').addEventListener('click', () => {
      if (this.selectedDeckId) {
        this.selectDeckAndStart(this.selectedDeckId);
      }
    });

    document.getElementById('btn-back-from-builder').addEventListener('click', () => {
      this.showScreen('menu');
    });

    document.getElementById('btn-back-from-class').addEventListener('click', () => {
      this.showScreen('deckSelect');
    });

    // Class selection
    document.querySelectorAll('.class-option').forEach(option => {
      option.addEventListener('click', () => {
        const opponentClass = option.dataset.class;

        // Remove selection from all options
        document.querySelectorAll('.class-option').forEach(opt => {
          opt.classList.remove('selected');
        });

        // Add selection to clicked option
        option.classList.add('selected');

        // Add a small delay for visual feedback before starting game
        setTimeout(() => {
          this.startGame(opponentClass);
        }, 400);
      });
    });

    // 初始菜单按钮事件
    const btnStartInitial = document.getElementById('btn-start-initial');
    if (btnStartInitial) {
      btnStartInitial.addEventListener('click', () => {
        this.initComplete();
        this.showScreen('deckSelect');
        this.loadDeckList();
      });
    }

    const btnDeckInitial = document.getElementById('btn-deck-initial');
    if (btnDeckInitial) {
      btnDeckInitial.addEventListener('click', () => {
        this.initComplete();
        this.showScreen('deckBuilder');
        if (window.deckBuilder) {
          window.deckBuilder.init();
        }
      });
    }
  }

  showScreen(screenName) {
    // Hide all screens
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.classList.add('hidden');
    });

    // Show the target screen
    const targetScreen = this.screens[screenName];
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
    }

    this.currentScreen = screenName;
  }

  async loadDeckList() {
    const deckList = document.getElementById('deck-list');
    const startBtn = document.getElementById('btn-start-game');
    this.selectedDeckId = null;

    try {
      const decks = await API.getDecks();

      if (!decks || decks.length === 0) {
        deckList.innerHTML = `<p style="text-align: center; color: #aaa;">${i18n.t('ui.deck.noDeck')}</p>`;
        return;
      }

      // 职业图标映射
      const heroIcons = {
        mage: '<svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4l7 14H5l7-14z"/></svg>',
        warrior: '<svg viewBox="0 0 24 24"><path d="M12 2l-9 4v6c0 5 4 9 9 12 5-3 9-7 9-12V6l-9-4z"/></svg>',
        hunter: '<svg viewBox="0 0 24 24"><path d="M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2zm0 18c-4 0-8-4-8-8s4-8 8-8 8 4 8 8-4 8-8 8z"/><circle cx="12" cy="12" r="3"/></svg>',
        druid: '<svg viewBox="0 0 24 24"><path d="M12 2L4 6v4c0 5 3 9 8 12 5-3 8-7 8-12V6l-8-4z"/></svg>',
        rogue: '<svg viewBox="0 0 24 24"><path d="M12 2L2 12l10 10 10-10L12 2zm0 4l6 6-6 6-6-6 6-6z"/></svg>',
        priest: '<svg viewBox="0 0 24 24"><path d="M12 2v20M6 8l6-4 6 4M6 16l6 4 6-4" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
        paladin: '<svg viewBox="0 0 24 24"><path d="M12 2L4 6v6c0 5 3 9 8 12 5-3 8-7 8-12V6l-8-4z"/><path d="M12 6l-4 2v4c0 3 2 6 4 8 2-2 4-5 4-8V8l-4-2z"/></svg>',
        shaman: '<svg viewBox="0 0 24 24"><path d="M12 2L4 22h16L12 2zm0 6l4 10H8l4-10z"/></svg>',
        warlock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',
        demonhunter: '<svg viewBox="0 0 24 24"><path d="M12 2L4 12l8 10 8-10L12 2zm0 4l4 6-4 6-4-6 4-6z"/><path d="M2 12h20"/></svg>',
        deathknight: '<svg viewBox="0 0 24 24"><path d="M12 2L4 8v8l8 6 8-6V8l-8-4z"/><path d="M12 6l-4 4v4l4 3 4-3v-4l-4-4z"/></svg>'
      };

      // 职业颜色映射
      const heroColors = {
        mage: '#4a90d9',
        warrior: '#d9a74a',
        hunter: '#4ad94a',
        druid: '#d94a4a',
        rogue: '#d94ad9',
        priest: '#ffffff',
        paladin: '#f0c040',
        shaman: '#4a4ad9',
        warlock: '#6a2a8a',
        demonhunter: '#ff6b6b',
        deathknight: '#4ad9d9'
      };

      deckList.innerHTML = decks.map((deck, index) => {
        const heroName = this.getHeroName(deck.hero);
        const heroIcon = heroIcons[deck.hero] || heroIcons.mage;
        const heroColor = heroColors[deck.hero] || '#4a90d9';
        const cardCount = deck.cardCount || 0;
        const isComplete = cardCount === 30;

        return `
        <div class="deck-card" data-id="${deck.id}" data-hero="${deck.hero}" style="--hero-color: ${heroColor}; animation-delay: ${index * 0.1}s;">
          <div class="deck-card-glow"></div>
          <div class="deck-card-border"></div>
          <button class="deck-card-delete" data-id="${deck.id}" title="删除">
            <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          </button>
          <div class="deck-card-content">
            <div class="deck-card-icon" style="background: linear-gradient(135deg, ${heroColor} 0%, ${this.darkenColor(heroColor, 30)} 100%);">
              ${heroIcon}
            </div>
            <div class="deck-card-info">
              <div class="deck-card-name">${deck.name}</div>
              <div class="deck-card-hero">${heroName}</div>
              <div class="deck-card-stats">
                <span class="card-count ${isComplete ? 'complete' : ''}">
                  <span class="count-number">${cardCount}</span>
                  <span class="count-total">/30</span>
                </span>
                <span class="cards-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <rect x="4" y="4" width="16" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 2v4M16 2v4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  ${i18n.t('card.cards', { defaultValue: '卡牌' })}
                </span>
              </div>
            </div>
          </div>
          <div class="deck-card-shine"></div>
          ${isComplete ? `<div class="deck-card-ready">${i18n.t('ui.deck.ready', { defaultValue: '就绪' })}</div>` : `<div class="deck-card-incomplete">${i18n.t('ui.deck.incomplete', { defaultValue: '未完成' })}</div>`}
        </div>
      `}).join('');

      // Add click handlers - 选择卡组
      deckList.querySelectorAll('.deck-card').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.closest('.deck-card-delete')) return;

          // 取消之前的选择
          deckList.querySelectorAll('.deck-card').forEach(i => {
            i.classList.remove('selected');
            const glow = i.querySelector('.deck-card-glow');
            if (glow) glow.style.opacity = '0';
          });

          // 选中当前卡组
          item.classList.add('selected');
          const glow = item.querySelector('.deck-card-glow');
          if (glow) glow.style.opacity = '1';
          this.selectedDeckId = item.dataset.id;

          // 启用开始游戏按钮
          if (startBtn) {
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            startBtn.style.cursor = 'pointer';
          }
        });
      });

      // 删除
      deckList.querySelectorAll('.deck-card-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const deckId = btn.dataset.id;
          const deckCard = btn.closest('.deck-card');
          const deckName = deckCard?.querySelector('.deck-card-name')?.textContent || '未命名卡组';

          this.showConfirmDialog({
            title: i18n.t('ui.deck.confirmDeleteTitle', { defaultValue: '确认删除' }),
            message: i18n.t('ui.deck.confirmDeleteMessage', { defaultValue: '确定要删除卡组吗？此操作无法撤销。' }),
            deckName: deckName,
            confirmText: i18n.t('ui.deck.delete', { defaultValue: '删除' }),
            cancelText: i18n.t('ui.deck.cancel', { defaultValue: '取消' }),
            onConfirm: async () => {
              await API.deleteDeck(deckId);
              this.loadDeckList();
            }
          });
        });
      });

      // 禁用开始游戏按钮
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        startBtn.style.cursor = 'not-allowed';
      }
    } catch (err) {
      console.error('Failed to load decks:', err);
      deckList.innerHTML = `<p style="text-align: center; color: #d94a4a;">${i18n.t('ui.deck.loadFailed')}</p>`;
    }
  }

  async loadDeckToBuilder(deckId) {
    try {
      const deck = await API.getDeck(deckId);
      if (!deck) {
        window.app.showMessageDialog({
          title: i18n.t('ui.deck.deckNotExistTitle', { defaultValue: '卡组不存在' }),
          message: i18n.t('ui.deck.deckNotExist', { defaultValue: '卡组不存在' }),
          type: 'error'
        });
        return;
      }

      // Load deck into builder
      if (window.deckBuilder) {
        window.deckBuilder.currentDeck = {
          id: deck.id,
          name: deck.name,
          hero: deck.hero,
          cards: deck.cards.map(c => ({ cardId: c.id, count: c.count }))
        };
        window.deckBuilder.saveToStorage();
        window.deckBuilder.init();

        // Set form values
        document.getElementById('deck-name').value = deck.name;
        document.getElementById('deck-hero').value = deck.hero;

        // Show deck builder
        this.showScreen('deckBuilder');
      }
    } catch (err) {
      console.error('Failed to load deck:', err);
      if (window.app) {
        window.app.showMessageDialog({
          title: i18n.t('ui.deck.loadFailedTitle', { defaultValue: '加载失败' }),
          message: i18n.t('ui.deck.loadFailed', { defaultValue: '加载失败' }),
          type: 'error'
        });
      }
    }
  }

  getHeroName(hero) {
    return i18n.t(`ui.hero.${hero}`, { defaultValue: hero });
  }

  async selectDeckAndStart(deckId) {
    // Load deck and go to class selection for opponent
    try {
      const deck = await API.getDeck(deckId);
      if (!deck || !deck.hero) {
        window.app.showMessageDialog({
          title: i18n.t('ui.deck.deckNotExistTitle', { defaultValue: '卡组不存在' }),
          message: i18n.t('ui.deck.deckNotExist', { defaultValue: '卡组不存在' }),
          type: 'error'
        });
        return;
      }

      // Store the selected deck for game start
      this.selectedDeck = deck;
      this.showScreen('classSelect');

      // Show all classes for opponent selection
      document.querySelectorAll('.class-option').forEach(option => {
        option.style.display = 'flex';
        option.classList.remove('selected');
      });
    } catch (err) {
      console.error('Failed to load deck:', err);
      if (window.app) {
        window.app.showMessageDialog({
          title: i18n.t('ui.deck.loadFailedTitle', { defaultValue: '加载失败' }),
          message: i18n.t('ui.deck.loadFailed', { defaultValue: '加载失败' }),
          type: 'error'
        });
      }
    }
  }

  async startGame(opponentClass) {
    try {
      // Initialize i18n with saved locale
      const savedLocale = localStorage.getItem('locale') || 'zh';
      await i18n.init(savedLocale);

      // Initialize game UI if not exists
      if (!this.gameUI) {
        this.gameUI = new GameUI();
      }

      // Start game with deck's hero as player and selected class as opponent
      const playerClass = this.selectedDeck?.hero || opponentClass;
      await this.gameUI.startGame(playerClass, opponentClass);
      this.showScreen('game');
    } catch (err) {
      console.error('Failed to start game:', err);
      alert(i18n.t('ui.deck.loadFailed'));
    }
  }

  // 颜色变暗辅助函数
  darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  showMessage(message) {
    // Remove existing message
    const existing = document.querySelector('.game-message');
    if (existing) existing.remove();

    // Create new message
    const msgEl = document.createElement('div');
    msgEl.className = 'game-message';
    msgEl.textContent = message;
    document.body.appendChild(msgEl);

    // Auto remove after animation
    setTimeout(() => {
      msgEl.remove();
    }, 3000);
  }

  // 显示消息弹窗（替代 alert）
  showMessageDialog({ title, message, type = 'info', onClose }) {
    const dialog = document.getElementById('message-dialog');
    const content = dialog.querySelector('.message-dialog-content');
    const titleEl = document.getElementById('message-title');
    const textEl = document.getElementById('message-text');
    const iconEl = document.getElementById('message-icon');
    const okBtn = document.getElementById('btn-message-ok');

    // 设置类型样式
    content.className = 'message-dialog-content' + (type ? ` ${type}` : '');

    // 设置图标
    const icons = {
      info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>',
      success: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>',
      error: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>',
      warning: '<path d="M12 2L2 22h20L12 2zm0 3.5L18.5 19h-13L12 5.5zM11 10v6h2v-6h-2z" fill="currentColor"/>'
    };
    iconEl.innerHTML = `<svg viewBox="0 0 24 24" width="48" height="48">${icons[type] || icons.info}</svg>`;

    // 设置内容
    if (titleEl) titleEl.textContent = title || '提示';
    if (textEl) textEl.textContent = message;

    // 显示弹窗
    dialog.classList.remove('hidden');

    // 清理之前的事件监听器
    const newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);

    // 绑定新的事件
    const closeDialog = () => {
      dialog.classList.add('closing');
      setTimeout(() => {
        dialog.classList.add('hidden');
        dialog.classList.remove('closing');
        if (onClose) onClose();
      }, 200);
    };

    newOkBtn.addEventListener('click', closeDialog);

    // 点击遮罩关闭
    dialog.querySelector('.message-dialog-overlay').addEventListener('click', closeDialog);

    // ESC键关闭
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeDialog();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // 显示通用确认弹窗（替代 confirm）
  showGenericConfirm({ title, message, confirmText = '确定', cancelText = '取消', type = 'info', onConfirm, onCancel }) {
    const dialog = document.getElementById('generic-confirm-dialog');
    const titleEl = document.getElementById('generic-confirm-title');
    const messageEl = document.getElementById('generic-confirm-message');
    const iconEl = document.getElementById('generic-confirm-icon');
    const confirmBtn = document.getElementById('btn-generic-confirm-ok');
    const cancelBtn = document.getElementById('btn-generic-confirm-cancel');

    // 设置图标
    const icons = {
      info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>',
      warning: '<path d="M12 2L2 22h20L12 2zm0 3.5L18.5 19h-13L12 5.5zM11 10v6h2v-6h-2z" fill="currentColor"/>',
      question: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="currentColor"/>'
    };
    iconEl.innerHTML = `<svg viewBox="0 0 24 24" width="48" height="48">${icons[type] || icons.info}</svg>`;

    // 设置颜色
    const colors = {
      info: 'var(--accent-gold)',
      warning: '#f0a040',
      question: 'var(--mana-blue)'
    };
    iconEl.style.color = colors[type] || colors.info;

    // 设置内容
    if (titleEl) titleEl.textContent = title || '确认';
    if (messageEl) messageEl.textContent = message;
    if (confirmBtn) confirmBtn.textContent = confirmText;
    if (cancelBtn) cancelBtn.textContent = cancelText;

    // 显示弹窗
    dialog.classList.remove('hidden');

    // 清理之前的事件监听器
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    // 绑定新的事件
    const closeDialog = () => {
      dialog.classList.add('closing');
      setTimeout(() => {
        dialog.classList.add('hidden');
        dialog.classList.remove('closing');
      }, 200);
    };

    newConfirmBtn.addEventListener('click', () => {
      closeDialog();
      if (onConfirm) onConfirm();
    });

    newCancelBtn.addEventListener('click', () => {
      closeDialog();
      if (onCancel) onCancel();
    });

    // 点击遮罩关闭
    dialog.querySelector('.confirm-dialog-overlay').addEventListener('click', () => {
      closeDialog();
      if (onCancel) onCancel();
    });

    // ESC键关闭
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeDialog();
        if (onCancel) onCancel();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // 显示确认删除弹窗
  showConfirmDialog({ title, message, deckName, confirmText, cancelText, onConfirm }) {
    const dialog = document.getElementById('confirm-dialog');
    const titleEl = dialog.querySelector('.confirm-dialog-title');
    const messageEl = dialog.querySelector('.confirm-dialog-message');
    const deckNameEl = document.getElementById('confirm-deck-name');
    const confirmBtn = document.getElementById('btn-confirm-delete');
    const cancelBtn = document.getElementById('btn-confirm-cancel');

    // 设置内容
    if (titleEl) titleEl.textContent = title;
    if (messageEl) {
      // 如果message包含HTML，使用innerHTML
      if (message.includes('<')) {
        messageEl.innerHTML = message;
      } else {
        messageEl.textContent = message;
      }
    }
    if (deckNameEl) deckNameEl.textContent = deckName;
    if (confirmBtn) confirmBtn.textContent = confirmText;
    if (cancelBtn) cancelBtn.textContent = cancelText;

    // 显示弹窗
    dialog.classList.remove('hidden');

    // 清理之前的事件监听器
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    // 绑定新的事件
    const closeDialog = () => {
      dialog.classList.add('closing');
      setTimeout(() => {
        dialog.classList.add('hidden');
        dialog.classList.remove('closing');
      }, 200);
    };

    newConfirmBtn.addEventListener('click', () => {
      closeDialog();
      if (onConfirm) onConfirm();
    });

    newCancelBtn.addEventListener('click', closeDialog);

    // 点击遮罩关闭
    dialog.querySelector('.confirm-dialog-overlay').addEventListener('click', closeDialog);

    // ESC键关闭
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeDialog();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }
}

// Magic particles initialization
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  // Clear existing particles
  container.innerHTML = '';

  // Create 20 random particles
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (8 + Math.random() * 4) + 's';

    // Random size variation
    const size = 3 + Math.random() * 3;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    container.appendChild(particle);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();

  // Initialize deck builder
  window.deckBuilder = new DeckBuilderUI();

  // Initialize magic particles
  initParticles();
});

// Export for use in other modules
window.App = App;
