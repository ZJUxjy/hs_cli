"""Tests for deck_source: Deck dataclass + load_deck + archetype validation."""
import pytest


@pytest.fixture(scope="module", autouse=True)
def _init_cards_db():
    from fireplace import cards
    cards.db.initialize()


def test_deck_dataclass_fields():
    from hearthstone.ai.env.deck_source import Deck
    d = Deck(
        name="aggro_mage", archetype="aggro",
        hero_id="HERO_08", card_ids=("CS2_023",) * 30,
    )
    assert d.name == "aggro_mage"
    assert d.archetype == "aggro"
    assert d.hero_id == "HERO_08"
    assert len(d.card_ids) == 30


def test_load_deck_returns_deck_instance():
    from hearthstone.ai.env.deck_source import Deck, load_deck
    deck = load_deck("aggro_mage")
    assert isinstance(deck, Deck)
    assert deck.name == "aggro_mage"
    assert deck.archetype == "aggro"
    assert deck.hero_id == "HERO_08"
    assert len(deck.card_ids) == 30


def test_aggro_archetype_duplicate_violation_raises(tmp_path, monkeypatch):
    """Synth deck with 30 copies of one card violates duplicate limit."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    bad = tmp_path / "synth_bad_aggro.yaml"
    bad.write_text(yaml.safe_dump({
        "name": "Bad", "archetype": "aggro", "hero_id": "HERO_08",
        "cards": ["EX1_185"] * 30,           # 30 copies of one card
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    with pytest.raises(ValueError, match="appears 30 times"):
        ds.load_deck("synth_bad_aggro")


def test_control_archetype_duplicate_violation_raises(tmp_path, monkeypatch):
    """Same shape as above but archetype=control."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    bad = tmp_path / "synth_bad_control.yaml"
    bad.write_text(yaml.safe_dump({
        "name": "Bad", "archetype": "control", "hero_id": "HERO_08",
        "cards": ["CS2_124"] * 30,
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    with pytest.raises(ValueError, match="appears 30 times"):
        ds.load_deck("synth_bad_control")


def test_invalid_archetype_raises(tmp_path, monkeypatch):
    """archetype=midrange not in {aggro, control}."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    bad = tmp_path / "synth_bad_archetype.yaml"
    bad.write_text(yaml.safe_dump({
        "name": "Bad", "archetype": "midrange", "hero_id": "HERO_08",
        "cards": ["CS2_023"] * 30,
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    with pytest.raises(ValueError, match="archetype 'midrange'"):
        ds.load_deck("synth_bad_archetype")


def test_invalid_card_id_lists_missing(tmp_path, monkeypatch):
    """Bogus card_id is named in error message."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    bad = tmp_path / "synth_bad_id.yaml"
    cards_list = ["BOGUS_ID"] + ["CS2_023"] * 29
    bad.write_text(yaml.safe_dump({
        "name": "Bad", "archetype": "aggro", "hero_id": "HERO_08",
        "cards": cards_list,
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    with pytest.raises(ValueError, match="BOGUS_ID"):
        ds.load_deck("synth_bad_id")


def test_missing_required_key_raises(tmp_path, monkeypatch):
    """archetype key absent → clear error."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    bad = tmp_path / "synth_no_archetype.yaml"
    bad.write_text(yaml.safe_dump({
        "name": "Bad", "hero_id": "HERO_08",
        "cards": ["CS2_023"] * 30,
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    with pytest.raises(ValueError, match="archetype"):
        ds.load_deck("synth_no_archetype")


def test_legendary_duplicate_raises(tmp_path, monkeypatch):
    """A legendary appearing twice should fail (max 1)."""
    import yaml
    from hearthstone.ai.env import deck_source as ds
    # EX1_558 = Harrison Jones (legendary). 2 copies + 28 filler. Filler
    # is 14 distinct 1-mana cards × 2 each so the non-legendary dup check
    # passes; only the legendary dup check fires.
    fillers = [
        "CS2_023",  # Arcane Intellect (3)
        "CS2_024",  # Frostbolt (2)
        "CS2_025",  # Arcane Explosion (2)
        "CS2_120",  # River Crocolisk (2)
        "CS2_124",  # Wolfrider (3)
        "CS2_125",  # Ironfur Grizzly (3)
        "CS2_142",  # Kobold Geomancer (2)
        "CS2_168",  # Murloc Raider (1)
        "CS2_172",  # Bloodfen Raptor (2)
        "CS2_173",  # Bluegill Warrior (2)
        "CS2_182",  # Chillwind Yeti (4)
        "CS2_186",  # War Golem (7)
        "CS2_189",  # Elven Archer (1)
        "CS2_231",  # Wisp (0)
    ]
    bad = tmp_path / "synth_legendary_dup.yaml"
    bad.write_text(yaml.safe_dump({
        "name": "Bad", "archetype": "aggro", "hero_id": "HERO_08",
        "cards": ["EX1_558", "EX1_558"] + [c for c in fillers for _ in range(2)],
    }))
    monkeypatch.setattr(ds, "DECK_DIRS", [str(tmp_path)])
    with pytest.raises(ValueError, match="LEGENDARY"):
        ds.load_deck("synth_legendary_dup")


def test_load_decks_returns_list_in_order():
    from hearthstone.ai.env.deck_source import load_decks
    decks = load_decks(["aggro_mage", "control_warrior", "aggro_hunter"])
    assert [d.name for d in decks] == ["aggro_mage", "control_warrior", "aggro_hunter"]


def test_load_decks_propagates_failures_with_context():
    from hearthstone.ai.env.deck_source import load_decks
    with pytest.raises((FileNotFoundError, ValueError)):
        load_decks(["aggro_mage", "nonexistent_deck"])


def test_all_18_decks_load_successfully():
    """Regression: all 18 archetype YAMLs satisfy validation. Acceptance gate
    for PR-3 + PR-1."""
    from hearthstone.ai.env.deck_source import load_decks
    classes = ["mage", "warrior", "hunter", "druid", "rogue",
               "paladin", "priest", "shaman", "warlock"]
    names = [f"{a}_{c}" for c in classes for a in ("aggro", "control")]
    decks = load_decks(names)
    assert len(decks) == 18
    for deck in decks:
        assert deck.archetype in ("aggro", "control")
        assert len(deck.card_ids) == 30
