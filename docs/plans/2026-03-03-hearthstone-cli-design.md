# 炉石传说 CLI 游戏 - 设计文档

**创建日期**: 2026-03-03  
**版本**: v1.0  
**状态**: 初稿

---

## 1. 项目概述

### 1.1 项目目标

创建一个基于终端的炉石传说 CLI 游戏，支持单人模式和未来的双人对战/联网对战功能。

### 1.2 技术栈

| 层级 | 技术选择 |
|------|----------|
| 开发语言 | Node.js |
| TUI 框架 | blessed |
| 数据存储 | JSON 文件 |
| 包管理 | npm |

### 1.3 扩展路线图

```
Phase 1 (MVP)     Phase 2          Phase 3          Phase 4
     │               │                │                │
     ▼               ▼                ▼                ▼
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ 单人模式 │ ──► │双人本地 │ ──► │ 联网对战│ ──► │ 完整规则│
└─────────┘     └─────────┘     └─────────┘     └─────────┘
```

---

## 2. 架构设计

### 2.1 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (展示层)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  MainMenu   │  │  GameScreen │  │  BattleScreen   │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                 Game Logic (游戏逻辑层)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ GameEngine  │  │  TurnManager │  │ BattleCalculator│  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ CardEffect  │  │  AIEngine   │  │   RuleEngine   │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   Data Layer (数据层)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  CardData   │  │ ProfileData │  │  ConfigData    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                Network Layer (网络层)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   WebSocket │  │   RoomMgr   │  │   Protocol     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 目录结构

```
hs-cli/
├── src/
│   ├── ui/                    # UI 层
│   │   ├── index.js           # UI 入口
│   │   ├── screens/
│   │   │   ├── MainMenu.js    # 主菜单
│   │   │   ├── GameScreen.js  # 游戏界面
│   │   │   └── BattleScreen.js# 战斗界面
│   │   └── components/        # UI 组件
│   │       ├── CardView.js    # 卡牌视图
│   │       ├── HeroPanel.js   # 英雄面板
│   │       └── HandPanel.js   # 手牌面板
│   │
│   ├── game/                  # 游戏逻辑层
│   │   ├── index.js           # 游戏入口
│   │   ├── GameEngine.js      # 游戏引擎
│   │   ├── TurnManager.js     # 回合管理
│   │   ├── BattleCalculator.js# 战斗计算
│   │   ├── CardEffect.js      # 卡牌效果
│   │   ├── AIEngine.js        # AI 逻辑
│   │   └── RuleEngine.js      # 规则引擎
│   │
│   ├── data/                  # 数据层
│   │   ├── CardData.js        # 卡牌数据管理
│   │   ├── ProfileData.js     # 存档数据管理
│   │   └── ConfigData.js      # 配置数据
│   │
│   ├── network/               # 网络层 (预留)
│   │   ├── WebSocketClient.js
│   │   ├── WebSocketServer.js
│   │   ├── RoomManager.js
│   │   └── Protocol.js
│   │
│   └── utils/                 # 工具函数
│       ├── logger.js
│       └── helpers.js
│
├── data/                      # 数据文件
│   ├── cards/                 # 卡牌数据
│   │   ├── mage.json          # 法师卡牌
│   │   └── warrior.json       # 战士卡牌
│   ├── profiles/              # 玩家存档
│   └── config.json            # 配置文件
│
├── package.json
└── index.js                   # 入口文件
```

---

## 3. 数据模型

### 3.1 卡牌数据结构

```json
{
  "id": "mage_fireball",
  "name": "火球术",
  "type": "spell",
  "cost": 4,
  "rarity": "common",
  "description": "造成6点伤害",
  "effect": {
    "type": "damage",
    "value": 6,
    "target": "enemy"
  },
  "classes": ["mage"]
}
```

### 3.2 职业数据

```json
{
  "id": "mage",
  "name": "法师",
  "heroPower": {
    "id": "mage_hero_power",
    "name": "火焰冲击",
    "cost": 2,
    "description": "造成1点伤害"
  },
  "startingHealth": 30,
  "startingDeck": "mage_starter_deck"
}
```

### 3.3 玩家数据结构

```json
{
  "id": "player_1",
  "name": "玩家",
  "hero": "mage",
  "health": 30,
  "maxHealth": 30,
  "mana": 1,
  "maxMana": 1,
  "armor": 0,
  "hand": [],
  "deck": [],
  "field": []
}
```

### 3.4 存档数据结构

