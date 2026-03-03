# Hearthstone CLI - Phase 1 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建可运行的核心游戏引擎，支持基础卡牌和简单对战

**Architecture:** 分层架构 - 游戏引擎层完全独立，提供干净的API供CLI和AI层使用

**Tech Stack:** Python 3.10+, pytest, dataclasses, typing

---

## Task 1: 项目初始化

**Files:**
- Create: `requirements.txt`
- Create: `pyproject.toml`
- Create: `.gitignore`
- Create: `README.md`
- Create: `hearthstone/__init__.py`

**Step 1: 创建requirements.txt**

```txt
pytest>=7.0.0
pytest-cov>=4.0.0
gymnasium>=0.29.0
numpy>=1.24.0
```

**Step 2: 创建pyproject.toml**

```toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "hearthstone-cli"
version = "0.1.0"
description = "CLI-based Hearthstone game for AI training"
requires-python = ">=3.10"
dependencies = [
    "gymnasium>=0.29.0",
    "numpy>=1.24.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
]
```

**Step 3: 创建.gitignore**

```
__pycache__/
*.py[cod]
*$py.class
.pytest_cache/
.coverage
htmlcov/
dist/
build/
*.egg-info/
.env
.venv
venv/
```

**Step 4: 创建README.md**

```markdown
# Hearthstone CLI

A CLI-based Hearthstone game for AI training and human play.

## Installation

```bash
pip install -e .
```

## Development

```bash
pip install -e ".[dev]"
pytest
```

## Goals

- 100% accurate game rules
- OpenAI Gym interface for AI training
- CLI interface for human play
```

**Step 5: 创建hearthstone包初始化文件**

```python
"""Hearthstone game engine core package."""

__version__ = "0.1.0"
```

**Step 6: 安装依赖**

Run: `pip install -e ".[dev]"`
Expected: Successfully installed hearthstone-cli

**Step 7: 提交**

```bash
git add requirements.txt pyproject.toml .gitignore README.md hearthstone/__init__.py
git commit -m "feat: initialize project structure

- Add project configuration files
- Add basic package structure
- Add development dependencies"
```

---

## Task 2: 核心枚举类型

**Files:**
- Create: `hearthstone/models/enums.py`
- Create: `tests/unit/test_enums.py`

**Step 1: 编写枚举类型测试**

```python
"""Tests for core enum types."""
import pytest
from hearthstone.models.enums import CardType, GamePhase, Ability


def test_card_type_values():
    """Test CardType enum has expected values."""
    assert CardType.MINION == "MINION"
    assert CardType.SPELL == "SPELL"
    assert CardType.WEAPON == "WEAPON"
    assert CardType.HERO == "HERO"


def test_game_phase_values():
    """Test GamePhase enum has expected values."""
    assert GamePhase.MULLIGAN == "MULLIGAN"
    assert GamePhase.MAIN == "MAIN"
    assert GamePhase.END == "END"


def test_ability_values():
    """Test Ability enum has expected values."""
    assert Ability.CHARGE == "CHARGE"
    assert Ability.TAUNT == "TAUNT"
    assert Ability.DIVINE_SHIELD == "DIVINE_SHIELD"
    assert Ability.WINDFURY == "WINDFURY"
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_enums.py -v`
Expected: FAIL with "ModuleNotFoundError: No module named 'hearthstone.models.enums'"

**Step 3: 实现枚举类型**

```python
"""Core enum types for Hearthstone game engine."""
from enum import Enum


class CardType(str, Enum):
    """Card types in Hearthstone."""
    MINION = "MINION"
    SPELL = "SPELL"
    WEAPON = "WEAPON"
    HERO = "HERO"


class GamePhase(str, Enum):
    """Game phases in Hearthstone."""
    MULLIGAN = "MULLIGAN"
    MAIN = "MAIN"
    END = "END"


class Ability(str, Enum):
    """Minion abilities in Hearthstone."""
    CHARGE = "CHARGE"
    TAUNT = "TAUNT"
    DIVINE_SHIELD = "DIVINE_SHIELD"
    WINDFURY = "WINDFURY"
    STEALTH = "STEALTH"
    FROZEN = "FROZEN"
    POISONOUS = "POISONOUS"
    LIFESTEAL = "LIFESTEAL"
    RUSH = "RUSH"
    REBORN = "REBORN"
    SPELL_DAMAGE = "SPELL_DAMAGE"


class HeroClass(str, Enum):
    """Hero classes in Hearthstone."""
    WARRIOR = "WARRIOR"
    SHAMAN = "SHAMAN"
    ROGUE = "ROGUE"
    PALADIN = "PALADIN"
    HUNTER = "HUNTER"
    DRUID = "DRUID"
    WARLOCK = "WARLOCK"
    MAGE = "MAGE"
    PRIEST = "PRIEST"
    DEMON_HUNTER = "DEMON_HUNTER"
    NEUTRAL = "NEUTRAL"
```

