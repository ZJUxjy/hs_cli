"""StateCache module for caching game state computations.

This module provides a caching mechanism to avoid redundant computation
of valid actions and other game state derived values.
"""

from typing import TYPE_CHECKING, Any, Callable, List, Optional

if TYPE_CHECKING:
    from hearthstone.engine.game_engine import GameEngine


class StateCache:
    """Cache for game state computations to avoid redundant work.

    This class caches computed values like valid actions and invalidates
    them when the game state changes.
    """

    def __init__(self) -> None:
        """Initialize an empty cache."""
        self._board_state_hash: Optional[int] = None
        self._valid_actions_cache: List[Any] = []

    def get_valid_actions(
        self,
        game_state: "GameEngine",
        compute_fn: Callable[["GameEngine"], List[Any]]
    ) -> List[Any]:
        """Get valid actions with caching.

        If the cache is valid for the current state, returns cached results.
        Otherwise, computes using the provided function and caches the result.

        Args:
            game_state: The current game state/engine.
            compute_fn: Function to compute valid actions if cache is invalid.

        Returns:
            List of valid actions.
        """
        current_hash = self._compute_hash(game_state)

        # Check if cache is still valid
        if self._board_state_hash is not None and self._board_state_hash == current_hash:
            return self._valid_actions_cache

        # Cache is invalid, compute new values
        self._board_state_hash = current_hash
        self._valid_actions_cache = compute_fn(game_state)

        return self._valid_actions_cache

    def invalidate(self) -> None:
        """Invalidate the cache when state changes.

        This should be called whenever the game state changes in a way
        that would affect computed values like valid actions.
        """
        self._board_state_hash = None
        self._valid_actions_cache = []

    def _compute_hash(self, game_state: "GameEngine") -> int:
        """Compute a hash of the game state for cache invalidation.

        This hash is used to detect when the game state has changed
        and the cache needs to be invalidated.

        Args:
            game_state: The game state to hash.

        Returns:
            An integer hash representing the current state.
        """
        # Use a combination of state attributes that affect valid actions
        hash_components = []

        # Include current player if available
        if hasattr(game_state, 'current_player') and game_state.current_player is not None:
            player = game_state.current_player
            # Include player identity
            hash_components.append(id(player))
            # Include mana available
            if hasattr(player, 'mana'):
                hash_components.append(player.mana)
            if hasattr(player, 'max_mana'):
                hash_components.append(player.max_mana)
            # Include hand size
            if hasattr(player, 'hand'):
                hash_components.append(len(player.hand))
            # Include board state
            if hasattr(player, 'board'):
                hash_components.append(len(player.board))

        # Include turn number if available
        if hasattr(game_state, 'turn'):
            hash_components.append(game_state.turn)

        # Include game phase if available
        if hasattr(game_state, 'phase'):
            hash_components.append(hash(game_state.phase))

        # Convert to a stable hash
        return hash(tuple(hash_components))
