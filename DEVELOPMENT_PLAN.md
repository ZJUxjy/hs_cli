# JS Fireplace 开发计划

基于与 Python Fireplace 的对比分析，制定以下分阶段开发计划。

## 阶段概览

| 阶段 | 目标 | 预计工作量 | 优先级 |
|------|------|-----------|--------|
| 阶段1 | 核心机制（Buff/Debuff + DSL基础）| 2-3周 | P0 |
| 阶段2 | 游戏完整性（Targeting + 事件重构）| 2周 | P1 |
| 阶段3 | 高级机制（奥秘/发现/任务）| 2-3周 | P2 |
| 阶段4 | 性能优化与测试覆盖 | 1周 | P3 |

---

## 阶段1：核心机制（P0）

### 1.1 Buff/Enchantment 系统

**目标**：实现属性修饰和光环效果

**任务清单**：
- [ ] 创建 `Buff` 类（支持ATK/HEALTH/taunt/divineShield等）
- [ ] 实现 `_getattr` 属性继承链
- [ ] Buff槽位管理（`slots`）
- [ ] Buff生命周期（apply → tick → remove）
- [ ] 实现 `Refresh` 类（光环刷新）
- [ ] 光环范围选择器（FRIENDLY_MINIONS等）

**验收标准**：
```typescript
// 可以为随从添加临时buff
minion.buff(source, { ATK: 2, HEALTH: 2 });  // +2/+2
minion.buff(source, { taunt: true });        // 获得嘲讽
// 光环自动刷新
aura.refresh();  // 保持buff活跃
```

**依赖**：无

---

### 1.2 DSL 基础 - Selector 选择器

**目标**：实现声明式目标选择

**任务清单**：
- [ ] 基础选择器：`SELF`, `TARGET`, `OWNER`
- [ ] 玩家选择器：`FRIENDLY`, `ENEMY`, `CONTROLLER`, `OPPONENT`
- [ ] 区域选择器：`FIELD`, `HAND`, `DECK`, `GRAVEYARD`
- [ ] 类型选择器：`MINIONS`, `HEROES`, `CHARACTERS`, `WEAPONS`
- [ ] 条件筛选器：`DAMAGED`, `FROZEN`, `HAS_DIVINE_SHIELD`
- [ ] 组合器：`&` (交集), `|` (并集), `-` (差集)
- [ ] 数量限制：`RANDOM`, `ALL`

**验收标准**：
```typescript
const targets = FRIENDLY_MINIONS.eval(game, source);
const randomEnemy = RANDOM(ENEMY_MINIONS).eval(game, source);
const damaged = ALL_CHARACTERS.filter(c => c.damage > 0);
```

**依赖**：无

---

### 1.3 扩展 Action 系统

**目标**：实现核心游戏动作

**任务清单**：
- [ ] `Hit` - 造成伤害（考虑spellpower）
- [ ] `Discard` - 弃牌
- [ ] `Battlecry` - 触发战吼
- [ ] `Deathrattle` - 触发亡语
- [ ] `SpendMana` / `GainMana` / `SetMana` - 法力操作
- [ ] `Overload` - 过载
- [ ] `Mill` - 撕牌（从牌库顶移除）
- [ ] `SetTags` / `UnsetTags` - 动态标签修改

**验收标准**：
```typescript
// 暗影箭：造成4点伤害
const ShadowBolt = new Hit(TARGET, 4);
// 灵魂之火：造成4点伤害，弃一张随机手牌
const Soulfire = [new Hit(TARGET, 4), new Discard(RANDOM(FRIENDLY_HAND))];
```

**依赖**：Selector系统

---

## 阶段2：游戏完整性（P1）

### 2.1 Targeting 系统

**目标**：目标合法性验证

