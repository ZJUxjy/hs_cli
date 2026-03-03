# Hearthstone CLI - Phase 2 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 守成Phase 2 - CLI界面、攻击系统、卡组构建器和完整游戏循环

**Architecture:** 在Phase 1核心引擎基础上， 添加Rich-based CLI层和完整的攻击系统

**Tech Stack:** Python 3.10+, Rich, pytest, 继续使用dataclasses和typing

---

## Task 1: 添加Rich依赖

**Files:**
- Modify: `pyproject.toml`
- Modify: `requirements.txt`

**Step 1: 添加Rich到pyproject.toml**

在`[project.dependencies]`中添加`rich = ">=13.0.0"`

**Step 2: 添加Rich到requirements.txt**

添加`rich>=13.0.0`

**Step 3: 安装依赖**

Run: `pip install -e ".[dev]"`
Expected: Successfully installed rich

**Step 4: 提交**

```bash
git add pyproject.toml requirements.txt
git commit -m "feat: add Rich library dependency for CLI interface"
```

---

## Task 2: CLI显示基础 - CardDisplay

**Files:**
- Create: `cli/__init__.py`
- Create: `cli/display/__init__.py`
- Create: `cli/display/card_display.py`
- Create: `tests/unit/test_card_display.py`

**Step 1: 编写测试**

```python
"""Tests for CardDisplay."""
import pytest
from rich.console import Console
from cli.display.card_display import CardDisplay
from hearthstone.models.card import Minion, Spell, Weapon
from hearthstone.models.enums import HeroClass, Ability


def test_render_minion():
    """Test rendering a minion card."""
    minion = Minion(
        id="TEST_001",
        name="Test Minion",
        cost=3,
        attack=2,
        health=3,
        hero_class=HeroClass.NEUTRAL
    )
    result = CardDisplay.render_minion(minion)
    assert "Test Minion" in result
    assert "2/3" in result
    assert "3" in result  # cost


def test_render_minion_with_abilities():
    """Test rendering minion with taunt."""
    minion = Minion(
        id="TEST_002",
        name="Taunt Minion",
        cost=4,
        attack=3,
        health=5,
        hero_class=HeroClass.NEUTRAL,
        abilities={Ability.TAUNT}
    )
    result = CardDisplay.render_minion(minion)
    assert "Taunt Minion" in result
    assert "嘲讽" in result or "TAUNT" in result


def test_render_spell():
    """Test rendering a spell card."""
    spell = Spell(
        id="TEST_003",
        name="Fireball",
        cost=4,
        hero_class=HeroClass.MAGE,
        description="Deal 6 damage"
    )
    result = CardDisplay.render_spell(spell)
    assert "Fireball" in result
    assert "4" in result
    assert "Deal 6 damage" in result
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_card_display.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: 实现CardDisplay**

```python
"""Card display utilities using Rich."""
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from hearthstone.models.card import Card, Minion, Spell, Weapon
from hearthstone.models.enums import Ability


class CardDisplay:
    """Display cards using Rich formatting."""

    @staticmethod
    def render_minion(minion: Minion, show_details: bool = True) -> str:
        """Render a minion card as a formatted string."""
        parts = [f"[bold]{minion.name}[/bold]"]
        parts.append(f"[dim]费用: {minion.cost}[/dim]")

        if show_details:
            stats = f"[green]{minion.attack}[/green]/[red]{minion.health}[/red]"
            parts.append(stats)

            if minion.abilities:
                abilities_str = ", ".join(a.value for a in minion.abilities)
                parts.append(f"[yellow]{abilities_str}[/yellow]")

        return " | ".join(parts)

    @staticmethod
    def render_spell(spell: Spell) -> str:
        """Render a spell card as a formatted string."""
        parts = [f"[bold]{spell.name}[/bold]"]
        parts.append(f"[dim]费用: {spell.cost}[/dim]")
        if spell.description:
            parts.append(f"[italic]{spell.description}[/italic]")
        return " | ".join(parts)

    @staticmethod
    def render_weapon(weapon: Weapon) -> str:
        """Render a weapon card as a formatted string."""
        parts = [f"[bold]{weapon.name}[/bold]"]
        parts.append(f"[dim]费用: {weapon.cost}[/dim]")
        parts.append(f"[green]{weapon.attack}[/green]/[cyan]{weapon.durability}[/cyan]")
        return " | ".join(parts)

    @staticmethod
    def render_minion_board(minion: Minion, index: int = None) -> Panel:
        """Render a minion on the board as a Panel."""
        title = f"[{index}] {minion.name}" if index is not None else minion.name

        # Color based on state
        if minion.can_attack:
            color = "green"
        else:
            color = "dim"

        content = f"[{color}]{minion.attack}/{minion.health}[/{color}]"

        # Add taunt indicator
        if Ability.TAUNT in minion.abilities:
            border_style = "yellow"
        else:
            border_style = "white"

        return Panel(content, title=title, border_style=border_style)
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/test_card_display.py -v`
Expected: PASS (3 tests)

**Step 5: 提交**

```bash
git add cli/ tests/unit/test_card_display.py
git commit -m "feat: add CardDisplay with Rich formatting

