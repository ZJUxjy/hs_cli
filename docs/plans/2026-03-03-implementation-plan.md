# 炉石传说 CLI 游戏 - 实现计划

**基于设计文档**: `2026-03-03-hearthstone-cli-design.md`  
**创建日期**: 2026-03-03

---

## 概述

本文档将设计文档拆解为可执行的具体开发任务。每个任务都包含详细的步骤和验收标准。

**预计总工期**: 7 天 (MVP)

---

## 任务总览

```
Day 1          Day 2          Day 3-4        Day 5-6        Day 7
  │               │               │               │               │
  ▼               ▼               ▼               ▼               ▼
┌─────┐       ┌─────┐       ┌─────┐       ┌─────┐       ┌─────┐
│ P1  │──────►│ P2  │──────►│ P3  │──────►│ P4  │──────►│测试 │
│基础 │       │游戏 │       │交互 │       │完善 │       │验收 │
└─────┘       │核心 │       │功能 │       │存档 │       └─────┘
              └─────┘       └─────┘       └─────┘
```

---

## Phase 1: 基础架构 (第1天)

### 任务 1.1: 项目初始化

**目标**: 创建 Node.js 项目并配置基础环境

**步骤**:
1. 初始化 npm 项目: `npm init -y`
2. 安装项目依赖:
   ```bash
   npm install blessed
   ```
3. 安装开发依赖 (可选):
   ```bash
   npm install --save-dev nodemon
   ```
4. 创建入口文件 `index.js`
5. 创建基础目录结构:
   ```bash
   mkdir -p src/ui/screens src/ui/components src/game src/data src/network src/utils
   mkdir -p data/cards data/profiles
   ```

**验收标准**:
- [ ] `package.json` 存在且包含 `blessed` 依赖
- [ ] 目录结构符合设计文档
- [ ] `node index.js` 可以执行 (可先为空)

---

### 任务 1.2: 配置 blessed 环境

**目标**: 创建基础的 blessed 程序框架

**步骤**:
1. 在 `src/utils/logger.js` 创建日志工具:
   - 实现 `info()`, `error()`, `debug()` 方法
   - 支持彩色输出

2. 在 `src/utils/helpers.js` 创建辅助函数:
   - `clearScreen()`: 清屏
   - `sleep(ms)`: 延时
   - `generateId()`: 生成唯一ID

3. 创建主程序框架 `index.js`:
   ```javascript
   const blessed = require('blessed');
   
   // 创建屏幕
   const screen = blessed.screen({
     smartCSR: true,
     title: '炉石传说 CLI'
   });
   
   // 绑定退出快捷键
   screen.key(['escape', 'q', 'C-c'], () => {
     process.exit(0);
   });
   
   // 渲染循环
   screen.render();
   ```

**验收标准**:
- [ ] 运行 `node index.js` 不报错
- [ ] 窗口可以正常显示和退出

---

### 任务 1.3: 实现主菜单 UI

**目标**: 创建游戏主菜单界面

**步骤**:
1. 创建 `src/ui/screens/MainMenu.js`:
   - 创建主菜单组件 (blessed.box + blessed.list)
   - 菜单项: "新游戏", "继续", "设置", "退出"
   - 绑定上下选择、确认、取消事件

2. 在 `index.js` 中引入并显示主菜单

3. 实现菜单项功能 (预留):
   - "新游戏" → 跳转游戏界面
   - "继续" → 加载存档
   - "设置" → 预留
   - "退出" → 退出程序

**验收标准**:
- [ ] 菜单可以正常显示
- [ ] 上下键可以切换选项
- [ ] 回车可以确认选择
- [ ] ESC/q 可以退出

---

## Phase 2: 游戏核心 (第2天)

### 任务 2.1: 实现数据层 - 卡牌数据

**目标**: 创建卡牌数据管理模块

