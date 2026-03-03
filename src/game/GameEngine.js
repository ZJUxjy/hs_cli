/**
 * 游戏引擎 - 核心游戏逻辑
 */

const CardData = require('../data/CardData');
const ConfigData = require('../data/ConfigData');
const TurnManager = require('./TurnManager');
const CardEffect = require('./CardEffect');
const Logger = require('../utils/logger');

class GameEngine {
  constructor() {
    this.state = null;
    this.turnManager = null;
    this.cardEffect = null;
  }

  /**
   * 初始化游戏引擎
   */
  init() {
    this.state = null;
    this.turnManager = null;
  }

  /**
   * 开始新游戏
   * @param {string} playerClass - 玩家职业
   * @param {string} opponentClass - 对手职业（可选，默认自动选择对立职业）
   * @param {string} difficulty - 难度
   * @returns {object} 游戏状态
   */
  startNewGame(playerClass, opponentClass, difficulty = 'normal') {
    this.init();

    const player = this.createPlayer('player', playerClass);
    const aiOpponentClass = opponentClass || this.getOppositeClass(playerClass);
    const ai = this.createPlayer('ai', aiOpponentClass);

    // 初始游戏状态
    this.state = {
      phase: 'mulligan', // init, mulligan, main, end
      turn: 1,
      currentPlayer: 'player',
      player,
      ai,
      winner: null,
      difficulty,
      message: '请选择要替换的手牌',
      actions: []
    };

    // 抽初始手牌 (先手3张，后手4张)
    this.drawCard(player, 3);
    this.drawCard(ai, 4);

    this.turnManager = new TurnManager(this);

    // 开始第一回合
    this.turnManager.startTurn();

    Logger.info('游戏开始!');
    return this.state;
  }

  /**
   * 创建玩家
   * @param {string} type - player 或 ai
   * @param {string} heroClass - 职业
   * @returns {object} 玩家数据
   */
  createPlayer(type, heroClass) {
    const classConfig = ConfigData.getClass(heroClass);
    const classCards = CardData.getCardsByClass(heroClass);
    
    // 构建初始套牌 (复制卡牌，避免引用问题)
    // 使用多套卡牌填充到30张
    let deck = [];
    while (deck.length < 30) {
      deck = deck.concat(classCards.map(c => ({ ...c, uid: this.generateUid() })));
    }
    deck = deck.slice(0, 30);
    
    // 随机打乱
    this.shuffle(deck);

    return {
      id: type,
      name: type === 'player' ? '玩家' : '敌方',
      hero: heroClass,
      health: classConfig?.startingHealth || 30,
      maxHealth: classConfig?.startingHealth || 30,
      mana: 1,
      maxMana: 1,
      armor: 0,
      hand: [],
      deck,
      field: [],
      secrets: [],
      usedHeroPower: false,
      fatigueDamage: 0
    };
  }

  /**
   * 生成唯一ID
   */
  generateUid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * 随机打乱数组
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * 抽牌
   * @param {object} player - 玩家
   * @param {number} count - 数量
   */
  drawCard(player, count = 1) {
    const gameConfig = ConfigData.getGameConfig();
    const maxHand = gameConfig?.maxHandSize || 10;

    for (let i = 0; i < count; i++) {
      if (player.deck.length > 0) {
        if (player.hand.length < maxHand) {
          player.hand.push(player.deck.pop());
        } else {
          Logger.info(`${player.name} 的手牌已满，无法抽牌`);
        }
      } else {
        // 疲劳伤害
        player.fatigueDamage++;
        const damage = player.fatigueDamage;
        player.health -= damage;
        Logger.info(`${player.name} 疲劳${player.fatigueDamage}点，造成 ${damage} 点伤害`);
      }
    }
  }

  /**
   * 获取敌方职业
   */
  getOppositeClass(cls) {
    return cls === 'mage' ? 'warrior' : 'mage';
  }

  /**
   * 获取游戏状态
   */
  getGameState() {
    return this.state;
  }

  /**
   * 获取当前玩家
   */
  getCurrentPlayer() {
    return this.state?.currentPlayer === 'player' ? this.state.player : this.state.ai;
  }

  /**
   * 获取对手
   */
  getOpponent() {
    return this.state?.currentPlayer === 'player' ? this.state.ai : this.state.player;
  }

  /**
   * 获取玩家对象
   * @param {string} playerId - 'player' 或 'ai'
   */
  getPlayer(playerId) {
    return playerId === 'player' ? this.state.player : this.state.ai;
  }

  /**
   * 设置消息
   */
  setMessage(msg) {
    if (this.state) {
      this.state.message = msg;
    }
  }

