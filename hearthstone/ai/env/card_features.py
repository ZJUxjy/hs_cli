"""CardFeatureEncoder — encodes fireplace cards into fixed-length feature vectors.

The static portion (80 dims) is computed once per card at startup by walking
the fireplace DSL trees (play / events / update / deathrattle). The dynamic
portion (10 dims) is rebuilt every observation for board minions.

All features are clipped to [0.0, 1.0]. See spec section "CardFeatureEncoder".
"""
from __future__ import annotations

import logging
from collections import defaultdict
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


CARD_FEAT_DIM = 80
MINION_STATE_DIM = 10
SLOT_DIM = CARD_FEAT_DIM + MINION_STATE_DIM   # 90


_FEATURE_CACHE: dict[str, np.ndarray] = {}
_ZERO_STATIC = np.zeros(CARD_FEAT_DIM, dtype=np.float32)
_ZERO_STATE = np.zeros(MINION_STATE_DIM, dtype=np.float32)


def _clip_norm(x: float, max_val: float) -> float:
    """Clip x to [0, max_val] and normalize to [0, 1]."""
    if max_val <= 0:
        return 0.0
    return float(min(max(x, 0.0), max_val)) / float(max_val)
