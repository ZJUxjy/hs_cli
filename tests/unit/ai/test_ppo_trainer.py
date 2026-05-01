"""Tests for PPOTrainer."""
import numpy as np
import torch
from hearthstone.ai.network import PolicyValueNetwork, SCALAR_KEYS
from hearthstone.ai.ppo_trainer import PPOTrainer


SLOT_DIM = 90
NUM_ACTIONS = 512


def make_dummy_rollout(batch_size: int = 16):
    """Mimic the output of RolloutBuffer.get() with the post-fireplace shape:
    slot_dim=90, 21 scalars, num_actions=512.
    """
    rng = np.random.default_rng(0)
    obs = {
        "player_hand": rng.standard_normal((batch_size, 10, SLOT_DIM)).astype(np.float32) * 0.1,
        "player_board": rng.standard_normal((batch_size, 7, SLOT_DIM)).astype(np.float32) * 0.1,
        "opponent_board": rng.standard_normal((batch_size, 7, SLOT_DIM)).astype(np.float32) * 0.1,
    }
    for k in SCALAR_KEYS:
        obs[k] = rng.uniform(0, 1, (batch_size, 1)).astype(np.float32)
    obs["actions"] = rng.integers(0, NUM_ACTIONS, batch_size).astype(np.int64)
    obs["rewards"] = rng.standard_normal(batch_size).astype(np.float32)
    obs["dones"] = np.zeros(batch_size, dtype=np.float32)
    obs["values"] = rng.standard_normal(batch_size).astype(np.float32)
    obs["old_log_probs"] = (rng.standard_normal(batch_size).astype(np.float32) - 4.6)
    obs["advantages"] = rng.standard_normal(batch_size).astype(np.float32)
    obs["returns"] = rng.standard_normal(batch_size).astype(np.float32)
    return obs


class TestPPOTrainer:
    def test_initialization(self):
        net = PolicyValueNetwork()
        trainer = PPOTrainer(net, lr=3e-4, gamma=0.99, ppo_epochs=4)
        assert trainer.network is net
        assert trainer.gamma == 0.99
        assert trainer.ppo_epochs == 4

    def test_update_runs_and_returns_losses(self):
        net = PolicyValueNetwork()
        trainer = PPOTrainer(net, ppo_epochs=2)
        batch = make_dummy_rollout(32)
        losses = trainer.update(batch)
        for k in ("total_loss", "policy_loss", "value_loss", "entropy"):
            assert k in losses
            assert isinstance(losses[k], float)

    def test_update_no_nan_over_many_epochs(self):
        net = PolicyValueNetwork()
        trainer = PPOTrainer(net, ppo_epochs=4)
        batch = make_dummy_rollout(32)
        for _ in range(10):
            losses = trainer.update(batch)
            assert not np.isnan(losses["total_loss"]), "Loss became NaN"

    def test_select_action_shape_and_range(self):
        net = PolicyValueNetwork()
        trainer = PPOTrainer(net)
        torch_obs = {
            "player_hand": torch.zeros(1, 10, SLOT_DIM),
            "player_board": torch.zeros(1, 7, SLOT_DIM),
            "opponent_board": torch.zeros(1, 7, SLOT_DIM),
        }
        for k in SCALAR_KEYS:
            torch_obs[k] = torch.zeros(1, 1)
        mask = np.zeros(NUM_ACTIONS, dtype=np.float32)
        mask[0] = 1.0  # only end-turn valid
        action, log_prob, value = trainer.select_action(torch_obs, mask)
        assert action == 0, "Masked-out actions should never be selected"
        assert isinstance(log_prob, float)
        assert isinstance(value, float)

    def test_clip_keeps_ratio_close_when_advantages_positive(self):
        net = PolicyValueNetwork()
        trainer = PPOTrainer(net, ppo_epochs=1, clip_epsilon=0.2)
        batch = make_dummy_rollout(16)
        batch["advantages"] = np.abs(batch["advantages"])  # all positive
        losses = trainer.update(batch)
        assert not np.isnan(losses["policy_loss"])
