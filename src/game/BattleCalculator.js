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

    // 法术伤害加成（如果是法术）
    if (effect.isSpell && effect.spellPower) {
      actualDamage += effect.spellPower;
      Logger.info(`法术伤害 +${effect.spellPower}（当前伤害: ${actualDamage}）`);
    }

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
   * @param {object} game - 游戏引擎实例（可选）
   * @returns {object} 战斗结果
   */
  battle(minion1, minion2, game) {
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
      // 记录攻击前的生命值，用于检测超杀
      const preAttackHealth = minion2.health;
      this.calculateDamage(minion2, minion1.attack);

      // 检测超杀 - 当伤害超过目标生命值时触发（攻击前生命值小于攻击力）
      if (minion1.overkill && preAttackHealth < minion1.attack && minion1.owner && game) {
        Logger.info(`${minion1.name} 超杀触发!（溢出 ${minion1.attack - preAttackHealth} 点）`);

        const overkillEffect = minion1.overkillEffect;
        if (overkillEffect) {
          const owner = minion1.owner;
          const opponent = owner === game.state.player ? game.state.ai : game.state.player;

          // 执行超杀效果
          if (overkillEffect.damage && opponent) {
            // 对随机敌人造成伤害
            const targets = [...opponent.field];
            if (targets.length > 0) {
              const randomTarget = targets[Math.floor(Math.random() * targets.length)];
              this.calculateDamage(randomTarget, overkillEffect.damage);
              Logger.info(`超杀对 ${randomTarget.name} 造成 ${overkillEffect.damage} 点伤害`);
            } else {
              // 没有随从则对英雄造成伤害
              opponent.health -= overkillEffect.damage;
              Logger.info(`超杀对 ${opponent.name} 英雄造成 ${overkillEffect.damage} 点伤害`);
            }
          }

          if (overkillEffect.summon) {
            // 召唤随从
            game.summonMinion(owner, overkillEffect.summon);
          }
        }
      }
    }

    // 检查死亡（需要在吸血和荣誉击杀之前）
    const minion1Dead = minion1.health <= 0;
    const minion2Dead = minion2.health <= 0;

    // 荣誉击杀检测 - 在 minion2 死亡时触发
    if (minion2Dead && minion1.honorableKill && minion1.owner) {
      this.triggerHonorableKill(minion1, minion1.owner);
    }

    // 荣誉击杀检测 - 在 minion1 死亡时触发（被反击杀死）
    if (minion1Dead && minion2.honorableKill && minion2.owner) {
      this.triggerHonorableKill(minion2, minion2.owner);
    }

    if (minion1Dead) {
      Logger.info(`${minion1.name} 阵亡`);
    }
    if (minion2Dead) {
      Logger.info(`${minion2.name} 阵亡`);
    }

    // 处理吸血 - 攻击者吸取生命
    // 如果目标死亡，使用攻击力；否则使用实际伤害量（不能超过攻击力）
    if (minion1.lifesteal || (minion1.card && minion1.card.effect && minion1.card.effect.lifesteal)) {
      let healAmount;
      if (minion2Dead) {
        // 目标死亡，吸取等同于攻击力的生命
        healAmount = minion1.attack;
      } else {
        // 目标未死亡，吸取实际造成的伤害（不超过攻击力）
        const actualDamage = minion2.maxHealth - minion2.health;
        healAmount = Math.min(actualDamage, minion1.attack);
      }
      if (minion1.owner) {
        minion1.owner.health = Math.min(minion1.owner.health + healAmount, minion1.owner.maxHealth);
        Logger.info(`${minion1.owner.name} 吸血恢复 ${healAmount} 点生命值`);
      } else {
        Logger.warn('吸血处理失败: 攻击者 owner 不存在');
      }
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
    // 突袭随从不能攻击英雄
    if (attacker.rush && !attacker.canAttackHero) {
      Logger.warn(`${attacker.name} 有突袭效果，不能攻击英雄`);
      return -1;
    }

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

    // 风怒处理：攻击后检查是否可以再次攻击
    if (attacker.windfury && attacker.attacksRemaining > 0) {
      attacker.attacksRemaining--;
      attacker.canAttack = attacker.attacksRemaining > 0;
      Logger.info(`${attacker.name} 风怒，可再次攻击（剩余 ${attacker.attacksRemaining} 次）`);
    } else {
      attacker.hasAttacked = true;
      attacker.canAttack = false;
    }

    // 处理吸血
    if (attacker.lifesteal || (attacker.card && attacker.card.effect && attacker.card.effect.lifesteal)) {
      const healAmount = Math.min(damage, targetPlayer.health);
      // 获取攻击者的所属玩家 - 通过参数传递
      if (attacker.owner) {
        attacker.owner.health = Math.min(attacker.owner.health + healAmount, attacker.owner.maxHealth);
        Logger.info(`${attacker.owner.name} 吸血恢复 ${healAmount} 点生命值`);
      } else {
        Logger.warn('吸血处理失败: 攻击者 owner 不存在');
      }
    }

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

  /**
   * 检查并触发荣誉击杀
   * @param {object} attacker - 攻击随从
   * @param {object} target - 目标随从
   * @param {object} owner - 攻击者所属玩家
   */
  checkHonorableKill(attacker, target, owner) {
    if (!attacker.honorableKill) return;

    // 只有击杀敌方随从时才触发
    if (target.health > 0) return;

    const effect = attacker.honorableKill;

    if (effect.type === 'buff') {
      // 增强所有友方随从
      owner.field.forEach(m => {
        if (effect.attack) m.attack += effect.attack;
        if (effect.health) {
          m.health += effect.health;
          m.maxHealth = Math.max(m.maxHealth, m.health);
        }
      });
      Logger.info(`${attacker.name} 荣誉击杀，友方随从获得 +${effect.attack || 0}/+${effect.health || 0}`);
    } else if (effect.type === 'draw_card') {
      // 抽牌效果
      const player = owner;
      for (let i = 0; i < (effect.value || 1); i++) {
        if (player.deck.length > 0 && player.hand.length < 10) {
          player.hand.push(player.deck.pop());
        }
      }
      Logger.info(`${attacker.name} 荣誉击杀，${owner.name} 抽 ${effect.value || 1} 张牌`);
    }
  }

  /**
   * 触发荣誉击杀效果（简化版本，用于战斗后）
   * @param {object} attacker - 攻击随从
   * @param {object} owner - 攻击者所属玩家
   */
  triggerHonorableKill(attacker, owner) {
    if (!attacker.honorableKill || !owner) return;

    const effect = attacker.honorableKill;

    if (effect.type === 'buff') {
      // 增强所有友方随从
      owner.field.forEach(m => {
        if (effect.attack) m.attack += effect.attack;
        if (effect.health) {
          m.health += effect.health;
          m.maxHealth = Math.max(m.maxHealth, m.health);
        }
      });
      Logger.info(`${attacker.name} 荣誉击杀，友方随从获得 +${effect.attack || 0}/+${effect.health || 0}`);
    } else if (effect.type === 'draw_card') {
      // 抽牌效果
      for (let i = 0; i < (effect.value || 1); i++) {
        if (owner.deck.length > 0 && owner.hand.length < 10) {
          owner.hand.push(owner.deck.pop());
        }
      }
      Logger.info(`${attacker.name} 荣誉击杀，${owner.name} 抽 ${effect.value || 1} 张牌`);
    }
  }

  /**
   * 克隆随从对象（用于模拟攻击）
   * @param {Object} minion - 随从对象
   * @returns {Object} 克隆的随从对象
   */
  cloneMinion(minion) {
    return {
      id: minion.id,
      name: minion.name,
      attack: minion.attack || 0,
      health: minion.health || 0,
      maxHealth: minion.maxHealth || minion.health || 0,
      divine_shield: minion.divine_shield || false,
      poisonous: minion.poisonous || false,
      windfury: minion.windfury || false,
      frozen: minion.frozen || false,
      sleeping: minion.sleeping || false,
      hasAttacked: minion.hasAttacked || false,
      attacksRemaining: minion.attacksRemaining || 1,
      canAttack: minion.canAttack !== false,
      taunt: minion.taunt || false,
      rush: minion.rush || false,
      owner: minion.owner
    };
  }

  /**
   * 克隆英雄对象（用于模拟攻击）
   * @param {Object} hero - 英雄对象
   * @returns {Object} 克隆的英雄对象
   */
  cloneHero(hero) {
    return {
      id: hero.id,
      hero: hero.hero,
      health: hero.health || 30,
      maxHealth: hero.maxHealth || 30,
      armor: hero.armor || 0,
      immune: hero.immune || false,
      divine_shield: hero.divine_shield || false
    };
  }

  /**
   * 计算单次攻击造成的伤害
   * @param {Object} attacker - 攻击随从
   * @param {Object} target - 目标（随从或英雄）
   * @returns {number} 伤害值
   */
  calculateAttackDamage(attacker, target) {
    // 剧毒对英雄无效
    if (attacker.poisonous && target.armor !== undefined) {
      return 0;
    }

    // 圣盾：被攻击者有圣盾则伤害为0
    if (target.divine_shield) {
      return 0;
    }

    return attacker.attack || 0;
  }

  /**
   * 模拟一次攻击，返回攻击后的新状态（不修改原对象）
   * @param {Object} attacker - 攻击随从（克隆）
   * @param {Object} target - 目标（克隆）
   * @returns {Object} { attackerState, targetState, damage }
   */
  simulateAttack(attacker, target) {
    const damage = this.calculateAttackDamage(attacker, target);
    const attackerState = this.cloneMinion(attacker);
    const targetState = target.armor !== undefined
      ? this.cloneHero(target)
      : this.cloneMinion(target);

    // 处理被攻击者
    if (targetState.divine_shield) {
      targetState.divine_shield = false;
    } else if (target.armor !== undefined) {
      // 目标是英雄
      if (targetState.armor > 0) {
        const armorDamage = Math.min(targetState.armor, damage);
        targetState.armor -= armorDamage;
        targetState.health -= (damage - armorDamage);
      } else {
        targetState.health -= damage;
      }
    } else {
      // 目标是随从
      targetState.health -= damage;

      // 剧毒：直接杀死
      if (attackerState.poisonous) {
        targetState.health = 0;
      }
    }

    // 处理攻击者
    if (targetState.divine_shield === false && target.health !== undefined) {
      // 攻击随从后受伤
      if (targetState.health > 0 && !targetState.divine_shield) {
        attackerState.health -= target.attack || 0;
      }
    }

    // 检查死亡
    attackerState.dead = attackerState.health <= 0;
    targetState.dead = targetState.health <= 0;

    return {
      attackerState,
      targetState,
      damage
    };
  }

  /**
   * 计算敌方下回合对我方英雄造成的最大伤害
   * @param {Array} opponentField - 敌方随从数组
   * @param {Object} myHero - 我方英雄对象
   * @param {Array} myField - 我方随从数组
   * @returns {number} 最大伤害值
   */
  calculateMaxDamage(opponentField, myHero, myField) {
    // 1. 筛选可攻击随从（未冻结、未沉睡、canAttack=true）
    const attackers = opponentField.filter(m =>
      m.canAttack && !m.frozen && !m.sleeping && !m.hasAttacked
    );

    if (attackers.length === 0) {
      return 0;
    }

    // 2. 克隆所有对象，避免修改原状态
    const attackersClone = attackers.map(m => this.cloneMinion(m));
    const myHeroClone = this.cloneHero(myHero);
    const myFieldClone = myField ? myField.map(m => this.cloneMinion(m)) : [];

    // 3. 检查嘲讽
    const tauntMinions = myFieldClone.filter(m => m.taunt);
    let targets = tauntMinions.length > 0 ? tauntMinions : [myHeroClone];

    // 4. 按攻击力降序排列，高攻优先
    attackersClone.sort((a, b) => (b.attack || 0) - (a.attack || 0));

    let totalDamage = 0;

    // 5. 遍历每个攻击者
    for (const attacker of attackersClone) {
      // 风怒随从可以攻击2次，普通1次
      const attacks = attacker.windfury ? 2 : 1;

      for (let i = 0; i < attacks; i++) {
        // 没有可用目标则停止
        if (targets.length === 0) break;

        const target = targets[0];
        const result = this.simulateAttack(attacker, target);

        // 累加伤害
        totalDamage += result.damage;

        // 更新攻击者状态（用于下一次循环）
        Object.assign(attacker, result.attackerState);

        // 如果目标死亡，移除
        if (result.targetState.dead) {
          targets.shift();
        } else {
          // 更新目标状态（圣盾可能被打破）
          targets[0] = result.targetState;
        }

        // 如果攻击者死亡，停止此随从的所有攻击
        if (attacker.dead) break;
      }
    }

    return totalDamage;
  }
}

module.exports = new BattleCalculator();
