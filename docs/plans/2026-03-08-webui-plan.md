# JS Fireplace Web UI 建设计划

## 目标

为 `js-fireplace` 增加一个可持续迭代的 Web UI，使项目从“可在 Node/CLI 中运行的规则引擎”升级为“具备可视化对战体验的浏览器应用”。

这份计划的重点不是一次性做完完整炉石客户端，而是定义一条风险可控、能逐步落地、能够持续验证的前端建设路径。

---

## 一、现状判断

当前仓库已经具备以下能力：

- 完整的 TypeScript 规则引擎骨架
- 卡牌定义 XML 加载和 i18n
- `Game / Player / Card / Action / TargetValidator` 等核心对象
- CLI 运行入口 `src/play.ts`
- 大量卡牌脚本和覆盖较广的 Jest 测试

当前仓库还缺少以下与 Web UI 直接相关的能力：

- 浏览器运行入口
- 稳定的前后端边界或“UI 适配层”
- 可供前端渲染的标准化只读状态快照
- 用户交互命令模型（点击牌、选目标、结束回合、攻击）
- 动画调度、回放、日志面板
- Playwright 驱动下的浏览器回归测试入口

结论：

这个仓库非常适合先做“规则引擎驱动的可视化桌面/浏览器对局界面”，而不是直接照搬完整 Hearthstone 客户端。

---

## 二、Web UI 的总体设计原则

### 1. 先做“可玩”，再做“像炉石”

第一阶段目标应该是：

- 能看到双方英雄、手牌、随从、法力和回合
- 能合法出牌
- 能合法选目标
- 能结束回合
- 能看到伤害、死亡、抽牌、召唤结果

不要一开始就追求：

- 完整动画
- 高保真卡面表现
- 拖拽手感完全还原
- Secret/VFX/Discover 等复杂交互全部一次到位

### 2. 规则引擎不直接依赖前端框架

应坚持当前项目方向：

- 引擎层保持纯 TypeScript 逻辑
- Web UI 通过适配层消费引擎状态
- 浏览器只负责渲染、输入和动画

避免把 DOM、Canvas、React 状态逻辑直接混进 `src/core` 或 `src/actions`。

### 3. UI 必须建立标准状态快照

当前引擎对象较多依赖类实例和动态字段，前端直接消费运行时对象会非常脆弱。

必须新增一层“序列化状态”：

- 从 `Game` 导出 UI snapshot
- 前端只渲染 snapshot
- 所有用户输入通过 command API 回到引擎

这是整套 Web UI 成败的关键。

---

## 三、推荐技术方案

### 推荐方案

- 构建工具：Vite
- UI 框架：React + TypeScript
- 样式：CSS Modules 或单独 `ui.css`
- 状态管理：先用 React state + reducer，不要过早引入重型状态库
- 渲染方式：DOM 为主，局部动画可用 CSS transition
- 调试与测试：Playwright + `render_game_to_text`/snapshot 输出

### 为什么不建议一开始用 Canvas-only

虽然 `develop-web-game` 技能更偏 canvas/game loop，但这个项目本质是卡牌对战 UI，不是实时动作游戏。

因此第一版 Web UI 更适合：

- 信息呈现用 DOM
- 状态驱动渲染
- 将来如果需要战斗动画，再局部引入 canvas 或 overlay

Canvas-only 版本会让：

- 目标选择
- 卡牌 hover
- 日志面板
- 调试输出
- 响应式布局

都变得更难维护。

结论：

第一版以 DOM 驱动的“卡牌桌面界面”为主，保留技能要求里的测试接口思想，而不是机械照搬 canvas-only。

---

## 四、建议目录结构

建议在仓库内新增如下结构：

```text
src/
  ui/
    app/
      App.tsx
      main.tsx
      ui.css
    components/
      Board.tsx
      HeroPanel.tsx
      HandView.tsx
      CardView.tsx
      Battlefield.tsx
      TargetOverlay.tsx
      ActionLog.tsx
      TurnControls.tsx
    engine-bridge/
      createGameController.ts
      serializeGameState.ts
      commands.ts
      animations.ts
    types/
      ui-state.ts
      ui-commands.ts
index.html
vite.config.ts
```

职责划分：

- `engine-bridge`: 连接引擎和 UI 的适配层
- `components`: 纯展示组件
- `types`: UI 专属类型
- `app`: 浏览器入口和整体布局

---

## 五、状态与命令模型

这是第一阶段必须先定义清楚的部分。

### 1. UI 状态快照

新增 `serializeGameState(game)`，输出类似：

```ts
interface UIPlayerState {
  id: string;
  name: string;
  health: number;
  armor: number;
  mana: number;
  maxMana: number;
  deckCount: number;
  handCount: number;
  hand: UICardState[];
  field: UIMinionState[];
  hero?: UIHeroState;
}

interface UIGameState {
  mode: 'playing' | 'game_over';
  turn: number;
  currentPlayerId: string;
  localPlayer: UIPlayerState;
  opponent: UIPlayerState;
  pendingTarget?: {
    sourceCardId: string;
    validTargetIds: string[];
  };
  log: UIActionLogEntry[];
}
```

