import pytest


def test_reward_function_exists():
    """Test that RewardFunction can be imported."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()
    assert rf is not None


def test_victory_reward():
    """Test reward for winning."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()

    # Mock state - player wins
    new_state = MockGameState(game_over=True, player_wins=True)

    reward = rf.calculate(None, new_state, None)
    assert reward == 100.0


def test_defeat_penalty():
    """Test penalty for losing."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()

    new_state = MockGameState(game_over=True, player_wins=False)

    reward = rf.calculate(None, new_state, None)
    assert reward == -100.0


def test_health_advantage_reward():
    """Test reward for health advantage."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()

    old_state = MockGameState(
        player_health=20, enemy_health=20, game_over=False
    )
    new_state = MockGameState(
        player_health=20, enemy_health=15, game_over=False
    )

    reward = rf.calculate(old_state, new_state, None)
    # Health diff went from 0 to +5, should get positive reward
    assert reward > 0


def test_board_control_reward():
    """Test reward for board control."""
    from hearthstone.ai.reward_functions import RewardFunction
    rf = RewardFunction()

    old_state = MockGameState(
        player_health=20, enemy_health=20, game_over=False,
        player_board_size=2, enemy_board_size=2
    )
    new_state = MockGameState(
        player_health=20, enemy_health=20, game_over=False,
        player_board_size=3, enemy_board_size=1
    )

    reward = rf.calculate(old_state, new_state, None)
    # Board advantage went from 0 to +2, should get positive reward
    assert reward > 0


class MockGameState:
    """Mock game state for testing."""
    def __init__(self, player_health=30, enemy_health=30,
                 game_over=False, player_wins=False,
                 player_board_size=0, enemy_board_size=0):
        self._player_health = player_health
        self._enemy_health = enemy_health
        self._game_over = game_over
        self._player_wins = player_wins
        self._player_board_size = player_board_size
        self._enemy_board_size = enemy_board_size

    def is_game_over(self):
        return self._game_over

    def get_winner(self):
        if self._player_wins:
            return type('Player', (), {'name': 'player1'})()
        return type('Player', (), {'name': 'player2'})()

    @property
    def current_player(self):
        return type('Player', (), {
            'name': 'player1',
            'hero': type('Hero', (), {'health': self._player_health})(),
            'board': [type('Minion', (), {})] * self._player_board_size
        })()

    @property
    def opposing_player(self):
        return type('Player', (), {
            'hero': type('Hero', (), {'health': self._enemy_health})(),
            'board': [type('Minion', (), {})] * self._enemy_board_size
        })()
