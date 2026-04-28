"""Tests for PolicyValueNetwork."""
import torch
from hearthstone.ai.network import PolicyValueNetwork


def make_batch_obs(batch_size: int = 4):
    return {
        "player_hand": torch.zeros(batch_size, 10, 64),
        "player_board": torch.zeros(batch_size, 7, 64),
        "opponent_board": torch.zeros(batch_size, 7, 64),
        "player_health": torch.full((batch_size, 1), 30.0),
        "player_mana": torch.full((batch_size, 1), 5.0),
        "player_max_mana": torch.full((batch_size, 1), 5.0),
        "player_hand_size": torch.full((batch_size, 1), 3.0),
        "player_board_size": torch.full((batch_size, 1), 2.0),
        "opponent_health": torch.full((batch_size, 1), 30.0),
        "opponent_board_size": torch.full((batch_size, 1), 1.0),
        "turn_number": torch.full((batch_size, 1), 5.0),
        "player_deck_size": torch.full((batch_size, 1), 22.0),
    }


class TestPolicyValueNetwork:
    def test_forward_shapes(self):
        net = PolicyValueNetwork(embedding_dim=64, num_actions=100)
        obs = make_batch_obs(4)
        logits, value = net(obs)
        assert logits.shape == (4, 100)
        assert value.shape == (4, 1)

    def test_gradients_flow(self):
        net = PolicyValueNetwork(embedding_dim=64, num_actions=100)
        obs = make_batch_obs(4)
        logits, value = net(obs)
        loss = logits.sum() + value.sum()
        loss.backward()
        for name, param in net.named_parameters():
            assert param.grad is not None, f"{name} has no gradient"

    def test_variable_batch_sizes(self):
        net = PolicyValueNetwork(embedding_dim=64, num_actions=100)
        for bs in [1, 2, 16, 32]:
            obs = make_batch_obs(bs)
            logits, value = net(obs)
            assert logits.shape == (bs, 100)
            assert value.shape == (bs, 1)

    def test_train_eval_modes(self):
        net = PolicyValueNetwork(embedding_dim=64, num_actions=100)
        obs = make_batch_obs(2)
        net.train()
        net(obs)
        net.eval()
        with torch.no_grad():
            net(obs)

    def test_uses_all_nine_scalar_features(self):
        """All 9 scalar features must influence the output."""
        net = PolicyValueNetwork(embedding_dim=64, num_actions=100)
        net.eval()

        scalar_keys = [
            "player_health", "player_mana", "player_max_mana",
            "player_hand_size", "player_board_size",
            "opponent_health", "opponent_board_size",
            "turn_number", "player_deck_size",
        ]
        for key in scalar_keys:
            obs_a = make_batch_obs(1)
            obs_b = make_batch_obs(1)
            obs_b[key] = obs_b[key] + 5.0
            with torch.no_grad():
                _, v_a = net(obs_a)
                _, v_b = net(obs_b)
            assert not torch.allclose(v_a, v_b), \
                f"Network output is invariant to {key} — feature is not wired in"