**Step 4: 创建models包初始化文件**

```python
"""Data models for Hearthstone game engine."""
```

**Step 5: 运行测试验证通过**

Run: `pytest tests/unit/test_enums.py -v`
Expected: PASS (3 tests)

**Step 6: 提交**

```bash
git add hearthstone/models/ tests/unit/test_enums.py
git commit -m "feat: add core enum types

- Add CardType, GamePhase, Ability, HeroClass enums
- Add unit tests for enum values"
```

---

## Task 3: 基础卡牌模型

**Files:**
- Create: `hearthstone/models/card.py`
- Create: `tests/unit/test_card.py`

**Step 1: 编写Card类测试**

```python
"""Tests for Card model."""
import pytest
from hearthstone.models.card import Card, Minion, Spell
from hearthstone.models.enums import CardType, Ability


def test_card_creation():
    """Test basic card creation."""
    card = Card(
        id="TEST_001",
        name="Test Card",
        cost=3,
        card_type=CardType.SPELL,
        description="A test card"
    )
    assert card.id == "TEST_001"
    assert card.name == "Test Card"
    assert card.cost == 3
    assert card.card_type == CardType.SPELL


def test_minion_creation():
    """Test minion card creation."""
    minion = Minion(
        id="TEST_002",
        name="Test Minion",
        cost=2,
        attack=3,
        health=2,
        abilities={Ability.CHARGE}
    )
    assert minion.id == "TEST_002"
    assert minion.attack == 3
    assert minion.health == 2
    assert Ability.CHARGE in minion.abilities


def test_minion_default_abilities():
    """Test minion has empty abilities set by default."""
    minion = Minion(
        id="TEST_003",
        name="Simple Minion",
        cost=1,
        attack=1,
        health=1
    )
    assert len(minion.abilities) == 0


def test_card_string_representation():
    """Test card string representation."""
    card = Card(
        id="TEST_001",
        name="Fireball",
        cost=4,
        card_type=CardType.SPELL
    )
    assert str(card) == "Fireball (4)"
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_card.py -v`
Expected: FAIL with "cannot import name 'Card' from 'hearthstone.models.card'"

**Step 3: 实现Card和Minion类**

```python
"""Card models for Hearthstone game engine."""
from dataclasses import dataclass, field
from typing import Set, Optional
from hearthstone.models.enums import CardType, Ability


@dataclass
class Card:
    """Base card class."""
    id: str
    name: str
    cost: int
    card_type: CardType
    description: str = ""
    hero_class: Optional[str] = None

    def __str__(self) -> str:
        return f"{self.name} ({self.cost})"


@dataclass
class Minion(Card):
    """Minion card with attack, health, and abilities."""
    attack: int = 0
    health: int = 0
    max_health: int = 0
    abilities: Set[Ability] = field(default_factory=set)
    can_attack: bool = False
    attacks_this_turn: int = 0

    def __post_init__(self):
        """Set max_health to health if not specified."""
        if self.max_health == 0:
            self.max_health = self.health
        # Minions can't attack the turn they're played (unless they have Charge)
        self.can_attack = Ability.CHARGE in self.abilities

    def take_damage(self, amount: int) -> int:
        """Take damage and return actual damage taken."""
        actual_damage = min(amount, self.health)
        self.health -= actual_damage
        return actual_damage

    def is_dead(self) -> bool:
        """Check if minion is dead."""
        return self.health <= 0

    def reset_attacks(self):
        """Reset attacks for new turn."""
        self.attacks_this_turn = 0
        if not Ability.FROZEN in self.abilities:
            self.can_attack = True


@dataclass
class Spell(Card):
    """Spell card."""
    pass


@dataclass
class Weapon(Card):
    """Weapon card."""
    attack: int = 0
    durability: int = 0
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/test_card.py -v`
Expected: PASS (4 tests)

**Step 5: 提交**

```bash
git add hearthstone/models/card.py tests/unit/test_card.py
git commit -m "feat: add Card, Minion, Spell models

- Add base Card dataclass
- Add Minion with health/attack/abilities
- Add take_damage and is_dead methods
- Add unit tests"
```

---

## Task 4: 英雄和玩家模型

**Files:**
- Create: `hearthstone/models/hero.py`
- Create: `hearthstone/models/player.py`
- Create: `tests/unit/test_hero.py`
- Create: `tests/unit/test_player.py`

**Step 1: 编写Hero类测试**

