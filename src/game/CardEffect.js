/**
 * 卡牌效果系统
 */

const BattleCalculator = require('./BattleCalculator');
const Logger = require('../utils/logger');
const CardData = require('../data/CardData');

class CardEffect {
  static TYPES = {
    DAMAGE: 'damage',
    DAMAGE_FREEZE: 'damage_freeze',
    HEAL: 'heal',
    DRAW_CARD: 'draw_card',
    SUMMON: 'summon',
    SECRET: 'secret',
    ARMOR: 'armor',
    RANDOM_DAMAGE: 'random_damage',
    AOE_DAMAGE: 'aoe_damage',
    FREEZE_ALL: 'freeze_all',
    TRANSFORM: 'transform',
    CHARGE: 'charge',
    BUFF: 'buff',
    WEAPON: 'weapon',
    EXECUTE: 'execute',
    CLEAVE: 'cleave',
    DRAW_INJURED: 'draw_injured',
    MORTAL_STRIKE: 'mortal_strike',
    BRAWL: 'brawl',
    BATTLECRY: 'battlecry',
    DEATHRATTLE: 'deathrattle',
    SILENCE: 'silence',
    // 新增机制
    WINDURY: 'windfury',
    STEALTH: 'stealth',
    POISONOUS: 'poisonous',
    EVOLVE: 'evolve',
    OVERLOAD: 'overload',
    COMBO: 'combo',
    DIVINE_SHIELD: 'divine_shield',
    IMMUNE: 'immune',
    CHOOSE: 'choose',
    LIFESTEAL: 'lifesteal',
    DISCOVER: 'discover',
    INSPIRE: 'inspire',
    // 任务机制
    QUEST: 'quest',
    REWARD: 'reward',
    // 休眠机制
    DORMANT: 'dormant',
    // 新增机制
    ECHO: 'echo',
    REBORN: 'reborn',
    CORRUPT: 'corrupt',
    SPELLBURST: 'spellburst',
    TWIN: 'twin',
    HONORABLE_KILL: 'honorable_kill',
    HERO: 'hero'
  };

  constructor(gameEngine) {
    this.game = gameEngine;
    this.battleCalc = BattleCalculator;
  }

  /**
   * 获取法术需要的目标类型
   * @param {object} card - 卡牌
   * @returns {string} targetType: 'single'(单体) | 'none'(无目标) | 'all'(全场) | 'hero'(自己英雄)
   */
  getTargetType(card) {
    if (!card || !card.effect) return 'none';

    const type = card.effect.type;

    // 需要单体目标（打敌方随从或英雄）
    if (['damage', 'damage_freeze', 'execute', 'transform', 'heal'].includes(type)) {
      return 'single';
    }

    // 英雄目标（给自己）
    if (['armor'].includes(type)) {
      return 'hero';
    }

    // 无目标
    if (['draw_card', 'charge', 'secret'].includes(type)) {
      return 'none';
    }

    // 全场/随机
    if (['aoe_damage', 'freeze_all', 'random_damage'].includes(type)) {
      return 'all';
    }

    return 'none';
  }

