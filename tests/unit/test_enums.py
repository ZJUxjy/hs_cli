"""Tests for core enum types."""
import pytest
from hearthstone.models.enums import CardType, GamePhase, Ability, HeroClass


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


def test_ability_enum_has_battlecry():
    """Test that BATTLECRY ability exists."""
    from hearthstone.models.enums import Ability
    assert Ability.BATTLECRY == "BATTLECRY"


def test_ability_enum_has_deathrattle():
    """Test that DEATHRATTLE ability exists."""
    from hearthstone.models.enums import Ability
    assert Ability.DEATHRATTLE == "DEATHRATTLE"


def test_ability_enum_has_stealth():
    """Test that STEALTH ability exists."""
    from hearthstone.models.enums import Ability
    assert Ability.STEALTH == "STEALTH"


def test_ability_enum_has_rush():
    """Test that RUSH ability exists."""
    from hearthstone.models.enums import Ability
    assert Ability.RUSH == "RUSH"


def test_hero_class_values():
    """Test HeroClass enum has expected values."""
    assert HeroClass.WARRIOR == "WARRIOR"
    assert HeroClass.SHAMAN == "SHAMAN"
    assert HeroClass.ROGUE == "ROGUE"
    assert HeroClass.PALADIN == "PALADIN"
    assert HeroClass.HUNTER == "HUNTER"
    assert HeroClass.DRUID == "DRUID"
    assert HeroClass.WARLOCK == "WARLOCK"
    assert HeroClass.MAGE == "MAGE"
    assert HeroClass.PRIEST == "PRIEST"
    assert HeroClass.DEMON_HUNTER == "DEMON_HUNTER"
    assert HeroClass.NEUTRAL == "NEUTRAL"
