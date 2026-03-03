# Hearthstone CLI - 设计文档

**日期**: 2026-03-03
**目标**: 创建一个CLI界面的炉石传说游戏，100%还原游戏规则，支持AI训练和人类游玩

## 项目概述

### 核心目标
1. 为训练炉石传说AI提供精确的游戏环境
2. 支持人类通过CLI界面游玩
3. 提供OpenAI Gym/Gymnasium兼容的AI训练接口
4. 实现核心卡组子集（200-300张代表性卡牌）

### 技术栈
- **编程语言**: Python
- **AI接口**: OpenAI Gym/Gymnasium
- **精确度**: 核心规则100%精确，复杂边界情况渐进实现
- **测试策略**: 核心单元测试 + 集成测试

### 支持的游戏模式
- 标准对战（1v1）
- 单人 vs AI
- AI vs AI（用于self-play训练）
- 卡组构建系统

## 整体架构

### 架构模式：分层架构（Layered Architecture）

选择分层架构的原因：
- 关注点分离，易于测试和维护
- AI训练可以直接使用引擎层，无需CLI开销
- 灵活扩展（未来可添加GUI、Web接口等）
- 符合SOLID原则，代码质量高

### 项目结构

```
hs_glm/
├── hearthstone/           # 核心游戏引擎
│   ├── engine/           # 游戏引擎核心
│   ├── cards/            # 卡牌定义和效果
│   ├── rules/            # 游戏规则系统
│   └── models/           # 数据模型（玩家、英雄、随从等）
├── cli/                  # CLI界面层
│   ├── display/          # 显示渲染
│   ├── input/            # 输入处理
│   └── menu/             # 菜单系统
├── ai/                   # AI训练接口层
│   ├── gym_env/          # OpenAI Gym环境封装
│   └── agents/           # 示例AI代理
├── data/                 # 数据文件
│   ├── cards/            # 卡牌JSON定义
│   └── decks/            # 预设卡组
└── tests/                # 测试套件
    ├── unit/             # 单元测试
    └── integration/      # 集成测试
```

### 核心分层

**Layer 1: 游戏引擎层（hearthstone/）** - 完全独立，无依赖
- 游戏状态管理
- 规则引擎
- 卡牌效果系统
- 事件系统（用于触发效果）

**Layer 2: 接口层**
- **CLI接口（cli/）**: 人类玩家交互
- **Gym接口（ai/gym_env/）**: AI训练接口

**Layer 3: 工具层**
- 卡组构建器
- 回放系统（未来）
- 日志和分析（未来）

## 游戏引擎层设计

### 核心数据模型

```python
# 核心实体
class GameState:
    - current_player: Player
    - opposing_player: Player
    - turn: int
    - phase: GamePhase  # MULLIGAN, MAIN, END
    - board: Board

class Player:
    - hero: Hero
    - mana: ManaCrystal
    - hand: List[Card]
    - deck: Deck
    - graveyard: List[Card]

class Card:
    - id: str
    - name: str
    - cost: int
    - card_type: CardType  # MINION, SPELL, WEAPON, HERO
    - effects: List[Effect]

class Minion(Card):
    - attack: int
    - health: int
    - abilities: Set[Ability]  # CHARGE, TAUNT, DIVINE_SHIELD, etc.
```

### 游戏引擎核心组件

**1. 游戏循环控制器**
```python
class GameEngine:
    def __init__(self, player1_deck, player2_deck):
        self.state = initialize_game(player1_deck, player2_deck)
        self.validator = RuleValidator()
        self.event_bus = EventBus()

    def take_action(self, action: Action) -> ActionResult:
        # 验证动作合法性
        # 执行动作
        # 触发事件
        # 更新游戏状态
        # 返回结果
```

**2. 规则验证器**
- 验证玩家是否可以执行某个动作
- 检查法力值、目标有效性、时机等
- 返回详细的错误信息（用于AI学习）

**3. 事件总线系统**
```python
# 支持的事件类型
events = [
    "GAME_START", "TURN_START", "TURN_END",
    "CARD_PLAYED", "MINION_SUMMONED", "MINION_DIED",
    "DAMAGE_DEALT", "HEAL", "ATTACK"
]

# 用途：
# 1. 触发卡牌效果（如"每当一个随从死亡..."）
# 2. 为AI提供observation
# 3. CLI显示更新
```

### 卡牌效果系统

**效果类型：**
- **即时效果**: 打出时立即执行（如火球术造成伤害）
- **持续效果**: 场上持续生效（如raid leader给所有随从+1攻击）
- **触发效果**: 响应事件触发（如"每当..."）
- **死亡呓语**: 随从死亡时触发

**效果解析器**：
```python
class EffectParser:
    # 从JSON定义解析效果
    def parse_effect(effect_json) -> Effect:
        # 例如: {"type": "DAMAGE", "target": "ENEMY_HERO", "value": 3}
        # 解析为 DamageEffect(target=ENEMY_HERO, value=3)
```

### AI友好的设计

