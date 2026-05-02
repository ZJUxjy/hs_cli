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
