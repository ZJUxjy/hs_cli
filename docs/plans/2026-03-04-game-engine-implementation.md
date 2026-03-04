# 炉石传说游戏引擎修复实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 修复游戏引擎中的卡牌类型判断问题，完善回合阶段处理，增强UI显示

**Architecture:** 基于现有游戏引擎架构，修复类型不一致问题，完善回合5阶段处理，增强终端UI显示

**Tech Stack:** Node.js, blessed (终端UI)

---

## Task 1: 创建卡牌类型工具函数

**Files:**
- Create: `src/utils/cardUtils.js`

**Step 1: 创建工具函数文件**

```javascript
// src/utils/cardUtils.js
/**
 * 卡牌类型工具函数 - 统一大小写不敏感的类型判断
 */

const CardType = {
  /**
   * 判断是否为随从卡
   */
  isMinion: (card) => {
    return card && (card.type === 'MINION' || card.type === 'minion');
  },

  /**
   * 判断是否为法术卡
   */
  isSpell: (card) => {
    return card && (card.type === 'SPELL' || card.type === 'spell');
  },

  /**
   * 判断是否为武器卡
   */
  isWeapon: (card) => {
    return card && (card.type === 'WEAPON' || card.type === 'weapon');
  },

  /**
   * 判断是否为英雄卡
   */
  isHero: (card) => {
    return card && (card.type === 'HERO' || card.type === 'hero');
  },

  /**
   * 获取标准化的卡牌类型
   */
  getNormalizedType: (card) => {
    if (!card || !card.type) return null;
    return card.type.toUpperCase();
  }
};

module.exports = CardType;
```

**Step 2: 测试工具函数**

Run: `node -e "const CardType = require('./src/utils/cardUtils'); console.log('isMinion(MINION):', CardType.isMinion({type: 'MINION'})); console.log('isMinion(minion):', CardType.isMinion({type: 'minion'})); console.log('isSpell(SPELL):', CardType.isSpell({type: 'SPELL'})); console.log('isWeapon(WEAPON):', CardType.isWeapon({type: 'WEAPON'})); console.log('isHero(HERO):', CardType.isHero({type: 'HERO'}));"`

Expected: 所有方法返回 true

**Step 3: Commit**

```bash
git add src/utils/cardUtils.js
git commit -m "feat: add card type utility functions"
```

---

## Task 2: 修复 GameEngine.js 中的类型判断

**Files:**
- Modify: `src/game/GameEngine.js:349-360`

**Step 1: 查看当前代码**

Read lines 340-370 in GameEngine.js to find the type checking code.

**Step 2: 使用工具函数替换类型判断**

将 `if (card.type === 'minion')` 替换为使用 CardType 工具函数：

```javascript
const CardType = require('../utils/cardUtils');

// 原代码
// if (card.type === 'minion') {

// 替换为
if (CardType.isMinion(card)) {
```

**Step 3: 验证修复**

Run: `node -e "const GameEngine = require('./src/game/GameEngine'); const ge = new GameEngine(); ge.startNewGame('mage', null, 'normal'); const state = ge.getGameState(); console.log('Player hand count:', state.player.hand.length); console.log('First card type:', state.player.hand[0]?.type);"`

Expected: 能够正常获取卡牌类型

**Step 4: Commit**

```bash
git add src/game/GameEngine.js
git commit -m "fix: use CardType utility for type checking in GameEngine"
```

---

## Task 3: 修复 RuleEngine.js 中的类型判断

**Files:**
- Modify: `src/game/RuleEngine.js:30`

**Step 1: 查看当前代码**

Read line 30 in RuleEngine.js.

**Step 2: 修复类型判断**

```javascript
// 原代码
if (card.type === 'minion') {

// 替换为
if (CardType.isMinion(card)) {
```

**Step 3: Commit**

```bash
git add src/game/RuleEngine.js
git commit -m "fix: use CardType utility in RuleEngine"
```

---

## Task 4: 修复 TurnManager.js 中的类型判断

**Files:**
- Modify: `src/game/TurnManager.js:153`

**Step 1: 查看当前代码**

Read line 150-160 in TurnManager.js.

**Step 2: 修复类型判断**

```javascript
// 原代码
if (card.type === 'minion') {

// 替换为
if (CardType.isMinion(card)) {
```

**Step 3: Commit**