**任务清单**：
- [ ] `Targeting` 类实现
- [ ] 前提条件验证（`TARGETING_PREREQUISITES`）
- [ ] `isValidTarget()` 函数
- [ ] 支持 PlayReq：
  - `REQ_TARGET_TO_PLAY`
  - `REQ_MINION_TARGET`
  - `REQ_ENEMY_TARGET`
  - `REQ_FRIENDLY_TARGET`
  - `REQ_TARGET_WITH_RACE`
  - `REQ_TARGET_WITH_DEATHRATTLE`
  - 等30+个条件

**验收标准**：
```typescript
const card = CardLoader.get('CS2_057'); // 暗影箭
card.isPlayable(); // 检查是否有合法目标
card.canTarget(enemyMinion); // 检查特定目标是否合法
```

**依赖**：Selector系统

---

### 2.2 事件系统重构

**目标**：支持声明式事件监听

**任务清单**：
- [ ] `EventListener` 类（ON / AFTER 两种时机）
- [ ] 事件类型枚举扩展（30+事件类型）
- [ ] 事件广播机制
- [ ] 一次性事件支持（`once: true`）

**事件类型清单**：
- TURN_BEGIN, TURN_END
- OWN_TURN_BEGIN, OWN_TURN_END
- MINION_SUMMON, AFTER_SUMMON
- ATTACK, AFTER_ATTACK
- DAMAGE, AFTER_DAMAGE
- HEAL, AFTER_HEAL
- DEATH, AFTER_DEATH
- SPELL_PLAY, AFTER_SPELL_PLAY
- SECRET_REVEALED

**验收标准**：
```typescript
// 法力浮龙：每当你施放一个法术，获得+1攻击力
class ManaWyrm {
  events = {
    [ON_SPELL_PLAY]: new Buff(SELF, { ATK: 1 })
  };
}
// 当回合结束时触发
events = {
  [OWN_TURN_END]: new Draw(CONTROLLER)
};
```

**依赖**：Action系统

---

### 2.3 卡牌脚本 DSL

**目标**：声明式卡牌效果定义

**任务清单**：
- [ ] `LazyValue` 延迟求值系统
- [ ] `LazyNum` 数值计算（COUNT, DAMAGE等）
- [ ] 条件语句：`IF(condition, then, else)`
- [ ] 循环语句：`FOR(selector, action)`

**验收标准**：
```typescript
// 火球术：造成6点伤害
const Fireball = { play: new Hit(TARGET, 6) };

// 奥术智慧：抽2张牌
const ArcaneIntellect = { play: new Draw(CONTROLLER, 2) };

// 烈焰风暴：对所有敌方随从造成5点伤害
const Flamestrike = { play: new Hit(ENEMY_MINIONS, 5) };

// 刺杀：消灭一个敌方随从
const Assassinate = { play: new Destroy(TARGET) };
```

**依赖**：Selector, Action, 事件系统

---

## 阶段3：高级机制（P2）

### 3.1 奥秘系统

**目标**：完整奥秘触发机制

**任务清单**：
- [ ] `Secret` 类继承自 `Spell`
- [ ] 奥秘区域管理（最多5个）
- [ ] 奥秘揭示逻辑
- [ ] 常见奥秘类型：
  - 攻击类（冰冻陷阱、爆炸陷阱）
  - 施法类（法术反制、寒冰屏障）
  - 召唤类（镜像实体、忏悔）
  - 伤害类（以眼还眼）

**验收标准**：
```typescript
// 冰冻陷阱：当敌方随从攻击时，将其移回手牌并增加2费
class FreezingTrap {
  events = {
    [ON_ATTACK]: IF(FRIENDLY_TARGET, [
      new Bounce(ATTACKER),
      new Buff(ATTACKER, { cost: 2 })
    ])
  };
}
```

**依赖**：事件系统重构

---

### 3.2 发现机制

**目标**：Discover 三选一

**任务清单**：
- [ ] `Discover` Action
- [ ] 随机卡牌池生成
- [ ] 选择UI/AI接口
- [ ] 发现类型：
  - 随机发现
  - 按职业发现
  - 按类型发现（随从/法术）
  - 按费用发现

**验收标准**：
```typescript
// 发现一张法术牌
new Discover(RANDOM(SPELLS + SAME_CLASS));
```

