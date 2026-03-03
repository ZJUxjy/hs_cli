# Hearthstone CLI Phase 3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implement unified game loop with Gymnasium AI training environment and enhanced CLI interface

**Architecture:** Single GameController manages game state, serving both Gymnasium environment (for AI training) and CLI interface (for human play)

**Tech Stack:** Python 3.10+, Gymnasium, NumPy, Rich, Pytest

---

## Task 1: GameController Core

**Files:**
- Create: `hearthstone/engine/game_controller.py`
- Create: `tests/unit/test_game_controller.py`

**Step 1: Write the failing test for GameController initialization**

```python
# tests/unit/test_game_controller.py
"""Tests for GameController."""
import pytest
from hearthstone.engine.game_controller import GameController, GameEvent
from hearthstone.models.deck import Deck
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass


def create_test_deck():
    """Create a simple test deck."""
    cards = []
    for i in range(30):
        cards.append(Minion(
            id=f"TEST_{i:03d}",
            name=f"Test Minion {i}",
            cost=2,
            attack=2,
            health=2
        ))
    return Deck(name="Test Deck", hero_class=HeroClass.MAGE, cards=cards)


def test_game_controller_initialization():
    """Test GameController can be initialized with two decks."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()

    controller = GameController(deck1, deck2)

    assert controller is not None
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_game_controller.py::test_game_controller_initialization -v`
Expected: FAIL with "ModuleNotFoundError" or "ImportError"

**Step 3: Create Deck model**

We need a Deck model first. Check if it exists:

```bash
grep -r "class Deck" hearthstone/models/
```

If not, create `hearthstone/models/deck.py`:

```python
from dataclasses import dataclass
from typing import List
from hearthstone.models.card import Card
from hearthstone.models.enums import HeroClass


@dataclass
class Deck:
    """Represents a deck of cards."""
    name: str
    hero_class: HeroClass
    cards: List[Card]

    def __post_init__(self):
        """Validate deck on creation."""
        if len(self.cards) != 30:
            raise ValueError(f"Deck must have exactly 30 cards, got {len(self.cards)}")
```

**Step 4: Write GameController skeleton**

```python
# hearthstone/engine/game_controller.py
"""Central game loop controller."""
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from hearthstone.models.deck import Deck
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.engine.action import Action
from hearthstone.engine.game_engine import GameEngine


@dataclass
class GameEvent:
    """Result of executing an action."""
    success: bool
    message: str
    state_changes: Dict[str, Any] = None
    errors: List[str] = None

    def __post_init__(self):
        if self.state_changes is None:
            self.state_changes = {}
        if self.errors is None:
            self.errors = []


class GameController:
    """Central game loop manager."""

    def __init__(self, deck1: Deck, deck2: Deck):
        """Initialize with two decks."""
        self.deck1 = deck1
        self.deck2 = deck2
        self.engine: Optional[GameEngine] = None

    def start_game(self) -> GameState:
        """Start a new game."""
        # TODO: Implement
        pass

    def get_valid_actions(self) -> List[Action]:
        """Get all legal actions for current player."""
        # TODO: Implement
        pass

    def execute_action(self, action: Action) -> GameEvent:
        """Execute an action and return result."""
        # TODO: Implement
        pass

    def get_state(self) -> GameState:
        """Get current game state."""
        # TODO: Implement
        pass

    def is_game_over(self) -> bool:
        """Check if game has ended."""
        # TODO: Implement
        pass

    def get_winner(self) -> Optional[Player]:
        """Get winner if game is over."""
        # TODO: Implement
        pass
```

**Step 5: Run test to verify it passes**

Run: `pytest tests/unit/test_game_controller.py::test_game_controller_initialization -v`
Expected: PASS

**Step 6: Commit**

```bash
git add hearthstone/models/deck.py hearthstone/engine/game_controller.py tests/unit/test_game_controller.py
git commit -m "feat: add GameController and Deck model skeleton"
```

---

## Task 2: GameController start_game()

**Files:**
- Modify: `hearthstone/engine/game_controller.py`
- Modify: `tests/unit/test_game_controller.py`

**Step 1: Write the failing test**

```python
# tests/unit/test_game_controller.py (add to existing file)
def test_game_controller_start_game():
    """Test starting a game."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()

    controller = GameController(deck1, deck2)
    state = controller.start_game()

    assert state is not None
    assert state.player1 is not None
    assert state.player2 is not None
    assert len(state.player1.deck) == 30
    assert len(state.player2.deck) == 30
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_game_controller.py::test_game_controller_start_game -v`
Expected: FAIL with assertion error

**Step 3: Implement start_game()**

