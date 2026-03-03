"""Game state model for Hearthstone game engine."""
from dataclasses import dataclass, field
from typing import Optional
from hearthstone.models.player import Player
from hearthstone.models.enums import GamePhase


@dataclass
class GameState:
    """Complete state of a Hearthstone game."""
    player1: Player
    player2: Player
    current_player: Optional[Player] = None
    opposing_player: Optional[Player] = None
    turn: int = 1
    phase: GamePhase = GamePhase.MAIN

    def __post_init__(self):
        """Initialize current and opposing players."""
        if self.current_player is None:
            self.current_player = self.player1
        if self.opposing_player is None:
            self.opposing_player = self.player2

    def switch_turn(self):
        """Switch to the other player's turn."""
        self.current_player, self.opposing_player = (
            self.opposing_player,
            self.current_player,
        )

        # Increment turn counter when going back to player1
        if self.current_player == self.player1:
            self.turn += 1

    def is_game_over(self) -> bool:
        """Check if game is over."""
        return self.player1.hero.is_dead() or self.player2.hero.is_dead()

    def get_winner(self) -> Optional[Player]:
        """Get the winner if game is over."""
        if self.player1.hero.is_dead():
            return self.player2
        if self.player2.hero.is_dead():
            return self.player1
        return None