**步骤**:
1. 创建 `data/cards/mage.json`:
   ```json
   [
     {
       "id": "mage_arcane_intellect",
       "name": "奥术智慧",
       "type": "spell",
       "cost": 3,
       "rarity": "common",
       "description": "抽2张牌",
       "effect": { "type": "draw_card", "value": 2 },
       "classes": ["mage"]
     },
     {
       "id": "mage_frostbolt",
       "name": "寒冰箭",
       "type": "spell",
       "cost": 2,
       "rarity": "common",
       "description": "造成3点伤害并冻结目标",
       "effect": { "type": "damage_freeze", "value": 3 },
       "classes": ["mage"]
     },
     {
       "id": "mage_fireball",
       "name": "火球术",
       "type": "spell",
       "cost": 4,
       "rarity": "common",
       "description": "造成6点伤害",
       "effect": { "type": "damage", "value": 6, "target": "enemy" },
       "classes": ["mage"]
     },
     {
       "id": "mage_water_elemental",
       "name": "水元素",
       "type": "minion",
       "cost": 4,
       "rarity": "common",
       "description": "3/6，冻结攻击目标",
       "effect": { "type": "summon", "attack": 3, "health": 6, "freeze": true },
       "classes": ["mage"]
     },
     {
       "id": "mage_mirror_entity",
       "name": "镜像实体",
       "type": "spell",
       "cost": 3,
       "rarity": "common",
       "description": "下个敌方随从入场时，召唤一个它的复制",
       "effect": { "type": "secret", "trigger": "enemy_minion_enter" },
       "classes": ["mage"]
     }
   ]
   ```

2. 创建 `data/cards/warrior.json` (类似结构)

3. 创建 `data/config.json`:
   ```json
   {
     "classes": {
       "mage": { "name": "法师", "startingHealth": 30, "heroPower": "fireball" },
       "warrior": { "name": "战士", "startingHealth": 30, "heroPower": "shield" }
     }
   }
   ```

4. 创建 `src/data/CardData.js`:
   ```javascript
   const fs = require('fs');
   const path = require('path');
   
   class CardData {
     constructor() {
       this.cards = {};
       this.loadAllCards();
     }
   
     loadAllCards() {
       const cardsDir = path.join(__dirname, '../../data/cards');
       const files = fs.readdirSync(cardsDir);
       
       files.forEach(file => {
         if (file.endsWith('.json')) {
           const data = JSON.parse(fs.readFileSync(path.join(cardsDir, file), 'utf8'));
           data.forEach(card => {
             this.cards[card.id] = card;
           });
         }
       });
     }
   
     getCard(id) { return this.cards[id]; }
     getCardsByClass(cls) {
       return Object.values(this.cards).filter(c => c.classes.includes(cls));
     }
   }
   
   module.exports = new CardData();
   ```

**验收标准**:
- [ ] `CardData.getCard('mage_fireball')` 返回正确数据
- [ ] `CardData.getCardsByClass('mage')` 返回法师卡牌列表

---

### 任务 2.2: 实现数据层 - 存档管理

**目标**: 创建玩家存档管理

**步骤**:
1. 创建 `data/profiles/.gitkeep` (确保目录存在)

2. 创建 `src/data/ProfileData.js`:
   ```javascript
   const fs = require('fs');
   const path = require('path');
   
   class ProfileData {
     constructor() {
       this.profilesDir = path.join(__dirname, '../../data/profiles');
     }
   
     listProfiles() {
       const files = fs.readdirSync(this.profilesDir);
       return files.filter(f => f.endsWith('.json')).map(f => {
         const data = JSON.parse(fs.readFileSync(path.join(this.profilesDir, f), 'utf8'));
         return { id: data.id, name: data.name, updatedAt: data.updatedAt };
       });
     }
   
     loadProfile(id) {
       const filePath = path.join(this.profilesDir, `${id}.json`);
       if (!fs.existsSync(filePath)) return null;
       return JSON.parse(fs.readFileSync(filePath, 'utf8'));
     }
   
     saveProfile(profile) {
       profile.updatedAt = new Date().toISOString();
       const filePath = path.join(this.profilesDir, `${profile.id}.json`);
       fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
     }
   
     createProfile(name) {
       const id = 'profile_' + Date.now();
       const profile = {
         id,
         name,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         stats: { totalGames: 0, wins: 0, losses: 0 },
         decks: [],
         settings: { difficulty: 'normal' }
       };
       this.saveProfile(profile);
       return profile;
     }
   }
   
   module.exports = new ProfileData();
   ```

