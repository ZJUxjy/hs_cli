// public/js/game.js - Game UI Controller
class GameUI {
  constructor() {
    this.gameState = null;
    this.selectedCardIndex = null;
    this.selectedMinionIndex = null;
    this.isPlayerTurn = true;
    // 拖拽状态
    this.dragState = {
      type: null,        // 'card' | 'minion'
      sourceIndex: null,
      element: null
    };
  }

  async startGame(playerClass, opponentClass = 'warrior') {
    try {
      this.gameState = await API.startGame(playerClass, opponentClass);
      this.isPlayerTurn = true;
      this.selectedCardIndex = null;
      this.selectedMinionIndex = null;
      this.render();
      this.bindEvents();
      this.showMessage(i18n.t('ui.game.gameStart'));
    } catch (err) {
      console.error('Failed to start game:', err);
      alert(i18n.t('ui.deck.loadFailed'));
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

    // 绑定存档按钮事件
    this.bindSaveEvents();

    // 绑定拖拽事件
    this.bindDragEvents();
  }

  // 绑定存档按钮事件
  bindSaveEvents() {
    const saveBtn = document.getElementById('btn-save-game');
    const loadBtn = document.getElementById('btn-load-game');

    if (saveBtn) {
      saveBtn.onclick = () => this.saveGame();
    }

    if (loadBtn) {
      loadBtn.onclick = () => this.showLoadDialog();
    }
  }

  // 绑定拖拽事件
  bindDragEvents() {
    // 手牌拖拽 - 出牌
    const playerHand = document.getElementById('player-hand');
    if (playerHand) {
      playerHand.addEventListener('dragstart', (e) => {
        const cardEl = e.target.closest('.card');
        if (cardEl) {
          const index = parseInt(cardEl.dataset.index);
          this.dragState = { type: 'card', sourceIndex: index };
          e.dataTransfer.setData('text/plain', index);
        }
      });
    }

    // 战场区域 - 放置卡牌
    const playerField = document.getElementById('player-field');
    if (playerField) {
      playerField.addEventListener('dragover', (e) => {
        e.preventDefault();
        playerField.classList.add('drag-over');
      });

      playerField.addEventListener('dragleave', () => {
        playerField.classList.remove('drag-over');
      });

      playerField.addEventListener('drop', (e) => {
        e.preventDefault();
        playerField.classList.remove('drag-over');
        if (this.dragState.type === 'card') {
          this.playCard(this.dragState.sourceIndex);
          this.dragState = { type: null, sourceIndex: null };
        }
      });
    }

    // 己方随从拖拽 - 攻击
    const playerFieldMinions = document.querySelectorAll('#player-field .minion');
    playerFieldMinions.forEach((minion, index) => {
      if (minion.dataset.canAttack === 'true') {
        minion.draggable = true;
        minion.addEventListener('dragstart', (e) => {
          this.dragState = { type: 'minion', sourceIndex: index };
        });
      }
    });

    // 敌方随从区域 - 放置攻击
    const enemyField = document.getElementById('enemy-field');
    if (enemyField) {
      enemyField.addEventListener('dragover', (e) => {
        e.preventDefault();
        enemyField.classList.add('drag-over');
      });

      enemyField.addEventListener('dragleave', () => {
        enemyField.classList.remove('drag-over');
      });

      enemyField.addEventListener('drop', (e) => {
        e.preventDefault();
        enemyField.classList.remove('drag-over');
        if (this.dragState.type === 'minion') {
          const targetEl = e.target.closest('.minion');
          if (targetEl) {
            const targetIndex = parseInt(targetEl.dataset.index);
            this.attackMinion(this.dragState.sourceIndex, targetIndex);
          }
          this.dragState = { type: null, sourceIndex: null };
        }
      });
    }

    // 敌方英雄区域 - 放置攻击英雄
    const enemyHero = document.getElementById('enemy-hero');
    if (enemyHero) {
      enemyHero.addEventListener('dragover', (e) => {
        e.preventDefault();
        enemyHero.classList.add('drag-over');
      });

      enemyHero.addEventListener('dragleave', () => {
        enemyHero.classList.remove('drag-over');
      });

      enemyHero.addEventListener('drop', (e) => {
        e.preventDefault();
        enemyHero.classList.remove('drag-over');
        if (this.dragState.type === 'minion') {
          this.attackHero(this.dragState.sourceIndex);
          this.dragState = { type: null, sourceIndex: null };
        }
      });
    }
  }

  async saveGame() {
    try {
      const result = await API.saveGame();
      if (result.success) {
        this.showMessage(i18n.t('ui.game.saved'));
      }
    } catch (err) {
      console.error('Failed to save game:', err);
      this.showMessage(i18n.t('ui.game.saveFailed'));
    }
  }

  async showLoadDialog() {
    try {
      const result = await API.getSaves();
      if (result.saves && result.saves.length > 0) {
        // 显示存档列表让玩家选择
        const saveNames = result.saves.map((s, idx) =>
          `${idx}: ${s.savedAt} - ${s.state.player.hero} vs ${s.state.ai.hero}`
        ).join('\n');

        const choice = prompt(`选择存档:\n${saveNames}\n\n输入存档编号:`);
        if (choice !== null) {
          const idx = parseInt(choice);
          if (!isNaN(idx) && idx >= 0 && idx < result.saves.length) {
            await this.loadGame(result.saves[idx].id);
          }
        }
      } else {
        this.showMessage(i18n.t('ui.game.noSaves'));
      }
    } catch (err) {
      console.error('Failed to load saves:', err);
    }
  }

  async loadGame(saveId) {
    try {
      this.gameState = await API.loadGame(saveId);
      this.render();
      this.showMessage(i18n.t('ui.game.loaded'));
    } catch (err) {
      console.error('Failed to load game:', err);
      this.showMessage(i18n.t('ui.game.loadFailed'));
    }
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
      turnEl.textContent = `${i18n.t('ui.game.turn')} ${this.gameState.turn || 1}`;
    }

    const manaEl = document.getElementById('player-mana');
    if (manaEl) {
      const player = this.gameState.player;
      manaEl.textContent = `${i18n.t('ui.game.mana')}: ${player.mana}/${player.maxMana}`;
    }

    const spellPowerEl = document.getElementById('player-spell-power');
    if (spellPowerEl) {
      const player = this.gameState.player;
      const spellPower = player.spellPower || 0;
      spellPowerEl.textContent = `${i18n.t('ui.game.spellPower')}: +${spellPower}`;
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
      if (handCountEl) handCountEl.textContent = `${i18n.t('ui.game.hand')}: ${enemy.handCount || enemy.hand?.length || 0}`;
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
      const canAttack = minion.canAttack !== false && this.isPlayerTurn && !minion.sleeping && !minion.frozen && !minion.hasAttacked;
      return `
        <div class="minion ${canAttack ? 'can-attack' : ''} ${this.selectedMinionIndex === i ? 'selected' : ''}"
             data-index="${i}" data-can-attack="${canAttack}">
          ${minion.taunt ? '<span class="minion-taunt"></span>' : ''}
          ${minion.charge ? '<span class="mechanic-icon charge-icon">C</span>' : ''}
          ${minion.rush ? '<span class="mechanic-icon rush-icon">R</span>' : ''}
          ${minion.divineShield ? '<span class="mechanic-icon divine-shield-icon">D</span>' : ''}
          ${minion.lifesteal ? '<span class="mechanic-icon lifesteal-icon">L</span>' : ''}
          ${minion.windfury ? '<span class="mechanic-icon windfury-icon">W</span>' : ''}
          ${minion.stealth ? '<span class="mechanic-icon stealth-icon">S</span>' : ''}
          ${minion.poisonous ? '<span class="mechanic-icon poisonous-icon">P</span>' : ''}
          ${minion.reborn ? '<span class="mechanic-icon reborn-icon">B</span>' : ''}
          <div class="minion-name">${minion.name}</div>
          <div class="minion-stats">
            <span class="minion-attack">${minion.attack}</span>
            <span class="minion-health">${minion.health}</span>
          </div>
        </div>
      `;
    }).join('');

