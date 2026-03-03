"""Central game loop controller."""
from dataclasses import dataclass, field
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
    state_changes: Dict[str, Any] = field(default_factory=dict)
    errors: List[str] = field(default_factory=list)


class GameController:
    """Central game loop manager."""

    def __init__(self, deck1: Deck, deck2: Deck):
        """Initialize with two decks."""
        self.deck1 = deck1
        self.deck2 = deck2
        self.engine: Optional[GameEngine] = None

    def start_game(self) -> GameState:
        """Start a new game."""
        raise NotImplementedError("start_game is not yet implemented")

    def get_valid_actions(self) -> List[Action]:
        """Get all legal actions for current player."""
        raise NotImplementedError("get_valid_actions is not yet implemented")

    def execute_action(self, action: Action) -> GameEvent:
        """Execute an action and return result."""
        raise NotImplementedError("execute_action is not yet implemented")

    def get_state(self) -> GameState:
        """Get current game state."""
        raise NotImplementedError("get_state is not yet implemented")

    def is_game_over(self) -> bool:
        """Check if game has ended."""
        raise NotImplementedError("is_game_over is not yet implemented")

    def get_winner(self) -> Optional[Player]:
        """Get winner if game is over."""
        raise NotImplementedError("get_winner is not yet implemented")
