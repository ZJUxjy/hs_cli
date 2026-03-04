# 机制与存档功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 完善5个游戏机制（抉择、过载、连击、进化、存档功能）

**Architecture:** 扩展 CardEffect.js、GameEngine.js，添加 UI 支持

**Tech Stack:** Node.js, JSON 卡牌数据, 游戏引擎

---

## Task 1: 抉择机制 (Choose)

**Files:**
- Modify: `src/game/CardEffect.js`
- Modify: `src/game/GameEngine.js`
- Modify: `public/js/game.js`
- Modify: `public/index.html`

**Step 1: 添加 executeChoose 方法**

在 `src/game/CardEffect.js` 文件末尾添加:

```javascript
/**
 * 抉择 - 选择两种效果之一
 */
executeChoose(effect, context) {
  // 抉择效果在打牌时需要玩家选择
  // 返回选择信息给 UI
  return {
    choose: true,
    card: context.card,
    choice1: effect.choice1,
    choice2: effect.choice2
  };
}
```

**Step 2: 修改 GameEngine 处理抉择**

在 `src/game/GameEngine.js` 的 `playCard` 方法中:
- 检查卡牌是否有 `choose` 属性
- 如果是抉择卡牌，返回选择界面而不是直接执行效果
- 添加 `chooseOption` 方法处理玩家选择

**Step 3: 添加 API 端点**

在 `src/api/game.js` 添加:
```javascript
router.post('/choose', (req, res) => {
  const { choice } = req.body;
  // 处理玩家选择
});
```

**Step 4: 添加抉择 UI**

在 `public/index.html` 添加抉择弹窗，在 `public/js/game.js` 添加处理逻辑。

**Step 5: 提交**

```bash
git add src/game/CardEffect.js src/game/GameEngine.js src/api/game.js public/
git commit -m "feat: 添加抉择机制"
```

---

## Task 2: 完善过载机制

**Files:**
- Check: `src/game/TurnManager.js`
- Modify: `src/game/AIEngine.js`

**Step 1: 验证过载逻辑**

检查 `TurnManager.js` 中回合开始时过载是否正确处理:
- 过载值应在对手回合开始时应用
- 过载后清零

**Step 2: AI 过载处理**

确保 AI 打牌时正确处理过载值。

**Step 3: 提交**

---

## Task 3: 完善连击机制

**Files:**
- Modify: `src/game/CardEffect.js`
- Modify: `src/game/GameEngine.js`

**Step 1: 验证现有实现**

现有 combo 实现检查手牌数量>=3时增强效果。确保在打牌时正确触发。

**Step 2: 在打牌时调用 combo**

确保 `executeCardEffect` 或 `playCard` 中调用 `executeCombo`。

**Step 3: 提交**

---

## Task 4: 完善进化机制

**Files:**
- Modify: `src/game/CardEffect.js`

**Step 1: 验证现有实现**

检查 `executeEvolve` 方法实现是否完整。

**Step 2: 提交**

---

## Task 5: 存档功能 UI

**Files:**
- Modify: `public/index.html`
- Modify: `public/js/game.js`
- Modify: `src/api/game.js`

**Step 1: 添加存档按钮**

在游戏界面添加 "保存游戏" 和 "加载游戏" 按钮。

**Step 2: 添加 API 端点**

确保 `/game/save` 和 `/game/load` 端点存在:
```javascript
router.post('/save', (req, res) => {
  const { profileId } = req.body;
  const saved = currentGame.saveCurrentGame(profileId);
  res.json({ success: true, saveId: saved });
});

router.get('/saves', (req, res) => {
  // 返回存档列表
});

router.post('/load', (req, res) => {
  const { saveId } = req.body;
  currentGame.loadFromSave('default', saveId);
  res.json(currentGame.getGameState());
});
```

**Step 3: 前端保存/加载逻辑**

在 `public/js/api.js` 和 `public/js/game.js` 添加保存/加载功能。

**Step 4: 提交**

---

## Task 6: 测试验证

**Step 1: 启动服务器**

```bash
node server.js
```

**Step 2: 测试抉择**
- 打出抉择卡牌
- 选择选项
- 验证效果

**Step 3: 测试过载**
- 使用过载卡牌
- 验证下回合法力锁定

**Step 4: 测试连击**
- 手牌充足时使用连击卡牌
- 验证效果增强

**Step 5: 测试存档**
- 保存游戏
- 重新加载
- 验证状态恢复

**Step 6: 提交**
