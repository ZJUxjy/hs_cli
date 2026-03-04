/**
 * 游戏引擎 - 核心游戏逻辑
 */

const CardData = require('../data/CardData');
const ConfigData = require('../data/ConfigData');
const TurnManager = require('./TurnManager');
const CardEffect = require('./CardEffect');
const QuestManager = require('./QuestManager');
const Logger = require('../utils/logger');
const i18n = require('../i18n');
const CardType = require('../utils/cardUtils');

class GameEngine {
  constructor() {
    this.state = null;
    this.turnManager = null;
    this.cardEffect = null;
    this.questManager = null;
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

    // 初始化任务管理器
    this.questManager = new QuestManager(this);

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
    // 使用带effect的卡牌数据，只保留可收集的随从和法术
    const allCards = CardData.getCardsByClassWithEffect(heroClass);

    const classCards = allCards.filter(c =>
      c.collectible && (CardType.isMinion(c) || CardType.isSpell(c) || CardType.isWeapon(c) || CardType.isHero(c))
    );

    // 如果筛选后卡牌太少，回退到所有卡
    const cardsToUse = classCards.length >= 10 ? classCards : allCards;

    // 构建初始套牌 (复制卡牌，避免引用问题)
    // 先复制所有卡牌，然后随机打乱，取前30张
    let deck = cardsToUse.map(c => ({ ...c, uid: this.generateUid() }));

    // 随机打乱
    this.shuffle(deck);

    // 取前30张
    deck = deck.slice(0, 30);

    return {
      id: type,
      name: type === 'player' ? '玩家' : '敌方',
      hero: heroClass,
      health: classConfig?.startingHealth || 30,
      maxHealth: classConfig?.startingHealth || 30,
      mana: 1,
      maxMana: 1,
      armor: 0,
      spellPower: 0,  // 法术伤害加成
      hand: [],
      deck,
      field: [],
      secrets: [],
      usedHeroPower: false,
      fatigueDamage: 0,
      weapon: null,
      locale: 'zh',  // 玩家默认语言
      echoCards: [],  // 回响卡牌
      corruptedCards: [],  // 腐蚀卡牌
      spellburstUsed: []  // 已使用的法术爆发
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
   * 将卡牌加入玩家手牌
   * @param {object} player - 玩家
   * @param {object} card - 卡牌
   */
  addCardToHand(player, card) {
    if (!player || !card) {
      Logger.error('添加卡牌到手中失败: 缺少必要参数');
      return false;
    }

    const gameConfig = ConfigData.getGameConfig();
    const maxHand = gameConfig?.maxHandSize || 10;

    if (player.hand.length >= maxHand) {
      Logger.info(`${player.name} 的手牌已满，无法添加卡牌`);
      return false;
    }

    player.hand.push(card);
    Logger.info(`${card.name} 被加入 ${player.name} 的手牌`);
    return true;
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
   * @param {string} msg - 消息文本或翻译键
   * @param {object} params - 翻译参数
   */
  setMessage(msg, params = {}) {
    if (this.state) {
      // 如果消息是翻译键（包含点号），则翻译
      if (msg && msg.includes('.')) {
        this.state.message = i18n.t(msg, params);
      } else {
        this.state.message = msg;
      }
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
   * 打出手牌
   * @param {number} cardIndex - 手牌索引
   * @returns {object} 游戏状态
   */
  playCard(cardIndex) {
    if (!this.state) return null;

    const player = this.state.player;
    const card = player.hand[cardIndex];

    if (!card) {
      this.setMessage('无效的卡牌');
      return this.getGameState();
    }

    // 检查法力值
    if (player.mana < card.cost) {
      this.setMessage('法力不足');
      return this.getGameState();
    }

    // 检查是否是任务卡 - 任务卡直接触发任务，不执行普通效果
    if (card.effect?.type === 'quest') {
      this.questManager.initQuest(card, player);
      player.hand.splice(cardIndex, 1);
      return this.getGameState();
    }

    // 检查是否是英雄卡
    if (CardType.isHero(card)) {
      // 处理英雄卡 - 变身
      this.transformIntoHero(player, card);
      player.hand.splice(cardIndex, 1);
      return this.getGameState();
    }

    // 检查是否是抉择卡牌
    if (card.effect?.choose) {
      // 返回抉择信息，暂停打牌
      this.state.pendingChoice = {
        cardIndex: cardIndex,
        card: card,
        choice1: card.effect.choice1,
        choice2: card.effect.choice2
      };
      this.state.message = '请选择效果';
      return this.getGameState();
    }

    // 消耗法力
    player.mana -= card.cost;

    // 处理过载 - 下回合锁定法力
    if (card.effect && card.effect.overload && card.effect.overload > 0) {
      this.applyOverload(player, card.effect.overload);
    }

    // 执行卡牌效果
    this.executeCardEffect(card, card.effect, {
      player,
      target: this.state.ai
    });

    // 更新任务进度
    if (this.questManager) {
      if (CardType.isMinion(card)) {
        this.questManager.updateProgress(player, 'play_minion', { card });
      } else if (CardType.isSpell(card)) {
        this.questManager.updateProgress(player, 'play_spell', { card });
      }
    }

    // 处理连击 - 手牌中有其他卡牌时触发
    if (card.effect?.combo) {
      const cardEffect = new CardEffect(this);
      // 临时修改 effect type 为 combo 以触发 executeCombo
      const originalType = card.effect.type;
      card.effect.type = 'combo';
      cardEffect.execute(card, {
        player,
        target: this.state.ai,
        card,
        effect: card.effect
      });
      // 恢复原始 type
      card.effect.type = originalType;
    }

    // 处理 Echo 机制：Echo 卡牌保留在手中
    if (card.effect?.echo) {
      Logger.info(`${card.name} 具有回响，打出后保留在手中`);
      // 将卡牌加入 echoCards 列表
      if (!player.echoCards) player.echoCards = [];
      player.echoCards.push(card);
      // 不从手牌移除
    } else {
      // 普通卡牌从手牌移除
      player.hand.splice(cardIndex, 1);
    }

    // 处理 Corrupt 机制：腐蚀手牌中的卡牌
    if (card.effect?.corrupt) {
      this.corruptHand(player, card);
    }

    // 处理 Spellburst 机制：释放法术时触发
    if (card.effect?.spellburst) {
      this.triggerSpellburst(player, card);
    }

    return this.getGameState();
  }

  /**
   * 选择抉择选项
   * @param {number} option - 选项 (1 或 2)
   * @returns {object} 游戏状态
   */
  chooseOption(option) {
    if (!this.state || !this.state.pendingChoice) {
      return this.getGameState();
    }

    const { cardIndex, card } = this.state.pendingChoice;
    const player = this.state.player;

    // 消耗法力
    player.mana -= card.cost;

    // 执行选择的效果
    const choice = option === 1 ? card.effect.choice1 : card.effect.choice2;
    this.executeCardEffect(card, choice, {
      player,
      target: this.state.ai
    });

    // 移除手牌
    player.hand.splice(cardIndex, 1);

    // 清除抉择状态
    this.state.pendingChoice = null;
    this.state.message = '';

    return this.getGameState();
  }

  /**
   * 结束当前玩家回合
   */
  endTurn() {
    this.switchTurn();
    return this.getGameState();
  }

  /**
   * 应用过载效果
   * @param {object} player - 玩家
   * @param {number} overloadValue - 过载值
   */
  applyOverload(player, overloadValue) {
    if (!player.overload) player.overload = 0;
    player.overload += overloadValue;
    Logger.info(`下回合将过载 ${player.overload} 点`);
  }

  /**
   * 设置抉择
   * @param {object} player - 玩家
   * @param {object} choiceData - 抉择数据
   */
  setChoice(player, choiceData) {
    if (!this.state) return false;
    player.currentChoice = choiceData;
    this.state.phase = 'choice';
    const option1Name = choiceData.option1?.name || '选项1';
    const option2Name = choiceData.option2?.name || '选项2';
    this.setMessage(`请选择: 1) ${option1Name}  2) ${option2Name}`);
    return true;
  }

  /**
   * 解决抉择
   * @param {object} player - 玩家
   * @param {number} option - 选项 (1 或 2)
   */
  resolveChoice(player, option) {
    if (!player.currentChoice) return false;

    const choice = player.currentChoice;
    if (option === 1 && choice.option1) {
      this.executeCardEffect(choice.card, choice.option1, choice.context);
    } else if (option === 2 && choice.option2) {
      this.executeCardEffect(choice.card, choice.option2, choice.context);
    }

    player.currentChoice = null;
    this.state.phase = 'main';
    return true;
  }

  /**
   * 执行卡牌效果
   * @param {object} card - 卡牌
   * @param {object} effect - 效果
   * @param {object} context - 上下文
   */
  executeCardEffect(card, effect, context) {
    const cardEffect = new CardEffect(this);
    return cardEffect.execute(card, { ...context, card, effect });
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

    const hasCharge = card.effect?.charge || card.effect?.rush;
    const hasRush = card.effect?.rush;

    const minion = {
      uid: this.generateUid(),
      id: card.id,
      name: card.name,
      attack: card.effect?.attack || 0,
      health: card.effect?.health || 0,
      maxHealth: card.effect?.health || 0,
      canAttack: hasCharge || false, // 有冲锋或突袭可以直接攻击
      hasAttacked: false,
      frozen: false,
      sleeping: !hasCharge && !hasRush, // 突袭和冲锋随从本回合可以攻击（但不包含英雄）
      canAttackHero: hasCharge || false, // 只有冲锋可以打脸，突袭不行
      taunt: card.effect?.taunt || false,
      rush: hasRush || false,
      reborn: card.effect?.reborn || false,
      effects: []
    };

    // 存储战吼和亡语到随从对象
    minion.battlecry = card.effect?.battlecry || null;
    minion.deathrattle = card.effect?.deathrattle || null;
    // 存储激励效果
    minion.inspire = card.effect?.inspire || null;
    // 存储法术爆发效果
    minion.spellburst = card.effect?.spellburst || null;
    minion.spellburstUsed = false;
    // 存储双生效果
    minion.twin = card.effect?.twin || false;
    // 存储荣誉击杀效果
    minion.honorableKill = card.effect?.honorableKill || null;

    // 休眠处理
    if (card.effect?.dormant) {
      minion.dormant = {
        turns: card.effect.dormant.turns || 2,
        awakened: false,
        wakeEffect: card.effect.dormant.effect || null
      };
      minion.sleeping = true;
      minion.canAttack = false;
      Logger.info(`${minion.name} 进入休眠状态，将在未来 ${minion.dormant.turns} 回合后唤醒`);
    }

    // 休眠处理
    if (card.effect?.dormant) {
      minion.dormant = {
        turns: card.effect.dormant.turns || 2,
        awakened: false,
        wakeEffect: card.effect.dormant.effect || null
      };
      minion.sleeping = true;
      minion.canAttack = false;
      Logger.info(`${minion.name} 进入休眠状态，将在未来 ${minion.dormant.turns} 回合后唤醒`);
    }

    player.field.push(minion);

    // 触发战吼
    if (minion.battlecry) {
      const cardEffect = new CardEffect(this);
      cardEffect.executeBattlecry(card, { player, target: player, card });
      // 双生机制：战吼触发两次
      if (minion.twin) {
        Logger.info(`${minion.name} 具有双生，战吼再次触发`);
        cardEffect.executeBattlecry(card, { player, target: player, card });
      }
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

    // 处理重生机制 (Reborn)
    const rebornPlayerMinions = deadPlayerMinions.filter(m => m.reborn);
    const rebornAiMinions = deadAiMinions.filter(m => m.reborn);

    // 移除已死亡随从
    player.field = player.field.filter(m => m.health > 0);
    ai.field = ai.field.filter(m => m.health > 0);

    // 复活有重生效果的随从（保留亡语但不算真正死亡）
    rebornPlayerMinions.forEach(minion => {
      minion.health = 1;
      minion.maxHealth = Math.max(minion.maxHealth, 1);
      minion.reborn = false; // 消耗重生
      player.field.push(minion);
      Logger.info(`${minion.name} 重生（1生命）`);
    });

    rebornAiMinions.forEach(minion => {
      minion.health = 1;
      minion.maxHealth = Math.max(minion.maxHealth, 1);
      minion.reborn = false;
      ai.field.push(minion);
      Logger.info(`${minion.name} 重生（1生命）`);
    });

    // 触发亡语（重生随从不触发亡语）
    const trueDeadPlayerMinions = deadPlayerMinions.filter(m => !m.reborn);
    const trueDeadAiMinions = deadAiMinions.filter(m => !m.reborn);

    // 触发玩家随从亡语
    trueDeadPlayerMinions.forEach(minion => {
      if (minion.deathrattle) {
        const cardEffect = new CardEffect(this);
        cardEffect.executeDeathrattle(minion, { player, target: ai, card: minion });
        // 双生机制：亡语触发两次
        if (minion.twin) {
          Logger.info(`${minion.name} 具有双生，亡语再次触发`);
          cardEffect.executeDeathrattle(minion, { player, target: ai, card: minion });
        }
      }
    });

    // 触发敌方随从亡语
    trueDeadAiMinions.forEach(minion => {
      if (minion.deathrattle) {
        const cardEffect = new CardEffect(this);
        cardEffect.executeDeathrattle(minion, { player: ai, target: player, card: minion });
        // 双生机制：亡语触发两次
        if (minion.twin) {
          Logger.info(`${minion.name} 具有双生，亡语再次触发`);
          cardEffect.executeDeathrattle(minion, { player: ai, target: player, card: minion });
        }
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
   * @param {object} savedState - 可以是完整的游戏存档或直接的游戏状态
   */
  loadGame(savedState) {
    // 处理两种格式：
    // 1. 直接的游戏状态 (savedState.state 存在)
    // 2. 包装的存档对象 (savedState.state.state 存在)
    if (savedState.state && savedState.state.state) {
      // 包装格式：从 ProfileData 加载的
      this.state = savedState.state.state;
    } else if (savedState.state) {
      // 直接格式
      this.state = savedState.state;
    } else {
      // 兼容：直接传入状态
      this.state = savedState;
    }

    this.turnManager = new TurnManager(this);

    // 重新初始化 CardEffect 引用
    this.cardEffect = null;

    Logger.info('游戏已加载');
    return true;
  }

  /**
   * 获取存档数据
   */
  getSaveData() {
    // 清理不必要的状态数据，深拷贝避免引用问题
    const stateCopy = JSON.parse(JSON.stringify(this.state));

    return {
      state: stateCopy,
      savedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * 保存当前游戏
   * @param {string} profileId - 玩家存档ID
   */
  saveCurrentGame(profileId) {
    const ProfileData = require('../data/ProfileData');
    const saveData = this.getSaveData();
    return ProfileData.saveGameState(profileId, saveData);
  }

  /**
   * 从存档加载游戏
   * @param {string} profileId - 玩家存档ID
   * @param {string} gameId - 游戏ID
   */
  loadFromSave(profileId, gameId) {
    const ProfileData = require('../data/ProfileData');
    const gameSave = ProfileData.loadGameState(profileId, gameId);

    if (!gameSave) {
      Logger.error('找不到游戏存档');
      return false;
    }

    return this.loadGame(gameSave);
  }

  /**
   * 装备武器
   * @param {object} player - 玩家
   * @param {object} card - 武器卡牌
   */
  equipWeapon(player, card) {
    // 卸下现有武器
    if (player.weapon) {
      Logger.info(`${player.name} 卸下了 ${player.weapon.name}`);
    }

    player.weapon = {
      uid: this.generateUid(),
      id: card.id,
      name: card.name,
      attack: card.effect.attack,
      durability: card.effect.durability,
      poisonous: card.effect.poisonous || false
    };

    Logger.info(`${player.name} 装备了 ${card.name} (${card.effect.attack}/${card.effect.durability})`);
    return true;
  }

  /**
   * 使用英雄技能
   * @param {object} player - 玩家
   */
  useHeroPower(player) {
    const ConfigData = require('../data/ConfigData');
    const BattleCalculator = require('./BattleCalculator');

    const classConfig = ConfigData.getClass(player.hero);
    const heroPower = classConfig?.heroPower;

    if (!heroPower) {
      Logger.warn(`${player.hero} 没有英雄技能`);
      return false;
    }

    // 扣除法力值
    player.mana -= heroPower.cost;
    player.usedHeroPower = true;

    const opponent = this.getOpponent();
    const battleCalc = BattleCalculator;

    switch (heroPower.effect.type) {
      case 'damage':
        battleCalc.calculateDamage(opponent, heroPower.effect.value);
        break;
      case 'faceDamage':
        // 猎人：对敌方英雄造成伤害
        battleCalc.calculateDamage(opponent, heroPower.effect.value);
        break;
      case 'heal':
        // 牧师：恢复生命
        battleCalc.heal(player, heroPower.effect.value);
        break;
      case 'armor':
        battleCalc.gainArmor(player, heroPower.effect.value);
        break;
      case 'draw':
        this.drawCard(player, heroPower.effect.value);
        break;
      case 'totem':
        // 召唤随机图腾
        this.summonMinion(player, { id: 'totem', name: '图腾', effect: { attack: 0, health: 2 } });
        break;
      case 'summon':
        // 圣骑士：召唤随从
        const minion = {
          id: heroPower.effect.id || 'token',
          name: heroPower.effect.name || '随从',
          effect: {
            attack: heroPower.effect.attack || 1,
            health: heroPower.effect.health || 1
          }
        };
        this.summonMinion(player, minion);
        break;
      case 'equipWeapon':
        // 盗贼：装备武器
        player.weapon = {
          id: heroPower.effect.name || 'weapon',
          name: heroPower.effect.name || '武器',
          attack: heroPower.effect.attack || 1,
          durability: heroPower.effect.durability || 2,
          canAttack: true
        };
        Logger.info(`${player.name} 装备了武器 ${player.weapon.name}`);
        break;
      case 'buff':
        // 德鲁伊：获得攻击力和护甲
        if (heroPower.effect.attack) {
          player.attack += heroPower.effect.attack;
        }
        if (heroPower.effect.armor) {
          battleCalc.gainArmor(player, heroPower.effect.armor);
        }
        Logger.info(`${player.name} 获得 +${heroPower.effect.attack} 攻击力 和 +${heroPower.effect.armor} 护甲`);
        break;
      case 'sacrifice':
        // 术士：抽牌并失去生命
        if (heroPower.effect.draw) {
          this.drawCard(player, heroPower.effect.draw);
        }
        if (heroPower.effect.damage) {
          battleCalc.calculateDamage(player, heroPower.effect.damage);
          Logger.info(`${player.name} 使用技能失去 ${heroPower.effect.damage} 点生命`);
        }
        break;
      case 'summonTwice':
        // 死亡骑士：召唤两个随从
        const minion1 = {
          id: heroPower.effect.id || 'token',
          name: heroPower.effect.name || '随从',
          effect: {
            attack: heroPower.effect.attack || 2,
            health: heroPower.effect.health || 2
          }
        };
        const minion2 = { ...minion1 };
        this.summonMinion(player, minion1);
        this.summonMinion(player, minion2);
        break;
      default:
        Logger.warn(`未知的英雄技能类型: ${heroPower.effect.type}`);
    }

    Logger.info(`${player.name} 使用了英雄技能 ${heroPower.name}`);

    // 触发激励效果
    this.triggerInspire(player);

    return true;
  }

  /**
   * 变身成英雄卡
   * @param {object} player - 玩家
   * @param {object} heroCard - 英雄卡
   */
  transformIntoHero(player, heroCard) {
    const oldHero = player.hero;

    // 记录旧英雄的护甲
    const oldArmor = player.armor || 0;

    // 变身 - 更换英雄
    player.hero = heroCard.cardClass;
    player.heroCard = heroCard;

    // 继承护甲 (可选)
    player.armor = oldArmor;

    // 设置新英雄的生命值 (通常为30)
    player.maxHealth = 30;
    player.health = 30;

    // 更换英雄技能
    if (heroCard.heroPower) {
      player.heroPower = {
        id: heroCard.heroPower.id || `${heroCard.id}_power`,
        name: heroCard.heroPower.name,
        cost: heroCard.heroPower.cost || 2,
        description: heroCard.heroPower.description,
        effect: heroCard.heroPower.effect
      };
    }

    // 触发战吼效果 (如果英雄卡有)
    if (heroCard.battlecry) {
      const CardEffect = require('./CardEffect');
      const cardEffect = new CardEffect(this);
      cardEffect.executeBattlecry(heroCard, { player, target: player, card: heroCard });
    }

    Logger.info(`${player.name} 变身为 ${heroCard.name}，获得了新的英雄技能`);

    // 如果有战吼日志
    if (heroCard.text) {
      Logger.info(`英雄卡效果: ${heroCard.text}`);
    }
  }

  /**
   * 触发激励效果
   * @param {object} player - 玩家
   */
  triggerInspire(player) {
    const CardEffect = require('./CardEffect');
    const cardEffect = new CardEffect(this);

    player.field.forEach(minion => {
      if (minion.inspire) {
        cardEffect.execute(minion.inspire, { player, card: minion });
        Logger.info(`${minion.name} 的激励效果被触发`);
      }
    });
  }

  /**
   * 使用武器攻击
   * @param {object} player - 玩家
   * @param {object} target - 目标（玩家或随从）
   */
  attackWithWeapon(player, target) {
    if (!player.weapon) {
      Logger.warn('没有装备武器');
      return false;
    }

    const weapon = player.weapon;
    const BattleCalculator = require('./BattleCalculator');
    const battleCalc = BattleCalculator;

    // 剧毒检查
    if (weapon.poisonous && target.health !== undefined) {
      target.health = 0;
      Logger.info(`${target.name} 被剧毒杀死`);
    } else if (target.armor !== undefined) {
      // 攻击敌方英雄
      battleCalc.attackHero({ attack: weapon.attack, poisonous: weapon.poisonous, owner: player }, target);
    }

    // 减少耐久度
    weapon.durability--;
    Logger.info(`${weapon.name} 耐久度变为 ${weapon.durability}`);

    // 武器损坏
    if (weapon.durability <= 0) {
      player.weapon = null;
      Logger.info(`${weapon.name} 已损坏`);
    }

    return true;
  }

  /**
   * 随从攻击随从
   * @param {object} player - 攻击者所属玩家
   * @param {object} attacker - 攻击随从
   * @param {object} target - 目标随从
   */
  attackMinion(player, attacker, target) {
    const BattleCalculator = require('./BattleCalculator');
    const battleCalc = new BattleCalculator();

    if (!attacker || !target) {
      Logger.warn('攻击目标无效');
      return;
    }

    // 使用 BattleCalculator 进行战斗
    const result = battleCalc.resolveCombat(attacker, target);

    // 标记攻击者已攻击
    attacker.hasAttacked = true;

    // 处理亡语
    this.removeDeadMinions();

    // 检查游戏结束
    this.checkGameEnd();

    return result;
  }

  /**
   * 随从攻击英雄
   * @param {object} player - 攻击者所属玩家
   * @param {object} attacker - 攻击随从
   */
  attackHero(player, attacker) {
    const opponent = player.id === 'player' ? this.state.ai : this.state.player;

    const BattleCalculator = require('./BattleCalculator');
    const battleCalc = new BattleCalculator();

    // 使用 BattleCalculator 攻击英雄
    battleCalc.attackHero(attacker, opponent);

    // 标记攻击者已攻击
    attacker.hasAttacked = true;

    // 检查游戏结束
    this.checkGameEnd();

    return opponent.health;
  }

  /**
   * 检查奥秘触发
   * @param {string} event - 事件类型
   * @param {object} data - 事件数据
   */
  checkSecrets(event, data) {
    const opponent = this.getOpponent();
    if (!opponent.secrets || opponent.secrets.length === 0) return;

    const triggered = [];
    opponent.secrets = opponent.secrets.filter(secret => {
      let shouldTrigger = false;

      switch (secret.trigger) {
        case 'enemy_minion_played':
          shouldTrigger = event === 'minion_played';
          break;
        case 'enemy_attack':
          shouldTrigger = event === 'attack';
          break;
        case 'own_minion_died':
        case 'friendly_minion_died':
          shouldTrigger = event === 'minion_died';
          break;
        case 'enemy_spell_played':
          shouldTrigger = event === 'spell_played';
          break;
        case 'friendly_hero_damaged':
          shouldTrigger = event === 'hero_damaged';
          break;
        case 'enemy_hero_attacked':
          shouldTrigger = event === 'hero_attacked';
          break;
        case 'turn_start':
          shouldTrigger = event === 'turn_start';
          break;
        case 'draw':
          shouldTrigger = event === 'draw';
          break;
      }

      if (shouldTrigger) {
        triggered.push(secret);
        return false; // 移除已触发的奥秘
      }
      return true;
    });

    // 执行触发的奥秘效果
    triggered.forEach(secret => {
      this.triggerSecret(secret, data);
    });
  }

  /**
   * 执行奥秘效果
   * @param {object} secret - 奥秘卡牌
   * @param {object} data - 事件数据
   */
  triggerSecret(secret, data) {
    const player = this.state.player;
    const opponent = this.getOpponent();
    const effect = secret.effect?.effect || secret.effect;

    Logger.info(`${player.name} 的奥秘 ${secret.originalCard?.name || '奥秘'} 被触发`);

    if (!effect) {
      Logger.warn('奥秘没有效果配置');
      return;
    }

    switch (effect.type) {
      case 'damage':
        // 对目标造成伤害
        this.dealDamage(data.target || opponent.hero, effect.value || 1);
        break;

      case 'aoe_damage':
        // 对所有敌人造成伤害
        const enemies = this.getOpponent().minions || [];
        enemies.forEach(minion => {
          this.dealDamage(minion, effect.value || 1);
        });
        // 对敌人英雄造成伤害
        this.dealDamage(opponent.hero, effect.value || 1);
        break;

      case 'freeze':
        // 冻结目标
        if (data.target) {
          this.freezeMinion(data.target);
        }
        break;

      case 'summon':
        // 召唤随从
        if (effect.cardId) {
          this.summonMinion(effect.cardId, player.id);
        }
        break;

      case 'buff':
        // 增益效果
        if (data.target) {
          this.buffMinion(data.target, effect.attack || 0, effect.health || 0);
        }
        break;

      case 'return':
        // 移回手牌
        if (data.target && data.target.minion) {
          this.returnToHand(data.target.minion, player.id);
        }
        break;

      case 'destroy':
        // 消灭随从
        if (data.target) {
          this.destroyMinion(data.target);
        }
        break;

      case 'gain_armor':
        // 获得护甲
        this.gainArmor(player.hero, effect.value || 1);
        break;

      case 'immune_next':
        // 下次免疫
        player.hero.immune = true;
        break;

      case 'counter':
        // 反制法术（取消效果）
        if (data.spell) {
          Logger.info('法术被反制');
          // 取消法术效果
        }
        break;

      case 'transform_health':
        // 改变生命值
        if (data.target) {
          data.target.maxHealth = effect.value;
          data.target.health = Math.min(data.target.health, effect.value);
        }
        break;

      default:
        Logger.warn(`未知的奥秘效果类型: ${effect.type}`);
    }
  }

  /**
   * 选择发现的卡牌
   * @param {number} optionIndex - 选项索引
   * @returns {object} 游戏状态
   */
  selectDiscover(optionIndex) {
    if (!this.state.pendingDiscover) {
      Logger.warn('没有待发现的卡牌');
      return null;
    }

    const discover = this.state.pendingDiscover;
    if (optionIndex < 0 || optionIndex >= discover.options.length) {
      Logger.warn('无效的发现选项索引');
      return null;
    }

    const selectedCard = discover.options[optionIndex];
    discover.callback(selectedCard);
    this.state.pendingDiscover = null;

    return this.getGameState();
  }

  /**
   * 检查休眠随从唤醒
   * @param {object} player - 玩家
   */
  checkDormantWakeup(player) {
    if (!player.field) return;

    player.field.forEach(minion => {
      if (minion.dormant && !minion.dormant.awakened) {
        minion.dormant.turns--;

        if (minion.dormant.turns <= 0) {
          minion.dormant.awakened = true;
          minion.sleeping = false;
          minion.canAttack = true;
          Logger.info(`${minion.name} 醒来了！`);

          if (minion.dormant.wakeEffect) {
            this.executeWakeEffect(minion, minion.dormant.wakeEffect);
          }
        }
      }
    });
  }

  /**
   * 执行唤醒效果
   * @param {object} minion - 随从
   * @param {object} wakeEffect - 唤醒效果
   */
  executeWakeEffect(minion, wakeEffect) {
    const player = this.getCurrentPlayer();
    const opponent = this.getOpponent();

    switch (wakeEffect.type) {
      case 'aoe_damage':
        // 对所有敌人造成伤害
        const battleCalc = require('./BattleCalculator');
        battleCalc.aoeDamage(opponent.field, wakeEffect.value);
        Logger.info(`${minion.name} 唤醒时对所有敌人造成了 ${wakeEffect.value} 点伤害`);
        break;
      case 'damage':
        // 对随机目标造成伤害
        const target = opponent.field.length > 0
          ? opponent.field[Math.floor(Math.random() * opponent.field.length)]
          : opponent;
        if (target.health !== undefined) {
          const bc = require('./BattleCalculator');
          bc.calculateDamage(target, wakeEffect.value);
        } else {
          target.health -= wakeEffect.value;
        }
        Logger.info(`${minion.name} 唤醒时造成了 ${wakeEffect.value} 点伤害`);
        break;
      case 'buff':
        // 增强自身
        if (wakeEffect.attack) minion.attack += wakeEffect.attack;
        if (wakeEffect.health) {
          minion.health += wakeEffect.health;
          minion.maxHealth = Math.max(minion.maxHealth, minion.health);
        }
        Logger.info(`${minion.name} 唤醒时获得了 ${wakeEffect.attack || 0}/${wakeEffect.health || 0} 的增益`);
        break;
      default:
        Logger.warn(`未知的唤醒效果类型: ${wakeEffect.type}`);
    }
  }

  /**
   * 处理回响卡牌 - 回合结束时复制到手中
   * @param {object} player - 玩家
   */
  processEchoCards(player) {
    if (!player.echoCards || player.echoCards.length === 0) return;

    Logger.info(`${player.name} 的回响卡牌将复制到手中`);
    player.echoCards.forEach(card => {
      if (player.hand.length < 10) {
        // 复制卡牌到手中
        const echoCard = { ...card, uid: this.generateUid() };
        player.hand.push(echoCard);
        Logger.info(`${card.name} (回响) 被加入 ${player.name} 的手牌`);
      }
    });
    // 清空回响卡牌列表
    player.echoCards = [];
  }

  /**
   * 腐蚀手牌 - Corrupt 机制
   * @param {object} player - 玩家
   * @param {object} corruptCard - 腐蚀卡牌
   */
  corruptHand(player, corruptCard) {
    if (!player.hand || player.hand.length === 0) return;

    // 找到手牌中费用最低的卡牌
    let minCostCard = null;
    let minCost = Infinity;

    player.hand.forEach(card => {
      // 排除腐蚀卡牌本身和奥秘
      if (card !== corruptCard && !CardType.isSpell(card)) {
        if (card.cost < minCost) {
          minCost = card.cost;
          minCostCard = card;
        }
      }
    });

    if (minCostCard) {
      // 将卡牌变形为腐蚀产物
      minCostCard.id = 'corrupted';
      minCostCard.name = '被腐蚀的随从';
      minCostCard.attack = minCost + 1;
      minCostCard.health = minCost + 1;
      minCostCard.description = `被腐蚀的 ${minCost + 1}/${minCost + 1} 随从`;
      minCostCard.effect = {
        type: 'summon',
        attack: minCost + 1,
        health: minCost + 1
      };
      minCostCard.corrupted = true;
      Logger.info(`${minCostCard.name} 被腐蚀，变成了 ${minCostCard.attack}/${minCostCard.health}`);
    }
  }

  /**
   * 触发法术爆发 - Spellburst 机制
   * @param {object} player - 玩家
   * @param {object} spell - 法术卡牌
   */
  triggerSpellburst(player, spell) {
    if (!spell.effect?.spellburst) return;

    const spellburstEffect = spell.effect.spellburst;
    const opponent = this.getOpponent();

    // 触发战吼效果
    opponent.field.forEach(minion => {
      if (minion.spellburst && !minion.spellburstUsed) {
        const cardEffect = new CardEffect(this);
        cardEffect.execute(minion.spellburst, {
          player,
          target: minion,
          card: minion
        });
        minion.spellburstUsed = true;
        Logger.info(`${minion.name} 的法术爆发效果被触发`);
      }
    });

    // 触发自身效果
    player.field.forEach(minion => {
      if (minion.spellburst && !minion.spellburstUsed) {
        const cardEffect = new CardEffect(this);
        cardEffect.execute(minion.spellburst, {
          player,
          target: minion,
          card: minion
        });
        minion.spellburstUsed = true;
        Logger.info(`${minion.name} 的法术爆发效果被触发`);
      }
    });
  }

  /**
   * 处理双生机制 - Twin
   * @param {object} player - 玩家
   * @param {object} minion - 随从
   */
  handleTwin(player, minion) {
    if (!minion.twin) return;

    // 双生随从触发两次效果
    Logger.info(`${minion.name} 具有双生，效果将触发两次`);

    // 复制一份随从信息用于第二次触发
    const minionCopy = { ...minion };
  }

  /**
   * 触发荣誉击杀 - Honorable Kill
   * @param {object} attacker - 攻击方随从
   * @param {object} target - 目标随从
   * @param {object} player - 攻击者所属玩家
   */
  triggerHonorableKill(attacker, target, player) {
    if (!attacker.honorableKill) return;

    const effect = attacker.honorableKill;
    const cardEffect = new CardEffect(this);

    // 荣誉击杀触发效果
    if (effect.type === 'buff') {
      // 增强所有友方随从
      player.field.forEach(m => {
        if (effect.attack) m.attack += effect.attack;
        if (effect.health) {
          m.health += effect.health;
          m.maxHealth = Math.max(m.maxHealth, m.health);
        }
      });
      Logger.info(`${attacker.name} 荣誉击杀，友方随从获得 +${effect.attack || 0}/+${effect.health || 0}`);
    } else if (effect.type === 'draw_card') {
      this.drawCard(player, effect.value || 1);
      Logger.info(`${attacker.name} 荣誉击杀，${player.name} 抽 ${effect.value || 1} 张牌`);
    }
  }

  /**
   * 检查休眠随从唤醒
   * @param {object} player - 玩家
   */
  checkDormantWakeup(player) {
    if (!player.field) return;

    player.field.forEach(minion => {
      if (minion.dormant && !minion.dormant.awakened) {
        minion.dormant.turns--;

        if (minion.dormant.turns <= 0) {
          minion.dormant.awakened = true;
          minion.sleeping = false;
          minion.canAttack = true;
          Logger.info(`${minion.name} 醒来了！`);

          if (minion.dormant.wakeEffect) {
            this.executeWakeEffect(minion, minion.dormant.wakeEffect);
          }
        }
      }
    });
  }

  /**
   * 执行唤醒效果
   * @param {object} minion - 随从
   * @param {object} wakeEffect - 唤醒效果
   */
  executeWakeEffect(minion, wakeEffect) {
    const player = this.getCurrentPlayer();
    const opponent = this.getOpponent();

    switch (wakeEffect.type) {
      case 'aoe_damage':
        // 对所有敌人造成伤害
        const battleCalc = require('./BattleCalculator');
        battleCalc.aoeDamage(opponent.field, wakeEffect.value);
        Logger.info(`${minion.name} 唤醒时对所有敌人造成了 ${wakeEffect.value} 点伤害`);
        break;
      case 'damage':
        // 对随机目标造成伤害
        const target = opponent.field.length > 0
          ? opponent.field[Math.floor(Math.random() * opponent.field.length)]
          : opponent;
        if (target.health !== undefined) {
          const bc = require('./BattleCalculator');
          bc.calculateDamage(target, wakeEffect.value);
        } else {
          target.health -= wakeEffect.value;
        }
        Logger.info(`${minion.name} 唤醒时造成了 ${wakeEffect.value} 点伤害`);
        break;
      case 'buff':
        // 增强自身
        if (wakeEffect.attack) minion.attack += wakeEffect.attack;
        if (wakeEffect.health) {
          minion.health += wakeEffect.health;
          minion.maxHealth = Math.max(minion.maxHealth, minion.health);
        }
        Logger.info(`${minion.name} 唤醒时获得了 ${wakeEffect.attack || 0}/${wakeEffect.health || 0} 的增益`);
        break;
      default:
        Logger.warn(`未知的唤醒效果类型: ${wakeEffect.type}`);
    }
  }
}

module.exports = GameEngine;
