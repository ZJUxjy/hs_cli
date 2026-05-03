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
    "aux_target", "aux_mask",
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
        aux_loss_coef: float = 0.5,
        aux_warmup_iters: int = 100,
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
        self.aux_loss_coef = aux_loss_coef
        self.aux_warmup_iters = aux_warmup_iters

    def update(self, batch: Dict[str, np.ndarray],
               current_iter: int = 0) -> Dict[str, float]:
        """Run ppo_epochs gradient updates on the rollout batch.

        Required keys: observation tensors + actions, advantages, returns,
        old_log_probs. Optional: aux_target, aux_mask (default zeros).
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
        n_steps = batch["actions"].shape[0]
        aux_target_np = batch.get("aux_target", np.zeros(n_steps, dtype=np.float32))
        aux_mask_np = batch.get("aux_mask", np.zeros(n_steps, dtype=bool))
        aux_target = torch.from_numpy(aux_target_np).float().to(device)
        aux_mask = torch.from_numpy(aux_mask_np).bool().to(device)

        # Aux warmup: zero coef while V is poorly calibrated. After warmup,
        # the aux loss contributes via aux_loss_coef.
        effective_aux_coef = (
            0.0 if current_iter < self.aux_warmup_iters else self.aux_loss_coef
        )

        total = policy = value = entropy = aux_total = 0.0
        n_aux_seen = 0
        for _ in range(self.ppo_epochs):
            logits, values, aux_preds = self.network(obs)
            new_log_probs = self._log_probs(logits, actions)
            ent = self._entropy(logits)

            ratio = torch.exp(new_log_probs - old_log_probs)
            unclipped = ratio * advantages
            clipped = torch.clamp(
                ratio, 1.0 - self.clip_epsilon, 1.0 + self.clip_epsilon
            ) * advantages
            policy_loss = -torch.min(unclipped, clipped).mean()
            value_loss = F.mse_loss(values, returns)

            n_aux = int(aux_mask.sum().item())
            if n_aux > 0:
                aux_loss = F.mse_loss(
                    aux_preds.squeeze(-1)[aux_mask], aux_target[aux_mask],
                )
            else:
                aux_loss = torch.tensor(0.0, device=device)

            loss = (
                policy_loss
                + self.value_coef * value_loss
                - self.entropy_coef * ent
                + effective_aux_coef * aux_loss
            )

            self.optimizer.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(self.network.parameters(), self.max_grad_norm)
            self.optimizer.step()

            total += loss.item()
            policy += policy_loss.item()
            value += value_loss.item()
            entropy += ent.item()
            aux_total += aux_loss.item()
            n_aux_seen = n_aux

        n = float(self.ppo_epochs)
        return {
            "total_loss": total / n,
            "policy_loss": policy / n,
            "value_loss": value / n,
            "entropy": entropy / n,
            "aux_loss": aux_total / n,
            "aux_n_samples": float(n_aux_seen),
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
