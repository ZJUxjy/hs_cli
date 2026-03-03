# Hearthstone CLI - Phase 3 设计文档

**日期**: 2026-03-03
**目标**: 实现完整CLI游戏循环和Gymnasium AI训练环境

## 项目概述

### 核心目标
1. 创建统一的GameController管理游戏循环
2. 实现完整的Gymnasium环境用于AI训练
3. 增强CLI游戏循环支持人类游玩
4. 实现简单的卡组管理系统
5. 创建main.py入口点

### 技术栈
- **Gymnasium**: OpenAI Gym接口用于强化学习
- **Unified Game Loop**: 同一个GameController服务CLI和Gymnasium
- **JSON Decks**: 简单的卡组存储格式

### Phase 3 新增功能
- GameController: 中央游戏循环管理器
- Gymnasium环境: 完整的AI训练接口
- CLI游戏循环: 统一的游戏界面
- 卡组管理: 加载/保存/验证卡组
- main.py: 可执行入口

## 架构设计

### 核心架构

```
┌─────────────────────────────────────────┐
│         GameController                   │
│  - Manages game state                   │
│  - Validates and executes actions       │
│  - Notifies observers of changes        │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼────┐      ┌───▼────────┐
   │ CLI    │      │ Gymnasium  │
   │Interface│     │  Env       │
   └────────┘      └────────────┘
```

### 文件结构

```
hs_glm/
├── hearthstone/
│   ├── engine/
│   │   └── game_controller.py     # NEW: Central game loop
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── gym_env.py              # NEW: Gymnasium environment
│   │   └── agents.py               # NEW: Random/heuristic agents
│   └── decks/
│       ├── __init__.py
│       ├── deck_manager.py         # NEW: Deck management
│       └── starter_decks.json      # NEW: Pre-built decks
├── cli/
│   ├── game_loop.py                # NEW: CLI game loop
│   └── [existing files...]
└── main.py                         # NEW: Entry point
```

## 组件设计

### 1. GameController (hearthstone/engine/game_controller.py)

**职责**: 中央游戏循环管理器，与界面无关

**核心方法**:
```python
class GameController:
    def __init__(self, deck1: Deck, deck2: Deck):
        """用两个卡组初始化游戏"""

    def start_game(self) -> GameState:
        """开始新游戏，返回初始状态"""

    def get_valid_actions(self) -> List[Action]:
        """获取当前玩家的所有合法动作"""

    def execute_action(self, action: Action) -> GameEvent:
        """执行动作并返回事件"""

    def get_state(self) -> GameState:
        """获取当前游戏状态"""

    def is_game_over(self) -> bool:
        """检查游戏是否结束"""

    def get_winner(self) -> Optional[Player]:
        """获取胜利者（如果游戏结束）"""
```

**GameEvent结构**:
```python
@dataclass
class GameEvent:
    event_type: str  # "action_success", "action_failed", "game_over", etc.
    message: str
    state_changes: Dict  # 状态变化
    errors: List[str]  # 如果动作失败
```

**观察者模式（可选增强）**:
```python
def add_observer(self, observer: GameObserver):
    """添加观察者接收游戏事件"""
```

用于:
- 录制游戏用于训练数据
- 实时游戏分析
- 观战模式

### 2. Gymnasium环境 (hearthstone/ai/gym_env.py)

**HearthstoneEnv API**:
```python
class HearthstoneEnv(gym.Env):
    def __init__(self, deck1_name: str = "basic_mage", deck2_name: str = "basic_warrior"):
        """用卡组名称初始化环境"""

    def reset(self, seed=None, options=None) -> Tuple[Observation, Dict]:
        """开始新游戏，返回初始观察"""

    def step(self, action: int) -> Tuple[Observation, float, bool, bool, Dict]:
        """执行动作，返回(obs, reward, terminated, truncated, info)"""

    def render(self, mode="human"):
        """显示当前游戏状态（可选）"""

    def close(self):
        """清理资源"""
```

**观察空间设计**:

使用字典观察空间with填充数组:

```python
observation_space = spaces.Dict({
    "player_health": spaces.Box(0, 30, shape=(1,)),
    "player_mana": spaces.Box(0, 10, shape=(1,)),
    "player_hand": spaces.Box(0, 1, shape=(10, CARD_FEATURES)),  # 最多10张牌
    "player_board": spaces.Box(0, 1, shape=(7, MINION_FEATURES)),  # 最多7个随从
    "opponent_health": spaces.Box(0, 30, shape=(1,)),
    "opponent_board": spaces.Box(0, 1, shape=(7, MINION_FEATURES)),
    "turn_number": spaces.Box(0, 100, shape=(1,)),
})
```

