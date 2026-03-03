/**
 * 战斗计算模块
 */

const Logger = require('../utils/logger');

class BattleCalculator {
  /**
   * 计算伤害
   * @param {object} target - 目标 (玩家或随从)
   * @param {number} damage - 伤害值
   * @param {object} effect - 额外效果
   * @returns {number} 实际受到的伤害
   */
  calculateDamage(target, damage, effect = {}) {
    // 免疫检查
    if (target.immune) {
      Logger.info(`${target.name || target.id} 免疫了伤害`);
      return 0;
    }

    // 圣盾检查
    if (target.divine_shield && damage > 0) {
      target.divine_shield = false;
      Logger.info(`${target.name || target.id} 的圣盾被打破`);
      return 0;
    }

    let actualDamage = damage;

    // 如果目标是玩家，有护甲
    if (target.armor !== undefined) {
      // 护甲先承担伤害
      if (target.armor > 0) {
        const armorDamage = Math.min(target.armor, damage);
        target.armor -= armorDamage;
        actualDamage -= armorDamage;

        if (actualDamage > 0) {
          target.health -= actualDamage;
        }
      } else {
        target.health -= actualDamage;
      }
    } else if (target.health !== undefined) {
      // 随从
      target.health -= actualDamage;
    }

    // 冻结效果
    if (effect.freeze && target.frozen !== undefined) {
      target.frozen = true;
    }

    // 记录日志
    const targetName = target.name || target.id;
    Logger.info(`${targetName} 受到 ${actualDamage} 点伤害`);

    return actualDamage;
  }

  /**
   * 治疗
   * @param {object} target - 目标
   * @param {number} value - 治疗量
   * @returns {number} 实际治疗量
   */
  calculateHeal(target, value) {
    if (target.maxHealth === undefined) return 0;

    const maxHeal = target.maxHealth - target.health;
    const healAmount = Math.min(value, maxHeal);
    target.health += healAmount;

    Logger.info(`${target.name} 恢复 ${healAmount} 点生命值`);
    return healAmount;
  }

  /**
   * 获得护甲
   * @param {object} player - 玩家
   * @param {number} value - 护甲值
   */
  gainArmor(player, value) {
    if (player.armor === undefined) return;

    player.armor += value;
    Logger.info(`${player.name} 获得 ${value} 点护甲`);
  }

  /**
   * 恢复生命
   * @param {object} target - 目标（玩家或随从）
   * @param {number} value - 恢复值
   */
  heal(target, value) {
    if (target.health === undefined) return;

    const oldHealth = target.health;
    target.health = Math.min(target.health + value, target.maxHealth || 30);
    const healed = target.health - oldHealth;
    Logger.info(`${target.name} 恢复 ${healed} 点生命（当前 ${target.health}/${target.maxHealth || 30}）`);
  }

  /**
   * 应用buff
   * @param {object} minion - 随从
   * @param {object} buff - buff { attack, health }
   */
  applyBuff(minion, buff) {
    if (buff.attack) {
      minion.attack += buff.attack;
    }
    if (buff.health) {
      minion.health += buff.health;
      minion.maxHealth = Math.max(minion.maxHealth, minion.health);
    }
    
    Logger.info(`${minion.name} 获得buff: ${JSON.stringify(buff)}`);
  }

  /**
   * 随从战斗
   * @param {object} minion1 - 攻击随从
   * @param {object} minion2 - 防御随从
   * @returns {object} 战斗结果
   */
  battle(minion1, minion2) {
    // 剧毒检查
    if (minion1.poisonous) {
      minion2.health = 0;
      Logger.info(`${minion2.name} 被剧毒杀死`);
      return { minion1Dead: false, minion2Dead: true, damage1: 0, damage2: 0 };
    }
    if (minion2.poisonous) {
      minion1.health = 0;
      Logger.info(`${minion1.name} 被剧毒杀死`);
      return { minion1Dead: true, minion2Dead: false, damage1: 0, damage2: 0 };
    }

    // 圣盾处理 - 攻击者
    if (minion1.divine_shield) {
      minion1.divine_shield = false;
      Logger.info(`${minion1.name} 的圣盾被打破`);
    } else {
      this.calculateDamage(minion1, minion2.attack);
    }

    // 圣盾处理 - 防御者
    if (minion2.divine_shield) {
      minion2.divine_shield = false;
      Logger.info(`${minion2.name} 的圣盾被打破`);
    } else {
      this.calculateDamage(minion2, minion1.attack);
    }

    // 检查死亡
    const minion1Dead = minion1.health <= 0;
    const minion2Dead = minion2.health <= 0;

    if (minion1Dead) {
      Logger.info(`${minion1.name} 阵亡`);
    }
    if (minion2Dead) {
      Logger.info(`${minion2.name} 阵亡`);
    }

    return {
      minion1Dead,
      minion2Dead,
      damage1: minion2Dead ? 0 : minion1.attack,
      damage2: minion1Dead ? 0 : minion2.attack
    };
  }

  /**
   * 攻击英雄
   * @param {object} attacker - 攻击随从
   * @param {object} targetPlayer - 目标玩家
   */
  attackHero(attacker, targetPlayer) {
    // 剧毒
    if (attacker.poisonous) {
      targetPlayer.health = 0;
      Logger.info(`${targetPlayer.hero} 被剧毒杀死`);
      attacker.hasAttacked = true;
      return 0;
    }

    // 免疫
    if (targetPlayer.immune) {
      attacker.hasAttacked = true;
      return 0;
    }

    // 圣盾
    if (targetPlayer.divine_shield) {
      targetPlayer.divine_shield = false;
      Logger.info(`${targetPlayer.hero} 的圣盾被打破`);
      attacker.hasAttacked = true;
      return 0;
    }

    const damage = this.calculateDamage(targetPlayer, attacker.attack);
    attacker.hasAttacked = true;
    return damage;
  }

  /**
   * 随机伤害
   * @param {array} targets - 可选目标
   * @param {number} damage - 伤害值
   * @param {number} count - 次数
   * @returns {array} 实际伤害结果
   */
  randomDamage(targets, damage, count = 1) {
    const results = [];
    for (let i = 0; i < count; i++) {
      if (targets.length === 0) break;
      const idx = Math.floor(Math.random() * targets.length);
      const target = targets[idx];
      const actualDmg = this.calculateDamage(target, damage);
      results.push({ target, damage: actualDmg });
      
      // 移除死亡的随从
      if (target.health <= 0) {
        targets.splice(idx, 1);
      }
    }
    return results;
  }

  /**
   * 造成全场伤害
   * @param {array} minions - 随从列表
   * @param {number} damage - 伤害值
   */
  aoeDamage(minions, damage) {
    minions.forEach(minion => {
      this.calculateDamage(minion, damage);
    });
  }

  /**
   * 冻结所有随从
   * @param {array} minions - 随从列表
   */
  freezeAll(minions) {
    minions.forEach(minion => {
      minion.frozen = true;
      Logger.info(`${minion.name} 被冻结`);
    });
  }
}

module.exports = new BattleCalculator();