  /**
   * 执行卡牌效果
   * @param {object} card - 卡牌
   * @param {object} context - 上下文 { player, target, etc }
   * @returns {boolean} 是否成功
   */
  execute(card, context) {
    const effect = card.effect;
    if (!effect) {
      Logger.warn('卡牌没有效果:', card.name);
      return false;
    }

    try {
      switch (effect.type) {
        case 'damage':
          return this.executeDamage(effect, context);
        case 'damage_freeze':
          return this.executeDamageFreeze(effect, context);
        case 'heal':
          return this.executeHeal(effect, context);
        case 'draw_card':
          return this.executeDrawCard(effect, context);
        case 'summon':
          return this.executeSummon(card, effect, context);
        case 'secret':
          return this.executeSecret(effect, context);
        case 'armor':
          return this.executeArmor(effect, context);
        case 'random_damage':
          return this.executeRandomDamage(effect, context);
        case 'aoe_damage':
          return this.executeAoeDamage(effect, context);
        case 'freeze_all':
          return this.executeFreezeAll(effect, context);
        case 'transform':
          return this.executeTransform(effect, context);
        case 'charge':
          return this.executeCharge(effect, context);
        case 'execute':
          return this.executeExecute(effect, context);
        case 'cleave':
          return this.executeCleave(effect, context);
        case 'draw_injured':
          return this.executeDrawInjured(effect, context);
        case 'mortal_strike':
          return this.executeMortalStrike(effect, context);
        case 'brawl':
          return this.executeBrawl(effect, context);
        case 'evolve':
          return this.executeEvolve(effect, context);
        case 'combo':
          return this.executeCombo(effect, context);
        case 'weapon':
          return this.executeWeapon(effect, context);
        case 'weapon_buff':
          return this.executeWeaponBuff(effect, context);
        case 'weapon_attack':
          return this.executeWeaponAttack(effect, context);
        case 'bounce':
          return this.executeBounce(effect, context);
        case 'steal':
          return this.executeSteal(effect, context);
        case 'totem':
          return this.executeTotem(effect, context);
        case 'mana':
          return this.executeMana(effect, context);
        case 'choose':
          return this.executeChoose(effect, context);
        case 'lifesteal':
          return this.executeLifesteal(effect, context);
        case 'discover':
          return this.executeDiscover(effect, context);
        case 'inspire':
          return this.executeInspire(effect, context);
        default:
          Logger.warn(`未知效果类型: ${effect.type}`);
          return false;
      }
    } catch (err) {
      Logger.error('执行卡牌效果失败:', err);
      return false;
    }
  }

  /**
   * 造成伤害
   */
  executeDamage(effect, context) {
    const target = context.target;
    if (!target) {
      Logger.warn('没有选择目标');
      return false;
    }
    
    if (target.health !== undefined) {
      // 目标是随从
      this.battleCalc.calculateDamage(target, effect.value);
    } else if (target.armor !== undefined) {
      // 目标是玩家
      this.battleCalc.calculateDamage(target, effect.value);
    }
    return true;
  }

  /**
   * 造成伤害并冻结
   */
  executeDamageFreeze(effect, context) {
    const target = context.target;
    if (!target) {
      Logger.warn('没有选择目标');
      return false;
    }
    
    this.battleCalc.calculateDamage(target, effect.value, { freeze: true });
    return true;
  }

  /**
   * 治疗
   */
  executeHeal(effect, context) {
    const target = context.target || context.player;
    this.battleCalc.calculateHeal(target, effect.value);
    return true;
  }

  /**
   * 抽牌
   */
  executeDrawCard(effect, context) {
    const player = context.player;
    this.game.drawCard(player, effect.value);
    return true;
  }

  /**
   * 召唤随从
   */
  executeSummon(card, effect, context) {
    const player = context.player;

    // 检查战场是否已满
    if (player.field.length >= 7) {
      Logger.info(`${player.name} 的战场已满，无法召唤`);
      return false;
    }

    const minion = {
      uid: this.game.generateUid(),
      id: card.id,
      name: card.name,
      attack: effect.attack,
      health: effect.health,
      maxHealth: effect.health,
      canAttack: false,
      hasAttacked: false,
      frozen: false,
      sleeping: true,
      taunt: effect.taunt || false,
      immune: effect.immune || false,
      effects: []
    };

    if (effect.freeze) {
      minion.freeze = true;
    }

    player.field.push(minion);
    Logger.info(`${player.name} 召唤了 ${minion.name}`);
    return true;
  }

  /**
   * 奥秘
   */
  executeSecret(effect, context) {
    const player = context.player;
    if (!player.secrets) player.secrets = [];
    
    player.secrets.push({
      id: 'secret_' + Date.now(),
      trigger: effect.trigger,
      originalCard: context.card
    });
    
    Logger.info(`${player.name} 施放了奥秘 ${context.card.name}`);
    return true;
  }

  /**
   * 护甲
   */
  executeArmor(effect, context) {
    const player = context.target || context.player;
    this.battleCalc.gainArmor(player, effect.value);
    return true;
  }

