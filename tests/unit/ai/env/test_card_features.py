"""Tests for CardFeatureEncoder."""
import numpy as np
import pytest


@pytest.fixture(scope="module", autouse=True)
def _init_cards_db():
    from fireplace import cards
    cards.db.initialize()


def test_basic_minion_features():
    """Chillwind Yeti (CS2_182) — cost 4, 4/5 vanilla minion."""
    from hearthstone.ai.env.card_features import (
        CARD_FEAT_DIM, build_card_feature_cache, _FEATURE_CACHE,
    )
    if not _FEATURE_CACHE:
        build_card_feature_cache()
    feat = _FEATURE_CACHE["CS2_182"]
    assert feat.shape == (CARD_FEAT_DIM,)
    # cost=4 / 10 = 0.4
    assert feat[0] == pytest.approx(0.4)
    # atk=4 / 20 = 0.2
    assert feat[1] == pytest.approx(0.2)
    # hp=5 / 20 = 0.25
    assert feat[2] == pytest.approx(0.25)
    # type=MINION -> one-hot at index 4
    assert feat[4] == 1.0
    # all features in [0, 1]
    assert (feat >= 0.0).all() and (feat <= 1.0).all()