```python
# hearthstone/engine/game_controller.py (update start_game method)
def start_game(self) -> GameState:
    """Start a new game."""
    # Create players with decks
    from hearthstone.models.hero import Hero
    from hearthstone.models.player import Player

    player1 = Player(
        hero=Hero(hero_class=self.deck1.hero_class),
        name="Player 1"
    )
    player1.deck = self.deck1.cards.copy()

    player2 = Player(
        hero=Hero(hero_class=self.deck2.hero_class),
        name="Player 2"
    )
    player2.deck = self.deck2.cards.copy()

    # Create game state
    from hearthstone.models.game_state import GameState
    state = GameState(player1=player1, player2=player2)

    # Create game engine
    self.engine = GameEngine(state)

    # Initialize game (draw starting hands)
    self.engine.initialize_game()

    return state
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/test_game_controller.py::test_game_controller_start_game -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/engine/game_controller.py tests/unit/test_game_controller.py
git commit -m "feat: implement GameController.start_game()"
```

---

## Task 3: GameController get_state() and is_game_over()

**Files:**
- Modify: `hearthstone/engine/game_controller.py`
- Modify: `tests/unit/test_game_controller.py`

**Step 1: Write the failing tests**

```python
# tests/unit/test_game_controller.py (add to existing file)
def test_game_controller_get_state():
    """Test getting game state."""
    controller = GameController(create_test_deck(), create_test_deck())
    controller.start_game()

    state = controller.get_state()

    assert state is not None
    assert state.player1 is not None


def test_game_controller_is_game_over():
    """Test checking if game is over."""
    controller = GameController(create_test_deck(), create_test_deck())
    controller.start_game()

    # Game just started, should not be over
    assert not controller.is_game_over()
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/test_game_controller.py::test_game_controller_get_state tests/unit/test_game_controller.py::test_game_controller_is_game_over -v`
Expected: FAIL with assertion error

**Step 3: Implement get_state() and is_game_over()**

```python
# hearthstone/engine/game_controller.py (update methods)
def get_state(self) -> GameState:
    """Get current game state."""
    if self.engine is None:
        raise RuntimeError("Game not started. Call start_game() first.")
    return self.engine.state


def is_game_over(self) -> bool:
    """Check if game has ended."""
    if self.engine is None:
        return False
    return self.engine.state.is_game_over()
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_game_controller.py::test_game_controller_get_state tests/unit/test_game_controller.py::test_game_controller_is_game_over -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/engine/game_controller.py tests/unit/test_game_controller.py
git commit -m "feat: implement GameController state accessors"
```

---

## Task 4: GameController get_valid_actions()

**Files:**
- Modify: `hearthstone/engine/game_controller.py`
- Modify: `tests/unit/test_game_controller.py`

**Step 1: Write the failing test**

```python
# tests/unit/test_game_controller.py (add to existing file)
def test_game_controller_get_valid_actions():
    """Test getting valid actions."""
    controller = GameController(create_test_deck(), create_test_deck())
    controller.start_game()

    actions = controller.get_valid_actions()

    assert actions is not None
    assert len(actions) > 0
    # Should always be able to end turn
    from hearthstone.engine.action import EndTurnAction
    assert any(isinstance(a, EndTurnAction) for a in actions)
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_game_controller.py::test_game_controller_get_valid_actions -v`
Expected: FAIL

**Step 3: Implement get_valid_actions()**

```python
# hearthstone/engine/game_controller.py (update method)
def get_valid_actions(self) -> List[Action]:
    """Get all legal actions for current player."""
    if self.engine is None:
        raise RuntimeError("Game not started. Call start_game() first.")

    actions = []
    state = self.engine.state
    player = state.current_player

    # Can always end turn
    from hearthstone.engine.action import EndTurnAction
    actions.append(EndTurnAction(player_id=player.name))

    # Can play cards from hand (if enough mana)
    from hearthstone.engine.action import PlayCardAction
    for i, card in enumerate(player.hand):
        if card.cost <= player.mana:
            actions.append(PlayCardAction(
                player_id=player.name,
                card_index=i
            ))

    # Can attack with minions
    from hearthstone.engine.action import AttackAction
    from hearthstone.engine.attack.attack_validator import AttackValidator

    validator = AttackValidator()
    for minion in player.board:
        if minion.can_attack:
            # Check all possible targets
            validation = validator.validate_attack(minion, "enemy_hero", state)
            if validation.valid:
                actions.append(AttackAction(
                    player_id=player.name,
                    attacker_id=minion.id,
                    target_id="enemy_hero"
                ))

            for enemy_minion in state.opposing_player.board:
                validation = validator.validate_attack(minion, enemy_minion.id, state)
                if validation.valid:
                    actions.append(AttackAction(
                        player_id=player.name,
                        attacker_id=minion.id,
                        target_id=enemy_minion.id
                    ))

    return actions
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/test_game_controller.py::test_game_controller_get_valid_actions -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/engine/game_controller.py tests/unit/test_game_controller.py
git commit -m "feat: implement GameController.get_valid_actions()"
```

