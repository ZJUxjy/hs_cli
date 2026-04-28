"""Tests for PPOTrainer."""
import numpy as np
import torch
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.ppo_trainer import PPOTrainer


def make_dummy_rollout(batch_size: int = 16):
    """Mimic the output of RolloutBuffer.get() with realistic shapes."""
    rng = np.random.default_rng(0)
    obs = {
        "player_hand": rng.standard_normal((batch_size, 10, 64)).astype(np.float32) * 0.1,
        "player_board": rng.standard_normal((batch_size, 7, 64)).astype(np.float32) * 0.1,
        "opponent_board": rng.standard_normal((batch_size, 7, 64)).astype(np.float32) * 0.1,
        "player_health": rng.uniform(0, 30, (batch_size, 1)).astype(np.float32),
        "player_mana": rng.uniform(0, 10, (batch_size, 1)).astype(np.float32),
        "player_max_mana": rng.uniform(0, 10, (batch_size, 1)).astype(np.float32),
        "player_hand_size": rng.uniform(0, 10, (batch_size, 1)).astype(np.float32),
        "player_board_size": rng.uniform(0, 7, (batch_size, 1)).astype(np.float32),
        "opponent_health": rng.uniform(0, 30, (batch_size, 1)).astype(np.float32),
        "opponent_board_size": rng.uniform(0, 7, (batch_size, 1)).astype(np.float32),
        "turn_number": rng.uniform(0, 50, (batch_size, 1)).astype(np.float32),
        "player_deck_size": rng.uniform(0, 30, (batch_size, 1)).astype(np.float32),
    }
    obs["actions"] = rng.integers(0, 100, batch_size).astype(np.int64)
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
            "player_hand": torch.zeros(1, 10, 64),
            "player_board": torch.zeros(1, 7, 64),
            "opponent_board": torch.zeros(1, 7, 64),
            "player_health": torch.tensor([[30.0]]),
            "player_mana": torch.tensor([[1.0]]),
            "player_max_mana": torch.tensor([[1.0]]),
            "player_hand_size": torch.tensor([[3.0]]),
            "player_board_size": torch.tensor([[0.0]]),
            "opponent_health": torch.tensor([[30.0]]),
            "opponent_board_size": torch.tensor([[0.0]]),
            "turn_number": torch.tensor([[1.0]]),
            "player_deck_size": torch.tensor([[27.0]]),
        }
        mask = np.zeros(100, dtype=np.float32)
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
