"""Opponent policies used by OpponentEnv during training and eval."""
import random
from typing import Optional


class OpponentPolicy:
    """Abstract opponent policy. Implementations choose an action index given a controller."""

    def act(self, controller) -> int:
        """Return an integer index into controller.get_valid_actions().

        Args:
            controller: A GameController whose `current_player` is the
                player this policy is acting for. Implementations should
                NOT mutate the controller; only inspect.

        Returns:
            int: index in [0, len(valid_actions)). If valid_actions is
                empty, return 0 (driver / wrapper handles this safely).
        """
        raise NotImplementedError


class RandomOpponent(OpponentPolicy):
    """Picks a uniform-random valid action. Falls back to index 0 when empty."""

    def __init__(self, seed: Optional[int] = None):
        self._rng = random.Random(seed)

    def act(self, controller) -> int:
        valid = controller.get_valid_actions()
        if not valid:
            return 0
        return self._rng.randrange(len(valid))
