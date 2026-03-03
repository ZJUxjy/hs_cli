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

        return state

    def get_valid_actions(self) -> List[Action]:
        """Get all legal actions for current player."""
        if self.engine is None or self.engine.state is None:
            return []

        actions = []
        state = self.engine.state
        player = state.current_player

        # Always can end turn
        from hearthstone.engine.action import EndTurnAction
        actions.append(EndTurnAction(player_id=player.name))

        # Can play cards from hand
        from hearthstone.engine.action import PlayCardAction
        for i, card in enumerate(player.hand):
            if card.cost <= player.mana:
                actions.append(PlayCardAction(player_id=player.name, card_index=i))

        # Can attack with minions on board
        from hearthstone.engine.action import AttackAction
        for minion in player.board:
            if minion.can_attack():
                # Can attack enemy minions
                for enemy_minion in state.opposing_player.board:
                    actions.append(AttackAction(
                        player_id=player.name,
                        attacker_id=minion.id,
                        target_id=enemy_minion.id
                    ))
                # Can attack enemy hero
                actions.append(AttackAction(
                    player_id=player.name,
                    attacker_id=minion.id,
                    target_id=state.opposing_player.hero.id
                ))

        return actions

    def execute_action(self, action: Action) -> GameEvent:
        """Execute an action and return result."""
        if self.engine is None:
            return GameEvent(
                success=False,
                message="Game not started",
                errors=["Call start_game() first"]
            )

        result = self.engine.take_action(action)

        return GameEvent(
            success=result.success,
            message=result.message,
            state_changes={"turn_ended": result.turn_ended, "game_over": result.game_over}
        )

    def get_state(self) -> GameState:
        """Get current game state."""
        if self.engine is None:
            raise RuntimeError("Game not started. Call start_game() first.")
        return self.engine.state

    def is_game_over(self) -> bool:
        """Check if game has ended."""
        if self.engine is None or self.engine.state is None:
            return False
        return self.engine.state.is_game_over()

    def get_winner(self) -> Optional[Player]:
        """Get winner if game is over."""
        if self.engine is None or self.engine.state is None:
            return None
        return self.engine.state.get_winner()
