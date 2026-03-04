"""Tests for CLI UI i18n support."""

import pytest

from hearthstone_cli.cli.ui import CLIInterface
from hearthstone_cli.engine.state import (
    Attribute,
    Card,
    GameState,
    HeroState,
    ManaState,
    Minion,
    PlayerState,
    RandomState,
)
from hearthstone_cli.engine.actions import TargetReference, Zone
from hearthstone_cli.engine.actions import EndTurnAction, AttackAction, PlayCardAction
from hearthstone_cli.i18n import set_language


class TestUII18n:
    """Test cases for UI i18n support."""

    @pytest.fixture(autouse=True)
    def reset_language(self):
        """Reset language to default after each test."""
        yield
        set_language("enUS")

    def _create_test_game(self):
        """Create a test game state with various cards and minions."""
        hero = HeroState(health=30, armor=0)
        mana = ManaState(current=10, max_mana=10)

        # Create cards for hand
        minion_card = Card(
            card_id="CS1_042",
            name="Goldshire Footman",
            cost=1,
            card_type="MINION",
            attack=1,
            health=2,
        )
        spell_card = Card(
            card_id="CS2_024",
            name="Frostbolt",
            cost=2,
            card_type="SPELL",
        )
        weapon_card = Card(
            card_id="CS2_106",
            name="Fiery War Axe",
            cost=2,
            card_type="WEAPON",
            attack=3,
            durability=2,
        )

        # Create a minion on board
        minion = Minion(
            card_id="CS1_042",
            attack=1,
            health=2,
            max_health=2,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player = PlayerState(
            hero=hero,
            mana=mana,
            deck=(),
            hand=(minion_card, spell_card, weapon_card),
            board=(minion,),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )

        opponent = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )

        return GameState(
            turn=1,
            active_player=0,
            players=(player, opponent),
            action_history=(),
            rng_state=RandomState(seed=42),
            phase_stack=(),
        )

    def test_action_to_str_end_turn_zhCN(self):
        """Test End Turn action string in Chinese."""
        set_language("zhCN")
        game = self._create_test_game()
        ui = CLIInterface(game)

        action = EndTurnAction(player=0)
        result = ui._action_to_str(action)

        assert result == "结束回合"

    def test_action_to_str_end_turn_enUS(self):
        """Test End Turn action string in English."""
        set_language("enUS")
        game = self._create_test_game()
        ui = CLIInterface(game)

        action = EndTurnAction(player=0)
        result = ui._action_to_str(action)

        assert result == "End Turn"

    def test_action_to_str_attack_hero_to_hero_zhCN(self):
        """Test Attack action string (hero to enemy hero) in Chinese."""
        set_language("zhCN")
        game = self._create_test_game()
        ui = CLIInterface(game)

        attacker = TargetReference(zone=Zone.HERO, player=0, index=0)
        defender = TargetReference(zone=Zone.HERO, player=1, index=0)
        action = AttackAction(player=0, attacker=attacker, defender=defender)
        result = ui._action_to_str(action)

        assert "英雄" in result
        assert "敌方英雄" in result
        assert "攻击:" in result

    def test_action_to_str_attack_hero_to_hero_enUS(self):
        """Test Attack action string (hero to enemy hero) in English."""
        set_language("enUS")
        game = self._create_test_game()
        ui = CLIInterface(game)

        attacker = TargetReference(zone=Zone.HERO, player=0, index=0)
        defender = TargetReference(zone=Zone.HERO, player=1, index=0)
        action = AttackAction(player=0, attacker=attacker, defender=defender)
        result = ui._action_to_str(action)

        assert "Hero" in result
        assert "Enemy Hero" in result
        assert "Attack:" in result

    def test_action_to_str_attack_minion_to_hero_zhCN(self):
        """Test Attack action string (minion to hero) in Chinese."""
        set_language("zhCN")
        game = self._create_test_game()
        ui = CLIInterface(game)

        attacker = TargetReference(zone=Zone.BOARD, player=0, index=0)
        defender = TargetReference(zone=Zone.HERO, player=1, index=0)
        action = AttackAction(player=0, attacker=attacker, defender=defender)
        result = ui._action_to_str(action)

        assert "敌方英雄" in result
        assert "攻击:" in result

    def test_action_to_str_attack_minion_to_hero_enUS(self):
        """Test Attack action string (minion to hero) in English."""
        set_language("enUS")
        game = self._create_test_game()
        ui = CLIInterface(game)

        attacker = TargetReference(zone=Zone.BOARD, player=0, index=0)
        defender = TargetReference(zone=Zone.HERO, player=1, index=0)
        action = AttackAction(player=0, attacker=attacker, defender=defender)
        result = ui._action_to_str(action)

        assert "Enemy Hero" in result
        assert "Attack:" in result

    def test_action_to_str_play_minion_zhCN(self):
        """Test Play Card action string (minion) in Chinese."""
        set_language("zhCN")
        game = self._create_test_game()
        ui = CLIInterface(game)

        action = PlayCardAction(player=0, card_index=0, target=None)
        result = ui._action_to_str(action)

        assert "打出" in result
        assert "Goldshire Footman" in result
        assert "(1/2)" in result

    def test_action_to_str_play_minion_enUS(self):
        """Test Play Card action string (minion) in English."""
        set_language("enUS")
        game = self._create_test_game()
        ui = CLIInterface(game)

        action = PlayCardAction(player=0, card_index=0, target=None)
        result = ui._action_to_str(action)

        assert "Play" in result
        assert "Goldshire Footman" in result
        assert "(1/2)" in result

    def test_action_to_str_play_spell_zhCN(self):
        """Test Play Card action string (spell) in Chinese."""
        set_language("zhCN")
        game = self._create_test_game()
        ui = CLIInterface(game)

        action = PlayCardAction(player=0, card_index=1, target=None)
        result = ui._action_to_str(action)

        assert "打出" in result
        assert "Frostbolt" in result
        assert "(法术)" in result

    def test_action_to_str_play_spell_enUS(self):
        """Test Play Card action string (spell) in English."""
        set_language("enUS")
        game = self._create_test_game()
        ui = CLIInterface(game)

        action = PlayCardAction(player=0, card_index=1, target=None)
        result = ui._action_to_str(action)

        assert "Play" in result
        assert "Frostbolt" in result
        assert "(Spell)" in result

    def test_action_to_str_play_weapon_zhCN(self):
        """Test Play Card action string (weapon) in Chinese."""
        set_language("zhCN")
        game = self._create_test_game()
        ui = CLIInterface(game)

        action = PlayCardAction(player=0, card_index=2, target=None)
        result = ui._action_to_str(action)

        assert "打出" in result
        assert "Fiery War Axe" in result
        assert "(3/2)" in result

    def test_action_to_str_play_weapon_enUS(self):
        """Test Play Card action string (weapon) in English."""
        set_language("enUS")
        game = self._create_test_game()
        ui = CLIInterface(game)

        action = PlayCardAction(player=0, card_index=2, target=None)
        result = ui._action_to_str(action)

        assert "Play" in result
        assert "Fiery War Axe" in result
        assert "(3/2)" in result