**验收标准**:
- [ ] 可以创建新存档
- [ ] 可以列出所有存档
- [ ] 可以加载存档

---

### 任务 2.3: 实现 GameEngine

**目标**: 创建游戏引擎

**步骤**:
1. 创建 `src/game/GameEngine.js`:
   ```javascript
   const CardData = require('../data/CardData');
   const ProfileData = require('../data/ProfileData');
   const TurnManager = require('./TurnManager');
   
   class GameEngine {
     constructor() {
       this.state = null;
       this.turnManager = null;
     }
   
     // 开始新游戏
     startNewGame(playerClass, difficulty = 'normal') {
       const player = this.createPlayer('player', playerClass);
       const ai = this.createPlayer('ai', this.getOppositeClass(playerClass));
       
       this.state = {
         phase: 'init', // init, mulligan, main, end
         turn: 1,
         currentPlayer: 'player',
         player,
         ai,
         winner: null,
         difficulty
       };
   
       // 抽初始手牌 (3张)
       this.drawCard(player, 3);
       this.drawCard(ai, 3);
   
       // 第一回合抽牌 (先手3张，后手4张)
       this.drawCard(player, 1);
       this.drawCard(ai, 1);
   
       this.turnManager = new TurnManager(this);
       return this.state;
     }
   
     createPlayer(type, heroClass) {
       const cards = CardData.getCardsByClass(heroClass);
       // 构建初始套牌 (复制卡牌数组)
       const deck = [...cards, ...cards].slice(0, 30).map(c => ({ ...c }));
       // 随机打乱
       this.shuffle(deck);
   
       return {
         id: type,
         name: type === 'player' ? '玩家' : '敌方',
         hero: heroClass,
         health: 30,
         maxHealth: 30,
         mana: 1,
         maxMana: 1,
         armor: 0,
         hand: [],
         deck,
         field: []
       };
     }
   
     shuffle(array) {
       for (let i = array.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [array[i], array[j]] = [array[j], array[i]];
       }
     }
   
     drawCard(player, count = 1) {
       for (let i = 0; i < count; i++) {
         if (player.deck.length > 0 && player.hand.length < 10) {
           player.hand.push(player.deck.pop());
         }
       }
     }
   
     getOppositeClass(cls) {
       return cls === 'mage' ? 'warrior' : 'mage';
     }
   
     getGameState() {
       return this.state;
     }
   
     getCurrentPlayer() {
       return this.state.currentPlayer === 'player' ? this.state.player : this.state.ai;
     }
   
     getOpponent() {
       return this.state.currentPlayer === 'player' ? this.state.ai : this.state.player;
     }
   
     endGame(winner) {
       this.state.winner = winner;
       this.state.phase = 'ended';
     }
   }
   
   module.exports = GameEngine;
   ```

2. 创建 `src/game/TurnManager.js`:
   ```javascript
   class TurnManager {
     constructor(gameEngine) {
       this.game = gameEngine;
     }
   
     startTurn() {
       const state = this.game.getGameState();
       const player = this.game.getCurrentPlayer();
   
       // 回合计时
       if (state.turn > 1) {
         player.mana = Math.min(player.mana + 1, 10);
       }
       player.maxMana = Math.min(player.maxMana + (state.turn > 1 ? 1 : 0), 10);
   
       // 抽牌
       this.game.drawCard(player, 1);
   
       state.phase = 'main';
     }
   
     endTurn() {
       const state = this.game.getGameState();
   
       // 切换玩家
       state.currentPlayer = state.currentPlayer === 'player' ? 'ai' : 'player';
   
       if (state.currentPlayer === 'player') {
         state.turn++;
       }
   
       // 检查胜负
       this.checkWinCondition();
   
       // 开始下一回合
       this.startTurn();
     }
   
     checkWinCondition() {
       const state = this.game.getGameState();
   
       if (state.player.health <= 0) {
         this.game.endGame('ai');
       } else if (state.ai.health <= 0) {
         this.game.endGame('player');
       }
     }
   }
   
   module.exports = TurnManager;
   ```

**验收标准**:
- [ ] `GameEngine.startNewGame()` 可以初始化游戏状态
- [ ] `TurnManager.startTurn()` 可以开始回合
- [ ] `TurnManager.endTurn()` 可以切换玩家