```python
"""Tests for Hero model."""
import pytest
from hearthstone.models.hero import Hero
from hearthstone.models.enums import HeroClass


def test_hero_creation():
    """Test hero creation."""
    hero = Hero(hero_class=HeroClass.MAGE, health=30)
    assert hero.hero_class == HeroClass.MAGE
    assert hero.health == 30
    assert hero.max_health == 30
    assert hero.armor == 0


def test_hero_take_damage():
    """Test hero taking damage."""
    hero = Hero(hero_class=HeroClass.WARRIOR, health=30)
    damage = hero.take_damage(5)
    assert damage == 5
    assert hero.health == 25


def test_hero_armor_absorbs_damage():
    """Test armor absorbs damage before health."""
    hero = Hero(hero_class=HeroClass.WARRIOR, health=30, armor=3)
    damage = hero.take_damage(5)
    assert damage == 5
    assert hero.armor == 0
    assert hero.health == 28


def test_hero_is_dead():
    """Test hero death check."""
    hero = Hero(hero_class=HeroClass.MAGE, health=30)
    assert not hero.is_dead()
    hero.take_damage(30)
    assert hero.is_dead()
```

**Step 2: 运行Hero测试验证失败**

Run: `pytest tests/unit/test_hero.py -v`
Expected: FAIL with "cannot import name 'Hero'"

**Step 3: 实现Hero类**

```python
"""Hero model for Hearthstone game engine."""
from dataclasses import dataclass
from hearthstone.models.enums import HeroClass


@dataclass
class Hero:
    """Hero representing a player's character."""
    hero_class: HeroClass
    health: int = 30
    max_health: int = 30
    armor: int = 0
    attack: int = 0
    can_attack: bool = False

    def __post_init__(self):
        """Set max_health to health if not specified."""
        if self.max_health == 30 and self.health != 30:
            self.max_health = self.health

    def take_damage(self, amount: int) -> int:
        """Take damage, armor absorbs first."""
        actual_damage = 0

        # Armor absorbs damage first
        if self.armor > 0:
            armor_absorb = min(self.armor, amount)
            self.armor -= armor_absorb
            amount -= armor_absorb
            actual_damage += armor_absorb

        # Remaining damage goes to health
        if amount > 0:
            health_damage = min(self.health, amount)
            self.health -= health_damage
            actual_damage += health_damage

        return actual_damage

    def is_dead(self) -> bool:
        """Check if hero is dead."""
        return self.health <= 0

    def add_armor(self, amount: int):
        """Add armor to hero."""
        self.armor += amount
```

**Step 4: 运行Hero测试验证通过**

Run: `pytest tests/unit/test_hero.py -v`
Expected: PASS (4 tests)

**Step 5: 编写Player类测试**

```python
"""Tests for Player model."""
import pytest
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass


def test_player_creation():
    """Test player creation."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1")
    assert player.name == "Player 1"
    assert player.hero == hero
    assert len(player.hand) == 0
    assert len(player.deck) == 0


def test_player_mana():
    """Test player mana management."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1", max_mana=5)

    assert player.mana == 5
    assert player.max_mana == 5

    player.spend_mana(3)
    assert player.mana == 2

    player.refresh_mana()
    assert player.mana == 5


def test_player_draw_card():
    """Test player drawing a card."""
    hero = Hero(hero_class=HeroClass.MAGE)
    player = Player(hero=hero, name="Player 1")

    card = Minion(id="TEST_001", name="Test", cost=1, attack=1, health=1)
    player.deck.append(card)

    drawn = player.draw_card()
    assert drawn == card
    assert len(player.deck) == 0
    assert len(player.hand) == 1
```

**Step 6: 运行Player测试验证失败**

Run: `pytest tests/unit/test_player.py -v`
Expected: FAIL with "cannot import name 'Player'"

**Step 7: 实现Player类**

```python
"""Player model for Hearthstone game engine."""
from dataclasses import dataclass, field
from typing import List, Optional
from hearthstone.models.hero import Hero
from hearthstone.models.card import Card


@dataclass
class Player:
    """Player in the game."""
    hero: Hero
    name: str
    mana: int = 0
    max_mana: int = 0
    hand: List[Card] = field(default_factory=list)
    deck: List[Card] = field(default_factory=list)
    field: List = field(default_factory=list)  # Minions on board
    graveyard: List[Card] = field(default_factory=list)

    def spend_mana(self, amount: int) -> bool:
        """Spend mana if available."""
        if amount > self.mana:
            return False
        self.mana -= amount
        return True

    def refresh_mana(self):
        """Refresh mana to max at start of turn."""
        self.mana = self.max_mana

    def gain_mana_crystal(self):
        """Gain a mana crystal (max 10)."""
        if self.max_mana < 10:
            self.max_mana += 1

    def draw_card(self) -> Optional[Card]:
        """Draw a card from deck."""
        if len(self.deck) == 0:
            # Fatigue damage (simplified)
            return None

        card = self.deck.pop(0)
        if len(self.hand) < 10:  # Hand limit
            self.hand.append(card)
        else:
            # Card is burned
            self.graveyard.append(card)
        return card

    def play_card(self, card_index: int) -> Card:
        """Play a card from hand."""
        if 0 <= card_index < len(self.hand):
            return self.hand.pop(card_index)
        raise IndexError("Invalid card index")
```

