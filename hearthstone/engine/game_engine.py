"""Game engine for Hearthstone."""
from typing import List, Optional
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion, Spell
from hearthstone.models.enums import HeroClass
from hearthstone.engine.action import (
    Action,
    EndTurnAction,
    PlayCardAction,
    AttackAction,
    ActionResult
)
from hearthstone.engine.attack.attack_validator import AttackValidator
from hearthstone.engine.attack.attack_executor import AttackExecutor


class GameEngine:
    """Main game engine that manages game state and actions."""

    def __init__(self, state: Optional[GameState] = None):
        """Initialize game engine with optional state."""
        self.state: Optional[GameState] = state
        self.attack_validator = AttackValidator()
        self.attack_executor = AttackExecutor()
        self._minion_id_counter = 0  # Unique ID generator for minions

    def initialize_game(self):
        """Initialize a new game - draw starting hands and set up mana."""
        if self.state is None:
            raise ValueError("Game state not set")

        # Set initial mana
        self.state.player1.max_mana = 1
        self.state.player1.mana = 1
        self.state.player2.max_mana = 1
        self.state.player2.mana = 1

        # Draw starting hands (3 cards for player 1, 4 cards for player 2)
        for _ in range(3):
            self.state.player1.draw_card()
        for _ in range(4):
            self.state.player2.draw_card()

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
                # Assign unique instance ID
                self._minion_id_counter += 1
                card.instance_id = f"{card.id}_{self._minion_id_counter}"

                # Set can_attack based on abilities
                from hearthstone.models.enums import Ability
                card.can_attack = Ability.CHARGE in card.abilities
                player.board.append(card)

        # If it's a spell, execute its effect
        elif isinstance(card, Spell):
            effect_message = self._execute_spell_effect(card, action.target_id)
            return ActionResult(
                success=True,
                message=f"Cast {card.name}: {effect_message}"
            )

        return ActionResult(
            success=True,
            message=f"Played {card.name}"
        )

    def _execute_spell_effect(self, spell: Spell, target_id: Optional[str]) -> str:
        """Execute spell effect and return effect message."""
        from hearthstone.models.enums import SpellEffect

        effect = spell.effect
        value = spell.effect_value
        player = self.state.current_player

        if effect == SpellEffect.DAMAGE:
            # Deal damage to target
            if target_id == "enemy_hero":
                self.state.opposing_player.hero.take_damage(value)
                return f"Dealt {value} damage to enemy hero"
            elif target_id:
                # Find target minion
                for minion in self.state.opposing_player.board:
                    if minion.instance_id == target_id or minion.id == target_id:
                        minion.take_damage(value)
                        return f"Dealt {value} damage to {minion.name}"
            return f"No valid target for damage"

        elif effect == SpellEffect.HEAL:
            # Restore health to target
            if target_id == "friendly_hero" or target_id is None:
                player.hero.health = min(player.hero.max_health, player.hero.health + value)
                return f"Restored {value} health to hero"
            elif target_id:
                # Find target minion
                for minion in player.board:
                    if minion.instance_id == target_id or minion.id == target_id:
                        minion.health = min(minion.max_health, minion.health + value)
                        return f"Restored {value} health to {minion.name}"
            return f"No valid target for healing"

        elif effect == SpellEffect.DRAW:
            # Draw cards
            for _ in range(value):
                player.draw_card()
            return f"Drew {value} cards"

        elif effect == SpellEffect.ARMOR:
            # Gain armor
            player.hero.armor += value
            return f"Gained {value} armor"

        return f"Unknown effect: {effect}"

    def _execute_attack(self, action: AttackAction) -> ActionResult:
        """Execute attack action."""
        player = self.state.current_player

        # Find attacker
        attacker = None
        for minion in player.board:
            if minion.id == action.attacker_id:
                attacker = minion
                break

        if not attacker:
            return ActionResult(
                success=False,
                message=f"Attacker not found: {action.attacker_id}"
            )

        # Validate attack
        validation = self.attack_validator.validate_attack(
            attacker, action.target_id, self.state
        )

        if not validation.valid:
            return ActionResult(
                success=False,
                message="; ".join(validation.errors)
            )

        # Execute attack
        result = self.attack_executor.execute_attack(
            attacker, action.target_id, self.state
        )

        return ActionResult(
            success=result.success,
            message=result.message,
            game_over=self.state.is_game_over()
        )
