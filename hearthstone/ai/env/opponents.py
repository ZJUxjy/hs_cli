"""Opponent policies for FireplaceGymEnv."""
from __future__ import annotations

import random
from typing import Optional

import numpy as np
import torch


class OpponentPolicy:
    def act(self, env) -> int:
        raise NotImplementedError


class RandomOpponent(OpponentPolicy):
    def act(self, env) -> int:
        n = len(env.current_valid_actions)
        return random.randrange(n) if n > 0 else 0


class SelfPlayOpponent(OpponentPolicy):
    """Frozen network, greedy argmax over masked logits."""

    def __init__(
        self,
        network_path: Optional[str],
        slot_dim: int = 90,
        hidden_dim: int = 128,
        num_actions: int = 512,
    ):
        from hearthstone.ai.network import PolicyValueNetwork
        self.network = PolicyValueNetwork(
            slot_dim=slot_dim, hidden_dim=hidden_dim, num_actions=num_actions,
        )
        if network_path is not None:
            self.load_from(network_path)
        self.network.eval()
        self.num_actions = num_actions

    def load_from(self, path: str) -> None:
        ckpt = torch.load(path, map_location="cpu")
        sd = ckpt["network"] if isinstance(ckpt, dict) and "network" in ckpt else ckpt
        self.network.load_state_dict(sd)
        self.network.eval()

    def act(self, env) -> int:
        obs = env.build_observation_for(env.game.current_player)
        valid_n = len(env.current_valid_actions)
        if valid_n == 0:
            return 0

        torch_obs = {k: torch.from_numpy(v).unsqueeze(0) for k, v in obs.items()}
        mask = np.zeros(self.num_actions, dtype=np.float32)
        mask[: min(valid_n, self.num_actions)] = 1.0

        with torch.no_grad():
            logits, _ = self.network(torch_obs)
            logits = logits[0] + (1.0 - torch.from_numpy(mask)) * -1e9
            return int(torch.argmax(logits).item())
