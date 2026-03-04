# 英雄卡机制实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现炉石传说的英雄卡(Hero Card)机制，玩家打出英雄卡后可以变身并获得新英雄技能

**Architecture:** 在 GameEngine.js 的 playCard 方法中添加 HERO 类型处理，在 CardEffect.js 添加 hero 效果类型

**Tech Stack:** Node.js, JSON 卡牌数据

---

## Task 1: 添加 Hero 效果类型

**Files:**
- Modify: `src/game/CardEffect.js`

**Step 1: 在 TYPES 中添加 HERO 常量**

在 CardEffect.js 的 TYPES 对象中添加:

```javascript
HERO: 'hero',
```

**Step 2: 测试验证**

Run: `node -e "const CardEffect = require('./src/game/CardEffect'); console.log(CardEffect.TYPES.HERO);"`
Expected: 输出 "hero"

---

## Task 2: 在 GameEngine 中处理英雄卡

**Files:**
- Modify: `src/game/GameEngine.js`

**Step 1: 修改 playCard 方法添加 HERO 类型处理**

在 playCard 方法中，在处理 minion 和 spell 之后添加:

```javascript
} else if (card.type === 'HERO') {
  // 处理英雄卡 - 变身
  this.transformIntoHero(player, card);
  player.hand.splice(cardIndex, 1);
  return this.getGameState();
}
```

**Step 2: 添加 transformIntoHero 方法**

```javascript
/**
 * 变身成英雄卡
 * @param {object} player - 玩家
 * @param {object} heroCard - 英雄卡
 */
transformIntoHero(player, heroCard) {
  const oldHero = player.hero;

  // 记录旧英雄的护甲
  const oldArmor = player.armor || 0;

  // 变身 - 更换英雄
  player.hero = heroCard.cardClass;
  player.heroCard = heroCard;

  // 继承护甲 (可选)
  player.armor = oldArmor;

  // 设置新英雄的生命值 (通常为30)
  player.maxHealth = 30;
  player.health = 30;

  // 更换英雄技能
  if (heroCard.heroPower) {
    player.heroPower = {
      id: heroCard.heroPower.id || `${heroCard.id}_power`,
      name: heroCard.heroPower.name,
      cost: heroCard.heroPower.cost || 2,
      description: heroCard.heroPower.description,
      effect: heroCard.heroPower.effect
    };
  }

  // 触发战吼效果 (如果英雄卡有)
  if (heroCard.battlecry) {
    const CardEffect = require('./CardEffect');
    const cardEffect = new CardEffect(this);
    cardEffect.executeBattlecry(heroCard, { player, target: player, card: heroCard });
  }

  Logger.info(`${player.name} 变身为 ${heroCard.name}，获得了新的英雄技能`);

  // 如果有战吼日志
  if (heroCard.text) {
    Logger.info(`英雄卡效果: ${heroCard.text}`);
  }
}
```

**Step 3: 测试验证**

Run: `node -e "const ge = require('./src/game/GameEngine'); const g = new ge.GameEngine(); g.startNewGame('mage', 'warrior'); console.log(typeof g.transformIntoHero);"`
Expected: 输出 "function"

---

## Task 3: 更新 AI 支持英雄卡

**Files:**
- Modify: `src/game/AIEngine.js`

**Step 1: 添加对 HERO 类型卡牌的处理**

在 AIEngine 的卡牌评估方法中添加:

```javascript
// 评估英雄卡
if (card.type === 'HERO') {
  // 英雄卡通常是高价值卡，优先打出
  return 10;
}
```

**Step 2: 添加使用英雄卡的逻辑**

在 executeTurn 或类似方法中添加:

```javascript
// 检查是否可以打出英雄卡
const heroCards = player.hand.filter(c => c.type === 'HERO');
if (heroCards.length > 0 && canPlayHeroCard) {
  // 打出第一张英雄卡
  const cardIndex = player.hand.indexOf(heroCards[0]);
  if (player.mana >= heroCards[0].cost) {
    return cardIndex;
  }
}
```

---

## Task 4: 更新 UI 显示支持英雄卡

**Files:**
- Modify: `src/ui/GameScreen.js` 或相关 UI 文件

**Step 1: 添加英雄卡显示**

在显示手牌时，添加对 HERO 类型的特殊显示:

```javascript
// 显示英雄卡
if (card.type === 'HERO') {
  // 显示为 "[英雄] 卡牌名"
  return `[英雄] ${card.name}`;
}
```

**Step 2: 添加变身动画/提示**

在打出英雄卡后显示变身提示:

```javascript
// 变身提示
if (gameState.player.heroCard) {
  message += `\n你已变身为 ${gameState.player.heroCard.name}！`;
}
```

---

## Task 5: 测试英雄卡机制

**Step 1: 启动服务器测试**

Run: `node server.js &`

**Step 2: 测试 API**

```bash
# 开始游戏
curl -X POST http://localhost:3000/api/game/start -H "Content-Type: application/json" -d '{"playerClass":"mage","opponentClass":"warrior"}'

# 检查手牌中是否有英雄卡
curl http://localhost:3000/api/game/state | grep -o '"type":"HERO"'
```

**Step 3: 测试 CLI**

Run: `node index-text.js`

---

## Task 6: 验收测试

**Step 1: 验证代码**

- [ ] CardEffect.js 包含 HERO 类型
- [ ] GameEngine 有 transformIntoHero 方法
- [ ] 可以正确处理英雄卡

**Step 2: 验证数据**

- [ ] 有 2,797 张英雄卡可用

---

## 验收标准

1. CardEffect.js 包含 HERO 类型常量
2. 打出英雄卡后玩家变身
3. 英雄技能正确更换
4. 护甲可以继承 (可选)
5. 战吼效果正确触发
6. AI 可以使用英雄卡
7. UI 正确显示英雄卡