  /**
   * 随机伤害
   */
  executeRandomDamage(effect, context) {
    const opponent = this.game.getOpponent();
    const targets = [...opponent.field];
    
    if (targets.length === 0) {
      // 随机伤害英雄
      this.battleCalc.calculateDamage(opponent, effect.value);
      return true;
    }

    this.battleCalc.randomDamage(targets, effect.value, effect.count || 1);
    return true;
  }

  /**
   * AOE 伤害
   */
  executeAoeDamage(effect, context) {
    const opponent = this.game.getOpponent();
    this.battleCalc.aoeDamage(opponent.field, effect.value);
    return true;
  }

  /**
   * 冻结所有随从
   */
  executeFreezeAll(effect, context) {
    const opponent = this.game.getOpponent();
    this.battleCalc.freezeAll(opponent.field);
    return true;
  }

  /**
   * 变形
   */
  executeTransform(effect, context) {
    const target = context.target;
    if (!target || target.health === undefined) {
      Logger.warn('没有有效的变形目标');
      return false;
    }

    // 变成1/1的绵羊
    target.id = 'sheep';
    target.name = '绵羊';
    target.attack = 1;
    target.health = 1;
    target.maxHealth = 1;
    target.frozen = false;
    target.transformed = true;
    
    Logger.info(`${target.name} 被变形为绵羊`);
    return true;
  }

  /**
   * 冲锋
   */
  executeCharge(effect, context) {
    // 暂时只是标记，后续攻击时检查
    context.minions = context.player.field;
    Logger.info('冲锋效果已应用');
    return true;
  }

  /**
   * 斩杀
   */
  executeExecute(effect, context) {
    const target = context.target;
    if (!target || target.health === undefined) {
      Logger.warn('没有有效的斩首目标');
      return false;
    }

    if (target.health < target.maxHealth) {
      target.health = 0;
      Logger.info(`${target.name} 被斩首`);
      return true;
    }
    
    Logger.info('目标生命值满，无法斩首');
    return false;
  }

  /**
   * 顺劈
   */
  executeCleave(effect, context) {
    const target = context.target;
    if (!target || target.health === undefined) {
      Logger.warn('没有有效的顺劈目标');
      return false;
    }

    // 找到相邻随从
    const opponent = this.game.getOpponent();
    const idx = opponent.field.indexOf(target);
    
    // 对目标造成伤害
    this.battleCalc.calculateDamage(target, effect.value);
    
    // 对相邻随从造成伤害
    if (idx > 0) {
      this.battleCalc.calculateDamage(opponent.field[idx - 1], effect.value);
    }
    if (idx < opponent.field.length - 1) {
      this.battleCalc.calculateDamage(opponent.field[idx + 1], effect.value);
    }
    
    return true;
  }

  /**
   * 战斗怒火 - 受伤随从抽牌
   */
  executeDrawInjured(effect, context) {
    const player = context.player;
    const injuredCount = player.field.filter(m => m.health < m.maxHealth).length;
    
    if (injuredCount > 0) {
      this.game.drawCard(player, injuredCount);
      Logger.info(`${player.name} 因战斗怒火抽了 ${injuredCount} 张牌`);
    }
    return true;
  }

  /**
   * 致死打击
   */
  executeMortalStrike(effect, context) {
    const player = context.player;
    const value = player.health <= 12 ? effect.value_low : effect.value;
    
    const target = context.target;
    if (target) {
      this.battleCalc.calculateDamage(target, value);
    } else {
      const opponent = this.game.getOpponent();
      this.battleCalc.calculateDamage(opponent, value);
    }
    return true;
  }

  /**
   * 绝命乱斗
   */
  executeBrawl(effect, context) {
    const player = this.game.getCurrentPlayer();
    const opponent = this.game.getOpponent();

    // 收集所有随从
    const allMinions = [...player.field, ...opponent.field];

    if (allMinions.length === 0) return true;

    // 杀死所有随从
    allMinions.forEach(m => {
      m.health = 0;
    });

    // 同步清理死亡的随从
    player.field = player.field.filter(m => m.health > 0);
    opponent.field = opponent.field.filter(m => m.health > 0);

    // 随机一个存活
    if (player.field.length > 0) {
      const survivor = player.field[Math.floor(Math.random() * player.field.length)];
      Logger.info(`${survivor.name} 在绝命乱斗中存活`);
    }

    return true;
  }

