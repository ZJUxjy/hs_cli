"""i18n集成测试"""

import pytest
from hearthstone_cli.i18n import set_language, get_available_languages, _
from hearthstone_cli.cli.renderer import TextRenderer
from hearthstone_cli.cli.ui import CLIInterface
from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute, RandomState
)
from hearthstone_cli.engine.actions import EndTurnAction, AttackAction, PlayCardAction, TargetReference, Zone


class TestI18nIntegration:
    """i18n端到端集成测试"""

    @pytest.fixture(autouse=True)
    def reset_language(self):
        """每个测试前重置语言"""
        set_language("zhCN")
        yield
        # 测试结束后重置为英文
        set_language("enUS")

    def test_full_game_flow_zhCN(self):
        """测试中文完整游戏流程"""
        set_language("zhCN")

        # 创建简单游戏状态
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=RandomState(seed=42),
            phase_stack=tuple()
        )

        # 渲染并检查中文
        output = TextRenderer.render(game)
        assert "你" in output
        assert "对手" in output
        assert "水晶" in output

    def test_full_game_flow_enUS(self):
        """测试英文完整游戏流程"""
        set_language("enUS")

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=RandomState(seed=42),
            phase_stack=tuple()
        )

        output = TextRenderer.render(game)
        assert "You" in output
        assert "Opponent" in output
        assert "Mana" in output

    def test_attribute_names_in_both_languages(self):
        """测试属性名称在两种语言中正确"""
        # 中文测试
        set_language("zhCN")
        assert _("Taunt") == "嘲讽"
        assert _("Divine Shield") == "圣盾"

        # 英文测试
        set_language("enUS")
        assert _("Taunt") == "Taunt"
        assert _("Divine Shield") == "Divine Shield"

    def test_language_switch_mid_game(self):
        """测试游戏中切换语言"""
        # 先用中文创建游戏
        set_language("zhCN")

        # 切换到英文
        set_language("enUS")

        # 验证英文翻译生效
        assert _("End Turn") == "End Turn"
        assert _("Board:") == "Board:"

    def test_available_languages(self):
        """测试获取可用语言列表"""
        languages = get_available_languages()
        assert "zhCN" in languages
        assert "enUS" in languages
        assert len(languages) >= 2

    def test_end_turn_action_translation(self):
        """测试结束回合动作翻译"""
        from hearthstone_cli.engine.actions import EndTurnAction

        # 创建测试游戏状态
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=RandomState(seed=42),
            phase_stack=tuple()
        )

        ui = CLIInterface(game)
        action = EndTurnAction(player=0)

        # 测试中文
        set_language("zhCN")
        result = ui._action_to_str(action)
        assert result == "结束回合"

        # 测试英文
        set_language("enUS")
        result = ui._action_to_str(action)
        assert result == "End Turn"

    def test_minion_with_attributes_zhCN(self):
        """测试中文随从属性渲染"""
        set_language("zhCN")

        # 创建带属性的随从
        minion = Minion(
            card_id="CS1_042",
            attack=1,
            health=2,
            max_health=2,
            attributes=frozenset([Attribute.TAUNT, Attribute.DIVINE_SHIELD]),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(minion,),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=RandomState(seed=42),
            phase_stack=tuple()
        )

        output = TextRenderer.render(game)
        assert "嘲讽" in output
        assert "圣盾" in output

    def test_minion_with_attributes_enUS(self):
        """测试英文随从属性渲染"""
        set_language("enUS")

        # 创建带属性的随从
        minion = Minion(
            card_id="CS1_042",
            attack=1,
            health=2,
            max_health=2,
            attributes=frozenset([Attribute.TAUNT, Attribute.DIVINE_SHIELD]),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(minion,),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=RandomState(seed=42),
            phase_stack=tuple()
        )

        output = TextRenderer.render(game)
        assert "Taunt" in output
        assert "Divine Shield" in output

    def test_all_attributes_translation(self):
        """测试所有属性名称翻译"""
        attributes = [
            ("Taunt", "嘲讽"),
            ("Divine Shield", "圣盾"),
            ("Windfury", "风怒"),
            ("Charge", "冲锋"),
            ("Stealth", "潜行"),
            ("Poisonous", "剧毒"),
            ("Lifesteal", "吸血"),
        ]

        # 中文测试
        set_language("zhCN")
        for en, zh in attributes:
            assert _(en) == zh, f"Failed for {en}"

        # 英文测试
        set_language("enUS")
        for en, expected in attributes:
            assert _(en) == en, f"Failed for {en}"

    def test_ui_labels_in_both_languages(self):
        """测试UI标签在两种语言中正确"""
        labels = [
            ("Hand: ", "手牌: "),
            ("Board:", "场上:"),
            ("Armor", "护甲"),
            ("Mana", "水晶"),
            ("Exhausted", "已攻击"),
        ]

        # 中文测试
        set_language("zhCN")
        for en, zh in labels:
            assert _(en) == zh, f"Failed for {en}"

        # 英文测试
        set_language("enUS")
        for en, expected in labels:
            assert _(en) == en, f"Failed for {en}"