- Add card rendering with colors and formatting
- Support minions, spells, and weapons
- Add unit tests"
```

---

## Task 3: CLI显示 - GameDisplay

**Files:**
- Create: `cli/display/game_display.py`
- Create: `tests/unit/test_game_display.py`

**Step 1: 编写测试**

```python
"""Tests for GameDisplay."""
import pytest
from cli.display.game_display import GameDisplay
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass


def test_render_game_state(capsys):
    """Test rendering complete game state."""
    player1 = Player(
        hero=Hero(hero_class=HeroClass.MAGE, health=30),
        name="Player 1",
        mana=5,
        max_mana=5
    )
    player2 = Player(
        hero=Hero(hero_class=HeroClass.WARRIOR, health=28),
        name="Player 2",
        mana=4,
        max_mana=4
    )

    # Add a minion to player1's board
    minion = Minion(id="TEST_001", name="Test", cost=2, attack=2, health=3)
    player1.board.append(minion)

    game_state = GameState(player1=player1, player2=player2)

    display = GameDisplay()
    display.render_game_state(game_state)

    # Check output contains key information
    captured = capsys.readouterr()
    assert "Player 1" in captured.out or "玩家" in captured.out
    assert "30" in captured.out  # health
    assert "5" in captured.out  # mana
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_game_display.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: 实现GameDisplay**

```python
"""Game state display using Rich."""
from rich.console import Console
from rich.panel import Panel
from rich.columns import Columns
from rich.table import Table
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.card import Minion
from cli.display.card_display import CardDisplay


class GameDisplay:
    """Display complete game state using Rich."""

    def __init__(self):
        self.console = Console()

    def render_game_state(self, game_state: GameState):
        """Render complete game state."""
        self.console.clear()

        # Render opponent info
        self._render_player_header(game_state.opposing_player, "对手")

        # Render board
        self._render_board(game_state)

        # Render current player info
        self._render_player_header(game_state.current_player, "你的英雄")

        # Render hand
        self._render_hand(game_state.current_player)

    def _render_player_header(self, player: Player, label: str):
        """Render player information header."""
        table = Table(title=f"{label}: {player.name}")
        table.add_column("职业", justify="center")
        table.add_column("生命", justify="center")
        table.add_column("护甲", justify="center")
        table.add_column("法力", justify="center")
        table.add_column("手牌", justify="center")

        table.add_row(
            player.hero.hero_class.value,
            f"[red]{player.hero.health}[red]/[green]{player.hero.max_health}[/green]",
            str(player.hero.armor),
            f"[blue]{player.mana}/{player.max_mana}[/blue]",
            str(len(player.hand))
        )

        self.console.print(table)

    def _render_board(self, game_state: GameState):
        """Render the board with minions."""
        self.console.print("\n[bold]战场[/bold]\n")

        # Opponent's minions
        if game_state.opposing_player.board:
            opponent_minions = [
                CardDisplay.render_minion_board(m, i)
                for i, m in enumerate(game_state.opposing_player.board)
            ]
            self.console.print(Columns(opponent_minions))
        else:
            self.console.print("[dim]对手场上没有随从[/dim]")

        self.console.print("\n" + "-" * 50 + "\n")

        # Current player's minions
        if game_state.current_player.board:
            player_minions = [
                CardDisplay.render_minion_board(m, i)
                for i, m in enumerate(game_state.current_player.board)
            ]
            self.console.print(Columns(player_minions))
        else:
            self.console.print("[dim]你的场上没有随从[/dim]")

        self.console.print()

    def _render_hand(self, player: Player):
        """Render player's hand."""
        self.console.print("\n[bold]你的手牌[/bold]\n")

        if not player.hand:
            self.console.print("[dim]手牌为空[/dim]")
            return

        for i, card in enumerate(player.hand, 1):
            if isinstance(card, Minion):
                card_str = CardDisplay.render_minion(card)
            else:
                card_str = CardDisplay.render_spell(card)

            self.console.print(f"[{i}] {card_str}")
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/test_game_display.py -v`
Expected: PASS

**Step 5: 提交**

```bash
git add cli/display/game_display.py tests/unit/test_game_display.py
git commit -m "feat: add GameDisplay with Rich layout

- Render complete game state with tables and panels
- Display board, hand, and player info
- Add unit tests"
```

---

## Task 4: 攻击系统 - AttackValidator

**Files:**
- Create: `hearthstone/engine/attack/__init__.py`
- Create: `hearthstone/engine/attack/attack_validator.py`
- Create: `tests/unit/test_attack_validator.py`

**Step 1: 编写测试**