  /**
   * 检查游戏结束
   */
  checkGameEnd() {
    if (!this.state) return null;

    if (this.state.player.health <= 0) {
      this.state.winner = 'ai';
      this.state.phase = 'ended';
      return 'ai';
    }
    if (this.state.ai.health <= 0) {
      this.state.winner = 'player';
      this.state.phase = 'ended';
      return 'player';
    }
    return null;
  }

  /**
   * 结束游戏
   * @param {string} winner - 获胜方
   */
  endGame(winner) {
    if (this.state) {
      this.state.winner = winner;
      this.state.phase = 'ended';
      Logger.info(`游戏结束! 获胜方: ${winner === 'player' ? '玩家' : '敌方'}`);
    }
  }

  /**
   * 切换到对方回合
   */
  switchTurn() {
    if (this.turnManager) {
      this.turnManager.switchTurn();
    }
  }

  /**
   * 确认换牌结束
   */
  confirmMulligan() {
    if (this.state && this.state.phase === 'mulligan') {
      this.state.phase = 'main';
      this.turnManager.startTurn();
    }
  }

  /**
   * 替换手牌 (换牌阶段)
   * @param {array} indices - 要替换的手牌索引
   */
  mulligan(indices) {
    const player = this.state.player;
    const toReplace = indices.map(i => player.hand[i]).filter(c => c);
    
    toReplace.forEach(card => {
      const idx = player.hand.indexOf(card);
      if (idx > -1) {
        player.hand.splice(idx, 1);
        player.deck.push(card);
      }
    });
    
    this.shuffle(player.deck);
  }

  /**
   * 移除手牌中的卡牌
   * @param {object} player 
   * @param {object} card 
   */
  removeCardFromHand(player, card) {
    const idx = player.hand.indexOf(card);
    if (idx > -1) {
      player.hand.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * 召唤随从
   * @param {object} player
   * @param {object} card
   */
  summonMinion(player, card) {
    // 参数验证
    if (!player || !card) {
      Logger.error('召唤随从失败: 缺少必要参数');
      return false;
    }
    if (!card.id || !card.name) {
      Logger.error('召唤随从失败: 卡牌数据不完整');
      return false;
    }

    const gameConfig = ConfigData.getGameConfig();
    const maxField = gameConfig?.maxFieldSize || 7;

    if (player.field.length >= maxField) {
      this.setMessage('战场已满!');
      return false;
    }

    const minion = {
      uid: this.generateUid(),
      id: card.id,
      name: card.name,
      attack: card.effect?.attack || 0,
      health: card.effect?.health || 0,
      maxHealth: card.effect?.health || 0,
      canAttack: false,
      hasAttacked: false,
      frozen: false,
      sleeping: true, // 召唤出来的随从本回合不能攻击
      taunt: card.effect?.taunt || false,
      effects: []
    };

    // 存储战吼和亡语到随从对象
    minion.battlecry = card.effect?.battlecry || null;
    minion.deathrattle = card.effect?.deathrattle || null;

    player.field.push(minion);

    // 触发战吼
    if (minion.battlecry) {
      const cardEffect = new CardEffect(this);
      cardEffect.executeBattlecry(card, { player, target: player, card });
    }

    return true;
  }

  /**
   * 清理死亡的随从
   */
  removeDeadMinions() {
    if (!this.state) return;

    const player = this.state.player;
    const ai = this.state.ai;

    const playerCount = player.field.length;
    const aiCount = ai.field.length;

    // 分离死亡和存活的随从
    const deadPlayerMinions = player.field.filter(m => m.health <= 0);
    const deadAiMinions = ai.field.filter(m => m.health <= 0);

    player.field = player.field.filter(m => m.health > 0);
    ai.field = ai.field.filter(m => m.health > 0);

    // 触发玩家随从亡语
    deadPlayerMinions.forEach(minion => {
      if (minion.deathrattle) {
        const cardEffect = new CardEffect(this);
        cardEffect.executeDeathrattle(minion, { player, target: ai, card: minion });
      }
    });

    // 触发敌方随从亡语
    deadAiMinions.forEach(minion => {
      if (minion.deathrattle) {
        const cardEffect = new CardEffect(this);
        cardEffect.executeDeathrattle(minion, { player: ai, target: player, card: minion });
      }
    });

    if (player.field.length < playerCount) {
      Logger.info('你的随从阵亡');
    }
    if (ai.field.length < aiCount) {
      Logger.info('敌方随从阵亡');
    }
  }

  /**
   * 加载游戏
   * @param {object} savedState
   */
  loadGame(savedState) {
    this.state = savedState;
    this.turnManager = new TurnManager(this);
  }

  /**
   * 获取存档数据
   */
  getSaveData() {
    return {
      state: this.state,
      savedAt: new Date().toISOString()
    };
  }
}

module.exports = GameEngine;
