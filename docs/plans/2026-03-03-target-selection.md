# 炉石传说 CLI - 目标选择机制重构实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现完整的炉石传说目标选择机制，包括法术卡目标选择、随从攻击目标选择、嘲讽规则验证

**Architecture:** 在 CardEffect 中添加目标类型判断，在 index-text.js 中添加目标选择交互流程，修改 RuleEngine 完善目标验证

**Tech Stack:** Node.js, blessed (TUI), 游戏逻辑

---

## Task 1: 添加法术目标类型分类

**Files:**
- Modify: `src/game/CardEffect.js` - 添加 getTargetType 方法
- Test: 手动测试 `node index-text.js`

**Step 1: 添加目标类型判断方法**

在 CardEffect 类中添加方法判断法术需要的目标类型：

```javascript
/**
 * 获取法术需要的目标类型
 * @param {object} card - 卡牌
 * @returns {string} targetType: 'single'(单体) | 'none'(无目标) | 'all'(全场) | 'hero'(自己英雄) | 'random'(随机)
 */
getTargetType(card) {
  if (!card.effect) return 'none';

  const type = card.effect.type;

  // 需要单体目标
  if (['damage', 'damage_freeze', 'execute', 'transform', 'heal'].includes(type)) {
    return 'single';
  }

  // 英雄目标（自己）
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
```

**Step 2: 测试验证**

运行: `node -e "const ce = require('./src/game/CardEffect'); console.log(ce.getTargetType({effect:{type:'damage'}}));"`
Expected: 输出 'single'

---

## Task 2: 修改 index-text.js 目标选择流程

**Files:**
- Modify: `index-text.js:100-150` - 修改出牌逻辑

**Step 1: 修改出牌逻辑，添加目标选择**

将原来的简化逻辑替换为完整的目标选择流程：

```javascript
} else if (action === 'p') {
  if (state.player.hand.length === 0) {
    console.log('\n手牌为空!');
  } else {
    const cardNum = await this.question('选择手牌编号 > ');
    const cardIndex = parseInt(cardNum) - 1;
    const card = state.player.hand[cardIndex];

    if (!card) {
      console.log('\n无效的手牌编号!');
    } else if (state.player.mana < card.cost) {
      console.log(`\n法力值不足! 需要 ${card.cost} 点，当前 ${state.player.mana} 点`);
    } else {
      // 获取目标类型
      const targetType = this.cardEffect ? this.cardEffect.getTargetType(card) : 'none';

      let target = null;

      if (targetType === 'single') {
        // 需要选择单体目标
        console.log('\n选择目标:');
        if (state.ai.field.length > 0) {
          console.log('  0. 敌方英雄');
          state.ai.field.forEach((m, i) => {
            console.log(`  ${i + 1}. ${m.name} [${m.attack}/${m.health}]`);
          });
        } else {
          console.log('  0. 敌方英雄 (无随从)');
        }

        const targetNum = await this.question('选择目标编号 > ');
        const targetIndex = parseInt(targetNum);

        if (targetIndex === 0) {
          target = state.ai;
        } else if (targetIndex > 0 && targetIndex <= state.ai.field.length) {
          target = state.ai.field[targetIndex - 1];
        } else {
          console.log('\n无效目标!');
        }
      } else if (targetType === 'hero') {
        // 给自己英雄加护甲/治疗
        target = state.player;
      }
      // targetType === 'none' 或 'all' 或 'random' 不需要目标

      // 打出卡牌
      this.game.removeCardFromHand(state.player, card);
      state.player.mana -= card.cost;

      if (card.type === 'minion') {
        this.game.summonMinion(state.player, card);
        console.log(`\n召唤了 ${card.name}`);
      } else {
        // 执行法术效果
        if (targetType === 'single' && !target) {
          console.log('\n未选择目标，法术失效');
        } else {
          this.cardEffect.execute(card, {
            player: state.player,
            target: target,
            card: card
          });
          console.log(`\n施放了 ${card.name}`);
        }
      }
    }
  }
}
```

**Step 2: 初始化 CardEffect**

在 TextGame 类中添加：

```javascript
const CardEffect = require('./src/game/CardEffect');
// 在 constructor 中添加:
this.cardEffect = new CardEffect(this.game);
```

**Step 3: 测试**

运行: `node index-text.js`
测试流程：选择法师 → 出寒冰箭 → 应提示选择目标

