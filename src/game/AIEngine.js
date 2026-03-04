/**
 * AI 引擎 - 电脑对手逻辑
 */

const Logger = require('../utils/logger');
const CardEffect = require('./CardEffect');
const BattleCalculator = require('./BattleCalculator');
const CardType = require('../utils/cardUtils');

class AIEngine {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.cardEffect = null;
  }

  init() {
    this.cardEffect = new CardEffect(this.game);
  }

  /**
   * AI 决策 (主要入口)
   */
  async decide() {
    if (!this.cardEffect) this.init();

    const state = this.game.getGameState();
    if (!state || state.phase === 'ended') return;

    const ai = state.ai;
    const player = state.player;

    Logger.info('>>> 敌方思考中...');

    // 简单延迟，模拟思考
    await this.sleep(500);

    // 循环执行行动直到没有可用行动
    let actions = this.getPossibleActions();
    
    while (actions.length > 0 && state.phase !== 'ended') {
      // 选择一个最佳行动
      const action = this.selectBestAction(actions);
      
      if (action) {
        this.executeAction(action);
        
        // 检查游戏是否结束
        if (this.game.checkGameEnd()) break;
      }

      // 重新获取可用行动
      actions = this.getPossibleActions();
    }

    Logger.info('>>> 敌方回合结束');
    
    // 结束回合
    if (state.phase !== 'ended') {
      this.game.switchTurn();
    }
  }

  /**
   * 延时
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取可能的行动
   */
  getPossibleActions() {
    const state = this.game.getGameState();
    const ai = state.ai;
    const player = state.player;
    const actions = [];

    // 1. 使用英雄技能
    if (!ai.usedHeroPower && ai.mana >= 2) {
      actions.push({ type: 'hero_power' });
    }

    // 2. 打出随从
    const playableMinions = ai.hand
      .filter(c => CardType.isMinion(c) && c.cost <= ai.mana && ai.field.length < 7)
      .sort((a, b) => b.cost - a.cost);

    playableMinions.forEach(card => {
      // 检查过载风险
      const overload = card.effect?.overload || 0;
      actions.push({ type: 'play_card', card, targetType: 'none', overload });
    });

    // 3. 打出英雄卡 (高价值，优先打出)
    const heroCards = ai.hand.filter(c => CardType.isHero(c) && c.cost <= ai.mana);
    heroCards.forEach(card => {
      actions.push({ type: 'play_card', card, targetType: 'none', priority: 10 });
    });

    // 4. 打出法术
    const playableSpells = ai.hand
      .filter(c => CardType.isSpell(c) && c.cost <= ai.mana);

    playableSpells.forEach(card => {
      const targetType = this.getSpellTargetType(card);
      
      if (targetType === 'hero') {
        actions.push({ type: 'play_card', card, target: player, targetType });
      } else if (targetType === 'minion' && player.field.length > 0) {
        // 选择血量最低的随从
        const target = this.selectLowestHealthTarget(player.field);
        if (target) {
          actions.push({ type: 'play_card', card, target, targetType });
        }
      } else if (targetType === 'all') {
        actions.push({ type: 'play_card', card, targetType });
      } else {
        // 不需要目标的法术
        actions.push({ type: 'play_card', card, targetType: 'none' });
      }
    });

    // 4. 随从攻击
    const attackers = ai.field.filter(m => m.canAttack && !m.hasAttacked && !m.frozen);

    attackers.forEach(minion => {
      // 优先处理剧毒威胁
      if (player.field.length > 0) {
        // 检查是否有剧毒随从，优先攻击
        const poisonousTarget = player.field.find(m => m.poisonous);
        if (poisonousTarget) {
          actions.push({ type: 'attack', attacker: minion, target: poisonousTarget, targetType: 'minion', priority: 10 });
        }

        // 选择血量最低的随从攻击
        const target = this.selectLowestHealthTarget(player.field);
        if (target && target !== poisonousTarget) {
          actions.push({ type: 'attack', attacker: minion, target, targetType: 'minion' });
        }
      } else if (player.field.length === 0 || !player.field.some(m => m.taunt)) {
        // 没有随从或没有嘲讽，直接攻击英雄
        actions.push({ type: 'attack', attacker: minion, target: player, targetType: 'hero' });
      }
    });

    // 5. 使用武器攻击
    if (ai.weapon && ai.weapon.durability > 0) {
      if (player.field.length > 0) {
        const target = this.selectLowestHealthTarget(player.field);
        actions.push({ type: 'weapon_attack', target });
      } else {
        actions.push({ type: 'weapon_attack', target: player });
      }
    }

    // 6. 结束回合
    if (actions.length > 0) {
      actions.push({ type: 'end_turn' });
    }

    return actions;
  }

  /**
   * 选择最佳行动
   */
  selectBestAction(actions) {
    // 过滤掉结束回合，找出最佳行动
    const actionable = actions.filter(a => a.type !== 'end_turn');
    
    if (actionable.length === 0) {
      // 没有行动可做，结束回合
      return { type: 'end_turn' };
    }

    // 简单策略：优先打英雄卡，然后随从，然后法术，最后攻击
    const heroPlays = actionable.filter(a => a.type === 'play_card' && CardType.isHero(a.card));
    if (heroPlays.length > 0) {
      return heroPlays[0];
    }

    const minionPlays = actionable.filter(a => a.type === 'play_card' && CardType.isMinion(a.card));
    if (minionPlays.length > 0) {
      // 选择费用最高的
      return minionPlays.sort((a, b) => b.card.cost - a.card.cost)[0];
    }

    const spellPlays = actionable.filter(a => a.type === 'play_card' && CardType.isSpell(a.card));
    if (spellPlays.length > 0) {
      return spellPlays[0];
    }

    const attacks = actionable.filter(a => a.type === 'attack');
    if (attacks.length > 0) {
      return attacks[0];
    }

    return { type: 'end_turn' };
  }

  /**
   * 选择血量最低的目标
   */
  selectLowestHealthTarget(minions) {
    if (!minions || minions.length === 0) return null;
    
    return minions.reduce((lowest, current) => {
      return (current.health < lowest.health) ? current : lowest;
    });
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
      case 'cleave':
        return 'minion';
      case 'armor':
      case 'armor_draw':
      case 'heal':
        return 'hero';
      case 'aoe_damage':
      case 'freeze_all':
        return 'all';
      case 'draw_card':
      case 'charge':
      case 'secret':
      case 'brawl':
      case 'random_damage':
      case 'draw_injured':
      case 'mortal_strike':
        return 'none';
      default:
        return 'none';
    }
  }

  /**
   * 执行行动
   */
  executeAction(action) {
    const state = this.game.getGameState();
    const ai = state.ai;

    switch (action.type) {
      case 'hero_power':
        this.executeHeroPower(ai);
        break;

      case 'play_card':
        this.executePlayCard(action);
        break;

      case 'attack':
        this.executeAttack(action);
        break;

      case 'weapon_attack':
        this.executeWeaponAttack(action);
        break;

      case 'end_turn':
        // 结束回合
        break;
    }
  }

  /**
   * 执行英雄技能
   */
  executeHeroPower(player) {
    const opponent = this.game.getOpponent();

    if (player.hero === 'mage') {
      // 法师: 造成1点伤害
      if (opponent.field.length > 0) {
        const target = this.selectLowestHealthTarget(opponent.field);
        this.cardEffect.execute(
          { effect: { type: 'damage', value: 1 } },
          { target, player }
        );
      } else {
        this.cardEffect.execute(
          { effect: { type: 'damage', value: 1 } },
          { target: opponent, player }
        );
      }
    } else if (player.hero === 'warrior') {
      // 战士: 获得2点护甲
      this.cardEffect.execute(
        { effect: { type: 'armor', value: 2 } },
        { player }
      );
    } else if (player.hero === 'hunter') {
      // 猎人: 稳固射击 - 造成1点伤害
      this.cardEffect.execute(
        { effect: { type: 'damage', value: 1 } },
        { target: opponent, player }
      );
    } else if (player.hero === 'paladin') {
      // 圣骑士: 保护之手 - 获得2点护甲
      this.cardEffect.execute(
        { effect: { type: 'armor', value: 2 } },
        { player }
      );
    } else if (player.hero === 'shaman') {
      // 萨满: 图腾召唤 - 随机召唤图腾
      const CardData = require('../data/CardData');
      const totems = ['shaman_healing_totem', 'shaman_searing_totem', 'shaman_stoneclaw_totem'];
      const randomTotem = totems[Math.floor(Math.random() * totems.length)];
      // 简化为直接造成1点伤害
      this.cardEffect.execute(
        { effect: { type: 'damage', value: 1 } },
        { target: opponent, player }
      );
    } else if (player.hero === 'priest') {
      // 牧师: 暗影形态 - 造成1点伤害
      this.cardEffect.execute(
        { effect: { type: 'damage', value: 1 } },
        { target: opponent, player }
      );
    } else if (player.hero === 'rogue') {
      // 盗贼: 疾跑 - 抽2张牌
      this.game.drawCard(player, 2);
    } else if (player.hero === 'druid') {
      // 德鲁伊: 月火术 - 造成1点伤害
      this.cardEffect.execute(
        { effect: { type: 'damage', value: 1 } },
        { target: opponent, player }
      );
    }

    player.usedHeroPower = true;
    player.mana -= 2;
    Logger.info(`>>> 敌方使用了英雄技能`);
  }

  /**
   * 执行打牌
   */
  executePlayCard(action) {
    const state = this.game.getGameState();
    const ai = state.ai;
    const player = state.player;
    const card = action.card;

    // 从手牌移除
    const idx = ai.hand.indexOf(card);
    if (idx > -1) {
      ai.hand.splice(idx, 1);
    }

    // 扣除法力
    ai.mana -= card.cost;

    // 处理过载 - 下回合锁定法力
    if (card.effect && card.effect.overload && card.effect.overload > 0) {
      ai.overload = (ai.overload || 0) + card.effect.overload;
      Logger.info(`>>> 敌方过载 ${card.effect.overload} 点法力`);
    }

    Logger.info(`>>> 敌方打出了 ${card.name}`);

    // 执行效果
    if (CardType.isMinion(card)) {
      // 召唤随从
      this.game.summonMinion(ai, card);
    } else if (CardType.isHero(card)) {
      // 英雄卡变身
      this.game.transformIntoHero(ai, card);
      Logger.info(`>>> 敌方变身为 ${card.name}！`);
    } else {
      // 执行法术效果 - 先选择目标
      const targetType = this.cardEffect.getTargetType(card);
      let target = action.target;

      // 如果没有预设目标，自动选择
      if (!target) {
        if (targetType === 'single') {
          // 优先打随从，其次打英雄
          if (player.field.length > 0) {
            target = player.field[0];
          } else {
            target = player;
          }
        } else if (targetType === 'hero') {
          target = ai;
        }
      }

      const context = { player: ai, target: target, card };
      this.cardEffect.execute(card, context);
    }
  }

  /**
   * 执行攻击
   */
  executeAttack(action) {
    const attacker = action.attacker;
    const target = action.target;
    const state = this.game.getGameState();

    // 设置 attacker 的 owner 用于吸血机制
    attacker.owner = state.ai;

    if (target.health !== undefined) {
      // 攻击随从
      BattleCalculator.battle(attacker, target);

      // 清理死亡随从
      state.ai.field = state.ai.field.filter(m => m.health > 0);
      state.player.field = state.player.field.filter(m => m.health > 0);
    } else {
      // 攻击英雄
      BattleCalculator.attackHero(attacker, target);
    }

    attacker.hasAttacked = true;
    Logger.info(`>>> 敌方 ${attacker.name} 攻击了 ${target.name || '玩家'}`);
  }

  /**
   * 执行武器攻击
   */
  executeWeaponAttack(action) {
    const state = this.game.getGameState();
    const ai = state.ai;
    const target = action.target;

    if (ai.weapon && ai.weapon.durability > 0) {
      this.game.attackWithWeapon(ai, target);
      Logger.info(`>>> 敌方使用武器攻击了 ${target.name || '玩家'}`);
    }
  }
}

module.exports = AIEngine;
