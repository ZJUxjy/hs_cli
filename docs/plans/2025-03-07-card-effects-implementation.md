# 卡牌效果实现计划

> **For Claude:** REQUIRED SUB-SILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**目标:** 为28个扩展包共3800+张卡牌实现具体效果

**策略:**
1. 按优先级分组扩展包（热门竞技卡组优先）
2. 每个扩展包一个任务，每个任务TDD循环：写测试→验证失败→实现→验证通过→提交
3. 优先实现热门核心卡牌

**技术栈:** TypeScript, Jest, Fireplace DSL

---

## 扩展包优先级

| 优先级 | 扩展包 | 卡牌数 |
|--------|--------|--------|
| P0 - 核心 | classic | 415 |
| P1 - 热门 | ungoro, icecrown, witchwood | 512 |
| P2 - 竞技 | boomsday, kobolds, dalaran, dragons | 726 |
| P3 - 其他 | outlands, uldum, gangs, troll, wog | 767 |
| P4 - 剩余 | tgt, gvg, naxxramas, brawl, 其他 | 565 |

---

## 任务列表

### Phase 1: 核心扩展包 (P0)

#### Task 1: classic 扩展包效果完善
- 状态: 已部分完成 (415 cards)
- 目标: 完善剩余未实现的卡牌效果
- 文件: `src/cards/mechanics/classic/*.ts`

### Phase 2: 热门扩展包 (P1)

#### Task 2: ungoro 扩展包效果实现
- 卡牌数: 183
- 关键卡: 任务卡(UNG_xxx), 进化(Adapt), 恐龙
- 文件: `src/cards/mechanics/ungoro/*.ts`

#### Task 3: icecrown 扩展包效果实现
- 卡牌数: 170
- 关键卡: DK英雄卡, 亡语, 冰封
- 文件: `src/cards/mechanics/icecrown/*.ts`

#### Task 4: witchwood 扩展包效果实现
- 卡牌数: 159
- 关键卡: 吸血, 潜行, 回合结束触发
- 文件: `src/cards/mechanics/witchwood/*.ts`

### Phase 3: 竞技扩展包 (P2)

#### Task 5: boomsday 扩展包效果实现
- 卡牌数: 170
- 关键卡: 磁力, 充能, 实验
- 文件: `src/cards/mechanics/boomsday/*.ts`

#### Task 6: kobolds 扩展包效果实现
- 卡牌数: 220
- 关键卡: 奥秘, 召唤, 法术石
- 文件: `src/cards/mechanics/kobolds/*.ts`

#### Task 7: dalaran 扩展包效果实现
- 卡牌数: 152
- 关键卡: 阴谋, 跟班, 法师DK
- 文件: `src/cards/mechanics/dalaran/*.ts`

#### Task 8: dragons 扩展包效果实现
- 卡牌数: 218
- 关键卡: 巨龙, 祈求, 腐蚀
- 文件: `src/cards/mechanics/dragons/*.ts`

### Phase 4: 其他扩展包 (P3)

#### Task 9: outlands 扩展包效果实现
- 卡牌数: 166
- 关键卡: 恶魔猎手, 双重职业
- 文件: `src/cards/mechanics/outlands/*.ts`

#### Task 10: uldum 扩展包效果实现
- 卡牌数: 161
- 关键卡: 任务, 复生, 法术迸发
- 文件: `src/cards/mechanics/uldum/*.ts`

#### Task 11: gangs 扩展包效果实现
- 卡牌数: 154
- 关键卡: 帮派, 玉龙帮, 海盗
- 文件: `src/cards/mechanics/gangs/*.ts`

#### Task 12: troll 扩展包效果实现
- 卡牌数: 152
- 关键卡: 嗜血, 图腾
- 文件: `src/cards/mechanics/troll/*.ts`

#### Task 13: wog 扩展包效果实现
- 卡牌数: 150
- 关键卡: 古神, 疯狂, 污手党
- 文件: `src/cards/mechanics/wog.ts`

