"""Tests for opponent policies."""
import pytest
from hearthstone.ai.opponents import OpponentPolicy, RandomOpponent
from hearthstone.ai.gym_env import HearthstoneEnv


def _fresh_env():
    return HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")


class TestRandomOpponent:
    def test_returns_index_within_valid_actions(self):
        opp = RandomOpponent(seed=42)
        env = _fresh_env()
        env.reset()
        # Random opponent should always return a valid index over many calls
        for _ in range(50):
            valid = env.controller.get_valid_actions()
            if not valid:
                continue
            action = opp.act(env.controller)
            assert 0 <= action < len(valid)
        env.close()

    def test_no_valid_actions_returns_zero(self):
        """When valid_actions is empty, fall back to 0 instead of crashing."""
        class EmptyController:
            def get_valid_actions(self):
                return []
        opp = RandomOpponent()
        assert opp.act(EmptyController()) == 0

    def test_seeded_is_deterministic(self):
        env1 = _fresh_env(); env1.reset()
        env2 = _fresh_env(); env2.reset()
        opp1 = RandomOpponent(seed=123)
        opp2 = RandomOpponent(seed=123)
        a1 = opp1.act(env1.controller)
        a2 = opp2.act(env2.controller)
        assert a1 == a2
        env1.close(); env2.close()


def test_opponent_policy_act_is_abstract():
    """OpponentPolicy.act() should raise NotImplementedError."""
    base = OpponentPolicy()
    with pytest.raises(NotImplementedError):
        base.act(None)


import numpy as np
import torch
from hearthstone.ai.opponents import SelfPlayOpponent
from hearthstone.ai.network import PolicyValueNetwork


def _save_random_network(tmp_path, embedding_dim=64, hidden_dim=128):
    net = PolicyValueNetwork(
        embedding_dim=embedding_dim, hidden_dim=hidden_dim, num_actions=100,
    )
    path = tmp_path / "ckpt.pt"
    torch.save({"network": net.state_dict()}, path)
    return path, net


class TestSelfPlayOpponent:
    def test_construct_without_path_creates_random_network(self):
        opp = SelfPlayOpponent(network_path=None)
        # Just verify the network exists and is in eval mode
        assert isinstance(opp.network, PolicyValueNetwork)
        assert not opp.network.training

    def test_load_from_round_trip(self, tmp_path):
        path, original = _save_random_network(tmp_path)
        opp = SelfPlayOpponent(network_path=str(path))
        # Verify weights match
        for (k1, v1), (k2, v2) in zip(
            original.state_dict().items(), opp.network.state_dict().items()
        ):
            assert k1 == k2
            assert torch.equal(v1, v2)

    def test_load_from_accepts_bare_state_dict(self, tmp_path):
        """Older checkpoints may save the state_dict directly without 'network' key."""
        net = PolicyValueNetwork()
        path = tmp_path / "bare.pt"
        torch.save(net.state_dict(), path)  # bare state_dict, no wrapping dict
        opp = SelfPlayOpponent(network_path=str(path))
        assert isinstance(opp.network, PolicyValueNetwork)

    def test_act_returns_valid_index(self, tmp_path):
        path, _ = _save_random_network(tmp_path)
        opp = SelfPlayOpponent(network_path=str(path))
        env = _fresh_env()
        env.reset()
        for _ in range(20):
            valid = env.controller.get_valid_actions()
            if not valid:
                break
            action = opp.act(env.controller)
            assert 0 <= action < len(valid), \
                f"got {action} but only {len(valid)} valid actions (mask must filter)"
            # Step forward so the test exercises various game states
            env.step(action if action < env.action_space.n else 0)
            if env.controller.is_game_over():
                break
        env.close()

    def test_act_uses_current_player_perspective(self, tmp_path, monkeypatch):
        """When current_player is P2, act() must pass P2 as perspective_player."""
        path, _ = _save_random_network(tmp_path)
        opp = SelfPlayOpponent(network_path=str(path))
        env = _fresh_env()
        env.reset()
        # Advance until current_player has flipped (or game ends).
        for _ in range(5):
            env.step(0)  # end turn
            if env.controller.is_game_over():
                pytest.skip("game ended before turn flipped")
            if env.controller.get_state().current_player.name != "Player 1":
                break
        else:
            pytest.skip("turn never flipped")

        captured = {}
        from hearthstone.ai import opponents as opp_module
        original = opp_module.build_observation
        def spy(state, perspective_player, **kw):
            captured["perspective"] = perspective_player
            return original(state, perspective_player=perspective_player, **kw)
        monkeypatch.setattr(opp_module, "build_observation", spy)

        opp.act(env.controller)

        state = env.controller.get_state()
        assert captured["perspective"] is state.current_player, \
            "act() must use the acting player (current_player), not state.player1"
        env.close()
