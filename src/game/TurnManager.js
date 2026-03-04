/**
 * 回合管理器
 */

const ConfigData = require('../data/ConfigData');
const Logger = require('../utils/logger');
const CardType = require('../utils/cardUtils');

class TurnManager {
  constructor(gameEngine) {
    this.game = gameEngine;
  }

  /**
   * 开始回合
   */
  startTurn() {
    const state = this.game.getGameState();
    const player = this.game.getCurrentPlayer();

    // 如果不是第一回合，增加最大法力值
    if (state.turn > 1) {
      player.maxMana = Math.min(player.maxMana + 1, 10);
    }

    // 处理过载（来自上个回合）- 注意：需要在设置mana之后处理
    // 先恢复法力值（第一回合或之前没有过载）
    player.mana = player.maxMana;

    // 然后应用过载锁定
    if (player.overload && player.overload > 0) {
      const overloadedMana = Math.max(0, player.maxMana - player.overload);
      player.mana = overloadedMana;
      Logger.info(`${player.hero} 本回合过载锁定 ${player.overload} 点法力`);
      player.overload = 0;
    }

    // 重置当前法力值（已完成，包含在上面）
    // 重置英雄技能
    player.usedHeroPower = false;
    
    // 抽一张牌
    this.game.drawCard(player, 1);

    // 处理回响卡牌 - 回合开始时复制回响卡牌到手中
    this.game.processEchoCards(player);

    // 重置法术爆发状态
    player.field.forEach(minion => {
      minion.spellburstUsed = false;
    });

    // 唤醒所有随从（解除冻结）
    player.field.forEach(minion => {
      minion.sleeping = false;
      if (minion.frozen) {
        // 回合结束时解冻，这里标记一下
      }
    });

    // 检查休眠随从唤醒（当前玩家和对手）
    this.game.checkDormantWakeup(this.game.state.player);
    this.game.checkDormantWakeup(this.game.state.ai);

    // 随从可以攻击
    player.field.forEach(minion => {
      minion.canAttack = !minion.sleeping && !minion.frozen && !minion.hasAttacked;
    });

    state.phase = 'main';
    // 不需要设置 currentPlayer，switchTurn 已经设置好了
    state.message = `${player.name} 的回合`;

    Logger.info(`回合 ${state.turn} - ${player.name} 的回合`);
    
    return state;
  }

  /**
   * 结束回合
   */
  endTurn() {
    const state = this.game.getGameState();
    
    // 结束当前玩家回合
    const currentPlayer = this.game.getCurrentPlayer();
    currentPlayer.field.forEach(m => {
      m.hasAttacked = false;
      m.sleeping = true;
    });

    // 切换玩家
    this.switchTurn();
  }

  /**
   * 切换到对方回合
   */
  switchTurn() {
    const state = this.game.getGameState();
    
    // 切换当前玩家
    state.currentPlayer = state.currentPlayer === 'player' ? 'ai' : 'player';

    // 如果切换回玩家，回合数+1
    if (state.currentPlayer === 'player') {
      state.turn++;
    }

    // 解冻随从
    const newCurrentPlayer = this.game.getCurrentPlayer();
    newCurrentPlayer.field.forEach(m => {
      if (m.frozen) {
        m.frozen = false;
        Logger.info(`${m.name} 解冻了`);
      }
      m.canAttack = !m.sleeping && !m.frozen && !m.hasAttacked;
    });

    // 清除上一位玩家的攻击状态
    const opponent = this.game.getOpponent();
    opponent.field.forEach(m => {
      m.hasAttacked = false;
    });

    // 检查游戏结束
    if (this.game.checkGameEnd()) {
      return;
    }

    // 开始新回合
    this.startTurn();
  }

  /**
   * 获取可用行动
   */
  getAvailableActions() {
    const state = this.game.getGameState();
    const player = this.game.getCurrentPlayer();
    const actions = [];

    // 可以使用英雄技能
    if (!player.usedHeroPower) {
      const classConfig = ConfigData.getClass(player.hero);
      if (classConfig?.heroPower && player.mana >= classConfig.heroPower.cost) {
        actions.push({ type: 'hero_power' });
      }
    }

    // 可以打出的卡牌
    player.hand.forEach((card, index) => {
      if (card.cost <= player.mana) {
        if (CardType.isMinion(card)) {
          if (player.field.length < 7) {
            actions.push({ type: 'play_card', card, index, targetType: 'none' });
          }
        } else {
          // 法术需要目标
          const targetType = this.getSpellTargetType(card);
          actions.push({ type: 'play_card', card, index, targetType });
        }
      }
    });

    // 可以攻击的随从
    player.field.forEach((minion, index) => {
      if (minion.canAttack && !minion.hasAttacked) {
        const opponent = this.game.getOpponent();
        
        // 攻击敌方随从
        opponent.field.forEach((target, tIndex) => {
          actions.push({ 
            type: 'attack', 
            attacker: minion, 
            attackerIndex: index,
            target, 
            targetIndex: tIndex,
            targetType: 'minion'
          });
        });

        // 攻击英雄
        if (!opponent.field.some(m => m.taunt)) {
          actions.push({ 
            type: 'attack', 
            attacker: minion,
            attackerIndex: index,
            target: opponent, 
            targetType: 'hero'
          });
        }
      }
    });

    // 结束回合
    actions.push({ type: 'end_turn' });

    return actions;
  }

  /**
   * 获取法术目标类型
   */
  getSpellTargetType(card) {
    if (!card.effect) return 'none';
    
    switch (card.effect.type) {
      case 'damage':
      case 'damage_freeze':
      case 'execute':
      case 'transform':
        return 'minion';
      case 'armor':
      case 'heal':
        return 'hero';
      case 'aoe_damage':
      case 'freeze_all':
        return 'all';
      case 'draw_card':
      case 'charge':
      case 'secret':
      case 'brawl':
        return 'none';
      default:
        return 'none';
    }
  }
}

module.exports = TurnManager;
