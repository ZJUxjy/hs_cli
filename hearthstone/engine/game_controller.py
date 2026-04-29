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
        """Start a new game.

        Each player gets independent deepcopies of their deck cards so
        that mutating one card (e.g. setting instance_id when a minion is
        played) does not affect any other copy of the same card. Without
        deepcopy, DeckManager may return aliased Python objects for
        duplicate cards and the per-instance state collides.
        """
        import copy
        # Create players with decks
        from hearthstone.models.hero import Hero
        from hearthstone.models.player import Player

        player1 = Player(
            hero=Hero(hero_class=self.deck1.hero_class),
            name="Player 1"
        )
        player1.deck = [copy.deepcopy(c) for c in self.deck1.cards]

        player2 = Player(
            hero=Hero(hero_class=self.deck2.hero_class),
            name="Player 2"
        )
        player2.deck = [copy.deepcopy(c) for c in self.deck2.cards]

        # Create game state
        from hearthstone.models.game_state import GameState
        state = GameState(player1=player1, player2=player2)

        # Create game engine
        self.engine = GameEngine(state)

        # Initialize game (draw starting hands, set mana)
        self.engine.initialize_game()

        return state

    def get_valid_actions(self) -> List[Action]:
        """Get all legal actions for current player.

        Filters attack actions through the Taunt rule: when the opposing
        board has at least one Taunt minion, only attacks targeting a
        Taunt minion are returned. Without this filter, the agent can
        deterministically pick a non-Taunt attack that the engine then
        rejects, looping forever on the same observation.
        """
        if self.engine is None or self.engine.state is None:
            return []

        from hearthstone.engine.action import (
            AttackAction, EndTurnAction, PlayCardAction,
        )
        from hearthstone.models.enums import Ability

        actions: List[Action] = []
        state = self.engine.state
        player = state.current_player

        # Always can end turn
        actions.append(EndTurnAction(player_id=player.name))

        # Can play cards from hand
        for i, card in enumerate(player.hand):
            if card.cost <= player.mana:
                actions.append(PlayCardAction(player_id=player.name, card_index=i))

        # Determine taunt-must-be-attacked targets on the opposing board.
        opposing_taunts = [
            m for m in state.opposing_player.board if Ability.TAUNT in m.abilities
        ]
        must_attack_taunt = bool(opposing_taunts)

        # Can attack with minions on board
        for minion in player.board:
            if not minion.can_attack:
                continue
            minion_id = minion.instance_id or minion.id

            if must_attack_taunt:
                # Only Taunt minions are legal targets.
                for enemy_minion in opposing_taunts:
                    enemy_id = enemy_minion.instance_id or enemy_minion.id
                    actions.append(AttackAction(
                        player_id=player.name,
                        attacker_id=minion_id,
                        target_id=enemy_id,
                    ))
            else:
                # All enemy minions and the hero are legal targets.
                for enemy_minion in state.opposing_player.board:
                    enemy_id = enemy_minion.instance_id or enemy_minion.id
                    actions.append(AttackAction(
                        player_id=player.name,
                        attacker_id=minion_id,
                        target_id=enemy_id,
                    ))
                actions.append(AttackAction(
                    player_id=player.name,
                    attacker_id=minion_id,
                    target_id="enemy_hero",
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
