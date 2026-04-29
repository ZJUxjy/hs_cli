"""Opponent policies used by OpponentEnv during training and eval."""
import random
from typing import Optional

import numpy as np
import torch

from hearthstone.ai.card_embedding import CardEmbedding, build_observation
from hearthstone.ai.network import PolicyValueNetwork


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


class SelfPlayOpponent(OpponentPolicy):
    """Frozen-network opponent. Greedy action selection over a masked policy.

    The network is loaded once at construction (or via load_from) and is
    NOT updated during training. The driver calls load_from() exactly
    once on phase transition; mid-phase weights are stable.
    """

    def __init__(
        self,
        network_path: Optional[str] = None,
        embedding_dim: int = 64,
        hidden_dim: int = 128,
        num_actions: int = 100,
    ):
        self.network = PolicyValueNetwork(
            embedding_dim=embedding_dim,
            hidden_dim=hidden_dim,
            num_actions=num_actions,
        )
        if network_path is not None:
            self.load_from(network_path)
        self.network.eval()
        self.embedding_dim = embedding_dim
        self.num_actions = num_actions
        # Cache a CardEmbedding instance to avoid per-call allocation.
        self._embedding = CardEmbedding(embedding_dim=embedding_dim)

    def load_from(self, path: str) -> None:
        """Load network weights from a checkpoint.

        Loads only the network state_dict — optimizer state, iter counter,
        and training metadata are intentionally ignored. Opponents are
        frozen inference-only.
        """
        ckpt = torch.load(path, map_location="cpu", weights_only=True)
        if isinstance(ckpt, dict) and "network" in ckpt:
            state_dict = ckpt["network"]
        else:
            state_dict = ckpt
        self.network.load_state_dict(state_dict)
        self.network.eval()

    def act(self, controller) -> int:
        valid = controller.get_valid_actions()
        if not valid:
            return 0

        state = controller.get_state()
        obs = build_observation(
            state,
            perspective_player=state.current_player,
            embedding_dim=self.embedding_dim,
            embedding=self._embedding,
        )
        torch_obs = {k: torch.from_numpy(v).unsqueeze(0) for k, v in obs.items()}

        mask = np.zeros(self.num_actions, dtype=np.float32)
        mask[: min(len(valid), self.num_actions)] = 1.0
        mask_t = torch.from_numpy(mask)

        with torch.no_grad():
            logits, _ = self.network(torch_obs)
            logits = logits[0] + (1.0 - mask_t) * -1e9
            return int(torch.argmax(logits).item())