```python
"""Tests for AttackValidator."""
import pytest
from hearthstone.engine.attack.attack_validator import AttackValidator
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass, Ability


def create_test_game():
    """Create a test game state."""
    player1 = Player(
        hero=Hero(hero_class=HeroClass.MAGE),
        name="Player 1"
    )
    player2 = Player(
        hero=Hero(hero_class=HeroClass.WARRIOR),
        name="Player 2"
    )
    return GameState(player1=player1, player2=player2)


def test_validate_minion_attack_hero():
    """Test minion attacking enemy hero."""
    game = create_test_game()
    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=2,
        health=2,
        can_attack=True
    )
    game.current_player.board.append(attacker)

    validator = AttackValidator()
    result = validator.validate_attack(attacker, "enemy_hero", game)

    assert result.valid
    assert "enemy_hero" in result.legal_targets


def test_validate_attack_with_taunt():
    """Test must attack taunt minion first."""
    game = create_test_game()

    # Add taunt minion to opponent's board
    taunt = Minion(
        id="TEST_002",
        name="Taunt",
        cost=3,
        attack=2,
        health=5,
        abilities={Ability.TAUNT}
    )
    game.opposing_player.board.append(taunt)

    # Add another minion without taunt
    other = Minion(id="TEST_003", name="Other", cost=2, attack=1, health=1)
    game.opposing_player.board.append(other)

    # Add attacker to current player's board
    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=2,
        health=2,
        can_attack=True
    )
    game.current_player.board.append(attacker)

    validator = AttackValidator()

    # Should fail - must attack taunt first
    result = validator.validate_attack(attacker, "TEST_003", game)
    assert not result.valid
    assert "嘲讽" in result.errors[0] or "taunt" in result.errors[0].lower()

    # Should succeed - attacking taunt
    result = validator.validate_attack(attacker, "TEST_002", game)
    assert result.valid


def test_validate_cannot_attack_twice():
    """Test minion cannot attack twice in one turn."""
    game = create_test_game()
    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=2,
        health=2,
        can_attack=False  # Already attacked
    )
    game.current_player.board.append(attacker)

    validator = AttackValidator()
    result = validator.validate_attack(attacker, "enemy_hero", game)

    assert not result.valid
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_attack_validator.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: 实现AttackValidator**

```python
"""Attack validation logic."""
from dataclasses import dataclass
from typing import List, Optional
from hearthstone.models.game_state import GameState
from hearthstone.models.card import Minion
from hearthstone.models.enums import Ability


@dataclass
class ValidationResult:
    """Result of attack validation."""
    valid: bool
    errors: List[str]
    legal_targets: List[str]


class AttackValidator:
    """Validate attack actions."""

    def validate_attack(
        self,
        attacker: Minion,
        target_id: str,
        game_state: GameState
    ) -> ValidationResult:
        """Validate if an attack is legal."""
        errors = []

        # Check if attacker can attack
        if not self._can_attack(attacker):
            errors.append("攻击者无法攻击（可能已经攻击过或被冻结）")

        # Check if target is valid
        if not self._is_valid_target(target_id, game_state):
            errors.append(f"无效的目标: {target_id}")

        # Check taunt restriction
        if self._must_attack_taunt(game_state):
            target = self._get_target(target_id, game_state)
            if target and not self._is_taunt(target):
                errors.append("必须先攻击嘲讽随从")

        # Get legal targets for helpful error messages
        legal_targets = self._get_legal_targets(attacker, game_state)

        return ValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            legal_targets=legal_targets
        )

    def _can_attack(self, attacker: Minion) -> bool:
        """Check if attacker can attack."""
        return attacker.can_attack and Ability.FROZEN not in attacker.abilities

    def _is_valid_target(self, target_id: str, game_state: GameState) -> bool:
        """Check if target exists and is attackable."""
        if target_id == "enemy_hero":
            return True

        # Check if target is on opposing board
        for minion in game_state.opposing_player.board:
            if minion.id == target_id:
                return True

        return False

    def _must_attack_taunt(self, game_state: GameState) -> bool:
        """Check if there are taunt minions on opposing board."""
        for minion in game_state.opposing_player.board:
            if Ability.TAUNT in minion.abilities:
                return True
        return False

    def _is_taunt(self, target) -> bool:
        """Check if target has taunt."""
        if isinstance(target, Minion):
            return Ability.TAUNT in target.abilities
        return False

    def _get_target(self, target_id: str, game_state: GameState) -> Optional[Minion]:
        """Get target minion by ID."""
        for minion in game_state.opposing_player.board:
            if minion.id == target_id:
                return minion
        return None

    def _get_legal_targets(self, attacker: Minion, game_state: GameState) -> List[str]:
        """Get all legal targets for an attacker."""
        targets = []

        # If must attack taunt, only return taunt minions
        if self._must_attack_taunt(game_state):
            for minion in game_state.opposing_player.board:
                if Ability.TAUNT in minion.abilities:
                    targets.append(minion.id)
        else:
            # Can attack any minion or hero
            targets.append("enemy_hero")
            for minion in game_state.opposing_player.board:
                targets.append(minion.id)

        return targets
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/test_attack_validator.py -v`
Expected: PASS (3 tests)

**Step 5: 提交**

```bash
git add hearthstone/engine/attack/ tests/unit/test_attack_validator.py
git commit -m "feat: add AttackValidator with taunt and windfury support

