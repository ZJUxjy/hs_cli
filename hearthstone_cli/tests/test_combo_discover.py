"""Tests for Combo and Discover mechanics."""

import pytest
from unittest.mock import patch, MagicMock
from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Card, Minion, Attribute
)
from hearthstone_cli.engine.actions import PlayCardAction, EndTurnAction
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.cards.parser import EffectParser


class TestComboMechanics:
    """Test Combo mechanics."""

    def test_has_combo_detection(self):
        """Test detecting combo keyword in text."""
        # 中文连击
        text1 = "<b>连击：</b>造成2点伤害。"
        assert EffectParser.has_combo(text1) is True

        # 英文连击
        text2 = "<b>Combo:</b> Deal 2 damage."
        assert EffectParser.has_combo(text2) is True

        # 无连击
        text3 = "造成2点伤害。"
        assert EffectParser.has_combo(text3) is False

    def test_parse_combo_effect(self):
        """Test parsing combo effect text."""
        text1 = "<b>连击：</b>造成2点伤害。"
        result = EffectParser.parse_combo(text1)
        assert result == "造成2点伤害"  # 没有句号，因为正则(.+?)(?:。|$)不会捕获句号

        text2 = "Deal 2 damage. <b>Combo:</b> Draw a card."
        result = EffectParser.parse_combo(text2)
        assert result == "Draw a card"

    def test_combo_triggers_when_cards_played_before(self):
        """Test combo triggers when cards were played this turn."""
        # 创建连击卡牌
        combo_card = Card(
            card_id="COMBO_TEST",
            name="Combo Test Card",
            cost=2,
            card_type="SPELL",
            text="<b>连击：</b>造成3点伤害。"
        )

        # 玩家本回合已打出1张牌
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5),
            deck=(),
            hand=(combo_card,),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0,
            cards_played_this_turn=1  # 已经打出过1张牌
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0,
            cards_played_this_turn=0
        )
        state = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 打出连击卡牌
        action = PlayCardAction(player=0, card_index=0, target=None)
        new_state = GameLogic.apply_action(state, action)

        # 连击应该触发，敌方英雄受到3点伤害
        assert new_state.players[1].hero.health == 27

    def test_combo_does_not_trigger_first_card(self):
        """Test combo does not trigger on first card of turn."""
        # 创建连击卡牌
        combo_card = Card(
            card_id="COMBO_TEST",
            name="Combo Test Card",
            cost=2,
            card_type="SPELL",
            text="<b>连击：</b>造成3点伤害。"
        )

        # 玩家本回合未打出过牌
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5),
            deck=(),
            hand=(combo_card,),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0,
            cards_played_this_turn=0  # 本回合未打出过牌
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0,
            cards_played_this_turn=0
        )
        state = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 打出连击卡牌
        action = PlayCardAction(player=0, card_index=0, target=None)
        new_state = GameLogic.apply_action(state, action)

        # 连击不应该触发，敌方英雄满血
        assert new_state.players[1].hero.health == 30

    def test_cards_played_counter_increments(self):
        """Test cards played counter increments correctly."""
        card1 = Card(
            card_id="CARD1",
            name="Card 1",
            cost=1,
            card_type="SPELL",
            text=""
        )
        card2 = Card(
            card_id="CARD2",
            name="Card 2",
            cost=1,
            card_type="SPELL",
            text=""
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5),
            deck=(),
            hand=(card1, card2),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0,
            cards_played_this_turn=0
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0,
            cards_played_this_turn=0
        )
        state = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 打出第一张牌
        action = PlayCardAction(player=0, card_index=0, target=None)
        state = GameLogic.apply_action(state, action)

        assert state.players[0].cards_played_this_turn == 1

        # 打出第二张牌
        action = PlayCardAction(player=0, card_index=0, target=None)
        state = GameLogic.apply_action(state, action)

        assert state.players[0].cards_played_this_turn == 2

    def test_cards_played_counter_resets_on_turn_end(self):
        """Test cards played counter resets at end of turn."""
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0,
            cards_played_this_turn=3  # 本回合打出过3张牌
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0,
            cards_played_this_turn=0
        )
        state = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 结束回合
        end_turn = EndTurnAction(player=0)
        new_state = GameLogic.apply_action(state, end_turn)

        # 计数应该被重置
        assert new_state.players[0].cards_played_this_turn == 0


class TestDiscoverMechanics:
    """Test Discover mechanics."""

    def test_has_discover_detection(self):
        """Test detecting discover keyword in text."""
        # 中文发现
        text1 = "<b>发现</b>一张法术牌。"
        assert EffectParser.has_discover(text1) is True

        # 英文发现
        text2 = "<b>Discover</b> a spell."
        assert EffectParser.has_discover(text2) is True

        # 无发现
        text3 = "抽一张牌。"
        assert EffectParser.has_discover(text3) is False

    def test_parse_discover_card_type(self):
        """Test parsing discover card type restriction."""
        # 法术
        text1 = "<b>发现</b>一张法术牌。"
        assert EffectParser.parse_discover(text1) == "spell"

        # 随从
        text2 = "<b>发现</b>一张随从牌。"
        assert EffectParser.parse_discover(text2) == "minion"

        # 武器
        text3 = "<b>发现</b>一张武器牌。"
        assert EffectParser.parse_discover(text3) == "weapon"

        # 任意
        text4 = "<b>发现</b>一张牌。"
        assert EffectParser.parse_discover(text4) == "any"

    def test_discover_adds_card_to_hand(self):
        """Test discover adds a card to hand."""
        # 创建发现卡牌
        discover_card = Card(
            card_id="DISCOVER_TEST",
            name="Discover Test Card",
            cost=2,
            card_type="SPELL",
            text="<b>发现</b>一张法术牌。"
        )

        # 模拟数据库中的法术卡牌
        mock_spell_card = MagicMock()
        mock_spell_card.card_id = "SPELL1"
        mock_spell_card.name = "Test Spell"
        mock_spell_card.cost = 3
        mock_spell_card.card_type = MagicMock()
        mock_spell_card.card_type.value = "SPELL"
        mock_spell_card.text = "造成5点伤害。"

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5),
            deck=(),
            hand=(discover_card,),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0,
            cards_played_this_turn=0
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0,
            cards_played_this_turn=0
        )
        state = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        with patch('hearthstone_cli.cards.database.CardDatabase') as mock_db_class:
            mock_db = MagicMock()
            mock_db.get_all_cards.return_value = [mock_spell_card]
            mock_db_class.return_value = mock_db

            # 打出发现卡牌
            action = PlayCardAction(player=0, card_index=0, target=None)
            new_state = GameLogic.apply_action(state, action)

        # 手牌应该增加了发现的卡牌
        assert len(new_state.players[0].hand) == 1  # 原卡牌打出，但发现一张新卡牌

    def test_discover_respects_card_type(self):
        """Test discover respects card type restriction."""
        text = "<b>发现</b>一张法术牌。"
        card_type = EffectParser.parse_discover(text)
        assert card_type == "spell"

        text2 = "<b>Discover</b> a minion."
        card_type2 = EffectParser.parse_discover(text2)
        assert card_type2 == "minion"
