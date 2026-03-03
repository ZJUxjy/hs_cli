/**
 * 游戏界面 - 简化版
 */

const blessed = require('blessed');
const GameEngine = require('../../game/GameEngine');
const RuleEngine = require('../../game/RuleEngine');
const AIEngine = require('../../game/AIEngine');
const CardEffect = require('../../game/CardEffect');

class GameScreen {
  constructor(screen, parent) {
    this.screen = screen;
    this.parent = parent;
    this.game = null;
    this.ruleEngine = null;
    this.aiEngine = null;
    this.boxes = {};
    this.state = {
      mode: 'select',
      selectedHandIndex: -1
    };
  }

  show(playerClass = 'mage', difficulty = 'normal') {
    this.screen.currentScreen = 'game';

    this.game = new GameEngine();
    this.ruleEngine = new RuleEngine(this.game);
    this.aiEngine = new AIEngine(this.game);
    this.cardEffect = new CardEffect(this.game);

    // 传3个参数：playerClass, opponentClass(自动), difficulty
    this.game.startNewGame(playerClass, null, difficulty);

    this.createUI();
    this.update();
  }

  showWithEngine(gameEngine) {
    this.screen.currentScreen = 'game';
    this.game = gameEngine;
    this.ruleEngine = new RuleEngine(this.game);
    this.aiEngine = new AIEngine(this.game);
    this.cardEffect = new CardEffect(this.game);

    this.createUI();
    this.update();
  }

  createUI() {
    // 顶部标题
    this.boxes.title = blessed.box({
      parent: this.parent,
      top: 0,
      height: 3,
      width: '100%',
      content: '=== 炉石传说 CLI ===',
      style: { fg: 'cyan', bold: true, bg: 'black' }
    });

    // 敌方信息
    this.boxes.enemyHero = blessed.box({
      parent: this.parent,
      top: 3,
      left: 0,
      width: '30%',
      height: 8,
      border: { type: 'line', fg: 'red' },
      style: { fg: 'white', bg: 'black', border: { fg: 'red' } }
    });

    // 敌方手牌
    this.boxes.enemyHand = blessed.box({
      parent: this.parent,
      top: 3,
      left: '30%',
      width: '40%',
      height: 8,
      style: { fg: 'gray', bg: 'black' }
    });

    // 玩家信息
    this.boxes.playerHero = blessed.box({
      parent: this.parent,
      top: 3,
      right: 0,
      width: '30%',
      height: 8,
      border: { type: 'line', fg: 'blue' },
      style: { fg: 'white', bg: 'black', border: { fg: 'blue' } }
    });

    // 敌方战场
    this.boxes.enemyField = blessed.box({
      parent: this.parent,
      top: 11,
      left: 0,
      width: '100%',
      height: 5,
      style: { fg: 'white', bg: 'black' }
    });

    // 玩家战场
    this.boxes.playerField = blessed.box({
      parent: this.parent,
      top: 16,
      left: 0,
      width: '100%',
      height: 5,
      style: { fg: 'white', bg: 'black' }
    });

    // 玩家手牌
    this.boxes.playerHand = blessed.box({
      parent: this.parent,
      top: 21,
      left: 0,
      width: '100%',
      height: 5,
      style: { fg: 'white', bg: 'black' }
    });

    // 状态栏
    this.boxes.status = blessed.box({
      parent: this.parent,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      style: { fg: 'white', bg: 'blue' }
    });

    this.bindKeys();
  }

  bindKeys() {
    const self = this;

    // 数字键选择手牌
    for (let i = 1; i <= 9; i++) {
      this.screen.key(String(i), () => {
        if (self.screen.currentScreen === 'game') self.selectHandCard(i - 1);
      });
    }

    // 回车确认
    this.screen.key('enter', () => {
      if (self.screen.currentScreen === 'game') self.confirm();
    });

    // E - 结束回合
    this.screen.key('e', () => {
      if (self.screen.currentScreen === 'game') self.endTurn();
    });

    // 退出
    this.screen.key('escape', () => {
      if (self.screen.currentScreen === 'game') self.backToMenu();
    });
    this.screen.key('q', () => {
      if (self.screen.currentScreen === 'game') self.backToMenu();
    });

    // S - 保存
    this.screen.key('s', () => {
      if (self.screen.currentScreen === 'game') self.saveGame();
    });
  }

