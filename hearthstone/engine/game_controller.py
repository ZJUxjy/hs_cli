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