  /**
   * 执行战吼效果
   */
  executeBattlecry(card, context) {
    const battlecry = card.effect?.battlecry;
    if (!battlecry) return false;

    const effect = { ...battlecry };
    // 处理特殊参数
    if (effect.card_id) {
      const summonCard = CardData.getCard(effect.card_id);
      if (summonCard) {
        effect.summonCard = summonCard;
      }
    }

    let result = false;
    switch (effect.type) {
      case 'damage':
        result = this.executeDamage(effect, context);
        break;
      case 'heal':
        result = this.executeHeal(effect, context);
        break;
      case 'draw_card':
        result = this.executeDrawCard(effect, context);
        break;
      case 'armor':
        result = this.executeArmor(effect, context);
        break;
      case 'summon':
        result = this.executeSummon(effect.summonCard || effect, effect, context);
        break;
      case 'buff':
        result = this.executeBuff(effect, context);
        break;
      case 'silence':
        result = this.executeSilence(effect, context);
        break;
    }
    return result;
  }

  /**
   * 执行亡语效果
   */
  executeDeathrattle(minion, context) {
    const deathrattle = minion.deathrattle;
    if (!deathrattle) return false;

    const opponent = this.game.getOpponent();
    let result = false;

    switch (deathrattle.type) {
      case 'summon':
        if (deathrattle.card_id) {
          const summonCard = CardData.getCard(deathrattle.card_id);
          if (summonCard) {
            this.game.summonMinion(context.player, summonCard);
            result = true;
          }
        }
        break;
      case 'damage':
        if (opponent && deathrattle.value) {
          opponent.health -= deathrattle.value;
          result = true;
        }
        break;
      case 'draw_card':
        this.game.drawCard(context.player, deathrattle.value || 1);
        result = true;
        break;
      case 'buff':
        context.player.field.forEach(m => {
          m.attack += (deathrattle.attack || 0);
          m.health += (deathrattle.health || 0);
          m.maxHealth = Math.max(m.maxHealth, m.health);
        });
        result = true;
        break;
    }
    return result;
  }

  /**
   * 执行buff效果
   */
  executeBuff(effect, context) {
    if (!context.target || context.target.health === undefined) {
      Logger.warn('Buff目标无效');
      return false;
    }

    if (effect.value !== undefined) {
      const value = typeof effect.value === 'number' ? effect.value : parseInt(effect.value, 10);
      if (!isNaN(value)) {
        context.target.attack += value;
      }
    }
    if (effect.health !== undefined) {
      const health = typeof effect.health === 'number' ? effect.health : parseInt(effect.health, 10);
      if (!isNaN(health)) {
        context.target.health += health;
        context.target.maxHealth = Math.max(context.target.maxHealth, context.target.health);
      }
    }
    if (effect.taunt) {
      context.target.taunt = true;
    }
    return true;
  }

  /**
   * 执行沉默效果
   */
  executeSilence(effect, context) {
    if (!context.target || context.target.health === undefined) {
      Logger.warn('Silence目标无效');
      return false;
    }

    // 清除所有关键词效果
    context.target.taunt = false;
    context.target.frozen = false;
    context.target.sleeping = false;
    context.target.buffs = [];

    // 清除战吼和亡语
    context.target.battlecry = null;
    context.target.deathrattle = null;

    // 清除冲锋
    context.target.charge = false;

    // 清除圣盾
    context.target.divine_shield = false;

    // 清除剧毒
    context.target.poisonous = false;

    // 清除潜行
    context.target.stealth = false;

    // 清除免疫
    context.target.immune = false;

    // 清除风怒
    context.target.windfury = false;

    Logger.info(`沉默效果已应用于 ${context.target.name}`);
    return true;
  }

  /**
   * 进化 - 随机使友方随从获得+1/+1
   */
  executeEvolve(effect, context) {
    const { player } = context;
    if (!player.field || player.field.length === 0) {
      Logger.info('战场上没有随从可以进化');
      return false;
    }

    const evolveCount = effect.count || 1;

    for (let i = 0; i < evolveCount && player.field.length > 0; i++) {
      const randomMinion = player.field[Math.floor(Math.random() * player.field.length)];
      randomMinion.attack += 1;
      randomMinion.health += 1;
      randomMinion.maxHealth = Math.max(randomMinion.maxHealth + 1, randomMinion.health);
      Logger.info(`${randomMinion.name} 进化了! (+1/+1)`);
    }
    return true;
  }