---

## Task 5: GameController execute_action()

**Files:**
- Modify: `hearthstone/engine/game_controller.py`
- Modify: `tests/unit/test_game_controller.py`

**Step 1: Write the failing test**

```python
# tests/unit/test_game_controller.py (add to existing file)
def test_game_controller_execute_end_turn():
    """Test executing end turn action."""
    controller = GameController(create_test_deck(), create_test_deck())
    controller.start_game()

    initial_player = controller.get_state().current_player

    from hearthstone.engine.action import EndTurnAction
    action = EndTurnAction(player_id=initial_player.name)
    event = controller.execute_action(action)

    assert event.success
    # Turn should have switched
    new_player = controller.get_state().current_player
    assert new_player.name != initial_player.name
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_game_controller.py::test_game_controller_execute_end_turn -v`
Expected: FAIL

**Step 3: Implement execute_action()**

```python
# hearthstone/engine/game_controller.py (update method)
def execute_action(self, action: Action) -> GameEvent:
    """Execute an action and return result."""
    if self.engine is None:
        raise RuntimeError("Game not started. Call start_game() first.")

    try:
        # Use game engine to execute
        self.engine.take_action(action)

        return GameEvent(
            success=True,
            message=f"Action {action.__class__.__name__} executed successfully",
            state_changes={"action": action.__class__.__name__}
        )
    except Exception as e:
        return GameEvent(
            success=False,
            message=str(e),
            errors=[str(e)]
        )
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/test_game_controller.py::test_game_controller_execute_end_turn -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/engine/game_controller.py tests/unit/test_game_controller.py
git commit -m "feat: implement GameController.execute_action()"
```

---

## Task 6: DeckManager - Load/Save Decks

**Files:**
- Create: `hearthstone/decks/__init__.py`
- Create: `hearthstone/decks/deck_manager.py`
- Create: `tests/unit/test_deck_manager.py`

**Step 1: Write the failing test**

```python
# tests/unit/test_deck_manager.py
"""Tests for DeckManager."""
import pytest
from hearthstone.decks.deck_manager import DeckManager


def test_deck_manager_list_decks():
    """Test listing available decks."""
    manager = DeckManager()
    decks = manager.list_decks()

    assert isinstance(decks, list)


def test_deck_manager_load_nonexistent():
    """Test loading a deck that doesn't exist."""
    manager = DeckManager()

    with pytest.raises(FileNotFoundError):
        manager.load_deck("nonexistent_deck")
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/test_deck_manager.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: Create DeckManager skeleton**

```python
# hearthstone/decks/__init__.py
"""Deck management module."""
from hearthstone.decks.deck_manager import DeckManager

__all__ = ["DeckManager"]
```

```python
# hearthstone/decks/deck_manager.py
"""Deck loading and management."""
from pathlib import Path
from typing import List
from hearthstone.models.deck import Deck


class DeckManager:
    """Manage deck loading and saving."""

    def __init__(self, decks_dir: str = "data/decks"):
        self.decks_dir = Path(decks_dir)

    def list_decks(self) -> List[str]:
        """List available deck names."""
        # TODO: Implement
        return []

    def load_deck(self, name: str) -> Deck:
        """Load a deck by name."""
        # TODO: Implement
        raise FileNotFoundError(f"Deck '{name}' not found")

    def save_deck(self, deck: Deck, name: str):
        """Save a deck to file."""
        # TODO: Implement
        pass

    def validate_deck(self, deck: Deck) -> List[str]:
        """Validate deck and return list of errors."""
        # TODO: Implement
        return []
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_deck_manager.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/decks/ tests/unit/test_deck_manager.py
git commit -m "feat: add DeckManager skeleton"
```

---

## Task 7: DeckManager - Implement load_deck()

**Files:**
- Create: `data/decks/test_deck.json`
- Modify: `hearthstone/decks/deck_manager.py`
- Modify: `tests/unit/test_deck_manager.py`

**Step 1: Create test deck JSON**

```json
{
  "name": "Test Deck",
  "hero_class": "MAGE",
  "cards": [
    "CS2_142",
    "CS2_142",
    "CS2_168",
    "CS2_168",
    "CS2_120",
    "CS2_120",
    "CS2_121",
    "CS2_121",
    "CS2_124",
    "CS2_124",
    "CS2_125",
    "CS2_125",
    "CS2_127",
    "CS2_127",
    "CS2_131",
    "CS2_131",
    "CS2_155",
    "CS2_155",
    "CS2_162",
    "CS2_162",
    "CS2_171",
    "CS2_171",
    "CS2_172",
    "CS2_172",
    "CS2_179",
    "CS2_179",
    "CS2_182",
    "CS2_182",
    "CS2_186",
    "CS2_186"
  ]
}
```

**Step 2: Write the failing test**

```python
# tests/unit/test_deck_manager.py (add to existing file)
def test_deck_manager_load_deck():
    """Test loading a deck from JSON."""
    manager = DeckManager()
    deck = manager.load_deck("test_deck")

    assert deck is not None
    assert deck.name == "Test Deck"
    assert len(deck.cards) == 30
