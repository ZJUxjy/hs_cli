import numpy as np
import pytest
import torch


@pytest.fixture
def env_ready():
    from hearthstone.ai.env.fireplace_env import FireplaceGymEnv
    from hearthstone.ai.env.deck_source import load_deck
    deck_a = load_deck("aggro_mage")
    deck_b = load_deck("control_warrior")
    c1, h1 = list(deck_a.card_ids), deck_a.hero_id
    c2, h2 = list(deck_b.card_ids), deck_b.hero_id
    env = FireplaceGymEnv(c1, c2, h1, h2, seed=42)
    env.reset()
    return env


def test_random_opponent_returns_valid_index(env_ready):
    from hearthstone.ai.env.opponents import RandomOpponent
    opp = RandomOpponent()
    for _ in range(20):
        idx = opp.act(env_ready)
        assert 0 <= idx < len(env_ready.current_valid_actions)


def test_random_opponent_with_no_valid_actions_returns_zero():
    from hearthstone.ai.env.opponents import RandomOpponent

    class FakeEnv:
        current_valid_actions = []

    assert RandomOpponent().act(FakeEnv()) == 0


def test_self_play_opponent_loads_state_dict_round_trip(tmp_path):
    from hearthstone.ai.network import PolicyValueNetwork
    from hearthstone.ai.env.opponents import SelfPlayOpponent

    net1 = PolicyValueNetwork(slot_dim=90, hidden_dim=128, num_actions=512)
    ckpt = tmp_path / "model.pt"
    torch.save({"network": net1.state_dict()}, ckpt)
    opp = SelfPlayOpponent(network_path=str(ckpt), slot_dim=90, num_actions=512)
    for k, v in net1.state_dict().items():
        assert torch.allclose(v, opp.network.state_dict()[k])


def test_self_play_opponent_greedy_respects_mask(env_ready):
    from hearthstone.ai.env.opponents import SelfPlayOpponent
    from hearthstone.ai.network import PolicyValueNetwork

    opp = SelfPlayOpponent(network_path=None, slot_dim=90, num_actions=512)
    opp.network = PolicyValueNetwork(slot_dim=90, hidden_dim=128, num_actions=512)
    opp.network.eval()
    idx = opp.act(env_ready)
    assert 0 <= idx < len(env_ready.current_valid_actions)
