# JS Fireplace Web UI 可执行任务清单

> 基于 [Web UI 建设计划](./2026-03-08-webui-plan.md) 拆分的落地任务文档。
>
> 目标：让人类开发者或类似 Codex、Claude Code 的 agent 能以测试驱动开发（TDD）的方式，分批实现 `js-fireplace` 的浏览器 UI。

---

## 一、使用方式

本任务清单按以下原则设计：

- 每个任务都是小而完整的增量
- 每个任务都要求先补测试，再做实现
- 每个任务都要求运行验证命令
- 每个任务都要求更新 `progress.md`
- 每个任务都应尽量不破坏现有 Node 规则引擎入口

建议执行顺序：

1. Phase 0: Web 入口与工程骨架
2. Phase 1: 引擎桥接层与只读棋盘
3. Phase 2: 出牌和目标选择
4. Phase 3: 回合与动作反馈
5. Phase 4: 浏览器自动化测试和持续迭代

---

## 二、Agent 工作约束

适用于 Codex、Claude Code 等 agent 的统一要求：

1. 必须以测试驱动开发方式工作

- 先新增或修改测试
- 先看到测试失败
- 再补实现
- 最后运行相关测试直到通过

2. 每个任务只做一个清晰目标

不要在同一轮任务中同时做：

- 工程初始化
- 状态桥接
- 复杂交互
- 动画

3. 不要直接让 UI 组件操作引擎内部可变对象

必须通过桥接层：

- `serializeGameState(game)`
- `createGameController()`
- `dispatch(command)`

4. 浏览器测试必须保留可读状态输出

必须提供：

- `window.render_game_to_text`
- 若有动画，提供 `window.advanceTime(ms)`

5. 每完成一个任务，必须更新 `progress.md`

追加内容至少包含：

- 完成了什么
- 跑了哪些测试
- 是否有已知限制
- 下一步建议

---

## 三、任务总览

## Phase 0: 工程初始化

### Task 0.1: 引入 Web 构建入口

目标：

- 在不破坏现有 `tsc` / Jest 逻辑的前提下，引入 Vite + React 入口

交付：

- `index.html`
- `vite.config.ts`
- `src/ui/app/main.tsx`
- `src/ui/app/App.tsx`
- `src/ui/app/ui.css`
- `package.json` 中新增 Web 启动脚本

测试：

- 增加一个最小渲染 smoke test
- 本地启动 dev server 后页面可打开

依赖：

- 无

### Task 0.2: 增加 Web UI 类型定义

目标：

- 建立 UI 专属类型，不让 React 组件直接依赖引擎运行时对象

交付：

- `src/ui/types/ui-state.ts`
- `src/ui/types/ui-commands.ts`

测试：

- 类型级测试可通过编译验证
- 桥接层后续任务可直接复用

依赖：

- Task 0.1

---

## Phase 1: 引擎桥接层与只读棋盘

### Task 1.1: 实现 `serializeGameState(game)`

目标：

- 从运行中的 `Game` 导出稳定、可渲染的只读快照

交付：

- `src/ui/engine-bridge/serializeGameState.ts`

建议输出字段：

- 回合
- 当前玩家
- 本方/对方英雄状态
- mana
- 手牌列表
- 场面列表
- deckCount
- game mode

测试：

- 新增针对 `serializeGameState` 的 Jest 测试
- 构造最小 `Game`，验证导出结果正确

依赖：

- Task 0.2

### Task 1.2: 实现 `createGameController()`

目标：

- 封装游戏初始化、状态读取、订阅和命令分发

交付：

- `src/ui/engine-bridge/createGameController.ts`

建议 API：

```ts
interface GameController {
  getState(): UIGameState;
  dispatch(command: UICommand): void;
  subscribe(listener: (state: UIGameState) => void): () => void;
  reset(): void;
}
```

测试：

- `getState()` 返回初始状态
- `subscribe()` 在 `dispatch()` 后能收到更新

依赖：

- Task 1.1

### Task 1.3: 实现只读棋盘页面

目标：

- 页面中能可视化显示双方英雄、手牌、场面、回合和 mana

交付：

- `Board.tsx`
- `HeroPanel.tsx`
- `HandView.tsx`
- `Battlefield.tsx`
- App 接入 controller

测试：

- 组件渲染测试
- 页面加载 smoke test

依赖：

- Task 1.2

---

## Phase 2: 主动出牌与目标选择

### Task 2.1: 打通无目标出牌命令

目标：

- 点击本方手牌可打出无目标牌

交付：

- `PLAY_CARD` 命令支持无目标牌
- UI 刷新显示牌从手牌移到场面或墓地

测试：

- Jest 测试：无目标牌命令后状态正确变化
- 浏览器 smoke test：点击后 UI 变化

依赖：

- Task 1.3

### Task 2.2: 暴露“可打/不可打”状态