**Step 8: 运行Player测试验证通过**

Run: `pytest tests/unit/test_player.py -v`
Expected: PASS (3 tests)

**Step 9: 提交**

```bash
git add hearthstone/models/hero.py hearthstone/models/player.py tests/unit/test_hero.py tests/unit/test_player.py
git commit -m "feat: add Hero and Player models

- Add Hero with health, armor, damage handling
- Add Player with mana, hand, deck, field
- Add card draw and play methods
- Add unit tests"
```

---

## Task 5: 游戏状态模型

**Files:**
- Create: `hearthstone/models/game_state.py`
- Create: `tests/unit/test_game_state.py`

**Step 1: 编写GameState类测试**

```python
"""Tests for GameState model."""
import pytest
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.enums import HeroClass, GamePhase


def test_game_state_creation():
    """Test game state creation."""
    player1 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 1")
    player2 = Player(hero=Hero(hero_class=HeroClass.WARRIOR), name="Player 2")

    state = GameState(player1=player1, player2=player2)

    assert state.current_player == player1
    assert state.opposing_player == player2
    assert state.turn == 1
    assert state.phase == GamePhase.MAIN


def test_game_state_switch_turn():
    """Test switching turns."""
    player1 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 1")
    player2 = Player(hero=Hero(hero_class=HeroClass.WARRIOR), name="Player 2")

    state = GameState(player1=player1, player2=player2)

    state.switch_turn()
    assert state.current_player == player2
    assert state.opposing_player == player1
    assert state.turn == 1

    state.switch_turn()
    assert state.current_player == player1
    assert state.turn == 2


def test_game_state_is_game_over():
    """Test game over check."""
    player1 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 1")
    player2 = Player(hero=Hero(hero_class=HeroClass.WARRIOR), name="Player 2")

    state = GameState(player1=player1, player2=player2)

    assert not state.is_game_over()

    player1.hero.take_damage(30)
    assert state.is_game_over()
    assert state.get_winner() == player2
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_game_state.py -v`
Expected: FAIL with "cannot import name 'GameState'"

**Step 3: 实现GameState类**

```python
"""Game state model for Hearthstone game engine."""
from dataclasses import dataclass, field
from typing import Optional
from hearthstone.models.player import Player
from hearthstone.models.enums import GamePhase


@dataclass
class GameState:
    """Complete state of a Hearthstone game."""
    player1: Player
    player2: Player
    current_player: Optional[Player] = None
    opposing_player: Optional[Player] = None
    turn: int = 1
    phase: GamePhase = GamePhase.MAIN

    def __post_init__(self):
        """Initialize current and opposing players."""
        if self.current_player is None:
            self.current_player = self.player1
        if self.opposing_player is None:
            self.opposing_player = self.player2

    def switch_turn(self):
        """Switch to the other player's turn."""
        self.current_player, self.opposing_player = (
            self.opposing_player,
            self.current_player,
        )

        # Increment turn counter when going back to player1
        if self.current_player == self.player1:
            self.turn += 1

    def is_game_over(self) -> bool:
        """Check if game is over."""
        return self.player1.hero.is_dead() or self.player2.hero.is_dead()

    def get_winner(self) -> Optional[Player]:
        """Get the winner if game is over."""
        if self.player1.hero.is_dead():
            return self.player2
        if self.player2.hero.is_dead():
            return self.player1
        return None
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/test_game_state.py -v`
Expected: PASS (3 tests)

**Step 5: 提交**

```bash
git add hearthstone/models/game_state.py tests/unit/test_game_state.py
git commit -m "feat: add GameState model

- Add GameState with turn management
- Add game over and winner detection
- Add unit tests"
```

---

## Task 6: 动作系统

**Files:**
- Create: `hearthstone/engine/action.py`
- Create: `tests/unit/test_action.py`
- Create: `hearthstone/engine/__init__.py`

**Step 1: 编写Action类测试**