- Validate attack actions
- Check taunt restrictions
- Return legal targets list
- Add comprehensive tests"
```

---

## Task 5: 攻击系统 - AttackExecutor

**Files:**
- Create: `hearthstone/engine/attack/attack_executor.py`
- Create: `tests/unit/test_attack_executor.py`

**Step 1: 编写测试**

```python
"""Tests for AttackExecutor."""
import pytest
from hearthstone.engine.attack.attack_executor import AttackExecutor
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass


def create_test_game():
    """Create a test game state."""
    player1 = Player(
        hero=Hero(hero_class=HeroClass.MAGE),
        name="Player 1"
    )
    player2 = Player(
        hero=Hero(hero_class=HeroClass.WARRIOR),
        name="Player 2"
    )
    return GameState(player1=player1, player2=player2)


def test_execute_attack_on_hero():
    """Test attacking enemy hero."""
    game = create_test_game()
    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=3,
        health=2,
        can_attack=True
    )
    game.current_player.board.append(attacker)

    executor = AttackExecutor()
    result = executor.execute_attack(attacker, "enemy_hero", game)

    assert result.success
    assert game.opposing_player.hero.health == 27  # 30 - 3
    assert not attacker.can_attack  # Should not be able to attack again


def test_execute_attack_on_minion():
    """Test attacking enemy minion."""
    game = create_test_game()

    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=3,
        health=2,
        can_attack=True
    )
    defender = Minion(
        id="TEST_002",
        name="Defender",
        cost=2,
        attack=1,
        health=3
    )

    game.current_player.board.append(attacker)
    game.opposing_player.board.append(defender)

    executor = AttackExecutor()
    result = executor.execute_attack(attacker, "TEST_002", game)

    assert result.success
    assert defender.health == 0  # 3 - 3
    assert attacker.health == 1  # 2 - 1
    assert len(game.opposing_player.graveyard) == 1  # Defender died


def test_execute_attack_with_windfury():
    """Test minion with windfury can attack twice."""
    from hearthstone.models.enums import Ability

    game = create_test_game()
    attacker = Minion(
        id="TEST_001",
        name="Windfury",
        cost=4,
        attack=2,
        health=2,
        abilities={Ability.WINDFURY},
        can_attack=True
    )
    game.current_player.board.append(attacker)

    executor = AttackExecutor()

    # First attack
    result = executor.execute_attack(attacker, "enemy_hero", game)
    assert result.success
    assert attacker.can_attack  # Can still attack
    assert attacker.attacks_this_turn == 1

    # Second attack
    result = executor.execute_attack(attacker, "enemy_hero", game)
    assert result.success
    assert not attacker.can_attack  # Cannot attack anymore
    assert attacker.attacks_this_turn == 2
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_attack_executor.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: 实现AttackExecutor**

```python
"""Attack execution logic."""
from dataclasses import dataclass
from typing import List, Optional, Union
from hearthstone.models.game_state import GameState
from hearthstone.models.card import Minion
from hearthstone.models.hero import Hero
from hearthstone.models.enums import Ability


@dataclass
class AttackResult:
    """Result of attack execution."""
    success: bool
    message: str = ""
    deaths: List[Minion] = None

    def __post_init__(self):
        if self.deaths is None:
            self.deaths = []


class AttackExecutor:
    """Execute attack actions."""

    def execute_attack(
        self,
        attacker: Minion,
        target_id: str,
        game_state: GameState
    ) -> AttackResult:
        """Execute an attack."""
        deaths = []

        # Get target
        target = self._get_target(target_id, game_state)
        if target is None:
            return AttackResult(success=False, message="Target not found")

        # Deal damage to target
        self._deal_damage(attacker, target)

        # Deal damage to attacker (if target is a minion)
        if isinstance(target, Minion):
            self._deal_damage(target, attacker)

        # Check for deaths
        deaths = self._check_deaths(game_state)

        # Update attacker state
        attacker.can_attack = False
        attacker.attacks_this_turn += 1

        # Windfury: can attack twice
        if Ability.WINDFURY in attacker.abilities and attacker.attacks_this_turn < 2:
            attacker.can_attack = True

        return AttackResult(
            success=True,
            message=f"{attacker.name} attacked {target_id}",
            deaths=deaths
        )

    def _get_target(
        self,
        target_id: str,
        game_state: GameState
    ) -> Optional[Union[Minion, Hero]]:
        """Get target by ID."""
        if target_id == "enemy_hero":
            return game_state.opposing_player.hero

        for minion in game_state.opposing_player.board:
            if minion.id == target_id:
                return minion

        return None

    def _deal_damage(self, source: Union[Minion, Hero], target: Union[Minion, Hero]):
        """Deal damage from source to target."""
        damage = 0
        if isinstance(source, Minion):
            damage = source.attack
        elif isinstance(source, Hero):
            damage = source.attack

        if damage > 0:
            if isinstance(target, Minion):
                target.take_damage(damage)
            elif isinstance(target, Hero):
                target.take_damage(damage)

    def _check_deaths(self, game_state: GameState) -> List[Minion]:
        """Check and process deaths."""
        deaths = []

        # Check both boards
        for player in [game_state.current_player, game_state.opposing_player]:
            dead_minions = [m for m in player.board if m.is_dead()]
            for minion in dead_minions:
                player.board.remove(minion)
                player.graveyard.append(minion)
                deaths.append(minion)

        return deaths
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/test_attack_executor.py -v`
Expected: PASS (3 tests)