    // 重新绑定拖拽事件
    this.bindDragEvents();
  }

  renderPlayerHero() {
    const player = this.gameState.player;
    const heroEl = document.getElementById('player-hero');

    if (heroEl) {
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
             data-index="${i}" draggable="${canPlay}">
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

    // 重新绑定拖拽事件
    this.bindDragEvents();
  }

  updateControls() {
    const endTurnBtn = document.getElementById('btn-end-turn');
    if (endTurnBtn) {
      endTurnBtn.textContent = this.isPlayerTurn ? i18n.t('ui.game.endTurn') : i18n.t('ui.game.enemyTurn');
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
      this.showMessage(i18n.t('ui.game.insufficientMana'));
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
      this.showMessage(i18n.t('ui.game.cannotAttack'));
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

      // 检查是否有待处理的抉择
      if (this.gameState.pendingChoice) {
        this.showChoiceDialog();
        return;
      }

      // 检查是否有待处理的适应
      if (this.gameState.pendingAdapt) {
        this.showAdaptDialog();
        return;
      }

      this.selectedCardIndex = null;
      this.render();
      this.showMessage(i18n.t('ui.game.cardPlayed'));
    } catch (err) {
      console.error('Failed to play card:', err);
      this.showMessage(i18n.t('ui.game.playFailed'));
    }
  }

  showAdaptDialog() {
    const dialog = document.getElementById('adapt-dialog');
    const adaptOptionsContainer = document.getElementById('adapt-options');

    if (!dialog || !this.gameState.pendingAdapt) return;

    const { options, card } = this.gameState.pendingAdapt;

    // 显示卡牌名称
    const titleEl = dialog.querySelector('h3');
    if (titleEl) {
      titleEl.textContent = `${card.name} - 选择进化`;
    }

    // 生成选项按钮
    adaptOptionsContainer.innerHTML = options.map((opt, idx) => `
      <button class="adapt-option-btn" data-index="${idx}">${opt.text}</button>
    `).join('');

    // 绑定选项点击事件
    adaptOptionsContainer.querySelectorAll('.adapt-option-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.index);
        this.makeAdaptChoice(idx);
      };
    });

    dialog.classList.remove('hidden');
  }

  async makeAdaptChoice(optionIndex) {
    try {
      this.gameState = await API.selectAdapt(optionIndex);
      const dialog = document.getElementById('adapt-dialog');
      if (dialog) dialog.classList.add('hidden');
      this.render();
      this.showMessage(i18n.t('ui.game.adaptChosen'));
    } catch (err) {
      console.error('Failed to make adapt choice:', err);
      this.showMessage(i18n.t('ui.game.playFailed'));
    }
  }

  showChoiceDialog() {
    const dialog = document.getElementById('choice-dialog');
    const choice1Btn = document.getElementById('btn-choice-1');
    const choice2Btn = document.getElementById('btn-choice-2');

    if (!dialog || !this.gameState.pendingChoice) return;

    const { choice1, choice2, card } = this.gameState.pendingChoice;

    // 显示卡牌名称
    const titleEl = dialog.querySelector('h3');
    if (titleEl) {
      titleEl.textContent = `${card.name} - 选择效果`;
    }

    // 设置选项文本
    choice1Btn.textContent = choice1.text || choice1.type || '选项1';
    choice2Btn.textContent = choice2.text || choice2.type || '选项2';

    choice1Btn.onclick = () => this.makeChoice(1);
    choice2Btn.onclick = () => this.makeChoice(2);

    dialog.classList.remove('hidden');
  }

  async makeChoice(option) {
    try {
      this.gameState = await API.chooseOption(option);
      const dialog = document.getElementById('choice-dialog');
      if (dialog) dialog.classList.add('hidden');
      this.render();
    } catch (err) {
      console.error('Failed to make choice:', err);
      this.showMessage(i18n.t('ui.game.playFailed'));
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
      this.showMessage(i18n.t('ui.game.attackFailed'));
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
        this.showMessage(i18n.t('ui.game.victory'));
        setTimeout(() => {
          if (confirm(i18n.t('ui.game.playAgain'))) {
            window.app.showScreen('menu');
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to attack hero:', err);
      this.showMessage(i18n.t('ui.game.attackFailed'));
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
      this.showMessage(i18n.t('ui.game.endTurnFailed'));
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
      this.showMessage(i18n.t('ui.game.heroPowerUsed'));
    } catch (err) {
      console.error('Failed to use hero power:', err);
      this.showMessage(i18n.t('ui.game.heroPowerFailed'));
    }
  }

  async concede() {
    if (!confirm(i18n.t('ui.game.confirmConcede'))) return;

    try {
      await API.concede();
      this.showMessage(i18n.t('ui.game.youConceded'));
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
