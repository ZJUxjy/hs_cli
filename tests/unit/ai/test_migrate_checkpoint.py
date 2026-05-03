"""Tests for scripts/migrate_checkpoint.py — S2-A → S2-B network shape migration."""
import os
import sys

import pytest
import torch
import torch.nn as nn


# Ensure scripts/ is importable
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


class _S2APolicyValueNetwork(nn.Module):
    """Local re-creation of the S2-A network shape (24-slot flat_dim, 2-tuple
    forward), used to produce a checkpoint that the migrator must accept."""

    def __init__(self, slot_dim=90, hidden_dim=128, num_actions=512):
        super().__init__()
        # CardEncoder structurally same; only flat_dim shrinks.
        self.card_encoder = nn.Sequential(
            nn.Linear(slot_dim, hidden_dim), nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim), nn.ReLU(),
        )
        flat_dim = (10 + 2 * 7) * hidden_dim + 21
        self.shared = nn.Sequential(
            nn.Linear(flat_dim, hidden_dim * 2), nn.ReLU(),
            nn.Linear(hidden_dim * 2, hidden_dim), nn.ReLU(),
        )
        self.policy_head = nn.Linear(hidden_dim, num_actions)
        self.value_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2), nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),
        )


def _save_s2a_checkpoint(path, hidden_dim=128):
    """Helper: save a fake S2-A checkpoint at `path`."""
    s2a = _S2APolicyValueNetwork(hidden_dim=hidden_dim)
    torch.save({
        "iter": 100,
        "network": s2a.state_dict(),
        "optimizer": {},
        "config": {"slot_dim": 90, "hidden_dim": hidden_dim, "num_actions": 512},
        "best_winrate": 0.5,
        "phase": "RANDOM",
    }, path)
    return s2a


def test_migrate_round_trip_loads_under_new_network(tmp_path):
    """A migrated S2-A checkpoint loads cleanly into the S2-B network."""
    from scripts.migrate_checkpoint import migrate
    from hearthstone.ai.network import PolicyValueNetwork

    in_path = str(tmp_path / "s2a.pt")
    out_path = str(tmp_path / "s2b.pt")
    _save_s2a_checkpoint(in_path)

    migrate(in_path, out_path)
    ckpt = torch.load(out_path, map_location="cpu")
    new_net = PolicyValueNetwork(slot_dim=90, hidden_dim=128, num_actions=512)
    new_net.load_state_dict(ckpt["network"])  # must not raise


def test_migrate_pads_shared_with_zeros(tmp_path):
    """The new column block in shared.0.weight (size hidden_dim) is all zeros."""
    from scripts.migrate_checkpoint import migrate

    in_path = str(tmp_path / "s2a.pt")
    out_path = str(tmp_path / "s2b.pt")
    _save_s2a_checkpoint(in_path)

    migrate(in_path, out_path)
    ckpt = torch.load(out_path, map_location="cpu")
    w = ckpt["network"]["shared.0.weight"]   # (hidden_dim*2, NEW_FLAT_DIM)
    hidden_dim = 128
    split = (10 + 2 * 7) * hidden_dim   # 24*128 = 3072
    new_block = w[:, split:split + hidden_dim]
    assert torch.all(new_block == 0)


def test_migrate_preserves_old_param_values(tmp_path):
    """Existing non-shared.0 params come through unchanged."""
    from scripts.migrate_checkpoint import migrate

    in_path = str(tmp_path / "s2a.pt")
    out_path = str(tmp_path / "s2b.pt")
    s2a = _save_s2a_checkpoint(in_path)

    migrate(in_path, out_path)
    new = torch.load(out_path, map_location="cpu")["network"]
    old = s2a.state_dict()
    # policy_head and value_head shapes unchanged; values must match.
    assert torch.equal(new["policy_head.weight"], old["policy_head.weight"])
    assert torch.equal(new["value_head.0.weight"], old["value_head.0.weight"])
    # shared.0.bias is unchanged shape; values match.
    assert torch.equal(new["shared.0.bias"], old["shared.0.bias"])


def test_migrate_injects_aux_config_defaults(tmp_path):
    """The migrated checkpoint's config gains the 4 new aux fields if missing."""
    from scripts.migrate_checkpoint import migrate

    in_path = str(tmp_path / "s2a.pt")
    out_path = str(tmp_path / "s2b.pt")
    _save_s2a_checkpoint(in_path)

    migrate(in_path, out_path)
    ckpt = torch.load(out_path, map_location="cpu")
    cfg = ckpt["config"]
    assert cfg["aux_loss_coef"] == 0.5
    assert cfg["aux_warmup_iters"] == 100
    assert cfg["aux_counterfactual_k"] == 4
    assert cfg["draw_advantage_threshold"] == 0.15
