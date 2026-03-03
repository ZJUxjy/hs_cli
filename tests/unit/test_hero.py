"""Tests for Hero model."""
import pytest
from hearthstone.models.hero import Hero
from hearthstone.models.enums import HeroClass


def test_hero_creation():
    """Test hero creation."""
    hero = Hero(hero_class=HeroClass.MAGE, health=30)
    assert hero.hero_class == HeroClass.MAGE
    assert hero.health == 30
    assert hero.max_health == 30
    assert hero.armor == 0


def test_hero_take_damage():
    """Test hero taking damage."""
    hero = Hero(hero_class=HeroClass.WARRIOR, health=30)
    damage = hero.take_damage(5)
    assert damage == 5
    assert hero.health == 25


def test_hero_armor_absorbs_damage():
    """Test armor absorbs damage before health."""
    hero = Hero(hero_class=HeroClass.WARRIOR, health=30, armor=3)
    damage = hero.take_damage(5)
    assert damage == 5
    assert hero.armor == 0
    assert hero.health == 28


def test_hero_is_dead():
    """Test hero death check."""
    hero = Hero(hero_class=HeroClass.MAGE, health=30)
    assert not hero.is_dead()
    hero.take_damage(30)
    assert hero.is_dead()


def test_hero_add_armor():
    """Test adding armor to hero."""
    hero = Hero(hero_class=HeroClass.WARRIOR, health=30)
    assert hero.armor == 0
    result = hero.add_armor(5)
    assert hero.armor == 5
    assert result == 5  # Check return value

    # Add more armor
    result = hero.add_armor(3)
    assert hero.armor == 8
    assert result == 8


def test_hero_str():
    """Test hero string representation."""
    hero = Hero(hero_class=HeroClass.MAGE, health=30)
    assert str(hero) == "MAGE Hero (30/30)"

    hero.health = 25
    assert str(hero) == "MAGE Hero (25/30)"


def test_hero_take_damage_return_value():
    """Test that take_damage returns correct damage dealt."""
    hero = Hero(hero_class=HeroClass.WARRIOR, health=30)

    # Simple damage case
    damage = hero.take_damage(10)
    assert damage == 10
    assert hero.health == 20

    # Damage exceeds health
    damage = hero.take_damage(30)
    assert damage == 20  # Only 20 health remaining
    assert hero.health == 0

    # Damage to dead hero
    damage = hero.take_damage(5)
    assert damage == 0  # No health to damage


def test_hero_take_damage_with_armor():
    """Test armor properly absorbs damage and correct value returned."""
    hero = Hero(hero_class=HeroClass.WARRIOR, health=30, armor=5)

    # Armor absorbs all damage
    damage = hero.take_damage(3)
    assert damage == 3
    assert hero.armor == 2
    assert hero.health == 30

    # Armor absorbs part, health takes rest
    damage = hero.take_damage(5)
    assert damage == 5
    assert hero.armor == 0
    assert hero.health == 27


def test_hero_post_init_edge_cases():
    """Test Hero.__post_init__ handles edge cases correctly."""
    # Case 1: health < 30, max_health defaults to health
    hero = Hero(hero_class=HeroClass.MAGE, health=25)
    assert hero.max_health == 25

    # Case 2: max_health < 30, health should be capped at max_health
    hero2 = Hero(hero_class=HeroClass.MAGE, max_health=20)
    assert hero2.health == 20
    assert hero2.max_health == 20

    # Case 3: both explicitly set and different
    hero3 = Hero(hero_class=HeroClass.MAGE, health=25, max_health=35)
    assert hero3.health == 25
    assert hero3.max_health == 35