### Phase 5: 剩余扩展包 (P4)

#### Task 14: tgt 扩展包效果实现
- 卡牌数: 138
- 关键卡: 激励, 战斗扳机
- 文件: `src/cards/mechanics/tgt.ts`

#### Task 15: gvg 扩展包效果实现
- 卡牌数: 130
- 关键卡: 机械, 零件, 动画
- 文件: `src/cards/mechanics/gvg.ts`

#### Task 16: naxxramas 扩展包效果实现
- 卡牌数: 99
- 关键卡: 亡语, 奥秘
- 文件: `src/cards/mechanics/naxxramas.ts`

#### Task 17: brawl 扩展包效果实现
- 卡牌数: 99
- 关键卡: 冒险模式
- 文件: `src/cards/mechanics/brawl/*.ts`

#### Task 18: 其他扩展包
- karazhan, blackrock, debug, tutorial, skins, custom, scholomance, initiate, the_shrounded_city
- 总计: ~250 cards

---

## 每个任务的执行步骤 (TDD)

以 ungoro 扩展包为例:

### Step 1: 写测试
创建测试文件: `tests/cards/ungoro/effects.test.ts`

```typescript
import '../../../src/index';
import { cardScriptsRegistry } from '../../../src/cards/mechanics';

describe('UNG_912 Jeweled Macaw', () => {
  test('play effect should give a random beast to hand', () => {
    const script = cardScriptsRegistry.get('UNG_912');
    expect(script).toBeDefined();
    expect(script?.play).toBeDefined();
    // TODO: test actual behavior
  });
});
```

### Step 2: 验证测试失败
```bash
npm test -- tests/cards/ungoro/effects.test.ts
```
预期: FAIL (因为play效果还是TODO)

### Step 3: 实现效果
修改 `src/cards/mechanics/ungoro/hunter.ts`:

```typescript
// UNG_912 - Jeweled Macaw
cardScriptsRegistry.register('UNG_912', {
  play: (ctx: ActionContext) => {
    const controller = ctx.source.controller;
    // Give(CONTROLLER, RandomBeast())
    const beastCard = getRandomBeastCard();
    controller.draw(beastCard);
  },
});
```

### Step 4: 验证测试通过
```bash
npm test -- tests/cards/ungoro/effects.test.ts
```
预期: PASS

### Step 5: 提交
```bash
git add src/cards/mechanics/ungoro/hunter.ts tests/cards/ungoro/effects.test.ts
git commit -m "feat(ungoro): implement UNG_912 Jeweled Macaw effect"
```

---

## 实现辅助工具

### 效果模式参考

参考已实现的classic扩展包:
- `src/cards/mechanics/classic/hunter.ts` - 野兽, 亡语
- `src/cards/mechanics/classic/mage.ts` - 法术,奥秘
- `src/cards/mechanics/classic/druid.ts` - 抉择,增益

### Python DSL翻译对照表

| Python | TypeScript |
|--------|------------|
| `Give(CONTROLLER, X)` | `controller.draw(X)` |
| `Hit(TARGET, N)` | `target.takeDamage(N)` |
| `Buff(TARGET, "ID")` | `new Buff(source, target, {...}).trigger()` |
| `Summon(CONTROLLER, "ID")` | `new Summon(source, "ID").trigger()` |
| `Deathrattle(TARGET)` | `deathrattle: (ctx) => {...}` |
| `events = Play(...).after(...)` | `events: { PLAY: (ctx) => {...} }` |

---

## 预期产出

完成后将实现:
- 28个扩展包的卡牌效果
- ~3800+张可玩卡牌
- 完整的测试覆盖

## 执行建议

1. 每个任务专注一个扩展包
2. 先实现核心卡牌（橙卡、紫卡）
3. 运行完整测试确保不破坏现有功能
4. 每次提交保持小而完整