```

**Step 3: Run test to verify it fails**

Run: `pytest tests/unit/test_deck_manager.py::test_deck_manager_load_deck -v`
Expected: FAIL

**Step 4: Implement load_deck()**

```python
# hearthstone/decks/deck_manager.py (update load_deck method)
def load_deck(self, name: str) -> Deck:
    """Load a deck by name."""
    import json
    from hearthstone.cards.card_loader import CardLoader
    from hearthstone.models.enums import HeroClass

    deck_file = self.decks_dir / f"{name}.json"

    if not deck_file.exists():
        raise FileNotFoundError(f"Deck '{name}' not found at {deck_file}")

    with open(deck_file) as f:
        deck_data = json.load(f)

    # Load card objects from IDs
    card_loader = CardLoader()
    cards = []
    for card_id in deck_data["cards"]:
        card = card_loader.load_card(card_id)
        if card:
            cards.append(card)

    return Deck(
        name=deck_data["name"],
        hero_class=HeroClass[deck_data["hero_class"]],
        cards=cards
    )
```

**Step 5: Run test to verify it passes**

Run: `pytest tests/unit/test_deck_manager.py::test_deck_manager_load_deck -v`
Expected: PASS

**Step 6: Commit**

```bash
git add data/decks/ hearthstone/decks/deck_manager.py tests/unit/test_deck_manager.py
git commit -m "feat: implement DeckManager.load_deck() with JSON support"
```

---

## Task 8: Gymnasium Environment - Basic Structure

**Files:**
- Create: `hearthstone/ai/__init__.py`
- Create: `hearthstone/ai/gym_env.py`
- Create: `tests/unit/test_gym_env.py`

**Step 1: Write the failing test**

```python
# tests/unit/test_gym_env.py
"""Tests for HearthstoneEnv."""
import pytest


def test_gym_env_import():
    """Test that we can import HearthstoneEnv."""
    from hearthstone.ai.gym_env import HearthstoneEnv

    assert HearthstoneEnv is not None


def test_gym_env_initialization():
    """Test environment initialization."""
    from hearthstone.ai.gym_env import HearthstoneEnv

    env = HearthstoneEnv()
    assert env is not None
```

**Step 2: Run tests to verify they fail**

Run: `pytest tests/unit/test_gym_env.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: Create Gymnasium environment skeleton**

```python
# hearthstone/ai/__init__.py
"""AI module for Hearthstone."""
from hearthstone.ai.gym_env import HearthstoneEnv

__all__ = ["HearthstoneEnv"]
```

```python
# hearthstone/ai/gym_env.py
"""Gymnasium environment for Hearthstone."""
import gymnasium as gym
from gymnasium import spaces
import numpy as np


class HearthstoneEnv(gym.Env):
    """Hearthstone environment following Gymnasium API."""

    metadata = {"render_modes": ["human"]}

    def __init__(self, deck1_name: str = "test_deck", deck2_name: str = "test_deck"):
        """Initialize environment."""
        super().__init__()

        # TODO: Define observation and action spaces
        self.observation_space = spaces.Dict({})
        self.action_space = spaces.Discrete(1)

    def reset(self, seed=None, options=None):
        """Reset environment."""
        # TODO: Implement
        pass

    def step(self, action):
        """Execute action."""
        # TODO: Implement
        pass

    def render(self, mode="human"):
        """Render environment."""
        # TODO: Implement
        pass
```

**Step 4: Run tests to verify they pass**

Run: `pytest tests/unit/test_gym_env.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/ai/ tests/unit/test_gym_env.py
git commit -m "feat: add Gymnasium environment skeleton"
```

---

## Task 9: Gymnasium Environment - reset() and observation space

**Files:**
- Modify: `hearthstone/ai/gym_env.py`
- Modify: `tests/unit/test_gym_env.py`

**Step 1: Write the failing test**

