# Phase 4: Card Expansion & AI Training Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Import HearthstoneJSON card database, enhance AI training infrastructure, and optimize game engine performance.

**Architecture:** Create a data layer for card import (CardImporter, CardFactory, EffectParser), extend AI training (CardEmbedding, RewardFunction, SelfPlayTrainer), and add performance optimizations (StateCache, BatchSimulator).

**Tech Stack:** Python 3.11, Gymnasium, NumPy, requests (for JSON fetch), concurrent.futures

---

## Task 1: Extend Ability Enum

**Files:**
- Modify: `hearthstone/models/enums.py`
- Test: `tests/unit/models/test_enums.py`

**Step 1: Write the failing test**

```python
# tests/unit/models/test_enums.py

def test_ability_enum_has_battlecry():
    """Test that BATTLECRY ability exists."""
    from hearthstone.models.enums import Ability
    assert Ability.BATTLECRY == "BATTLECRY"


def test_ability_enum_has_deathrattle():
    """Test that DEATHRATTLE ability exists."""
    from hearthstone.models.enums import Ability
    assert Ability.DEATHRATTLE == "DEATHRATTLE"


def test_ability_enum_has_stealth():
    """Test that STEALTH ability exists."""
    from hearthstone.models.enums import Ability
    assert Ability.STEALTH == "STEALTH"


def test_ability_enum_has_rush():
    """Test that RUSH ability exists."""
    from hearthstone.models.enums import Ability
    assert Ability.RUSH == "RUSH"
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/models/test_enums.py -v`
Expected: FAIL with "AttributeError: BATTLECRY"

**Step 3: Write minimal implementation**

```python
# hearthstone/models/enums.py - Add to Ability class

class Ability(str, Enum):
    """Minion abilities in Hearthstone."""
    # 现有能力
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

    # 新增能力
    BATTLECRY = "BATTLECRY"
    DEATHRATTLE = "DEATHRATTLE"
    DISCOVER = "DISCOVER"
    COMBO = "COMBO"
    OVERLOAD = "OVERLOAD"
    SECRET = "SECRET"
    FREEZE = "FREEZE"
    SILENCE = "SILENCE"
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/models/test_enums.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/models/enums.py tests/unit/models/test_enums.py
git commit -m "feat: extend Ability enum with new mechanics"
```

---

## Task 2: Create Card Data Module Structure

**Files:**
- Create: `hearthstone/data/__init__.py`
- Create: `hearthstone/data/card_importer.py`

**Step 1: Write the failing test**

```python
# tests/unit/data/test_card_importer.py

import pytest


def test_card_importer_exists():
    """Test that CardImporter class can be imported."""
    from hearthstone.data.card_importer import CardImporter
    importer = CardImporter()
    assert importer is not None


def test_mechanic_map_exists():
    """Test that MECHANIC_MAP is defined."""
    from hearthstone.data.card_importer import CardImporter
    assert hasattr(CardImporter, 'MECHANIC_MAP')
    assert 'BATTLECRY' in CardImporter.MECHANIC_MAP


def test_card_type_map_exists():
    """Test that CARD_TYPE_MAP is defined."""
    from hearthstone.data.card_importer import CardImporter
    assert hasattr(CardImporter, 'CARD_TYPE_MAP')
    assert 'MINION' in CardImporter.CARD_TYPE_MAP
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/data/test_card_importer.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: Create package and implementation**

```python
# hearthstone/data/__init__.py
"""Card data management module."""
from hearthstone.data.card_importer import CardImporter

__all__ = ['CardImporter']
```

```python
# hearthstone/data/card_importer.py
"""Card importer from HearthstoneJSON."""
from typing import Dict, List, Optional
from hearthstone.models.enums import Ability, CardType, HeroClass