**Step 5: 提交**

```bash
git add hearthstone/engine/attack/attack_executor.py tests/unit/test_attack_executor.py
git commit -m "feat: add AttackExecutor for damage and death processing

- Execute attacks with damage calculation
- Handle minion vs minion combat
- Process deaths and graveyard
- Support windfury ability
- Add comprehensive tests"
```

---

## Task 6: 更新GameEngine支持攻击

**Files:**
- Modify: `hearthstone/engine/game_engine.py`
- Modify: `tests/unit/test_game_engine.py`

**Step 1: 添加攻击测试**

在`test_game_engine.py`中添加:

```python
def test_engine_attack_action():
    """Test attacking with a minion."""
    from hearthstone.engine.action import AttackAction
    from hearthstone.models.card import Minion

    engine = create_test_engine()

    # Add minion to current player's board
    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=3,
        health=2,
        can_attack=True
    )
    engine.state.current_player.board.append(attacker)

    action = AttackAction(
        player_id="Player 1",
        attacker_id="TEST_001",
        target_id="enemy_hero"
    )
    result = engine.take_action(action)

    assert result.success
    assert engine.state.opposing_player.hero.health == 27
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_game_engine.py::test_engine_attack_action -v`
Expected: FAIL with attack not implemented

**Step 3: 更新GameEngine**

在`game_engine.py`中添加attack导入和实现:

```python
# Add import at top
from hearthstone.engine.attack.attack_validator import AttackValidator
from hearthstone.engine.attack.attack_executor import AttackExecutor

# In __init__:
def __init__(self):
    self.state: Optional[GameState] = None
    self.attack_validator = AttackValidator()
    self.attack_executor = AttackExecutor()

# Update _execute_attack:
def _execute_attack(self, action: AttackAction) -> ActionResult:
    """Execute attack action."""
    player = self.state.current_player

    # Find attacker
    attacker = None
    for minion in player.board:
        if minion.id == action.attacker_id:
            attacker = minion
            break

    if not attacker:
        return ActionResult(
            success=False,
            message=f"Attacker not found: {action.attacker_id}"
        )

    # Validate attack
    validation = self.attack_validator.validate_attack(
        attacker, action.target_id, self.state
    )

    if not validation.valid:
        return ActionResult(
            success=False,
            message="; ".join(validation.errors)
        )

    # Execute attack
    result = self.attack_executor.execute_attack(
        attacker, action.target_id, self.state
    )

    return ActionResult(
        success=result.success,
        message=result.message,
        game_over=self.state.is_game_over()
    )
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/test_game_engine.py::test_engine_attack_action -v`
Expected: PASS

**Step 5: 提交**

```bash
git add hearthstone/engine/game_engine.py tests/unit/test_game_engine.py
git commit -m "feat: integrate attack system into GameEngine

- Add AttackValidator and AttackExecutor to engine
- Implement _execute_attack method
- Add attack integration test"
```

---

## Task 7: 输入处理 - CommandParser

**Files:**
- Create: `cli/input/__init__.py`
- Create: `cli/input/command_parser.py`
- Create: `tests/unit/test_command_parser.py`

**Step 1: 编写测试**

```python
"""Tests for CommandParser."""
import pytest
from cli.input.command_parser import CommandParser
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass
from hearthstone.engine.action import PlayCardAction, AttackAction, EndTurnAction


def create_test_game():
    """Create a test game state."""
    player1 = Player(
        hero=Hero(hero_class=HeroClass.MAGE),
        name="Player 1"
    )
    player2 = Player(
        hero=Hero(class=HeroClass.WARRIOR),
        name="Player 2"
    )
    # Add a card to hand
    card = Minion(id="TEST_001", name="Test", cost=2, attack=2, health=2)
    player1.hand.append(card)

    # Add a minion to board
    minion = Minion(id="TEST_002", name="Board Minion", cost=3, attack=3, health=3, can_attack=True)
    player1.board.append(minion)

    return GameState(player1=player1, player2=player2)


def test_parse_play_command():
    """Test parsing play command."""
    game = create_test_game()
    action = CommandParser.parse("play 1", game)

    assert isinstance(action, PlayCardAction)
    assert action.card_index == 0


def test_parse_attack_command():
    """Test parsing attack command."""
    game = create_test_game()
    action = CommandParser.parse("attack TEST_002 enemy_hero", game)

    assert isinstance(action, AttackAction)
    assert action.attacker_id == "TEST_002"
    assert action.target_id == "enemy_hero"


def test_parse_end_command():
    """Test parsing end turn command."""
    game = create_test_game()
    action = CommandParser.parse("end", game)

    assert isinstance(action, EndTurnAction)


def test_parse_invalid_command():
    """Test parsing invalid command."""
    game = create_test_game()

    with pytest.raises(ValueError, match="未知命令"):
        CommandParser.parse("invalid", game)
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_command_parser.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: 实现CommandParser**

```python
"""Command parsing for CLI input."""
from typing import Optional
from hearthstone.models.game_state import GameState
from hearthstone.engine.action import (
    Action,
    PlayCardAction,
    AttackAction,
    EndTurnAction,
    HeroPowerAction
)


