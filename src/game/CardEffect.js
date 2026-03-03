/**
 * 卡牌效果系统
 */

const BattleCalculator = require('./BattleCalculator');
const Logger = require('../utils/logger');

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
    SILENCE: 'silence'
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
    if (!battlecry) return;

    const effect = { ...battlecry };
    // 处理特殊参数
    if (effect.card_id) {
      const CardData = require('../data/CardData');
      const summonCard = CardData.getCard(effect.card_id);
      if (summonCard) {
        effect.summonCard = summonCard;
      }
    }

    switch (effect.type) {
      case 'damage':
        this.executeDamage(effect, context);
        break;
      case 'heal':
        this.executeHeal(effect, context);
        break;
      case 'draw_card':
        this.executeDrawCard(effect, context);
        break;
      case 'armor':
        this.executeArmor(effect, context);
        break;
      case 'summon':
        this.executeSummon(effect.summonCard || effect, effect, context);
        break;
      case 'buff':
        this.executeBuff(effect, context);
        break;
      case 'silence':
        this.executeSilence(effect, context);
        break;
    }
  }

  /**
   * 执行亡语效果
   */
  executeDeathrattle(minion, context) {
    const deathrattle = minion.deathrattle;
    if (!deathrattle) return;

    switch (deathrattle.type) {
      case 'summon':
        if (deathrattle.card_id) {
          const CardData = require('../data/CardData');
          const summonCard = CardData.getCard(deathrattle.card_id);
          if (summonCard) {
            this.game.summonMinion(context.player, summonCard);
          }
        }
        break;
      case 'damage':
        const opponent = context.player === this.game.state.player
          ? this.game.state.ai
          : this.game.state.player;
        opponent.health -= deathrattle.value;
        break;
      case 'draw_card':
        this.game.drawCard(context.player, deathrattle.value || 1);
        break;
      case 'buff':
        context.player.field.forEach(m => {
          m.attack += (deathrattle.attack || 0);
          m.health += (deathrattle.health || 0);
          m.maxHealth = Math.max(m.maxHealth, m.health);
        });
        break;
    }
  }

  /**
   * 执行buff效果
   */
  executeBuff(effect, context) {
    if (!context.target || context.target.health === undefined) {
      Logger.warn('Buff目标无效');
      return;
    }

    if (effect.value !== undefined) {
      context.target.attack += effect.value;
    }
    if (effect.health !== undefined) {
      context.target.health += effect.health;
      context.target.maxHealth = Math.max(context.target.maxHealth, context.target.health);
    }
    if (effect.taunt) {
      context.target.taunt = true;
    }
  }

  /**
   * 执行沉默效果
   */
  executeSilence(effect, context) {
    if (!context.target || context.target.health === undefined) {
      Logger.warn('Silence目标无效');
      return;
    }

    context.target.taunt = false;
    context.target.frozen = false;
    context.target.sleeping = false;
    context.target.buffs = [];
  }
}

module.exports = CardEffect;
