# 炉石传说 CLI 游戏设计文档

> **目标：** 构建100%还原的炉石传说标准对战环境，为AI训练提供符合OpenAI Gym标准的接口，同时提供美观的CLI界面供人类调试和观战。

---

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                      CLI 界面层                              │
│         (rich交互式 / 日志模式 / 观战模式)                     │
├─────────────────────────────────────────────────────────────┤
│                    Gymnasium 环境包装                         │
│              (符合OpenAI Gym标准API)                         │
├─────────────────────────────────────────────────────────────┤
│                    游戏引擎核心                               │
│    (游戏状态机、行动系统、效果结算、随机数管理)                  │
├─────────────────────────────────────────────────────────────┤
│                    卡牌效果系统                               │
│       (战吼、亡语、奥秘、法术、持续效果等)                      │
├─────────────────────────────────────────────────────────────┤
│                    数据层                                     │
│          (HearthstoneJSON + 运行时卡组构建)                   │
└─────────────────────────────────────────────────────────────┘
```

### 关键设计原则

1. **纯函数式状态**：所有状态使用 `frozen dataclass`，任何修改返回新状态
2. **确定性**：随机数生成器状态显式存储，相同种子产生完全相同对局
3. **完全可序列化**：支持状态保存、复盘、分支探索（MCTS需要）
4. **分层解耦**：AI可直接调用引擎层，绕过CLI

---

## 2. 游戏引擎核心

### 2.1 状态设计

```python
@dataclass(frozen=True)
class GameState:
    turn: int                      # 当前回合数
    active_player: int             # 0 或 1
    players: tuple[PlayerState, PlayerState]
    action_history: tuple[Action, ...]
    rng_state: RandomState         # 显式存储确保可复现
    phase_stack: tuple[Phase, ...] # 阶段栈（用于结算队列）

@dataclass(frozen=True)
class PlayerState:
    hero: HeroState
    mana: ManaState
    deck: tuple[Card, ...]
    hand: tuple[Card, ...]
    board: tuple[Minion, ...]      # 位置敏感，最多7个
    secrets: frozenset[Secret]
    graveyard: tuple[Card, ...]
    exhausted_minions: frozenset[int]  # 本回合已攻击的随从索引
    hero_power_used: bool

@dataclass(frozen=True)
class ManaState:
    current: int
    max_mana: int                  # 水晶上限10
    overload: int                  # 下回合过载
    locked: int                    # 本回合锁定

@dataclass(frozen=True)
class Minion:
    card_id: str
    attack: int
    health: int
    max_health: int
    attributes: frozenset[Attribute]  # 嘲讽、圣盾、风怒等
    enchantments: tuple[Enchantment, ...]  # 临时buff
    damage_taken: int
    summoned_this_turn: bool
    exhausted: bool                # 本回合已攻击
```

### 2.2 行动系统

```python
class Action(ABC):
    player: int

@dataclass(frozen=True)
class PlayCardAction(Action):
    card_index: int
    target: Optional[EntityRef]
    board_position: int  # 0-6，随从放置位置

@dataclass(frozen=True)
class AttackAction(Action):
    attacker: EntityRef
    defender: EntityRef

@dataclass(frozen=True)
class HeroPowerAction(Action):
    target: Optional[EntityRef]

@dataclass(frozen=True)
class EndTurnAction(Action):
    pass

@dataclass(frozen=True)
class TargetReference:
    """指向游戏实体的引用，支持序列化"""
    zone: Zone  # HAND, BOARD, HERO, etc.
    player: int
    index: int  # 在zone中的位置
```

### 2.3 阶段系统（Phase System）

处理炉石的复杂连锁机制：

```python
class Phase(ABC):
    """结算阶段基类"""
    pass

@dataclass
class OnPlayPhase(Phase):
    """卡牌打出时"""
    card: Card
    target: Optional[EntityRef]

