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


def test_frostbolt_fingerprint():
    """CS2_024 Frostbolt -- Hit(TARGET, 3), SetTags(TARGET, FROZEN).
    Expect: n_hit_ops=1/5, total_hit_damage=3/15, FREEZE mechanic flag set.
    """
    from hearthstone.ai.env.card_features import (
        _FEATURE_CACHE, _OFF_FINGERPRINT, _OFF_MECHANIC,
        _MECHANIC_VOCAB, build_card_feature_cache,
    )
    if not _FEATURE_CACHE:
        build_card_feature_cache()
    feat = _FEATURE_CACHE["CS2_024"]
    # n_hit_ops = 1, normalized by 5
    assert feat[_OFF_FINGERPRINT + 0] == pytest.approx(0.2)
    # total_hit_damage = 3, normalized by 15
    assert feat[_OFF_FINGERPRINT + 1] == pytest.approx(0.2)
    # FREEZE mechanic
    assert feat[_OFF_MECHANIC + _MECHANIC_VOCAB.index("FREEZE")] == 1.0


def test_arcane_explosion_aoe_flag():
    """CS2_025 Arcane Explosion -- Hit(ENEMY_MINIONS, 1). Expect aoe_flag=1."""
    from hearthstone.ai.env.card_features import (
        _FEATURE_CACHE, _OFF_FINGERPRINT, build_card_feature_cache,
    )
    if not _FEATURE_CACHE:
        build_card_feature_cache()
    feat = _FEATURE_CACHE["CS2_025"]
    # aoe_or_random_flag at fingerprint+11
    assert feat[_OFF_FINGERPRINT + 11] == 1.0


def test_arcane_intellect_draw_count():
    """CS2_023 Arcane Intellect -- Draw(CONTROLLER) * 2.
    Expect: n_draw>=1/5, total_draw_count=2/5.
    """
    from hearthstone.ai.env.card_features import (
        _FEATURE_CACHE, _OFF_FINGERPRINT, build_card_feature_cache,
    )
    if not _FEATURE_CACHE:
        build_card_feature_cache()
    feat = _FEATURE_CACHE["CS2_023"]
    # n_draw_ops at fingerprint+5 >= 1/5
    assert float(feat[_OFF_FINGERPRINT + 5]) >= 0.2
    # total_draw_count at fingerprint+6 = 2/5
    assert feat[_OFF_FINGERPRINT + 6] == pytest.approx(0.4)


def test_unknown_op_silently_skipped():
    """Synthetic action class not in the dispatcher must not crash _walk."""
    from hearthstone.ai.env.card_features import _walk, _get_fp_actions
    fp_actions = _get_fp_actions()
    counters = {}
    class Mystery:
        pass
    _walk(Mystery(), counters, fp_actions)
    # No exception. The counter dict has 'unknown' incremented.
    assert counters.get("unknown", 0) == 1
