# 荣誉击杀机制实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现荣誉击杀(Honorable Kill)机制，随从击杀敌人后获得额外效果

**Architecture:** 在 BattleCalculator.js 添加荣誉击杀检测和效果触发

**Tech Stack:** Node.js, JSON 卡牌数据

---

## Task 1: 添加 Honorable Kill 效果类型

**Files:**
- Modify: `src/game/CardEffect.js:10-43`

**Step 1: 在 TYPES 中添加 HONORABLE_KILL 常量**

```javascript
HONORABLE_KILL: 'honorable_kill',
```

**Step 2: 测试验证**

Run: `node -e "const CardEffect = require('./src/game/CardEffect'); console.log(CardEffect.TYPES.HONORABLE_KILL);"`
Expected: 输出 "honorable_kill"

---

## Task 2: 在 BattleCalculator 中处理荣誉击杀

**Files:**
- Modify: `src/game/BattleCalculator.js`

**Step 1: 添加荣誉击杀检测**

在 attack 方法中，攻击结果判定后:

```javascript
/**
 * 攻击结算
 */
attack(attacker, target, game) {
  this.game = game;

  // 免疫检查
  if (target.immune) {
    Logger.info(`${target.name} 免疫本次攻击`);
    return;
  }

  // 圣盾检查
  if (target.divine_shield) {
    target.divine_shield = false;
    Logger.info(`${target.name} 的圣盾被摧毁`);
    return;
  }

  // 剧毒检查
  if (attacker.poisonous || (attacker.card && attacker.card.effect?.poisonous)) {
    target.health = 0;
    Logger.info(`${target.name} 被剧毒杀死`);
    this.checkHonorableKill(attacker, target, game);
    return;
  }

  // 造成伤害
  const damage = attacker.attack || 0;
  target.health -= damage;

  Logger.info(`${attacker.name} 攻击 ${target.name}，造成 ${damage} 点伤害`);

  // 检查是否击杀
  if (target.health <= 0) {
    Logger.info(`${target.name} 被击杀`);
    this.checkHonorableKill(attacker, target, game);
  }

  // 处理攻击者的反伤效果（如蜘蛛毒素）
  if (attacker.card && attacker.card.effect && attacker.card.effect.on_attack) {
    // 处理反伤...
  }

  return target.health;
}
```

**Step 2: 添加 checkHonorableKill 方法**

```javascript
/**
 * 检查并触发荣誉击杀
 */
checkHonorableKill(attacker, target, game) {
  // 检查攻击者是否有荣誉击杀效果
  const hasHonorableKill = attacker.honorableKill ||
    (attacker.card && attacker.card.effect?.honorableKill);

  if (!hasHonorableKill) return;

  // 检查目标是否满足荣誉击杀条件
  // 荣誉击杀：击杀非免疫的随从或英雄
  const isValidTarget = (target.type === 'minion' || target.type === 'hero') &&
    !target.immune;

  if (!isValidTarget) return;

  Logger.info(`${attacker.name} 完成荣誉击杀，触发额外效果`);

  // 获取荣誉击杀效果
  const killEffect = attacker.honorableKillEffect ||
    (attacker.card && attacker.card.effect.honorableKill);

  if (!killEffect) return;

  // 确定攻击者的所属玩家
  const player = game.state.player.field.includes(attacker)
    ? game.state.player
    : game.state.ai;

  // 执行荣誉击杀效果
  this.executeHonorableKillEffect(attacker, killEffect, player, game);
}

/**
 * 执行荣誉击杀效果
 */
executeHonorableKillEffect(attacker, effect, player, game) {
  const CardEffect = require('./CardEffect');
  const cardEffect = new CardEffect(game);

  switch (effect.type) {
    case 'buff':
      // Buff 攻击者自身
      if (effect.attack) attacker.attack += effect.attack;
      if (effect.health) {
        attacker.health += effect.health;
        attacker.maxHealth = Math.max(attacker.maxHealth || attacker.health, attacker.health);
      }
      Logger.info(`${attacker.name} 获得 +${effect.attack || 0}/${effect.health || 0} 属性提升`);
      break;

    case 'draw_card':
      // 抽牌
      game.drawCard(player, effect.value || 1);
      Logger.info(`荣誉击杀触发抽牌`);
      break;

    case 'armor':
      // 护甲
      player.armor += effect.value || 0;
      Logger.info(`荣誉击杀触发护甲`);
      break;

    case 'summon':
      // 召唤随从
      if (effect.card_id) {
        const CardData = require('../data/CardData');
        const card = CardData.getCard(effect.card_id);
        if (card) {
          game.summonMinion(player, card);
        }
      }
      break;

    case 'damage':
      // 对敌人造成伤害
      const opponent = player === game.state.player ? game.state.ai : game.state.player;
      opponent.health -= effect.value || 1;
      Logger.info(`荣誉击杀造成额外伤害`);
      break;

    case 'heal':
      // 治疗
      player.health = Math.min(player.health + (effect.value || 1), player.maxHealth);
      Logger.info(`荣誉击杀触发治疗`);
      break;

    case 'buff_field':
      // Buff 所有友方随从
      player.field.forEach(m => {
        if (effect.attack) m.attack += effect.attack;
        if (effect.health) {
          m.health += effect.health;
          m.maxHealth = Math.max(m.maxHealth || m.health, m.health);
        }
      });
      Logger.info(`荣誉击杀buff了所有友方随从`);
      break;

    default:
      Logger.warn(`未知的荣誉击杀效果类型: ${effect.type}`);
  }
}
```

