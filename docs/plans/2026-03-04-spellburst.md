# 法术爆发机制实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现法术爆发(Spellburst)机制，使用法术后触发随从的强力效果

**Architecture:** 在 GameEngine.js 添加法术爆发处理，在使用法术时触发友方随从的爆发效果

**Tech Stack:** Node.js, JSON 卡牌数据

---

## Task 1: 添加 Spellburst 效果类型

**Files:**
- Modify: `src/game/CardEffect.js:10-43`

**Step 1: 在 TYPES 中添加 SPELLBURST 常量**

```javascript
SPELLBURST: 'spellburst',
```

**Step 2: 测试验证**

Run: `node -e "const CardEffect = require('./src/game/CardEffect'); console.log(CardEffect.TYPES.SPELLBURST);"`
Expected: 输出 "spellburst"

---

## Task 2: 在 GameEngine 中处理法术爆发

**Files:**
- Modify: `src/game/GameEngine.js`

**Step 1: 添加法术爆发触发方法**

```javascript
/**
 * 触发法术爆发效果
 * @param {object} player - 玩家
 * @param {object} spell - 使用的法术
 */
triggerSpellburst(player, spell) {
  if (!player.field || player.field.length === 0) {
    return;
  }

  const CardEffect = require('./CardEffect');
  const cardEffect = new CardEffect(this);

  // 遍历所有友方随从，检查是否有法术爆发
  player.field.forEach(minion => {
    if (minion.spellburst && !minion.spellburstUsed) {
      const spellburstEffect = minion.spellburst;

      // 检查触发条件
      if (spellburstCondition(spellburstEffect, spell)) {
        Logger.info(`${minion.name} 的法术爆发被触发`);

        // 执行爆发效果
        cardEffect.execute({ effect: spellburstEffect.effect }, {
          player: player,
          target: player,
          card: minion
        });

        // 标记已使用（如果是一次性的）
        if (!spellburstEffect.persistent) {
          minion.spellburstUsed = true;
        }
      }
    }
  });
}

/**
 * 检查法术爆发触发条件
 */
spellburstCondition(spellburstEffect, spell) {
  if (!spellburstEffect.condition) {
    return true; // 无条件触发
  }

  const condition = spellburstEffect.condition;

  switch (condition.type) {
    case 'spell_type':
      // 指定法术类型
      return condition.types.includes(spell.type);
    case 'spell_cost':
      // 指定费用
      return spell.cost >= condition.min && spell.cost <= condition.max;
    case 'spell_school':
      // 指定派系
      return condition.schools.includes(spell.spell_school);
    case 'target_count':
      // 目标数量
      return true;
    default:
      return true;
  }
}
```

**Step 2: 在使用法术时触发**

在 playCard 方法中，法术打出后:

```javascript
// 检查是否是法术
if (card.type === 'spell') {
  // 触发友方法术爆发
  this.triggerSpellburst(player, card);
}
```

**Step 3: 在回合开始时重置法术爆发**

```javascript
startTurn() {
  // 现有代码...

  // 重置所有随从的法术爆发
  [this.state.player, this.state.ai].forEach(p => {
    p.field.forEach(m => {
      m.spellburstUsed = false;
    });
  });
}
```

**Step 4: 测试验证**

Run: `node -e "const ge = require('./src/game/GameEngine'); const g = new ge(); console.log(typeof g.triggerSpellburst);"`
Expected: 输出 "function"

---

## Task 3: 在召唤随从时存储法术爆发

**Files:**
- Modify: `src/game/GameEngine.js`

**Step 1: 修改 summonMinion**

在存储其他效果的位置添加:

```javascript
// 存储战吼、亡语、激励、复古和法术爆发
minion.battlecry = card.effect?.battlecry || null;
minion.deathrattle = card.effect?.deathrattle || null;
minion.inspire = card.effect?.inspire || null;
minion.reborn = card.effect?.reborn || false;

// 法术爆发
if (card.effect?.spellburst) {
  minion.spellburst = {
    effect: card.effect.spellburst,
    persistent: card.effect.spellburst.persistent || false
  };
  minion.spellburstUsed = false;
}
```

---

## Task 4: 添加法术爆发卡牌数据

**Files:**
- Modify: `data/cards/mage.json` (法师最适合)

**Step 1: 添加法术爆发随从卡**

```json
{ "id": "mage_arcane_watchers", "name": "奥术守卫", "type": "minion", "cost": 4, "rarity": "rare", "description": "4/4，法术爆发：召唤一个3/2的镜像", "effect": { "type": "summon", "attack": 4, "health": 4, "spellburst": { "effect": { "type": "summon", "attack": 3, "health": 2, "name": "镜像" } } }, "classes": ["mage"] }
```

添加更多:

```json
{ "id": "mage_inquisitor", "name": " Inquisitor", "type": "minion", "cost": 6, "rarity": "epic", "description": "5/7，法术爆发：对所有敌人造成2点伤害", "effect": { "type": "summon", "attack": 5, "health": 7, "spellburst": { "effect": { "type": "aoe_damage", "value": 2 } } }, "classes": ["mage"] }
```

```json
{ "id": "shaman_murloc_tide", "name": "鱼人潮汐", "type": "minion", "cost": 3, "rarity": "rare", "description": "3/3，法术爆发：使所有友方随从获得+1/+1", "effect": { "type": "summon", "attack": 3, "health": 3, "spellburst": { "effect": { "type": "buff", "attack": 1, "health": 1 } } }, "classes": ["shaman"] }
```

---

## Task 5: 整体测试

**Step 1: 启动服务器测试**

Run: `node server.js &`
Expected: 服务器启动成功

**Step 2: 测试法术爆发流程**

- 场上留有法术爆发随从
- 使用法术
- 验证爆发效果触发

---

## 验收标准

1. CardEffect.js 包含 SPELLBURST 类型
2. 使用法术后正确触发友方随从的爆发效果
3. 爆发效果只触发一次（每回合）
4. 卡牌数据包含至少3张法术爆发卡
