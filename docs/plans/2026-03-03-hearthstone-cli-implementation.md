# 炉石传说 CLI 游戏实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 实现炉石传说标准对战的核心游戏引擎，支持随从交换、法术释放、战吼效果，并提供Gymnasium接口和CLI界面。

**Architecture:** 分层架构，游戏引擎与表示层解耦，状态使用frozen dataclass纯函数式更新，支持完全序列化和确定性复现。

**Tech Stack:** Python 3.10+, pytest, rich, gymnasium, requests

---

## Task 1: 项目初始化和依赖配置

**Files:**
- Create: `pyproject.toml`
- Create: `requirements.txt`
- Create: `.gitignore`

**Step 1: Create pyproject.toml**

```toml
[project]
name = "hearthstone-cli"
version = "0.1.0"
description = "Hearthstone CLI game with AI training environment"
requires-python = ">=3.10"
dependencies = [
    "rich>=13.0.0",
    "gymnasium>=0.29.0",
    "numpy>=1.24.0",
    "requests>=2.31.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "black>=23.0.0",
    "mypy>=1.5.0",
]

[tool.pytest.ini_options]
testpaths = ["hearthstone_cli/tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]

[tool.black]
line-length = 100
target-version = ['py310']

[tool.mypy]
python_version = "3.10"
strict = true
warn_return_any = true
warn_unused_configs = true
```

**Step 2: Create requirements.txt**

```
rich>=13.0.0
gymnasium>=0.29.0
numpy>=1.24.0
requests>=2.31.0
pytest>=7.4.0
```

**Step 3: Create .gitignore**

```gitignore
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.pytest_cache/
.coverage
htmlcov/
.venv/
venv/
ENV/
*.swp
*.swo
*~
.DS_Store
```

**Step 4: Create directory structure**

Run: `mkdir -p hearthstone_cli/{engine,cards,env,cli,tests}`

**Step 5: Create __init__.py files**

Create empty `__init__.py` in each package directory.

**Step 6: Commit**

```bash
git add pyproject.toml requirements.txt .gitignore hearthstone_cli/
git commit -m "chore: initialize project structure"
```

---

## Task 2: 核心状态定义 - 基础数据结构

**Files:**
- Create: `hearthstone_cli/engine/state.py`
- Test: `hearthstone_cli/tests/test_state.py`

**Step 1: Write the failing test**

```python
# hearthstone_cli/tests/test_state.py
import pytest
from dataclasses import replace
from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Card
)


def test_game_state_is_frozen():
    """游戏状态应该是不可变的"""
    state = GameState.create_new(seed=42)
    with pytest.raises(AttributeError):
        state.turn = 2


def test_player_state_creation():
    """玩家状态可以正确创建"""
    hero = HeroState(health=30, max_health=30, armor=0)
    mana = ManaState(current=1, max_mana=1, overload=0, locked=0)
    player = PlayerState(
        hero=hero,
        mana=mana,
        deck=(),
        hand=(),
        board=(),
        secrets=frozenset(),
        graveyard=(),
        exhausted_minions=frozenset(),
        hero_power_used=False,
    )
    assert player.hero.health == 30
    assert player.mana.current == 1


def test_mana_state_cannot_exceed_max():
    """水晶不能超过上限"""
    mana = ManaState(current=10, max_mana=10)
    assert mana.current == 10


def test_minion_has_correct_stats():
    """随从有正确的属性"""
    minion = Minion(
        card_id="CS2_121",
        attack=2,
        health=2,
        max_health=2,
        attributes=frozenset(),
        enchantments=(),
        damage_taken=0,
        summoned_this_turn=True,
        exhausted=True,
    )
    assert minion.attack == 2
    assert minion.health == 2
```

**Step 2: Run test to verify it fails**

Run: `pytest hearthstone_cli/tests/test_state.py -v`

Expected: FAIL with "ModuleNotFoundError: No module named 'hearthstone_cli.engine.state'"

**Step 3: Write minimal implementation**

```python
# hearthstone_cli/engine/state.py
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, Tuple, FrozenSet
from enum import Enum, auto


class Zone(Enum):
    """游戏区域"""
    DECK = auto()
    HAND = auto()
    BOARD = auto()
    GRAVEYARD = auto()
    HERO = auto()
    WEAPON = auto()


class Attribute(Enum):
    """随从属性"""
    TAUNT = auto()          # 嘲讽
    DIVINE_SHIELD = auto()  # 圣盾
    WINDFURY = auto()       # 风怒
    CHARGE = auto()         # 冲锋
    STEALTH = auto()        # 潜行
    POISONOUS = auto()      # 剧毒
    LIFESTEAL = auto()      # 吸血
    ELUSIVE = auto()        # 魔免（无法成为法术/英雄技能目标）


@dataclass(frozen=True)
class HeroState:
    """英雄状态"""
    health: int
    max_health: int = 30
    armor: int = 0
    weapon: Optional[WeaponState] = None


@dataclass(frozen=True)
class WeaponState:
    """武器状态"""
    card_id: str
    attack: int
    durability: int
    max_durability: int
    attributes: FrozenSet[Attribute] = field(default_factory=frozenset)


@dataclass(frozen=True)
class ManaState:
    """法力水晶状态"""
    current: int
    max_mana: int
    overload: int = 0       # 下回合过载
    locked: int = 0         # 本回合锁定


@dataclass(frozen=True)
class Enchantment:
    """附魔（临时效果）"""
    source: str
    attack_bonus: int = 0
    health_bonus: int = 0
    one_turn: bool = False  # 是否只持续一回合


@dataclass(frozen=True)
class Minion:
    """随从状态"""
    card_id: str
    attack: int
    health: int
    max_health: int
    attributes: FrozenSet[Attribute]
    enchantments: Tuple[Enchantment, ...]
    damage_taken: int
    summoned_this_turn: bool
    exhausted: bool  # 本回合已攻击

    @property
    def is_alive(self) -> bool:
        return self.health > 0


@dataclass(frozen=True)
class Card:
    """卡牌"""
    card_id: str
    name: str
    cost: int
    card_type: str  # MINION, SPELL, WEAPON
    attack: Optional[int] = None
    health: Optional[int] = None
    durability: Optional[int] = None
    attributes: FrozenSet[Attribute] = field(default_factory=frozenset)


@dataclass(frozen=True)
class Secret:
    """奥秘"""
    card_id: str


@dataclass(frozen=True)
class PlayerState:
    """玩家状态"""
    hero: HeroState
    mana: ManaState
    deck: Tuple[Card, ...]
    hand: Tuple[Card, ...]
    board: Tuple[Minion, ...]
    secrets: FrozenSet[Secret]
    graveyard: Tuple[Card, ...]
    exhausted_minions: FrozenSet[int]  # 本回合已攻击的随从索引
    hero_power_used: bool


@dataclass(frozen=True)
class RandomState:
    """可序列化的随机数状态"""
    seed: int
    sequence_position: int = 0


@dataclass(frozen=True)
class GameState:
    """游戏状态"""
    turn: int
    active_player: int  # 0 或 1
    players: Tuple[PlayerState, PlayerState]
    action_history: Tuple  # Action元组，稍后定义
    rng_state: RandomState
    phase_stack: Tuple  # Phase元组，稍后定义

    @classmethod
    def create_new(cls, seed: int = 42) -> "GameState":
        """创建新游戏状态（用于测试）"""
        # 临时实现，后续完善
        hero = HeroState(health=30)
        mana = ManaState(current=1, max_mana=1)
        player = PlayerState(
            hero=hero,
            mana=mana,
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            exhausted_minions=frozenset(),
            hero_power_used=False,
        )
        return cls(
            turn=1,
            active_player=0,
            players=(player, player),
            action_history=(),
            rng_state=RandomState(seed=seed),
            phase_stack=(),
        )
```