**Step 3: 测试验证**

Run: `node -e "const bc = require('./src/game/BattleCalculator'); console.log(typeof bc.prototype.checkHonorableKill);"`
Expected: 输出 "function"

---

## Task 3: 在召唤随从时设置荣誉击杀

**Files:**
- Modify: `src/game/GameEngine.js`

**Step 1: 修改 summonMinion**

在存储效果的位置:

```javascript
// 存储战吼、亡语、激励、复古、法术爆发、双生和荣誉击杀
minion.battlecry = card.effect?.battlecry || null;
minion.deathrattle = card.effect?.deathrattle || null;
minion.inspire = card.effect?.inspire || null;
minion.reborn = card.effect?.reborn || false;
minion.twin = card.effect?.twin || false;

// 荣誉击杀
if (card.effect?.honorableKill) {
  minion.honorableKill = true;
  minion.honorableKillEffect = card.effect.honorableKill;
}
```

---

## Task 4: 添加荣誉击杀卡牌数据

**Files:**
- Modify: `data/cards/warrior.json` (战士有很多击杀类卡)

**Step 1: 添加荣誉击杀随从卡**

```json
{ "id": "warrior_azerite", "name": "艾泽里特", "type": "minion", "cost": 5, "rarity": "epic", "description": "5/5，荣誉击杀：获得+3/+3", "effect": { "type": "summon", "attack": 5, "health": 5, "honorableKill": { "type": "buff", "attack": 3, "health": 3 } }, "classes": ["warrior"] }
```

添加更多:

```json
{ "id": "rogue_assassin", "name": "暗影刺客", "type": "minion", "cost": 4, "rarity": "rare", "description": "4/4，荣誉击杀：抽一张牌", "effect": { "type": "summon", "attack": 4, "health": 4, "honorableKill": { "type": "draw_card", "value": 1 } }, "classes": ["rogue"] }
```

```json
{ "id": "paladin_light_ray", "name": "圣光射线", "type": "minion", "cost": 3, "rarity": "rare", "description": "3/3，荣誉击杀：获得圣盾", "effect": { "type": "summon", "attack": 3, "health": 3, "honorableKill": { "type": "buff", "divine_shield": true } }, "classes": ["paladin"] }
```

---

## Task 5: 整体测试

**Step 1: 启动服务器测试**

Run: `node server.js &`
Expected: 服务器启动成功

**Step 2: 测试荣誉击杀流程**

- 打出荣誉击杀随从
- 击杀敌方随从
- 验证额外效果触发

---

## 验收标准

1. CardEffect.js 包含 HONORABLE_KILL 类型
2. 荣誉击杀随从击杀敌人后触发额外效果
3. 效果类型正确执行
4. 卡牌数据包含至少3张荣誉击杀卡