  selectHandCard(index) {
    const gameState = this.game.getGameState();
    const hand = gameState.player.hand;

    if (index >= 0 && index < hand.length) {
      this.state.selectedHandIndex = index;
      const card = hand[index];
      this.game.setMessage(`选择: ${card.name} (${card.cost}费)`);
      this.update();
    }
  }

  confirm() {
    if (this.state.selectedHandIndex >= 0) {
      const gameState = this.game.getGameState();
      const card = gameState.player.hand[this.state.selectedHandIndex];

      if (card) {
        // 打出卡牌
        this.game.summonMinion(gameState.player, card);
        this.game.removeCardFromHand(gameState.player, card);
        this.game.setMessage(`打出: ${card.name}`);
        this.state.selectedHandIndex = -1;
        this.update();
      }
    }
  }

  endTurn() {
    this.game.switchTurn();

    // AI回合
    const state = this.game.getGameState();
    if (state.currentPlayer === 'ai') {
      this.game.setMessage('敌方回合...');
      this.update();

      setTimeout(async () => {
        await this.aiEngine.decide();
        this.game.switchTurn();
        this.update();
      }, 500);
    }
  }

  saveGame() {
    const ProfileData = require('../../data/ProfileData');
    let profile = ProfileData.loadProfile('default');
    if (!profile) {
      profile = ProfileData.createProfile('Default');
    }
    this.game.saveCurrentGame(profile.id);
    this.game.setMessage('游戏已保存!');
    this.update();
  }

  backToMenu() {
    this.destroy();
    const MainMenu = require('./MainMenu');
    const menu = new MainMenu(this.screen, this.parent);
    menu.show();
  }

  update() {
    const state = this.game.getGameState();
    if (!state) return;

    const ai = state.ai;
    const player = state.player;

    // 敌方信息
    this.boxes.enemyHero.setContent(
      `敌方 (${ai.hero})\n` +
      `生命: ${ai.health}/${ai.maxHealth}\n` +
      `护甲: ${ai.armor}\n` +
      `法力: ${ai.mana}/${ai.maxMana}\n` +
      `随从: ${ai.field.length}/7`
    );

    // 玩家信息
    this.boxes.playerHero.setContent(
      `玩家 (${player.hero})\n` +
      `生命: ${player.health}/${player.maxHealth}\n` +
      `护甲: ${player.armor}\n` +
      `法力: ${player.mana}/${player.maxMana}\n` +
      `随从: ${player.field.length}/7`
    );

    // 敌方手牌
    this.boxes.enemyHand.setContent(`敌方手牌: ${'?'.repeat(ai.hand.length)}`);

    // 敌方战场
    this.boxes.enemyField.setContent(
      `敌方战场: ` +
      ai.field.map(m => `[${m.attack}/${m.health}]`).join(' ')
    );

    // 玩家战场
    this.boxes.playerField.setContent(
      `战场: ` +
      player.field.map((m, i) => {
        const sel = i === this.state.selectedFieldIndex ? '>' : '';
        return `${sel}[${m.attack}/${m.health}]`;
      }).join(' ')
    );

    // 玩家手牌
    this.boxes.playerHand.setContent(
      `手牌: ` +
      player.hand.map((c, i) => {
        const sel = i === this.state.selectedHandIndex ? '>' : '';
        return `${sel}${c.name}(${c.cost})`;
      }).join(' | ')
    );

    // 状态栏
    let statusText = `回合: ${state.turn} | ${state.message}`;
    if (state.currentPlayer === 'ai') {
      statusText += ' [敌方回合]';
    }
    this.boxes.status.setContent(statusText);

    this.screen.render();
  }

  destroy() {
    Object.values(this.boxes).forEach(box => box && box.destroy());
    this.boxes = {};
  }
}

module.exports = GameScreen;
