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
