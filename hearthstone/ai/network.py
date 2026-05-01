"""Shared-body Policy and Value network."""
from __future__ import annotations

import torch
import torch.nn as nn


SCALAR_KEYS = (
    "player_health", "player_armor", "player_mana", "player_max_mana",
    "player_overload", "player_hand_size", "player_board_size",
    "player_deck_size", "player_secrets_count",
    "opponent_health", "opponent_armor", "opponent_hand_size",
    "opponent_board_size", "opponent_deck_size", "opponent_secrets_count",
    "weapon_atk_player", "weapon_dur_player",
    "weapon_atk_opponent", "weapon_dur_opponent",
    "turn_number", "is_my_turn",
)


class CardEncoder(nn.Module):
    """Encodes (B, N, embedding_dim) -> (B, N, hidden_dim)."""

    def __init__(self, embedding_dim: int = 64, hidden_dim: int = 128):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(embedding_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )

    def forward(self, x):
        return self.fc(x)


class PolicyValueNetwork(nn.Module):
    """Shared body with policy head (logits) and value head (scalar)."""

    def __init__(
        self,
        slot_dim: int = 90,
        hidden_dim: int = 128,
        num_actions: int = 512,
        embedding_dim: int | None = None,
    ):
        super().__init__()
        if embedding_dim is not None:
            slot_dim = embedding_dim
        self.card_encoder = CardEncoder(slot_dim, hidden_dim)
        self.num_scalars = len(SCALAR_KEYS)  # 21

        # hand (10*hidden) + 2 boards (2*7*hidden) + 21 scalars
        flat_dim = 10 * hidden_dim + 2 * 7 * hidden_dim + self.num_scalars

        self.shared = nn.Sequential(
            nn.Linear(flat_dim, hidden_dim * 2),
            nn.ReLU(),
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
        )
        self.policy_head = nn.Linear(hidden_dim, num_actions)
        self.value_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
        )

    def forward(self, obs: dict):
        batch_size = obs["player_health"].shape[0]

        hand_enc = self.card_encoder(obs["player_hand"])
        p_board_enc = self.card_encoder(obs["player_board"])
        o_board_enc = self.card_encoder(obs["opponent_board"])

        hand_flat = hand_enc.reshape(batch_size, -1)
        p_board_flat = p_board_enc.reshape(batch_size, -1)
        o_board_flat = o_board_enc.reshape(batch_size, -1)

        scalars = torch.cat([obs[k] for k in SCALAR_KEYS], dim=-1)  # (B, 21)

        flat = torch.cat([hand_flat, p_board_flat, o_board_flat, scalars], dim=-1)
        h = self.shared(flat)
        return self.policy_head(h), self.value_head(h)