@dataclass
class AfterSummonPhase(Phase):
    """随从召唤后"""
    minion: Minion
    position: int

@dataclass
class OnDamagePhase(Phase):
    """造成伤害时"""
    source: EntityRef
    target: EntityRef
    amount: int

@dataclass
class DeathPhase(Phase):
    """死亡结算"""
    minions: list[Minion]
```

阶段按队列顺序处理，支持炉石的"先进先出"结算规则。

---

## 3. 卡牌效果系统

### 3.1 解释器模式（覆盖95%卡牌）

```python
@dataclass
class CardEffect:
    trigger: Trigger
    condition: Optional[Condition]
    actions: list[EffectAction]
    choices: Optional[Choices]  # 发现、抉择等

# 触发器类型
class Trigger(Enum):
    BATTLECRY = auto()      # 战吼
    DEATHRATTLE = auto()    # 亡语
    SPELL_CAST = auto()     # 法术释放
    MINION_SUMMONED = auto()  # 随从召唤
    TURN_START = auto()
    TURN_END = auto()
    ON_DAMAGE = auto()
    ON_ATTACK = auto()
    SECRET_REVEALED = auto()

# 效果动作
@dataclass
class DamageAction:
    target: TargetSelector
    amount: int
    is_spell_damage: bool = False

@dataclass
class SummonAction:
    card_id: str
    position: PositionSelector
    count: int = 1

@dataclass
class DrawCardsAction:
    player: PlayerSelector
    count: int

@dataclass
class GainManaCrystalAction:
    player: PlayerSelector
    amount: int
    empty: bool = False  # 空水晶vs满水晶

@dataclass
class ModifyStatsAction:
    target: TargetSelector
    attack_delta: int
    health_delta: int
    permanent: bool = False
```

### 3.2 特殊卡牌回调接口

对于无法描述的复杂效果：

```python
class SpecialCardHandler(ABC):
    """特殊卡牌处理器"""

    @abstractmethod
    def on_play(self, game: GameState, context: PlayContext) -> GameState:
        pass

# 示例：雷诺·杰克逊
class RenoJacksonHandler(SpecialCardHandler):
    def on_play(self, game, context):
        # 检查卡组是否有重复牌
        player = game.players[context.player]
        deck_cards = [c.card_id for c in player.deck]
        has_duplicates = len(deck_cards) != len(set(deck_cards))

        if not has_duplicates:
            # 恢复满血
            hero = replace(player.hero, health=30)
            return game.with_player(context.player, replace(player, hero=hero))
        return game