**Step 4: Run test to verify it passes**

Run: `pytest hearthstone_cli/tests/test_state.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone_cli/engine/state.py hearthstone_cli/tests/test_state.py
git commit -m "feat: add core state definitions (GameState, PlayerState, Minion, etc.)"
```

---

## Task 3: 确定性随机数生成器

**Files:**
- Create: `hearthstone_cli/engine/random.py`
- Test: `hearthstone_cli/tests/test_random.py`

**Step 1: Write the failing test**

```python
# hearthstone_cli/tests/test_random.py
import pytest
from hearthstone_cli.engine.random import DeterministicRNG
from hearthstone_cli.engine.state import RandomState


def test_rng_produces_deterministic_sequence():
    """相同种子产生相同序列"""
    rng1 = DeterministicRNG(seed=42)
    rng2 = DeterministicRNG(seed=42)

    seq1 = [rng1.random() for _ in range(10)]
    seq2 = [rng2.random() for _ in range(10)]

    assert seq1 == seq2


def test_rng_produces_different_sequences_with_different_seeds():
    """不同种子产生不同序列"""
    rng1 = DeterministicRNG(seed=42)
    rng2 = DeterministicRNG(seed=43)

    seq1 = [rng1.random() for _ in range(10)]
    seq2 = [rng2.random() for _ in range(10)]

    assert seq1 != seq2


def test_rng_randint_range():
    """randint产生指定范围的整数"""
    rng = DeterministicRNG(seed=42)

    for _ in range(100):
        value = rng.randint(1, 6)
        assert 1 <= value <= 6


def test_rng_shuffle_changes_order():
    """shuffle改变列表顺序"""
    rng = DeterministicRNG(seed=42)

    original = [1, 2, 3, 4, 5]
    shuffled = original.copy()
    rng.shuffle(shuffled)

    assert len(shuffled) == len(original)
    assert set(shuffled) == set(original)
    assert shuffled != original  # 大概率不同


def test_rng_state_can_be_saved_and_restored():
    """随机状态可以保存和恢复"""
    rng = DeterministicRNG(seed=42)

    # 生成几个随机数
    _ = rng.random()
    _ = rng.random()

    # 保存状态
    state = rng.get_state()

    # 继续生成
    next_value = rng.random()

    # 从保存状态恢复
    rng2 = DeterministicRNG.from_state(state)
    restored_value = rng2.random()

    assert restored_value == next_value


def test_rng_state_is_serializable():
    """状态可以序列化"""
    rng = DeterministicRNG(seed=42)
    rng.random()
    rng.randint(1, 10)

    state = rng.get_state()

    # RandomState应该是可哈希的（用于frozen dataclass）
    assert hash(state) is not None
```

**Step 2: Run test to verify it fails**

Run: `pytest hearthstone_cli/tests/test_random.py -v`

Expected: FAIL with "ModuleNotFoundError"

**Step 3: Write minimal implementation**

```python
# hearthstone_cli/engine/random.py
import random
from typing import List
from dataclasses import dataclass
from hearthstone_cli.engine.state import RandomState


class DeterministicRNG:
    """确定性随机数生成器

    确保相同种子产生完全相同的序列，支持状态保存和恢复。
    这对AI训练和复现对局至关重要。
    """

    def __init__(self, seed: int):
        self._rng = random.Random(seed)
        self._call_count = 0
        self._seed = seed

    def random(self) -> float:
        """生成[0, 1)范围的随机浮点数"""
        self._call_count += 1
        return self._rng.random()

    def randint(self, a: int, b: int) -> int:
        """生成[a, b]范围的随机整数"""
        self._call_count += 1
        return self._rng.randint(a, b)

    def choice(self, seq: List):
        """从序列中随机选择"""
        self._call_count += 1
        return self._rng.choice(seq)

    def shuffle(self, lst: List) -> None:
        """随机打乱列表（原地）"""
        self._call_count += 1
        self._rng.shuffle(lst)

    def sample(self, population: List, k: int) -> List:
        """无放回抽样"""
        self._call_count += 1
        return self._rng.sample(population, k)

    def get_state(self) -> RandomState:
        """获取当前状态（可序列化）"""
        return RandomState(
            seed=self._seed,
            sequence_position=self._call_count
        )

    @classmethod
    def from_state(cls, state: RandomState) -> "DeterministicRNG":
        """从保存的状态恢复"""
        rng = cls(state.seed)
        # 恢复到指定位置
        for _ in range(state.sequence_position):
            rng._rng.random()
        rng._call_count = state.sequence_position
        return rng
```

**Step 4: Run test to verify it passes**

Run: `pytest hearthstone_cli/tests/test_random.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone_cli/engine/random.py hearthstone_cli/tests/test_random.py
git commit -m "feat: add deterministic RNG for reproducible games"
```

---

## Task 4: 行动定义系统

**Files:**
- Create: `hearthstone_cli/engine/actions.py`
- Test: `hearthstone_cli/tests/test_actions.py`

**Step 1: Write the failing test**

```python
# hearthstone_cli/tests/test_actions.py
import pytest
from hearthstone_cli.engine.actions import (
    PlayCardAction, AttackAction, HeroPowerAction, EndTurnAction,
    TargetReference, Zone
)


def test_play_card_action_creation():
    """可以创建打出卡牌行动"""
    target = TargetReference(Zone.HERO, player=1, index=0)
    action = PlayCardAction(
        player=0,
        card_index=2,
        target=target,
        board_position=3
    )
    assert action.player == 0
    assert action.card_index == 2
    assert action.target.player == 1
    assert action.board_position == 3


def test_attack_action_creation():
    """可以创建攻击行动"""
    attacker = TargetReference(Zone.BOARD, player=0, index=0)
    defender = TargetReference(Zone.BOARD, player=1, index=1)
    action = AttackAction(
        player=0,
        attacker=attacker,
        defender=defender
    )
    assert action.attacker.zone == Zone.BOARD
    assert action.defender.player == 1


def test_end_turn_action():
    """结束回合行动"""
    action = EndTurnAction(player=0)
    assert action.player == 0


def test_actions_are_frozen():
    """行动是不可变的"""
    action = EndTurnAction(player=0)
    with pytest.raises(AttributeError):
        action.player = 1


def test_target_reference_equality():
    """目标引用可以比较相等"""
    t1 = TargetReference(Zone.HERO, player=0, index=0)
    t2 = TargetReference(Zone.HERO, player=0, index=0)
    t3 = TargetReference(Zone.BOARD, player=0, index=0)

    assert t1 == t2
    assert t1 != t3
```

**Step 2: Run test to verify it fails**

Run: `pytest hearthstone_cli/tests/test_actions.py -v`

Expected: FAIL

**Step 3: Write minimal implementation**

```python
# hearthstone_cli/engine/actions.py
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
from enum import Enum, auto


class Zone(Enum):
    """游戏区域"""
    DECK = auto()
    HAND = auto()
    BOARD = auto()
    GRAVEYARD = auto()
    HERO = auto()
    WEAPON = auto()
    HERO_POWER = auto()


@dataclass(frozen=True)
class TargetReference:
    """指向游戏实体的引用

    支持序列化，用于在Action中指定目标。
    """
    zone: Zone
    player: int  # 0 或 1
    index: int   # 在zone中的位置（英雄通常为0）

    @classmethod
    def hero(cls, player: int) -> "TargetReference":
        """快捷创建英雄目标"""
        return cls(zone=Zone.HERO, player=player, index=0)

    @classmethod
    def board(cls, player: int, index: int) -> "TargetReference":
        """快捷创建场上随从目标"""
        return cls(zone=Zone.BOARD, player=player, index=index)

    @classmethod
    def hand(cls, player: int, index: int) -> "TargetReference":
        """快捷创建手牌目标"""
        return cls(zone=Zone.HAND, player=player, index=index)


@dataclass(frozen=True)
class Action:
    """行动基类"""
    player: int


@dataclass(frozen=True)
class PlayCardAction(Action):
    """打出卡牌"""
    card_index: int                # 手牌中的位置
    target: Optional[TargetReference]  # 目标（如果有）
    board_position: int = 0        # 随从放置位置（0-6）


@dataclass(frozen=True)
class AttackAction(Action):
    """攻击"""
    attacker: TargetReference      # 攻击者（英雄或随从）
    defender: TargetReference      # 防御者


@dataclass(frozen=True)
class HeroPowerAction(Action):
    """使用英雄技能"""
    target: Optional[TargetReference]


@dataclass(frozen=True)
class EndTurnAction(Action):
    """结束回合"""
    pass
```

