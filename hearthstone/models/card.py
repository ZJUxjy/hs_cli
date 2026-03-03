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
    card_type: CardType = field(default=CardType.MINION)
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
    card_type: CardType = field(default=CardType.SPELL)


@dataclass
class Weapon(Card):
    """Weapon card."""
    card_type: CardType = field(default=CardType.WEAPON)
    attack: int = 0
    durability: int = 0
