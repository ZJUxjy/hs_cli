"""Tests for CardDisplay CLI component."""
import pytest
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from hearthstone.models.card import Minion, Spell, Weapon
from hearthstone.models.enums import CardType, Ability, HeroClass
from cli.display.card_display import CardDisplay


class TestCardDisplay:
    """Test suite for CardDisplay class."""

    def test_card_display_class_exists(self):
        """Test that CardDisplay class can be instantiated."""
        display = CardDisplay()
        assert display is not None

    def test_render_minion_basic(self):
        """Test basic minion rendering."""
        minion = Minion(
            id="TEST_001",
            name="Test Minion",
            cost=3,
            attack=2,
            health=5
        )
        result = CardDisplay.render_minion(minion)
        assert result is not None
        assert isinstance(result, Panel)

    def test_render_minion_with_abilities(self):
        """Test minion rendering with abilities."""
        minion = Minion(
            id="TEST_002",
            name="Charger",
            cost=2,
            attack=3,
            health=1,
            abilities={Ability.CHARGE, Ability.TAUNT}
        )
        result = CardDisplay.render_minion(minion)
        assert result is not None
        # Verify it renders without error
        console = Console()
        console.print(result)

    def test_render_minion_with_description(self):
        """Test minion rendering with description."""
        minion = Minion(
            id="TEST_003",
            name="Descriptive Minion",
            cost=4,
            attack=3,
            health=3,
            description="Battlecry: Deal 2 damage"
        )
        result = CardDisplay.render_minion(minion)
        assert result is not None

    def test_render_spell_basic(self):
        """Test basic spell rendering."""
        spell = Spell(
            id="SPELL_001",
            name="Fireball",
            cost=4,
            description="Deal 6 damage"
        )
        result = CardDisplay.render_spell(spell)
        assert result is not None
        assert isinstance(result, Panel)

    def test_render_spell_with_hero_class(self):
        """Test spell rendering with hero class."""
        spell = Spell(
            id="SPELL_002",
            name="Arcane Intellect",
            cost=3,
            hero_class=HeroClass.MAGE,
            description="Draw 2 cards"
        )
        result = CardDisplay.render_spell(spell)
        assert result is not None

    def test_render_weapon_basic(self):
        """Test basic weapon rendering."""
        weapon = Weapon(
            id="WEAPON_001",
            name="Arcite Reaper",
            cost=5,
            attack=5,
            durability=2
        )
        result = CardDisplay.render_weapon(weapon)
        assert result is not None
        assert isinstance(result, Panel)

    def test_render_weapon_with_description(self):
        """Test weapon rendering with description."""
        weapon = Weapon(
            id="WEAPON_002",
            name="Battle Axe",
            cost=3,
            attack=3,
            durability=2,
            description="Deal 1 damage on equip"
        )
        result = CardDisplay.render_weapon(weapon)
        assert result is not None

    def test_render_minion_board_empty(self):
        """Test rendering empty board."""
        result = CardDisplay.render_minion_board([])
        assert result is not None
        assert isinstance(result, Table)

    def test_render_minion_board_single_minion(self):
        """Test rendering board with single minion."""
        minion = Minion(
            id="TEST_004",
            name="Lone Minion",
            cost=2,
            attack=2,
            health=2
        )
        result = CardDisplay.render_minion_board([minion])
        assert result is not None
        assert isinstance(result, Table)

    def test_render_minion_board_multiple_minions(self):
        """Test rendering board with multiple minions."""
        minions = [
            Minion(id="TEST_005", name="Minion 1", cost=1, attack=1, health=1),
            Minion(id="TEST_006", name="Minion 2", cost=2, attack=2, health=2),
            Minion(id="TEST_007", name="Minion 3", cost=3, attack=3, health=3),
        ]
        result = CardDisplay.render_minion_board(minions)
        assert result is not None
        assert isinstance(result, Table)

    def test_render_minion_board_max_minions(self):
        """Test rendering board with maximum minions (7)."""
        minions = [
            Minion(id=f"TEST_{i:03d}", name=f"Minion {i}", cost=i, attack=i, health=i)
            for i in range(1, 8)
        ]
        result = CardDisplay.render_minion_board(minions)
        assert result is not None
        assert isinstance(result, Table)

    def test_render_minion_with_hero_class(self):
        """Test minion rendering with hero class."""
        minion = Minion(
            id="TEST_008",
            name="Class Minion",
            cost=3,
            attack=2,
            health=4,
            hero_class=HeroClass.WARRIOR
        )
        result = CardDisplay.render_minion(minion)
        assert result is not None

    def test_render_minion_damaged(self):
        """Test rendering damaged minion."""
        minion = Minion(
            id="TEST_009",
            name="Damaged",
            cost=2,
            attack=3,
            health=2,
            max_health=5
        )
        result = CardDisplay.render_minion(minion)
        assert result is not None

    def test_render_methods_are_static(self):
        """Test that all render methods are static."""
        assert isinstance(CardDisplay.__dict__['render_minion'], staticmethod)
        assert isinstance(CardDisplay.__dict__['render_spell'], staticmethod)
        assert isinstance(CardDisplay.__dict__['render_weapon'], staticmethod)
        assert isinstance(CardDisplay.__dict__['render_minion_board'], staticmethod)

    def test_render_all_card_types(self):
        """Test rendering all different card types."""
        cards = [
            Minion(id="M001", name="Minion", cost=1, attack=1, health=1),
            Spell(id="S001", name="Spell", cost=1, description="Test"),
            Weapon(id="W001", name="Weapon", cost=1, attack=1, durability=1),
        ]

        results = [
            CardDisplay.render_minion(cards[0]),
            CardDisplay.render_spell(cards[1]),
            CardDisplay.render_weapon(cards[2]),
        ]

        for result in results:
            assert result is not None
            assert isinstance(result, Panel)
