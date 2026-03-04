"""Self-play training framework for AI agents."""
import random
from typing import Any, Dict, List, Optional, Type


class SelfPlayTrainer:
    """Manages self-play training for AI agents."""

    def __init__(self, agent_class: Optional[Type], deck_pool: List[List[Any]]):
        """Initialize the self-play trainer.

        Args:
            agent_class: The AI agent class to use for training (can be None for testing)
            deck_pool: List of decks available for selection
        """
        self.agent_class = agent_class
        self.deck_pool = deck_pool
        self.episode_history: List[Dict[str, Any]] = []

    def select_decks(self) -> tuple:
        """Select random decks for both players.

        Returns:
            Tuple of (deck1, deck2) for player 1 and player 2.

        Raises:
            ValueError: If deck_pool is empty.
        """
        if len(self.deck_pool) == 0:
            raise ValueError("deck_pool is empty, cannot select decks")

        if len(self.deck_pool) >= 2:
            deck1, deck2 = random.sample(self.deck_pool, 2)
        else:
            # If only one deck, use it for both players
            deck1 = self.deck_pool[0]
            deck2 = self.deck_pool[0]

        return deck1, deck2

    def record_episode(self, result: Dict[str, Any]) -> None:
        """Record episode result for analysis.

        Args:
            result: Dictionary containing episode results (e.g., winner, turns)
        """
        self.episode_history.append(result)

    def get_stats(self) -> Dict[str, Any]:
        """Get training statistics.

        Returns:
            Dictionary with statistics including:
                - episodes: Total number of episodes recorded
                - avg_turns: Average number of turns per episode
        """
        if not self.episode_history:
            return {
                'episodes': 0,
                'avg_turns': 0.0
            }

        total_turns = sum(ep.get('turns', 0) for ep in self.episode_history)
        avg_turns = total_turns / len(self.episode_history)

        return {
            'episodes': len(self.episode_history),
            'avg_turns': avg_turns
        }

    def clear_history(self) -> None:
        """Clear episode history."""
        self.episode_history.clear()