```python
"""Tests for Action system."""
import pytest
from hearthstone.engine.action import (
    Action,
    EndTurnAction,
    PlayCardAction,
    AttackAction
)


def test_end_turn_action():
    """Test EndTurnAction creation."""
    action = EndTurnAction(player_id="player1")
    assert action.action_type == "END_TURN"
    assert action.player_id == "player1"


def test_play_card_action():
    """Test PlayCardAction creation."""
    action = PlayCardAction(
        player_id="player1",
        card_index=0,
        target_id="enemy_hero"
    )
    assert action.action_type == "PLAY_CARD"
    assert action.card_index == 0
    assert action.target_id == "enemy_hero"


def test_attack_action():
    """Test AttackAction creation."""
    action = AttackAction(
        player_id="player1",
        attacker_id="minion_1",
        target_id="enemy_hero"
    )
    assert action.action_type == "ATTACK"
    assert action.attacker_id == "minion_1"
    assert action.target_id == "enemy_hero"
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_action.py -v`
Expected: FAIL with "cannot import name 'Action'"

**Step 3: 实现Action类**

```python
"""Action system for Hearthstone game engine."""
from dataclasses import dataclass
from typing import Optional, Any
from abc import ABC, abstractmethod


@dataclass
class Action(ABC):
    """Base action class."""
    player_id: str

    @property
    @abstractmethod
    def action_type(self) -> str:
        """Return action type."""
        pass


@dataclass
class EndTurnAction(Action):
    """Action to end current turn."""
    action_type: str = "END_TURN"


@dataclass
class PlayCardAction(Action):
    """Action to play a card from hand."""
    card_index: int = 0
    target_id: Optional[str] = None
    action_type: str = "PLAY_CARD"


@dataclass
class AttackAction(Action):
    """Action to attack with a minion or hero."""
    attacker_id: str = ""
    target_id: str = ""
    action_type: str = "ATTACK"


@dataclass
class HeroPowerAction(Action):
    """Action to use hero power."""
    target_id: Optional[str] = None
    action_type: str = "HERO_POWER"


@dataclass
class ActionResult:
    """Result of executing an action."""
    success: bool
    message: str = ""
    turn_ended: bool = False
    game_over: bool = False
    events: list = None

    def __post_init__(self):
        if self.events is None:
            self.events = []
```

**Step 4: 创建engine包初始化文件**

```python
"""Game engine core package."""
```

**Step 5: 运行测试验证通过**

Run: `pytest tests/unit/test_action.py -v`
Expected: PASS (3 tests)

**Step 6: 提交**

```bash
git add hearthstone/engine/ tests/unit/test_action.py
git commit -m "feat: add Action system

- Add base Action class and action types
- Add EndTurn, PlayCard, Attack, HeroPower actions
- Add ActionResult for action execution results
- Add unit tests"
```

---

## Task 7: 游戏引擎核心

**Files:**
- Create: `hearthstone/engine/game_engine.py`
- Create: `tests/unit/test_game_engine.py`

**Step 1: 编写GameEngine类测试**

```python
"""Tests for GameEngine."""
import pytest
from hearthstone.engine.game_engine import GameEngine
from hearthstone.engine.action import EndTurnAction, PlayCardAction
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass


def create_test_engine():
    """Create a test game engine with basic setup."""
    engine = GameEngine()
    engine.initialize_game(
        player1_name="Player 1",
        player1_class=HeroClass.MAGE,
        player2_name="Player 2",
        player2_class=HeroClass.WARRIOR
    )
    return engine


def test_engine_initialization():
    """Test game engine initialization."""
    engine = create_test_engine()

    assert engine.state is not None
    assert engine.state.current_player.name == "Player 1"
    assert engine.state.opposing_player.name == "Player 2"
    assert engine.state.turn == 1


def test_engine_end_turn():
    """Test ending a turn."""
    engine = create_test_engine()
    player1 = engine.state.current_player
    player2 = engine.state.opposing_player

    action = EndTurnAction(player_id="player1")
    result = engine.take_action(action)

    assert result.success
    assert result.turn_ended
    assert engine.state.current_player == player2
    assert engine.state.opposing_player == player1


def test_engine_play_card():
    """Test playing a card."""
    engine = create_test_engine()

    # Add a card to hand
    card = Minion(id="TEST_001", name="Test Minion", cost=1, attack=1, health=1)
    engine.state.current_player.hand.append(card)
    engine.state.current_player.mana = 1

    action = PlayCardAction(
        player_id="player1",
        card_index=0,
        target_id=None
    )
    result = engine.take_action(action)

    assert result.success
    assert len(engine.state.current_player.hand) == 0
    assert len(engine.state.current_player.field) == 1


def test_engine_not_enough_mana():
    """Test playing a card without enough mana."""
    engine = create_test_engine()

    # Add a card to hand
    card = Minion(id="TEST_001", name="Test Minion", cost=5, attack=5, health=5)
    engine.state.current_player.hand.append(card)
    engine.state.current_player.mana = 1

    action = PlayCardAction(
        player_id="player1",
        card_index=0,
        target_id=None
    )
    result = engine.take_action(action)

    assert not result.success
    assert "mana" in result.message.lower()
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_game_engine.py -v`
Expected: FAIL with "cannot import name 'GameEngine'"

