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
    // 更新菜单按钮文本等
  }

  // 初始化完成后切换到正式的菜单界面
  initComplete() {
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
    i18n.init(savedLocale);
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
        const playerClass = option.dataset.class;
        this.startGame(playerClass);
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

      deckList.innerHTML = decks.map(deck => `
        <div class="deck-item" data-id="${deck.id}">
          <button class="deck-delete-btn" data-id="${deck.id}" title="删除">&times;</button>
          <div class="deck-info-wrapper">
            <div class="deck-name">${deck.name}</div>
            <div class="deck-info">${this.getHeroName(deck.hero)} - ${deck.cardCount || 0}张</div>
          </div>
        </div>
      `).join('');

      // Add click handlers - 选择卡组
      deckList.querySelectorAll('.deck-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (e.target.classList.contains('deck-delete-btn')) return;

          // 取消之前的选择
          deckList.querySelectorAll('.deck-item').forEach(i => i.classList.remove('selected'));

          // 选中当前卡组
          item.classList.add('selected');
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
      deckList.querySelectorAll('.deck-delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (confirm(i18n.t('ui.deck.confirmDelete'))) {
            await API.deleteDeck(btn.dataset.id);
            this.loadDeckList();
          }
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
        alert(i18n.t('ui.deck.deckNotExist'));
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
      alert(i18n.t('ui.deck.loadDeckFailed'));
    }
  }

  getHeroName(hero) {
    return i18n.t(`ui.hero.${hero}`, { defaultValue: hero });
  }

  async selectDeckAndStart(deckId) {
    // Load deck and go to class selection
    try {
      const deck = await API.getDeck(deckId);
      if (!deck || !deck.hero) {
        alert(i18n.t('ui.deck.deckNotExist'));
        return;
      }

      this.showScreen('classSelect');

      // Update class selection to use the deck's hero
      document.querySelectorAll('.class-option').forEach(option => {
        option.style.display = option.dataset.class === deck.hero ? 'flex' : 'none';
      });
    } catch (err) {
      console.error('Failed to load deck:', err);
      alert(i18n.t('ui.deck.loadDeckFailed'));
    }
  }

  async startGame(playerClass) {
    try {
      // Initialize i18n with saved locale
      const savedLocale = localStorage.getItem('locale') || 'zh';
      await i18n.init(savedLocale);

      // Initialize game UI if not exists
      if (!this.gameUI) {
        this.gameUI = new GameUI();
      }

      await this.gameUI.startGame(playerClass);
      this.showScreen('game');
    } catch (err) {
      console.error('Failed to start game:', err);
      alert(i18n.t('ui.deck.loadFailed'));
    }
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