```json
{
  "id": "profile_001",
  "name": "玩家名称",
  "createdAt": "2026-03-03T00:00:00Z",
  "updatedAt": "2026-03-03T00:00:00Z",
  "stats": {
    "totalGames": 0,
    "wins": 0,
    "losses": 0
  },
  "decks": [],
  "settings": {
    "difficulty": "normal"
  }
}
```

---

## 4. 核心模块设计

### 4.1 GameEngine (游戏引擎)

**职责**: 协调游戏流程，管理游戏状态

```javascript
class GameEngine {
  // 核心方法
  startNewGame(playerDeck, difficulty)  // 开始新游戏
  loadGame(saveId)                      // 加载存档
  saveGame()                            // 保存游戏
  endGame(result)                       // 结束游戏
  
  // 状态查询
  getGameState()                        // 获取游戏状态
  getCurrentPlayer()                    // 获取当前玩家
}
```

### 4.2 TurnManager (回合管理器)

**职责**: 管理回合流程

```
回合阶段:
1. 抽牌阶段 (Draw Phase)
2. 充能阶段 (Mulligan Phase) - 仅第一回合
3. 行动阶段 (Main Phase)
   - 使用英雄技能
   - 打出卡牌
   - 攻击
4. 结束阶段 (End Phase)
```

### 4.3 BattleCalculator (战斗计算)

**职责**: 计算战斗结果

```javascript
class BattleCalculator {
  calculateDamage(attacker, defender, effect)  // 计算伤害
  calculateHeal(target, value)                  // 计算治疗
  applyBuff(target, buff)                       // 应用buff
  applyDebuff(target, debuff)                   // 应用debuff
}
```

### 4.4 CardEffect (卡牌效果系统)

**职责**: 处理卡牌效果

```javascript
class CardEffect {
  // 效果类型枚举
  static TYPES = {
    DAMAGE: 'damage',
    HEAL: 'heal',
    DRAW_CARD: 'draw_card',
    SUMMON: 'summon',
    BUFF: 'buff',
    DEBUFF: 'debuff',
    DESTROY: 'destroy'
  }
  
  execute(card, context)  // 执行卡牌效果
}
```

### 4.5 AIEngine (AI 引擎)

**职责**: 控制敌方行动

```javascript
class AIEngine {
  decideAction(gameState)     // 决定行动
  selectTarget(availableTargets)  // 选择目标
  evaluateCard(card)         // 评估卡牌价值
}
```

### 4.6 RuleEngine (规则引擎)

**职责**: 验证游戏规则，预留扩展接口

```javascript
class RuleEngine {
  canPlayCard(player, card)    // 检查是否可以打牌
  canAttack(attacker, target) // 检查是否可以攻击
  validateAction(action)      // 验证行动合法性
  
  // 扩展接口
  registerRule(rule)          // 注册新规则 (扩展用)
  getAvailableActions()       // 获取可用行动
}
```

---

## 5. UI 设计

### 5.1 界面布局

```
┌──────────────────────────────────────────────────────────┐
│  [玩家]                              [敌方]              │
│  HP: 30  护甲: 0              HP: 30  护甲: 0           │
├──────────────────────────────────────────────────────────┤
│  [战场 - 敌方随从]                                        │
│  ┌────┐ ┌────┐ ┌────┐                                    │
│  │ 3/2│ │ 4/3│ │ 2/1│                                    │
│  └────┘ └────┘ └────┘                                    │
├──────────────────────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐                                    │
│  │ 4/3│ │ 2/2│ │    │                                    │
│  └────┘ └────┘ └────┘                                    │
│  [战场 - 玩家随从]                                        │
├──────────────────────────────────────────────────────────┤
│  [玩家手牌]                                              │
│  [火球术(4)] [寒冰箭(2)] [奥术智慧(3)] [水人(4)] [镜像(2)] │
├──────────────────────────────────────────────────────────┤
│  水晶: 1/10     回合: 3     操作提示: 选择一张卡牌打出    │
└──────────────────────────────────────────────────────────┘
```

### 5.2 交互设计

- **方向键**: 移动选择
- **Enter**: 确认选择
- **数字键 1-9**: 快捷选择手牌
- **Esc**: 取消/返回

---

## 6. 扩展预留设计

### 6.1 联网对战接口