**状态序列化**：
```python
class GameStateEncoder:
    def encode(state: GameState) -> np.ndarray:
        # 将游戏状态编码为固定长度的向量
        # 用于神经网络的输入
        # 例如: [mana, hand_size, board_state, ...]
```

**动作空间**：
```python
class ActionSpace:
    # 定义所有可能的动作
    # 为Gym接口提供action_space和action_mask
    VALID_ACTIONS = [
        END_TURN,
        PLAY_CARD(card_index, target),
        ATTACK(attacker_id, target_id),
        HERO_POWER(target)
    ]
```

## CLI和AI接口层设计

### CLI界面层

**显示系统**：
```python
class CLIDisplay:
    def render_game_state(self, state: GameState):
        # 清屏并渲染完整游戏界面
        self.render_mana_bars()
        self.render_hands()
        self.render_board()
        self.render_heroes()
        self.render_action_prompt()

    def render_card(self, card: Card, highlight=False):
        # 以ASCII艺术形式渲染卡牌
        # +------------------+
        # | 3/5 | Raid Leader|
        # +------------------+
        # |  All minions +1  |
        # +------------------+
```

**输入处理系统**：
```python
class InputHandler:
    def get_action(self, state: GameState) -> Action:
        # 混合模式支持：
        # 1. 数字选择（默认）：显示数字菜单，用户输入数字
        # 2. 命令模式（按:进入）：输入命令如 "play 3" "attack 2 enemy_hero"
        # 3. VIM模式（按v进入）：hjkl移动，空格选择

    def show_help(self):
        # 显示快捷键和命令列表
```

**菜单系统**：
- 主菜单：开始游戏、构建卡组、设置、退出
- 卡组构建器：浏览卡牌、创建/保存卡组
- 游戏模式选择：vs AI、vs Human、AI vs AI

### OpenAI Gym接口层

**环境封装**：
```python
import gymnasium as gym
from gymnasium import spaces

class HearthstoneEnv(gym.Env):
    def __init__(self, opponent_agent=None):
        self.engine = GameEngine()
        self.opponent = opponent_agent or RandomAgent()

        # 定义observation空间
        self.observation_space = spaces.Dict({
            'hand': spaces.Box(0, 1, shape=(10, CARD_FEATURE_DIM)),
            'board': spaces.Box(0, 1, shape=(7, MINION_FEATURE_DIM)),
            'mana': spaces.Discrete(11),
            'hero_health': spaces.Discrete(31),
            # ... 更多特征
        })

        # 定义action空间
        self.action_space = spaces.Discrete(MAX_ACTIONS)

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, dict]:
        # 执行动作
        result = self.engine.take_action(decode_action(action))

        # 如果回合结束，执行对手回合
        if result.turn_ended:
            opponent_action = self.opponent.act(self.get_observation())
            self.engine.take_action(opponent_action)

        # 返回(observation, reward, done, info)
        return (
            self.get_observation(),  # observation
            self.calculate_reward(),  # reward
            self.is_game_over(),      # done
            {}                         # info
        )

    def reset(self) -> np.ndarray:
        # 重置游戏，返回初始observation
        self.engine = GameEngine(self.deck1, self.deck2)
        return self.get_observation()

    def get_valid_action_mask(self) -> np.ndarray:
        # 返回合法动作的mask（用于masked RL算法）
        return self.engine.validator.get_valid_actions_mask()
```

**奖励函数设计**：
```python
def calculate_reward(self) -> float:
    # 选项1: 稀疏奖励
    if self.state.winner == self.player:
        return +1.0
    elif self.state.winner == self.opponent:
        return -1.0
    else:
        return 0.0

    # 选项2: 密集奖励（推荐用于初期训练）
    reward = 0.0
    reward += self.state.player.damage_dealt_this_turn * 0.01
    reward += self.state.player.cards_drawn_this_turn * 0.02
    reward -= self.state.player.health_lost_this_turn * 0.01
    # ... 更多特征
    return reward
```

### 多智能体支持

```python
class HearthstoneMultiAgentEnv:
    """支持两个AI对战的环境"""

    def __init__(self):
        self.engine = GameEngine()

    def step(self, action1, action2) -> Tuple:
        # 交替执行两个玩家的动作
        # 用于self-play训练
```

### 卡组构建系统

**卡组数据格式**：
```json
{
  "name": "Aggro Hunter",
  "hero_class": "HUNTER",
  "cards": [
    {"id": "DS1_185", "count": 2},  // Arcane Shot x2
    {"id": "EX1_538", "count": 2},  // Unleash the Hounds x2
    // ...
  ]
}
```

**卡组构建CLI**：
- 浏览可用卡牌（按职业、费用、类型过滤）
- 创建/编辑/删除卡组
- 验证卡组合法性（30张牌，职业限制等）
- 导入/导出卡组代码

## 数据流与错误处理

### 数据流设计

**游戏循环数据流**：
```
用户输入 / AI决策
       ↓
  InputHandler / Agent
       ↓
     Action
       ↓
  GameEngine.take_action()
       ↓
  1. RuleValidator.validate()
  2. Execute action → Update GameState
  3. EventBus.emit(event)
  4. Trigger effects
       ↓
  ActionResult
       ↓
  ┌─────┴─────┐
  ↓           ↓
CLI层        Gym层
(Display)   (Encode to obs)
```

