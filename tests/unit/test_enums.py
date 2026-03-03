"""Tests for core enum types."""
import pytest
from hearthstone.models.enums import CardType, GamePhase, Ability


def test_card_type_values():
    """Test CardType enum has expected values."""
    assert CardType.MINION == "MINION"
    assert CardType.SPELL == "SPELL"
    assert CardType.WEAPON == "WEAPON"
    assert CardType.HERO == "HERO"


def test_game_phase_values():
    """Test GamePhase enum has expected values."""
    assert GamePhase.MULLIGAN == "MULLIGAN"
    assert GamePhase.MAIN == "MAIN"
    assert GamePhase.END == "END"


def test_ability_values():
    """Test Ability enum has expected values."""
    assert Ability.CHARGE == "CHARGE"
    assert Ability.TAUNT == "TAUNT"
    assert Ability.DIVINE_SHIELD == "DIVINE_SHIELD"
    assert Ability.WINDFURY == "WINDFURY"
    assert Ability.STEALTH == "STEALTH"
    assert Ability.FROZEN == "FROZEN"
    assert Ability.POISONOUS == "POISONOUS"
    assert Ability.LIFESTEAL == "LIFESTEAL"
    assert Ability.RUSH == "RUSH"
    assert Ability.REBORN == "REBORN"
    assert Ability.SPELL_DAMAGE == "SPELL_DAMAGE"
