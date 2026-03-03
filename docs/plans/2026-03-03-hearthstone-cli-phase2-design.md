# Hearthstone CLI - Phase 2 设计文档

**日期**: 2026-03-03
**目标**: 实现CLI界面和完整的攻击系统，支持人机对战和卡组构建

## 项目概述

### 核心目标
1. 使用Rich库实现专业的CLI界面
2. 实现完整的攻击系统（嘲讽、 冲锋、 风怒、 剧毒等）
3. 支持多种游戏模式（人 vs AI, AI vs AI）
4. 实现卡组构建器
5. 实现菜单系统

### 技术栈
- **Rich库**: 用于美化输出（表格、 面板、 颜色、 布局）
- **自定义输入处理**: 使用Python input()配合Rich显示
- **混合交互模式**: 数字选择 + 命令模式

### Phase 2 新增功能
- CLI显示系统
- 完整的攻击系统
- 游戏循环
- 卡组构建器
- 菜单系统

## 架构设计

### 项目结构

```
hs_glm/
├── cli/                      # CLI界面层（新增）
│   ├── display/              # 显示渲染
│   │   ├── __init__.py
│   │   ├── game_display.py   # 游戏主界面
│   │   ├── card_display.py   # 卡牌渲染
│   │   └── menu_display.py   # 菜单渲染
│   ├── input/                # 输入处理
│   │   ├── __init__.py
│   │   ├── input_handler.py  # 输入处理
│   │   └── command_parser.py # 命令解析
│   ├── menu/                 # 菜单系统
│   │   ├── __init__.py
│   │   └── menu_system.py   # 菜单导航
│   └── deck_builder/         # 卡组构建器
│       ├── __init__.py
│       └── deck_builder.py   # 构建界面
├── hearthstone/
│   ├── engine/
│   │   └── attack/           # 攻击系统（新增）
│   │       ├── __init__.py
│   │       ├── attack_validator.py    # 验证攻击
│   │       └── attack_executor.py    # 执行攻击
├── tests/
│   ├── unit/
│   │   ├── test_cli_display.py
│   │   ├── test_attack_validator.py
│   │   └── test_attack_executor.py
│   └── integration/
│       ├── test_cli_game_flow.py
│       └── test_deck_builder.py
```

## 组件设计

### 1. CLI显示层 (cli/display/)

**GameDisplay类**:
```python
class GameDisplay:
    def __init__(self):
        self.console = Console()

    def render_game_state(self, game_state: GameState):
        """渲染完整游戏状态"""
        # 渲染对手信息
        # 渲染战场
        # 渲染玩家信息
        # 渲染手牌

    def render_minion(self, minion: Minion, index: int = None) -> Panel:
        """渲染单张随从卡牌"""
        # 使用Rich Panel创建边框
        # 颜色编码：
        # - 可以攻击: 绿色
        # - 不能攻击: 灰色
        # - 嘲讽: 黄色边框
        # - 冲锋: 蓝色文字

    def render_hero(self, hero: Hero, is_current: bool) -> Panel:
        """渲染英雄信息"""
        # 显示生命、护甲、攻击力

    def render_hand(self, cards: List[Card]) -> Columns:
        """渲染手牌列表"""
        # 显示手牌编号和基本信息
```

**CardDisplay类**:
```python
class CardDisplay:
    @staticmethod
    def render_card(card: Card) -> str:
        """渲染卡牌的字符串表示"""
        # 返回卡牌的Rich格式字符串

    @staticmethod
    def render_minion_board(minion: Minion) -> Panel:
        """渲染战场上的随从"""
        # 返回随从的Panel对象
```

**MenuDisplay类**:
```python
class MenuDisplay:
    def __init__(self):
        self.console = Console()

    def render_main_menu(self) -> Panel:
        """渲染主菜单"""
        # 显示选项：开始游戏、构建卡组、设置、退出

    def render_game_mode_menu(self) -> Panel:
        """渲染游戏模式选择"""
        # 显示：人 vs AI, AI vs AI

    def render_deck_builder_menu(self, decks: List[Deck]) -> Panel:
        """渲染卡组构建器菜单"""
        # 显示现有卡组列表和创建新卡组选项
```

