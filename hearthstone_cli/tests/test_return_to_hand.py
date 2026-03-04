"""Tests for return to hand mechanics."""

import pytest
from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute, Card
)
from hearthstone_cli.engine.actions import EndTurnAction, Zone, TargetReference
from hearthstone_cli.engine.game import GameLogic


class TestReturnToHandMechanics:
    """Test return to hand mechanics."""

    def test_return_to_hand_basic(self):
        """Test basic return to hand functionality."""
        minion = Minion(
            card_id="WISP",  # 小精灵，0费1/1
            attack=1,
            health=1,
            max_health=1,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(minion,),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
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

        # 将随从返回手牌
        new_state = GameLogic._return_to_hand(state, 0, 0)

        # 随从从场上消失
        assert len(new_state.players[0].board) == 0
        # 随从回到手牌
        assert len(new_state.players[0].hand) == 1
        assert new_state.players[0].hand[0].card_id == "WISP"
        assert new_state.players[0].hand[0].card_type == "MINION"

    def test_return_to_hand_removes_attributes(self):
        """Test that returned minion loses all attributes."""
        minion = Minion(
            card_id="WISP",
            attack=1,
            health=1,
            max_health=1,
            attributes=frozenset({Attribute.TAUNT, Attribute.DIVINE_SHIELD}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(minion,),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
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

        new_state = GameLogic._return_to_hand(state, 0, 0)

        # 返回手牌的卡牌没有属性
        assert len(new_state.players[0].hand[0].attributes) == 0

    def test_return_to_hand_heals_damage(self):
        """Test that returned minion is healed to full health."""
        minion = Minion(
            card_id="WISP",
            attack=1,
            health=2,  # 当前只剩2血
            max_health=5,  # 最大5血
            attributes=frozenset(),
            enchantments=(),
            damage_taken=3,
            summoned_this_turn=False,
            exhausted=False
        )
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(minion,),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
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

        new_state = GameLogic._return_to_hand(state, 0, 0)

        # 返回手牌的卡牌恢复满血
        assert new_state.players[0].hand[0].health == 5

    def test_return_to_hand_with_full_hand(self):
        """Test that returned minion is destroyed if hand is full."""
        # 创建10张手牌（满手牌）
        hand_cards = tuple(
            Card(card_id=f"CARD{i}", name=f"Card {i}", cost=1, card_type="SPELL")
            for i in range(10)
        )

        minion = Minion(
            card_id="WISP",
            attack=1,
            health=1,
            max_health=1,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False
        )
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=hand_cards,
            board=(minion,),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
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

        new_state = GameLogic._return_to_hand(state, 0, 0)

        # 随从从场上消失
        assert len(new_state.players[0].board) == 0
        # 手牌仍然是10张（返回的卡牌被销毁）
        assert len(new_state.players[0].hand) == 10

    def test_return_to_hand_invalid_index(self):
        """Test return to hand with invalid minion index."""
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(),  # 空场上
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=0
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
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

        # 尝试返回不存在的随从
        new_state = GameLogic._return_to_hand(state, 0, 0)

        # 状态不变
        assert new_state == state
