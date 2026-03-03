import pytest


def test_batch_simulator_exists():
    """Test that BatchSimulator can be imported."""
    from hearthstone.ai.batch_simulator import BatchSimulator
    sim = BatchSimulator()
    assert sim is not None


def test_batch_simulator_default_workers():
    """Test default number of workers."""
    from hearthstone.ai.batch_simulator import BatchSimulator
    sim = BatchSimulator()
    assert sim.num_workers == 4


def test_batch_simulator_custom_workers():
    """Test custom number of workers."""
    from hearthstone.ai.batch_simulator import BatchSimulator
    sim = BatchSimulator(num_workers=8)
    assert sim.num_workers == 8


def test_simulate_games():
    """Test running multiple games in parallel."""
    from hearthstone.ai.batch_simulator import BatchSimulator

    sim = BatchSimulator(num_workers=2)

    # Simple mock game runner
    def mock_game_runner():
        return {'winner': 'player1', 'turns': 10, 'reward': 1.0}

    results = sim.simulate_games(mock_game_runner, num_games=4)

    assert results['wins'] == 4
    assert results['total_turns'] == 40
    assert results['win_rate'] == 1.0
    assert results['avg_turns'] == 10.0