注意事项：

- UI snapshot 只暴露前端真正需要的字段
- 不把整个运行时对象树直接暴露给 React
- 所有实体都应有稳定的 UI ID

### 2. UI 命令模型

前端不直接改对象，而是提交命令：

```ts
type UICommand =
  | { type: 'PLAY_CARD'; handIndex: number; targetId?: string }
  | { type: 'ATTACK'; attackerId: string; defenderId: string }
  | { type: 'END_TURN' }
  | { type: 'CONCEDE' };
```

然后 `createGameController()` 负责：

- 接收命令
- 调用现有引擎方法
- 返回新的 UI snapshot

---

## 六、第一阶段 UI 范围

### 必做功能

1. 初始对局页面

- 显示双方英雄
- 显示当前回合
- 显示 mana
- 显示双方场面
- 显示本方手牌

2. 基础出牌

- 点击手牌触发出牌
- 无目标牌可直接打出
- 有目标牌进入选目标模式
- 只允许点击合法目标

3. 回合控制

- End Turn 按钮
- 当前玩家提示
- 回合变化后 UI 自动刷新

4. 状态可视化

- 伤害后的生命变化
- 随从死亡后离场
- 抽牌后手牌变化
- 召唤后场面变化

5. 调试面板

- 当前状态 JSON 简化视图
- 最近动作日志
- console 错误可快速定位

### 第一阶段暂不做

- 卡牌拖拽操作
- 英雄技能完整交互
- Secret 展示细节
- Discover UI
- 高级动画时间轴
- 网络对战
- 完整收藏/组牌界面

---

## 七、第二阶段 UI 范围

第二阶段在第一阶段“可玩”的基础上增强体验。

### 目标

- 统一主动法术执行链
- 加入攻击交互和攻击箭头
- 增加动画层和动作日志回放
- 支持 hero power
- 支持更复杂目标提示

### 需要的引擎改造

1. 明确 `Play` action 与脚本执行的统一入口

当前仓库已经具备：

- `TargetValidator`
- `Play`
- `cardScriptsRegistry`
- `executePlay`

但还需要形成稳定链路：

`isPlayable -> getValidTargets -> Play -> executePlay -> cleanup`

2. 增加可消费的 action/event log

UI 动画和提示需要知道：

- 谁对谁造成了伤害
- 哪张牌被打出
- 哪个单位死亡
- 哪个随从被召唤

建议新增结构化日志，而不是只依赖 `console.log`。

3. 给运行时对象增加稳定引用

前端做定向动画时需要稳定标识，不能只靠数组下标。

---

## 八、第三阶段 UI 范围

第三阶段再追求更完整和更像游戏客户端。

### 可选能力

- 卡牌 hover 放大
- 拖拽出牌
- 动画队列
- Secret/Quest/Weapon 专区
- Discover 三选一面板
- 手牌上限/疲劳/冻结等状态的直观表现
- 双人本地调试模式
- 重放系统

这部分不应阻塞第一版上线。

---

## 九、页面与组件设计

### 页面结构

建议单页应用即可：

1. Start Screen

- 开始游戏
- 选择测试套牌
- 可显示控制说明

2. Match Screen

- 对手区域
- 棋盘中央区域
- 本方区域
- 底部手牌区
- 右侧日志/调试面板

3. Game Over Overlay

- 胜负结果
- 重新开始

### 组件拆分建议

#### `App`

职责：

- 初始化 game controller
- 持有顶层 UI state
- 分发命令

#### `Board`

职责：

- 组织整个对局布局
- 连接英雄区、棋盘区、手牌区、控制区

#### `HandView`

职责：

- 渲染本方手牌
- 处理点击出牌
- 对不可打的牌进行灰化

#### `Battlefield`

职责：

- 渲染双方随从
- 显示攻击力/生命/状态
- 支持选中合法攻击目标

#### `TargetOverlay`

职责：

- 高亮合法目标
- 阻止非法点击
- 提供取消选目标能力

#### `ActionLog`

职责：

- 显示最近动作
- 为调试卡脚本和规则执行提供可见反馈

---

## 十、视觉方向建议

虽然这是工程项目，但第一版 UI 仍应有清晰风格，不建议做成纯表格或纯管理后台。

建议方向：

- 桌面木纹 / 暖色战场背景
- 卡牌区域用明确层次和投影
- 对手区偏冷色，本方区偏暖色
- 手牌 hover 放大
- 可打出的牌在边框、亮度、浮起高度上明显区别

避免：

- 默认后台风格
- 纯白页面 + 普通按钮
- 一切都堆成列表

---

## 十一、与现有代码的接入点

### 1. 推荐复用的现有能力

- `CardLoader.loadFromXml()`
- `Game`
- `Player`
- `Card.isPlayable()`
- `Card.getValidTargets()`
- `TargetValidator`
- `cardScriptsRegistry`
- `executePlay`

### 2. 建议不要直接依赖的内部细节

- 组件直接操作 `player.hand`、`player.field` 等可变数组
- 组件直接依赖 `console.log`
- React 组件直接拿运行时类实例作为状态源