```python
# tests/unit/test_gym_env.py (add to existing file)
def test_gym_env_reset():
    """Test environment reset."""
    from hearthstone.ai.gym_env import HearthstoneEnv

    env = HearthstoneEnv()
    obs, info = env.reset()

    assert obs is not None
    assert isinstance(obs, dict)
    assert "player_health" in obs
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_gym_env.py::test_gym_env_reset -v`
Expected: FAIL

**Step 3: Define observation space and implement reset()**

```python
# hearthstone/ai/gym_env.py (update class)
class HearthstoneEnv(gym.Env):
    """Hearthstone environment following Gymnasium API."""

    metadata = {"render_modes": ["human"]}

    def __init__(self, deck1_name: str = "test_deck", deck2_name: str = "test_deck"):
        """Initialize environment."""
        super().__init__()

        self.deck1_name = deck1_name
        self.deck2_name = deck2_name

        # Observation space
        # Using simple features for MVP
        self.observation_space = spaces.Dict({
            "player_health": spaces.Box(0, 30, shape=(1,), dtype=np.float32),
            "player_mana": spaces.Box(0, 10, shape=(1,), dtype=np.float32),
            "player_hand_size": spaces.Box(0, 10, shape=(1,), dtype=np.float32),
            "player_board_size": spaces.Box(0, 7, shape=(1,), dtype=np.float32),
            "opponent_health": spaces.Box(0, 30, shape=(1,), dtype=np.float32),
            "opponent_board_size": spaces.Box(0, 7, shape=(1,), dtype=np.float32),
            "turn_number": spaces.Box(0, 100, shape=(1,), dtype=np.float32),
        })

        # Action space (will use masking)
        self.action_space = spaces.Discrete(100)  # Max 100 possible actions

        self.controller = None

    def reset(self, seed=None, options=None):
        """Reset environment to initial state."""
        super().reset(seed=seed)

        from hearthstone.decks.deck_manager import DeckManager
        from hearthstone.engine.game_controller import GameController

        # Load decks
        manager = DeckManager()
        deck1 = manager.load_deck(self.deck1_name)
        deck2 = manager.load_deck(self.deck2_name)

        # Create game controller
        self.controller = GameController(deck1, deck2)
        self.controller.start_game()

        # Get initial observation
        obs = self._get_observation()

        return obs, {}

    def _get_observation(self):
        """Convert game state to observation."""
        state = self.controller.get_state()

        return {
            "player_health": np.array([state.current_player.hero.health], dtype=np.float32),
            "player_mana": np.array([state.current_player.mana], dtype=np.float32),
            "player_hand_size": np.array([len(state.current_player.hand)], dtype=np.float32),
            "player_board_size": np.array([len(state.current_player.board)], dtype=np.float32),
            "opponent_health": np.array([state.opposing_player.hero.health], dtype=np.float32),
            "opponent_board_size": np.array([len(state.opposing_player.board)], dtype=np.float32),
            "turn_number": np.array([state.turn_number], dtype=np.float32),
        }
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/test_gym_env.py::test_gym_env_reset -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/ai/gym_env.py tests/unit/test_gym_env.py
git commit -m "feat: implement HearthstoneEnv.reset() with observation space"
```

---

## Task 10: Gymnasium Environment - step() and action masking

**Files:**
- Modify: `hearthstone/ai/gym_env.py`
- Modify: `tests/unit/test_gym_env.py`

**Step 1: Write the failing test**

```python
# tests/unit/test_gym_env.py (add to existing file)
def test_gym_env_step():
    """Test environment step."""
    from hearthstone.ai.gym_env import HearthstoneEnv

    env = HearthstoneEnv()
    obs, _ = env.reset()

    # Try to take a step (action 0 = end turn)
    obs, reward, terminated, truncated, info = env.step(0)

    assert obs is not None
    assert isinstance(reward, (int, float))
    assert isinstance(terminated, bool)
    assert isinstance(truncated, bool)
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/test_gym_env.py::test_gym_env_step -v`
Expected: FAIL

**Step 3: Implement step() with action masking**

```python
# hearthstone/ai/gym_env.py (add step method)
def step(self, action):
    """Execute action and return (obs, reward, terminated, truncated, info)."""
    if self.controller is None:
        raise RuntimeError("Call reset() before step()")

    # Get valid actions
    valid_actions = self.controller.get_valid_actions()

    # Map action index to actual action
    if action < len(valid_actions):
        selected_action = valid_actions[action]
        event = self.controller.execute_action(selected_action)

        # Calculate reward
        reward = 0.0
        if event.success:
            reward = 0.001  # Small reward for successful action
    else:
        # Invalid action, ignore
        reward = -0.01
        event = None

    # Get new observation
    obs = self._get_observation()

    # Check if game is over
    terminated = self.controller.is_game_over()
    truncated = False

    # Calculate final reward if game over
    if terminated:
        winner = self.controller.get_winner()
        if winner and winner.name == self.controller.get_state().player1.name:
            reward = 1.0  # Won
        else:
            reward = -1.0  # Lost

    info = {
        "valid_actions": len(valid_actions),
        "event": event.message if event else "Invalid action"
    }

    return obs, reward, terminated, truncated, info
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/test_gym_env.py::test_gym_env_step -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/ai/gym_env.py tests/unit/test_gym_env.py
git commit -m "feat: implement HearthstoneEnv.step() with action masking"
```