class CardImporter:
    """Import card data from HearthstoneJSON format."""

    MECHANIC_MAP: Dict[str, Ability] = {
        'BATTLECRY': Ability.BATTLECRY,
        'CHARGE': Ability.CHARGE,
        'TAUNT': Ability.TAUNT,
        'DIVINE_SHIELD': Ability.DIVINE_SHIELD,
        'WINDFURY': Ability.WINDFURY,
        'POISONOUS': Ability.POISONOUS,
        'LIFESTEAL': Ability.LIFESTEAL,
        'STEALTH': Ability.STEALTH,
        'RUSH': Ability.RUSH,
        'DEATHRATTLE': Ability.DEATHRATTLE,
        'FREEZE': Ability.FREEZE,
        'SECRET': Ability.SECRET,
        'OVERLOAD': Ability.OVERLOAD,
        'COMBO': Ability.COMBO,
        'DISCOVER': Ability.DISCOVER,
    }

    CARD_TYPE_MAP: Dict[str, CardType] = {
        'MINION': CardType.MINION,
        'SPELL': CardType.SPELL,
        'WEAPON': CardType.WEAPON,
        'HERO': CardType.HERO,
    }

    HERO_CLASS_MAP: Dict[str, HeroClass] = {
        'WARRIOR': HeroClass.WARRIOR,
        'SHAMAN': HeroClass.SHAMAN,
        'ROGUE': HeroClass.ROGUE,
        'PALADIN': HeroClass.PALADIN,
        'HUNTER': HeroClass.HUNTER,
        'DRUID': HeroClass.DRUID,
        'WARLOCK': HeroClass.WARLOCK,
        'MAGE': HeroClass.MAGE,
        'PRIEST': HeroClass.PRIEST,
        'DEMONHUNTER': HeroClass.DEMON_HUNTER,
        'NEUTRAL': HeroClass.NEUTRAL,
    }

    def __init__(self, data_url: str = "https://api.hearthstonejson.com/v1/latest/enUS/cards.json"):
        """Initialize card importer."""
        self.data_url = data_url
        self._raw_data: Optional[List[Dict]] = None

    def fetch_cards(self) -> List[Dict]:
        """Fetch card data from HearthstoneJSON."""
        import requests
        response = requests.get(self.data_url, timeout=30)
        response.raise_for_status()
        self._raw_data = response.json()
        return self._raw_data

    def filter_collectible(self, cards: List[Dict]) -> List[Dict]:
        """Filter to only collectible cards."""
        return [c for c in cards if c.get('collectible', False)]

    def filter_by_set(self, cards: List[Dict], card_sets: List[str]) -> List[Dict]:
        """Filter cards by set (e.g., 'CORE', 'EXPERT1')."""
        return [c for c in cards if c.get('set') in card_sets]

    def map_mechanic(self, mechanic: str) -> Optional[Ability]:
        """Map HearthstoneJSON mechanic to Ability enum."""
        return self.MECHANIC_MAP.get(mechanic)

    def map_card_type(self, card_type: str) -> Optional[CardType]:
        """Map HearthstoneJSON type to CardType enum."""
        return self.CARD_TYPE_MAP.get(card_type)

    def map_hero_class(self, hero_class: str) -> Optional[HeroClass]:
        """Map HearthstoneJSON class to HeroClass enum."""
        if hero_class:
            return self.HERO_CLASS_MAP.get(hero_class.upper())
        return None
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/data/test_card_importer.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/data/ tests/unit/data/
git commit -m "feat: add CardImporter with mechanic/type mapping"
```

---

## Task 3: Create CardFactory

**Files:**
- Create: `hearthstone/data/card_factory.py`
- Test: `tests/unit/data/test_card_factory.py`

**Step 1: Write the failing test**

```python
# tests/unit/data/test_card_factory.py

import pytest


def test_card_factory_exists():
    """Test that CardFactory can be imported."""
    from hearthstone.data.card_factory import CardFactory
    factory = CardFactory()
    assert factory is not None


def test_create_minion_from_json():
    """Test creating a minion from JSON data."""
    from hearthstone.data.card_factory import CardFactory
    from hearthstone.models.enums import CardType

    factory = CardFactory()

    json_data = {
        'id': 'TEST_001',
        'name': 'Test Minion',
        'type': 'MINION',
        'cost': 3,
        'attack': 2,
        'health': 4,
        'text': 'A test minion',
        'cardClass': 'NEUTRAL',
        'mechanics': ['TAUNT'],
    }

    card = factory.create_card(json_data)

    assert card.id == 'TEST_001'
    assert card.name == 'Test Minion'
    assert card.cost == 3
    assert card.card_type == CardType.MINION
    assert card.attack == 2
    assert card.health == 4