class CommandParser:
    """Parse command-style input."""

    @staticmethod
    def parse(command: str, game_state: GameState) -> Action:
        """Parse a command string into an Action."""
        tokens = command.strip().lower().split()

        if not tokens:
            raise ValueError("空命令")

        cmd = tokens[0]

        if cmd == "play":
            return CommandParser._parse_play(tokens[1:], game_state)
        elif cmd == "attack":
            return CommandParser._parse_attack(tokens[1:], game_state)
        elif cmd == "end":
            return EndTurnAction(player_id=game_state.current_player.name)
        elif cmd == "hero":
            return CommandParser._parse_hero_power(tokens[1:], game_state)
        else:
            raise ValueError(f"未知命令: {cmd}")

    @staticmethod
    def _parse_play(args: list, game_state: GameState) -> PlayCardAction:
        """Parse play command."""
        if not args:
            raise ValueError("play命令需要卡牌编号")

        try:
            card_index = int(args[0])
        except ValueError:
            raise ValueError("卡牌编号必须是数字")

        target_id = args[1] if len(args) > 1 else None

        return PlayCardAction(
            player_id=game_state.current_player.name,
            card_index=card_index,
            target_id=target_id
        )

    @staticmethod
    def _parse_attack(args: list, game_state: GameState) -> AttackAction:
        """Parse attack command."""
        if len(args) < 2:
            raise ValueError("attack命令需要攻击者和目标")

        attacker_id = args[0]
        target_id = args[1]

        return AttackAction(
            player_id=game_state.current_player.name,
            attacker_id=attacker_id,
            target_id=target_id
        )

    @staticmethod
    def _parse_hero_power(args: list, game_state: GameState) -> HeroPowerAction:
        """Parse hero power command."""
        target_id = args[0] if args else None

        return HeroPowerAction(
            player_id=game_state.current_player.name,
            target_id=target_id
        )
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/test_command_parser.py -v`
Expected: PASS (4 tests)

**Step 5: 提交**

```bash
git add cli/input/ tests/unit/test_command_parser.py
git commit -m "feat: add CommandParser for CLI commands

- Parse play, attack, end, hero commands
- Support command-style input
- Add comprehensive tests"
```

---

## Task 8: 输入处理 - InputHandler

**Files:**
- Create: `cli/input/input_handler.py`
- Create: `tests/unit/test_input_handler.py`

**Step 1: 编写测试**

```python
"""Tests for InputHandler."""
import pytest
from unittest.mock import Mock, patch
from cli.input.input_handler import InputHandler
from hearthstone.engine.action import EndTurnAction, PlayCardAction
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.enums import HeroClass


def create_test_game():
    """Create a test game state."""
    player1 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 1")
    player2 = Player(hero=Hero(hero_class=HeroClass.WARRIOR), name="Player 2")
    return GameState(player1=player1, player2=player2)


def test_parse_number_input():
    """Test parsing number input."""
    game = create_test_game()
    display = Mock()

    handler = InputHandler(display)

    # Mock input to return "1"
    with patch('builtins.input', return_value="1"):
        action = handler.get_action(game)
        # Should parse to some action based on available options
        assert action is not None


def test_parse_command_mode():
    """Test switching to command mode."""
    game = create_test_game()
    display = Mock()

    handler = InputHandler(display)

    # Mock input to return ":" then "end"
    with patch('builtins.input', side_effect=[":", "end"]):
        action = handler.get_action(game)
        assert isinstance(action, EndTurnAction)
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_input_handler.py -v`
Expected: FAIL

**Step 3: 实现InputHandler**

```python
"""Input handling for CLI."""
from typing import Optional
from hearthstone.models.game_state import GameState
from hearthstone.engine.action import Action, EndTurnAction
from cli.display.game_display import GameDisplay
from cli.input.command_parser import CommandParser


