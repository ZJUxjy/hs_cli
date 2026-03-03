/**
 * 游戏界面
 */

const blessed = require('blessed');
const Logger = require('../../utils/logger');
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
    this.cardEffect = null;
    
    this.boxes = {};
    this.state = {
      mode: 'select', // select(选择), action(行动), target(选择目标)
      selectedHandIndex: -1,
      selectedFieldIndex: -1,
      actionType: null,
      actionCard: null
    };
  }

  /**
   * 显示游戏界面
   */
  show(playerClass = 'mage', difficulty = 'normal') {
    // 初始化游戏引擎
    this.game = new GameEngine();
    this.ruleEngine = new RuleEngine(this.game);
    this.aiEngine = new AIEngine(this.game);
    this.cardEffect = new CardEffect(this.game);
    
    // 开始新游戏
    this.game.startNewGame(playerClass, difficulty);

    // 创建界面
    this.createUI();

    // 渲染
    this.update();
  }

  /**
   * 显示游戏界面（使用已有引擎，加载存档）
   */
  showWithEngine(gameEngine) {
    this.game = gameEngine;
    this.ruleEngine = new RuleEngine(this.game);
    this.aiEngine = new AIEngine(this.game);
    this.cardEffect = new CardEffect(this.game);

    // 创建界面
    this.createUI();

    // 渲染
    this.update();
  }

  /**
   * 创建 UI 组件
   */
  createUI() {
    // 顶部标题栏
    this.boxes.title = blessed.box({
      parent: this.parent,
      top: 0,
      height: 3,
      width: '100%',
      content: '{bold}{fg:cyan}炉石传说 CLI{/fg}{/bold}',
      tags: true,
      style: { fg: 'white', bg: 'black' }
    });

    // 敌方信息栏
    this.boxes.enemyHero = blessed.box({
      parent: this.parent,
      top: 3,
      left: 0,
      width: '30%',
      height: 8,
      border: { type: 'line', fg: 'red' },
      style: { fg: 'white', bg: 'black', border: { fg: 'red' } }
    });

    // 敌方手牌区 (暗面显示)
    this.boxes.enemyHand = blessed.box({
      parent: this.parent,
      top: 3,
      left: '30%',
      width: '40%',
      height: 5,
      content: '',
      style: { fg: 'gray', bg: 'black' }
    });

    // 玩家信息栏
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
      height: 8,
      style: { fg: 'white', bg: 'black' }
    });

    // 玩家战场
    this.boxes.playerField = blessed.box({
      parent: this.parent,
      top: 19,
      left: 0,
      width: '100%',
      height: 8,
      style: { fg: 'white', bg: 'black' }
    });

    // 玩家手牌区
    this.boxes.playerHand = blessed.box({
      parent: this.parent,
      top: 27,
      left: 0,
      width: '100%',
      height: 6,
      style: { fg: 'white', bg: 'black' }
    });

    // 底部信息栏
    this.boxes.status = blessed.box({
      parent: this.parent,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      style: { fg: 'white', bg: 'blue' }
    });

    // 绑定键盘事件
    this.bindKeys();
  }

  /**
   * 绑定键盘事件
   */
  bindKeys() {
    // 数字键选择手牌
    for (let i = 1; i <= 9; i++) {
      this.screen.key(String(i), () => this.selectHandCard(i - 1));
    }

    // 方向键
    this.screen.key(['up', 'down', 'left', 'right'], (ch) => {
      if (this.state.mode === 'target') {
        this.handleTargetSelect(ch);
      }
    });

    // 回车确认
    this.screen.key('enter', () => this.confirm());

    // 空格键 - 攻击或跳过
    this.screen.key('space', () => this.space());

    // E - 结束回合
    this.screen.key('e', () => this.endTurn());

    // 退出
    this.screen.key(['escape'], () => this.backToMenu());

    // A - 攻击模式
    this.screen.key('a', () => this.enterAttackMode());

    // S - 保存游戏
    this.screen.key('s', () => this.saveGame());
  }

  /**
   * 选择手牌
   */
  selectHandCard(index) {
    const state = this.game.getGameState();
    const hand = state.player.hand;
    
    if (index >= 0 && index < hand.length) {
      const card = hand[index];
      
      // 检查是否可以打出
      const result = this.ruleEngine.canPlayCard(state.player, card);
      
      if (result.valid) {
        this.state.selectedHandIndex = index;
        this.state.selectedFieldIndex = -1;
        this.state.mode = 'action';
        this.state.actionType = 'play';
        this.state.actionCard = card;
        
        this.game.setMessage(`选择: ${card.name} (${card.cost}费) - 按Enter打出，按A攻击`);
      } else {
        this.game.setMessage(result.reason);
      }
      
      this.update();
    }
  }

  /**
   * 进入攻击模式
   */
  enterAttackMode() {
    const state = this.game.getGameState();
    const player = state.player;
    
    // 查找可以攻击的随从
    const attackers = player.field.filter(m => m.canAttack && !m.hasAttacked);
    
    if (attackers.length === 0) {
      this.game.setMessage('没有可以攻击的随从');
      this.update();
      return;
    }

    // 选择第一个可攻击的随从
    const attacker = attackers[0];
    const fieldIndex = player.field.indexOf(attacker);
    
    this.state.mode = 'attack_select';
    this.state.selectedFieldIndex = fieldIndex;
    this.game.setMessage(`选择攻击目标: ${attacker.name} - 按Enter选择目标`);
    this.update();
  }

  /**
   * 确认行动
   */
  confirm() {
    const state = this.game.getGameState();

    if (state.phase === 'ended') {
      this.backToMenu();
      return;
    }

    if (state.currentPlayer !== 'player') {
      return; // AI 回合
    }

    if (this.state.mode === 'action' && this.state.actionType === 'play') {
      this.playCard();
    } else if (this.state.mode === 'target') {
      // 确认目标
      this.confirmTarget();
    }

    this.update();
  }

  /**
   * 打出卡牌
   */
  playCard() {
    const state = this.game.getGameState();
    const card = this.state.actionCard;
    
    if (!card) return;

    // 从手牌移除
    this.game.removeCardFromHand(state.player, card);
    
    // 扣除法力
    state.player.mana -= card.cost;

    Logger.info(`打出: ${card.name}`);

    if (card.type === 'minion') {
      // 召唤随从
      this.game.summonMinion(state.player, card);
      this.game.setMessage(`${card.name} 召唤到场上`);
    } else {
      // 执行法术效果
      // 简化处理：默认目标为敌方随从或英雄
      let target = state.ai;
      if (state.ai.field.length > 0) {
        target = state.ai.field[0];
      }
      
      this.cardEffect.execute(card, { 
        player: state.player, 
        target,
        card 
      });
      this.game.setMessage(`${card.name} 施放成功`);
    }

    // 重置状态
    this.state.mode = 'select';
    this.state.selectedHandIndex = -1;
    this.state.actionCard = null;

    // 检查游戏结束
    if (this.game.checkGameEnd()) {
      this.showGameEnd();
    }

    this.update();
  }

  /**
   * 空格键 - 攻击或取消
   */
  space() {
    if (this.state.mode === 'attack_select') {
      // 选择要攻击的随从
      this.state.mode = 'target';
      this.state.actionType = 'attack';
      this.game.setMessage('选择攻击目标 - 方向键选择，Enter确认');
      this.update();
    }
  }

  /**
   * 结束回合
   */
  endTurn() {
    const state = this.game.getGameState();
    
    if (state.currentPlayer !== 'player' || state.phase === 'ended') {
      return;
    }

    this.game.setMessage('回合结束，敌方行动中...');
    this.update();

    // 切换到 AI 回合
    setTimeout(async () => {
      await this.aiEngine.decide();
      
      if (!this.game.checkGameEnd()) {
        state.currentPlayer = 'player';
        this.game.switchTurn();
        this.game.setMessage('你的回合');
      }
      
      this.update();
    }, 100);
  }

  /**
   * 返回主菜单
   */
  backToMenu() {
    this.destroy();
    const MainMenu = require('./MainMenu');
    const menu = new MainMenu(this.screen, this.parent);
    menu.show();
  }

  /**
   * 保存游戏
   */
  saveGame() {
    // 临时使用默认profileId，实际需要从选择角色界面传入
    const profileId = 'default';
    const ProfileData = require('../../data/ProfileData');

    // 确保默认profile存在
    let profile = ProfileData.loadProfile(profileId);
    if (!profile) {
      profile = ProfileData.createProfile('Default');
    }

    const success = this.game.saveCurrentGame(profileId);
    if (success) {
      this.game.setMessage('游戏已保存! (按任意键继续)');
      this.update();
    } else {
      this.game.setMessage('保存失败!');
      this.update();
    }
  }

  /**
   * 更新界面
   */
  update() {
    const state = this.game.getGameState();
    if (!state) return;

    // 更新敌方信息
    const ai = state.ai;
    this.boxes.enemyHero.setContent(
      `{fg:red}敌方 (${ai.hero}){/fg}\n` +
      `生命: ${ai.health}/${ai.maxHealth}\n` +
      `护甲: ${ai.armor}\n` +
      `法力: ${ai.mana}/${ai.maxMana}\n` +
      `随从: ${ai.field.length}/7`
    );

    // 更新玩家信息
    const player = state.player;
    this.boxes.playerHero.setContent(
      `{fg:blue}玩家 (${player.hero}){/fg}\n` +
      `生命: ${player.health}/${player.maxHealth}\n` +
      `护甲: ${player.armor}\n` +
      `法力: ${player.mana}/${player.maxMana}\n` +
      `随从: ${player.field.length}/7`
    );

    // 更新敌方手牌 (暗面)
    this.boxes.enemyHand.setContent(
      `敌方手牌: [${'?'.repeat(Math.min(ai.hand.length, 10))}]`
    );

    // 更新敌方战场
    let enemyFieldStr = '   ';
    ai.field.forEach((m, i) => {
      const sel = (this.state.mode === 'target' && this.state.targetIndex === i) ? '>' : ' ';
      const frozen = m.frozen ? '❄' : '';
      const taunt = m.taunt ? '⚔' : '';
      enemyFieldStr += `${sel}[${m.attack}/${m.health}]${frozen}${taunt}  `;
    });
    this.boxes.enemyField.setContent(enemyFieldStr);

    // 更新玩家战场
    let playerFieldStr = '   ';
    player.field.forEach((m, i) => {
      const sel = (this.state.selectedFieldIndex === i) ? '>' : ' ';
      const canAtk = m.canAttack && !m.hasAttacked ? '*' : ' ';
      const frozen = m.frozen ? '❄' : '';
      const taunt = m.taunt ? '⚔' : '';
      const sleep = m.sleeping ? '(Z)' : '';
      playerFieldStr += `${sel}${m.name.substr(0,4)}[${m.attack}/${m.health}]${canAtk}${frozen}${taunt}${sleep}  `;
    });
    this.boxes.playerField.setContent(playerFieldStr);

    // 更新玩家手牌
    let handStr = '   ';
    player.hand.forEach((c, i) => {
      const sel = (this.state.selectedHandIndex === i) ? '>' : ' ';
      const cardText = c.type === 'minion' 
        ? `${c.name.substr(0,3)}[${c.effect?.attack || 0}/${c.effect?.health || 0}]`
        : `${c.name.substr(0,4)}[${c.cost}]`;
      handStr += `${sel}${cardText}  `;
    });
    this.boxes.playerHand.setContent(handStr);

    // 更新状态栏
    let statusText = `回合: ${state.turn}  |  ${state.message}`;
    if (state.currentPlayer === 'ai') {
      statusText += '  {fg:red}[敌方回合]{/fg}';
    }
    this.boxes.status.setContent(statusText);

    this.screen.render();
  }

  /**
   * 显示游戏结束
   */
  showGameEnd() {
    const state = this.game.getGameState();
    const winner = state.winner;
    
    const msg = winner === 'player'
      ? '{fg:green}恭喜！你赢了！{/fg}'
      : '{fg:red}你输了...{/fg}';
    
    this.boxes.status.setContent(`${msg}  按Enter返回主菜单`);
    this.screen.render();
  }

  /**
   * 销毁界面
   */
  destroy() {
    Object.values(this.boxes).forEach(box => {
      if (box && box.destroy) box.destroy();
    });
    this.boxes = {};
  }
}

module.exports = GameScreen;