```

---

## 4. Gymnasium 环境接口

```python
class HearthstoneEnv(gym.Env):
    metadata = {"render_modes": ["human", "ansi", "none"]}

    def __init__(self, deck1: Deck, deck2: Deck, seed: int = None, render_mode: str = "none"):
        self.deck1 = deck1
        self.deck2 = deck2
        self.seed = seed
        self.render_mode = render_mode
        self._game: Optional[GameState] = None

    def reset(self, seed=None, options=None) -> tuple[dict, dict]:
        """开始新对局"""
        if seed is not None:
            self.seed = seed
        self._game = GameState.create_new(
            deck1=self.deck1,
            deck2=self.deck2,
            seed=self.seed
        )
        return self._get_obs(), self._get_info()

    def step(self, action: int) -> tuple[dict, float, bool, bool, dict]:
        """执行行动"""
        game_action = self._action_id_to_action(action)
        self._game = self._game.apply_action(game_action)

        # 自动执行对手回合直到再次轮到AI
        while self._game.active_player == 1 and not self._game.is_terminal:
            opponent_action = self._get_opponent_action()
            self._game = self._game.apply_action(opponent_action)

        obs = self._get_obs()
        reward = self._calculate_reward()
        terminated = self._game.is_terminal
        truncated = False
        info = self._get_info()

        return obs, reward, terminated, truncated, info

    def _get_obs(self) -> dict:
        """返回观察（向量形式供神经网络使用）"""
        return {
            # 固定部分
            'my_hero_health': self._normalize_health(player.hero.health),
            'my_hero_armor': player.hero.armor,
            'my_mana_current': player.mana.current / 10,
            'my_mana_max': player.mana.max_mana / 10,
            'opponent_hero_health': self._normalize_health(opponent.hero.health),
            'opponent_hero_armor': opponent.hero.armor,
            'turn': self._game.turn / 50,  # 归一化

            # 手牌 - 填充到10张
            'my_hand': self._encode_hand(player.hand),
            'my_hand_mask': [1] * len(player.hand) + [0] * (10 - len(player.hand)),

            # 场上随从 - 填充到7个
            'my_board': self._encode_board(player.board),
            'my_board_mask': [1] * len(player.board) + [0] * (7 - len(player.board)),

            'opponent_board': self._encode_board(opponent.board),
            'opponent_board_mask': [1] * len(opponent.board) + [0] * (7 - len(opponent.board)),

            # 武器、奥秘等
            'my_weapon': self._encode_weapon(player.hero.weapon),
            'opponent_secrets_count': len(opponent.secrets) / 5,
        }

    def _get_legal_actions_mask(self) -> np.ndarray:
        """返回合法行动掩码，用于屏蔽非法动作"""
        mask = np.zeros(self.action_space.n, dtype=np.int8)
        for action in self._game.get_legal_actions():
            mask[self._action_to_id(action)] = 1
        return mask
```

### 观察空间设计

- 所有数值归一化到 [0, 1] 或 [-1, 1]
- 卡牌使用card_id的embedding向量
- 位置敏感（随从前后排顺序重要）

### 行动空间设计

行动编码方案（最大动作数约~5000）：

```
0:              结束回合
1-10:           打出第i张手牌（无目标）
11-80:          打出第i张手牌（选择目标0-6）
81-150:         使用英雄技能（选择目标0-6）
151-220:        随从i攻击敌方英雄
221-360:        随从i攻击敌方随从j
...
```

使用 `legal_actions_mask` 在训练时屏蔽非法动作。

---

## 5. CLI 界面

### 5.1 三种模式

1. **交互模式**：人类玩家对战
2. **观战模式**：两个AI对战，实时显示
3. **日志模式**：纯文本输出，适合批量训练

### 5.2 界面布局（rich实现）

```
┌──────────────────────────────────────────────────────────────┐
│  Hearthstone Battle                                          │
├──────────────────────────────────────────────────────────────┤
│  对手: 法师 (Jaina)              奥秘: [?] [?]               │
│  HP: 25/30 | Armor: 0 | Hand: 4 cards                        │
│  Mana: ○○○○●●●●●● (6/10)  🔥 Spell Damage +1                 │
│                                                               │
│         ┌─────────┐    ┌─────────┐    ┌─────────┐           │
│         │  水元素  │    │  火妖    │    │  法力浮龙│           │
│         │  3/6 🌊  │    │  2/4 🔥  │    │  1/3 ✨  │           │
│         │ 嘲讽     │    │ 法伤+1  │    │         │           │
│         └─────────┘    └─────────┘    └─────────┘           │
│                                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│         ┌─────────┐    ┌─────────┐    ┌─────────┐           │
│         │  银色侍从│    │  砰砰博士│    │  炸弹    │           │
│         │  1/1 🛡️  │    │  7/7 💣  │    │  1/1 💥  │           │
│         │ 圣盾     │    │ 战吼:召唤│    │ 亡语    │           │
│         └─────────┘    └─────────┘    └─────────┘           │
│                                                               │
│  你: 战士 (Garrosh)                                          │
│  HP: 28/30 | Armor: 5 | Hand: 6 cards                        │
│  Mana: ○○●●●●●●●● (8/10)  Weapon: 5/2 血吼 🪓                │
├──────────────────────────────────────────────────────────────┤
│  [0] 结束回合                                                │
│  [1] 使用血吼攻击敌方英雄                                     │
│  [2] 打出 "盾牌格挡" (3费)                                    │
│  [3] 打出 "绝命乱斗" (5费)                                    │
│  [4] 打出 "加尔鲁什的礼物" 选择: [1]嘲讽 [2]冲锋 [3]武器      │
│  [5] 使用英雄技能 (2费): 装备1/3匕首                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. 数据层