---

## Phase 3: 交互功能 (第3-4天)

### 任务 3.1: 实现战斗计算

**目标**: 创建战斗计算模块

**步骤**:
1. 创建 `src/game/BattleCalculator.js`:
   ```javascript
   class BattleCalculator {
     // 计算伤害
     calculateDamage(target, damage, effect = {}) {
       let actualDamage = damage;
   
       // 护甲减免
       if (target.armor > 0) {
         const armorDamage = Math.min(target.armor, damage);
         target.armor -= armorDamage;
         actualDamage -= armorDamage;
       }
   
       if (actualDamage > 0) {
         target.health -= actualDamage;
       }
   
       // 冻结效果
       if (effect.freeze) {
         target.frozen = true;
       }
   
       return actualDamage;
     }
   
     // 治疗
     calculateHeal(target, value) {
       const healAmount = Math.min(value, target.maxHealth - target.health);
       target.health += healAmount;
       return healAmount;
     }
   
     // 应用buff
     applyBuff(minion, buff) {
       if (buff.attack) minion.attack += buff.attack;
       if (buff.health) minion.health += buff.health;
     }
   
     // 随从战斗
     battle(minion1, minion2) {
       const dmg1 = this.calculateDamage(minion2, minion1.attack);
       const dmg2 = this.calculateDamage(minion1, minion2.attack);
   
       // 移除死亡的随从
       return {
         minion1Dead: minion1.health <= 0,
         minion2Dead: minion2.health <= 0
       };
     }
   }
   
   module.exports = new BattleCalculator();
   ```

**验收标准**:
- [ ] 伤害计算正确处理护甲
- [ ] 治疗不超过最大生命值

---

### 任务 3.2: 实现卡牌效果系统

**目标**: 创建卡牌效果执行模块

**步骤**:
1. 创建 `src/game/CardEffect.js`:
   ```javascript
   const BattleCalculator = require('./BattleCalculator');
   
   class CardEffect {
     static TYPES = {
       DAMAGE: 'damage',
       HEAL: 'heal',
       DRAW_CARD: 'draw_card',
       SUMMON: 'summon',
       BUFF: 'buff',
       SECRET: 'secret'
     };
   
     constructor(gameEngine) {
       this.game = gameEngine;
       this.battleCalc = BattleCalculator;
     }
   
     // 执行卡牌效果
     execute(card, context) {
       const effect = card.effect;
       if (!effect) return;
   
       switch (effect.type) {
         case 'damage':
           return this.executeDamage(effect, context);
         case 'damage_freeze':
           return this.executeDamageFreeze(effect, context);
         case 'heal':
           return this.executeHeal(effect, context);
         case 'draw_card':
           return this.executeDrawCard(effect, context);
         case 'summon':
           return this.executeSummon(card, effect, context);
         case 'secret':
           return this.executeSecret(effect, context);
         default:
           console.log(`未知效果类型: ${effect.type}`);
       }
     }
   
     executeDamage(effect, context) {
       const target = context.target;
       if (!target) {
         console.log('没有选择目标');
         return false;
       }
       this.battleCalc.calculateDamage(target, effect.value);
       return true;
     }
   
     executeDamageFreeze(effect, context) {
       const target = context.target;
       if (!target) {
         console.log('没有选择目标');
         return false;
       }
       this.battleCalc.calculateDamage(target, effect.value, { freeze: true });
       return true;
     }
   
     executeHeal(effect, context) {
       const target = context.target || context.player;
       this.battleCalc.calculateHeal(target, effect.value);
       return true;
     }
   
     executeDrawCard(effect, context) {
       const player = context.player;
       this.game.drawCard(player, effect.value);
       return true;
     }
   
     executeSummon(card, effect, context) {
       const player = context.player;
       const minion = {
         id: card.id + '_' + Date.now(),
         name: card.name,
         attack: effect.attack,
         health: effect.health,
         maxHealth: effect.health,
         canAttack: false,
         frozen: false,
         effects: []
       };
   
       if (effect.freeze) {
         minion.freeze = true;
       }
   
       if (player.field.length < 7) {
         player.field.push(minion);
       }
       return true;
     }
   
     executeSecret(effect, context) {
       const player = context.player;
       if (!player.secrets) player.secrets = [];
       player.secrets.push({
         id: 'secret_' + Date.now(),
         trigger: effect.trigger,
         originalCard: context.card
       });
       return true;
     }
   }
   
   module.exports = CardEffect;
   ```

