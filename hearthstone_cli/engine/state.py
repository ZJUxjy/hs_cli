"""Core state definitions for Hearthstone CLI game."""

from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, FrozenSet, Optional, Tuple


class Zone(Enum):
    """Card/minion zones in the game."""
    DECK = auto()
    HAND = auto()
    BOARD = auto()
    GRAVEYARD = auto()
    HERO = auto()
    WEAPON = auto()


class Attribute(Enum):
    """Minion/weapon attributes."""
    TAUNT = auto()          # 嘲讽
    DIVINE_SHIELD = auto()  # 圣盾
    WINDFURY = auto()       # 风怒
    CHARGE = auto()         # 冲锋
    STEALTH = auto()        # 潜行
    POISONOUS = auto()      # 剧毒
    LIFESTEAL = auto()      # 吸血
    ELUSIVE = auto()        # 魔免
    FROZEN = auto()         # 冻结


@dataclass(frozen=True)
class WeaponState:
    """Weapon state."""
    card_id: str
    attack: int
    durability: int
    max_durability: int
    attributes: FrozenSet[Attribute] = field(default_factory=frozenset)


@dataclass(frozen=True)
class HeroPower:
    """英雄技能状态."""
    name: str
    cost: int
    damage: int = 0
    heal: int = 0
    armor: int = 0
    description: str = ""
    target_required: bool = False


@dataclass(frozen=True)
class HeroState:
    """Hero state."""
    health: int
    max_health: int = 30
    armor: int = 0
    weapon: Optional[WeaponState] = None
    hero_power: Optional[HeroPower] = None


@dataclass(frozen=True)
class ManaState:
    """Mana crystal state."""
    current: int
    max_mana: int
    overload: int = 0
    locked: int = 0


@dataclass(frozen=True)
class Enchantment:
    """Enchantment/buff applied to a minion."""
    source: str
    attack_bonus: int = 0
    health_bonus: int = 0
    one_turn: bool = False


@dataclass(frozen=True)
class Minion:
    """Minion state on the board."""
    card_id: str
    attack: int
    health: int
    max_health: int
    attributes: FrozenSet[Attribute]
    enchantments: Tuple[Enchantment, ...]
    damage_taken: int
    summoned_this_turn: bool
    exhausted: bool

    @property
    def is_alive(self) -> bool:
        """Check if the minion is alive."""
        return self.health > 0


@dataclass(frozen=True)
class Card:
    """Card state."""
    card_id: str
    name: str
    cost: int
    card_type: str
    attack: Optional[int] = None
    health: Optional[int] = None
    durability: Optional[int] = None
    attributes: FrozenSet[Attribute] = field(default_factory=frozenset)
    text: str = ""


@dataclass(frozen=True)
class Secret:
    """Secret state."""
    card_id: str
    trigger_type: str  # "attack_hero", "play_minion", "cast_spell", "take_damage", etc.
    effect_data: Tuple[Tuple[str, Any], ...] = field(default_factory=tuple)  # Hashable format


@dataclass(frozen=True)
class PlayerState:
    """Player state."""
    hero: HeroState
    mana: ManaState
    deck: Tuple[Card, ...]
    hand: Tuple[Card, ...]
    board: Tuple[Minion, ...]
    secrets: FrozenSet[Secret]
    graveyard: Tuple[Card, ...]
    attacks_this_turn: Tuple[Tuple[int, int], ...]  # [(minion_index, attack_count), ...]
    hero_power_used: bool
    fatigue_count: int = 0


@dataclass(frozen=True)
class RandomState:
    """Random number generator state for reproducibility."""
    seed: int
    sequence_position: int = 0


@dataclass(frozen=True)
class GameState:
    """Complete game state."""
    turn: int
    active_player: int
    players: Tuple[PlayerState, PlayerState]
    action_history: Tuple
    rng_state: RandomState
    phase_stack: Tuple

    @classmethod
    def create_new(cls, seed: int = 42) -> "GameState":
        """Create a new game state for testing."""
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
            attacks_this_turn=tuple(),
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
