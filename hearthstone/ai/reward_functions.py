"""Reward function for reinforcement learning training."""

from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from hearthstone.models.game_state import GameState


class RewardFunction:
    """Calculates rewards for AI training based on game state changes.

    Rewards are always computed from the perspective of `player_name`. If
    `player_name` is None, falls back to `state.current_player` for backward
    compatibility, but callers should pass an explicit name during training.
    """

    VICTORY_REWARD = 100.0
    DEFEAT_PENALTY = -100.0
    HEALTH_WEIGHT = 1.0
    BOARD_CONTROL_WEIGHT = 0.5

    def __init__(self, health_weight=None, board_control_weight=None):
        self.health_weight = health_weight if health_weight is not None else self.HEALTH_WEIGHT
        self.board_control_weight = (
            board_control_weight if board_control_weight is not None else self.BOARD_CONTROL_WEIGHT
        )

    def calculate(
        self,
        old_state: Optional["GameState"],
        new_state: "GameState",
        player_name: Optional[str] = None,
    ) -> float:
        """Reward from the perspective of `player_name` (defaults to current_player)."""
        if new_state.is_game_over():
            winner = new_state.get_winner()
            if winner is None:
                return 0.0
            perspective = player_name if player_name else new_state.current_player.name
            return self.VICTORY_REWARD if winner.name == perspective else self.DEFEAT_PENALTY

        reward = 0.0
        if old_state is not None:
            old_h = self._health_diff(old_state, player_name)
            new_h = self._health_diff(new_state, player_name)
            reward += (new_h - old_h) * self.health_weight

            old_b = self._board_diff(old_state, player_name)
            new_b = self._board_diff(new_state, player_name)
            reward += (new_b - old_b) * self.board_control_weight

        return reward

    def _resolve(self, state, player_name: Optional[str]):
        """Return (me, opponent) where `me` is the training player.

        When player_name is None or matches current_player.name, `me` is
        current_player; otherwise the players are swapped. Works on both
        the real GameState and the test mocks (only needs current_player /
        opposing_player and a `.name` on current_player).
        """
        if player_name and state.current_player.name != player_name:
            return state.opposing_player, state.current_player
        return state.current_player, state.opposing_player

    def _health_diff(self, state, player_name: Optional[str]) -> float:
        me, opp = self._resolve(state, player_name)
        return me.hero.health - opp.hero.health

    def _board_diff(self, state, player_name: Optional[str]) -> float:
        me, opp = self._resolve(state, player_name)
        return len(me.board) - len(opp.board)

    def __repr__(self) -> str:
        return (
            f"RewardFunction(health_weight={self.health_weight}, "
            f"board_control_weight={self.board_control_weight})"
        )