**Step 4: Run test to verify it passes**

Run: `pytest hearthstone_cli/tests/test_actions.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone_cli/engine/actions.py hearthstone_cli/tests/test_actions.py
git commit -m "feat: add action definitions (PlayCard, Attack, HeroPower, EndTurn)"
```

---

## Task 5: 游戏状态更新（纯函数式）

**Files:**
- Create: `hearthstone_cli/engine/game.py`
- Test: `hearthstone_cli/tests/test_game.py`

**Step 1: Write the failing test**

```python
# hearthstone_cli/tests/test_game.py
import pytest
from dataclasses import replace
from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Card, Attribute
)
from hearthstone_cli.engine.actions import (
    EndTurnAction, AttackAction, TargetReference, Zone
)
from hearthstone_cli.engine.game import GameLogic


def test_end_turn_switches_active_player():
    """结束回合切换当前玩家"""
    state = GameState.create_new(seed=42)
    assert state.active_player == 0

    new_state = GameLogic.apply_action(state, EndTurnAction(player=0))

    assert new_state.active_player == 1
    assert new_state.turn == 1  # 第一个回合还没完


def test_player_with_minion_can_attack():
    """有随从的玩家可以攻击"""
    # 创建一个状态，玩家0有随从
    minion = Minion(
        card_id="CS2_121",
        attack=2,
        health=2,
        max_health=2,
        attributes=frozenset(),
        enchantments=(),
        damage_taken=0,
        summoned_this_turn=False,  # 不是本回合召唤的
        exhausted=False,  # 未攻击
    )

    state = GameState.create_new(seed=42)
    player0 = replace(state.players[0], board=(minion,))
    state = replace(state, players=(player0, state.players[1]))

    # 获取合法行动
    actions = GameLogic.get_legal_actions(state, player=0)

    # 应该有攻击行动
    attack_actions = [a for a in actions if isinstance(a, AttackAction)]
    assert len(attack_actions) > 0


def test_newly_summoned_minion_cannot_attack():
    """新召唤的随从本回合不能攻击"""
    minion = Minion(
        card_id="CS2_121",
        attack=2,
        health=2,
        max_health=2,
        attributes=frozenset(),
        enchantments=(),
        damage_taken=0,
        summoned_this_turn=True,  # 本回合召唤的
        exhausted=True,
    )

    state = GameState.create_new(seed=42)
    player0 = replace(state.players[0], board=(minion,))
    state = replace(state, players=(player0, state.players[1]))

    actions = GameLogic.get_legal_actions(state, player=0)

    # 不应该有攻击行动（非冲锋随从本回合不能攻击）
    attack_actions = [a for a in actions if isinstance(a, AttackAction)]
    assert len(attack_actions) == 0


def test_charge_minion_can_attack_immediately():
    """冲锋随从可以立即攻击"""
    minion = Minion(
        card_id="CS2_103",  # 冲锋随从示例
        attack=2,
        health=2,
        max_health=2,
        attributes=frozenset({Attribute.CHARGE}),
        enchantments=(),
        damage_taken=0,
        summoned_this_turn=True,
        exhausted=False,
    )

    state = GameState.create_new(seed=42)
    player0 = replace(state.players[0], board=(minion,))
    state = replace(state, players=(player0, state.players[1]))

    actions = GameLogic.get_legal_actions(state, player=0)

    attack_actions = [a for a in actions if isinstance(a, AttackAction)]
    assert len(attack_actions) > 0
```

**Step 2: Run test to verify it fails**

Run: `pytest hearthstone_cli/tests/test_game.py -v`

Expected: FAIL

**Step 3: Write minimal implementation**

```python
# hearthstone_cli/engine/game.py
from __future__ import annotations
from dataclasses import replace
from typing import List, Optional, Tuple

from hearthstone_cli.engine.state import (
    GameState, PlayerState, Minion, Attribute, Zone
)
from hearthstone_cli.engine.actions import (
    Action, PlayCardAction, AttackAction, HeroPowerAction, EndTurnAction,
    TargetReference
)


class GameLogic:
    """游戏逻辑核心

    纯静态方法，所有操作都是纯函数（输入状态->输出新状态）
    """

    @classmethod
    def apply_action(cls, state: GameState, action: Action) -> GameState:
        """应用行动，返回新状态"""
        if isinstance(action, EndTurnAction):
            return cls._apply_end_turn(state, action)
        elif isinstance(action, AttackAction):
            return cls._apply_attack(state, action)
        else:
            # 其他行动类型后续实现
            return state

    @classmethod
    def _apply_end_turn(cls, state: GameState, action: EndTurnAction) -> GameState:
        """应用结束回合"""
        # 切换当前玩家
        new_active = 1 - state.active_player

        # 如果切换到玩家0，回合数+1
        new_turn = state.turn + (1 if new_active == 0 else 0)

        # 重置新活跃玩家的状态
        players = list(state.players)
        current = players[new_active]

        # 重置水晶
        new_max = min(10, current.mana.max_mana + 1)
        new_mana = ManaState(
            current=new_max,
            max_mana=new_max,
            overload=0,
            locked=0
        )

        # 重置英雄技能
        # 重置随从疲劳状态
        new_board = tuple(
            replace(m, exhausted=False, summoned_this_turn=False)
            for m in current.board
        )

        players[new_active] = replace(
            current,
            mana=new_mana,
            hero_power_used=False,
            exhausted_minions=frozenset(),
            board=new_board
        )

        return replace(
            state,
            turn=new_turn,
            active_player=new_active,
            players=tuple(players)
        )

    @classmethod
    def _apply_attack(cls, state: GameState, action: AttackAction) -> GameState:
        """应用攻击（简化版，仅处理随从攻击）"""
        players = list(state.players)
        attacker_player = players[action.player]
        defender_player = players[1 - action.player]

        # 获取攻击者
        if action.attacker.zone == Zone.BOARD:
            attacker_idx = action.attacker.index
            attacker = attacker_player.board[attacker_idx]
        else:
            # 英雄攻击（后续实现）
            return state

        # 获取防御者
        if action.defender.zone == Zone.BOARD:
            defender_idx = action.defender.index
            defender = defender_player.board[defender_idx]
        elif action.defender.zone == Zone.HERO:
            defender = None
            defender_health = defender_player.hero.health
        else:
            return state

        # 计算伤害
        attacker_attack = attacker.attack
        defender_attack = defender.attack if defender else 0

        # 更新攻击者（受到反击伤害）
        if defender:
            new_attacker = replace(attacker, damage_taken=attacker.damage_taken + defender_attack)
            new_board = list(attacker_player.board)
            new_board[attacker_idx] = new_attacker
            attacker_player = replace(attacker_player, board=tuple(new_board))

        # 更新防御者
        if defender:
            new_defender = replace(defender, damage_taken=defender.damage_taken + attacker_attack)
            new_board = list(defender_player.board)
            new_board[defender_idx] = new_defender
            defender_player = replace(defender_player, board=tuple(new_board))
        else:
            # 攻击英雄
            new_hero = replace(defender_player.hero, health=defender_health - attacker_attack)
            defender_player = replace(defender_player, hero=new_hero)

        # 标记攻击者已疲劳
        exhausted = set(attacker_player.exhausted_minions)
        exhausted.add(attacker_idx)
        attacker_player = replace(attacker_player, exhausted_minions=frozenset(exhausted))

        # 更新玩家状态
        players[action.player] = attacker_player
        players[1 - action.player] = defender_player

        return replace(state, players=tuple(players))

    @classmethod
    def get_legal_actions(cls, state: GameState, player: int) -> List[Action]:
        """获取玩家所有合法行动"""
        actions: List[Action] = [EndTurnAction(player=player)]

        if state.active_player != player:
            return actions

        player_state = state.players[player]

        # 可以攻击的随从
        for i, minion in enumerate(player_state.board):
            if cls._can_attack(minion, player_state):
                # 如果没有嘲讽，可以攻击英雄或任何随从
                enemy = state.players[1 - player]
                taunts = [j for j, m in enumerate(enemy.board) if Attribute.TAUNT in m.attributes]

                if taunts:
                    # 必须先攻击嘲讽
                    for t in taunts:
                        actions.append(AttackAction(
                            player=player,
                            attacker=TargetReference.board(player, i),
                            defender=TargetReference.board(1 - player, t)
                        ))
                else:
                    # 可以攻击英雄
                    actions.append(AttackAction(
                        player=player,
                        attacker=TargetReference.board(player, i),
                        defender=TargetReference.hero(1 - player)
                    ))
                    # 可以攻击敌方随从
                    for j, _ in enumerate(enemy.board):
                        actions.append(AttackAction(
                            player=player,
                            attacker=TargetReference.board(player, i),
                            defender=TargetReference.board(1 - player, j)
                        ))

        return actions

    @classmethod
    def _can_attack(cls, minion: Minion, player: PlayerState) -> bool:
        """检查随从是否可以攻击"""
        # 必须有攻击力
        if minion.attack <= 0:
            return False

        # 有冲锋可以直接攻击
        if Attribute.CHARGE in minion.attributes:
            return not minion.exhausted

        # 否则必须不是本回合召唤的
        if minion.summoned_this_turn:
            return False

        # 不能已经攻击过
        return not minion.exhausted


# 需要导入replace
from dataclasses import replace
```

