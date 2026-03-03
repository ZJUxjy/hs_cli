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
    can_attack: bool = False

    def __post_init__(self):
        """Set max_health to health if not specified."""
        # Handle edge case where max_health is at default but health is different
        if self.max_health == 30 and self.health != 30:
            self.max_health = self.health
        # Handle edge case where max_health was explicitly set different from 30
        # and health is still at default of 30 but exceeds max_health
        elif self.health == 30 and self.max_health < 30:
            self.health = self.max_health

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

    def add_armor(self, amount: int) -> int:
        """Add armor to hero. Returns new armor total."""
        self.armor += amount
        return self.armor

    def __str__(self) -> str:
        """String representation of hero."""
        return f"{self.hero_class.name} Hero ({self.health}/{self.max_health})"
