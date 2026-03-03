"""BatchSimulator for running multiple game simulations in parallel."""

from concurrent.futures import ThreadPoolExecutor
from typing import Callable, Dict, Any, List


class BatchSimulator:
    """Runs multiple game simulations in parallel using ThreadPoolExecutor."""

    def __init__(self, num_workers: int = 4):
        """Initialize the BatchSimulator.

        Args:
            num_workers: Number of parallel workers to use (default: 4)
        """
        self.num_workers = num_workers

    def simulate_games(
        self,
        game_runner: Callable[[], Dict[str, Any]],
        num_games: int,
        **kwargs
    ) -> Dict[str, Any]:
        """Run multiple games in parallel.

        Args:
            game_runner: Callable that runs a single game and returns a dict with:
                        - winner: 'player1', 'player2', or 'draw'
                        - turns: number of turns in the game
                        - reward: reward value for the game
            num_games: Number of games to simulate
            **kwargs: Additional arguments passed to game_runner

        Returns:
            Dict containing:
                - wins: Number of wins
                - losses: Number of losses
                - draws: Number of draws
                - total_turns: Total number of turns across all games
                - total_reward: Total reward across all games
                - games: List of individual game results
                - win_rate: Win rate (wins / total games)
                - avg_turns: Average number of turns per game
                - avg_reward: Average reward per game
        """
        games: List[Dict[str, Any]] = []

        # Run games in parallel
        with ThreadPoolExecutor(max_workers=self.num_workers) as executor:
            futures = [executor.submit(game_runner) for _ in range(num_games)]
            games = [future.result() for future in futures]

        # Aggregate results
        wins = sum(1 for game in games if game.get('winner') == 'player1')
        losses = sum(1 for game in games if game.get('winner') == 'player2')
        draws = sum(1 for game in games if game.get('winner') == 'draw')
        total_turns = sum(game.get('turns', 0) for game in games)
        total_reward = sum(game.get('reward', 0.0) for game in games)

        return {
            'wins': wins,
            'losses': losses,
            'draws': draws,
            'total_turns': total_turns,
            'total_reward': total_reward,
            'games': games,
            'win_rate': wins / num_games if num_games > 0 else 0.0,
            'avg_turns': total_turns / num_games if num_games > 0 else 0.0,
            'avg_reward': total_reward / num_games if num_games > 0 else 0.0,
        }