**Step 4: Fix import issues**

```python
# Add ManaState to imports in game.py
from hearthstone_cli.engine.state import (
    GameState, PlayerState, Minion, Attribute, Zone, ManaState
)
```

**Step 5: Run test to verify it passes**

Run: `pytest hearthstone_cli/tests/test_game.py -v`

Expected: PASS (或部分PASS，需要调整)

**Step 6: Commit**

```bash
git add hearthstone_cli/engine/game.py hearthstone_cli/tests/test_game.py
git commit -m "feat: add basic game logic (end turn, attack, legal actions)"
```

---

## Task 6: 卡牌数据库和效果系统（基础）

**Files:**
- Create: `hearthstone_cli/cards/data.py`（卡牌数据定义）
- Create: `hearthstone_cli/cards/effects.py`（效果系统）
- Create: `hearthstone_cli/cards/database.py`（数据库）
- Test: `hearthstone_cli/tests/test_cards.py`

**Step 1: Write the failing test**

```python
# hearthstone_cli/tests/test_cards.py
import pytest
from hearthstone_cli.cards.data import CardData, CardType, Rarity
from hearthstone_cli.cards.effects import DamageEffect, DrawEffect
from hearthstone_cli.cards.database import CardDatabase


def test_card_data_creation():
    """可以创建卡牌数据"""
    card = CardData(
        card_id="CS2_029",
        name="Fireball",
        cost=4,
        card_type=CardType.SPELL,
        rarity=Rarity.BASIC,
        text="Deal 6 damage.",
        effect=DamageEffect(amount=6, target_selector="target")
    )
    assert card.card_id == "CS2_029"
    assert card.cost == 4


def test_damage_effect_properties():
    """伤害效果有正确的属性"""
    effect = DamageEffect(amount=6, target_selector="target")
    assert effect.amount == 6
    assert effect.target_selector == "target"


def test_draw_effect_properties():
    """抽牌效果有正确的属性"""
    effect = DrawEffect(count=2, target_player="friendly")
    assert effect.count == 2
    assert effect.target_player == "friendly"


def test_card_database_singleton():
    """卡牌数据库是单例"""
    db1 = CardDatabase()
    db2 = CardDatabase()
    assert db1 is db2


def test_database_get_card():
    """可以从数据库获取卡牌"""
    db = CardDatabase()
    # 先添加测试卡牌
    test_card = CardData(
        card_id="TEST_001",
        name="Test Card",
        cost=1,
        card_type=CardType.MINION,
        rarity=Rarity.COMMON,
        attack=1,
        health=1
    )
    db._cards["TEST_001"] = test_card

    card = db.get_card("TEST_001")
    assert card.name == "Test Card"
```

**Step 2: Run test to verify it fails**

Run: `pytest hearthstone_cli/tests/test_cards.py -v`

Expected: FAIL

**Step 3: Write minimal implementation**

```python
# hearthstone_cli/cards/data.py
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional, Any
from enum import Enum, auto


class CardType(Enum):
    """卡牌类型"""
    MINION = "MINION"
    SPELL = "SPELL"
    WEAPON = "WEAPON"
    HERO = "HERO"
    HERO_POWER = "HERO_POWER"


class Rarity(Enum):
    """稀有度"""
    FREE = "FREE"
    BASIC = "BASIC"
    COMMON = "COMMON"
    RARE = "RARE"
    EPIC = "EPIC"
    LEGENDARY = "LEGENDARY"


class Class(Enum):
    """职业"""
    NEUTRAL = "NEUTRAL"
    WARRIOR = "WARRIOR"
    SHAMAN = "SHAMAN"
    ROGUE = "ROGUE"
    PALADIN = "PALADIN"
    HUNTER = "HUNTER"
    DRUID = "DRUID"
    WARLOCK = "WARLOCK"
    MAGE = "MAGE"
    PRIEST = "PRIEST"
    DEMONHUNTER = "DEMONHUNTER"


@dataclass(frozen=True)
class CardData:
    """卡牌数据定义"""
    card_id: str
    name: str
    cost: int
    card_type: CardType
    rarity: Rarity
    text: str = ""
    player_class: Class = Class.NEUTRAL

    # 随从属性
    attack: Optional[int] = None
    health: Optional[int] = None
    attributes: frozenset = field(default_factory=frozenset)

    # 武器属性
    durability: Optional[int] = None

    # 效果（可以是解释器模式描述或特殊处理器）
    effect: Optional[Any] = None

    # 战吼、亡语等（暂时简化为单一effect）
    battlecry: Optional[Any] = None
    deathrattle: Optional[Any] = None
```

```python
# hearthstone_cli/cards/effects.py
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class DamageEffect:
    """造成伤害效果"""
    amount: int
    target_selector: str  # "target", "all_enemies", "random_enemy", etc.
    is_spell_damage: bool = False


@dataclass(frozen=True)
class DrawEffect:
    """抽牌效果"""
    count: int
    target_player: str  # "friendly", "enemy", "both"


@dataclass(frozen=True)
class SummonEffect:
    """召唤效果"""
    card_id: str
    count: int = 1
    position: str = "random"  # "random", "rightmost"


@dataclass(frozen=True)
class BuffEffect:
    """增益效果"""
    attack_delta: int = 0
    health_delta: int = 0
    target_selector: str = "self"
    one_turn: bool = False  # 是否只持续一回合


@dataclass(frozen=True)
class HealEffect:
    """治疗效果"""
    amount: int
    target_selector: str


@dataclass(frozen=True)
class DestroyEffect:
    """消灭效果"""
    target_selector: str


@dataclass(frozen=True)
class GainArmorEffect:
    """获得护甲效果"""
    amount: int


@dataclass(frozen=True)
class GainManaEffect:
    """获得法力水晶效果"""
    amount: int
    empty: bool = False  # 空水晶vs满水晶


@dataclass(frozen=True)
class EquipWeaponEffect:
    """装备武器效果"""
    card_id: str
```

