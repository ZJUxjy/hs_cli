# 炉石传说 RL 游戏引擎设计文档

**创建日期**: 2026-03-03
**目标**: 实现可被强化学习系统接入的炉石传说CLI游戏

---

## 1. 概述

本文档描述了一个可被强化学习系统接入的炉石传说游戏引擎设计。该引擎提供 HTTP API 接口，支持 Gymnasium 风格的 RL 环境交互。

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    炉石传说 RL 游戏引擎                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │  GameCore  │  │   CardDB   │  │   TurnManager  │   │
│  │  (核心逻辑)  │  │  (卡牌数据)  │  │   (回合管理)    │   │
│  └─────────────┘  └─────────────┘  └─────────────────┘   │
│                         │                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              RL API Server (HTTP)                    │  │
│  │  POST /reset  POST /step  GET /action_space        │  │
│  │  GET /observation_space  GET /game_state             │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  RL Agent       │
                    │ (PyTorch/TF)    │
                    └─────────────────┘
```

## 3. API 接口设计

### 3.1 开始新游戏 (reset)

**请求**:
```
POST /reset
{
  "player_class": "mage",      // 玩家职业
  "opponent_class": "warrior" // 对手职业
}
```

**响应**:
```json
{
  "observation": {
    "player": {
      "health": 30,
      "armor": 0,
      "mana": 1,
      "maxMana": 1,
      "hand": [...],
      "field": [...],
      "deck_count": 26
    },
    "opponent": {...},
    "turn": 1,
    "game_phase": "main"
  },
  "action_mask": [1, 1, 0, 0, ...],  // 可用动作掩码
  "reward": 0,
  "done": false,
  "info": {}
}
```

### 3.2 执行动作 (step)

**请求**:
```
POST /step
{
  "action": {
    "type": "play_card",
    "card_index": 0
  }
}
```

**响应**: 同 reset 响应

### 3.3 获取动作空间

**请求**:
```
GET /action_space
```

**响应**:
```json
{
  "n_actions": 50,
  "actions": [
    {"id": 0, "type": "play_card", "card_index": 0},
    {"id": 1, "type": "play_card", "card_index": 1},
    ...
    {"id": 30, "type": "attack", "attacker": 0, "target": "hero"},
    {"id": 31, "type": "attack", "attacker": 0, "target": 1},
    ...
    {"id": 45, "type": "end_turn"},
    {"id": 46, "type": "hero_power", "target": "hero"}
  ]
}
```

### 3.4 获取状态空间

**请求**:
```
GET /observation_space
```

**响应**:
```json
{
  "shape": [200],
  "dtype": "float32",
  "description": "游戏状态向量化的维度"
}
```

## 4. 状态表示

### 4.1 玩家状态
```json
{
  "health": 30,           // 英雄生命值
  "armor": 0,            // 护甲
  "mana": 1,             // 当前法力
  "maxMana": 1,          // 最大法力
  "hand": [               // 手牌 (最多10)
    {"id": "card_1", "cost": 2, "attack": 0, "health": 0, "type": "spell"}
  ],
  "field": [              // 战场随从 (最多7)
    {"id": "minion_1", "attack": 3, "health": 6, "taunt": false, "frozen": false}
  ],
  "deck_count": 26,       // 牌库数量
  "secrets_count": 0      // 奥秘数量
}
```

### 4.2 状态向量化
- 所有状态编码为固定长度向量
- 使用 one-hot 编码表示卡牌ID
- 数值型状态归一化到 [0, 1]

## 5. 动作空间

### 5.1 动作类型
| 动作ID | 类型 | 说明 |
|--------|------|------|
| 0-9 | play_card | 出手牌 (0-9号) |
| 10-23 | attack | 攻击 (随从index → 目标) |
| 24 | end_turn | 结束回合 |
| 25 | hero_power | 使用英雄技能 |

### 5.2 动作掩码
- 每个动作对应二进制掩码
- 1: 可执行, 0: 不可执行
- 例: 法力不足时，cost>当前法力 的卡牌掩码为0

## 6. 奖励设计

| 事件 | 奖励 |
|------|------|
| 对敌方英雄造成伤害 | +伤害值/10 |
| 击杀敌方随从 | +随从费用/5 |
| 召唤随从 | +0.1 |
| 抽牌 | +0.05 |
| 敌方英雄生命≤0 | +100 |
| 自己英雄生命≤0 | -100 |
| 超时/无效动作 | -1 |

## 7. 卡牌效果 (已实现)

### 法术类型
- `damage`: 单体伤害
- `damage_freeze`: 伤害+冻结
- `aoe_damage`: 全场伤害
- `draw_card`: 抽牌
- `armor`: 护甲
- `heal`: 治疗
- `freeze_all`: 冻结所有
- `transform`: 变形
- `secret`: 奥秘
- `random_damage`: 随机伤害

### 随从关键词
- `charge`: 冲锋
- `taunt`: 嘲讽
- `freeze`: 冻结攻击

## 8. 后续扩展

- [ ] 战吼机制
- [ ] 亡语机制
- [ ] 武器系统
- [ ] 更多职业
- [ ] 卡牌池扩展

---

## 9. 技术栈

- **游戏核心**: Node.js
- **API服务器**: Express.js (内置)
- **RL集成**: Python requests 库示例

## 10. 使用示例 (Python)

```python
import requests

BASE_URL = "http://localhost:3000"

# 开始新游戏
resp = requests.post(f"{BASE_URL}/reset", json={
    "player_class": "mage",
    "opponent_class": "warrior"
})
state = resp.json()

# 执行动作
resp = requests.post(f"{BASE_URL}/step", json={
    "action": {"type": "play_card", "card_index": 0}
})
next_state, reward, done, info = resp.json()
```