### 2. 输入处理层 (cli/input/)

**InputHandler类**:
```python
class InputHandler:
    def __init__(self, display: GameDisplay):
        self.display = display
        self.mode = "number"  # number or command

    def get_action(self, game_state: GameState) -> Action:
        """获取用户输入并转换为动作"""
        while True:
            # 显示选项
            user_input = input("请选择操作: ")

            if user_input == ":":
                # 切换到命令模式
                self.mode = "command"
                return self._parse_command(input("命令: "))
            else:
                # 数字选择模式
                return self._parse_number(user_input, game_state)

    def _parse_number(self, input_str: str, game_state: GameState) -> Action:
        """解析数字输入"""
        # 将数字映射到具体动作

    def _parse_command(self, command: str) -> Action:
        """解析命令输入"""
        # 解析如 ":play 3", ":attack 1 enemy_hero", ":end"
```

**CommandParser类**:
```python
class CommandParser:
    @staticmethod
    def parse(command: str, game_state: GameState) -> Action:
        """解析命令字符串"""
        tokens = command.strip().split()
        if not tokens:
            raise ValueError("空命令")

        cmd = tokens[0].lower()

        if cmd == "play":
            # play <card_index> [target]
            return PlayCardAction(...)
        elif cmd == "attack":
            # attack <attacker> <target>
            return AttackAction(...)
        elif cmd == "end":
            return EndTurnAction(...)
        else:
            raise ValueError(f"未知命令: {cmd}")
```

### 3. 菜单系统 (cli/menu/)

**MenuSystem类**:
```python
class MenuSystem:
    def __init__(self):
        self.display = MenuDisplay()
        self.running = True

    def run(self):
        """运行主菜单循环"""
        while self.running:
            # 显示主菜单
            choice = self._get_main_menu_choice()

            if choice == 1:
                # 开始游戏
                self._start_game_flow()
            elif choice == 2:
                # 构建卡组
                self._deck_builder_flow()
            elif choice == 3:
                # 设置
                self._settings_flow()
            elif choice == 4:
                # 退出
                self.running = False

    def _start_game_flow(self):
        """游戏模式选择流程"""
        # 显示游戏模式菜单
        # 获取用户选择
        # 初始化游戏引擎
        # 运行游戏循环

    def _deck_builder_flow(self):
        """卡组构建流程"""
        # 显示卡组构建器界面
        # 允许用户浏览、创建、编辑卡组
```

### 4. 攻击系统 (hearthstone/engine/attack/)

**AttackValidator类**:
```python
class AttackValidator:
    def validate_attack(self, attacker, target, game_state: GameState) -> ValidationResult:
        """验证攻击是否合法"""
        errors = []

        # 检查攻击者是否可以攻击
        if not self._can_attack(attacker, game_state):
            errors.append("攻击者无法攻击")

        # 检查目标是否合法
        if not self._is_valid_target(target, game_state):
            errors.append("无效的目标")

        # 检查嘲讽限制
        if self._must_attack_taunt(game_state) and not self._is_taunt(target):
            errors.append("必须先攻击嘲讽随从")

        return ValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            legal_targets=self._get_legal_targets(attacker, game_state)
        )

    def _can_attack(self, attacker, game_state: GameState) -> bool:
        """检查攻击者是否可以攻击"""
        # 英雄：检查是否有武器
        # 随从：检查can_attack和攻击次数

    def _must_attack_taunt(self, game_state: GameState) -> bool:
        """检查是否必须攻击嘲讽随从"""
        # 检查对手场上是否有嘲讽随从

    def _get_legal_targets(self, attacker, game_state: GameState) -> List[str]:
        """获取所有合法目标"""
        # 返回可以被攻击的目标列表
```