**Step 3: 实现GameEngine类**

```python
"""Game engine for Hearthstone."""
from typing import List, Optional
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass
from hearthstone.engine.action import (
    Action,
    EndTurnAction,
    PlayCardAction,
    AttackAction,
    ActionResult
)


class GameEngine:
    """Main game engine that manages game state and actions."""

    def __init__(self):
        """Initialize game engine."""
        self.state: Optional[GameState] = None

    def initialize_game(
        self,
        player1_name: str,
        player1_class: HeroClass,
        player2_name: str,
        player2_class: HeroClass
    ):
        """Initialize a new game."""
        player1 = Player(
            hero=Hero(hero_class=player1_class),
            name=player1_name
        )
        player2 = Player(
            hero=Hero(hero_class=player2_class),
            name=player2_name
        )

        self.state = GameState(player1=player1, player2=player2)

        # Set initial mana
        player1.max_mana = 1
        player1.mana = 1
        player2.max_mana = 1
        player2.mana = 1

    def take_action(self, action: Action) -> ActionResult:
        """Execute an action and return result."""
        if isinstance(action, EndTurnAction):
            return self._execute_end_turn(action)
        elif isinstance(action, PlayCardAction):
            return self._execute_play_card(action)
        elif isinstance(action, AttackAction):
            return self._execute_attack(action)
        else:
            return ActionResult(
                success=False,
                message=f"Unknown action type: {type(action)}"
            )

    def _execute_end_turn(self, action: EndTurnAction) -> ActionResult:
        """Execute end turn action."""
        if action.player_id != self.state.current_player.name:
            return ActionResult(
                success=False,
                message="Not your turn"
            )

        # Reset minions for current player
        for minion in self.state.current_player.field:
            minion.reset_attacks()

        # Switch turn
        self.state.switch_turn()

        # Gain mana crystal for new player
        self.state.current_player.gain_mana_crystal()
        self.state.current_player.refresh_mana()

        # Draw a card
        self.state.current_player.draw_card()

        return ActionResult(
            success=True,
            message="Turn ended",
            turn_ended=True
        )

    def _execute_play_card(self, action: PlayCardAction) -> ActionResult:
        """Execute play card action."""
        player = self.state.current_player

        # Validate card index
        if action.card_index < 0 or action.card_index >= len(player.hand):
            return ActionResult(
                success=False,
                message="Invalid card index"
            )

        card = player.hand[action.card_index]

        # Check mana cost
        if card.cost > player.mana:
            return ActionResult(
                success=False,
                message=f"Not enough mana (need {card.cost}, have {player.mana})"
            )

        # Spend mana
        player.spend_mana(card.cost)

        # Play the card
        player.play_card(action.card_index)

        # If it's a minion, put it on the field
        if isinstance(card, Minion):
            if len(player.field) < 7:  # Board limit
                player.field.append(card)

        return ActionResult(
            success=True,
            message=f"Played {card.name}"
        )

    def _execute_attack(self, action: AttackAction) -> ActionResult:
        """Execute attack action."""
        # TODO: Implement attack logic
        return ActionResult(
            success=False,
            message="Attack not implemented yet"
        )
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/test_game_engine.py -v`
Expected: PASS (4 tests)

**Step 5: 提交**

```bash
git add hearthstone/engine/game_engine.py tests/unit/test_game_engine.py
git commit -m "feat: add GameEngine core

- Add GameEngine with initialization
- Add turn management (end turn)
- Add play card action execution
- Add mana validation
- Add unit tests"
```

---

## Task 8: 基础卡牌数据

**Files:**
- Create: `data/cards/basic.json`
- Create: `hearthstone/cards/card_loader.py`
- Create: `tests/unit/test_card_loader.py`

**Step 1: 创建基础卡牌JSON数据**