**动作空间设计**:

使用掩码动作空间:
- 固定大小动作空间（最大可能动作数）
- 观察中的动作掩码指示合法动作
- 无效动作被忽略

```python
action_space = spaces.Discrete(MAX_ACTIONS)  # 例如 200

# 动作编码:
# 0: 结束回合
# 1-10: 打出手牌0-9
# 11-17: 用随从0-6攻击
# 18-24: 英雄攻击随从0-6
# 等等
```

**奖励结构**:

简单奖励用于MVP:
- **+1.0** 获胜
- **-1.0** 失败
- **+0.01** 对敌方英雄造成伤害
- **-0.01** 受到伤害

### 3. CLI游戏循环 (cli/game_loop.py)

**CLIGameLoop设计**:

```python
class CLIGameLoop:
    def __init__(self, game_controller: GameController):
        self.controller = game_controller
        self.display = GameDisplay()
        self.input_handler = InputHandler(self.display)

    def run(self):
        """CLI游戏主循环"""
        self.controller.start_game()

        while not self.controller.is_game_over():
            # 显示当前状态
            state = self.controller.get_state()
            self.display.render_game_state(state)

            # 显示合法动作为编号选项
            valid_actions = self.controller.get_valid_actions()
            self._display_action_options(valid_actions)

            # 获取用户选择
            action = self.input_handler.get_action_choice(valid_actions)

            # 执行并显示结果
            event = self.controller.execute_action(action)
            if not event.success:
                self.display.render_error(event.message)
            else:
                self.display.render_success(event.message)

        # 游戏结束
        winner = self.controller.get_winner()
        self.display.render_game_over(winner)
```

**增强的InputHandler**:

```python
class InputHandler:
    def get_action_choice(self, valid_actions: List[Action]) -> Action:
        """让用户从合法动作中选择"""
        while True:
            choice = input("选择动作 (数字或命令): ").strip()

            if choice.isdigit():
                # 数字选择
                idx = int(choice) - 1
                if 0 <= idx < len(valid_actions):
                    return valid_actions[idx]
                else:
                    print(f"无效选择。请输入1-{len(valid_actions)}")
            elif choice == ":":
                # 命令模式（高级用户）
                return self._parse_command(input("命令: "))
            elif choice == "h" or choice == "help":
                self._show_help(valid_actions)
            else:
                print("无效输入。输入数字、':'进入命令模式，或'h'获取帮助")
```

**帮助系统**:

```
可用动作:
1. 打出 "River Crocolisk" (2法力)
2. 用 "Murloc Raider" 攻击
3. 结束回合

命令:
- 输入数字选择动作
- ':' 进入命令模式
- 'h' 获取帮助
- 'q' 退出游戏
```

### 4. 卡组管理 (hearthstone/decks/deck_manager.py)

**DeckManager设计**:

```python
class DeckManager:
    def __init__(self):
        self.decks_dir = Path("data/decks")

    def list_decks(self) -> List[str]:
        """列出可用卡组名称"""

    def load_deck(self, name: str) -> Deck:
        """从JSON文件加载卡组"""

    def save_deck(self, deck: Deck, name: str):
        """保存卡组到JSON文件"""

    def validate_deck(self, deck: Deck) -> List[str]:
        """返回验证错误列表"""
```

**预构建卡组** (`data/decks/starter_decks.json`):

4个基础卡组用于快速开始:
- **Basic Mage** - 法术伤害，直接伤害
- **Basic Warrior** - 武器，护甲
- **Basic Hunter** - 野兽协同，直伤
- **Basic Priest** - 治疗，高血量随从

每个卡组:
- 仅使用基础卡牌（已在`data/cards/basic.json`中）
- 总共30张牌
- 适合学习

**卡组验证规则**:
- 必须包含30张牌
- 同名卡最多2张
- 必须匹配职业
- 只能使用可用卡牌

**CLI中的卡组选择**:

简单菜单:

```
选择你的卡组:
1. Basic Mage
2. Basic Warrior
3. Basic Hunter
4. Basic Priest

输入选择 (1-4): _
```

### 5. main.py入口点

```python
def main():
    """Main entry point for Hearthstone CLI."""
    print("Welcome to Hearthstone CLI!")
    print()

    menu = MenuSystem()
    menu.run()


if __name__ == "__main__":
    main()
```

## 数据流设计