目标：

- 手牌 UI 能区分可打与不可打

交付：

- `serializeGameState()` 输出 `playable`
- 手牌组件做视觉区分

测试：

- mana 不足时 `playable = false`
- mana 足够时 `playable = true`

依赖：

- Task 2.1

### Task 2.3: 打通有目标出牌的合法目标选择

目标：

- 有目标牌被点击后进入 target selection 模式
- 只高亮合法目标
- 点击合法目标后执行出牌

交付：

- `TargetOverlay.tsx`
- `pendingTarget` 状态
- `TargetValidator` 接入 controller

测试：

- Jest 测试：`getValidTargets()` 结果被正确映射到 UI state
- 浏览器测试：点击有目标牌后只允许合法目标被选中

依赖：

- Task 2.2

### Task 2.4: 统一主动法术执行入口

目标：

- 在 Web UI 使用的命令分发里，统一走：

`isPlayable -> getValidTargets -> Play -> executePlay -> serialize`

交付：

- controller 内部新增稳定出牌执行流程

测试：

- Fireball/Polymorph 类法术的最小整合测试
- 出牌后目标生命/形态变化正确

依赖：

- Task 2.3

---

## Phase 3: 回合、日志与动作反馈

### Task 3.1: 实现 End Turn 交互

目标：

- 点击 End Turn 后当前玩家切换，mana/手牌/状态更新

交付：

- `TurnControls.tsx`
- `END_TURN` command

测试：

- Jest：命令后 currentPlayer 改变
- 浏览器测试：按钮可点击且 UI 变化

依赖：

- Task 1.3

### Task 3.2: 增加结构化动作日志

目标：

- 不再只依赖 `console.log`
- UI 可显示最近动作

交付：

- `UIActionLogEntry` 类型
- controller/log bridge
- `ActionLog.tsx`

测试：

- 打牌、造成伤害、结束回合时日志有新增条目

依赖：

- Task 2.4

### Task 3.3: 增加关键状态反馈

目标：

- 重要动作有最小视觉反馈

建议最小集合：

- 受伤闪烁
- 死亡淡出
- 可选目标高亮

测试：

- 浏览器视觉 smoke test
- 文本状态仍与 UI 一致

依赖：

- Task 3.2

---

## Phase 4: 浏览器自动化测试与回归

### Task 4.1: 提供 `window.render_game_to_text`

目标：

- 浏览器自动化能够无障碍读取对局状态

交付：

- 在 App 或 controller 暴露 `window.render_game_to_text`

测试：

- 浏览器中调用后返回正确 JSON 字符串

依赖：

- Task 1.2

### Task 4.2: 如有动画，提供 `window.advanceTime(ms)`

目标：

- Playwright 可稳定推进动画和延时状态

交付：

- `window.advanceTime`

测试：

- 推进时间后动画状态与 UI state 一致

依赖：

- Task 3.3

### Task 4.3: 建立 Playwright 冒烟回归

目标：

- 自动验证最关键的玩家链路

第一批场景：

1. 打开页面并开始对局
2. 打出一张无目标牌
3. 打出一张有目标法术
4. 结束回合
5. 检查 `render_game_to_text` 与页面一致

依赖：

- Task 4.1

---

## 四、推荐任务执行顺序

按优先级排序：

1. Task 0.1
2. Task 0.2
3. Task 1.1
4. Task 1.2
5. Task 1.3
6. Task 2.1
7. Task 2.2
8. Task 2.3
9. Task 2.4
10. Task 3.1
11. Task 3.2
12. Task 3.3
13. Task 4.1
14. Task 4.2
15. Task 4.3

---

## 五、每个任务的 Definition of Done

每个任务必须同时满足：

1. 代码实现完成
2. 新增或更新的测试已通过
3. 相关旧测试未回归
4. `progress.md` 已追加本轮记录
5. 若涉及 UI，可本地运行并验证基本交互
6. 若涉及浏览器交互，`render_game_to_text` 能反映关键状态

---

## 六、Agent Prompt 模板

以下模板适合直接发给 Codex、Claude Code 一类 agent。

使用规则：

- 每次只发一个任务
- 不要把多个任务打包成一个大 Prompt
- 要求 agent 先写测试，再补实现，再运行测试

---

## Template A: 通用 TDD 任务 Prompt

```md
你正在 `/Users/doc_yao/Code/js/js_fireplace` 中工作。

请完成任务：<TASK_NAME>

任务目标：
<TASK_GOAL>

约束：
- 必须使用测试驱动开发：先写或更新测试，再实现代码，再运行测试。
- 不要顺手实现额外功能，只完成当前任务。
- 不要破坏现有 Node 规则引擎入口。
- UI 代码不能直接持有和修改引擎内部可变对象，必须通过桥接层或只读快照工作。
- 完成后更新 `progress.md`，追加本轮完成内容、验证结果和下一步建议。

执行步骤：
1. 先阅读与任务直接相关的文件。
2. 新增或修改测试，让测试先失败。
3. 实现最小代码使测试通过。
4. 运行当前任务相关测试；如果有必要，再运行一轮更宽的回归测试。
5. 汇报修改内容、测试结果、剩余限制。

完成标准：
<DEFINITION_OF_DONE>
```

