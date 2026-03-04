"""Tests for fatigue damage mechanics."""

import pytest
from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute
)
from hearthstone_cli.engine.actions import EndTurnAction, Zone, TargetReference
from hearthstone_cli.engine.game import GameLogic


class TestFatigueMechanics:
    """Test fatigue damage mechanics."""

    def test_fatigue_damage_first_draw(self):
        """Test that first fatigue draw deals 1 damage."""
        # 创建空牌库的玩家
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),  # 空牌库
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

        # 玩家0结束回合，玩家1回合开始（会抽牌/疲劳）
        end_turn = EndTurnAction(player=0)
        new_state = GameLogic.apply_action(state, end_turn)

        # 玩家1疲劳1点伤害
        assert new_state.players[1].fatigue_count == 1
        assert new_state.players[1].hero.health == 29

    def test_fatigue_damage_increases(self):
        """Test that fatigue damage increases each time."""
        player0 = PlayerState(
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
        # 玩家1已经疲劳2次
        player1 = PlayerState(
            hero=HeroState(health=27),  # 30 - 1 - 2 = 27
            mana=ManaState(current=1, max_mana=1),
            deck=(),
            hand=(),
            board=(),
            secrets=frozenset(),
            graveyard=(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
            fatigue_count=2
        )
        state = GameState(
            turn=2,
            active_player=1,
            players=(player0, player1),
            action_history=(),
            rng_state=None,
            phase_stack=()
        )

        # 玩家1结束回合，玩家0回合开始疲劳
        end_turn = EndTurnAction(player=1)
        new_state = GameLogic.apply_action(state, end_turn)

        # 玩家0第一次疲劳
        assert new_state.players[0].fatigue_count == 1
        assert new_state.players[0].hero.health == 29

        # 玩家0结束回合，玩家1再次疲劳
        end_turn = EndTurnAction(player=0)
        new_state = GameLogic.apply_action(new_state, end_turn)

        # 玩家1第三次疲劳，3点伤害
        assert new_state.players[1].fatigue_count == 3
        assert new_state.players[1].hero.health == 24  # 27 - 3 = 24

    def test_normal_draw_with_cards_in_deck(self):
        """Test normal draw when deck has cards."""
        from hearthstone_cli.engine.state import Card

        card = Card(card_id="TEST", name="Test Card", cost=1, card_type="MINION")
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=1, max_mana=1),
            deck=(),  # 玩家0空牌库
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
            mana=ManaState(current=1, max_mana=1),
            deck=(card,),  # 玩家1有牌
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

        # 玩家0结束回合，玩家1回合开始抽牌
        end_turn = EndTurnAction(player=0)
        new_state = GameLogic.apply_action(state, end_turn)

        # 玩家1正常抽牌，没有疲劳
        assert len(new_state.players[1].hand) == 1
        assert new_state.players[1].fatigue_count == 0
        assert new_state.players[1].hero.health == 30

    def test_fatigue_kills_hero(self):
        """Test that fatigue can kill hero."""
        player0 = PlayerState(
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
        player1 = PlayerState(
            hero=HeroState(health=1),  # 只剩1血
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

        # 玩家0结束回合，玩家1回合开始疲劳
        end_turn = EndTurnAction(player=0)
        new_state = GameLogic.apply_action(state, end_turn)

        # 玩家1因疲劳死亡
        assert new_state.players[1].hero.health == 0
        assert GameLogic.is_terminal(new_state)

    def test_fatigue_damage_with_armor(self):
        """Test that fatigue damage ignores armor (直接扣血)."""
        player0 = PlayerState(
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
        player1 = PlayerState(
            hero=HeroState(health=30, armor=5),
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

        # 玩家0结束回合，玩家1回合开始疲劳
        end_turn = EndTurnAction(player=0)
        new_state = GameLogic.apply_action(state, end_turn)

        # 疲劳伤害直接扣血（护甲不减伤）
        assert new_state.players[1].hero.health == 29
        assert new_state.players[1].hero.armor == 5