---

## Task 11: CLI Game Loop

**Files:**
- Create: `cli/game_loop.py`
- Create: `tests/integration/test_cli_game_loop.py`

**Step 1: Write the failing test**

```python
# tests/integration/test_cli_game_loop.py
"""Integration tests for CLI game loop."""
import pytest
from unittest.mock import patch, Mock


def test_cli_game_loop_initialization():
    """Test CLI game loop can be created."""
    from cli.game_loop import CLIGameLoop
    from hearthstone.decks.deck_manager import DeckManager

    manager = DeckManager()
    deck = manager.load_deck("test_deck")

    from hearthstone.engine.game_controller import GameController
    controller = GameController(deck, deck)

    game_loop = CLIGameLoop(controller)
    assert game_loop is not None
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/integration/test_cli_game_loop.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: Create CLIGameLoop**

```python
# cli/game_loop.py
"""CLI game loop for human play."""
from cli.display.game_display import GameDisplay
from cli.input.input_handler import InputHandler
from hearthstone.engine.game_controller import GameController


class CLIGameLoop:
    """Game loop for CLI interface."""

    def __init__(self, controller: GameController):
        self.controller = controller
        self.display = GameDisplay()
        self.input_handler = InputHandler(self.display)

    def run(self):
        """Run the game loop."""
        # Start game
        self.controller.start_game()

        # Main game loop
        while not self.controller.is_game_over():
            # Display state
            state = self.controller.get_state()
            self.display.render_game_state(state)

            # Get valid actions
            valid_actions = self.controller.get_valid_actions()

            # Display options
            self._display_actions(valid_actions)

            # Get user choice
            action = self.input_handler.get_action_choice(valid_actions)

            # Execute action
            event = self.controller.execute_action(action)

            if event.success:
                print(f"\n✓ {event.message}")
            else:
                print(f"\n✗ {event.message}")

        # Game over
        winner = self.controller.get_winner()
        print(f"\n游戏结束! {winner.name if winner else 'Unknown'} 获胜!")

    def _display_actions(self, actions):
        """Display available actions."""
        print("\n可用动作:")
        for i, action in enumerate(actions, 1):
            print(f"  {i}. {self._format_action(action)}")

    def _format_action(self, action):
        """Format action for display."""
        from hearthstone.engine.action import EndTurnAction, PlayCardAction, AttackAction

        if isinstance(action, EndTurnAction):
            return "结束回合"
        elif isinstance(action, PlayCardAction):
            state = self.controller.get_state()
            card = state.current_player.hand[action.card_index]
            return f"打出 {card.name} ({card.cost}法力)"
        elif isinstance(action, AttackAction):
            state = self.controller.get_state()
            # Find attacker
            attacker = None
            for minion in state.current_player.board:
                if minion.id == action.attacker_id:
                    attacker = minion
                    break

            target_name = "敌方英雄" if action.target_id == "enemy_hero" else action.target_id
            return f"{attacker.name if attacker else 'Unknown'} 攻击 {target_name}"
        else:
            return str(action)
```

**Step 4: Update InputHandler to support action selection**

```python
# cli/input/input_handler.py (add method)
def get_action_choice(self, valid_actions):
    """Get user to choose from valid actions."""
    from hearthstone.engine.action import Action

    while True:
        try:
            choice = input("\n选择动作 (输入数字): ").strip()

            if choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < len(valid_actions):
                    return valid_actions[idx]
                else:
                    print(f"无效选择。请输入 1-{len(valid_actions)}")
            elif choice.lower() in ['h', 'help']:
                print("输入数字选择动作，或 'q' 退出")
            elif choice.lower() == 'q':
                raise KeyboardInterrupt("User quit")
            else:
                print("无效输入。输入数字或 'h' 获取帮助")

        except KeyboardInterrupt:
            raise
        except Exception as e:
            print(f"错误: {e}")