**AttackExecutor类**:
```python
class AttackExecutor:
    def execute_attack(self, attacker, target, game_state: GameState) -> AttackResult:
        """执行攻击"""
        # 1. 双方造成伤害
        # 2. 触发相关效果（嘲讽、冲锋等）
        # 3. 检查死亡
        # 4. 触发亡语
        # 5. 返回结果

    def _deal_damage(self, source, target, amount: int):
        """造成伤害"""
        # 处理护甲吸收
        # 处理圣盾
        # 更新生命值

    def _check_deaths(self, game_state: GameState):
        """检查并处理死亡"""
        # 检查所有随从的生命值
        # 触发亡语效果
        # 移除死亡随从

    def _trigger_deathrattle(self, minion: Minion, game_state: GameState):
        """触发亡语效果"""
        # 执行亡语效果
```

### 5. 卡组构建器 (cli/deck_builder/)

**DeckBuilder类**:
```python
class DeckBuilder:
    def __init__(self):
        self.card_loader = CardLoader()
        self.display = DeckBuilderDisplay()

    def run(self) -> Optional[Deck]:
        """运行卡组构建器"""
        while True:
            # 显示当前卡组
            # 显示可用卡牌
            # 获取用户输入
            # 执行操作（添加、移除、保存、取消）

    def _filter_cards(self, hero_class: Optional[HeroClass], search: str) -> List[Card]:
        """过滤卡牌列表"""
        # 按职业、搜索词过滤

    def _validate_deck(self, deck: Deck) -> List[str]:
        """验证卡组合法性"""
        errors = []
        if len(deck.cards) != 30:
            errors.append("卡组必须包含30张牌")
        # 检查职业限制
        # 检查同名卡牌数量（最多2张）
        return errors

    def _save_deck(self, deck: Deck, name: str):
        """保存卡组到JSON文件"""
        # 保存到data/decks/目录
```

## 数据流设计

### 游戏循环数据流

```
MenuSystem.run()
    ↓
选择"开始游戏"
    ↓
GameEngine.initialize_game()
    ↓
循环直到游戏结束:
    GameDisplay.render_game_state()
        ↓
    InputHandler.get_action()
        ↓
    GameEngine.take_action()
        ↓
    AttackValidator/AttackExecutor (如果需要)
        ↓
    GameDisplay.render_result()
        ↓
    检查游戏是否结束
```

### 攻击系统数据流

```
用户输入攻击命令
    ↓
InputHandler解析为AttackAction
    ↓
GameEngine.take_action()
    ↓
AttackValidator.validate_attack()
    ↓
合法? ──否──> 返回错误信息
    |
    是
    ↓
AttackExecutor.execute_attack()
    ↓
处理伤害、效果、死亡
    ↓
返回AttackResult
    ↓
更新GameState
```

## 错误处理策略

### CLI层错误处理
- 用户输入无效选项时显示错误提示并重新请求输入
- 使用Rich的样式突出错误信息
- 提供帮助信息指导用户正确输入

### 攻击系统错误处理
- 返回详细的验证错误信息
- 包含合法目标列表帮助用户修正
- 在CLI中友好地显示错误

### 卡组构建错误处理
- 实时显示卡组验证错误
- 阻止保存非法卡组
- 提供修复建议

## 测试策略

### 单元测试
- **AttackValidator**: 测试各种攻击场景验证
- **AttackExecutor**: 测试伤害计算、效果触发
- **CommandParser**: 测试命令解析
- **DeckBuilder**: 测试卡组验证逻辑

### 集成测试
- **游戏流程**: 测试完整的游戏循环
- **攻击流程**: 测试从输入到执行的完整攻击流程
- **卡组构建**: 测试创建和保存卡组的完整流程

### UI测试
- 使用Rich的测试工具验证显示输出
- 测试输入处理的各种场景

## Phase 2 完成标准

1. **可玩性**: 人类可以通过CLI完成完整游戏
2. **攻击系统**: 所有核心攻击规则正确实现
3. **卡组构建**: 可以创建、保存、加载自定义卡组
4. **菜单系统**: 所有菜单功能正常工作
5. **测试覆盖**: 所有新功能有单元和集成测试
6. **用户体验**: 界面清晰、响应及时、错误友好

## 依赖添加

需要在pyproject.toml中添加：
```toml
[project.dependencies]
rich = ">=13.0.0"
```

## 下一步：实施计划

完成设计后， 将调用writing-plans skill创建详细的实施计划。
