"""Tests for overload mechanics."""

import pytest
from unittest.mock import patch, MagicMock
from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Card
)
from hearthstone_cli.engine.actions import EndTurnAction, PlayCardAction
from hearthstone_cli.engine.game import GameLogic


class TestOverloadMechanics:
    """Test overload mechanics."""

    def test_parse_overload_from_text(self):
        """Test parsing overload from card text."""
        from hearthstone_cli.cards.parser import EffectParser

        # 中文过载
        text1 = "造成3点伤害。过载：(2)"
        assert EffectParser.parse_overload(text1) == 2

        # 英文过载
        text2 = "Deal 3 damage. Overload: (2)"
        assert EffectParser.parse_overload(text2) == 2

        # 无过载
        text3 = "造成3点伤害。"
        assert EffectParser.parse_overload(text3) == 0

    def test_overload_applied_when_playing_card(self):
        """Test that overload is applied when playing a card."""
        from hearthstone_cli.cards.data import CardData, CardType, Rarity, Class

        # 创建一个带有过载效果的卡牌（使用CardData）
        overload_card = CardData(
            card_id="OVERLOAD_TEST",
            name="Overload Test Card",
            cost=2,
            card_type=CardType.SPELL,
            rarity=Rarity.COMMON,
            text="造成3点伤害。过载：(2)",
            player_class=Class.SHAMAN
        )

        # 创建对应的State Card
        state_card = Card(
            card_id="OVERLOAD_TEST",
            name="Overload Test Card",
            cost=2,
            card_type="SPELL",
            attack=None,
            health=None,
            attributes=frozenset(),
            text="造成3点伤害。过载：(2)"
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5),
            deck=(),
            hand=(state_card,),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
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
            fatigue_count=0
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
            mock_db.get_card.return_value = overload_card
            mock_db_class.return_value = mock_db

            # 打出卡牌
            action = PlayCardAction(player=0, card_index=0, target=None)
            new_state = GameLogic.apply_action(state, action)

        # 检查过载是否被应用
        assert new_state.players[0].mana.overload == 2

    def test_overload_locks_mana_next_turn(self):
        """Test that overload locks mana crystals next turn."""
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5, overload=2, locked=0),  # 过载2点
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
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
            fatigue_count=0
        )
        state = GameState(
            turn=1,
            active_player=1,  # 玩家1先结束，轮到玩家0
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 玩家1结束回合，玩家0回合开始（玩家0有过载）
        end_turn = EndTurnAction(player=1)
        new_state = GameLogic.apply_action(state, end_turn)

        # 玩家0应该有6点最大水晶（原来是5，+1），但被锁定2点，所以可用4点
        assert new_state.players[0].mana.max_mana == 6
        assert new_state.players[0].mana.locked == 2
        assert new_state.players[0].mana.current == 4  # 6 - 2 = 4
        assert new_state.players[0].mana.overload == 0  # 过载已清空

    def test_multiple_overload_stack(self):
        """Test that multiple overload effects stack."""
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10, overload=3, locked=0),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
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
            fatigue_count=0
        )
        state = GameState(
            turn=1,
            active_player=1,  # 玩家1先结束，轮到玩家0
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 玩家1结束回合，玩家0回合开始
        end_turn = EndTurnAction(player=1)
        new_state = GameLogic.apply_action(state, end_turn)

        # 玩家0应该有10点最大水晶（已经是上限），被锁定3点
        assert new_state.players[0].mana.max_mana == 10
        assert new_state.players[0].mana.locked == 3
        assert new_state.players[0].mana.current == 7  # 10 - 3 = 7

    def test_overload_cannot_reduce_below_zero(self):
        """Test that overload cannot reduce available mana below zero."""
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=5, max_mana=5, overload=10, locked=0),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
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
            fatigue_count=0
        )
        state = GameState(
            turn=1,
            active_player=1,  # 玩家1先结束，轮到玩家0
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 玩家1结束回合，玩家0回合开始
        end_turn = EndTurnAction(player=1)
        new_state = GameLogic.apply_action(state, end_turn)

        # 玩家0应该有6点最大水晶，但被锁定10点，可用水晶不能低于0
        assert new_state.players[0].mana.max_mana == 6
        assert new_state.players[0].mana.locked == 10
        assert new_state.players[0].mana.current == 0  # 不能低于0
