# 吸血机制实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现吸血(Lifesteal)机制，使造成的伤害转化为对己方英雄的治疗

**Architecture:** 在 CardEffect.js 添加 lifesteal 效果类型，在 BattleCalculator.js 攻击结算时处理吸血逻辑

**Tech Stack:** Node.js, JSON 卡牌数据

---

## Task 1: 添加 Lifesteal 效果类型

**Files:**
- Modify: `src/game/CardEffect.js:10-43`

**Step 1: 在 TYPES 中添加 LIFESTEAL 常量**

在 CardEffect.js 的 TYPES 对象中添加:

```javascript
LIFESTEAL: 'lifesteal',
```

**Step 2: 测试验证**

Run: `node -e "const CardEffect = require('./src/game/CardEffect'); console.log(CardEffect.TYPES.LIFESTEAL);"`
Expected: 输出 "lifesteal"

---

## Task 2: 实现吸血效果处理

**Files:**
- Modify: `src/game/CardEffect.js`

**Step 1: 添加 executeLifesteal 方法**

在 CardEffect.js 中添加:

```javascript
executeLifesteal(effect, context) {
  // 吸血效果需要标记到攻击/伤害上
  // 实际处理在 BattleCalculator 中
  if (context.target) {
    context.target.lifesteal = true;
  }
  return true;
}
```

**Step 2: 在 execute 方法中添加 case**

在 switch 语句中添加:

```javascript
case 'lifesteal':
  return this.executeLifesteal(effect, context);
```

**Step 3: 测试验证**

Run: `node -e "const ce = require('./src/game/CardEffect'); const c = new ce({}); console.log(typeof c.executeLifesteal);"`
Expected: 输出 "function"

---

## Task 3: 在 BattleCalculator 中处理吸血结算

**Files:**
- Modify: `src/game/BattleCalculator.js`

**Step 1: 修改 attack 方法处理吸血**

在 BattleCalculator.attack 方法中，伤害结算后添加:

```javascript
// 处理吸血
if (attacker.lifesteal || (attacker.card && attacker.card.effect?.lifesteal)) {
  const healAmount = Math.min(damage, target.health);
  const attackerPlayer = attacker.owner || this.game.state.player;
  attackerPlayer.health = Math.min(attackerPlayer.health + healAmount, attackerPlayer.maxHealth);
  Logger.info(`吸血恢复 ${healAmount} 点生命值`);
}
```

**Step 2: 测试验证**

Run: `node -e "const bc = require('./src/game/BattleCalculator'); console.log('BattleCalculator loaded');"`
Expected: 输出 "BattleCalculator loaded"

---

## Task 4: 添加吸血卡牌数据

**Files:**
- Modify: `data/cards/mage.json` (或其他职业)

**Step 1: 添加一张吸血随从卡**

```json
{ "id": "mage_vampire", "name": "吸血法师", "type": "minion", "cost": 4, "rarity": "rare", "description": "3/5，吸血", "effect": { "type": "summon", "attack": 3, "health": 5, "lifesteal": true }, "classes": ["mage"] }
```

---

## Task 5: 测试整体流程

**Step 1: 运行文本模式测试**

Run: `node index-text.js`
Expected: 可以打出吸血随从，攻击后能恢复生命值

---

## 验收标准

1. CardEffect.js 包含 LIFESTEAL 类型
2. 吸血随从攻击时可以恢复生命值
3. 卡牌数据包含至少1张吸血卡