```javascript
// Network Layer 接口预留
class NetworkAdapter {
  // 这些方法在 Phase 3 实现
  async connect(serverUrl) {}
  async createRoom() {}
  async joinRoom(roomId) {}
  async sendAction(action) {}
  onRemoteAction(callback) {}
}
```

### 6.2 卡牌扩展接口

```javascript
// 新卡牌类型注册
CardEffect.registerType('new_effect_type', handler);

// 新机制注册
MechanicRegistry.register('discover', DiscoverMechanic);
```

---

## 7. 初始卡牌设计

### 7.1 法师卡牌 (10张)

| 卡牌名称 | 费用 | 类型 | 效果 |
|----------|------|------|------|
| 奥术智慧 | 3 | 法术 | 抽2张牌 |
| 寒冰箭 | 2 | 法术 | 造成3点伤害并冻结目标 |
| 火球术 | 4 | 法术 | 造成6点伤害 |
| 水元素 | 4 | 随从 | 3/6，冻结攻击目标 |
| 镜像实体 | 3 | 法术 | 下个敌方随从入场时，召唤一个它的复制 |
| 冰甲术 | 2 | 法术 | 获得5点护甲 |
| 法力浮龙 | 2 | 随从 | 1/3，每施放一个法术后获得+1/+1 |
| 变形术 | 4 | 法术 | 使一个随从变形成为1/1的绵羊 |
| 烈焰风暴 | 7 | 法术 | 对所有敌方随从造成4点伤害 |
| 炎爆术 | 10 | 法术 | 造成10点伤害 |

### 7.2 战士卡牌 (10张)

| 卡牌名称 | 费用 | 类型 | 效果 |
|----------|------|------|------|
| 冲锋 | 1 | 法术 | 随从在本回合可以攻击 |
| 战歌指挥官 | 3 | 随从 | 2/3，你的其他随从获得冲锋 |
| 暴乱狂战士 | 3 | 随从 | 2/4，受到伤害时获得+1/+1 |
| 盾牌格挡 | 3 | 法术 | 获得5点护甲，抽1张牌 |
| 猛击 | 2 | 法术 | 造成4点伤害，强制攻击 |
| 炽热战斗 | 4 | 法术 | 造成2点伤害x随从数量 |
| 死亡之咬 | 4 | 武器 | 4/2，亡语：召唤两个1/1的报告兵 |
| 复仇 | 2 | 法术 | 当一个随从死亡后，对所有敌人造成2点伤害 |
| 绝命乱斗 | 5 | 法术 | 消灭所有随从，随机选择一个存活 |
| 瓦里安·乌瑞恩 | 10 | 随从 | 7/7，冲锋，嘲讽 |

---

## 8. 开发计划

### Phase 1: 基础架构 (MVP)

- [x] 项目初始化
- [ ] 搭建目录结构
- [ ] 配置 blessed 环境
- [ ] 实现基础 UI 框架
- [ ] 实现主菜单

### Phase 2: 游戏核心

- [ ] 实现数据层 (卡牌、存档)
- [ ] 实现 GameEngine
- [ ] 实现回合管理器
- [ ] 实现战斗计算
- [ ] 实现规则引擎

### Phase 3: 交互功能

- [ ] 实现卡牌打出
- [ ] 实现随从攻击
- [ ] 实现英雄技能
- [ ] 实现 AI 对手

### Phase 4: 完善与测试

- [ ] 完善 UI 细节
- [ ] 添加存档功能
- [ ] 单元测试
- [ ] 内部测试

### Phase 5-8: 扩展功能

- Phase 5: 双人本地对战
- Phase 6: 联网对战
- Phase 7: 更多职业
- Phase 8: 完整规则

---

## 9. 里程碑

| 里程碑 | 描述 | 目标日期 |
|--------|------|----------|
| M1 | 项目初始化完成 | 第1天 |
| M2 | 基础 UI 框架完成 | 第2天 |
| M3 | 游戏核心逻辑完成 | 第3-4天 |
| M4 | MVP 完整可玩 | 第5-6天 |
| M5 | 内部测试通过 | 第7天 |

---

## 10. 风险与挑战

1. **blessed 库的学习曲线** - 需要时间熟悉 API
2. **终端兼容性问题** - 不同终端显示效果可能不同
3. **AI 逻辑复杂度** - 需要平衡AI难度
4. **扩展接口设计** - 需要考虑未来扩展的兼容性

---

## 11. 备注

- 初期聚焦 MVP，后续按计划扩展
- 保持代码模块化，便于扩展
- 建议使用 TypeScript 提升代码质量