  /**
   * 连击 - 根据手牌数量增强效果
   */
  executeCombo(effect, context) {
    const { player, card } = context;
    const handCount = player.hand ? player.hand.length : 0;

    if (effect.buff && handCount > 0) {
      const buffEffect = { ...effect.buff };
      // 连击时增强效果（手牌>=3时额外+2/+2）
      if (handCount >= 3) {
        buffEffect.value = (buffEffect.value || 0) + 2;
        buffEffect.health = (buffEffect.health || 0) + 2;
        Logger.info('连击触发！效果增强 (+2/+2)');
      }
      return this.executeBuff(buffEffect, context);
    }
    return true;
  }

  /**
   * 装备武器
   */
  executeWeapon(effect, context) {
    const { player, card } = context;
    this.game.equipWeapon(player, card);
    return true;
  }

  /**
   * 武器 buff
   */
  executeWeaponBuff(effect, context) {
    const { player } = context;
    if (!player.weapon) {
      Logger.warn('没有装备武器');
      return false;
    }

    if (effect.value) {
      player.weapon.attack += effect.value;
    }
    if (effect.poisonous) {
      player.weapon.poisonous = true;
    }

    Logger.info(`${player.weapon.name} 获得增益: 攻击力+${effect.value || 0}, 剧毒=${effect.poisonous || false}`);
    return true;
  }

  /**
   * 武器攻击（刀扇等）
   */
  executeWeaponAttack(effect, context) {
    const { player } = context;
    if (!player.weapon) {
      Logger.warn('没有装备武器');
      return false;
    }

    const damage = player.weapon.attack;
    const opponent = this.game.getOpponent();

    // 对所有敌人造成伤害
    this.battleCalc.aoeDamage(opponent.field, damage);

    // 消耗耐久度
    player.weapon.durability--;
    if (player.weapon.durability <= 0) {
      player.weapon = null;
      Logger.info('武器已损坏');
    }

    return true;
  }

  /**
   * 随从回归手牌
   */
  executeBounce(effect, context) {
    const { target, player } = context;
    if (!target || target.health === undefined) {
      Logger.warn('没有有效的弹回目标');
      return false;
    }

    // 找到目标的所有者
    const owner = target.id === player.id ? player : this.game.getOpponent();

    // 如果手牌已满
    if (owner.hand.length >= 10) {
      Logger.info(`${owner.name} 的手牌已满，${target.name} 无法返回`);
      return false;
    }

    // 从场上移除
    const field = owner.field;
    const idx = field.indexOf(target);
    if (idx > -1) {
      field.splice(idx, 1);
      // 加入手牌
      owner.hand.push(target);
      Logger.info(`${target.name} 返回 ${owner.name} 的手牌`);
    }

    return true;
  }

  /**
   * 获得随从控制权
   */
  executeSteal(effect, context) {
    const { target, player } = context;
    if (!target || target.health === undefined) {
      Logger.warn('没有有效的偷取目标');
      return false;
    }

    const opponent = this.game.getOpponent();

    // 从对方战场移除
    const idx = opponent.field.indexOf(target);
    if (idx > -1) {
      opponent.field.splice(idx, 1);
      // 加入自己战场
      player.field.push(target);
      Logger.info(`${player.name} 获得了 ${target.name} 的控制权`);
    }

    return true;
  }

  /**
   * 召唤图腾
   */
  executeTotem(effect, context) {
    const { player } = context;
    const totemTypes = [
      { name: '力量图腾', attack: 0, health: 2 },
      { name: '治疗图腾', attack: 0, health: 2 },
      { name: '灼热图腾', attack: 1, health: 1 },
      { name: '石爪图腾', attack: 0, health: 2 }
    ];

    const totem = totemTypes[Math.floor(Math.random() * totemTypes.length)];

    this.game.summonMinion(player, {
      id: 'totem',
      name: totem.name,
      effect: { attack: totem.attack, health: totem.health }
    });

    return true;
  }