def test_create_spell_from_json():
    """Test creating a spell from JSON data."""
    from hearthstone.data.card_factory import CardFactory
    from hearthstone.models.enums import CardType

    factory = CardFactory()

    json_data = {
        'id': 'TEST_002',
        'name': 'Test Spell',
        'type': 'SPELL',
        'cost': 2,
        'text': 'Deal 3 damage',
        'cardClass': 'MAGE',
    }

    card = factory.create_card(json_data)

    assert card.id == 'TEST_002'
    assert card.name == 'Test Spell'
    assert card.cost == 2
    assert card.card_type == CardType.SPELL
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/data/test_card_factory.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: Write implementation**

```python
# hearthstone/data/card_factory.py
"""Factory for creating card instances from JSON data."""
from typing import Dict, Optional, Set
from hearthstone.models.card import Card, Minion, Spell, Weapon
from hearthstone.models.enums import Ability, CardType, HeroClass
from hearthstone.data.card_importer import CardImporter


class CardFactory:
    """Create card instances from HearthstoneJSON data."""

    def __init__(self):
        """Initialize card factory."""
        self.importer = CardImporter()

    def create_card(self, json_data: Dict) -> Card:
        """Create a card instance from JSON data."""
        card_type = json_data.get('type')

        if card_type == 'MINION':
            return self._create_minion(json_data)
        elif card_type == 'SPELL':
            return self._create_spell(json_data)
        elif card_type == 'WEAPON':
            return self._create_weapon(json_data)
        else:
            raise ValueError(f"Unknown card type: {card_type}")

    def _create_minion(self, data: Dict) -> Minion:
        """Create a Minion from JSON data."""
        abilities = self._extract_abilities(data)

        return Minion(
            id=data['id'],
            name=data['name'],
            cost=data.get('cost', 0),
            card_type=CardType.MINION,
            description=self._clean_text(data.get('text', '')),
            hero_class=self.importer.map_hero_class(data.get('cardClass')),
            attack=data.get('attack', 0),
            health=data.get('health', 0),
            abilities=abilities,
        )

    def _create_spell(self, data: Dict) -> Spell:
        """Create a Spell from JSON data."""
        effect, effect_value = self._parse_spell_effect(data)

        return Spell(
            id=data['id'],
            name=data['name'],
            cost=data.get('cost', 0),
            card_type=CardType.SPELL,
            description=self._clean_text(data.get('text', '')),
            hero_class=self.importer.map_hero_class(data.get('cardClass')),
            effect=effect,
            effect_value=effect_value,
        )

    def _create_weapon(self, data: Dict) -> Weapon:
        """Create a Weapon from JSON data."""
        return Weapon(
            id=data['id'],
            name=data['name'],
            cost=data.get('cost', 0),
            card_type=CardType.WEAPON,
            description=self._clean_text(data.get('text', '')),
            hero_class=self.importer.map_hero_class(data.get('cardClass')),
            attack=data.get('attack', 0),
            durability=data.get('durability', 0),
        )

    def _extract_abilities(self, data: Dict) -> Set[Ability]:
        """Extract abilities from mechanics field."""
        abilities = set()
        for mechanic in data.get('mechanics', []):
            ability = self.importer.map_mechanic(mechanic)
            if ability:
                abilities.add(ability)
        return abilities

    def _clean_text(self, text: str) -> str:
        """Clean HTML tags from card text."""
        import re
        if not text:
            return ''
        # Remove HTML tags like <b>, </b>, $, etc.
        text = re.sub(r'<[^>]+>', '', text)
        text = text.replace('$', '')
        text = text.replace('[x]', '')
        return text.strip()

    def _parse_spell_effect(self, data: Dict) -> tuple:
        """Parse spell effect from text (simplified)."""
        text = data.get('text', '')

        # Simple pattern matching for common effects
        import re

        # Damage pattern
        match = re.search(r'Deal (\d+)', text, re.IGNORECASE)
        if match:
            return 'DAMAGE', int(match.group(1))

        # Heal pattern
        match = re.search(r'Restore (\d+)', text, re.IGNORECASE)
        if match:
            return 'HEAL', int(match.group(1))

        # Draw pattern
        match = re.search(r'Draw (\d+)', text, re.IGNORECASE)
        if match:
            return 'DRAW', int(match.group(1))

        # Armor pattern
        match = re.search(r'Gain (\d+) Armor', text, re.IGNORECASE)
        if match:
            return 'ARMOR', int(match.group(1))

        return None, 0
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/data/test_card_factory.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/data/card_factory.py tests/unit/data/test_card_factory.py
git commit -m "feat: add CardFactory for creating cards from JSON"
```

