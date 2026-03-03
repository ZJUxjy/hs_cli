// public/js/game.js - Game UI Controller
class GameUI {
  constructor() {
    this.gameState = null;
    this.selectedCardIndex = null;
    this.selectedMinionIndex = null;
    this.isPlayerTurn = true;
  }

  async startGame(playerClass, opponentClass = 'warrior') {
    try {
      this.gameState = await API.startGame(playerClass, opponentClass);
      this.isPlayerTurn = true;
      this.selectedCardIndex = null;
      this.selectedMinionIndex = null;
      this.render();
      this.bindEvents();
      this.showMessage('游戏开始！');
    } catch (err) {
      console.error('Failed to start game:', err);
      alert('开始游戏失败');
    }
  }

  bindEvents() {
    // End turn button
    const endTurnBtn = document.getElementById('btn-end-turn');
    if (endTurnBtn) {
      endTurnBtn.onclick = () => this.endTurn();
    }

    // Concede button
    const concedeBtn = document.getElementById('btn-concede');
    if (concedeBtn) {
      concedeBtn.onclick = () => this.concede();
    }

    // Hero power button
    const heroPowerBtn = document.getElementById('btn-use-hero-power');
    if (heroPowerBtn) {
      heroPowerBtn.onclick = () => this.useHeroPower();
    }

    // Player hand click
    const playerHand = document.getElementById('player-hand');
    if (playerHand) {
      playerHand.onclick = (e) => {
        const cardEl = e.target.closest('.card');
        if (cardEl) {
          const index = parseInt(cardEl.dataset.index);
          this.selectCard(index);
        }
      };
    }

    // Player field click
    const playerField = document.getElementById('player-field');
    if (playerField) {
      playerField.onclick = (e) => {
        const minionEl = e.target.closest('.minion');
        if (minionEl) {
          const index = parseInt(minionEl.dataset.index);
          this.selectMinion(index);
        }
      };
    }

    // Enemy field click
    const enemyField = document.getElementById('enemy-field');
    if (enemyField) {
      enemyField.onclick = (e) => {
        const minionEl = e.target.closest('.minion');
        if (minionEl && this.selectedMinionIndex !== null) {
          const index = parseInt(minionEl.dataset.index);
          this.attackMinion(index);
        }
      };
    }

    // Enemy hero click
    const enemyHero = document.getElementById('enemy-hero');
    if (enemyHero) {
      enemyHero.onclick = () => {
        if (this.selectedMinionIndex !== null) {
          this.attackHero();
        }
      };
    }

    // Right click to cancel selection
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.clearSelection();
    });
  }

  render() {
    if (!this.gameState) return;

    this.renderGameInfo();
    this.renderEnemyHero();
    this.renderEnemyField();
    this.renderPlayerField();
    this.renderPlayerHero();
    this.renderPlayerHand();
    this.updateControls();
  }

  renderGameInfo() {
    const turnEl = document.getElementById('turn-indicator');
    if (turnEl) {
      turnEl.textContent = `回合 ${this.gameState.turn || 1}`;
    }

    const manaEl = document.getElementById('player-mana');
    if (manaEl) {
      const player = this.gameState.player;
      manaEl.textContent = `法力: ${player.mana}/${player.maxMana}`;
    }
  }

  renderEnemyHero() {
    const enemy = this.gameState.ai;
    const heroEl = document.getElementById('enemy-hero');

    if (heroEl) {
      const healthEl = heroEl.querySelector('.health');
      const armorEl = heroEl.querySelector('.armor');
      const handCountEl = heroEl.querySelector('.hand-count');

      if (healthEl) healthEl.textContent = enemy.health;
      if (armorEl) armorEl.textContent = `+${enemy.armor}`;
      if (handCountEl) handCountEl.textContent = `手牌: ${enemy.handCount || enemy.hand?.length || 0}`;
    }
  }

  renderEnemyField() {
    const field = document.getElementById('enemy-field');
    if (!field) return;

    const enemies = this.gameState.ai.field || [];

    field.innerHTML = enemies.map((minion, i) => `
      <div class="minion enemy" data-index="${i}">
        ${minion.taunt ? '<div class="mechanics"><span class="mechanic-icon taunt-icon">T</span></div>' : ''}
        <div class="minion-name">${minion.name}</div>
        <div class="minion-stats">
          <span class="minion-attack">${minion.attack}</span>
          <span class="minion-health">${minion.health}</span>
        </div>
      </div>
    `).join('');
  }

  renderPlayerField() {
    const field = document.getElementById('player-field');
    if (!field) return;

    const player = this.gameState.player;
    const minions = player.field || [];

    field.innerHTML = minions.map((minion, i) => {
      const canAttack = minion.canAttack !== false && this.isPlayerTurn;
      return `
        <div class="minion ${canAttack ? 'can-attack' : ''} ${this.selectedMinionIndex === i ? 'selected' : ''}"
             data-index="${i}">
          ${minion.taunt ? '<span class="minion-taunt"></span>' : ''}
          ${minion.charge ? '<span class="mechanic-icon charge-icon">C</span>' : ''}
          ${minion.divineShield ? '<span class="mechanic-icon divine-shield-icon">D</span>' : ''}
          ${minion.lifesteal ? '<span class="mechanic-icon lifesteal-icon">L</span>' : ''}
          ${minion.windfury ? '<span class="mechanic-icon windfury-icon">W</span>' : ''}
          ${minion.stealth ? '<span class="mechanic-icon stealth-icon">S</span>' : ''}
          ${minion.poisonous ? '<span class="mechanic-icon poisonous-icon">P</span>' : ''}
          <div class="minion-name">${minion.name}</div>
          <div class="minion-stats">
            <span class="minion-attack">${minion.attack}</span>
            <span class="minion-health">${minion.health}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  renderPlayerHero() {
    const player = this.gameState.player;
    const heroEl = document.getElementById(' if (heroElplayer-hero');

   ) {
      const healthEl = heroEl.querySelector('.health');
      const armorEl = heroEl.querySelector('.armor');

      if (healthEl) healthEl.textContent = player.health;
      if (armorEl) armorEl.textContent = `+${player.armor}`;
    }
  }

  renderPlayerHand() {
    const handEl = document.getElementById('player-hand');
    if (!handEl) return;

    const player = this.gameState.player;
    const hand = player.hand || [];

    handEl.innerHTML = hand.map((card, i) => {
      const canPlay = card.cost <= player.mana && this.isPlayerTurn;
      return `
        <div class="card ${canPlay ? 'can-play' : ''} ${this.selectedCardIndex === i ? 'selected' : ''}"
             data-index="${i}">
          <span class="card-cost">${card.cost}</span>
          <span class="card-name">${card.name}</span>
          <span class="card-text">${card.text || ''}</span>
          <div class="card-stats">
            ${card.attack !== undefined ? `<span class="card-attack">${card.attack}</span>` : ''}
            ${card.health !== undefined ? `<span class="card-health">${card.health}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  updateControls() {
    const endTurnBtn = document.getElementById('btn-end-turn');
    if (endTurnBtn) {
      endTurnBtn.textContent = this.isPlayerTurn ? '结束回合' : '敌方回合中...';
      endTurnBtn.disabled = !this.isPlayerTurn;
    }
  }

  selectCard(index) {
    if (!this.isPlayerTurn) return;

    const player = this.gameState.player;
    const card = player.hand[index];

    if (!card) return;

    // Check if can play
    if (card.cost > player.mana) {
      this.showMessage('法力不足');
      return;
    }

    // Toggle selection
    if (this.selectedCardIndex === index) {
      // Play the card
      this.playCard(index);
    } else {
      this.selectedCardIndex = index;
      this.selectedMinionIndex = null;
      this.renderPlayerHand();
    }
  }

  selectMinion(index) {
    if (!this.isPlayerTurn) return;

    const player = this.gameState.player;
    const minion = player.field[index];

    if (!minion) return;

    // Check if can attack
    if (minion.canAttack === false) {
      this.showMessage('该随从本回合无法攻击');
      return;
    }

    // Toggle selection
    if (this.selectedMinionIndex === index) {
      this.clearSelection();
    } else {
      this.selectedMinionIndex = index;
      this.selectedCardIndex = null;
      this.renderPlayerField();
    }
  }

  async playCard(index) {
    try {
      this.gameState = await API.playCard(index);
      this.selectedCardIndex = null;
      this.render();
      this.showMessage('使用了一张卡牌');
    } catch (err) {
      console.error('Failed to play card:', err);
      this.showMessage('打牌失败');
    }
  }

  async attackMinion(targetIndex) {
    try {
      this.gameState = await API.attack(
        this.selectedMinionIndex,
        targetIndex,
        'minion'
      );
      this.selectedMinionIndex = null;
      this.render();
    } catch (err) {
      console.error('Failed to attack:', err);
      this.showMessage('攻击失败');
    }
  }

  async attackHero() {
    try {
      this.gameState = await API.attack(
        this.selectedMinionIndex,
        0,
        'hero'
      );
      this.selectedMinionIndex = null;
      this.render();

      // Check for victory
      if (this.gameState.ai.health <= 0) {
        this.showMessage('胜利！');
        setTimeout(() => {
          if (confirm('恭喜获胜！再来一局？')) {
            window.app.showScreen('menu');
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to attack hero:', err);
      this.showMessage('攻击失败');
    }
  }

  clearSelection() {
    this.selectedCardIndex = null;
    this.selectedMinionIndex = null;
    this.render();
  }

  async endTurn() {
    if (!this.isPlayerTurn) return;

    try {
      this.gameState = await API.endTurn();
      this.isPlayerTurn = false;
      this.selectedCardIndex = null;
      this.selectedMinionIndex = null;
      this.render();

      // Wait for opponent turn (simple implementation)
      setTimeout(async () => {
        await this.checkGameState();
      }, 1000);
    } catch (err) {
      console.error('Failed to end turn:', err);
      this.showMessage('结束回合失败');
    }
  }

  async checkGameState() {
    try {
      // Get updated game state (opponent has taken their turn)
      this.gameState = await API.getGameState();
      this.isPlayerTurn = true;
      this.render();
    } catch (err) {
      console.error('Failed to get game state:', err);
    }
  }

  async useHeroPower() {
    try {
      this.gameState = await API.useHeroPower();
      this.render();
      this.showMessage('使用了英雄技能');
    } catch (err) {
      console.error('Failed to use hero power:', err);
      this.showMessage('英雄技能使用失败');
    }
  }

  async concede() {
    if (!confirm('确定要认输吗？')) return;

    try {
      await API.concede();
      this.showMessage('你已认输');
      setTimeout(() => {
        window.app.showScreen('menu');
      }, 1500);
    } catch (err) {
      console.error('Failed to concede:', err);
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

// Export for use in other modules
window.GameUI = GameUI;