class InputHandler:
    """Handle user input in the CLI."""

    def __init__(self, display: GameDisplay):
        self.display = display
        self.mode = "number"

    def get_action(self, game_state: GameState) -> Action:
        """Get user input and convert to action."""
        while True:
            try:
                user_input = input("\n请选择操作 (输入数字或:进入命令模式): ").strip()

                if user_input == ":":
                    # Command mode
                    command = input("命令: ").strip()
                    return CommandParser.parse(command, game_state)
                else:
                    # Number mode
                    return self._parse_number(user_input, game_state)

            except ValueError as e:
                print(f"输入错误: {e}")
                print("请重试")
                continue

    def _parse_number(self, input_str: str, game_state: GameState) -> Action:
        """Parse number input to action."""
        try:
            choice = int(input_str)
        except ValueError:
            raise ValueError("请输入数字")

        # Map number to action based on game state
        # 1-N: Play card (hand index)
        # N+1: Attack options
        # Last: End turn

        hand_size = len(game_state.current_player.hand)

        if 1 <= choice <= hand_size:
            # Play a card
            return PlayCardAction(
                player_id=game_state.current_player.name,
                card_index=choice - 1  # 0-indexed
            )
        elif choice == hand_size + 1:
            # End turn
            return EndTurnAction(player_id=game_state.current_player.name)
        else:
            raise ValueError(f"无效选择: {choice}")
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/test_input_handler.py -v`
Expected: PASS

**Step 5: 提交**

```bash
git add cli/input/input_handler.py tests/unit/test_input_handler.py
git commit -m "feat: add InputHandler for user input processing

- Support number and command modes
- Parse user input to game actions
- Add input validation and error handling
- Add unit tests"
```

---

## Task 9: 菜单系统 - MenuDisplay

**Files:**
- Create: `cli/display/menu_display.py`
- Create: `tests/unit/test_menu_display.py`

**Step 1: 编写测试**

```python
"""Tests for MenuDisplay."""
import pytest
from cli.display.menu_display import MenuDisplay


def test_render_main_menu(capsys):
    """Test rendering main menu."""
    display = MenuDisplay()
    display.render_main_menu()

    captured = capsys.readouterr()
    assert "开始游戏" in captured.out or "Start" in captured.out
    assert "构建卡组" in captured.out or "Deck" in captured.out
    assert "退出" in captured.out or "Quit" in captured.out


def test_render_game_mode_menu(capsys):
    """Test rendering game mode menu."""
    display = MenuDisplay()
    display.render_game_mode_menu()

    captured = capsys.readouterr()
    assert "人 vs AI" in captured.out or "Human" in captured.out
    assert "AI vs AI" in captured.out
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/unit/test_menu_display.py -v`
Expected: FAIL

**Step 3: 实现MenuDisplay**

```python
"""Menu display using Rich."""
from rich.console import Console
from rich.panel import Panel


class MenuDisplay:
    """Display menus using Rich."""

    def __init__(self):
        self.console = Console()

    def render_main_menu(self):
        """Render main menu."""
        menu_text = """
[bold]炉石传说 CLI[/bold]

[1] 开始游戏
[2] 构建卡组
[3] 设置
[4] 退出
"""
        panel = Panel(menu_text, title="主菜单", border_style="blue")
        self.console.print(panel)

    def render_game_mode_menu(self):
        """Render game mode selection menu."""
        menu_text = """
[bold]选择游戏模式[/bold]

[1] 人 vs AI
[2] AI vs AI
[3] 返回
"""
        panel = Panel(menu_text, title="游戏模式", border_style="green")
        self.console.print(panel)

    def render_deck_builder_menu(self):
        """Render deck builder menu."""
        menu_text = """
[bold]卡组构建器[/bold]

[1] 创建新卡组
[2] 编辑卡组
[3] 删除卡组
[4] 返回
"""
        panel = Panel(menu_text, title="卡组构建", border_style="yellow")
        self.console.print(panel)

    def render_error(self, message: str):
        """Render error message."""
        self.console.print(f"[red]错误: {message}[/red]")

    def render_success(self, message: str):
        """Render success message."""
        self.console.print(f"[green]{message}[/green]")
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/unit/test_menu_display.py -v`
Expected: PASS

**Step 5: 提交**

```bash
git add cli/display/menu_display.py tests/unit/test_menu_display.py
git commit -m "feat: add MenuDisplay with Rich panels

- Render main, game mode, deck builder menus
- Add error and success message rendering
- Add unit tests"
```

---

## Task 10: 菜单系统 - MenuSystem

**Files:**
- Create: `cli/menu/__init__.py`
- Create: `cli/menu/menu_system.py`
- Create: `tests/integration/test_menu_system.py`

**Step 1: 编写集成测试**

```python
"""Integration tests for MenuSystem."""
import pytest
from unittest.mock import patch, Mock
from cli.menu.menu_system import MenuSystem


def test_menu_system_exit():
    """Test menu system can exit."""
    menu = MenuSystem()

    # Mock input to select "Exit" (option 4)
    with patch('builtins.input', return_value="4"):
        menu.run()

    assert not menu.running


def test_menu_system_game_mode_selection():
    """Test game mode selection."""
    menu = MenuSystem()

    # Mock inputs: select "Start Game" then "Human vs AI" then back then "Exit"
    with patch('builtins.input', side_effect=["1", "1", "3", "4"]):
        # Should not crash
        menu.run()
```

**Step 2: 运行测试验证失败**

Run: `pytest tests/integration/test_menu_system.py -v`
Expected: FAIL

**Step 3: 实现MenuSystem**

```python
"""Main menu system."""
from cli.display.menu_display import MenuDisplay
from cli.display.game_display import GameDisplay
from cli.input.input_handler import InputHandler
from hearthstone.engine.game_engine import GameEngine
from hearthstone.models.enums import HeroClass


