"""BatchSimulator: parallel game simulation with multi-process workers."""
from concurrent.futures import ProcessPoolExecutor, as_completed
from typing import Any, Callable, Dict
import multiprocessing as mp


def _run_one_game(args: tuple) -> Dict[str, Any]:
    """Top-level worker (must be picklable for spawn-context pools)."""
    game_runner, kwargs = args
    try:
        return game_runner(**kwargs)
    except Exception as e:
        return {'error': str(e), 'winner': None, 'turns': 0, 'reward': 0.0}


class BatchSimulator:
    """Run multiple game simulations in parallel using ProcessPoolExecutor.

    Pickling note: `game_runner` and any keyword arguments must be picklable
    (i.e. defined at module level, not lambdas or closures). On Linux the
    'spawn' start method is used to match macOS/Windows defaults and avoid
    fork-related bugs with PyTorch.
    """

    def __init__(self, num_workers: int = 4):
        self.num_workers = num_workers

    def simulate_games(
        self,
        game_runner: Callable[..., Dict[str, Any]],
        num_games: int,
        **kwargs,
    ) -> Dict[str, Any]:
        wins = losses = draws = errors = 0
        total_turns = 0
        total_reward = 0.0
        games: list = []

        ctx = mp.get_context('spawn')
        worker_args = [(game_runner, kwargs) for _ in range(num_games)]

        with ProcessPoolExecutor(max_workers=self.num_workers, mp_context=ctx) as pool:
            futures = [pool.submit(_run_one_game, args) for args in worker_args]
            for fut in as_completed(futures):
                try:
                    result = fut.result()
                except Exception as e:
                    result = {'error': str(e), 'winner': None, 'turns': 0, 'reward': 0.0}

                games.append(result)
                if result.get('error'):
                    errors += 1
                elif result.get('winner') == 'player1':
                    wins += 1
                elif result.get('winner') == 'player2':
                    losses += 1
                else:
                    draws += 1
                total_turns += int(result.get('turns', 0))
                total_reward += float(result.get('reward', 0.0))

        denom = num_games if num_games > 0 else 1
        return {
            'wins': wins,
            'losses': losses,
            'draws': draws,
            'errors': errors,
            'total_turns': total_turns,
            'total_reward': total_reward,
            'games': games,
            'win_rate': wins / denom,
            'avg_turns': total_turns / denom,
            'avg_reward': total_reward / denom,
        }

    def __repr__(self) -> str:
        return f"BatchSimulator(num_workers={self.num_workers})"
