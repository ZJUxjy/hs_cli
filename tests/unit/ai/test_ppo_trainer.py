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
        "just_drawn_card": rng.standard_normal((batch_size, SLOT_DIM)).astype(np.float32) * 0.1,
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
            "just_drawn_card": torch.zeros(1, SLOT_DIM),
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


def _make_dummy_batch_with_aux(n=4, slot_dim=90, num_actions=512, with_aux=False):
    """Minimal batch matching trainer.update's expectations, including
    just_drawn_card and aux fields. Used by Task 3.3 aux-loss tests."""
    import numpy as np
    from hearthstone.ai.network import SCALAR_KEYS
    obs = {
        "player_hand": np.zeros((n, 10, slot_dim), dtype=np.float32),
        "player_board": np.zeros((n, 7, slot_dim), dtype=np.float32),
        "opponent_board": np.zeros((n, 7, slot_dim), dtype=np.float32),
        "just_drawn_card": np.zeros((n, slot_dim), dtype=np.float32),
    }
    for k in SCALAR_KEYS:
        obs[k] = np.zeros((n, 1), dtype=np.float32)
    batch = dict(obs)
    batch["actions"] = np.zeros(n, dtype=np.int64)
    batch["rewards"] = np.zeros(n, dtype=np.float32)
    batch["dones"] = np.zeros(n, dtype=np.float32)
    batch["values"] = np.zeros(n, dtype=np.float32)
    batch["old_log_probs"] = np.zeros(n, dtype=np.float32)
    batch["advantages"] = np.zeros(n, dtype=np.float32)
    batch["returns"] = np.zeros(n, dtype=np.float32)
    if with_aux:
        batch["aux_target"] = np.array([0.5] * n, dtype=np.float32)
        batch["aux_mask"] = np.array([True] * n, dtype=bool)
    else:
        batch["aux_target"] = np.zeros(n, dtype=np.float32)
        batch["aux_mask"] = np.zeros(n, dtype=bool)
    return batch


def test_trainer_update_returns_aux_loss_key():
    """trainer.update() returns 'aux_loss' and 'aux_n_samples' in losses dict."""
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.ppo_trainer import PPOTrainer
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1)
    batch = _make_dummy_batch_with_aux(with_aux=False)
    losses = trainer.update(batch, current_iter=999)
    assert "aux_loss" in losses
    assert "aux_n_samples" in losses


def test_trainer_aux_loss_zero_when_no_mask():
    """All-False aux_mask → aux_loss == 0.0."""
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.ppo_trainer import PPOTrainer
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1, aux_warmup_iters=0)
    batch = _make_dummy_batch_with_aux(with_aux=False)
    losses = trainer.update(batch, current_iter=999)
    assert losses["aux_loss"] == 0.0


def test_trainer_aux_loss_nonzero_when_mask_true():
    """All-True aux_mask + nonzero target → aux_loss > 0 (post-warmup)."""
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.ppo_trainer import PPOTrainer
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1, aux_warmup_iters=0,
                         aux_loss_coef=0.5)
    batch = _make_dummy_batch_with_aux(with_aux=True)
    losses = trainer.update(batch, current_iter=999)
    assert losses["aux_loss"] > 0.0
    assert losses["aux_n_samples"] == 4.0


def test_trainer_warmup_zeros_aux_coef():
    """During warmup: aux_head weights don't move (aux loss has zero coef),
    AND shared trunk DOES move (policy/value losses still flow through it).
    Documents the intentional gradient routing: aux is gated, the rest
    trains normally."""
    import torch
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.ppo_trainer import PPOTrainer
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1, aux_warmup_iters=100,
                         aux_loss_coef=0.5)
    batch = _make_dummy_batch_with_aux(with_aux=True)
    # Make rewards/advantages nonzero so policy_loss + value_loss have a
    # gradient signal to push through the shared trunk.
    batch["advantages"] = np.full(4, 0.5, dtype=np.float32)
    batch["returns"] = np.full(4, 0.5, dtype=np.float32)
    aux_w_before = net.aux_head[0].weight.clone()
    shared_w_before = net.shared[0].weight.clone()
    trainer.update(batch, current_iter=0)  # below warmup threshold
    aux_w_after = net.aux_head[0].weight.clone()
    shared_w_after = net.shared[0].weight.clone()
    assert torch.equal(aux_w_before, aux_w_after), (
        "aux_head weights changed during warmup — aux gradient leaked through"
    )
    assert not torch.equal(shared_w_before, shared_w_after), (
        "shared trunk did not change during warmup — policy/value gradient "
        "flow is broken (aux gating should not stop other losses)"
    )


def test_trainer_post_warmup_uses_full_coef():
    """After warmup, aux gradient updates aux_head."""
    import torch
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.ppo_trainer import PPOTrainer
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1, aux_warmup_iters=0,
                         aux_loss_coef=0.5)
    batch = _make_dummy_batch_with_aux(with_aux=True)
    aux_w_before = net.aux_head[0].weight.clone()
    trainer.update(batch, current_iter=0)
    aux_w_after = net.aux_head[0].weight.clone()
    assert not torch.equal(aux_w_before, aux_w_after), (
        "aux_head weights did not change post-warmup"
    )


def test_trainer_update_default_iter_is_zero():
    """update() can be called without current_iter (default=0); existing
    callers continue to work."""
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.ppo_trainer import PPOTrainer
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=1, aux_warmup_iters=0)
    batch = _make_dummy_batch_with_aux(with_aux=False)
    losses = trainer.update(batch)
    assert "total_loss" in losses