```python
# hearthstone_cli/cards/database.py
from __future__ import annotations
from typing import Dict, Optional
from hearthstone_cli.cards.data import CardData


class CardDatabase:
    """卡牌数据库（单例模式）"""
    _instance: Optional[CardDatabase] = None
    _cards: Dict[str, CardData] = {}

    def __new__(cls) -> CardDatabase:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._cards = {}
        return cls._instance

    def get_card(self, card_id: str) -> Optional[CardData]:
        """获取卡牌数据"""
        return self._cards.get(card_id)

    def add_card(self, card: CardData) -> None:
        """添加卡牌到数据库"""
        self._cards[card.card_id] = card

    def load_from_hearthstonejson(self, path: Optional[str] = None) -> None:
        """从HearthstoneJSON加载卡牌数据"""
        # 后续实现从网络或本地文件加载
        pass

    def get_all_cards(self) -> Dict[str, CardData]:
        """获取所有卡牌"""
        return self._cards.copy()

    def get_cards_by_class(self, player_class: str) -> list[CardData]:
        """按职业获取卡牌"""
        return [c for c in self._cards.values() if c.player_class.value == player_class]

    def get_cards_by_type(self, card_type: str) -> list[CardData]:
        """按类型获取卡牌"""
        return [c for c in self._cards.values() if c.card_type.value == card_type]
```

**Step 4: Run test to verify it passes**

Run: `pytest hearthstone_cli/tests/test_cards.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone_cli/cards/ hearthstone_cli/tests/test_cards.py
git commit -m "feat: add card database and basic effect system"
```

---

## Task 7: 完整游戏初始化（包含卡组和对局开始逻辑）

**Files:**
- Modify: `hearthstone_cli/engine/game.py`
- Create: `hearthstone_cli/engine/deck.py`
- Test: `hearthstone_cli/tests/test_game_full.py`

**Step 1: Write the failing test**

```python
# hearthstone_cli/tests/test_game_full.py
import pytest
from hearthstone_cli.engine.state import GameState, PlayerState
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.data import CardData, CardType, Rarity


def test_create_game_with_decks():
    """可以用卡组创建游戏"""
    # 创建测试卡牌
    db = CardDatabase()
    db.add_card(CardData(
        card_id="TEST_MINION",
        name="Test Minion",
        cost=2,
        card_type=CardType.MINION,
        rarity=Rarity.COMMON,
        attack=2,
        health=2
    ))

    # 创建卡组（30张相同卡牌用于测试）
    deck = Deck(["TEST_MINION"] * 30)

    game = GameLogic.create_game(deck1=deck, deck2=deck, seed=42)

    assert game.turn == 1
    assert game.active_player == 0
    assert len(game.players[0].deck) == 26  # 30 - 3张初始手牌 - 1张硬币（后手）
    assert len(game.players[1].deck) == 26


def test_initial_hand_size():
    """初始手牌数量正确"""
    db = CardDatabase()
    db.add_card(CardData(
        card_id="TEST_CARD",
        name="Test",
        cost=1,
        card_type=CardType.MINION,
        rarity=Rarity.COMMON,
        attack=1,
        health=1
    ))

    deck = Deck(["TEST_CARD"] * 30)
    game = GameLogic.create_game(deck1=deck, deck2=deck, seed=42)

    # 先手3张，后手4张（含硬币）
    assert len(game.players[0].hand) == 3
    assert len(game.players[1].hand) == 4


def test_game_is_terminal_when_hero_dies():
    """英雄死亡游戏结束"""
    from dataclasses import replace
    from hearthstone_cli.engine.state import HeroState, ManaState, Minion
    from hearthstone_cli.engine.actions import AttackAction, TargetReference

    # 创建一个即将死亡的游戏状态
    db = CardDatabase()
    db.add_card(CardData(
        card_id="BIG_MINION",
        name="Big Minion",
        cost=10,
        card_type=CardType.MINION,
        rarity=Rarity.LEGENDARY,
        attack=30,
        health=30
    ))

    # 创建有随从的状态
    minion = Minion(
        card_id="BIG_MINION",
        attack=30,
        health=30,
        max_health=30,
        attributes=frozenset(),
        enchantments=(),
        damage_taken=0,
        summoned_this_turn=False,
        exhausted=False,
    )

    game = GameState.create_new(seed=42)
    player0 = replace(game.players[0], board=(minion,))
    player1 = replace(game.players[1], hero=HeroState(health=30))
    game = replace(game, players=(player0, player1))

    # 攻击敌方英雄
    action = AttackAction(
        player=0,
        attacker=TargetReference.board(0, 0),
        defender=TargetReference.hero(1)
    )
    new_game = GameLogic.apply_action(game, action)

    # 检查游戏是否结束
    assert GameLogic.is_terminal(new_game) == True
    assert GameLogic.get_winner(new_game) == 0
```

**Step 2: Run test to verify it fails**

Run: `pytest hearthstone_cli/tests/test_game_full.py -v`

Expected: FAIL

**Step 3: Write minimal implementation**

```python
# hearthstone_cli/engine/deck.py
from __future__ import annotations
from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class Deck:
    """卡组定义"""
    card_ids: List[str]

    def __post_init__(self):
        if len(self.card_ids) != 30:
            raise ValueError(f"Deck must have exactly 30 cards, got {len(self.card_ids)}")

    def __iter__(self):
        return iter(self.card_ids)

    def __len__(self):
        return len(self.card_ids)
```

```python
# Add to hearthstone_cli/engine/game.py

from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.cards.database import CardDatabase


class GameLogic:
    # ... 已有代码 ...

    @classmethod
    def create_game(cls, deck1: Deck, deck2: Deck, seed: int = 42) -> GameState:
        """创建新游戏"""
        from hearthstone_cli.engine.random import DeterministicRNG

        rng = DeterministicRNG(seed)
        db = CardDatabase()

        # 创建玩家
        player0 = cls._create_player(deck1, rng, goes_first=True)
        player1 = cls._create_player(deck2, rng, goes_first=False)

        return GameState(
            turn=1,
            active_player=0,  # 先手玩家开始
            players=(player0, player1),
            action_history=(),
            rng_state=rng.get_state(),
            phase_stack=()
        )

    @classmethod
    def _create_player(cls, deck: Deck, rng: DeterministicRNG, goes_first: bool) -> PlayerState:
        """创建玩家（包括洗牌和抽初始手牌）"""
        db = CardDatabase()

        # 创建卡牌对象列表
        cards = [db.get_card(cid) for cid in deck.card_ids]
        # 过滤None值（如果卡牌不存在）
        cards = [c for c in cards if c is not None]

        # 洗牌
        cards_list = list(cards)
        rng.shuffle(cards_list)
        cards = tuple(cards_list)

        # 抽初始手牌：先手3张，后手4张
        initial_hand_size = 3 if goes_first else 4
        hand = cards[:initial_hand_size]
        remaining_deck = cards[initial_hand_size:]

        return PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1 if goes_first else 0, max_mana=0 if goes_first else 1),
            deck=remaining_deck,
            hand=hand,
            board=(),
            secrets=frozenset(),
            graveyard=(),
            exhausted_minions=frozenset(),
            hero_power_used=False
        )

    @classmethod
    def is_terminal(cls, state: GameState) -> bool:
        """检查游戏是否结束"""
        for player in state.players:
            if player.hero.health <= 0:
                return True
        return False

    @classmethod
    def get_winner(cls, state: GameState) -> Optional[int]:
        """获取获胜者（如果游戏结束）"""
        if not cls.is_terminal(state):
            return None

        p0_alive = state.players[0].hero.health > 0
        p1_alive = state.players[1].hero.health > 0

        if p0_alive and not p1_alive:
            return 0
        elif p1_alive and not p0_alive:
            return 1
        else:
            return -1  # 平局
```