  /**
   * 法力水晶操作
   */
  executeMana(effect, context) {
    const { player } = context;
    if (effect.value) {
      player.mana = Math.min(player.mana + effect.value, 10);
      Logger.info(`${player.name} 获得 ${effect.value} 点法力水晶`);
    }
    return true;
  }

  /**
   * 抉择 - 选择两种效果之一
   */
  executeChoose(effect, context) {
    // 返回抉择信息给 UI，让玩家选择
    return {
      choose: true,
      card: context.card,
      choice1: effect.choice1,
      choice2: effect.choice2
    };
  }

  // ========== 新增机制处理方法 ==========

  /**
   * 处理风怒
   */
  handleWindfury(target, context) {
    target.windfury = true;
    Logger.info(`${target.name} 获得风怒`);
  }

  /**
   * 处理圣盾
   */
  handleDivineShield(target, context) {
    target.divine_shield = true;
    Logger.info(`${target.name} 获得圣盾`);
  }

  /**
   * 处理潜行
   */
  handleStealth(target, context) {
    target.stealth = true;
    Logger.info(`${target.name} 获得潜行`);
  }

  /**
   * 处理剧毒
   */
  handlePoisonous(attacker, target, context) {
    if (target && target.health !== undefined) {
      target.health = 0;
      Logger.info(`${target.name} 被剧毒杀死`);
    }
  }

  /**
   * 执行吸血效果
   */
  executeLifesteal(effect, context) {
    // 吸血效果需要标记到攻击/伤害上
    // 实际处理在 BattleCalculator 中
    if (!context.target) {
      Logger.warn('吸血效果执行失败: 目标不存在');
      return false;
    }
    context.target.lifesteal = true;
    return true;
  }

  /**
   * 执行发现效果
   */
  executeDiscover(effect, context) {
    const DiscoverPool = require('./DiscoverPool');
    const discoverPool = new DiscoverPool(this.game);

    const discoverType = effect.discoverType || 'class';
    const options = discoverPool.getDiscoverOptions(
      discoverType,
      context.player.hero,
      3
    );

    // 设置待抉择状态
    this.game.state.pendingDiscover = {
      player: context.player,
      options: options,
      card: context.card,
      callback: (selectedCard) => {
        // 将选中的卡牌加入手牌
        context.player.hand.push(selectedCard);
        Logger.info(`${context.player.name} 发现了 ${selectedCard.name}`);
      }
    };

    return true;
  }

  /**
   * 处理冲锋（使随从可以攻击）
   */
  handleCharge(minion) {
    if (minion) {
      minion.canAttack = true;
      minion.sleeping = false;
      Logger.info(`${minion.name} 获得冲锋`);
    }
  }

  /**
   * 处理嘲讽
   */
  handleTaunt(minion) {
    if (minion) {
      minion.taunt = true;
      Logger.info(`${minion.name} 获得嘲讽`);
    }
  }

  /**
   * 执行激励效果
   */
  executeInspire(effect, context) {
    switch (effect.action) {
      case 'damage':
        const opponent = context.player === this.game.state.player
          ? this.game.state.ai
          : this.game.state.player;
        opponent.health -= effect.value;
        Logger.info(`激励造成 ${effect.value} 点伤害`);
        break;
      case 'heal':
        context.player.health = Math.min(
          context.player.health + effect.value,
          context.player.maxHealth
        );
        break;
      case 'summon':
        if (effect.card_id) {
          const CardData = require('../data/CardData');
          const card = CardData.getCard(effect.card_id);
          if (card) {
            this.game.summonMinion(context.player, card);
          }
        }
        break;
      case 'armor':
        context.player.armor += effect.value;
        break;
      case 'draw_card':
        this.game.drawCard(context.player, effect.value || 1);
        break;
      case 'buff':
        context.player.field.forEach(m => {
          if (effect.attack) m.attack += effect.attack;
          if (effect.health) m.health += effect.health;
          if (effect.divine_shield) m.divine_shield = true;
        });
        break;
    }
    return true;
  }
}

module.exports = CardEffect;