### 统一游戏循环

```
GameController.start_game()
    ↓
循环直到游戏结束:
    CLI或Gymnasium获取动作
        ↓
    GameController.execute_action(action)
        ↓
    GameEngine处理动作
        ↓
    AttackValidator/AttackExecutor (如果需要)
        ↓
    GameController返回GameEvent
        ↓
    CLI显示结果 或 Gymnasium返回(obs, reward, done, info)
        ↓
    检查游戏是否结束
```

### Gymnasium训练循环

```
env = HearthstoneEnv()
obs = env.reset()
    ↓
循环:
    agent选择动作 (基于obs和action_mask)
        ↓
    obs, reward, done, info = env.step(action)
        ↓
    训练agent
        ↓
    如果done: obs = env.reset()
```

## 错误处理策略

### GameController错误处理
- 返回详细的GameEvent包含错误信息
- 包含合法动作列表帮助修正
- 从不崩溃，总是返回有效事件

### Gymnasium错误处理
- 无效动作被忽略（step返回相同状态，reward=0）
- 动作掩码清晰指示合法动作
- 永不抛出异常（健壮的RL训练）

### CLI错误处理
- 友好显示错误消息
- 自动重新提示输入
- 提供帮助信息

### 卡组管理错误处理
- 加载时验证卡组
- 阻止使用非法卡组
- 提供修复建议

## 测试策略

### 单元测试

1. **GameController测试**
   - 测试动作验证
   - 测试游戏状态管理
   - 测试事件生成
   - 测试胜负条件

2. **Gymnasium Env测试**
   - 测试`reset()`返回有效观察
   - 测试`step()`正确转换
   - 测试动作掩码工作
   - 测试奖励计算

3. **Deck Manager测试**
   - 测试卡组加载/保存
   - 测试验证逻辑
   - 测试错误处理

### 集成测试

1. **完整游戏流程**
   - 通过CLI玩完整游戏
   - 通过Gymnasium玩完整游戏
   - 比较结果一致性

2. **AI Agent测试**
   - Random agent玩完整游戏
   - Heuristic agent做出合理决策

### 测试覆盖目标

- **GameController**: 100%覆盖（关键组件）
- **Gymnasium Env**: 100%覆盖（AI训练接口）
- **Deck Manager**: 90%覆盖
- **CLI组件**: 80%覆盖（较不关键，难测试）

## 实施优先级

### Phase 3.1: 核心基础设施 (2-3小时)

1. **GameController** - 中央游戏循环管理器
   - 包装现有GameEngine
   - 动作验证和执行
   - 事件生成
   - 单元测试

2. **Deck Manager** - 加载/保存卡组系统
   - JSON卡组文件
   - 验证逻辑
   - 单元测试

### Phase 3.2: Gymnasium环境 (3-4小时)

1. **HearthstoneEnv** - 完整Gymnasium API
   - 观察空间定义
   - 动作空间with掩码
   - `reset()`, `step()`, `render()`
   - 状态编码/解码
   - 单元测试

2. **AI Agents** - 示例agents用于测试
   - RandomAgent (随机合法动作)
   - HeuristicAgent (基础策略)
   - 集成测试

### Phase 3.3: CLI增强 (2-3小时)

1. **CLIGameLoop** - 统一游戏循环
   - 使用GameController
   - 增强输入处理
   - 帮助系统
   - 集成测试

2. **卡组选择UI** - 简单菜单
   - 列出可用卡组
   - 玩家选择
   - 与菜单系统集成

### Phase 3.4: 入口点 & 完善 (1小时)

1. **main.py** - 入口点
   - 菜单系统集成
   - 错误处理
   - 清洁退出

2. **文档**
   - README with使用示例
   - 如何创建自定义卡组
   - 如何使用Gymnasium env

**总估计时间**: 8-11小时

**优先顺序**:
1. GameController (基础)
2. Deck Manager (两个接口都需要)
3. Gymnasium Env (AI训练目标)
4. CLI Game Loop (人类游玩)
5. main.py (完善)

## Phase 3 完成标准

1. **Gymnasium接口**: 完整可用的RL训练环境
2. **CLI游戏**: 人类可以通过CLI完成完整游戏
3. **卡组系统**: 可以加载、验证、使用预构建卡组
4. **统一架构**: 同一GameController服务两个接口
5. **测试覆盖**: 所有关键组件有单元和集成测试
6. **文档**: README解释如何使用两个接口

## 下一步：实施计划

完成设计后，将调用writing-plans skill创建详细的实施计划。