```

**Step 5: Run test to verify it passes**

Run: `pytest tests/integration/test_cli_game_loop.py -v`
Expected: PASS

**Step 6: Commit**

```bash
git add cli/game_loop.py cli/input/input_handler.py tests/integration/test_cli_game_loop.py
git commit -m "feat: implement CLI game loop with action selection"
```

---

## Task 12: Create Starter Decks

**Files:**
- Create: `data/decks/basic_mage.json`
- Create: `data/decks/basic_warrior.json`
- Create: `data/decks/basic_hunter.json`
- Create: `data/decks/basic_priest.json`

**Step 1: Create basic_mage.json**

```json
{
  "name": "Basic Mage",
  "hero_class": "MAGE",
  "cards": [
    "CS2_142", "CS2_142",
    "CS2_168", "CS2_168",
    "CS2_120", "CS2_120",
    "CS2_121", "CS2_121",
    "CS2_124", "CS2_124",
    "CS2_125", "CS2_125",
    "CS2_127", "CS2_127",
    "CS2_131", "CS2_131",
    "CS2_155", "CS2_155",
    "CS2_162", "CS2_162",
    "CS2_171", "CS2_171",
    "CS2_172", "CS2_172",
    "CS2_179", "CS2_179",
    "CS2_182", "CS2_182",
    "CS2_186", "CS2_186"
  ]
}
```

**Step 2: Create basic_warrior.json, basic_hunter.json, basic_priest.json**

(Same structure, different hero_class)

**Step 3: Test deck loading**

```bash
python -c "
from hearthstone.decks.deck_manager import DeckManager
manager = DeckManager()
for name in ['basic_mage', 'basic_warrior', 'basic_hunter', 'basic_priest']:
    deck = manager.load_deck(name)
    print(f'{name}: {len(deck.cards)} cards loaded')
"
```

Expected: All decks load successfully with 30 cards each

**Step 4: Commit**

```bash
git add data/decks/
git commit -m "feat: add starter decks for all classes"
```

---

## Task 13: main.py Entry Point

**Files:**
- Create: `main.py`

**Step 1: Create main.py**

```python
#!/usr/bin/env python3
"""Main entry point for Hearthstone CLI."""
from cli.menu.menu_system import MenuSystem