class MenuSystem:
    """Main menu system controller."""

    def __init__(self):
        self.display = MenuDisplay()
        self.running = True

    def run(self):
        """Run main menu loop."""
        while self.running:
            self.display.render_main_menu()

            try:
                choice = input("请选择: ").strip()

                if choice == "1":
                    self._start_game_flow()
                elif choice == "2":
                    self._deck_builder_flow()
                elif choice == "3":
                    self._settings_flow()
                elif choice == "4":
                    self.running = False
                else:
                    self.display.render_error("无效选择")

            except KeyboardInterrupt:
                print("\n退出游戏")
                self.running = False

    def _start_game_flow(self):
        """Game mode selection and game start."""
        self.display.render_game_mode_menu()

        choice = input("请选择游戏模式: ").strip()

        if choice == "1":
            # Human vs AI
            self._start_human_vs_ai()
        elif choice == "2":
            # AI vs AI
            self._start_ai_vs_ai()
        elif choice == "3":
            # Back to main menu
            return
        else:
            self.display.render_error("无效选择")

    def _start_human_vs_ai(self):
        """Start human vs AI game."""
        engine = GameEngine()
        engine.initialize_game(
            player1_name="Player",
            player1_class=HeroClass.MAGE,
            player2_name="AI",
            player2_class=HeroClass.WARRIOR
        )

        game_display = GameDisplay()
        input_handler = InputHandler(game_display)

        # Main game loop
        while not engine.state.is_game_over():
            game_display.render_game_state(engine.state)

            action = input_handler.get_action(engine.state)
            result = engine.take_action(action)

            if not result.success:
                self.display.render_error(result.message)

        # Game over
        winner = engine.state.get_winner()
        self.display.render_success(f"游戏结束! {winner.name} 获胜!")

        input("\n按回车键返回主菜单...")

    def _start_ai_vs_ai(self):
        """Start AI vs AI game."""
        # TODO: Implement AI vs AI
        self.display.render_error("AI vs AI 模式尚未实现")

    def _deck_builder_flow(self):
        """Deck builder flow."""
        # TODO: Implement deck builder
        self.display.render_error("卡组构建器尚未实现")

    def _settings_flow(self):
        """Settings flow."""
        self.display.render_error("设置功能尚未实现")
```

**Step 4: 运行测试验证通过**

Run: `pytest tests/integration/test_menu_system.py -v`
Expected: PASS

**Step 5: 提交**

```bash
git add cli/menu/ tests/integration/test_menu_system.py
git commit -m "feat: add MenuSystem with main menu loop

- Implement main menu navigation
- Add Human vs AI game mode
- Integrate GameEngine and display
- Add integration tests"
```

---

## Task 11: 主程序入口

**Files:**
- Create: `main.py`
- Modify: `pyproject.toml` (add script entry point)

**Step 1: 创建main.py**

```python
#!/usr/bin/env python3
"""Main entry point for Hearthstone CLI."""
from cli.menu.menu_system import MenuSystem


def main():
    """Main entry point."""
    print("欢迎来到炉石传说 CLI!")
    print()

    menu = MenuSystem()
    menu.run()

    print("感谢游玩!")


if __name__ == "__main__":
    main()
```

**Step 2: 更新pyproject.toml**

添加script entry point:

```toml
[project.scripts]
hearthstone-cli = "main:main"
```

**Step 3: 测试运行**

Run: `python main.py` (手动测试， 应该显示主菜单)

**Step 4: 提交**

```bash
git add main.py pyproject.toml
git commit -m "feat: add main entry point

- Add main.py as entry point
- Add console script to pyproject.toml
- Display welcome message and menu"
```

---

## Task 12: 运行所有测试

**Step 1: 运行所有单元测试**

Run: `pytest tests/unit/ -v --cov=hearthstone --cov=cli`
Expected: All tests PASS

**Step 2: 运行所有集成测试**

Run: `pytest tests/integration/ -v`
Expected: All tests PASS

**Step 3: 运行所有测试**

Run: `pytest tests/ -v`
Expected: All tests PASS

**Step 4: 最终提交**

```bash
git add -A
git commit -m "chore: complete Phase 2 implementation

Phase 2 implementation complete with:
- Rich-based CLI display system
- Complete attack system (validator + executor)
- Command parser and input handler
- Menu system with Human vs AI mode
- Main entry point

All tests passing. Ready for Phase 3: Deck builder and additional features."
```

---

## Phase 2 完成标准

✅ CLI界面可显示完整游戏状态
✅ 攻击系统完整实现（嘲讽、风怒、伤害计算）
✅ 用户可以通过命令或数字进行操作
✅ 主菜单和游戏模式选择可用
✅ 可以运行人 vs AI游戏
✅ 所有新功能有测试覆盖
✅ 主程序入口可用

## 下一步：Phase 3

Phase 3 将实现：
- 完整的卡组构建器
- AI vs AI模式
- 更多卡牌数据
- 性能优化
- 用户体验改进
