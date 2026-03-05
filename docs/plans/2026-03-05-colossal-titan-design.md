# 巨型(Colossal)和泰坦(Titan)机制设计文档

## 设计概述

实现炉石传说中的两个新机制：
- **巨型(Colossal)**：随从自带特殊衍生物"附属物"，随本体一起召唤
- **泰坦(Titan)**：拥有3个特殊技能，技能用完后才能攻击

---

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                      数据层                              │
├─────────────────────────────────────────────────────────┤
│  卡牌数据 (JSON)                                          │
│  - colossal: { appendages: [...] }                       │
│  - titan: { abilities: [{name, effect}, ...] }          │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                    游戏逻辑层                            │
├─────────────────────────────────────────────────────────┤
│  GameEngine.js                                           │
│  ├─ summonMinion() ← 检测colossal，召唤附属物            │
│  └─ useTitanAbility() ← 处理泰坦技能选择                 │
│                                                          │
│  CardEffect.js                                           │
│  ├─ TYPES.COLOSSAL, TYPES.TITAN                         │
│  └─ executeTitanAbility()                               │
│                                                          │
│  TurnManager.js                                          │
│  └─ 检测titanAbilitiesUsed，限制普通攻击                 │
└─────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────┐
│                      UI层                               │
├─────────────────────────────────────────────────────────┤
│  game.js                                                 │
│  ├─ renderMinion() ← 显示colossal/appendage标记          │
│  ├─ showTitanAbilityDialog() ← 泰坦技能弹窗              │
│  └─ bindTitanClick() ← 绑定泰坦点击事件                  │
│                                                          │
│  index.html                                              │
│  └─ titan-ability-dialog ← 新弹窗组件                   │
└─────────────────────────────────────────────────────────┘
```

---

## 数据结构设计

### 巨型(Colossal)卡牌示例

```json
{
  "id": "neutral_colossal_crab",
  "name": "可拉克",
  "type": "minion",
  "cost": 7,
  "rarity": "legendary",
  "description": "7/6，巨型+1。可拉克的附属物获得嘲讽",
  "effect": {
    "type": "summon",
    "attack": 7,
    "health": 6,
    "colossal": 1,
    "appendages": [
      { "name": "可拉克的壳", "attack": 5, "health": 8, "taunt": true }
    ]
  },
  "classes": ["neutral"]
}
```

### 泰坦(Titan)卡牌示例

```json
{
  "id": "neutral_titan_eonar",
  "name": "生命的缚誓者艾欧娜尔",
  "type": "minion",
  "cost": 8,
  "rarity": "legendary",
  "description": "8/8，泰坦。拥有3个技能",
  "effect": {
    "type": "summon",
    "attack": 8,
    "health": 8,
    "titan": true,
    "titanAbilities": [
      { "id": "heal_all", "name": "生命绽放", "text": "为所有友方角色恢复3点生命", "effect": { "type": "heal", "value": 3, "target": "all_friendly" } },
      { "id": "summon_seed", "name": "播种生命", "text": "召唤一个2/2的植物", "effect": { "type": "summon", "attack": 2, "health": 2 } },
      { "id": "buff_field", "name": "自然之力", "text": "使你的所有随从获得+2/+2", "effect": { "type": "buff", "attack": 2, "health": 2, "target": "all_friendly_minions" } }
    ]
  },
  "classes": ["neutral"]
}
```

---

## 核心逻辑设计

### 巨型机制流程

1. **召唤时检测**：在 `summonMinion()` 中检测 `colossal` 属性
2. **位置计算**：计算可用战场位置（最多7个），确定能召唤多少附属物
3. **召唤附属物**：将附属物召唤到战场，标记 `isAppendage: true` 和 `parentMinionUid`
4. **独立结算**：附属物作为独立随从，可被攻击、死亡，不影响主体

### 泰坦机制流程

1. **召唤初始化**：检测 `titan` 属性，初始化 `titanAbilitiesUsed: []`
2. **禁用普通攻击**：泰坦随从 `canAttack: false` 直到3个技能都用尽
3. **技能选择**：点击泰坦弹出技能选择对话框
4. **执行效果**：选择后执行技能效果，标记为已使用
5. **解锁攻击**：3个技能都用完后，`canAttack: true`

---

## UI设计

### 泰坦技能弹窗

- **标题**：显示泰坦名称
- **技能列表**：3个技能按钮
  - 技能名称
  - 技能描述
  - 已使用的技能显示为禁用状态
- **关闭按钮**：可选

### 随从显示更新

- **巨型随从**：显示 "巨型+X" 标记
- **附属物**：显示 "附属物" 标签，关联主体
- **泰坦随从**：显示 "泰坦" 标记，显示剩余可用技能数

---

## 依赖关系

- **复用现有组件**：
  - `adapt-dialog` 弹窗结构
  - `summonMinion()` 召唤逻辑
  - `execute()` 效果执行系统

- **新增内容**：
  - `TitanAbilityManager` 类（可选）
  - `titan-ability-dialog` UI组件

---

## 测试验证点

1. 巨型随从召唤时是否正确召唤附属物
2. 战场满7个时，巨型随从如何处理
3. 附属物死亡是否影响主体
4. 泰坦技能弹窗是否正常显示
5. 泰坦技能是否每回合只能用一次
6. 泰坦技能用完后是否能正常攻击