### 3. 需要新增的桥接层

建议新增 `createGameController()`，统一暴露：

- `getState()`
- `dispatch(command)`
- `subscribe(listener)`
- `reset()`

这样前端就不需要知道 `Game` 内部太多细节。

---

## 十二、测试与验证计划

虽然第一版 UI 不是实时动作游戏，但仍建议使用 `develop-web-game` 技能里的验证思想。

### 必须保留的测试能力

1. 浏览器自动化回归

- 启动 Web UI
- 自动点击开始
- 自动打出一张无目标牌
- 自动打出一张有目标牌
- 自动结束回合

2. 可读文本状态输出

建议暴露：

```ts
window.render_game_to_text = () => JSON.stringify({
  mode,
  turn,
  currentPlayer,
  localPlayer: {
    mana,
    hand: hand.map(c => ({ id: c.id, cost: c.cost, playable: c.playable })),
    field: field.map(m => ({ id: m.id, attack: m.attack, health: m.health })),
  },
  opponent: {
    handCount,
    field: field.map(m => ({ id: m.id, attack: m.attack, health: m.health })),
  },
  pendingTarget,
});
```

这不是为了最终产品，而是为了让 Playwright 和调试工具能稳定读取状态。

3. 时间推进钩子

虽然是卡牌界面，仍建议提供：

```ts
window.advanceTime = (ms) => {
  animationController.advance(ms);
  rerender();
};
```

如果后续加入动画，这个接口会很有价值。

### 第一批 Playwright 场景

1. 打开页面，加载对局成功
2. 打出一张无目标牌，场面更新
3. 打出一张有目标法术，目标高亮，结算后目标生命变化
4. 点击 End Turn，当前玩家切换
5. 游戏结束时显示结果面板

---

## 十三、开发阶段划分

## Phase 0: 结构预备

目标：

- 引入 Vite + React 浏览器入口
- 保证现有 Node 构建和测试不被破坏
- 建立最小 UI 骨架

交付：

- `index.html`
- `src/ui/app/main.tsx`
- `src/ui/app/App.tsx`
- 基础样式

## Phase 1: 只读棋盘

目标：

- 把当前 `Game` 状态渲染成浏览器中的对局界面

交付：

- 双方英雄区
- 手牌区
- 场面区
- 回合与 mana 显示
- 调试状态面板

## Phase 2: 基础交互

目标：

- 实现点击出牌、目标选择、结束回合

交付：

- `dispatch(command)`
- 有目标/无目标出牌
- 非法目标屏蔽
- UI 状态自动刷新

## Phase 3: 动画和日志

目标：

- 让关键动作具备可读动画反馈

交付：

- 伤害闪烁
- 死亡离场
- 抽牌动画简化版
- 操作日志面板

## Phase 4: 复杂机制接入

目标：

- 逐步支持攻击、英雄技能、Secret、Discover 等更复杂交互

---

## 十四、主要风险

### 风险 1：引擎对象可变性太强，直接绑定 UI 易出错

应对：

- 强制经过 `serializeGameState`

### 风险 2：主动出牌链路尚未完全统一

应对：

- 在 Web UI 启动前，先补齐 `play card -> target validation -> executePlay`

### 风险 3：脚本层行为不完全一致

应对：

- Web UI 第一版只承诺支持“当前已有引擎能力下的稳定功能”
- 不把完整官方规则一致性作为前置条件

### 风险 4：测试只验证脚本注册，不等于真实交互正确

应对：

- 增加 UI 层到引擎层的整合测试

---

## 十五、建议的第一批实现顺序

最小可行路径建议如下：

1. 建立 Vite + React 入口
2. 增加 `serializeGameState(game)`
3. 增加 `createGameController()`
4. 实现只读棋盘页面
5. 打通 `END_TURN`
6. 打通无目标出牌
7. 打通有目标出牌
8. 暴露 `window.render_game_to_text`
9. 加入 Playwright 冒烟测试
10. 再做攻击和动画

这个顺序能保证：

- 每一步都能验证
- 不会一开始就陷入复杂视觉或交互细节
- 能尽快得到一个可演示、可调试、可继续迭代的 Web 版本

---

## 十六、建议产出标准

第一版 Web UI 达标标准：

- 本地可启动浏览器页面
- 能看到对局双方和棋盘
- 能打出至少一类无目标牌
- 能打出至少一类有目标牌
- End Turn 可用
- Playwright 冒烟测试通过
- `window.render_game_to_text` 可输出正确状态

达到这个标准后，再进入体验迭代，而不是反过来。

---

## 十七、结论

这个项目的 Web UI 不是“先画界面”，而是“为现有规则引擎补一层稳定的浏览器适配和交互外壳”。

最核心的建设顺序是：

`规则引擎 -> UI 适配层 -> 状态快照 -> 命令分发 -> 页面组件 -> 自动化验证`

只要坚持这个顺序，`js-fireplace` 的 Web UI 可以在不破坏引擎层设计的前提下稳步推进，并且每个阶段都能形成可运行、可验证、可继续扩展的成果。
