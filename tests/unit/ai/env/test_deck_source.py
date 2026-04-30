import pytest


def test_load_deck_returns_card_ids_and_hero():
    from hearthstone.ai.env.deck_source import load_deck
    cards, hero = load_deck("basic_mage")
    assert isinstance(cards, list)
    assert len(cards) == 30
    assert hero == "HERO_08"


def test_load_deck_validates_card_id_exists():
    from hearthstone.ai.env.deck_source import load_deck
    with pytest.raises(ValueError, match="bogus_card_id"):
        load_deck("__synth_bad")


@pytest.fixture(autouse=True)
def _write_bad_deck(tmp_path, monkeypatch):
    """Write a deck with an invalid card id under a temp DECK_DIR for the bad-id test."""
    bad = tmp_path / "__synth_bad.yaml"
    bad.write_text(
        "name: Bad\nhero_id: HERO_08\ncards:\n" + "\n".join(["  - bogus_card_id"] * 30)
    )
    from hearthstone.ai.env import deck_source
    monkeypatch.setattr(deck_source, "DECK_DIRS", [str(tmp_path), deck_source.DEFAULT_DECK_DIR])
