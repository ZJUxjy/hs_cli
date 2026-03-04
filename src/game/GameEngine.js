/**
 * 游戏引擎 - 核心游戏逻辑
 */

const CardData = require('../data/CardData');
const ConfigData = require('../data/ConfigData');
const TurnManager = require('./TurnManager');
const CardEffect = require('./CardEffect');
const Logger = require('../utils/logger');
const i18n = require('../i18n');

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
    // 使用带effect的卡牌数据，只保留可收集的随从和法术
    const allCards = CardData.getCardsByClassWithEffect(heroClass);

    const classCards = allCards.filter(c =>
      c.collectible && (c.type === 'MINION' || c.type === 'SPELL')
    );

    // 如果筛选后卡牌太少，回退到所有卡
    const cardsToUse = classCards.length >= 10 ? classCards : allCards;

    // 构建初始套牌 (复制卡牌，避免引用问题)
    // 使用多套卡牌填充到30张
    let deck = [];
    const cardsCopy = cardsToUse.map(c => ({ ...c, uid: this.generateUid() }));
    while (deck.length < 30) {
      deck = deck.concat(cardsCopy);
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
      spellPower: 0,  // 法术伤害加成
      hand: [],
      deck,
      field: [],
      secrets: [],
      usedHeroPower: false,
      fatigueDamage: 0,
      weapon: null,
      locale: 'zh'  // 玩家默认语言
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
      // Echo 卡牌不從手牌移除
    } else {
      // 普通卡牌从手牌移除
      player.hand.splice(cardIndex, 1);
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
      }
    });

    // 触发敌方随从亡语
    trueDeadAiMinions.forEach(minion => {
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
    return true;
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
      battleCalc.attackHero({ attack: weapon.attack, poisonous: weapon.poisonous }, target);
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
          shouldTrigger = event === 'minion_died';
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
   */
  triggerSecret(secret, data) {
    const player = this.state.player;
    Logger.info(`${player.name} 的奥秘 ${secret.originalCard?.name || '奥秘'} 被触发`);

    // 根据奥秘类型执行效果 - 简化处理
    // 实际应根据奥秘ID执行不同效果
  }
}

module.exports = GameEngine;