**依赖**：随机选择器

---

### 3.3 任务系统

**目标**：Quest 和 SideQuest

**任务清单**：
- [ ] `Quest` / `SideQuest` 类
- [ ] 进度追踪（`progress`, `progress_total`）
- [ ] 任务奖励触发
- [ ] 常见任务类型：
  - 使用X张某类型牌
  - 召唤X个随从
  - 造成X点伤害
  - 恢复X点生命

**验收标准**：
```typescript
// 任务：使用7张在你回合召唤的随从
class TheMarshQueen {
  quest = true;
  progress_total = 7;
  events = {
    [AFTER_SUMMON]: IF(FRIENDLY + DURING_TURN, AddProgress(SELF))
  };
  reward = 'UNG_028t'; // 任务奖励卡牌ID
}
```

**依赖**：事件系统

---

### 3.4 进化机制

**目标**：Adapt 10选1

**任务清单**：
- [ ] `Adapt` Action
- [ ] 进化选项池（10个标准选项）
- [ ] 选择处理
- [ ] 进化效果应用

**进化选项**：
- +3攻击力
- +3生命值
- 嘲讽
- 圣盾
- 风怒
- 剧毒
- 吸血
- +1/+1和潜行
- 死亡回响

---

### 3.5 特殊关键词

**目标**：实现复杂机制关键词

**任务清单**：
- [ ] `Recruit` - 从牌库召唤
- [ ] `Tradeable` - 可交易
- [ ] `Infuse` - 注能（X）
- [ ] `Manathirst` - 渴望法力
- [ ] `Combo` - 连击（已有标记，需完善逻辑）
- [ ] `Outcast` - 流放
- [ ] `Corrupt` - 腐蚀

---

## 阶段4：性能与测试（P3）

### 4.1 性能优化

- [ ] 卡牌脚本懒加载
- [ ] Selector结果缓存
- [ ] 事件监听器批量处理
- [ ] 内存泄漏检查（Buff清理）

### 4.2 测试覆盖

- [ ] 单元测试：所有Action
- [ ] 单元测试：所有Selector
- [ ] 集成测试：完整回合
- [ ] 回归测试：经典卡牌组合
- [ ] 性能测试：1000回合模拟

### 4.3 文档

- [ ] API文档生成
- [ ] 卡牌脚本编写指南
- [ ] 贡献者指南

---

## 优先级矩阵

| 功能 | 复杂度 | 影响 | 优先级 |
|------|--------|------|--------|
| Buff系统 | 中 | 高 | P0 |
| Selector | 高 | 高 | P0 |
| Hit/Discard | 低 | 高 | P0 |
| Targeting | 中 | 中 | P1 |
| 事件重构 | 高 | 高 | P1 |
| 奥秘 | 中 | 中 | P2 |
| 发现 | 中 | 低 | P2 |
| 任务 | 高 | 低 | P2 |
| 进化 | 低 | 低 | P2 |

---

## 里程碑

### Milestone 1 (阶段1完成)
- 可以用DSL定义基础卡牌
- 支持Buff/Debuff
- 50+基础Action

### Milestone 2 (阶段2完成)
- 目标选择验证工作
- 事件驱动机制完善
- 支持90%的基础卡牌

### Milestone 3 (阶段3完成)
- 支持所有扩展包机制
- 可以运行完整对战

### Milestone 4 (发布)
- 测试覆盖率>80%
- 性能满足要求
- 文档完整

---

## 开发建议

1. **先实现基础，再优化**：先让功能work，再追求性能
2. **参考fireplace但不要照搬**：理解设计思路，用TypeScript idioms
3. **持续测试**：每实现一个功能就写测试
4. **保持向后兼容**：已有卡牌脚本尽量不改

## 下一步行动

建议选择以下任一方向开始：
1. **Buff系统** - 最基础且影响广泛
2. **Selector系统** - 是DSL的基础
3. **Hit/Discard等Action** - 快速增加可用卡牌数
