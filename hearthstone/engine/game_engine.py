"""Game engine for Hearthstone."""
from typing import List, Optional
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass
from hearthstone.engine.action import (
    Action,
    EndTurnAction,
    PlayCardAction,
    AttackAction,
    ActionResult
)


class GameEngine:
    """Main game engine that manages game state and actions."""

    def __init__(self):
        """Initialize game engine."""
        self.state: Optional[GameState] = None

    def initialize_game(
        self,
        player1_name: str,
        player1_class: HeroClass,
        player2_name: str,
        player2_class: HeroClass
    ):
        """Initialize a new game."""
        player1 = Player(
            hero=Hero(hero_class=player1_class),
            name=player1_name
        )
        player2 = Player(
            hero=Hero(hero_class=player2_class),
            name=player2_name
        )

        self.state = GameState(player1=player1, player2=player2)

        # Set initial mana
        player1.max_mana = 1
        player1.mana = 1
        player2.max_mana = 1
        player2.mana = 1

    def take_action(self, action: Action) -> ActionResult:
        """Execute an action and return result."""
        if isinstance(action, EndTurnAction):
            return self._execute_end_turn(action)
        elif isinstance(action, PlayCardAction):
            return self._execute_play_card(action)
        elif isinstance(action, AttackAction):
            return self._execute_attack(action)
        else:
            return ActionResult(
                success=False,
                message=f"Unknown action type: {type(action)}"
            )

    def _execute_end_turn(self, action: EndTurnAction) -> ActionResult:
        """Execute end turn action."""
        if action.player_id != self.state.current_player.name:
            return ActionResult(
                success=False,
                message="Not your turn"
            )

        # Reset minions for current player
        for minion in self.state.current_player.board:
            minion.reset_attacks()

        # Switch turn
        self.state.switch_turn()

        # Gain mana crystal for new player
        self.state.current_player.gain_mana_crystal()
        self.state.current_player.refresh_mana()

        # Draw a card
        self.state.current_player.draw_card()

        return ActionResult(
            success=True,
            message="Turn ended",
            turn_ended=True
        )

    def _execute_play_card(self, action: PlayCardAction) -> ActionResult:
        """Execute play card action."""
        player = self.state.current_player

        # Validate card index
        if action.card_index < 0 or action.card_index >= len(player.hand):
            return ActionResult(
                success=False,
                message="Invalid card index"
            )

        card = player.hand[action.card_index]

        # Check mana cost
        if card.cost > player.mana:
            return ActionResult(
                success=False,
                message=f"Not enough mana (need {card.cost}, have {player.mana})"
            )

        # Spend mana
        player.spend_mana(card.cost)

        # Play the card
        player.play_card(action.card_index)

        # If it's a minion, put it on the board
        if isinstance(card, Minion):
            if len(player.board) < 7:  # Board limit
                player.board.append(card)

        return ActionResult(
            success=True,
            message=f"Played {card.name}"
        )

    def _execute_attack(self, action: AttackAction) -> ActionResult:
        """Execute attack action."""
        # TODO: Implement attack logic
        return ActionResult(
            success=False,
            message="Attack not implemented yet"
        )