### 6.1 卡牌数据来源

使用 [HearthstoneJSON](https://hearthstonejson.com/) 提供的数据：

```python
# 自动下载最新卡牌数据
CARDS_JSON_URL = "https://api.hearthstonejson.com/v1/latest/zhCN/cards.json"

class CardDatabase:
    def __init__(self):
        self._cards: dict[str, CardData] = {}
        self._load_cards()

    def _load_cards(self):
        """加载并解析HearthstoneJSON数据"""
        cards = requests.get(CARDS_JSON_URL).json()
        for card in cards:
            if card.get('type') in ['MINION', 'SPELL', 'WEAPON', 'HERO']:
                self._cards[card['id']] = self._parse_card(card)

    def get_card(self, card_id: str) -> CardData:
        return self._cards[card_id]
```

### 6.2 效果映射

将HearthstoneJSON的`text`字段映射到我们的`CardEffect`：

```python
# 使用正则匹配常见效果模式
EFFECT_PATTERNS = {
    r'造成\s*(\d+)\s*点伤害': lambda m: DamageAction(amount=int(m.group(1))),
    r'抽\s*(\d+)\s*张牌': lambda m: DrawCardsAction(count=int(m.group(1))),
    r'召唤': SummonAction(...),
    # ...
}
```

对于无法自动映射的卡牌，维护手动映射表：

```python
SPECIAL_EFFECTS = {
    'EX1_116': LeeroyJenkinsHandler(),  # 火车王
    'NEW1_030': DeathwingHandler(),     # 死亡之翼
    # ...
}
```

---

## 7. 随机数与确定性

```python
@dataclass(frozen=True)
class RandomState:
    """可序列化的随机数状态"""
    seed: int
    sequence_position: int

class DeterministicRNG:
    """确定性随机数生成器"""

    def __init__(self, seed: int):
        self._rng = random.Random(seed)
        self._call_count = 0

    def random(self) -> float:
        self._call_count += 1
        return self._rng.random()

    def randint(self, a: int, b: int) -> int:
        self._call_count += 1
        return self._rng.randint(a, b)

    def shuffle(self, lst: list):
        self._call_count += 1
        self._rng.shuffle(lst)
        return lst

    def get_state(self) -> RandomState:
        return RandomState(seed=self._rng.getstate()[1][0], sequence_position=self._call_count)

    @classmethod
    def from_state(cls, state: RandomState) -> "DeterministicRNG":
        rng = cls(state.seed)
        # 恢复到指定位置
        for _ in range(state.sequence_position):
            rng._rng.random()
        rng._call_count = state.sequence_position
        return rng
```

---

## 8. 测试策略

### 8.1 单元测试

每张卡牌的效果单独测试：

```python
def test_fireball_deals_damage():
    game = create_game_with_hands(
        hand1=["CS2_029"],  # 火球术
    )
    initial_health = game.players[1].hero.health

    game = game.apply_action(PlayCardAction(
        player=0,
        card_index=0,
        target=TargetReference(Zone.HERO, player=1, index=0)
    ))

    assert game.players[1].hero.health == initial_health - 6
```

### 8.2 集成测试

经典combo场景：

```python
def test_hellfire_kills_doomsayer_triggers_deathrattle():
    """地狱烈焰杀死末日预言者，触发亡语清场"""
    ...
```

### 8.3 回归测试

记录真实对局状态序列，确保版本间行为一致。

### 8.4 随机测试

大量随机对局检测崩溃和规则漏洞。

---

## 9. 项目结构

```
hearthstone_cli/
├── __init__.py
├── engine/
│   ├── __init__.py
│   ├── state.py          # 游戏状态定义
│   ├── actions.py        # 行动定义
│   ├── game.py           # 游戏主逻辑、状态流转
│   ├── phases.py         # 阶段系统
│   ├── targeting.py      # 目标选择逻辑
│   └── random.py         # 确定性随机数
├── cards/
│   ├── __init__.py
│   ├── database.py       # 卡牌数据库
│   ├── effects.py        # 效果系统
│   ├── parser.py         # HearthstoneJSON解析
│   └── special/          # 特殊卡牌处理器
│       ├── __init__.py
│       └── handlers.py
├── env/
│   ├── __init__.py
│   ├── gym_env.py        # Gymnasium环境
│   ├── observation.py    # 观察编码
│   └── reward.py         # 奖励函数
├── cli/
│   ├── __init__.py
│   ├── ui.py             # rich界面
│   ├── renderer.py       # 渲染逻辑
│   └── human_player.py   # 人类玩家输入
└── tests/
    ├── __init__.py
    ├── test_state.py
    ├── test_actions.py
    ├── test_cards.py
    └── test_env.py
```

---

## 10. 关键算法

### 10.1 行动合法性检查

```python
def get_legal_actions(game: GameState, player: int) -> list[Action]:
    """获取当前所有合法行动"""
    actions = [EndTurnAction(player)]

    player_state = game.players[player]

    # 可打出的手牌
    for i, card in enumerate(player_state.hand):
        if card.cost <= player_state.mana.current:
            targets = get_valid_targets(game, card)
            if targets:
                for target in targets:
                    actions.append(PlayCardAction(player, i, target))
            else:
                actions.append(PlayCardAction(player, i, None))

    # 可攻击的随从
    for i, minion in enumerate(player_state.board):
        if can_attack(minion):
            # 敌方有嘲讽必须先攻嘲讽
            taunts = get_taunts(game.players[1 - player].board)
            if taunts:
                for t in taunts:
                    actions.append(AttackAction(player, EntityRef.board(player, i), t))
            else:
                actions.append(AttackAction(player, EntityRef.board(player, i), EntityRef.hero(1-player)))
                for j, _ in enumerate(game.players[1-player].board):
                    actions.append(AttackAction(player, EntityRef.board(player, i), EntityRef.board(1-player, j)))

    # 英雄技能
    if can_use_hero_power(player_state):
        targets = get_hero_power_targets(game, player)
        if targets:
            for target in targets:
                actions.append(HeroPowerAction(player, target))
        else:
            actions.append(HeroPowerAction(player, None))

    return actions
```

### 10.2 状态应用（纯函数式）

```python
@dataclass(frozen=True)
class GameState:
    ...

    def apply_action(self, action: Action) -> "GameState":
        """应用行动，返回新状态"""
        # 使用访问者模式处理不同类型行动
        return ActionVisitor.visit(action, self)

class ActionVisitor:
    @staticmethod
    def visit(action: Action, state: GameState) -> GameState:
        if isinstance(action, PlayCardAction):
            return state._apply_play_card(action)
        elif isinstance(action, AttackAction):
            return state._apply_attack(action)
        elif isinstance(action, EndTurnAction):
            return state._apply_end_turn(action)
        ...
```

---

## 11. 实现优先级

1. **Phase 1**: 基础状态系统 + 随从交换
2. **Phase 2**: 法术系统 + 战吼
3. **Phase 3**: 奥秘 + 亡语
4. **Phase 4**: 武器 + 英雄技能
5. **Phase 5**: 复杂机制（风怒、圣盾、免疫等）
6. **Phase 6**: Gymnasium接口
7. **Phase 7**: CLI界面
8. **Phase 8**: 性能优化 + 完整卡牌支持

---

*设计完成日期: 2026-03-03*
