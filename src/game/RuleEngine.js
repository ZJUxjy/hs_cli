/**
 * 规则引擎 - 验证游戏规则
 */

const Logger = require('../utils/logger');

class RuleEngine {
  constructor(gameEngine) {
    this.game = gameEngine;
  }

  /**
   * 检查是否可以打牌
   * @param {object} player - 玩家
   * @param {object} card - 卡牌
   * @returns {object} { valid: boolean, reason: string }
   */
  canPlayCard(player, card) {
    // 检查费用
    if (player.mana < card.cost) {
      return { valid: false, reason: '法力值不足' };
    }

    // 检查手牌
    if (!player.hand.includes(card)) {
      return { valid: false, reason: '手牌中没有这张卡' };
    }

    // 检查随从数量
    if (card.type === 'minion') {
      const maxField = 7;
      if (player.field.length >= maxField) {
        return { valid: false, reason: '战场已满' };
      }
    }

    return { valid: true };
  }

  /**
   * 检查是否可以攻击
   * @param {object} attacker - 攻击方随从
   * @param {object} target - 目标 (随从或玩家)
   * @param {object} opponent - 对手
   * @returns {object} { valid: boolean, reason: string }
   */
  canAttack(attacker, target, opponent) {
    // 检查是否被冻结
    if (attacker.frozen) {
      return { valid: false, reason: '随从被冻结' };
    }

    // 检查本回合是否已经攻击
    if (attacker.hasAttacked) {
      return { valid: false, reason: '本回合已攻击' };
    }

    // 检查是否沉睡 (新召唤的随从)
    if (attacker.sleeping) {
      return { valid: false, reason: '随从本回合无法攻击' };
    }

    // 如果有嘲讽随从，必须先攻击嘲讽
    if (opponent && opponent.field) {
      const hasTaunt = opponent.field.some(m => m.taunt);
      if (hasTaunt) {
        // 检查目标是否是嘲讽随从
        const isTauntTarget = target && target.taunt;
        // 如果目标是玩家英雄 (health !== undefined)，则不能攻击
        if (target && target.health !== undefined && target.armor !== undefined) {
          // 目标是玩家英雄
          return { valid: false, reason: '必须先攻击嘲讽随从' };
        }
        if (!isTauntTarget) {
          return { valid: false, reason: '必须先攻击嘲讽随从' };
        }
      }
    }

    return { valid: true };
  }

  /**
   * 检查是否可以使用英雄技能
   * @param {object} player - 玩家
   * @returns {object} { valid: boolean, reason: string }
   */
  canUseHeroPower(player) {
    if (player.usedHeroPower) {
      return { valid: false, reason: '本回合已使用英雄技能' };
    }

    const classConfig = this.game.state ? this.game.state[player.id] : null;
    // 需要获取职业配置，这里简化处理
    const heroPower = player.hero === 'mage' 
      ? { cost: 2, name: '火焰冲击' }
      : { cost: 2, name: '全副武装' };

    if (player.mana < heroPower.cost) {
      return { valid: false, reason: '法力值不足' };
    }

    return { valid: true };
  }

  /**
   * 验证行动
   * @param {object} action - 行动
   * @returns {object} { valid: boolean, reason: string }
   */
  validateAction(action) {
    const state = this.game.getGameState();
    if (!state) return { valid: false, reason: '游戏未开始' };

    switch (action.type) {
      case 'play_card':
        const player = this.game.getCurrentPlayer();
        return this.canPlayCard(player, action.card);
        
      case 'attack':
        const currentPlayer = this.game.getCurrentPlayer();
        const opponent = this.game.getOpponent();
        return this.canAttack(action.attacker, action.target, opponent);
        
      case 'hero_power':
        const p = this.game.getCurrentPlayer();
        return this.canUseHeroPower(p);
        
      default:
        return { valid: false, reason: '未知行动类型' };
    }
  }

  /**
   * 获取可用行动
   * @returns {array}
   */
  getAvailableActions() {
    const state = this.game.getGameState();
    if (!state) return [];

    const player = this.game.getCurrentPlayer();
    const opponent = this.game.getOpponent();
    const actions = [];

    // 可以使用英雄技能
    if (!player.usedHeroPower) {
      const hp = player.hero === 'mage'
        ? { cost: 2 }
        : { cost: 2 };
      if (player.mana >= hp.cost) {
        actions.push({ type: 'hero_power' });
      }
    }

    // 可以打出的卡牌
    player.hand.forEach((card, index) => {
      const canPlay = this.canPlayCard(player, card);
      if (canPlay.valid) {
        actions.push({ type: 'play_card', card, index });
      }
    });

    // 可以攻击的随从
    player.field.forEach((minion, idx) => {
      if (this.canAttack(minion, null, opponent).valid) {
        // 攻击敌方英雄
        if (!opponent.field.some(m => m.taunt)) {
          actions.push({ type: 'attack', attacker: minion, attackerIndex: idx, targetType: 'hero' });
        }
        
        // 攻击敌方随从
        opponent.field.forEach((target, tIdx) => {
          if (this.canAttack(minion, target, opponent).valid) {
            actions.push({ type: 'attack', attacker: minion, attackerIndex: idx, target, targetIndex: tIdx, targetType: 'minion' });
          }
        });
      }
    });

    // 结束回合
    actions.push({ type: 'end_turn' });

    return actions;
  }
}

module.exports = RuleEngine;
