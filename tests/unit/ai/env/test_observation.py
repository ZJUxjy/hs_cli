import numpy as np
import pytest


@pytest.fixture
def env_started():
    """A started Game with two players using loaded decks."""
    from fireplace import cards
    cards.db.initialize()
    from fireplace.game import Game
    from fireplace.player import Player
    from fireplace.utils import random_draft

    deck1 = random_draft(card_class=cards.db["HERO_08"].card_class)
    deck2 = random_draft(card_class=cards.db["HERO_01"].card_class)
    p1 = Player("p1", deck1, hero="HERO_08")
    p2 = Player("p2", deck2, hero="HERO_01")
    game = Game(players=[p1, p2], seed=42)
    game.start()
    for p in (p1, p2):
        if p.choice is not None:
            p.choice.choose()
    return game, p1, p2


def test_observation_keys_match_expected(env_started):
    from hearthstone.ai.env.observation import build_observation_for, OBS_KEYS
    game, p1, _ = env_started
    obs = build_observation_for(game, p1)
    assert set(obs.keys()) == set(OBS_KEYS)


def test_observation_card_tensor_shapes(env_started):
    from hearthstone.ai.env.observation import build_observation_for
    from hearthstone.ai.env.card_features import SLOT_DIM
    game, p1, _ = env_started
    obs = build_observation_for(game, p1)
    assert obs["player_hand"].shape == (10, SLOT_DIM)
    assert obs["player_board"].shape == (7, SLOT_DIM)
    assert obs["opponent_board"].shape == (7, SLOT_DIM)


def test_observation_perspective_swap_changes_hand(env_started):
    from hearthstone.ai.env.observation import build_observation_for
    game, p1, p2 = env_started
    o1 = build_observation_for(game, p1)
    o2 = build_observation_for(game, p2)
    assert not np.array_equal(o1["player_hand"], o2["player_hand"])


def test_observation_scalars_in_bounds(env_started):
    from hearthstone.ai.env.observation import (
        build_observation_for, SCALAR_BOUNDS,
    )
    game, p1, _ = env_started
    obs = build_observation_for(game, p1)
    for k, (lo, hi) in SCALAR_BOUNDS.items():
        v = float(obs[k][0])
        assert lo <= v <= hi, f"{k}={v} outside [{lo}, {hi}]"


def test_observation_card_features_in_unit_range(env_started):
    from hearthstone.ai.env.observation import build_observation_for
    game, p1, _ = env_started
    obs = build_observation_for(game, p1)
    for k in ("player_hand", "player_board", "opponent_board", "just_drawn_card"):
        v = obs[k]
        assert (v >= 0).all()
        assert (v <= 1).all()


def test_obs_keys_include_just_drawn_card():
    from hearthstone.ai.env.observation import OBS_KEYS
    assert "just_drawn_card" in OBS_KEYS


def test_observation_space_has_just_drawn_card():
    from hearthstone.ai.env.observation import make_observation_space
    from hearthstone.ai.env.card_features import SLOT_DIM
    space = make_observation_space()
    assert "just_drawn_card" in space.spaces
    box = space.spaces["just_drawn_card"]
    assert box.shape == (SLOT_DIM,)
    assert box.dtype.name == "float32"


def test_build_observation_for_just_drawn_card_zero_when_kwarg_absent():
    """When latest_drawn_card_obj=None, the slot is all-zeros."""
    import numpy as np
    from fireplace import cards as fp_cards
    from fireplace.game import Game
    from fireplace.player import Player
    from hearthstone.ai.env.observation import build_observation_for
    from hearthstone.ai.env.card_features import SLOT_DIM

    fp_cards.db.initialize()
    deck = ["CS2_023"] * 30
    p1 = Player("p1", deck, "HERO_08")
    p2 = Player("p2", deck, "HERO_08")
    g = Game(players=[p1, p2], seed=42)
    g.start()
    obs = build_observation_for(g, p1)  # no kwarg
    assert obs["just_drawn_card"].shape == (SLOT_DIM,)
    assert np.all(obs["just_drawn_card"] == 0.0)


def test_build_observation_for_just_drawn_card_filled_when_kwarg_passed():
    """When latest_drawn_card_obj is a fireplace card, slot encodes it."""
    import numpy as np
    from fireplace import cards as fp_cards
    from fireplace.game import Game
    from fireplace.player import Player
    from hearthstone.ai.env.observation import build_observation_for
    from hearthstone.ai.env.card_features import (
        encode_hand_card_by_id, SLOT_DIM,
    )

    fp_cards.db.initialize()
    deck = ["CS2_023"] * 30
    p1 = Player("p1", deck, "HERO_08")
    p2 = Player("p2", deck, "HERO_08")
    g = Game(players=[p1, p2], seed=42)
    g.start()
    drawn = p1.hand[0]
    obs = build_observation_for(g, p1, latest_drawn_card_obj=drawn)
    expected = encode_hand_card_by_id(drawn.id)
    assert np.array_equal(obs["just_drawn_card"], expected)
