import pytest


def test_state_cache_exists():
    """Test that StateCache can be imported."""
    from hearthstone.engine.state_cache import StateCache
    cache = StateCache()
    assert cache is not None


def test_cache_invalidate():
    """Test that cache invalidates properly."""
    from hearthstone.engine.state_cache import StateCache

    cache = StateCache()
    cache._board_state_hash = 12345

    cache.invalidate()

    assert cache._board_state_hash is None
    assert cache._valid_actions_cache == []


def test_get_valid_actions_caches():
    """Test that get_valid_actions caches results."""
    from hearthstone.engine.state_cache import StateCache

    cache = StateCache()

    # Mock state and compute function
    mock_state = type('State', (), {'current_player': type('Player', (), {})()})()

    call_count = 0
    def compute_fn(state):
        nonlocal call_count
        call_count += 1
        return ['action1', 'action2']

    # First call - should compute
    result1 = cache.get_valid_actions(mock_state, compute_fn)
    assert result1 == ['action1', 'action2']
    assert call_count == 1

    # Second call with same state - should use cache
    result2 = cache.get_valid_actions(mock_state, compute_fn)
    assert result2 == ['action1', 'action2']
    assert call_count == 1  # Not incremented
