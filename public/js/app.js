// public/js/app.js - Main Application Controller
class App {
  constructor() {
    this.currentScreen = 'menu';
    this.screens = {
      menu: document.getElementById('menu-screen'),
      deckSelect: document.getElementById('deck-select-screen'),
      deckBuilder: document.getElementById('deck-builder-screen'),
      classSelect: document.getElementById('class-select-screen'),
      game: document.getElementById('game-screen')
    };

    // Sub-modules
    this.deckBuilder = null;
    this.gameUI = null;

    this.init();
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
    try {
      const decks = await API.getDecks();

      if (!decks || decks.length === 0) {
        deckList.innerHTML = '<p style="text-align: center; color: #aaa;">暂无卡组，请先创建卡组</p>';
        return;
      }

      deckList.innerHTML = decks.map(deck => `
        <div class="deck-item" data-id="${deck.id}">
          <div class="deck-name">${deck.name}</div>
          <div class="deck-info">${this.getHeroName(deck.hero)} - ${deck.cardCount || 0}张</div>
        </div>
      `).join('');

      // Add click handlers
      deckList.querySelectorAll('.deck-item').forEach(item => {
        item.addEventListener('click', () => {
          const deckId = item.dataset.id;
          this.selectDeckAndStart(deckId);
        });
      });
    } catch (err) {
      console.error('Failed to load decks:', err);
      deckList.innerHTML = '<p style="text-align: center; color: #d94a4a;">加载卡组失败</p>';
    }
  }

  getHeroName(hero) {
    const heroNames = {
      mage: '法师',
      warrior: '战士',
      hunter: '猎人',
      druid: '德鲁伊',
      rogue: '盗贼',
      priest: '牧师',
      paladin: '圣骑士',
      shaman: '萨满',
      warlock: '术士'
    };
    return heroNames[hero] || hero;
  }

  async selectDeckAndStart(deckId) {
    // Load deck and go to class selection
    try {
      const deck = await API.getDeck(deckId);
      if (!deck || !deck.hero) {
        alert('卡组无效');
        return;
      }

      this.showScreen('classSelect');

      // Update class selection to use the deck's hero
      document.querySelectorAll('.class-option').forEach(option => {
        option.style.display = option.dataset.class === deck.hero ? 'flex' : 'none';
      });
    } catch (err) {
      console.error('Failed to load deck:', err);
      alert('加载卡组失败');
    }
  }

  async startGame(playerClass) {
    try {
      // Initialize game UI if not exists
      if (!this.gameUI) {
        this.gameUI = new GameUI();
      }

      await this.gameUI.startGame(playerClass);
      this.showScreen('game');
    } catch (err) {
      console.error('Failed to start game:', err);
      alert('开始游戏失败');
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();

  // Initialize deck builder
  window.deckBuilder = new DeckBuilderUI();
});

// Export for use in other modules
window.App = App;
