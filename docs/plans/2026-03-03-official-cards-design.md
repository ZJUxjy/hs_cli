# 官方卡牌数据与卡组系统设计

> 验证日期: 2026-03-03

## 1. 概述

基于 hearthstonejson.com 官方API构建完整的卡牌数据系统和卡组构建功能，支持标准/狂野/双人战模式。

## 2. 数据源

**API端点**: `https://api.hearthstonejson.com/v1/latest/enUS/cards.json`

**数据格式**:
```json
{
  "id": "AT_054",
  "dbfId": 2618,
  "name": "The Mistcaller",
  "cardClass": "SHAMAN",
  "cost": 6,
  "attack": 4,
  "health": 4,
  "type": "MINION",
  "rarity": "LEGENDARY",
  "mechanics": ["BATTLECRY"],
  "set": "TGT",
  "race": "BEAST"
}
```

## 3. 卡牌分类

### 3.1 按模式
- **标准模式 (Standard)**: 当前和过去两年内的扩展包
- **狂野模式 (Wild)**: 所有卡牌
- **双人战 (Battlegrounds)**: 独立卡池

### 3.2 按类型
- MINION (随从)
- SPELL (法术)
- WEAPON (武器)
- HERO (英雄)

### 3.3 按稀有度
- FREE (基础)
- COMMON (普通)
- RARE (稀有)
- EPIC (史诗)
- LEGENDARY (传说)

## 4. 效果映射系统

### 4.1 Mechanics → Effect 映射

| Mechanics | Effect Type | 实现 |
|-----------|-------------|------|
| BATTLECRY | battlecry | 战吼 |
| DEATHRATTLE | deathrattle | 亡语 |
| CHARGE | charge | 冲锋 |
| TAUNT | taunt | 嘲讽 |
| WINDFURY | windfury | 风怒 |
| DIVINE_SHIELD | divine_shield | 圣盾 |
| STEALTH | stealth | 潜行 |
| FROZEN | frozen | 冻结 |
| POISONOUS | poisonous | 剧毒 |
| LIFESTEAL | lifesteal | 吸血 |
| FREEZE | freeze | 冰冻 |
| OVERLOAD | overload | 过载 |
| COMBO | combo | 连击 |
| INSPIRE | inspire | 激励 |
| DISCOVER | discover | 发现 |
| CHOOSE_ONE | choose | 抉择 |
| SECRET | secret | 奥秘 |
| RARITY | - | 保留原值 |
| BATTLECRY | battlecry | 战吼 |

### 4.2 效果参数提取
- 从 card.text 解析效果描述
- 从 mechanics 提取机制类型
- 从 referencedTags 提取引用标签

## 5. 卡组构建

### 5.1 卡组结构
```javascript
{
  "id": "uuid",
  "name": "我的卡组",
  "hero": "mage",
  "mode": "standard", // standard/wild/battlegrounds
  "cards": [
    { "id": "CS2_022", "count": 2 },
    { "id": "EX1_116", "count": 1 }
  ],
  "createdAt": "2026-03-03",
  "updatedAt": "2026-03-03"
}
```

### 5.2 验证规则
- 卡组至少30张卡
- 最多2张同名普通/稀有卡
- 最多1张同名史诗/传说卡
- 必须包含该职业的卡牌（混合职业除外）
- 标准模式只包含标准卡

### 5.3 卡组存储
- 本地 JSON 文件存储
- 支持多个卡组配置

## 6. 数据同步

### 6.1 同步策略
- 启动时检查本地数据是否存在
- 不存在则从API下载
- 存在则检查版本号（可选：增量更新）

### 6.2 数据转换
- API原始数据 → 游戏可用格式
- 字段映射和默认值处理
- 过滤无效/废弃卡牌

## 7. 模块设计

### 7.1 CardData 模块
```javascript
// src/data/CardData.js
class CardData {
  async syncFromAPI()      // 从API同步
  getCard(id)              // 获取单张卡
  getCardsByClass(cls)     // 按职业获取
  getCardsByMode(mode)     // 按模式获取
  getMechanics(card)       // 解析mechanics
  mapEffect(card)          // 转换为effect
}
```

### 7.2 DeckBuilder 模块
```javascript
// src/data/DeckBuilder.js
class DeckBuilder {
  create(name, hero, mode)           // 创建卡组
  addCard(deckId, cardId)            // 添加卡牌
  removeCard(deckId, cardId)         // 移除卡牌
  validate(deckId)                   // 验证卡组
  save(deckId)                       // 保存卡组
  load(deckId)                       // 加载卡组
  list()                             // 列出所有卡组
}
```

### 7.3 数据文件结构
```
data/
├── cards/
│   ├── cards.json       // 完整卡牌数据
│   ├── standard.json    // 标准模式可用
│   └── wild.json       // 狂野模式可用
├── decks/
│   ├── index.json      // 卡组索引
│   └── {id}.json       // 单独卡组
└── config.json
```

## 8. UI 界面

### 8.1 卡组选择界面
- 显示已有卡组列表
- 创建新卡组
- 编辑/删除卡组

### 8.2 卡组编辑界面
- 职业选择
- 模式选择（标准/狂野）
- 卡牌搜索/筛选
- 卡组预览（费用分布、职业分布）

## 9. 实现计划

### Phase 1: 数据同步
- 实现API下载
- 解析并存储卡牌数据
- 实现按职业/模式筛选

### Phase 2: 效果系统
- 实现mechanics→effect映射
- 完善现有效果系统
- 支持所有常见机制

### Phase 3: 卡组系统
- 卡组CRUD
- 卡组验证
- 卡组选择UI

### Phase 4: 模式支持
- 标准/狂野区分
- 双人战卡池

---

**设计批准**: 用户确认 (2026-03-03)
