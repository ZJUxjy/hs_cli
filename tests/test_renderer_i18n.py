"""Tests for CLI renderer i18n support."""

import pytest

from hearthstone_cli.cli.renderer import TextRenderer
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
from hearthstone_cli.i18n import set_language


class TestRendererI18n:
    """Test cases for renderer i18n support."""

    @pytest.fixture(autouse=True)
    def reset_language(self):
        """Reset language to default after each test."""
        yield
        set_language("enUS")

    def _create_test_game(self, with_minion_attrs=None, exhausted=False):
        """Create a test game state."""
        hero = HeroState(health=30, armor=5)
        mana = ManaState(current=5, max_mana=10)

        # Create a card for hand
        card = Card(card_id="CS1_042", name="Goldshire Footman", cost=1, card_type="minion")

        # Create a minion with optional attributes
        attrs = frozenset(with_minion_attrs) if with_minion_attrs else frozenset()
        minion = Minion(
            card_id="CS1_042",
            attack=1,
            health=2,
            max_health=2,
            attributes=attrs,
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=exhausted,
        )

        player = PlayerState(
            hero=hero,
            mana=mana,
            deck=(),
            hand=(card,),
            board=(minion,) if with_minion_attrs is not None else (),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )

        opponent = PlayerState(
            hero=HeroState(health=25),
            mana=ManaState(current=3, max_mana=8),
            deck=(),
            hand=(card, card),
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

    def test_render_player_zhCN(self):
        """Test Chinese rendering contains '你' and '水晶'."""
        set_language("zhCN")
        game = self._create_test_game()
        output = TextRenderer.render(game)

        # Check for Chinese player labels
        assert "你" in output
        assert "对手" in output
        # Check for Chinese mana label
        assert "水晶" in output
        # Check for Chinese hand label
        assert "手牌:" in output

    def test_render_player_enUS(self):
        """Test English rendering contains 'You' and 'Mana'."""
        set_language("enUS")
        game = self._create_test_game()
        output = TextRenderer.render(game)

        # Check for English player labels
        assert "You" in output
        assert "Opponent" in output
        # Check for English mana label
        assert "Mana" in output
        # Check for English hand label
        assert "Hand:" in output

    def test_render_minion_attributes_zhCN(self):
        """Test minion attributes in Chinese (嘲讽, 圣盾)."""
        set_language("zhCN")
        game = self._create_test_game(
            with_minion_attrs=[Attribute.TAUNT, Attribute.DIVINE_SHIELD]
        )
        output = TextRenderer.render(game)

        # Check for Chinese attribute names
        assert "嘲讽" in output
        assert "圣盾" in output

    def test_render_minion_attributes_enUS(self):
        """Test minion attributes in English (Taunt, Divine Shield)."""
        set_language("enUS")
        game = self._create_test_game(
            with_minion_attrs=[Attribute.TAUNT, Attribute.DIVINE_SHIELD]
        )
        output = TextRenderer.render(game)

        # Check for English attribute names
        assert "Taunt" in output
        assert "Divine Shield" in output

    def test_render_all_attributes_zhCN(self):
        """Test all minion attributes in Chinese."""
        set_language("zhCN")
        game = self._create_test_game(
            with_minion_attrs=[
                Attribute.TAUNT,
                Attribute.DIVINE_SHIELD,
                Attribute.WINDFURY,
                Attribute.CHARGE,
                Attribute.STEALTH,
                Attribute.POISONOUS,
                Attribute.LIFESTEAL,
            ]
        )
        output = TextRenderer.render(game)

        # Check all Chinese attribute names
        assert "嘲讽" in output
        assert "圣盾" in output
        assert "风怒" in output
        assert "冲锋" in output
        assert "潜行" in output
        assert "剧毒" in output
        assert "吸血" in output

    def test_render_all_attributes_enUS(self):
        """Test all minion attributes in English."""
        set_language("enUS")
        game = self._create_test_game(
            with_minion_attrs=[
                Attribute.TAUNT,
                Attribute.DIVINE_SHIELD,
                Attribute.WINDFURY,
                Attribute.CHARGE,
                Attribute.STEALTH,
                Attribute.POISONOUS,
                Attribute.LIFESTEAL,
            ]
        )
        output = TextRenderer.render(game)

        # Check all English attribute names
        assert "Taunt" in output
        assert "Divine Shield" in output
        assert "Windfury" in output
        assert "Charge" in output
        assert "Stealth" in output
        assert "Poisonous" in output
        assert "Lifesteal" in output

    def test_render_exhausted_zhCN(self):
        """Test exhausted status in Chinese."""
        set_language("zhCN")
        game = self._create_test_game(
            with_minion_attrs=[Attribute.TAUNT],
            exhausted=True
        )
        output = TextRenderer.render(game)

        # Check for Chinese exhausted label
        assert "已攻击" in output

    def test_render_exhausted_enUS(self):
        """Test exhausted status in English."""
        set_language("enUS")
        game = self._create_test_game(
            with_minion_attrs=[Attribute.TAUNT],
            exhausted=True
        )
        output = TextRenderer.render(game)

        # Check for English exhausted label
        assert "Exhausted" in output

    def test_render_armor_zhCN(self):
        """Test armor display in Chinese."""
        set_language("zhCN")
        game = self._create_test_game()
        output = TextRenderer.render(game)

        # Check for Chinese armor label
        assert "护甲" in output

    def test_render_armor_enUS(self):
        """Test armor display in English."""
        set_language("enUS")
        game = self._create_test_game()
        output = TextRenderer.render(game)

        # Check for English armor label
        assert "Armor" in output

    def test_render_empty_board_zhCN(self):
        """Test empty board message in Chinese."""
        set_language("zhCN")
        game = GameState.create_new()
        output = TextRenderer.render(game)

        # Check for Chinese empty board message
        assert "场上: (空)" in output

    def test_render_empty_board_enUS(self):
        """Test empty board message in English."""
        set_language("enUS")
        game = GameState.create_new()
        output = TextRenderer.render(game)

        # Check for English empty board message
        assert "Board: (empty)" in output

    def test_render_board_label_zhCN(self):
        """Test board label in Chinese."""
        set_language("zhCN")
        game = self._create_test_game(with_minion_attrs=[Attribute.TAUNT])
        output = TextRenderer.render(game)

        # The output contains both opponent (empty board) and player (with minion)
        # Check for Chinese board label in the output
        assert "场上:" in output
        # The opponent has empty board, player has minion - both labels should appear
        lines = output.split("\n")
        board_lines = [line for line in lines if "场上" in line]
        # Should have both empty and non-empty board lines
        assert len(board_lines) >= 2

    def test_render_board_label_enUS(self):
        """Test board label in English."""
        set_language("enUS")
        game = self._create_test_game(with_minion_attrs=[Attribute.TAUNT])
        output = TextRenderer.render(game)

        # The output contains both opponent (empty board) and player (with minion)
        # Check for English board label in the output
        assert "Board:" in output
        # The opponent has empty board, player has minion - both labels should appear
        lines = output.split("\n")
        board_lines = [line for line in lines if "Board" in line]
        # Should have both empty and non-empty board lines
        assert len(board_lines) >= 2
