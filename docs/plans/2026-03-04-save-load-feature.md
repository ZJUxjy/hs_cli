# 游戏存档功能实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 实现完整的游戏存档功能，包括游戏中保存/加载、玩家数据持久化

**Architecture:** 扩展 ProfileData.js 添加游戏存档管理，扩展 GameEngine.js 完善保存/加载逻辑，添加存档UI界面

**Tech Stack:** Node.js, JSON 文件存储, blessed TUI

---

## Task 1: 扩展 ProfileData.js - 添加游戏存档管理

**Files:**
- Modify: `src/data/ProfileData.js`

**Step 1: 添加游戏存档相关方法**

在 ProfileData 类中添加:
```javascript
/**
 * 保存游戏进度
 * @param {string} profileId - 存档ID
 * @param {object} gameState - 游戏状态
 */
saveGameState(profileId, gameState) {
  const profile = this.loadProfile(profileId);
  if (!profile) return false;

  if (!profile.games) profile.games = [];

  const gameSave = {
    id: 'game_' + Date.now(),
    state: gameState,
    savedAt: new Date().toISOString(),
    turn: gameState.turn,
    playerHero: gameState.player?.hero,
    aiHero: gameState.ai?.hero
  };

  profile.games.push(gameSave);
  // 只保留最近5个游戏存档
  if (profile.games.length > 5) {
    profile.games = profile.games.slice(-5);
  }

  this.saveProfile(profile);
  return true;
}

/**
 * 加载游戏进度
 * @param {string} profileId - 存档ID
 * @param {string} gameId - 游戏ID
 */
loadGameState(profileId, gameId) {
  const profile = this.loadProfile(profileId);
  if (!profile || !profile.games) return null;

  return profile.games.find(g => g.id === gameId) || null;
}

/**
 * 获取游戏存档列表
 * @param {string} profileId - 存档ID
 */
listGameSaves(profileId) {
  const profile = this.loadProfile(profileId);
  if (!profile || !profile.games) return [];

  return profile.games.map(g => ({
    id: g.id,
    savedAt: g.savedAt,
    turn: g.turn,
    playerHero: g.playerHero,
    aiHero: g.aiHero
  })).reverse();
}
```

**Step 2: 测试验证**

运行: `node -e "const ProfileData = require('./src/data/ProfileData'); console.log('ProfileData loaded');"`

**Step 3: 提交**

---

## Task 2: 完善 GameEngine.js - 增强保存/加载逻辑

**Files:**
- Modify: `src/game/GameEngine.js`

**Step 1: 增强 getSaveData 方法**

修改 getSaveData:
```javascript
getSaveData() {
  // 清理不必要的状态数据
  const stateCopy = JSON.parse(JSON.stringify(this.state));

  // 清理循环引用和函数
  if (stateCopy.player) {
    delete stateCopy.player.field?._;
    delete stateCopy.ai.field?._;
  }

  return {
    state: stateCopy,
    savedAt: new Date().toISOString(),
    version: '1.0'
  };
}
```

**Step 2: 增强 loadGame 方法**

```javascript
loadGame(savedState) {
  this.state = savedState.state;
  this.turnManager = new TurnManager(this);

  // 重新初始化 CardEffect 引用
  this.cardEffect = null;

  Logger.info('游戏已加载');
  return true;
}
```

**Step 3: 添加保存游戏入口方法**

```javascript
/**
 * 保存当前游戏
 * @param {string} profileId - 玩家存档ID
 */
saveCurrentGame(profileId) {
  const ProfileData = require('../data/ProfileData');
  const saveData = this.getSaveData();
  return ProfileData.saveGameState(profileId, saveData);
}

/**
 * 加载游戏
 * @param {string} profileId - 玩家存档ID
 * @param {string} gameId - 游戏ID
 */
loadFromSave(profileId, gameId) {
  const ProfileData = require('../data/ProfileData');
  const gameSave = ProfileData.loadGameState(profileId, gameId);

  if (!gameSave) {
    Logger.error('找不到游戏存档');
    return false;
  }

  return this.loadGame(gameSave);
}
```

**Step 4: 测试验证**

运行: `node -e "const GameEngine = require('./src/game/GameEngine'); const ge = new GameEngine(); console.log('saveCurrentGame:', typeof ge.saveCurrentGame);"`

**Step 5: 提交**

---

## Task 3: 添加存档UI界面

**Files:**
- Modify: `src/ui/screens/GameScreen.js` 或创建新文件

**Step 1: 在游戏中添加保存选项**

在 GameScreen 中添加快捷键处理:
```javascript
// 在按键处理中添加
screen.key(['s', 'C-s'], () => {
  // 保存游戏
  this.saveGame();
});

// 保存游戏方法
saveGame() {
  const profileId = this.currentProfile?.id;
  if (profileId) {
    this.gameEngine.saveCurrentGame(profileId);
    this.setMessage('游戏已保存!');
  }
}
```

**Step 2: 添加加载存档界面**

创建新屏幕或扩展现有菜单:
- 显示存档列表
- 选择存档加载

**Step 3: 测试验证**

运行: `node index.js` 测试保存功能

**Step 4: 提交**

---

## Task 4: 整合测试

**Step 1: 测试完整流程**

1. 开始新游戏
2. 进行几个回合
3. 保存游戏
4. 重新开始游戏
5. 加载存档
6. 验证游戏状态正确恢复

**Step 2: 提交**

---

## 验收标准

1. 游戏中可以保存当前进度
2. 可以从主菜单加载已有存档
3. 存档列表显示游戏信息（回合数、职业）
4. 加载后游戏状态正确恢复
5. 最多保留5个游戏存档
