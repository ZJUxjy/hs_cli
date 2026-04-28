"""Tests for BatchSimulator."""
import pytest


def _module_level_mock_game_runner():
    """Module-level (picklable) fake game runner used by parallel tests."""
    return {'winner': 'player1', 'turns': 10, 'reward': 1.0}


def _module_level_raises():
    raise RuntimeError("boom")


def test_batch_simulator_exists():
    from hearthstone.ai.batch_simulator import BatchSimulator
    assert BatchSimulator() is not None


def test_batch_simulator_default_workers():
    from hearthstone.ai.batch_simulator import BatchSimulator
    assert BatchSimulator().num_workers == 4


def test_batch_simulator_custom_workers():
    from hearthstone.ai.batch_simulator import BatchSimulator
    assert BatchSimulator(num_workers=8).num_workers == 8


def test_simulate_games_all_wins():
    from hearthstone.ai.batch_simulator import BatchSimulator
    sim = BatchSimulator(num_workers=2)
    results = sim.simulate_games(_module_level_mock_game_runner, num_games=4)
    assert results['wins'] == 4
    assert results['total_turns'] == 40
    assert results['win_rate'] == 1.0
    assert results['avg_turns'] == 10.0


def test_simulate_games_handles_errors():
    """Errors inside the worker should be counted, not crash the pool."""
    from hearthstone.ai.batch_simulator import BatchSimulator
    sim = BatchSimulator(num_workers=2)
    results = sim.simulate_games(_module_level_raises, num_games=3)
    assert results['errors'] == 3
    assert results['wins'] == 0
