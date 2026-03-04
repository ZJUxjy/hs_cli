# 剩余游戏机制实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 实现 9 个待完成的游戏机制：风怒、突袭、连击、进化、招募、任务线、超杀、嗜血、适应

**Architecture:** 在 CardEffect.js 添加新方法，在 BattleCalculator.js 修改攻击逻辑，在 TurnManager.js 修改回合逻辑

**Tech Stack:** Node.js, JavaScript

---

## Task 1: 风怒 (Windfury)

**Files:**
- Modify: `src/game/BattleCalculator.js`
- Modify: `src/game/TurnManager.js`
- Modify: `public/js/game.js`

**Step 1: 修改回合开始时随从攻击状态**

在 `TurnManager.js` 的回合开始逻辑中，修改以支持风怒随从每回合可攻击两次：

```javascript
// 在回合开始时重置攻击次数
minion.hasAttacked = false;
minion.canAttack = !minion.sleeping && !minion.frozen;

// 风怒随从可以攻击两次
if (minion.windfury) {
  minion.attacksRemaining = 2;
} else {
  minion.attacksRemaining = 1;
}
```

**Step 2: 修改攻击逻辑**

在 `BattleCalculator.js` 的攻击方法中，检查风怒并允许第二次攻击：

```javascript
// 攻击后检查风怒
if (attacker.windfury && attacker.attacksRemaining > 0) {
  attacker.attacksRemaining--;
  attacker.canAttack = true;
} else {
  attacker.hasAttacked = true;
  attacker.canAttack = false;
}
```

**Step 3: 添加风怒图标显示**

在 `game.js` 渲染随从时添加风怒图标。

**Step 4: 提交**

```bash
git add src/game/BattleCalculator.js src/game/TurnManager.js public/js/game.js
git commit -m "feat: 实现风怒机制"
```

---

## Task 2: 突袭 (Rush)

**Files:**
- Modify: `src/game/GameEngine.js`
- Modify: `src/game/RuleEngine.js`

**Step 1: 验证现有实现**

检查 `GameEngine.js` 中 `summonMinion` 是否正确处理突袭：
- 突袭随从可以立即攻击随从
- 突袭随从不能攻击英雄

**Step 2: 修改攻击验证**

在 `RuleEngine.js` 的 `canAttackHero` 方法中确保突袭随从不能攻击英雄。

**Step 3: 提交**

---

## Task 3: 连击 (Combo)

**Files:**
- Modify: `src/game/CardEffect.js`
- Modify: `src/game/GameEngine.js`

**Step 1: 完善 executeCombo 方法**

确保连击效果正确实现：
- 手牌中有卡牌时触发
- 手牌>=3时额外增强

**Step 2: 验证触发时机**

确保在 `playCard` 中正确调用连击效果。

**Step 3: 提交**

---

## Task 4: 进化 (Evolve)

**Files:**
- Modify: `src/game/CardEffect.js`

**Step 1: 完善 executeEvolve 方法**

```javascript
executeEvolve(effect, context) {
  const { player } = context;
  if (!player.field || player.field.length === 0) return false;

  const evolveCount = effect.count || 1;
  const CardData = require('../data/CardData');

  for (let i = 0; i < evolveCount && player.field.length > 0; i++) {
    const randomIdx = Math.floor(Math.random() * player.field.length);
    const minion = player.field[randomIdx];
    const currentCost = minion.attack + minion.health;

    // 获取更高费用的随机随从
    const higherCostCards = CardData.getAllCards().filter(c =>
      c.type === 'MINION' &&
      (c.attack + c.health) > currentCost &&
      (c.cardClass === player.playerClass || c.cardClass === 'NEUTRAL')
    );

    if (higherCostCards.length > 0) {
      const newCard = higherCostCards[Math.floor(Math.random() * higherCostCards.length)];
      minion.id = newCard.id;
      minion.name = newCard.name;
      minion.attack = newCard.attack;
      minion.health = newCard.health;
      minion.maxHealth = newCard.health;
    }
  }
  return true;
}
```

**Step 2: 提交**

---

## Task 5: 招募 (Recruit)

**Files:**
- Modify: `src/game/CardEffect.js`

**Step 1: 添加 executeRecruit 方法**

