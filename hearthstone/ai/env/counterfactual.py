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


def sample_counterfactual_baseline(
    obs: dict, info: dict, network, device: str,
    K: int = 4, rng: Optional[random.Random] = None,
) -> tuple[float, int]:
    """Sample up to K alternative cards from info['deck_remaining_ids']
    and compute the mean V over the synthesized hypothetical post-draw obs.

    Returns (baseline, n_sampled). n_sampled = min(K, len(deck_remaining)).
    Returns (0.0, 0) if no alternatives are available (deck empty / no
    draw event recorded).

    The network forward is BATCHED into a single call of shape (n_sampled, ...)
    — do not Python-loop K calls.
    """
    rng = rng or random.Random()
    deck_alt = info.get("deck_remaining_ids") or []
    slot_idx = info.get("draw_slot_idx")
    if not deck_alt or slot_idx is None:
        return 0.0, 0

    sampled_ids = rng.sample(deck_alt, min(K, len(deck_alt)))
    synth_obs_list = [
        synthesize_obs(obs, slot_idx, alt_id) for alt_id in sampled_ids
    ]
    keys = list(synth_obs_list[0].keys())
    batched = {
        k: torch.from_numpy(np.stack([o[k] for o in synth_obs_list])).to(device)
        for k in keys
    }
    with torch.no_grad():
        # network returns (logits, values, aux) — see PR-2 (Task 2.3) for the
        # 3-tuple forward; until then this function has no production callers.
        _, values, _ = network(batched)
    return float(values.mean().item()), len(sampled_ids)
