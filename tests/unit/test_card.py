"""Tests for Card model."""
import pytest
from hearthstone.models.card import Card, Minion, Spell, Weapon
from hearthstone.models.enums import CardType, Ability, HeroClass


def test_card_creation():
    """Test basic card creation."""
    card = Card(
        id="TEST_001",
        name="Test Card",
        cost=3,
        card_type=CardType.SPELL,
        description="A test card"
    )
    assert card.id == "TEST_001"
    assert card.name == "Test Card"
    assert card.cost == 3
    assert card.card_type == CardType.SPELL


def test_minion_creation():
    """Test minion card creation."""
    minion = Minion(
        id="TEST_002",
        name="Test Minion",
        cost=2,
        attack=3,
        health=2,
        abilities={Ability.CHARGE}
    )
    assert minion.id == "TEST_002"
    assert minion.attack == 3
    assert minion.health == 2
    assert Ability.CHARGE in minion.abilities


def test_minion_default_abilities():
    """Test minion has empty abilities set by default."""
    minion = Minion(
        id="TEST_003",
        name="Simple Minion",
        cost=1,
        attack=1,
        health=1
    )
    assert len(minion.abilities) == 0


def test_card_string_representation():
    """Test card string representation."""
    card = Card(
        id="TEST_001",
        name="Fireball",
        cost=4,
        card_type=CardType.SPELL
    )
    assert str(card) == "Fireball (4)"


def test_card_with_hero_class():
    """Test card creation with HeroClass enum."""
    card = Card(
        id="TEST_004",
        name="Mage Card",
        cost=3,
        card_type=CardType.SPELL,
        hero_class=HeroClass.MAGE
    )
    assert card.hero_class == HeroClass.MAGE


# Spell tests
def test_spell_creation():
    """Test spell card creation."""
    spell = Spell(
        id="SPELL_001",
        name="Fireball",
        cost=4,
        description="Deal 6 damage"
    )
    assert spell.id == "SPELL_001"
    assert spell.name == "Fireball"
    assert spell.cost == 4
    assert spell.card_type == CardType.SPELL
    assert spell.description == "Deal 6 damage"


def test_spell_with_hero_class():
    """Test spell card with hero class."""
    spell = Spell(
        id="SPELL_002",
        name="Arcane Intellect",
        cost=3,
        hero_class=HeroClass.MAGE,
        description="Draw 2 cards"
    )
    assert spell.hero_class == HeroClass.MAGE


# Weapon tests
def test_weapon_creation():
    """Test weapon card creation."""
    weapon = Weapon(
        id="WEAPON_001",
        name="Arcite Reaper",
        cost=5,
        attack=5,
        durability=2
    )
    assert weapon.id == "WEAPON_001"
    assert weapon.name == "Arcite Reaper"
    assert weapon.cost == 5
    assert weapon.card_type == CardType.WEAPON
    assert weapon.attack == 5
    assert weapon.durability == 2


def test_weapon_default_values():
    """Test weapon default attack and durability."""
    weapon = Weapon(
        id="WEAPON_002",
        name="Basic Weapon",
        cost=1
    )
    assert weapon.attack == 0
    assert weapon.durability == 0


def test_weapon_with_hero_class():
    """Test weapon card with hero class."""
    weapon = Weapon(
        id="WEAPON_003",
        name="Warrior Axe",
        cost=2,
        attack=2,
        durability=2,
        hero_class=HeroClass.WARRIOR
    )
    assert weapon.hero_class == HeroClass.WARRIOR


# Minion.take_damage() tests
def test_minion_take_damage():
    """Test minion taking damage."""
    minion = Minion(
        id="MINION_001",
        name="Damaged Minion",
        cost=2,
        attack=2,
        health=5
    )
    damage_taken = minion.take_damage(3)
    assert damage_taken == 3
    assert minion.health == 2


def test_minion_take_fatal_damage():
    """Test minion taking fatal damage."""
    minion = Minion(
        id="MINION_002",
        name="Weak Minion",
        cost=1,
        attack=1,
        health=2
    )
    damage_taken = minion.take_damage(5)
    assert damage_taken == 2  # Can only take as much damage as health
    assert minion.health == 0


