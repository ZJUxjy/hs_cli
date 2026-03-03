"""Reward function for reinforcement learning training."""


class RewardFunction:
    """Calculates rewards for AI training based on game state changes."""

    # Reward constants
    VICTORY_REWARD = 100.0
    DEFEAT_PENALTY = -100.0
    HEALTH_WEIGHT = 1.0
    BOARD_CONTROL_WEIGHT = 0.5

    def __init__(self, health_weight=None, board_control_weight=None):
        """Initialize reward function with configurable weights.

        Args:
            health_weight: Weight for health advantage reward (default: 1.0)
            board_control_weight: Weight for board control reward (default: 0.5)
        """
        self.health_weight = health_weight if health_weight is not None else self.HEALTH_WEIGHT
        self.board_control_weight = (
            board_control_weight if board_control_weight is not None else self.BOARD_CONTROL_WEIGHT
        )

    def calculate(self, old_state, new_state, action):
        """Calculate reward based on state transition.

        Args:
            old_state: Previous game state (can be None for initial state)
            new_state: Current game state
            action: Action taken (can be None)

        Returns:
            float: Reward value
        """
        # Check for terminal states first
        if new_state.is_game_over():
            winner = new_state.get_winner()
            if winner.name == new_state.current_player.name:
                return self.VICTORY_REWARD
            else:
                return self.DEFEAT_PENALTY

        # Calculate intermediate rewards
        reward = 0.0

        if old_state is not None:
            # Health advantage reward
            old_health_diff = self._health_difference(old_state)
            new_health_diff = self._health_difference(new_state)
            health_reward = (new_health_diff - old_health_diff) * self.health_weight
            reward += health_reward

            # Board control reward
            old_board_diff = self._board_control_bonus(old_state)
            new_board_diff = self._board_control_bonus(new_state)
            board_reward = (new_board_diff - old_board_diff) * self.board_control_weight
            reward += board_reward

        return reward

    def _health_difference(self, state):
        """Calculate health advantage.

        Args:
            state: Game state

        Returns:
            float: Health difference (positive = advantage)
        """
        player_health = state.current_player.hero.health
        enemy_health = state.opposing_player.hero.health
        return player_health - enemy_health

    def _board_control_bonus(self, state):
        """Calculate board control advantage.

        Args:
            state: Game state

        Returns:
            float: Board control difference (positive = advantage)
        """
        player_board_size = len(state.current_player.board)
        enemy_board_size = len(state.opposing_player.board)
        return player_board_size - enemy_board_size
