"""Player model for Hearthstone game engine."""
from dataclasses import dataclass, field
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from hearthstone.models.card import Minion

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
    board: List["Minion"] = field(default_factory=list)  # Minions on board
    graveyard: List[Card] = field(default_factory=list)
    fatigue_counter: int = 0  # Tracks fatigue damage (increments each time)

    def __post_init__(self):
        """Set mana to max_mana if not explicitly set."""
        if self.mana == 0 and self.max_mana > 0:
            self.mana = self.max_mana

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
            # Fatigue damage: increment counter and deal damage to hero
            self.fatigue_counter += 1
            self.hero.take_damage(self.fatigue_counter)
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
