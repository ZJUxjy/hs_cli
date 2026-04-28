"""End-to-end smoke test: env -> rollout buffer -> PPO update."""
import numpy as np
import torch
from hearthstone.ai.gym_env import HearthstoneEnv
from hearthstone.ai.network import PolicyValueNetwork
from hearthstone.ai.ppo_trainer import PPOTrainer
from hearthstone.ai.rollout_buffer import RolloutBuffer


def test_full_training_loop_smoke():
    env = HearthstoneEnv(deck1_name="test_deck", deck2_name="test_deck")
    net = PolicyValueNetwork()
    trainer = PPOTrainer(net, ppo_epochs=2)
    buffer = RolloutBuffer(capacity=64, gamma=0.99, gae_lambda=0.95)

    obs, _ = env.reset()
    last_value = 0.0
    for _ in range(40):
        valid_n = len(env.controller.get_valid_actions())
        if valid_n == 0:
            break
        mask = np.zeros(100, dtype=np.float32)
        mask[:min(valid_n, 100)] = 1.0

        torch_obs = {k: torch.from_numpy(v).unsqueeze(0) for k, v in obs.items()}
        action, log_prob, value = trainer.select_action(torch_obs, mask)

        next_obs, reward, terminated, _, _ = env.step(action)
        buffer.add(obs, action, reward, value, log_prob, terminated)

        obs = next_obs
        if terminated:
            obs, _ = env.reset()
            last_value = 0.0
        else:
            last_value = value

    env.close()

    buffer.compute_returns_and_advantages(last_value=last_value)
    batch = buffer.get()
    losses = trainer.update(batch)

    assert not np.isnan(losses["total_loss"]), "Pipeline produced NaN loss"
    assert "policy_loss" in losses
