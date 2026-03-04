"""BatchSimulator for running multiple game simulations in parallel."""

from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Callable, Dict, Any, List


class BatchSimulator:
    """Runs multiple game simulations in parallel using ThreadPoolExecutor."""

    def __init__(self, num_workers: int = 4):
        """Initialize the BatchSimulator.

        Args:
            num_workers: Number of parallel workers to use (default: 4)
        """
        self.num_workers = num_workers

    def _safe_run_game(self, game_runner: Callable, **kwargs) -> Dict[str, Any]:
        """Safely run a single game with error handling.

        Args:
            game_runner: Callable that runs a single game
            **kwargs: Additional arguments passed to game_runner

        Returns:
            Game result dict, or error dict if exception occurred
        """
        try:
            return game_runner(**kwargs)
        except Exception as e:
            return {
                'error': str(e),
                'winner': None,
                'turns': 0,
                'reward': 0.0
            }

    def simulate_games(
        self,
        game_runner: Callable[[], Dict[str, Any]],
        num_games: int,
        **kwargs
    ) -> Dict[str, Any]:
        """Run multiple games in parallel with error handling.

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
                - errors: Number of games that raised exceptions
                - total_turns: Total number of turns across all games
                - total_reward: Total reward across all games
                - games: List of individual game results
                - win_rate: Win rate (wins / total games)
                - avg_turns: Average number of turns per game
                - avg_reward: Average reward per game
        """
        results = {
            'wins': 0,
            'losses': 0,
            'draws': 0,
            'total_turns': 0,
            'total_reward': 0.0,
            'games': [],
            'errors': 0,
        }

        # Run games in parallel
        with ThreadPoolExecutor(max_workers=self.num_workers) as executor:
            futures = [
                executor.submit(self._safe_run_game, game_runner, **kwargs)
                for _ in range(num_games)
            ]

            for future in as_completed(futures):
                try:
                    result = future.result()
                    results['games'].append(result)

                    if result.get('error'):
                        results['errors'] += 1
                    elif result.get('winner') == 'player1':
                        results['wins'] += 1
                    elif result.get('winner') == 'player2':
                        results['losses'] += 1
                    else:
                        results['draws'] += 1

                    results['total_turns'] += result.get('turns', 0)
                    results['total_reward'] += result.get('reward', 0.0)

                except Exception as e:
                    results['errors'] += 1
                    results['games'].append({
                        'error': str(e),
                        'winner': None,
                        'turns': 0,
                        'reward': 0.0
                    })

        total_games = num_games if num_games > 0 else 1

        return {
            'wins': results['wins'],
            'losses': results['losses'],
            'draws': results['draws'],
            'errors': results['errors'],
            'total_turns': results['total_turns'],
            'total_reward': results['total_reward'],
            'games': results['games'],
            'win_rate': results['wins'] / total_games,
            'avg_turns': results['total_turns'] / total_games,
            'avg_reward': results['total_reward'] / total_games,
        }