**卡牌加载流程**：
```
1. 启动时加载卡牌JSON文件
2. CardParser解析JSON → Card对象
3. EffectParser解析效果定义 → Effect对象
4. CardRegistry注册所有卡牌
5. DeckBuilder通过卡牌ID构建卡组
```

### 错误处理策略

**分层错误处理**：

**引擎层错误**（需要详细，用于AI学习）：
```python
class GameError(Exception):
    INVALID_ACTION = "invalid_action"
    NOT_ENOUGH_MANA = "not_enough_mana"
    INVALID_TARGET = "invalid_target"
    CARD_NOT_IN_HAND = "card_not_in_hand"

    def __init__(self, error_type: str, message: str, legal_actions: List[Action]):
        self.error_type = error_type
        self.message = message
        self.legal_actions = legal_actions  # 提供合法动作列表
```

**CLI层错误处理**：
```python
try:
    action = input_handler.get_action(state)
    result = engine.take_action(action)
except GameError as e:
    # 显示友好的错误信息
    display.show_error(f"❌ {e.message}")
    display.show_hint(f"💡 提示：{e.legal_actions}")
    # 不退出，让用户重新输入
```

**Gym层错误处理**：
```python
# 对AI来说，非法动作不会抛出异常
# 而是返回负奖励和惩罚性的observation
def step(self, action: int):
    if not self.is_valid_action(action):
        return (
            self.get_observation(),
            -0.1,  # 惩罚非法动作
            False,
            {"error": "invalid_action", "legal_actions": self.get_legal_actions()}
        )
```

## 测试策略

### 单元测试（核心功能）

```python
# tests/unit/test_cards.py
def test_fireball_damage():
    """火球术应该造成6点伤害"""
    game = create_test_game()
    fireball = Card.find("CS2_029")
    target = game.opponent.hero

    game.play_card(fireball, target)

    assert target.health == target.max_health - 6

def test_taunt_blocks_attack():
    """嘲讽随从应该阻止攻击非嘲讽目标"""
    game = create_test_game()
    taunt = summon_minion(game.opponent, "CS2_188")  # Ironfur Grizzly

    with pytest.raises(GameError, match="must attack taunt"):
        game.attack(attacker, game.opponent.hero)

# tests/unit/test_engine.py
def test_mana_refresh_each_turn():
    """每回合法力值应该恢复"""
    game = create_test_game()
    game.player.spend_mana(3)

    game.end_turn()
    game.end_turn()  # 回到玩家回合

    assert game.player.mana == game.player.max_mana
```

### 集成测试（游戏流程）

```python
# tests/integration/test_game_flow.py
def test_complete_game():
    """测试完整的游戏流程"""
    env = HearthstoneEnv()
    obs = env.reset()

    done = False
    while not done:
        # 使用随机合法动作
        action = env.action_space.sample()
        obs, reward, done, info = env.step(action)

    assert env.engine.state.winner is not None

def test_gym_interface_compliance():
    """测试是否符合Gym接口规范"""
    from gymnasium.utils.env_checker import check_env

    env = HearthstoneEnv()
    check_env(env)  # 自动验证接口合规性
```

### 卡牌交互测试

```python
# tests/integration/test_card_interactions.py
def test_multiple_triggers_order():
    """测试多个触发效果的执行顺序"""
    # 例如：两个"每当施放法术"的随从
    # 应该按照打出顺序触发
```

### 测试数据管理

**测试用卡组**：
```python
# tests/fixtures/decks.py
@pytest.fixture
def simple_deck():
    """简单卡组，用于基础测试"""
    return Deck([
        Card.find("CS2_231"),  # Wisp (0/1/1) x30
    ] * 30)

@pytest.fixture
def balanced_deck():
    """平衡卡组，用于复杂场景测试"""
    return load_deck("test_balanced.json")
```

## 实施路线图

### Phase 1: 核心引擎（MVP）
- 基础数据模型（GameState, Player, Card）
- 游戏循环控制器
- 简单的卡牌系统（20-30张基础卡）
- 基本规则验证

### Phase 2: CLI界面
- ASCII显示系统
- 基础输入处理
- 简单菜单系统
- 人类可玩性验证

### Phase 3: AI接口
- OpenAI Gym封装
- 状态编码器
- 动作空间定义
- 基础奖励函数

### Phase 4: 扩展卡牌
- 扩展到200-300张卡牌
- 复杂效果系统
- 更多卡牌交互测试

### Phase 5: 优化与完善
- 性能优化
- 更多AI训练功能
- 回放系统
- 文档完善

## 成功标准

1. **可玩性**: 人类可以通过CLI完成完整游戏
2. **AI兼容性**: 符合OpenAI Gym标准，可用于强化学习训练
3. **精确性**: 核心规则100%准确，主流卡牌交互正确
4. **可测试性**: 单元测试覆盖率>80%，关键路径100%
5. **性能**: AI训练速度>1000步/秒（简单场景）