```javascript
executeRecruit(effect, context) {
  const { player } = context;
  if (!player.deck || player.deck.length === 0) return false;

  const recruitCount = effect.count || 1;
  const CardData = require('../data/CardData');

  for (let i = 0; i < recruitCount && player.deck.length > 0; i++) {
    // 随机从牌库获取随从
    const deckMinions = player.deck.filter(c => c.type === 'MINION');
    if (deckMinions.length === 0) break;

    const randomCard = deckMinions[Math.floor(Math.random() * deckMinions.length)];

    // 从牌库移除并召唤
    const idx = player.deck.indexOf(randomCard);
    if (idx > -1) player.deck.splice(idx, 1);

    this.game.summonMinion(player, randomCard);
  }
  return true;
}
```

**Step 2: 在 execute 方法中添加 case**

**Step 3: 提交**

---

## Task 6: 超杀 (Overkill)

**Files:**
- Modify: `src/game/CardEffect.js`
- Modify: `src/game/BattleCalculator.js`

**Step 1: 添加伤害检测**

在 `BattleCalculator.js` 攻击方法中检测超杀：

```javascript
// 检测超杀
if (attacker.overkill && actualDamage > target.health) {
  this.game.triggerOverkill(attacker, target);
}
```

**Step 2: 添加 executeOverkill 方法**

```javascript
executeOverkill(effect, context) {
  const { target, player } = context;
  if (!effect || !player) return false;

  // 超杀效果：造成额外伤害或召唤随从
  if (effect.damage) {
    if (target && target.owner) {
      target.owner.health -= effect.damage;
    }
  }
  if (effect.summon) {
    this.game.summonMinion(player, effect.summon);
  }
  return true;
}
```

**Step 3: 提交**

---

## Task 7: 嗜血 (Bloodlust)

**Files:**
- Modify: `src/game/CardEffect.js`
- Modify: `src/game/TurnManager.js`

**Step 1: 添加 executeBloodlust 方法**

```javascript
executeBloodlust(effect, context) {
  const { player } = context;
  if (!player.field || player.field.length === 0) return false;

  const bonus = effect.attack || 3;
  player.field.forEach(minion => {
    minion.attack += bonus;
  });
  return true;
}
```

**Step 2: 在回合结束触发**

在 `TurnManager.js` 的回合结束逻辑中添加嗜血检测。

**Step 3: 提交**

---

## Task 8: 适应 (Adapt)

**Files:**
- Modify: `src/game/CardEffect.js`
- Modify: `public/js/game.js`

**Step 1: 添加 executeAdapt 方法**

```javascript
executeAdapt(effect, context) {
  // 返回适应选项让玩家选择
  return {
    adapt: true,
    options: [
      { type: '+3_attack', text: '+3 攻击力' },
      { type: '+3_health', text: '+3 生命值' },
      { type: 'taunt', text: '嘲讽' }
    ]
  };
}
```

**Step 2: 添加 UI 选择**

在前端添加适应选择弹窗。

**Step 3: 提交**

---

## Task 9: 任务线 (Questline)

**Files:**
- Modify: `src/game/GameEngine.js`
- Modify: `src/game/CardEffect.js`

**Step 1: 添加任务线数据结构**

```javascript
// 任务线状态
{
  questId: 'xxx',
  progress: 0,
  maxProgress: 3,
  stages: [
    { progress: 1, reward: { cardId: 'xxx' } },
    { progress: 2, reward: { cardId: 'yyy' } },
    { progress: 3, reward: { cardId: 'zzz' } }
  ],
  completed: false
}
```

**Step 2: 实现任务线逻辑**

- 追踪任务进度
- 达到条件时发放奖励

**Step 3: 提交**

---

## Task 10: 测试验证

**Step 1: 启动服务器**

```bash
node server.js
```

**Step 2: 测试各机制**

- 风怒：验证随从可以攻击两次
- 突袭：验证不能攻击英雄
- 连击：验证手牌数量影响效果
- 进化：验证随从变为更高费用
- 招募：验证从牌库召唤
- 超杀：验证伤害溢出触发
- 嗜血：验证回合结束全体+3
- 适应：验证选择界面
- 任务线：验证多阶段任务

**Step 3: 提交**