```json
[
  {
    "id": "CS2_231",
    "name": "Wisp",
    "cost": 0,
    "type": "MINION",
    "attack": 1,
    "health": 1,
    "description": "",
    "hero_class": "NEUTRAL"
  },
  {
    "id": "CS2_120",
    "name": "River Crocolisk",
    "cost": 2,
    "type": "MINION",
    "attack": 2,
    "health": 3,
    "description": "",
    "hero_class": "NEUTRAL"
  },
  {
    "id": "CS2_142",
    "name": "Kobold Geomancer",
    "cost": 2,
    "type": "MINION",
    "attack": 2,
    "health": 2,
    "description": "Spell Damage +1",
    "hero_class": "NEUTRAL",
    "abilities": ["SPELL_DAMAGE"]
  },
  {
    "id": "CS2_155",
    "name": "Archmage",
    "cost": 6,
    "type": "MINION",
    "attack": 4,
    "health": 7,
    "description": "Spell Damage +1",
    "hero_class": "NEUTRAL",
    "abilities": ["SPELL_DAMAGE"]
  },
  {
    "id": "CS2_179",
    "name": "Sen'jin Shieldmasta",
    "cost": 4,
    "type": "MINION",
    "attack": 3,
    "health": 5,
    "description": "Taunt",
    "hero_class": "NEUTRAL",
    "abilities": ["TAUNT"]
  },
  {
    "id": "CS2_182",
    "name": "Chillwind Yeti",
    "cost": 4,
    "type": "MINION",
    "attack": 4,
    "health": 5,
    "description": "",
    "hero_class": "NEUTRAL"
  },
  {
    "id": "CS2_187",
    "name": "Ironfur Grizzly",
    "cost": 3,
    "type": "MINION",
    "attack": 3,
    "health": 3,
    "description": "Taunt",
    "hero_class": "NEUTRAL",
    "abilities": ["TAUNT"]
  },
  {
    "id": "CS2_189",
    "name": "Magma Rager",
    "cost": 3,
    "type": "MINION",
    "attack": 5,
    "health": 1,
    "description": "",
    "hero_class": "NEUTRAL"
  },
  {
    "id": "CS2_124",
    "name": "Wolfrider",
    "cost": 3,
    "type": "MINION",
    "attack": 3,
    "health": 1,
    "description": "Charge",
    "hero_class": "NEUTRAL",
    "abilities": ["CHARGE"]
  },
  {
    "id": "CS2_125",
    "name": "Stormwind Knight",
    "cost": 4,
    "type": "MINION",
    "attack": 2,
    "health": 5,
    "description": "Charge",
    "hero_class": "NEUTRAL",
    "abilities": ["CHARGE"]
  }
]
```

**Step 2: 编写CardLoader测试**

```python
"""Tests for CardLoader."""
import pytest
from hearthstone.cards.card_loader import CardLoader
from hearthstone.models.enums import Ability


def test_load_cards_from_json():
    """Test loading cards from JSON file."""
    loader = CardLoader()
    cards = loader.load_cards("data/cards/basic.json")

    assert len(cards) > 0

    # Check Wisp
    wisp = cards["CS2_231"]
    assert wisp.name == "Wisp"
    assert wisp.cost == 0
    assert wisp.attack == 1
    assert wisp.health == 1


def test_load_card_with_abilities():
    """Test loading a card with abilities."""
    loader = CardLoader()
    cards = loader.load_cards("data/cards/basic.json")

    # Check Sen'jin Shieldmasta
    senjin = cards["CS2_179"]
    assert Ability.TAUNT in senjin.abilities


def test_get_card_by_id():
    """Test getting a card by ID."""
    loader = CardLoader()
    loader.load_cards("data/cards/basic.json")

    wisp = loader.get_card("CS2_231")
    assert wisp.name == "Wisp"
```

**Step 3: 运行测试验证失败**

Run: `pytest tests/unit/test_card_loader.py -v`
Expected: FAIL with "cannot import name 'CardLoader'"

**Step 4: 实现CardLoader类**

```python
"""Card loader for loading cards from JSON files."""
import json
from pathlib import Path
from typing import Dict, Optional
from hearthstone.models.card import Card, Minion, Spell, Weapon
from hearthstone.models.enums import CardType, Ability


class CardLoader:
    """Load and manage card definitions."""

    def __init__(self):
        """Initialize card loader."""
        self.cards: Dict[str, Card] = {}

    def load_cards(self, filepath: str) -> Dict[str, Card]:
        """Load cards from a JSON file."""
        path = Path(filepath)
        if not path.exists():
            raise FileNotFoundError(f"Card file not found: {filepath}")

        with open(path, 'r') as f:
            card_data = json.load(f)

        for card_json in card_data:
            card = self._parse_card(card_json)
            self.cards[card.id] = card

        return self.cards

    def _parse_card(self, data: dict) -> Card:
        """Parse a card from JSON data."""
        card_type = CardType(data["type"])

        if card_type == CardType.MINION:
            abilities = set()
            if "abilities" in data:
                for ability_str in data["abilities"]:
                    abilities.add(Ability(ability_str))

            return Minion(
                id=data["id"],
                name=data["name"],
                cost=data["cost"],
                card_type=card_type,
                description=data.get("description", ""),
                hero_class=data.get("hero_class"),
                attack=data["attack"],
                health=data["health"],
                abilities=abilities
            )
        elif card_type == CardType.SPELL:
            return Spell(
                id=data["id"],
                name=data["name"],
                cost=data["cost"],
                card_type=card_type,
                description=data.get("description", ""),
                hero_class=data.get("hero_class")
            )
        elif card_type == CardType.WEAPON:
            return Weapon(
                id=data["id"],
                name=data["name"],
                cost=data["cost"],
                card_type=card_type,
                description=data.get("description", ""),
                hero_class=data.get("hero_class"),
                attack=data.get("attack", 0),
                durability=data.get("durability", 0)
            )
        else:
            return Card(
                id=data["id"],
                name=data["name"],
                cost=data["cost"],
                card_type=card_type,
                description=data.get("description", ""),
                hero_class=data.get("hero_class")
            )

    def get_card(self, card_id: str) -> Optional[Card]:
        """Get a card by ID."""
        return self.cards.get(card_id)
```