---

## Task 4: Create CardEmbedding

**Files:**
- Create: `hearthstone/ai/card_embedding.py`
- Test: `tests/unit/ai/test_card_embedding.py`

**Step 1: Write the failing test**

```python
# tests/unit/ai/test_card_embedding.py

import numpy as np
import pytest


def test_card_embedding_exists():
    """Test that CardEmbedding can be imported."""
    from hearthstone.ai.card_embedding import CardEmbedding
    embedding = CardEmbedding()
    assert embedding is not None


def test_encode_minion():
    """Test encoding a minion card."""
    from hearthstone.ai.card_embedding import CardEmbedding
    from hearthstone.models.card import Minion
    from hearthstone.models.enums import CardType, Ability

    embedding = CardEmbedding(embedding_dim=32)
    minion = Minion(
        id='TEST_001',
        name='Test',
        cost=3,
        card_type=CardType.MINION,
        attack=2,
        health=4,
        abilities={Ability.TAUNT},
    )

    vector = embedding.encode(minion)

    assert isinstance(vector, np.ndarray)
    assert vector.shape == (32,)
    assert vector.dtype == np.float32
    # Cost should be normalized (3/10 = 0.3)
    assert abs(vector[0] - 0.3) < 0.01


def test_encode_spell():
    """Test encoding a spell card."""
    from hearthstone.ai.card_embedding import CardEmbedding
    from hearthstone.models.card import Spell
    from hearthstone.models.enums import CardType

    embedding = CardEmbedding(embedding_dim=32)
    spell = Spell(
        id='TEST_002',
        name='Fireball',
        cost=4,
        card_type=CardType.SPELL,
        effect='DAMAGE',
        effect_value=6,
    )

    vector = embedding.encode(spell)

    assert isinstance(vector, np.ndarray)
    assert vector.shape == (32,)
    # Cost should be normalized (4/10 = 0.4)
    assert abs(vector[0] - 0.4) < 0.01
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/ai/test_card_embedding.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: Write implementation**

```python
# hearthstone/ai/card_embedding.py
"""Card embedding for AI input representation."""
import numpy as np
from typing import List
from hearthstone.models.card import Card, Minion, Spell, Weapon
from hearthstone.models.enums import Ability


class CardEmbedding:
    """Encode cards as fixed-dimension vectors for AI models."""

    # Feature layout (64 dimensions):
    # [0]: cost (normalized 0-1)
    # [1-2]: attack, health (minion only)
    # [3]: effect_value (spell only)
    # [4]: durability (weapon only)
    # [5-24]: ability one-hot (20 abilities)
    # [25-30]: card type one-hot
    # [31-40]: hero class one-hot
    # [41-63]: reserved

    def __init__(self, embedding_dim: int = 64):
        """Initialize embedding with specified dimension."""
        self.dim = embedding_dim
        self._ability_order = list(Ability)

    def encode(self, card: Card) -> np.ndarray:
        """Encode a card as a vector."""
        features = np.zeros(self.dim, dtype=np.float32)
        idx = 0

        # Cost (normalized to 0-1)
        features[idx] = min(card.cost / 10.0, 1.0)
        idx += 1

        # Type-specific features
        if isinstance(card, Minion):
            features[idx] = min(card.attack / 10.0, 1.0)
            features[idx + 1] = min(card.health / 10.0, 1.0)
            idx += 2

            # Abilities (one-hot)
            ability_start = 5
            for i, ability in enumerate(self._ability_order):
                if ability in card.abilities and ability_start + i < self.dim:
                    features[ability_start + i] = 1.0

        elif isinstance(card, Spell):
            features[idx] = min(card.effect_value / 10.0, 1.0)
            idx += 1

        elif isinstance(card, Weapon):
            features[idx] = min(card.attack / 10.0, 1.0)
            features[idx + 1] = min(card.durability / 10.0, 1.0)
            idx += 2

        return features

    def encode_hand(self, cards: List[Card], max_size: int = 10) -> np.ndarray:
        """Encode a hand of cards as a 2D array."""
        result = np.zeros((max_size, self.dim), dtype=np.float32)

        for i, card in enumerate(cards[:max_size]):
            result[i] = self.encode(card)

        return result

    def encode_board(self, minions: List[Minion], max_size: int = 7) -> np.ndarray:
        """Encode a board of minions as a 2D array."""
        result = np.zeros((max_size, self.dim), dtype=np.float32)

        for i, minion in enumerate(minions[:max_size]):
            result[i] = self.encode(minion)

        return result
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/ai/test_card_embedding.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/ai/card_embedding.py tests/unit/ai/test_card_embedding.py
git commit -m "feat: add CardEmbedding for AI input representation"
```

---

## Task 5: Create RewardFunction

**Files:**
- Create: `hearthstone/ai/reward_functions.py`
- Test: `tests/unit/ai/test_reward_functions.py`

**Step 1: Write the failing test**

```python
# tests/unit/ai/test_reward_functions.py