**Step 4: Run test to verify it passes**

Run: `pytest hearthstone_cli/tests/test_game_full.py -v`

Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone_cli/engine/deck.py hearthstone_cli/engine/game.py hearthstone_cli/tests/test_game_full.py
git commit -m "feat: add full game initialization with decks and terminal detection"
```

---

## Task 8: Gymnasium环境接口

**Files:**
- Create: `hearthstone_cli/env/gym_env.py`
- Create: `hearthstone_cli/env/observation.py`
- Test: `hearthstone_cli/tests/test_gym_env.py`

**Step 1: Write the failing test**

```python
# hearthstone_cli/tests/test_gym_env.py
import pytest
import numpy as np
from hearthstone_cli.env.gym_env import HearthstoneEnv
from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.data import CardData, CardType, Rarity


def test_env_creation():
    """可以创建环境"""
    db = CardDatabase()
    db.add_card(CardData(
        card_id="TEST_CARD",
        name="Test",
        cost=1,
        card_type=CardType.MINION,
        rarity=Rarity.COMMON,
        attack=1,
        health=1
    ))

    deck = Deck(["TEST_CARD"] * 30)
    env = HearthstoneEnv(deck1=deck, deck2=deck, seed=42)

    assert env is not None


def test_env_reset():
    """可以重置环境"""
    db = CardDatabase()
    db.add_card(CardData(
        card_id="TEST_CARD",
        name="Test",
        cost=1,
        card_type=CardType.MINION,
        rarity=Rarity.COMMON,
        attack=1,
        health=1
    ))

    deck = Deck(["TEST_CARD"] * 30)
    env = HearthstoneEnv(deck1=deck, deck2=deck, seed=42)

    obs, info = env.reset(seed=42)

    assert obs is not None
    assert isinstance(obs, dict)
    assert "my_hero_health" in obs


def test_env_observation_shape():
    """观察值形状正确"""
    db = CardDatabase()
    db.add_card(CardData(
        card_id="TEST_CARD",
        name="Test",
        cost=1,
        card_type=CardType.MINION,
        rarity=Rarity.COMMON,
        attack=1,
        health=1
    ))

    deck = Deck(["TEST_CARD"] * 30)
    env = HearthstoneEnv(deck1=deck, deck2=deck, seed=42)

    obs, _ = env.reset(seed=42)

    # 检查关键字段
    assert isinstance(obs["my_hero_health"], (int, float))
    assert isinstance(obs["opponent_hero_health"], (int, float))
    assert len(obs["my_hand"]) == 10  # 填充到10张
    assert len(obs["my_board"]) == 7  # 填充到7个


def test_env_step_end_turn():
    """可以执行结束回合动作"""
    db = CardDatabase()
    db.add_card(CardData(
        card_id="TEST_CARD",
        name="Test",
        cost=1,
        card_type=CardType.MINION,
        rarity=Rarity.COMMON,
        attack=1,
        health=1
    ))

    deck = Deck(["TEST_CARD"] * 30)
    env = HearthstoneEnv(deck1=deck, deck2=deck, seed=42)

    obs, _ = env.reset(seed=42)

    # 找到结束回合的动作ID
    action_id = env.action_to_id({"type": "end_turn"})

    obs, reward, terminated, truncated, info = env.step(action_id)

    assert not terminated  # 游戏还没结束
    assert isinstance(reward, (int, float))
```

**Step 2: Run test to verify it fails**

Run: `pytest hearthstone_cli/tests/test_gym_env.py -v`

Expected: FAIL

**Step 3: Write minimal implementation**

```python
# hearthstone_cli/env/observation.py
from __future__ import annotations
import numpy as np
from typing import Dict, Any, List

from hearthstone_cli.engine.state import GameState, Card, Minion


class ObservationEncoder:
    """观察值编码器

    将游戏状态转换为神经网络可用的向量形式。
    """

    MAX_HAND_SIZE = 10
    MAX_BOARD_SIZE = 7
    MAX_DECK_SIZE = 40

    @classmethod
    def encode(cls, game: GameState, player: int) -> Dict[str, Any]:
        """编码指定玩家的观察"""
        me = game.players[player]
        enemy = game.players[1 - player]

        return {
            # 标量特征
            **cls._encode_scalar_features(me, enemy, game),

            # 手牌（填充）
            "my_hand": cls._encode_hand(me.hand),
            "my_hand_mask": cls._create_mask(len(me.hand), cls.MAX_HAND_SIZE),

            # 场上
            "my_board": cls._encode_board(me.board),
            "my_board_mask": cls._create_mask(len(me.board), cls.MAX_BOARD_SIZE),

            "enemy_board": cls._encode_board(enemy.board),
            "enemy_board_mask": cls._create_mask(len(enemy.board), cls.MAX_BOARD_SIZE),

            # 牌库大小（归一化）
            "my_deck_size": len(me.deck) / cls.MAX_DECK_SIZE,
            "enemy_deck_size": len(enemy.deck) / cls.MAX_DECK_SIZE,
        }

    @classmethod
    def _encode_scalar_features(cls, me, enemy, game) -> Dict[str, float]:
        """编码标量特征"""
        return {
            "my_hero_health": me.hero.health / 30,
            "my_hero_armor": me.hero.armor / 20,
            "my_mana_current": me.mana.current / 10,
            "my_mana_max": me.mana.max_mana / 10,
            "my_mana_locked": me.mana.locked / 10,
            "my_mana_overload": me.mana.overload / 10,

            "opponent_hero_health": enemy.hero.health / 30,
            "opponent_hero_armor": enemy.hero.armor / 20,
            "opponent_mana_crystals": enemy.mana.max_mana / 10,  # 只能看到上限

            "turn": min(game.turn / 50, 1.0),
            "is_my_turn": 1.0 if game.active_player == 0 else 0.0,

            # 武器
            "has_weapon": 1.0 if me.hero.weapon else 0.0,
            "weapon_attack": (me.hero.weapon.attack / 10) if me.hero.weapon else 0.0,
            "weapon_durability": (me.hero.weapon.durability / 10) if me.hero.weapon else 0.0,

            # 奥秘数量（只能看到数量，不能看到具体是什么）
            "opponent_secrets_count": len(enemy.secrets) / 5,
            "my_secrets_count": len(me.secrets) / 5,
        }

    @classmethod
    def _encode_hand(cls, hand: tuple[Card, ...]) -> List[List[float]]:
        """编码手牌"""
        encoded = []
        for card in hand:
            encoded.append(cls._encode_card(card))
        # 填充
        while len(encoded) < cls.MAX_HAND_SIZE:
            encoded.append([0.0] * 10)  # 假设每个卡牌10个特征
        return encoded[:cls.MAX_HAND_SIZE]

    @classmethod
    def _encode_board(cls, board: tuple[Minion, ...]) -> List[List[float]]:
        """编码场上随从"""
        encoded = []
        for minion in board:
            encoded.append(cls._encode_minion(minion))
        # 填充
        while len(encoded) < cls.MAX_BOARD_SIZE:
            encoded.append([0.0] * 15)  # 假设每个随从15个特征
        return encoded[:cls.MAX_BOARD_SIZE]

    @classmethod
    def _encode_card(cls, card: Card) -> List[float]:
        """编码单张卡牌"""
        # 简化版，后续可以加入更多特征如card_id的embedding
        return [
            card.cost / 10,
            (card.attack or 0) / 10,
            (card.health or 0) / 10,
            (card.durability or 0) / 10,
            1.0 if card.card_type == "MINION" else 0.0,
            1.0 if card.card_type == "SPELL" else 0.0,
            1.0 if card.card_type == "WEAPON" else 0.0,
            # 保留2个位置给后续扩展
            0.0,
            0.0,
            0.0,
        ]

    @classmethod
    def _encode_minion(cls, minion: Minion) -> List[float]:
        """编码单个随从"""
        from hearthstone_cli.engine.state import Attribute

        return [
            minion.attack / 10,
            minion.health / 10,
            minion.max_health / 10,
            minion.damage_taken / 10,
            1.0 if Attribute.TAUNT in minion.attributes else 0.0,
            1.0 if Attribute.DIVINE_SHIELD in minion.attributes else 0.0,
            1.0 if Attribute.WINDFURY in minion.attributes else 0.0,
            1.0 if Attribute.CHARGE in minion.attributes else 0.0,
            1.0 if Attribute.STEALTH in minion.attributes else 0.0,
            1.0 if Attribute.POISONOUS in minion.attributes else 0.0,
            1.0 if minion.exhausted else 0.0,
            1.0 if minion.summoned_this_turn else 0.0,
            # 保留3个位置
            0.0,
            0.0,
            0.0,
        ]

    @classmethod
    def _create_mask(cls, actual: int, max_size: int) -> List[int]:
        """创建掩码"""
        return [1] * actual + [0] * (max_size - actual)
