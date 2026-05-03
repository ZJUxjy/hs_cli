"""Counterfactual obs synthesis for the draw-quality auxiliary head.

We compute the counterfactual draw advantage of the actually-drawn card X
by synthesizing K hypothetical post-draw observations where the agent
drew X' instead of X, forwarding V on each, and using the actual V minus
the K-mean as the regression target for `aux_head`.
"""
from __future__ import annotations

import random
from typing import Optional

import numpy as np
import torch

from .card_features import encode_hand_card_by_id


def synthesize_obs(obs: dict, draw_slot_idx: int, alt_card_id: str) -> dict:
    """Return a deep-copy of `obs` with two slots replaced by the encoding
    of `alt_card_id`:
      - player_hand[draw_slot_idx]
      - just_drawn_card

    Other obs fields are np.copy()'d unchanged. Asserts the slot index is
    a valid hand position.
    """
    enc = encode_hand_card_by_id(alt_card_id)
    out = {k: v.copy() for k, v in obs.items()}
    assert 0 <= draw_slot_idx < out["player_hand"].shape[0], (
        f"draw_slot_idx={draw_slot_idx} out of range "
        f"[0, {out['player_hand'].shape[0]})"
    )
    out["player_hand"][draw_slot_idx] = enc
    out["just_drawn_card"] = enc
    return out