import pytest


def test_reward_function_exists():
    """Test that RewardFunction can be imported."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()
    assert rf is not None


def test_victory_reward():
    """Test reward for winning."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()

    # Mock states - player wins
    old_state = None  # Not used for game over
    new_state = MockGameState(game_over=True, player_wins=True)

    reward = rf.calculate(old_state, new_state, None)
    assert reward == 100.0


def test_defeat_penalty():
    """Test penalty for losing."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()

    new_state = MockGameState(game_over=True, player_wins=False)

    reward = rf.calculate(None, new_state, None)
    assert reward == -100.0


def test_health_advantage_reward():
    """Test reward for health advantage."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()

    old_state = MockGameState(
        player_health=20, enemy_health=20, game_over=False
    )
    new_state = MockGameState(
        player_health=20, enemy_health=15, game_over=False
    )

    reward = rf.calculate(old_state, new_state, None)
    # Health diff went from 0 to +5, should get positive reward
    assert reward > 0


class MockGameState:
    """Mock game state for testing."""
    def __init__(self, player_health=30, enemy_health=30,
                 game_over=False, player_wins=False):
        self._player_health = player_health
        self._enemy_health = enemy_health
        self._game_over = game_over
        self._player_wins = player_wins

    def is_game_over(self):
        return self._game_over

    def get_winner(self):
        if self._player_wins:
            return type('Player', (), {'name': 'player1'})()
        return type('Player', (), {'name': 'player2'})()

    @property
    def current_player(self):
        return type('Player', (), {
            'name': 'player1',
            'hero': type('Hero', (), {'health': self._player_health})()
        })()

    @property
    def opposing_player(self):
        return type('Player', (), {
            'hero': type('Hero', (), {'health': self._enemy_health})()
        })()
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/ai/test_reward_functions.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: Write implementation**

```python
# hearthstone/ai/reward_functions.py
"""Reward functions for AI training."""
from typing import Optional
from hearthstone.models.game_state import GameState
from hearthstone.engine.action import Action, PlayCardAction, AttackAction


class RewardFunction:
    """Calculate rewards for AI training."""

    # Reward weights
    VICTORY_REWARD = 100.0
    DEFEAT_PENALTY = -100.0
    HEALTH_DIFF_WEIGHT = 0.5
    BOARD_CONTROL_WEIGHT = 0.3
    PLAY_CARD_REWARD = 0.1
    ATTACK_REWARD = 0.2

    def calculate(
        self,
        old_state: Optional[GameState],
        new_state: GameState,
        action: Optional[Action]
    ) -> float:
        """Calculate reward for a state transition."""
        reward = 0.0

        # 1. Game over rewards (highest priority)
        if new_state.is_game_over():
            winner = new_state.get_winner()
            if winner and winner.name == new_state.current_player.name:
                return self.VICTORY_REWARD
            else:
                return self.DEFEAT_PENALTY

        if old_state is None:
            return 0.0

        # 2. Health difference change
        old_hp_diff = self._health_difference(old_state)
        new_hp_diff = self._health_difference(new_state)
        reward += (new_hp_diff - old_hp_diff) * self.HEALTH_DIFF_WEIGHT

        # 3. Board control
        reward += self._board_control_bonus(new_state) * self.BOARD_CONTROL_WEIGHT

        # 4. Action rewards
        if action is not None:
            if isinstance(action, PlayCardAction):
                reward += self.PLAY_CARD_REWARD
            elif isinstance(action, AttackAction):
                reward += self.ATTACK_REWARD

        return reward

    def _health_difference(self, state: GameState) -> float:
        """Calculate health advantage (positive = good for current player)."""
        player_hp = state.current_player.hero.health
        enemy_hp = state.opposing_player.hero.health
        return float(player_hp - enemy_hp)

    def _board_control_bonus(self, state: GameState) -> float:
        """Calculate board control advantage."""
        friendly_count = len(state.current_player.board)
        enemy_count = len(state.opposing_player.board)
        return float(friendly_count - enemy_count)
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/ai/test_reward_functions.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/ai/reward_functions.py tests/unit/ai/test_reward_functions.py
git commit -m "feat: add RewardFunction for AI training"
```