```bash
git add src/game/TurnManager.js
git commit -m "fix: use CardType utility in TurnManager"
```

---

## Task 5: 修复 AIEngine.js 中的类型判断

**Files:**
- Modify: `src/game/AIEngine.js:85,102,182,188,372`

**Step 1: 查看当前代码**

Grep for `'minion'` and `'spell'` in AIEngine.js to find all occurrences.

**Step 2: 批量替换类型判断**

将所有 `card.type === 'minion'` 替换为 `CardType.isMinion(card)`
将所有 `card.type === 'spell'` 替换为 `CardType.isSpell(card)`

**Step 3: Commit**

```bash
git add src/game/AIEngine.js
git commit -m "fix: use CardType utility in AIEngine"
```

---

## Task 6: 修复 DiscoverPool.js 中的类型判断

**Files:**
- Modify: `src/game/DiscoverPool.js:23,26,29`

**Step 1: 查看当前代码**

Read lines 20-35 in DiscoverPool.js.

**Step 2: 修复类型判断**

```javascript
// 原代码
if (card.type === 'minion') {

// 替换为
if (CardType.isMinion(card)) {
```

**Step 3: Commit**

```bash
git add src/game/DiscoverPool.js
git commit -m "fix: use CardType utility in DiscoverPool"
```

---

## Task 7: 增强 GameScreen UI - 牌库剩余数量

**Files:**
- Modify: `src/ui/screens/GameScreen.js`

**Step 1: 查看当前代码**

Read lines 240-270 in GameScreen.js to see current player info display.

**Step 2: 添加牌库剩余数量显示**

在玩家信息面板中添加牌库剩余数量：

```javascript
// 在显示玩家信息的地方添加
let playerHeroText = `玩家 (${player.hero})
生命: ${player.health}/${player.maxHealth}
护甲: ${player.armor}
法力: ${player.mana}/${player.maxMana}
战场随从: ${player.field.length}/7
牌库: ${player.deck.length}  ← 新增
手牌: ${player.hand.length}/10`;  ← 新增手牌上限
```

**Step 3: 验证显示**

Run the game and verify the deck count is displayed.

**Step 4: Commit**

```bash
git add src/ui/screens/GameScreen.js
git commit -m "feat: add deck count and hand limit to UI"
```

---

## Task 8: 增强 GameScreen UI - 随从特殊状态标记

**Files:**
- Modify: `src/ui/screens/GameScreen.js`

**Step 1: 查看当前战场显示代码**

Read lines 270-285 in GameScreen.js.

**Step 2: 添加特殊状态标记**

修改战场随从显示，添加状态标记：

```javascript
// 战场显示增强
const formatMinion = (m) => {
  let status = '';
  if (m.taunt) status += '!';      // 嘲讽
  if (m.divineShield) status += '#'; // 圣盾
  if (m.frozen) status += '*';     // 冻结
  if (m.stealth) status += '@';    // 潜行
  if (m.poisonous) status += '~';  // 剧毒
  if (m.lifesteal) status += '+';  // 吸血
  return `[${m.attack}/${m.health}]${status}`;
};

// 敌方战场
this.boxes.enemyField.setContent(
  `敌方战场: ` +
  ai.field.map(m => formatMinion(m)).join(' ')
);

// 玩家战场
this.boxes.playerField.setContent(
  `战场: ` +
  player.field.map((m, i) => {
    const sel = i === this.state.selectedFieldIndex ? '>' : '';
    return `${sel}${formatMinion(m)}`;
  }).join(' ')
);
```

**Step 3: Commit**

```bash
git add src/ui/screens/GameScreen.js
git commit -f "feat: add minion status markers to battlefield display"
```

---

## Task 9: 验证整体功能

**Step 1: 运行游戏测试**

```bash
node src/index.js
```

选择法师职业进入游戏，验证：
1. 卡牌能正常显示（随从、法术）
2. 法力值正确显示
3. 牌库剩余数量显示
4. 战场随从显示

**Step 2: 验证抽牌和战场**

1. 回合切换能正常抽牌
2. 打出随从后战场显示正确
3. 随从状态标记正确显示

**Step 3: Commit**

```bash
git add .
git commit -m "test: verify game engine fixes work correctly"
```

---

## 实施完成

所有任务完成后，执行以下命令查看变更：

```bash
git log --oneline main..fix/game-engine-rules
```

预期看到约 10+ 个提交记录。