**Step 5: 创建cards包初始化文件**

```python
"""Card loading and management package."""
```

**Step 6: 运行测试验证通过**

Run: `pytest tests/unit/test_card_loader.py -v`
Expected: PASS (3 tests)

**Step 7: 提交**

```bash
git add data/cards/basic.json hearthstone/cards/ tests/unit/test_card_loader.py
git commit -m "feat: add card loading system

- Add basic card JSON data (10 neutral minions)
- Add CardLoader to parse JSON into Card objects
- Support abilities parsing
- Add unit tests"
```

---

## Task 9: 简单的测试游戏

**Files:**
- Create: `tests/integration/test_simple_game.py`

**Step 1: 编写集成测试**

```python
"""Integration test for a simple game."""
import pytest
from hearthstone.engine.game_engine import GameEngine
from hearthstone.engine.action import EndTurnAction
from hearthstone.models.enums import HeroClass


def test_simple_game_flow():
    """Test a simple game with just end turn actions."""
    engine = GameEngine()
    engine.initialize_game(
        player1_name="Alice",
        player1_class=HeroClass.MAGE,
        player2_name="Bob",
        player2_class=HeroClass.WARRIOR
    )

    # Play 10 turns (5 rounds)
    for i in range(10):
        action = EndTurnAction(
            player_id=engine.state.current_player.name
        )
        result = engine.take_action(action)
        assert result.success

    # Check game state
    assert engine.state.turn == 6  # Turn 6 after 10 end turns
    assert engine.state.current_player.max_mana >= 5


def test_mana_gain_over_turns():
    """Test mana crystal gain over turns."""
    engine = GameEngine()
    engine.initialize_game(
        player1_name="Alice",
        player1_class=HeroClass.MAGE,
        player2_name="Bob",
        player2_class=HeroClass.WARRIOR
    )

    player1 = engine.state.player1
    player2 = engine.state.player2

    assert player1.max_mana == 1
    assert player2.max_mana == 1

    # End turn 1
    engine.take_action(EndTurnAction(player_id=player1.name))
    assert player2.max_mana == 2

    # End turn 2
    engine.take_action(EndTurnAction(player_id=player2.name))
    assert player1.max_mana == 2

    # End turn 3
    engine.take_action(EndTurnAction(player_id=player1.name))
    assert player2.max_mana == 3
```

**Step 2: 运行测试验证通过**

Run: `pytest tests/integration/test_simple_game.py -v`
Expected: PASS (2 tests)

**Step 3: 提交**

```bash
git add tests/integration/test_simple_game.py
git commit -m "test: add simple game integration tests

- Test basic game flow with end turn actions
- Test mana crystal gain over turns"
```

---

## Task 10: 运行所有测试并验证

**Step 1: 运行所有单元测试**

Run: `pytest tests/unit/ -v --cov=hearthstone --cov-report=term-missing`
Expected: All tests PASS, coverage report shown

**Step 2: 运行所有集成测试**

Run: `pytest tests/integration/ -v`
Expected: All tests PASS

**Step 3: 运行所有测试**

Run: `pytest tests/ -v`
Expected: All tests PASS

**Step 4: 最终提交**

```bash
git add -A
git commit -m "chore: complete Phase 1 MVP

Phase 1 implementation complete with:
- Core data models (Card, Minion, Hero, Player, GameState)
- Game engine with turn management
- Card loading system
- 10 basic neutral minions
- Comprehensive unit and integration tests

All tests passing. Ready for Phase 2: CLI interface."
```

---

## Phase 1 完成标准

✅ 可以初始化游戏引擎
✅ 可以管理回合和法力值
✅ 可以打出卡牌（基础）
✅ 有10张可用的基础卡牌
✅ 所有单元测试通过
✅ 集成测试通过
✅ 代码有良好的测试覆盖率

## 下一步：Phase 2

Phase 2 将实现：
- CLI显示系统（ASCII渲染）
- 用户输入处理
- 菜单系统
- 完整的游戏循环
- 攻击系统