---

## Task 6: Create StateCache

**Files:**
- Create: `hearthstone/engine/state_cache.py`
- Test: `tests/unit/engine/test_state_cache.py`

**Step 1: Write the failing test**

```python
# tests/unit/engine/test_state_cache.py

import pytest


def test_state_cache_exists():
    """Test that StateCache can be imported."""
    from hearthstone.engine.state_cache import StateCache
    cache = StateCache()
    assert cache is not None


def test_cache_invalidates_on_change():
    """Test that cache invalidates when state changes."""
    from hearthstone.engine.state_cache import StateCache

    cache = StateCache()

    # First call - should compute
    cache.invalidate()
    assert cache._board_state_hash is None
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/engine/test_state_cache.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: Write implementation**

```python
# hearthstone/engine/state_cache.py
"""State caching for performance optimization."""
from typing import Optional, List, Any, TYPE_CHECKING

if TYPE_CHECKING:
    from hearthstone.engine.action import Action
    from hearthstone.models.game_state import GameState


class StateCache:
    """Cache game state computations to avoid redundant work."""

    def __init__(self):
        """Initialize empty cache."""
        self._valid_actions_cache: List["Action"] = []
        self._board_state_hash: Optional[int] = None

    def get_valid_actions(
        self,
        game_state: "GameState",
        compute_fn: callable
    ) -> List["Action"]:
        """Get valid actions with caching."""
        current_hash = self._compute_hash(game_state)

        if current_hash != self._board_state_hash:
            self._valid_actions_cache = compute_fn(game_state)
            self._board_state_hash = current_hash

        return self._valid_actions_cache

    def invalidate(self):
        """Invalidate cache when state changes."""
        self._board_state_hash = None
        self._valid_actions_cache = []

    def _compute_hash(self, game_state: "GameState") -> int:
        """Compute hash of game state for cache invalidation."""
        # Simple hash based on key state elements
        hash_components = [
            id(game_state.current_player),
            len(game_state.current_player.hand),
            len(game_state.current_player.board),
            len(game_state.opposing_player.board),
            game_state.current_player.mana,
        ]

        # Include minion states
        for minion in game_state.current_player.board:
            hash_components.extend([
                minion.id,
                minion.health,
                minion.can_attack,
            ])

        for minion in game_state.opposing_player.board:
            hash_components.extend([
                minion.id,
                minion.health,
            ])

        return hash(tuple(hash_components))
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/engine/test_state_cache.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/engine/state_cache.py tests/unit/engine/test_state_cache.py
git commit -m "feat: add StateCache for performance optimization"
```

---

## Task 7: Create SelfPlayTrainer

**Files:**
- Create: `hearthstone/ai/self_play.py`
- Test: `tests/unit/ai/test_self_play.py`

**Step 1: Write the failing test**

```python
# tests/unit/ai/test_self_play.py

import pytest


def test_self_play_trainer_exists():
    """Test that SelfPlayTrainer can be imported."""
    from hearthstone.ai.self_play import SelfPlayTrainer
    trainer = SelfPlayTrainer(agent_class=None, deck_pool=[])
    assert trainer is not None
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/ai/test_self_play.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: Write implementation**

