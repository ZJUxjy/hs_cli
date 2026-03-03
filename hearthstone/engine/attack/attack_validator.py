"""Attack validation logic."""
from dataclasses import dataclass, field
from typing import List, Optional, Union

from hearthstone.models.game_state import GameState
from hearthstone.models.card import Minion
from hearthstone.models.hero import Hero
from hearthstone.models.enums import Ability


@dataclass
class ValidationResult:
    """Result of attack validation."""
    valid: bool
    errors: List[str] = field(default_factory=list)
    legal_targets: List[str] = field(default_factory=list)


class AttackValidator:
    """Validate attack actions."""

    def validate_attack(
        self,
        attacker: Minion,
        target_id: str,
        game_state: GameState
    ) -> ValidationResult:
        """Validate if an attack is legal."""
        errors = []

        # Check if attacker can attack
        if not self._can_attack(attacker):
            errors.append("Attacker cannot attack (may have already attacked or is frozen)")

        # Check if target is valid
        if not self._is_valid_target(target_id, game_state):
            errors.append(f"Invalid target: {target_id}")

        # Check taunt restriction
        if self._must_attack_taunt(game_state):
            target = self._get_target(target_id, game_state)
            if target and not self._is_taunt(target):
                errors.append("Must attack taunt minion first")

        # Get legal targets for helpful error messages
        legal_targets = self._get_legal_targets(attacker, game_state)

        return ValidationResult(
            valid=len(errors) == 0,
            errors=errors,
            legal_targets=legal_targets
        )

    def _can_attack(self, attacker: Minion) -> bool:
        """Check if attacker can attack."""
        return attacker.can_attack and Ability.FROZEN not in attacker.abilities

    def _is_valid_target(self, target_id: str, game_state: GameState) -> bool:
        """Check if target exists and is attackable."""
        if target_id == "enemy_hero":
            return True

        # Check if target is on opposing board
        for minion in game_state.opposing_player.board:
            if minion.id == target_id:
                return True

        return False

    def _must_attack_taunt(self, game_state: GameState) -> bool:
        """Check if there are taunt minions on opposing board."""
        for minion in game_state.opposing_player.board:
            if Ability.TAUNT in minion.abilities:
                return True
        return False

    def _is_taunt(self, target) -> bool:
        """Check if target has taunt."""
        if isinstance(target, Minion):
            return Ability.TAUNT in target.abilities
        return False

    def _get_target(self, target_id: str, game_state: GameState) -> Optional[Minion]:
        """Get target minion by ID."""
        for minion in game_state.opposing_player.board:
            if minion.id == target_id:
                return minion
        return None

    def _get_legal_targets(self, attacker: Minion, game_state: GameState) -> List[str]:
        """Get all legal targets for an attacker."""
        targets = []

        # If must attack taunt, only return taunt minions
        if self._must_attack_taunt(game_state):
            for minion in game_state.opposing_player.board:
                if Ability.TAUNT in minion.abilities:
                    targets.append(minion.id)
        else:
            # Can attack any minion or hero
            targets.append("enemy_hero")
            for minion in game_state.opposing_player.board:
                targets.append(minion.id)

        return targets
