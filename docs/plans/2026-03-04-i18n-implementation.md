# 多语言支持实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 为炉石传说游戏添加多语言支持，支持中文、英文、日文、韩文，启动时选择语言

**Architecture:** 使用 JSON 文件存储翻译，通过 i18n 核心模块提供 t() 翻译函数，前后端集成

**Tech Stack:** 纯 JavaScript + JSON 文件，无外部依赖

---

### Task 1: 创建 i18n 核心模块

**Files:**
- Create: `src/i18n/index.js`
- Create: `src/i18n/locales/zh.json`
- Create: `src/i18n/locales/en.json`
- Create: `src/i18n/locales/ja.json`
- Create: `src/i18n/locales/ko.json`

**Step 1: 创建目录结构**

```bash
mkdir -p src/i18n/locales
```

**Step 2: 创建中文翻译文件 zh.json**

创建 `src/i18n/locales/zh.json`，包含所有 UI 文本、机制名称、职业名称

**Step 3: 创建英文翻译文件 en.json**

创建 `src/i18n/locales/en.json`，对应的英文翻译

**Step 4: 创建日文翻译文件 ja.json**

创建 `src/i18n/locales/ja.json`

**Step 5: 创建韩文翻译文件 ko.json**

创建 `src/i18n/locales/ko.json`

**Step 6: 创建 i18n 核心模块**

创建 `src/i18n/index.js`，实现：
- `I18n` 类
- `init(locale)` 初始化
- `setLocale(locale)` 切换语言
- `t(key, params)` 翻译函数
- `getLocale()` 获取当前语言

**Step 7: 提交**

```bash
git add src/i18n/
git commit -m "feat: 添加 i18n 核心模块和翻译文件"
```

---

### Task 2: 后端集成 i18n

**Files:**
- Modify: `src/api/game.js`
- Modify: `src/game/GameEngine.js`
- Modify: `src/game/BattleCalculator.js`

**Step 1: 修改 GameEngine 消息系统**

在 `src/game/GameEngine.js` 中：
- 导入 i18n
- 将 `setMessage` 中的硬编码消息改为翻译键
- 添加 `getMessage()` 方法返回翻译后的消息

**Step 2: 修改 API 响应**

在 `src/api/game.js` 中：
- 导入 i18n
- 修改 `/state` 端点返回翻译后的消息

**Step 3: 提交**

```bash
git add src/game/GameEngine.js src/api/game.js
git commit -m "feat: 后端集成 i18n 翻译"
```

---

### Task 3: 前端集成 i18n

**Files:**
- Modify: `public/js/app.js`
- Modify: `public/js/game.js`
- Modify: `public/js/deck.js`
- Modify: `public/index.html`

**Step 1: 修改 app.js 添加 i18n**

在 `public/js/app.js` 中：
- 添加 i18n 初始化
- 修改语言选择 UI
- 保存语言选择到 localStorage

**Step 2: 修改 game.js 使用翻译**

在 `public/js/game.js` 中：
- 使用 `i18n.t()` 替换硬编码文本
- 修改 `renderGameInfo`, `renderPlayerHand` 等方法

**Step 3: 修改 deck.js 使用翻译**

在 `public/js/deck.js` 中：
- 替换硬编码文本

**Step 4: 修改 index.html 添加语言选择器**

在 `public/index.html` 中：
- 添加语言选择下拉框

**Step 5: 提交**

```bash
git add public/js/app.js public/js/game.js public/js/deck.js public/index.html
git commit -m "feat: 前端集成 i18n 多语言支持"
```

---

### Task 4: 添加语言选择界面

**Files:**
- Modify: `public/index.html`
- Modify: `public/css/style.css`
- Modify: `public/js/app.js`

**Step 1: 添加语言选择界面 HTML**

在 `public/index.html` 中添加语言选择界面

**Step 2: 添加样式**

在 `public/css/style.css` 中添加语言选择样式

**Step 3: 绑定事件**

在 `public/js/app.js` 中绑定语言选择事件

**Step 4: 提交**

```bash
git add public/
git commit -feat: feat: 添加语言选择界面
```

---

### Task 5: 测试和验证

**Step 1: 启动服务器测试**

```bash
node server.js
```

**Step 2: 在浏览器中测试**
- 选择不同语言
- 验证 UI 文本正确显示
- 验证卡牌描述正确翻译

**Step 3: 提交**

```bash
git add .
git commit -m "test: 验证多语言功能"
```