def test_minion_take_exact_damage():
    """Test minion taking exact damage to reach 0 health."""
    minion = Minion(
        id="MINION_003",
        name="Exact Minion",
        cost=1,
        attack=1,
        health=3
    )
    damage_taken = minion.take_damage(3)
    assert damage_taken == 3
    assert minion.health == 0


def test_minion_take_zero_damage():
    """Test minion taking zero damage."""
    minion = Minion(
        id="MINION_004",
        name="Zero Damage Minion",
        cost=1,
        attack=1,
        health=3
    )
    damage_taken = minion.take_damage(0)
    assert damage_taken == 0
    assert minion.health == 3


# Minion.is_dead() tests
def test_minion_is_dead_when_health_zero():
    """Test minion is dead when health reaches 0."""
    minion = Minion(
        id="MINION_005",
        name="Dead Minion",
        cost=1,
        attack=1,
        health=0
    )
    assert minion.is_dead() is True


def test_minion_is_dead_when_health_negative():
    """Test minion is dead when health is negative."""
    minion = Minion(
        id="MINION_006",
        name="Very Dead Minion",
        cost=1,
        attack=1,
        health=-2
    )
    assert minion.is_dead() is True


def test_minion_is_not_dead_when_health_positive():
    """Test minion is not dead when health is positive."""
    minion = Minion(
        id="MINION_007",
        name="Alive Minion",
        cost=1,
        attack=1,
        health=1
    )
    assert minion.is_dead() is False


# Minion.reset_attacks() tests
def test_minion_reset_attacks():
    """Test minion reset attacks for new turn."""
    minion = Minion(
        id="MINION_008",
        name="Reset Minion",
        cost=2,
        attack=2,
        health=2
    )
    minion.can_attack = True
    minion.attacks_this_turn = 2
    minion.reset_attacks()
    assert minion.attacks_this_turn == 0
    assert minion.can_attack is True


def test_minion_reset_attacks_when_frozen():
    """Test frozen minion reset_attacks behavior.

    Note: The current implementation does NOT set can_attack to False for frozen minions.
    It only skips setting can_attack to True. This test documents the current behavior.
    """
    minion = Minion(
        id="MINION_009",
        name="Frozen Minion",
        cost=2,
        attack=2,
        health=2,
        abilities={Ability.FROZEN}
    )
    # __post_init__ sets can_attack based on CHARGE, which this minion doesn't have
    assert minion.can_attack is False
    minion.attacks_this_turn = 1
    minion.reset_attacks()
    assert minion.attacks_this_turn == 0
    # can_attack should remain False (not explicitly set to True because frozen)
    assert minion.can_attack is False


def test_minion_reset_attacks_non_frozen():
    """Test non-frozen minion can attack after reset."""
    minion = Minion(
        id="MINION_010",
        name="Normal Minion",
        cost=2,
        attack=2,
        health=2,
        abilities={Ability.TAUNT}
    )
    minion.can_attack = False
    minion.attacks_this_turn = 1
    minion.reset_attacks()
    assert minion.attacks_this_turn == 0
    assert minion.can_attack is True


# Edge case tests for max_health inference
def test_minion_max_health_inferred_from_health():
    """Test max_health is inferred from health when not specified."""
    minion = Minion(
        id="MINION_011",
        name="Inferred Health Minion",
        cost=2,
        attack=2,
        health=5
    )
    assert minion.max_health == 5


def test_minion_max_health_explicitly_set():
    """Test max_health when explicitly set."""
    minion = Minion(
        id="MINION_012",
        name="Explicit Health Minion",
        cost=2,
        attack=2,
        health=3,
        max_health=10
    )
    assert minion.max_health == 10


def test_minion_max_health_zero_health_zero():
    """Test max_health remains 0 when health is also 0."""
    minion = Minion(
        id="MINION_013",
        name="Zero Health Minion",
        cost=0,
        attack=0,
        health=0
    )
    assert minion.max_health == 0