def main():
    """Main entry point."""
    print("欢迎来到炉石传说 CLI!")
    print()

    try:
        menu = MenuSystem()
        menu.run()
    except KeyboardInterrupt:
        print("\n\n感谢游玩!")
    except Exception as e:
        print(f"\n错误: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
```

**Step 2: Test main.py runs**

```bash
python main.py
```

Expected: Shows welcome message and menu (can test manually or with mocked input)

**Step 3: Make executable**

```bash
chmod +x main.py
```

**Step 4: Commit**

```bash
git add main.py
git commit -m "feat: add main.py entry point"
```

---

## Task 14: Update MenuSystem to Use GameController

**Files:**
- Modify: `cli/menu/menu_system.py`
- Modify: `tests/integration/test_menu_system.py`

**Step 1: Update _start_human_vs_ai() to use GameController**

```python
# cli/menu/menu_system.py (update method)
def _start_human_vs_ai(self):
    """Start Human vs AI game."""
    from hearthstone.decks.deck_manager import DeckManager
    from hearthstone.engine.game_controller import GameController
    from cli.game_loop import CLIGameLoop

    # Let player choose deck
    manager = DeckManager()
    decks = manager.list_decks()

    self.display.render_message("选择你的卡组:")
    for i, deck_name in enumerate(decks, 1):
        print(f"  {i}. {deck_name}")

    choice = input("\n输入选择: ").strip()
    try:
        deck_index = int(choice) - 1
        player_deck_name = decks[deck_index]
    except (ValueError, IndexError):
        print("无效选择，使用默认卡组")
        player_deck_name = "basic_mage"

    # Load decks
    player_deck = manager.load_deck(player_deck_name)
    ai_deck = manager.load_deck("basic_warrior")

    # Create controller and game loop
    controller = GameController(player_deck, ai_deck)
    game_loop = CLIGameLoop(controller)

    # Run game
    game_loop.run()
```

**Step 2: Test menu integration**

```bash
python -m pytest tests/integration/test_menu_system.py -v
```

**Step 3: Commit**

```bash
git add cli/menu/menu_system.py tests/integration/test_menu_system.py
git commit -m "feat: integrate GameController with menu system"
```

---

## Task 15: Integration Test - Full Game Flow

**Files:**
- Create: `tests/integration/test_full_game.py`

**Step 1: Write integration test**

```python
# tests/integration/test_full_game.py
"""Integration test for complete game flow."""
import pytest


def test_complete_game_via_gymnasium():
    """Test playing a complete game via Gymnasium."""
    from hearthstone.ai.gym_env import HearthstoneEnv

    env = HearthstoneEnv()
    obs, _ = env.reset()

    done = False
    steps = 0
    max_steps = 1000

    while not done and steps < max_steps:
        # Get valid actions from info
        valid_actions_count = 1  # At minimum, can always end turn

        # Random action
        action = 0  # End turn
        obs, reward, done, truncated, info = env.step(action)

        steps += 1

    assert steps < max_steps, "Game took too long"
    print(f"Game completed in {steps} steps")


def test_complete_game_via_cli():
    """Test playing a complete game via CLI (automated)."""
    from hearthstone.decks.deck_manager import DeckManager
    from hearthstone.engine.game_controller import GameController

    manager = DeckManager()
    deck1 = manager.load_deck("basic_mage")
    deck2 = manager.load_deck("basic_warrior")

    controller = GameController(deck1, deck2)
    controller.start_game()

    steps = 0
    max_steps = 1000

    while not controller.is_game_over() and steps < max_steps:
        # Get valid actions
        actions = controller.get_valid_actions()

        # Take first action (usually end turn)
        if actions:
            action = actions[0]
            controller.execute_action(action)

        steps += 1

    assert controller.is_game_over(), "Game should be over"
    winner = controller.get_winner()
    assert winner is not None, "There should be a winner"

    print(f"Game completed in {steps} steps, winner: {winner.name}")
```

**Step 2: Run integration tests**

```bash
python -m pytest tests/integration/test_full_game.py -v
```

Expected: Both tests pass, games complete

**Step 3: Commit**

```bash
git add tests/integration/test_full_game.py
git commit -m "test: add full game integration tests"
```

---

## Task 16: Final Polish and Documentation

**Files:**
- Create: `README.md`
- Modify: `pyproject.toml`

**Step 1: Update pyproject.toml with entry point**

```toml
[project.scripts]
hearthstone-cli = "main:main"
```

**Step 2: Create README.md**

```markdown
# Hearthstone CLI

A CLI-based Hearthstone game engine with AI training support via Gymnasium.

## Features

- **Full Game Engine**: Complete Hearthstone rules implementation
- **Gymnasium Environment**: Train AI agents using reinforcement learning
- **CLI Interface**: Play games directly in the terminal
- **Deck Management**: Load, save, and validate custom decks

## Installation

```bash
pip install -e .
```

## Quick Start

### Play via CLI

```bash
python main.py
```

### Train AI Agents

```python
from hearthstone.ai.gym_env import HearthstoneEnv

env = HearthstoneEnv()
obs, _ = env.reset()

done = False
while not done:
    action = agent.select_action(obs)  # Your agent logic
    obs, reward, done, truncated, info = env.step(action)
```

## Project Structure

```
hs_glm/
├── hearthstone/       # Game engine
│   ├── engine/        # Core game logic
│   ├── ai/            # Gymnasium environment
│   └── decks/         # Deck management
├── cli/               # CLI interface
├── data/              # Cards and decks
└── tests/             # Test suite
```

## Running Tests

```bash
pytest tests/
```

## Creating Custom Decks

Create a JSON file in `data/decks/`:

```json
{
  "name": "My Custom Deck",
  "hero_class": "MAGE",
  "cards": ["CS2_142", "CS2_142", ...]
}
```

## License

MIT
```

**Step 3: Run all tests one final time**

```bash
python -m pytest tests/ -v
```

**Step 4: Commit**

```bash
git add README.md pyproject.toml
git commit -m "docs: add README and polish project configuration"
```

**Step 5: Create final commit for Phase 3**

```bash
git add -A
git commit -m "feat: complete Phase 3 - unified game loop with Gymnasium and CLI

Phase 3 Complete:
- GameController: Central game loop manager ✓
- DeckManager: JSON-based deck system ✓
- HearthstoneEnv: Full Gymnasium API ✓
- CLIGameLoop: Enhanced CLI interface ✓
- Starter decks: 4 class decks ✓
- main.py: Entry point ✓
- Integration tests: Full game flows ✓

All tests passing, ready for AI training and human play!

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Summary

**Total Tasks:** 16
**Estimated Time:** 8-11 hours
**Test Coverage:** High (all core components tested)

**Key Deliverables:**
1. GameController - Central game loop manager
2. DeckManager - Deck loading/saving/validation
3. HearthstoneEnv - Full Gymnasium environment
4. CLIGameLoop - Human-friendly CLI interface
5. Starter decks - 4 pre-built decks
6. main.py - Executable entry point
7. Integration tests - Full game flow validation

**Success Criteria:**
- ✅ Gymnasium environment fully functional
- ✅ CLI allows complete human play
- ✅ Deck system works (load/validate)
- ✅ Same GameController serves both interfaces
- ✅ All tests passing
- ✅ Documentation complete
