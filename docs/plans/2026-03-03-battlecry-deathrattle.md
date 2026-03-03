# 炉石传说战吼亡语及新职业扩展设计

**创建日期**: 2026-03-03

---

## 1. 概述

本文档描述了炉石传说 CLI 游戏的战吼、亡语机制扩展以及新职业添加的设计方案。

## 2. 战吼 (Battlecry) 机制

### 2.1 数据结构

```json
{
  "id": "card_id",
  "type": "minion",
  "effect": {
    "type": "summon",
    "attack": 3,
    "health": 4,
    "battlecry": { "type": "damage", "value": 1 },
    "deathrattle": { "type": "summon", "card_id": "other_minion" }
  }
}
```

### 2.2 触发时机

- **战吼**: `summonMinion()` 方法末尾触发
- **亡语**: `removeDeadMinions()` 方法中检测死亡随从并触发

### 2.3 战吼效果类型

| 效果 | 说明 | 实现 |
|------|------|------|
| damage | 对目标造成伤害 | executeDamage |
| heal | 治疗己方英雄 | executeHeal |
| draw_card | 抽牌 | executeDrawCard |
| armor | 获得护甲 | executeArmor |
| summon | 召唤额外随从 | executeSummon |
| buff | 给己方随从+属性 | executeBuff |
| silence | 沉默敌方随从 | executeSilence |
| transform | 变形目标 | executeTransform |

### 2.4 亡语效果类型

| 效果 | 说明 | 实现 |
|------|------|------|
| summon | 召唤随从 | executeSummon |
| damage | 对敌方造成伤害 | executeDamage |
| draw_card | 抽牌 | executeDrawCard |
| buff | 给己方随从buff | executeBuff |

## 3. 新职业设计

### 3.1 职业列表

| 职业ID | 名称 | 英雄技能 | 特色机制 |
|--------|------|---------|---------|
| hunter | 猎人 | 稳固射击 (2费: 造成1点伤害) | 奥秘、冲锋、钉刺 |
| paladin | 圣骑士 | 保护之手 (2费: 获得2点护甲) | 圣盾、buff、报告兵 |
| shaman | 萨满 | 图腾召唤 (2费: 随机召唤一个图腾) | 图腾、过载、进化 |
| priest | 牧师 | 暗影形态 (2费: 英雄技能变为1费3点伤害) | 治疗、偷牌、灭 |
| rogue | 盗贼 | 疾跑 (2费: 抽2张牌) | 连击、潜行、匕首 |
| druid | 德鲁伊 | 月火术 (2费: 造成1点伤害) | 抉择、嘲讽、自然之力 |

### 3.2 卡牌数量

- 每个职业 **12 张** 卡牌
- 包含随从、法术、武器

### 3.3 卡牌数据结构

```json
{
  "id": "unique_id",
  "name": "卡牌名称",
  "type": "minion|spell|weapon",
  "cost": 费用,
  "rarity": "common|rare|epic|legendary",
  "description": "描述",
  "effect": {
    "type": "效果类型",
    // 随从属性
    "attack": 攻击力,
    "health": 生命值,
    "taunt": true|false,
    "charge": true|false,
    "battlecry": { ... },
    "deathrattle": { ... }
  },
  "classes": ["职业"]
}
```

## 4. 配置扩展

### 4.1 职业配置 (data/config.json)

添加 6 个新职业的职业配置：
- startingHealth: 30 (猎人、圣骑士、萨满、盗贼、德鲁伊)
- 30 (牧师)

### 4.2 卡牌数据 (data/cards/)

新建 6 个 JSON 文件：
- hunter.json - 猎人卡牌
- paladin.json - 圣骑士卡牌
- shaman.json - 萨满卡牌
- priest.json - 牧师卡牌
- rogue.json - 盗贼卡牌
- druid.json - 德鲁伊卡牌

## 5. 技术实现

### 5.1 CardEffect.js 扩展

添加新方法：
- `executeBattlecry(minion, context)` - 执行战吼
- `executeDeathrattle(minion, context)` - 执行亡语
- `executeBuff(effect, context)` - 执行buff
- `executeSilence(effect, context)` - 执行沉默

### 5.2 GameEngine.js 修改

- `summonMinion()` - 召唤后触发战吼
- `removeDeadMinions()` - 死亡时触发亡语

### 5.3 AIEngine.js 扩展

-英雄 更新技能逻辑
- 新增职业特定策略

---

## 6. 优先级

1. 战吼机制实现
2. 亡语机制实现
3. 6 个新职业配置
4. 72 张新卡牌 (6职业 × 12张)
5. AI 逻辑适配