---

## Template B: 工程初始化任务 Prompt

```md
你正在 `/Users/doc_yao/Code/js/js_fireplace` 中工作。

请按测试驱动开发方式完成 Web UI 工程初始化任务。

目标：
- 引入最小可运行的 Vite + React 浏览器入口
- 不破坏现有 `npm run build` 与 Jest 测试
- 为后续 UI 任务建立基础目录结构

要求：
- 先添加或更新最小 smoke test
- 再补实现
- 保持 TypeScript 配置清晰，不要一次引入过多工具
- 完成后更新 `progress.md`

完成后请验证：
- Web 入口可以启动
- 原有测试仍能运行
- 新增 smoke test 通过
```

---

## Template C: 引擎桥接层任务 Prompt

```md
你正在 `/Users/doc_yao/Code/js/js_fireplace` 中工作。

请按测试驱动开发方式实现 `serializeGameState(game)` 和/或 `createGameController()` 的当前任务版本。

目标：
- 为 Web UI 提供稳定的只读状态快照
- 不让 React 或 UI 代码直接依赖 `Game`、`Player`、`Card` 的可变内部结构

要求：
- 先写 Jest 测试，覆盖最小可用状态导出
- 输出字段只包含 UI 渲染真正需要的数据
- 设计要允许后续加入 `pendingTarget`、`action log`、`game over`
- 完成后更新 `progress.md`

完成后请验证：
- 快照字段与测试预期一致
- 类型定义清晰
- 不引入循环依赖
```

---

## Template D: 出牌与目标选择任务 Prompt

```md
你正在 `/Users/doc_yao/Code/js/js_fireplace` 中工作。

请按测试驱动开发方式完成“Web UI 主动出牌链路”的当前任务。

目标：
- 打通以下链路中的当前增量：
  `isPlayable -> getValidTargets -> Play -> executePlay -> serializeGameState`

要求：
- 先写测试，再实现
- 对无目标牌和有目标牌分开考虑
- UI 只能消费序列化状态，不能直接依赖引擎内部对象引用
- 如果需要，新增最小桥接层辅助函数
- 完成后更新 `progress.md`

至少覆盖以下验证：
- mana 不足时不能出牌
- 无目标牌能打出并更新状态
- 有目标牌只能选择合法目标
- 结算后目标状态正确变化
```

---

## Template E: 浏览器自动化任务 Prompt

```md
你正在 `/Users/doc_yao/Code/js/js_fireplace` 中工作。

请按测试驱动开发方式完成当前浏览器自动化任务。

目标：
- 为 Web UI 提供稳定自动化回归能力

强制要求：
- 提供 `window.render_game_to_text`
- 如果存在动画或延迟状态，提供 `window.advanceTime(ms)`
- 使用现有仓库工具和最小必要脚本，不要额外引入重型测试框架方案

执行顺序：
1. 先补测试脚本或浏览器冒烟验证脚本
2. 再补实现
3. 运行测试并检查输出状态、截图、控制台错误

验证点：
- 页面能加载
- 一条核心交互链可自动完成
- `render_game_to_text` 输出与页面状态一致
```

---

## 七、建议的首批 Agent 分配

如果要并行推进，建议按以下边界拆给不同 agent，但每个 agent 仍应一次只做一个任务。

Agent A:

- Task 0.1
- Task 0.2

Agent B:

- Task 1.1
- Task 1.2

Agent C:

- Task 1.3

后续在桥接层稳定后再合流到：

- Task 2.1
- Task 2.2
- Task 2.3
- Task 2.4

不建议一开始并行做：

- 桥接层
- 目标选择
- 动画系统

因为这三者耦合较高，容易造成返工。

---

## 八、首轮最小里程碑

第一个真正值得演示的里程碑应定义为：

- 浏览器页面可打开
- 可看到棋盘和手牌
- 可结束回合
- 可打出至少一种无目标牌
- 可打出至少一种有目标牌
- 浏览器自动化能走通一条核心链路

在达成这个里程碑前，不要优先投入：

- 炫技动画
- 复杂视觉 polish
- 拖拽交互
- 完整收藏系统

---

## 九、结论

这份任务清单的核心价值不是“列更多事情”，而是把 Web UI 建设变成适合 agent 自动推进的工程流程：

- 小任务
- 明确依赖
- 强制 TDD
- 每轮可验证
- 每轮可回归

只要按本清单推进，Web UI 可以在不打乱现有规则引擎结构的前提下持续演进。
