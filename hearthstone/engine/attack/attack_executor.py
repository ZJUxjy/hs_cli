"""Attack execution logic."""
from dataclasses import dataclass
from typing import List, Optional, Union
from hearthstone.models.game_state import GameState
from hearthstone.models.card import Minion
from hearthstone.models.hero import Hero
from hearthstone.models.enums import Ability


@dataclass
class AttackResult:
    """Result of attack execution."""
    success: bool
    message: str = ""
    deaths: List[Minion] = None

    def __post_init__(self):
        if self.deaths is None:
            self.deaths = []


class AttackExecutor:
    """Execute attack actions."""

    def execute_attack(
        self,
        attacker: Union[Minion, Hero],
        target_id: str,
        game_state: GameState
    ) -> AttackResult:
        """Execute an attack."""
        deaths = []

        # Get target
        target = self._get_target(target_id, game_state)
        if target is None:
            return AttackResult(success=False, message="目标未找到")

        # Deal damage to target
        self._deal_damage(attacker, target)

        # Deal damage to attacker (if target is a minion)
        if isinstance(target, Minion) and isinstance(attacker, Minion):
            self._deal_damage(target, attacker)

        # Check for deaths
        deaths = self._check_deaths(game_state)

        # Update attacker state
        if isinstance(attacker, Minion):
            attacker.can_attack = False
            attacker.attacks_this_turn += 1

            # Windfury: can attack twice
            if Ability.WINDFURY in attacker.abilities and attacker.attacks_this_turn < 2:
                attacker.can_attack = True

        return AttackResult(
            success=True,
            message=f"{attacker.name if hasattr(attacker, 'name') else 'Hero'} 攻击了 {target_id}",
            deaths=deaths
        )

    def _get_target(self, target_id: str, game_state: GameState) -> Optional[Union[Minion, Hero]]:
        """Get target by ID."""
        if target_id == "enemy_hero":
            return game_state.opposing_player.hero

        for minion in game_state.opposing_player.board:
            if minion.id == target_id:
                return minion

        return None

    def _deal_damage(self, source: Union[Minion, Hero], target: Union[Minion, Hero]):
        """Deal damage from source to target."""
        damage = 0
        if isinstance(source, Minion):
            damage = source.attack
        elif isinstance(source, Hero):
            damage = source.attack

        if damage > 0:
            # Check for Divine Shield
            if isinstance(target, Minion) and Ability.DIVINE_SHIELD in target.abilities:
                # Divine Shield absorbs all damage and is removed
                target.abilities.remove(Ability.DIVINE_SHIELD)
                return  # No damage dealt

            # Apply damage
            if isinstance(target, Minion):
                target.take_damage(damage)

                # Check for Poisonous - destroys any minion damaged by this
                if isinstance(source, Minion) and Ability.POISONOUS in source.abilities:
                    target.health = 0  # Instant destruction

                # Check for Lifesteal - restore health to hero
                if isinstance(source, Minion) and Ability.LIFESTEAL in source.abilities:
                    # Find the owning player and heal their hero
                    # This is a simplified implementation
                    pass  # TODO: Need reference to source's player

            elif isinstance(target, Hero):
                target.take_damage(damage)

                # Lifesteal for hero attacks
                if isinstance(source, Hero) and source.can_attack:
                    source.health = min(source.max_health, source.health + damage)


    def _check_deaths(self, game_state: GameState) -> List[Minion]:
        """Check and process deaths."""
        deaths = []

        # Check both boards
        for player in [game_state.current_player, game_state.opposing_player]:
            dead_minions = [m for m in player.board if m.is_dead()]
            for minion in dead_minions:
                player.board.remove(minion)
                player.graveyard.append(minion)
                deaths.append(minion)

        return deaths