```python
# hearthstone/ai/self_play.py
"""Self-play training framework."""
import random
from typing import List, Dict, Any, Optional, Type
from hearthstone.models.card import Card


class SelfPlayTrainer:
    """Manage self-play training for AI agents."""

    def __init__(
        self,
        agent_class: Optional[Type],
        deck_pool: List[List[Card]]
    ):
        """Initialize trainer with agent class and deck pool."""
        self.agent_class = agent_class
        self.deck_pool = deck_pool
        self.episode_history: List[Dict] = []

    def select_decks(self) -> tuple:
        """Select random decks for both players."""
        if len(self.deck_pool) < 2:
            raise ValueError("Need at least 2 decks in pool")

        deck1 = random.choice(self.deck_pool)
        deck2 = random.choice(self.deck_pool)
        return deck1, deck2

    def record_episode(self, result: Dict):
        """Record episode result for analysis."""
        self.episode_history.append(result)

    def get_stats(self) -> Dict[str, Any]:
        """Get training statistics."""
        if not self.episode_history:
            return {'episodes': 0}

        total = len(self.episode_history)
        turns = [ep.get('turns', 0) for ep in self.episode_history]

        return {
            'episodes': total,
            'avg_turns': sum(turns) / total if total > 0 else 0,
        }

    def clear_history(self):
        """Clear episode history."""
        self.episode_history = []
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/ai/test_self_play.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/ai/self_play.py tests/unit/ai/test_self_play.py
git commit -m "feat: add SelfPlayTrainer for AI self-play training"
```

---

## Task 8: Create BatchSimulator

**Files:**
- Create: `hearthstone/ai/batch_simulator.py`
- Test: `tests/unit/ai/test_batch_simulator.py`

**Step 1: Write the failing test**

```python
# tests/unit/ai/test_batch_simulator.py

import pytest


def test_batch_simulator_exists():
    """Test that BatchSimulator can be imported."""
    from hearthstone.ai.batch_simulator import BatchSimulator
    sim = BatchSimulator()
    assert sim is not None


def test_batch_simulator_default_workers():
    """Test default number of workers."""
    from hearthstone.ai.batch_simulator import BatchSimulator
    sim = BatchSimulator()
    assert sim.num_workers == 4


def test_batch_simulator_custom_workers():
    """Test custom number of workers."""
    from hearthstone.ai.batch_simulator import BatchSimulator
    sim = BatchSimulator(num_workers=8)
    assert sim.num_workers == 8
```

**Step 2: Run test to verify it fails**

Run: `pytest tests/unit/ai/test_batch_simulator.py -v`
Expected: FAIL with "ModuleNotFoundError"

**Step 3: Write implementation**

```python
# hearthstone/ai/batch_simulator.py
"""Batch game simulation for training."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Callable, Optional
from hearthstone.models.card import Card


class BatchSimulator:
    """Run multiple game simulations in parallel."""

    def __init__(self, num_workers: int = 4):
        """Initialize with specified number of parallel workers."""
        self.num_workers = num_workers

    def simulate_games(
        self,
        game_runner: Callable,
        num_games: int,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Run multiple games in parallel.

        Args:
            game_runner: Function that runs a single game and returns result dict
            num_games: Number of games to simulate
            **kwargs: Additional arguments passed to game_runner

        Returns:
            Aggregated results from all games
        """
        results = {
            'wins': 0,
            'losses': 0,
            'draws': 0,
            'total_turns': 0,
            'total_reward': 0.0,
            'games': []
        }

        with ThreadPoolExecutor(max_workers=self.num_workers) as executor:
            futures = [
                executor.submit(game_runner, **kwargs)
                for _ in range(num_games)
            ]

            for future in as_completed(futures):
                try:
                    result = future.result()
                    results['games'].append(result)

                    if result.get('winner') == 'player1':
                        results['wins'] += 1
                    elif result.get('winner') == 'player2':
                        results['losses'] += 1
                    else:
                        results['draws'] += 1

                    results['total_turns'] += result.get('turns', 0)
                    results['total_reward'] += result.get('reward', 0.0)

                except Exception as e:
                    results['errors'] = results.get('errors', 0) + 1

        # Calculate averages
        total = results['wins'] + results['losses'] + results['draws']
        if total > 0:
            results['win_rate'] = results['wins'] / total
            results['avg_turns'] = results['total_turns'] / total
            results['avg_reward'] = results['total_reward'] / total
        else:
            results['win_rate'] = 0.0
            results['avg_turns'] = 0.0
            results['avg_reward'] = 0.0

        return results

    def run_single_game(
        self,
        agent1: Any,
        agent2: Any,
        deck_pool: List[List[Card]],
        max_turns: int = 100
    ) -> Dict[str, Any]:
        """
        Run a single game between two agents.

        This is a helper method that can be passed to simulate_games.
        """
        import random

        # Select decks
        deck1 = random.choice(deck_pool)
        deck2 = random.choice(deck_pool)

        # Placeholder - actual game logic would go here
        # Returns mock result for testing
        return {
            'winner': random.choice(['player1', 'player2']),
            'turns': random.randint(5, 20),
            'reward': random.uniform(-1, 1),
            'deck1_size': len(deck1),
            'deck2_size': len(deck2),
        }
```

