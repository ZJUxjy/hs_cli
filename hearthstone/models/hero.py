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