```

```python
# hearthstone_cli/env/gym_env.py
from __future__ import annotations
import gymnasium as gym
from gymnasium import spaces
import numpy as np
from typing import Optional, Dict, Any, Tuple, List

from hearthstone_cli.engine.state import GameState
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.engine.actions import Action, EndTurnAction, AttackAction
from hearthstone_cli.env.observation import ObservationEncoder


class HearthstoneEnv(gym.Env):
    """炉石传说Gymnasium环境

    符合OpenAI Gym标准API，支持AI训练。
    """

    metadata = {"render_modes": ["human", "ansi", "none"]}

    def __init__(
        self,
        deck1: Deck,
        deck2: Deck,
        seed: Optional[int] = None,
        render_mode: str = "none"
    ):
        super().__init__()

        self.deck1 = deck1
        self.deck2 = deck2
        self.seed = seed
        self.render_mode = render_mode

        self._game: Optional[GameState] = None
        self._action_map: Dict[int, Any] = {}

        # 定义观察空间
        self.observation_space = spaces.Dict({
            "my_hero_health": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "my_hero_armor": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "my_mana_current": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "my_mana_max": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "opponent_hero_health": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "opponent_hero_armor": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "turn": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "is_my_turn": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "my_hand": spaces.Box(0, 1, shape=(10, 10), dtype=np.float32),
            "my_hand_mask": spaces.MultiBinary(10),
            "my_board": spaces.Box(0, 1, shape=(7, 15), dtype=np.float32),
            "my_board_mask": spaces.MultiBinary(7),
            "enemy_board": spaces.Box(0, 1, shape=(7, 15), dtype=np.float32),
            "enemy_board_mask": spaces.MultiBinary(7),
            "my_deck_size": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "enemy_deck_size": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "has_weapon": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "weapon_attack": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "weapon_durability": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "opponent_secrets_count": spaces.Box(0, 1, shape=(), dtype=np.float32),
            "my_secrets_count": spaces.Box(0, 1, shape=(), dtype=np.float32),
        })

        # 动作空间：离散，最大动作数
        # 这是一个简化的动作空间，实际应该动态计算
        self.action_space = spaces.Discrete(1000)

    def reset(
        self,
        seed: Optional[int] = None,
        options: Optional[Dict] = None
    ) -> Tuple[Dict, Dict]:
        """重置环境，开始新游戏"""
        super().reset(seed=seed)

        if seed is not None:
            self.seed = seed

        self._game = GameLogic.create_game(
            deck1=self.deck1,
            deck2=self.deck2,
            seed=self.seed or 42
        )

        obs = self._get_obs()
        info = self._get_info()

        return obs, info

    def step(self, action: int) -> Tuple[Dict, float, bool, bool, Dict]:
        """执行动作"""
        assert self._game is not None, "Environment not reset"

        # 获取对应的GameAction
        game_action = self._action_id_to_action(action)

        # 应用动作
        if game_action is not None:
            self._game = GameLogic.apply_action(self._game, game_action)

        # 如果是对手回合，自动执行（简化版：只是结束回合）
        while self._game.active_player == 1 and not GameLogic.is_terminal(self._game):
            # 简单的对手AI：总是结束回合
            opponent_action = EndTurnAction(player=1)
            self._game = GameLogic.apply_action(self._game, opponent_action)

        obs = self._get_obs()
        reward = self._calculate_reward()
        terminated = GameLogic.is_terminal(self._game)
        truncated = False
        info = self._get_info()

        return obs, reward, terminated, truncated, info

    def _get_obs(self) -> Dict:
        """获取当前观察"""
        return ObservationEncoder.encode(self._game, player=0)

    def _get_info(self) -> Dict:
        """获取额外信息"""
        return {
            "turn": self._game.turn,
            "active_player": self._game.active_player,
            "legal_actions": self._get_legal_action_ids()
        }

    def _calculate_reward(self) -> float:
        """计算奖励"""
        if not GameLogic.is_terminal(self._game):
            return 0.0

        winner = GameLogic.get_winner(self._game)
        if winner == 0:
            return 1.0  # AI获胜
        elif winner == 1:
            return -1.0  # AI失败
        else:
            return 0.0  # 平局

    def _get_legal_action_ids(self) -> List[int]:
        """获取合法动作ID列表"""
        legal = GameLogic.get_legal_actions(self._game, player=0)
        return [self.action_to_id(a) for a in legal]

    def _action_id_to_action(self, action_id: int) -> Optional[Action]:
        """将动作ID转换为GameAction"""
        # 简化实现
        if action_id == 0:
            return EndTurnAction(player=0)
        return None

    def action_to_id(self, action: Any) -> int:
        """将动作转换为ID"""
        # 简化实现
        if isinstance(action, dict) and action.get("type") == "end_turn":
            return 0
        return 1

    def render(self):
        """渲染环境"""
        if self.render_mode == "ansi":
            return str(self._game)
        elif self.render_mode == "human":
            # 后续实现rich渲染
            print(self._game)

    def close(self):
        """关闭环境"""
        pass
```

**Step 4: Run test to verify it passes**

Run: `pytest hearthstone_cli/tests/test_gym_env.py -v`

Expected: PASS (可能需要调整)

**Step 5: Commit**

```bash
git add hearthstone_cli/env/ hearthstone_cli/tests/test_gym_env.py
git commit -m "feat: add Gymnasium environment interface"
```

---

## Task 9: 基础CLI界面

**Files:**
- Create: `hearthstone_cli/cli/renderer.py`
- Create: `hearthstone_cli/cli/ui.py`
- Create: `hearthstone_cli/__main__.py`

**Step 1: Create renderer**

```python
# hearthstone_cli/cli/renderer.py
from __future__ import annotations
from typing import Optional

from hearthstone_cli.engine.state import GameState, PlayerState, Minion, Attribute


