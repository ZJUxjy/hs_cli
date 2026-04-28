"""Sequential rollout buffer with Generalized Advantage Estimation."""
from typing import Dict, Optional
import numpy as np


class RolloutBuffer:
    """Stores on-policy trajectories and computes GAE.

    Use:
        buf = RolloutBuffer(capacity=2048, gamma=0.99, gae_lambda=0.95)
        for step in range(rollout_length):
            buf.add(obs, action, reward, value, log_prob, done)
        buf.compute_returns_and_advantages(last_value=bootstrap_value)
        batch = buf.get()
        # ... train ...
        buf.reset()
    """

    def __init__(self, capacity: int, gamma: float = 0.99, gae_lambda: float = 0.95):
        self.capacity = capacity
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self._observations: list[dict] = []
        self._actions: list[int] = []
        self._rewards: list[float] = []
        self._values: list[float] = []
        self._log_probs: list[float] = []
        self._dones: list[bool] = []
        self._advantages: Optional[np.ndarray] = None
        self._returns: Optional[np.ndarray] = None

    def add(
        self,
        obs: dict,
        action: int,
        reward: float,
        value: float,
        log_prob: float,
        done: bool,
    ) -> None:
        if len(self._observations) >= self.capacity:
            raise RuntimeError("RolloutBuffer is full; call reset() before adding more")
        self._observations.append({k: v.copy() for k, v in obs.items()})
        self._actions.append(int(action))
        self._rewards.append(float(reward))
        self._values.append(float(value))
        self._log_probs.append(float(log_prob))
        self._dones.append(bool(done))
        self._advantages = None
        self._returns = None

    def compute_returns_and_advantages(self, last_value: float = 0.0) -> None:
        """Populate advantages and returns using GAE.

        Args:
            last_value: Value estimate V(s_{T+1}) for bootstrapping. Pass 0
                if the trajectory ended in a terminal state.
        """
        T = len(self._rewards)
        rewards = np.asarray(self._rewards, dtype=np.float32)
        values = np.asarray(self._values, dtype=np.float32)
        dones = np.asarray(self._dones, dtype=np.float32)

        advantages = np.zeros(T, dtype=np.float32)
        gae = 0.0
        for t in reversed(range(T)):
            non_terminal = 1.0 - dones[t]
            next_value = last_value if t == T - 1 else values[t + 1]
            delta = rewards[t] + self.gamma * next_value * non_terminal - values[t]
            gae = delta + self.gamma * self.gae_lambda * non_terminal * gae
            advantages[t] = gae

        self._advantages = advantages
        self._returns = advantages + values

    def get(self, normalize_advantages: bool = True) -> Dict[str, np.ndarray]:
        if self._advantages is None or self._returns is None:
            raise RuntimeError(
                "Call compute_returns_and_advantages() before get()"
            )

        obs_keys = list(self._observations[0].keys())
        batch: Dict[str, np.ndarray] = {}
        for key in obs_keys:
            batch[key] = np.stack([o[key] for o in self._observations])

        batch["actions"] = np.asarray(self._actions, dtype=np.int64)
        batch["rewards"] = np.asarray(self._rewards, dtype=np.float32)
        batch["dones"] = np.asarray(self._dones, dtype=np.float32)
        batch["old_log_probs"] = np.asarray(self._log_probs, dtype=np.float32)
        batch["values"] = np.asarray(self._values, dtype=np.float32)

        adv = self._advantages
        if normalize_advantages and len(adv) > 1:
            adv = (adv - adv.mean()) / (adv.std() + 1e-8)
        batch["advantages"] = adv.astype(np.float32)
        batch["returns"] = self._returns.astype(np.float32)
        return batch

    def reset(self) -> None:
        self._observations.clear()
        self._actions.clear()
        self._rewards.clear()
        self._values.clear()
        self._log_probs.clear()
        self._dones.clear()
        self._advantages = None
        self._returns = None

    def __len__(self) -> int:
        return len(self._observations)
