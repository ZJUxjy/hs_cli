# 核心玩法完善实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 完善英雄技能系统(8职业)、武器系统(装备/耐久度/攻击)、特殊卡牌效果(奥秘触发/随从回归/随从控制)

**Architecture:** 扩展 CardEffect.js 添加新效果处理方法，扩展 GameEngine.js 添加武器和技能管理，更新 RuleEngine.js 添加验证逻辑

**Tech Stack:** Node.js, JSON 卡牌数据, 游戏引擎

---

## Task 1: 完善 RuleEngine.js - 修复英雄技能验证

**Files:**
- Modify: `src/game/RuleEngine.js:85-104`

**Step 1: 修改 canUseHeroPower 方法使用 ConfigData**

```javascript
canUseHeroPower(player) {
  if (player.usedHeroPower) {
    return { valid: false, reason: '本回合已使用英雄技能' };
  }

  const ConfigData = require('../data/ConfigData');
  const classConfig = ConfigData.getClass(player.hero);
  const heroPower = classConfig?.heroPower;

  if (!heroPower) {
    return { valid: false, reason: '该职业没有英雄技能' };
  }

  if (player.mana < heroPower.cost) {
    return { valid: false, reason: '法力值不足' };
  }

  return { valid: true };
}
```

**Step 2: 测试验证**

运行: `node -e "const RuleEngine = require('./src/game/RuleEngine'); console.log('RuleEngine loaded');"`

Expected: 输出 "RuleEngine loaded"

**Step 3: 提交**

---

## Task 2: 扩展 GameEngine.js - 添加武器管理和英雄技能执行

**Files:**
- Modify: `src/game/GameEngine.js`

**Step 1: 在 createPlayer 方法中添加 weapon 字段**

找到约第87行，在 return 对象中添加:
```javascript
weapon: null,
```

**Step 2: 添加 equipWeapon 方法**

在文件末尾（module.exports 之前）添加:
```javascript
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
  const classConfig = ConfigData.getClass(player.hero);
  const heroPower = classConfig?.heroPower;

  if (!heroPower) {
    Logger.warn(`${player.hero} 没有英雄技能`);
    return false;
  }

  // 扣除法力值
  player.mana -= heroPower.cost;
  player.usedHeroPower = true;

  // 执行技能效果
  const CardEffect = require('./CardEffect');
  const cardEffect = new CardEffect(this);

  const opponent = this.getOpponent();
  const context = { player, target: opponent };

  switch (heroPower.effect.type) {
    case 'damage':
      this.battleCalc.calculateDamage(opponent, heroPower.effect.value);
      break;
    case 'armor':
      this.battleCalc.gainArmor(player, heroPower.effect.value);
      break;
    case 'draw':
      this.drawCard(player, heroPower.effect.value);
      break;
    case 'totem':
      // 召唤随机图腾
      this.summonMinion(player, { id: 'totem', name: '图腾', effect: { attack: 0, health: 2 } });
      break;
    default:
      Logger.warn(`未知的英雄技能类型: ${heroPower.effect.type}`);
  }

  Logger.info(`${player.name} 使用了英雄技能 ${heroPower.name}`);
  return true;
}
```

**Step 3: 添加 attackWithWeapon 方法**

```javascript
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

  // 剧毒检查
  if (weapon.poisonous && target.health !== undefined) {
    target.health = 0;
    Logger.info(`${target.name} 被剧毒杀死`);
  } else if (target.armor !== undefined) {
    // 攻击敌方英雄
    this.battleCalc.attackHero({ attack: weapon.attack, poisonous: weapon.poisonous }, target);
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
```

**Step 4: 测试验证**

运行: `node -e "const GameEngine = require('./src/game/GameEngine'); const ge = new GameEngine(); console.log('equipWeapon:', typeof ge.equipWeapon); console.log('useHeroPower:', typeof ge.useHeroPower);"`

Expected: 输出两个方法类型为 "function"

**Step 5: 提交**

---

## Task 3: 扩展 CardEffect.js - 添加特殊效果处理

**Files:**
- Modify: `src/game/CardEffect.js`

**Step 1: 在 execute 方法的 switch 中添加新效果**

找到 switch (effect.type) 部分（约第87行），添加:
```javascript
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
```

**Step 2: 添加 executeWeapon 方法**

在文件末尾（module.exports 之前）添加:
```javascript
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

  // 如果目标在手牌中，直接返回
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
```

**Step 3: 测试验证**

运行: `node -e "const CardEffect = require('./src/game/CardEffect'); console.log('CardEffect loaded'); const ce = new CardEffect({}); console.log('executeBounce:', typeof ce.executeBounce);"`

Expected: 输出 CardEffect loaded 和 executeBounce 方法类型

**Step 4: 提交**

---

## Task 4: 扩展 CardEffect.js - 添加奥秘触发机制

**Files:**
- Modify: `src/game/CardEffect.js`
- Modify: `src/game/GameEngine.js`

**Step 1: 在 GameEngine.js 中添加 checkSecrets 方法**

```javascript
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
  const CardEffect = require('./CardEffect');
  const cardEffect = new CardEffect(this);

  Logger.info(`${player.name} 的奥秘 ${secret.originalCard?.name || '奥秘'} 被触发`);

  // 根据奥秘类型执行效果
  // 这里简化处理，实际应根据奥秘ID执行不同效果
}
```

**Step 2: 测试验证**

运行: `node -e "const GameEngine = require('./src/game/GameEngine'); const ge = new GameEngine(); console.log('checkSecrets:', typeof ge.checkSecrets);"`

**Step 3: 提交**

---

## Task 5: 更新 AI 适配武器和技能

**Files:**
- Modify: `src/game/AIEngine.js`

**Step 1: 添加使用英雄技能的逻辑**

在 getPossibleActions 方法中（约第79行），确保 hero_power 动作被添加。

**Step 2: 添加武器攻击逻辑**

在 actions 中添加:
```javascript
// 6. 使用武器攻击
if (ai.weapon && ai.weapon.durability > 0) {
  if (player.field.length > 0) {
    const target = this.selectLowestHealthTarget(player.field);
    actions.push({ type: 'weapon_attack', target });
  } else {
    actions.push({ type: 'weapon_attack', target: player });
  }
}
```

**Step 3: 测试验证**

运行: `node -e "const AIEngine = require('./src/game/AIEngine'); console.log('AIEngine loaded');"`

**Step 4: 提交**

---

## Task 6: 整体测试验证

**Step 1: 测试所有模块加载**

```bash
node -e "
const CardEffect = require('./src/game/CardEffect');
const GameEngine = require('./src/game/GameEngine');
const BattleCalculator = require('./src/game/BattleCalculator');
const AIEngine = require('./src/game/AIEngine');
const RuleEngine = require('./src/game/RuleEngine');
console.log('All modules loaded successfully');
"
```

**Step 2: 测试新功能**

```bash
node -e "
const GameEngine = require('./src/game/GameEngine');
const ge = new GameEngine();
ge.startNewGame('mage', 'warrior');
console.log('Weapon field:', ge.state.player.weapon);
console.log('Hero power:', ge.state.player.usedHeroPower);
"
```

**Step 3: 提交**

---

## 验收标准

1. 8个职业的英雄技能都能正确执行
2. 武器可以装备、攻击、耐久度减少、损坏
3. 奥秘可以被触发（框架完成）
4. 特殊效果(bounce/steal)可以正确执行
5. AI 可以使用英雄技能和武器攻击
