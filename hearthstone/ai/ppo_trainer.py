"""PPO trainer with clipped surrogate objective."""
from typing import Dict, Optional, Tuple
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.optim import Adam

from hearthstone.ai.network import PolicyValueNetwork


_NON_OBS_KEYS = {
    "actions", "rewards", "dones", "values",
    "old_log_probs", "advantages", "returns",
}


class PPOTrainer:
    """PPO trainer. Consumes a batch from RolloutBuffer.get()."""

    def __init__(
        self,
        network: PolicyValueNetwork,
        lr: float = 3e-4,
        gamma: float = 0.99,
        gae_lambda: float = 0.95,
        clip_epsilon: float = 0.2,
        value_coef: float = 0.5,
        entropy_coef: float = 0.01,
        max_grad_norm: float = 0.5,
        ppo_epochs: int = 4,
    ):
        self.network = network
        self.optimizer = Adam(network.parameters(), lr=lr)
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.clip_epsilon = clip_epsilon
        self.value_coef = value_coef
        self.entropy_coef = entropy_coef
        self.max_grad_norm = max_grad_norm
        self.ppo_epochs = ppo_epochs

    def update(self, batch: Dict[str, np.ndarray]) -> Dict[str, float]:
        """Run ppo_epochs gradient updates on the rollout batch.

        Required keys: observation tensors + actions, advantages, returns,
        old_log_probs.
        """
        device = next(self.network.parameters()).device

        obs = {
            k: torch.from_numpy(v).float().to(device)
            for k, v in batch.items() if k not in _NON_OBS_KEYS
        }
        actions = torch.from_numpy(batch["actions"]).long().to(device)
        advantages = torch.from_numpy(batch["advantages"]).float().to(device)
        returns = torch.from_numpy(batch["returns"]).float().to(device).unsqueeze(-1)
        old_log_probs = torch.from_numpy(batch["old_log_probs"]).float().to(device)

        total = policy = value = entropy = 0.0
        for _ in range(self.ppo_epochs):
            logits, values, _aux_preds = self.network(obs)
            new_log_probs = self._log_probs(logits, actions)
            ent = self._entropy(logits)

            ratio = torch.exp(new_log_probs - old_log_probs)
            unclipped = ratio * advantages
            clipped = torch.clamp(
                ratio, 1.0 - self.clip_epsilon, 1.0 + self.clip_epsilon
            ) * advantages
            policy_loss = -torch.min(unclipped, clipped).mean()
            value_loss = F.mse_loss(values, returns)

            loss = (
                policy_loss
                + self.value_coef * value_loss
                - self.entropy_coef * ent
            )

            self.optimizer.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(self.network.parameters(), self.max_grad_norm)
            self.optimizer.step()

            total += loss.item()
            policy += policy_loss.item()
            value += value_loss.item()
            entropy += ent.item()

        n = float(self.ppo_epochs)
        return {
            "total_loss": total / n,
            "policy_loss": policy / n,
            "value_loss": value / n,
            "entropy": entropy / n,
        }

    def select_action(
        self,
        obs: Dict[str, torch.Tensor],
        action_mask: Optional[np.ndarray] = None,
    ) -> Tuple[int, float, float]:
        """Sample an action. Returns (action, log_prob, state_value)."""
        device = next(self.network.parameters()).device
        obs_d = {k: v.to(device) for k, v in obs.items()}

        with torch.no_grad():
            logits, value, _aux = self.network(obs_d)
            logits = logits[0]
            if action_mask is not None:
                mask = torch.from_numpy(action_mask).float().to(device)
                logits = logits + (1.0 - mask) * -1e9
            probs = F.softmax(logits, dim=-1)
            dist = torch.distributions.Categorical(probs=probs)
            action = dist.sample()
            log_prob = dist.log_prob(action).item()

        return int(action.item()), float(log_prob), float(value[0, 0].item())

    def _log_probs(self, logits, actions):
        log_probs = F.log_softmax(logits, dim=-1)
        return log_probs.gather(1, actions.unsqueeze(-1)).squeeze(-1)

    def _entropy(self, logits):
        probs = F.softmax(logits, dim=-1)
        log_probs = F.log_softmax(logits, dim=-1)
        return -(probs * log_probs).sum(dim=-1).mean()
