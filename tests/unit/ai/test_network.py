"""Tests for PolicyValueNetwork."""
import numpy as np
import torch
from hearthstone.ai.network import PolicyValueNetwork, SCALAR_KEYS


def _make_dummy_obs(batch_size=1, slot_dim=90):
    obs = {
        "player_hand": torch.zeros(batch_size, 10, slot_dim),
        "player_board": torch.zeros(batch_size, 7, slot_dim),
        "opponent_board": torch.zeros(batch_size, 7, slot_dim),
        "just_drawn_card": torch.zeros(batch_size, slot_dim),
    }
    for k in SCALAR_KEYS:
        obs[k] = torch.zeros(batch_size, 1)
    return obs


class TestPolicyValueNetwork:
    def test_forward_returns_three_tuple_with_correct_shapes(self):
        net = PolicyValueNetwork(slot_dim=90, hidden_dim=128, num_actions=512)
        obs = _make_dummy_obs(batch_size=4)
        logits, value, aux = net(obs)
        assert logits.shape == (4, 512)
        assert value.shape == (4, 1)
        assert aux.shape == (4, 1)

    def test_forward_handles_batch_size_one(self):
        net = PolicyValueNetwork()
        obs = _make_dummy_obs(batch_size=1)
        logits, value, aux = net(obs)
        assert logits.shape == (1, 512)
        assert value.shape == (1, 1)
        assert aux.shape == (1, 1)

    def test_forward_handles_batch_size_three_with_explicit_dims(self):
        net = PolicyValueNetwork(slot_dim=90, hidden_dim=64, num_actions=128)
        obs = _make_dummy_obs(batch_size=3, slot_dim=90)
        logits, value, aux = net(obs)
        assert logits.shape == (3, 128)
        assert value.shape == (3, 1)
        assert aux.shape == (3, 1)

    def test_gradients_flow(self):
        net = PolicyValueNetwork(slot_dim=90, num_actions=512)
        obs = _make_dummy_obs(4)
        logits, value, aux = net(obs)
        loss = logits.sum() + value.sum() + aux.sum()
        loss.backward()
        for name, param in net.named_parameters():
            assert param.grad is not None, f"{name} has no gradient"

    def test_variable_batch_sizes(self):
        net = PolicyValueNetwork(slot_dim=90, num_actions=512)
        for bs in [1, 2, 16, 32]:
            obs = _make_dummy_obs(bs)
            logits, value, aux = net(obs)
            assert logits.shape == (bs, 512)
            assert value.shape == (bs, 1)
            assert aux.shape == (bs, 1)

    def test_train_eval_modes(self):
        net = PolicyValueNetwork(slot_dim=90, num_actions=512)
        obs = _make_dummy_obs(2)
        net.train()
        net(obs)
        net.eval()
        with torch.no_grad():
            net(obs)

    def test_uses_all_twenty_one_scalar_features(self):
        """All 21 scalar features must influence the output."""
        net = PolicyValueNetwork(slot_dim=90, num_actions=512)
        net.eval()

        for key in SCALAR_KEYS:
            obs_a = _make_dummy_obs(1)
            obs_b = _make_dummy_obs(1)
            obs_b[key] = obs_b[key] + 5.0
            with torch.no_grad():
                _, v_a, _ = net(obs_a)
                _, v_b, _ = net(obs_b)
            assert not torch.allclose(v_a, v_b), \
                f"Network output is invariant to {key} — feature is not wired in"

    def test_aux_head_gradient_propagates(self):
        """Backprop on aux output flows gradient into BOTH shared body
        params AND aux_head's own params."""
        net = PolicyValueNetwork()
        obs = _make_dummy_obs(batch_size=2)
        _, _, aux = net(obs)
        loss = aux.pow(2).mean()
        loss.backward()
        # Shared body sees gradient (verifies aux_head is connected to body).
        assert net.shared[0].weight.grad is not None
        assert torch.any(net.shared[0].weight.grad != 0)
        # aux_head's own weights also see gradient (verifies aux_head is
        # not accidentally detached, e.g., wrapped in .detach()).
        assert net.aux_head[0].weight.grad is not None
        assert torch.any(net.aux_head[0].weight.grad != 0)