**验收标准**:
- [ ] 法术卡可以正确执行效果
- [ ] 随从卡可以召唤到场上

---

### 任务 3.3: 实现规则引擎

**目标**: 创建规则验证模块

**步骤**:
1. 创建 `src/game/RuleEngine.js`:
   ```javascript
   class RuleEngine {
     constructor(gameEngine) {
       this.game = gameEngine;
     }
   
     // 检查是否可以打牌
     canPlayCard(player, card) {
       // 检查费用
       if (player.mana < card.cost) {
         return { valid: false, reason: '法力值不足' };
       }
   
       // 检查手牌
       if (!player.hand.includes(card)) {
         return { valid: false, reason: '手牌中没有这张卡' };
       }
   
       // 检查随从数量
       if (card.type === 'minion' && player.field.length >= 7) {
         return { valid: false, reason: '战场已满' };
       }
   
       return { valid: true };
     }
   
     // 检查是否可以攻击
     canAttack(attacker, target) {
       // 检查是否被冻结
       if (attacker.frozen) {
         return { valid: false, reason: '随从被冻结' };
       }
   
       // 检查本回合是否已经攻击
       if (attacker.hasAttacked) {
         return { valid: false, reason: '本回合已攻击' };
       }
   
       // 检查是否嘲讽随从
       const opponent = this.game.getOpponent();
       const hasTaunt = opponent.field.some(m => m.taunt);
       if (hasTaunt && !target.taunt) {
         return { valid: false, reason: '必须攻击嘲讽随从' };
       }
   
       return { valid: true };
     }
   
     // 验证行动
     validateAction(action) {
       switch (action.type) {
         case 'play_card':
           return this.canPlayCard(action.player, action.card);
         case 'attack':
           return this.canAttack(action.attacker, action.target);
         default:
           return { valid: false, reason: '未知行动' };
       }
     }
   }
   
   module.exports = RuleEngine;
   ```

**验收标准**:
- [ ] 正确验证法力值不足的情况
- [ ] 正确验证被冻结的随从

---

### 任务 3.4: 实现 AI 引擎

**目标**: 创建简单 AI 对手

**步骤**:
1. 创建 `src/game/AIEngine.js`:
   ```javascript
   class AIEngine {
     constructor(gameEngine) {
       this.game = gameEngine;
     }
   
     // AI 决策
     decide() {
       const state = this.game.getGameState();
       const ai = state.ai;
       const player = state.player;
   
       const actions = [];
   
       // 1. 使用英雄技能 (如果有)
       // (暂留)
   
       // 2. 打出随从
       const playableMinions = ai.hand
         .filter(c => c.type === 'minion' && c.cost <= ai.mana)
         .sort((a, b) => b.cost - a.cost);
   
       if (playableMinions.length > 0 && ai.field.length < 7) {
         actions.push({
           type: 'play_card',
           card: playableMinions[0]
         });
       }
   
       // 3. 打出法术
       const playableSpells = ai.hand
         .filter(c => c.type === 'spell' && c.cost <= ai.mana);
   
       if (playableSpells.length > 0 && player.field.length > 0) {
         actions.push({
           type: 'play_card',
           card: playableSpells[0],
           target: player.field[0]
         });
       }
   
       // 4. 随从攻击
       ai.field.forEach(minion => {
         if (minion.canAttack && !minion.hasAttacked) {
           // 攻击玩家或随从
           const target = player.field.length > 0
             ? player.field[Math.floor(Math.random() * player.field.length)]
             : player;
           actions.push({
             type: 'attack',
             attacker: minion,
             target
           });
         }
       });
   
       return actions;
     }
   
     // 执行一个行动
     executeAction(action) {
       const state = this.game.getGameState();
       const ai = state.ai;
   
       switch (action.type) {
         case 'play_card':
           // 移除手牌
           const cardIndex = ai.hand.indexOf(action.card);
           if (cardIndex > -1) {
             ai.hand.splice(cardIndex, 1);
             ai.mana -= action.card.cost;
   
             // 执行效果
             if (action.card.type === 'minion') {
               // 召唤随从
               const minion = {
                 id: action.card.id + '_' + Date.now(),
                 name: action.card.name,
                 attack: action.card.effect.attack,
                 health: action.card.effect.health,
                 maxHealth: action.card.effect.health,
                 canAttack: false,
                 hasAttacked: false,
                 frozen: false
               };
               ai.field.push(minion);
             } else {
               // 执行法术效果
               // (需要调用 CardEffect)
             }
           }
           break;
   
         case 'attack':
           const target = action.target;
           if (target.health !== undefined) {
             // 攻击随从
             target.health -= action.attacker.attack;
             action.attacker.health -= target.attack;
             action.attacker.hasAttacked = true;
           } else {
             // 攻击英雄
             target.health -= action.attacker.attack;
             action.attacker.hasAttacked = true;
           }
           break;
       }
     }
   }
   
   module.exports = AIEngine;
   ```

