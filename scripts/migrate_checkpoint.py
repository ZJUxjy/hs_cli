"""S2-A → S2-B checkpoint migration.

The S2-B network adds a `just_drawn_card` slot to flat_dim
(grows by hidden_dim columns in shared.0.weight) and an aux_head
sibling of value_head. This script:
  1. Loads an old checkpoint.
  2. Constructs a fresh S2-B network state_dict.
  3. Copies all unchanged params from old → new.
  4. Pads shared.0.weight with a zero block at the just_drawn_card
     position (between boards and scalars in the concat order).
  5. Leaves aux_head random-initialized.
  6. Injects the 4 new aux config defaults if missing.

Usage:
    python scripts/migrate_checkpoint.py --in old.pt --out new.pt
"""
from __future__ import annotations

import argparse
import sys

import torch

from hearthstone.ai.network import PolicyValueNetwork


_AUX_DEFAULTS = {
    "aux_loss_coef": 0.5,
    "aux_warmup_iters": 100,
    "aux_counterfactual_k": 4,
    "draw_advantage_threshold": 0.15,
}


def migrate(in_path: str, out_path: str) -> None:
    """Load S2-A checkpoint at `in_path`, write S2-B-compatible checkpoint
    at `out_path`. Pads shared.0.weight with a zero column block at the
    just_drawn_card position; leaves aux_head random-initialized; injects
    the 4 new aux config defaults if missing.
    """
    ckpt = torch.load(in_path, map_location="cpu", weights_only=False)
    cfg = ckpt.get("config", {})
    slot_dim = int(cfg.get("slot_dim", 90))
    hidden_dim = int(cfg.get("hidden_dim", 128))
    num_actions = int(cfg.get("num_actions", 512))

    new_net = PolicyValueNetwork(
        slot_dim=slot_dim, hidden_dim=hidden_dim, num_actions=num_actions,
    )
    new_sd = new_net.state_dict()
    old_sd = ckpt["network"]

    for k, new_v in new_sd.items():
        if k.startswith("aux_head."):
            continue   # leave random-init
        if k == "shared.0.weight":
            old_w = old_sd[k]   # (h*2, OLD_FLAT_DIM)
            expected_old_cols = (10 + 2 * 7) * hidden_dim + 21
            assert old_w.shape[1] == expected_old_cols, (
                f"shared.0.weight has {old_w.shape[1]} columns; expected "
                f"{expected_old_cols} for an S2-A checkpoint with "
                f"hidden_dim={hidden_dim}. Already migrated, corrupted, "
                f"or wrong hidden_dim."
            )
            zeros = torch.zeros(
                old_w.shape[0], hidden_dim, dtype=old_w.dtype,
            )
            # New column block lands BETWEEN boards and scalars in the
            # concat order: [hand, p_board, o_board, drawn, scalars].
            split = (10 + 2 * 7) * hidden_dim
            new_v.data = torch.cat([
                old_w[:, :split], zeros, old_w[:, split:],
            ], dim=1)
            continue
        if k in old_sd and old_sd[k].shape == new_v.shape:
            new_v.data = old_sd[k].clone()

    ckpt["network"] = new_sd

    # Drop optimizer state. Adam keys its `state` by parameter id; after the
    # network shape change, loading the old optimizer state would fail on
    # shared.0.weight (or worse, alias state to the wrong tensor). Resume
    # after migration starts with a fresh optimizer; the first few iters
    # will rebuild momentum.
    ckpt["optimizer"] = {}

    # Inject S2-B aux defaults if absent.
    cfg = dict(ckpt.get("config", {}))
    for key, default_val in _AUX_DEFAULTS.items():
        cfg.setdefault(key, default_val)
    ckpt["config"] = cfg

    torch.save(ckpt, out_path)
    print(
        f"migrated {in_path} → {out_path} (S2-A → S2-B network shape; "
        f"optimizer state dropped — resume will start with fresh Adam)"
    )


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Migrate S2-A checkpoint to S2-B shape.")
    p.add_argument("--in", dest="in_path", required=True)
    p.add_argument("--out", dest="out_path", required=True)
    args = p.parse_args(argv)
    migrate(args.in_path, args.out_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