class TextRenderer:
    """文本渲染器"""

    @classmethod
    def render(cls, game: GameState) -> str:
        """渲染游戏状态为文本"""
        lines = []

        # 对手区域
        opponent = game.players[1]
        lines.extend(cls._render_player(opponent, is_opponent=True))
        lines.append("")

        # 分隔线
        lines.append("-" * 60)
        lines.append("")

        # 玩家区域
        player = game.players[0]
        lines.extend(cls._render_player(player, is_opponent=False))

        return "\n".join(lines)

    @classmethod
    def _render_player(cls, player: PlayerState, is_opponent: bool) -> list[str]:
        """渲染单个玩家"""
        lines = []
        prefix = "对手" if is_opponent else "你"

        # 英雄信息
        hero_line = f"{prefix}: HP {player.hero.health}/30"
        if player.hero.armor > 0:
            hero_line += f" 护甲: {player.hero.armor}"
        hero_line += f" | 水晶: {player.mana.current}/{player.mana.max_mana}"
        lines.append(hero_line)

        # 手牌数量（对手只显示数量）
        if is_opponent:
            lines.append(f"手牌: {len(player.hand)} 张")
        else:
            hand_str = "手牌: " + " ".join(f"[{c.cost}{c.name[:3]}]" for c in player.hand)
            lines.append(hand_str)

        # 场上随从
        if player.board:
            lines.append("场上:")
            for i, minion in enumerate(player.board):
                minion_str = cls._render_minion(minion, i)
                lines.append(f"  {minion_str}")
        else:
            lines.append("场上: (空)")

        return lines

    @classmethod
    def _render_minion(cls, minion: Minion, index: int) -> str:
        """渲染单个随从"""
        attrs = []
        if Attribute.TAUNT in minion.attributes:
            attrs.append("嘲讽")
        if Attribute.DIVINE_SHIELD in minion.attributes:
            attrs.append("圣盾")
        if Attribute.WINDFURY in minion.attributes:
            attrs.append("风怒")
        if Attribute.CHARGE in minion.attributes:
            attrs.append("冲锋")
        if Attribute.STEALTH in minion.attributes:
            attrs.append("潜行")

        attr_str = f" [{', '.join(attrs)}]" if attrs else ""
        exhausted_str = " (已攻击)" if minion.exhausted else ""

        return f"[{index}] {minion.attack}/{minion.health} {minion.card_id}{attr_str}{exhausted_str}"
```

**Step 2: Create UI**

```python
# hearthstone_cli/cli/ui.py
from __future__ import annotations
from typing import Optional

from hearthstone_cli.engine.state import GameState
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.engine.actions import Action, EndTurnAction
from hearthstone_cli.cli.renderer import TextRenderer


class CLIInterface:
    """命令行界面"""

    def __init__(self, game: GameState):
        self.game = game

    def run(self) -> None:
        """运行游戏循环"""
        while not GameLogic.is_terminal(self.game):
            self._render()

            if self.game.active_player == 0:
                # 玩家回合
                action = self._get_player_action()
                if action is None:
                    break
                self.game = GameLogic.apply_action(self.game, action)
            else:
                # AI回合（简化版：直接结束）
                print("\n对手思考中...")
                self.game = GameLogic.apply_action(
                    self.game,
                    EndTurnAction(player=1)
                )

        self._render()
        winner = GameLogic.get_winner(self.game)
        if winner == 0:
            print("\n🎉 你赢了！")
        elif winner == 1:
            print("\n😢 你输了...")
        else:
            print("\n🤝 平局")

    def _render(self) -> None:
        """渲染当前状态"""
        print("\n" + "=" * 60)
        print(TextRenderer.render(self.game))
        print("=" * 60)

    def _get_player_action(self) -> Optional[Action]:
        """获取玩家输入"""
        legal_actions = GameLogic.get_legal_actions(self.game, player=0)

        print("\n可执行的行动:")
        for i, action in enumerate(legal_actions):
            print(f"  [{i}] {self._action_to_str(action)}")

        while True:
            try:
                choice = input("\n选择行动 (或输入 'q' 退出): ").strip()
                if choice.lower() == 'q':
                    return None

                idx = int(choice)
                if 0 <= idx < len(legal_actions):
                    return legal_actions[idx]
                else:
                    print("无效的选择，请重试")
            except ValueError:
                print("请输入数字")

    def _action_to_str(self, action: Action) -> str:
        """将动作转换为可读字符串"""
        action_type = type(action).__name__
        if action_type == "EndTurnAction":
            return "结束回合"
        elif action_type == "AttackAction":
            return f"攻击"
        elif action_type == "PlayCardAction":
            return f"打出卡牌"
        return action_type
```

**Step 3: Create main entry point**

```python
# hearthstone_cli/__main__.py
"""炉石传说CLI游戏入口"""

from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.cli.ui import CLIInterface
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.data import CardData, CardType, Rarity


def create_test_deck() -> Deck:
    """创建测试卡组"""
    db = CardDatabase()

    # 添加一些基础卡牌
    cards = [
        ("CS2_121", "Frostwolf Grunt", 2, 2, 2, {Rarity.BASIC}),
        ("CS2_122", "Raid Leader", 3, 2, 2, {Rarity.BASIC}),
        ("CS2_124", "Wolfrider", 3, 3, 1, {Rarity.BASIC}),
    ]

    for card_id, name, cost, attack, health, rarity in cards:
        db.add_card(CardData(
            card_id=card_id,
            name=name,
            cost=cost,
            card_type=CardType.MINION,
            rarity=Rarity.BASIC,
            attack=attack,
            health=health
        ))

    # 简单卡组：30张相同的卡牌
    return Deck(["CS2_121"] * 30)


def main():
    """主函数"""
    print("=" * 60)
    print("炉石传说 CLI 游戏")
    print("=" * 60)

    deck = create_test_deck()
    game = GameLogic.create_game(deck1=deck, deck2=deck, seed=42)

    ui = CLIInterface(game)
    ui.run()


if __name__ == "__main__":
    main()
```

**Step 4: Test the CLI**

Run: `python -m hearthstone_cli`

Expected: 游戏启动，显示初始状态

**Step 5: Commit**

```bash
git add hearthstone_cli/cli/ hearthstone_cli/__main__.py
git commit -m "feat: add basic CLI interface and text renderer"
```

---

## Task 10: 运行完整测试套件

**Step 1: Run all tests**

Run: `pytest hearthstone_cli/tests/ -v`

Expected: 所有测试通过

**Step 2: Run with coverage**

Run: `pytest hearthstone_cli/tests/ --cov=hearthstone_cli --cov-report=term-missing`

Expected: 显示覆盖率报告

**Step 3: Final commit**

```bash
git add .
git commit -m "test: add complete test suite for all modules"
```

---

## 后续扩展任务（Phase 2+）

以下任务在当前计划之后执行：

### Phase 2: 法术系统
- Task 11: 法术效果结算
- Task 12: 战吼系统
- Task 13: 法术伤害加成

### Phase 3: 高级机制
- Task 14: 奥秘系统
- Task 15: 亡语系统
- Task 16: 连续效果（每回合触发）

### Phase 4: 武器和英雄技能
- Task 17: 武器系统
- Task 18: 英雄技能完整实现
- Task 19: 攻击英雄时使用武器

### Phase 5: 特殊机制
- Task 20: 风怒、圣盾、免疫
- Task 21: 沉默效果
- Task 22: 变形效果

### Phase 6: 数据层完善
- Task 23: HearthstoneJSON集成
- Task 24: 效果自动解析
- Task 25: 特殊卡牌处理器

### Phase 7: 优化
- Task 26: 动作空间优化（动态大小）
- Task 27: 观察值embedding
- Task 28: 性能优化（状态缓存）

### Phase 8: CLI增强
- Task 29: rich界面美化
- Task 30: 观战模式
- Task 31: 回放系统

---

## 快速开始

安装依赖：
```bash
pip install -r requirements.txt
```

运行游戏：
```bash
python -m hearthstone_cli
```

运行测试：
```bash
pytest hearthstone_cli/tests/ -v
```

使用Gym环境：
```python
from hearthstone_cli.env.gym_env import HearthstoneEnv
from hearthstone_cli.engine.deck import Deck

env = HearthstoneEnv(deck1=deck, deck2=deck)
obs, info = env.reset()
action = env.action_space.sample()
obs, reward, done, truncated, info = env.step(action)
```