**验收标准**:
- [ ] AI 可以自动出牌
- [ ] AI 可以自动攻击

---

### 任务 3.5: 实现游戏界面 UI

**目标**: 创建游戏主界面

**步骤**:
1. 创建 `src/ui/screens/GameScreen.js`:
   - 创建游戏界面布局
   - 显示双方英雄信息
   - 显示战场随从
   - 显示手牌
   - 显示操作提示

2. 实现交互:
   - 数字键选择手牌
   - 方向键选择目标
   - 确认打出/攻击

3. 创建 `src/ui/screens/BattleScreen.js`:
   - 整合游戏界面和游戏逻辑

**验收标准**:
- [ ] 界面正确显示双方状态
- [ ] 可以选择并打出卡牌

---

## Phase 4: 完善与测试 (第5-6天)

### 任务 4.1: 完善 UI 细节

**目标**: 优化界面显示效果

**步骤**:
1. 添加卡牌详细信息显示
2. 添加战斗动画效果 (延时)
3. 添加操作反馈消息
4. 美化界面布局和颜色

### 任务 4.2: 添加存档功能

**目标**: 实现游戏保存和加载

**步骤**:
1. 在 `GameEngine` 添加 `saveGame()` 方法
2. 实现游戏存档选择界面
3. 实现断线重连功能 (预留)

### 任务 4.3: 完善游戏流程

**目标**: 修复已知问题

**步骤**:
1. 实现游戏结束界面
2. 添加重新开始功能
3. 添加返回主菜单功能
4. 修复已知 bug

---

## Phase 5: 内部测试 (第7天)

### 任务 5.1: 单元测试

**目标**: 确保核心逻辑正确

**步骤**:
1. 安装测试框架: `npm install --save-dev jest`
2. 创建测试文件:
   - `test/BattleCalculator.test.js`
   - `test/CardEffect.test.js`
   - `test/RuleEngine.test.js`
3. 运行测试

### 任务 5.2: 手动测试

**目标**: 确保游戏可玩

**步骤**:
1. 完整游戏流程测试
2. AI 对战测试
3. 边界情况测试 (如空牌库)

---

## 验收清单

### MVP 验收标准

- [ ] 可以启动游戏并显示主菜单
- [ ] 可以选择职业开始新游戏
- [ ] 可以看到双方英雄状态
- [ ] 可以看到手牌
- [ ] 可以打出随从卡
- [ ] 可以打出法术卡
- [ ] 随从可以攻击
- [ ] AI 可以自动行动
- [ ] 可以判断胜负
- [ ] 可以保存和加载游戏

---

## 后续扩展

### Phase 5: 双人本地对战

- [ ] 添加玩家选择界面
- [ ] 轮流操作逻辑

### Phase 6: 联网对战

- [ ] 实现 WebSocket 连接
- [ ] 实现房间系统
- [ ] 实现同步协议

### Phase 7-8: 更多内容

- [ ] 添加更多职业
- [ ] 添加更多卡牌
- [ ] 添加扩展卡牌包系统