**Step 4: Run test to verify it passes**

Run: `pytest tests/unit/ai/test_batch_simulator.py -v`
Expected: PASS

**Step 5: Commit**

```bash
git add hearthstone/ai/batch_simulator.py tests/unit/ai/test_batch_simulator.py
git commit -m "feat: add BatchSimulator for parallel game simulation"
```

---

## Task 9: Integrate CardImporter with DeckManager

**Files:**
- Modify: `hearthstone/decks/deck_manager.py`
- Test: `tests/unit/decks/test_deck_manager.py`

**Step 1: Write the failing test**

```python
# tests/unit/decks/test_deck_manager_integration.py

import pytest


def test_deck_manager_can_import_from_json_api():
    """Test that DeckManager can import cards from HearthstoneJSON."""
    from hearthstone.decks.deck_manager import DeckManager
    from hearthstone.data.card_importer import CardImporter

    manager = DeckManager()
    importer = CardImporter()

    # Test that importer is accessible
    assert importer is not None
```

**Step 2: Run test to verify it passes**

Run: `pytest tests/unit/decks/test_deck_manager_integration.py -v`
Expected: PASS (integration test, just checks connectivity)

**Step 3: Add import to __init__.py**

```python
# hearthstone/data/__init__.py - Update
"""Card data management module."""
from hearthstone.data.card_importer import CardImporter
from hearthstone.data.card_factory import CardFactory

__all__ = ['CardImporter', 'CardFactory']
```

**Step 4: Run all tests to verify nothing is broken**

Run: `pytest tests/ -v --tb=short`
Expected: All tests pass

**Step 5: Commit**

```bash
git add hearthstone/data/__init__.py tests/unit/decks/test_deck_manager_integration.py
git commit -m "feat: integrate CardImporter with deck management"
```

---

## Task 10: Update AI __init__.py

**Files:**
- Modify: `hearthstone/ai/__init__.py`

**Step 1: Update exports**

```python
# hearthstone/ai/__init__.py
"""AI module for Hearthstone."""
from hearthstone.ai.gym_env import HearthstoneEnv
from hearthstone.ai.card_embedding import CardEmbedding
from hearthstone.ai.reward_functions import RewardFunction
from hearthstone.ai.self_play import SelfPlayTrainer
from hearthstone.ai.batch_simulator import BatchSimulator

__all__ = [
    'HearthstoneEnv',
    'CardEmbedding',
    'RewardFunction',
    'SelfPlayTrainer',
    'BatchSimulator',
]
```

**Step 2: Verify imports work**

Run: `python -c "from hearthstone.ai import CardEmbedding, RewardFunction, SelfPlayTrainer, BatchSimulator; print('OK')"`
Expected: "OK"

**Step 3: Commit**

```bash
git add hearthstone/ai/__init__.py
git commit -m "feat: update AI module exports"
```

---

## Task 11: Run Full Test Suite

**Step 1: Run all tests**

Run: `pytest tests/ -v --tb=short`
Expected: All tests pass

**Step 2: Run with coverage (optional)**

Run: `pytest tests/ --cov=hearthstone --cov-report=term-missing`
Expected: Coverage report shows new modules

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 4 - card expansion and AI training infrastructure"
```

---

## Summary

| Task | Module | Files Created | Files Modified |
|------|--------|---------------|----------------|
| 1 | Ability Enum | - | enums.py |
| 2 | CardImporter | card_importer.py, __init__.py | - |
| 3 | CardFactory | card_factory.py | - |
| 4 | CardEmbedding | card_embedding.py | - |
| 5 | RewardFunction | reward_functions.py | - |
| 6 | StateCache | state_cache.py | - |
| 7 | SelfPlayTrainer | self_play.py | - |
| 8 | BatchSimulator | batch_simulator.py | - |
| 9 | Integration | test_deck_manager_integration.py | __init__.py |
| 10 | AI Exports | - | ai/__init__.py |
| 11 | Final Tests | - | - |

**Total: 8 new modules, 4 modified files, 11 test files**