---

## Task 3: 完善随从攻击目标选择

**Files:**
- Modify: `index-text.js:150-200` - 修改攻击逻辑

**Step 1: 修改攻击逻辑，添加嘲讽验证**

```javascript
} else if (action === 'a') {
  if (state.player.field.length === 0) {
    console.log('\n没有随从可以攻击!');
  } else {
    // 选择攻击随从
    console.log('\n选择攻击的随从:');
    state.player.field.forEach((m, i) => {
      const canAttack = m.canAttack && !m.hasAttacked && !m.sleeping && !m.frozen;
      console.log(`  ${i + 1}. ${m.name} [${m.attack}/${m.health}] ${canAttack ? '✓' : '✗'}`);
    });

    const minionNum = await this.question('选择随从编号 > ');
    const minionIndex = parseInt(minionNum) - 1;
    const attacker = state.player.field[minionIndex];

    if (!attacker) {
      console.log('\n无效的随从!');
    } else if (!attacker.canAttack || attacker.hasAttacked || attacker.sleeping || attacker.frozen) {
      console.log('\n该随从无法攻击!');
    } else {
      // 检查嘲讽
      const hasTaunt = state.ai.field.some(m => m.taunt);
      let validTargets = [];

      if (hasTaunt) {
        // 必须攻击嘲讽
        validTargets = state.ai.field.filter(m => m.taunt);
        console.log('\n敌方有嘲讽随从，必须攻击嘲讽!');
      } else {
        validTargets = [...state.ai.field];
      }

      // 选择目标
      console.log('\n选择目标:');
      console.log('  0. 敌方英雄');
      validTargets.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.name} [${m.attack}/${m.health}]`);
      });

      const targetNum = await this.question('选择目标编号 > ');
      const targetIndex = parseInt(targetNum);

      if (targetIndex === 0) {
        // 攻击英雄
        state.ai.health -= attacker.attack;
        attacker.hasAttacked = true;
        console.log(`\n${attacker.name} 攻击了敌方英雄!`);
      } else if (targetIndex > 0 && targetIndex <= validTargets.length) {
        const target = validTargets[targetIndex - 1];
        // 战斗：同时造成伤害
        target.health -= attacker.attack;
        attacker.health -= target.attack;
        attacker.hasAttacked = true;
        console.log(`\n${attacker.name} 攻击了 ${target.name}!`);
      } else {
        console.log('\n无效目标!');
      }
    }
  }
}
```

**Step 2: 测试**

运行: `node index-text.js`
测试流程：召唤随从 → 结束回合 → 敌方回合 → 再次自己的回合 → 攻击 → 验证嘲讽规则

---

## Task 4: 修复 AI 目标选择

**Files:**
- Modify: `src/game/AIEngine.js` - 添加目标选择逻辑

**Step 1: 修改 AI 出牌逻辑**

在 AIEngine 中，需要为法术卡选择合适的目标：

```javascript
// 在 executeAction 方法中添加目标选择
if (action.type === 'play_card' && action.card.type === 'spell') {
  const targetType = this.cardEffect.getTargetType(action.card);

  if (targetType === 'single') {
    // 选择目标：优先打随从，其次打英雄
    if (ai.field.length > 0) {
      action.target = ai.field[0];
    } else {
      action.target = state.player;
    }
  } else if (targetType === 'hero') {
    action.target = ai;
  }
}
```

**Step 2: 测试**

运行完整游戏流程，验证 AI 出牌时正确选择目标

---

## Task 5: 清理死亡随从

**Files:**
- Modify: `index-text.js` - 确保每次行动后清理死亡随从

**Step 1: 在每个可能改变战场的操作后添加清理**

在出牌后、攻击后、敌方行动后都调用 `this.game.removeDeadMinions()`

---

## 验收标准

1. 出寒冰箭时提示选择目标（随从1-N 或 英雄0）
2. 出火球术时提示选择目标
3. 出冰对自己生效
4. 出奥术智慧时直接抽甲术时直接牌
5. 出烈焰风暴时对所有随从造成伤害
6. 随从攻击时有嘲讽检查
7. 随从攻击可以选择打随从或打脸
8. AI 正确选择法术目标

---

## 执行选项

**Plan complete and saved to `docs/plans/2026-03-03-target-selection.md`. Two execution options:**

**1. Subagent-Driven (推荐)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
