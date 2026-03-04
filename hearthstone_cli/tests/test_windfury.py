"""测试风怒系统"""
import pytest
from dataclasses import replace

from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute
)
from hearthstone_cli.engine.actions import AttackAction, TargetReference
from hearthstone_cli.engine.game import GameLogic


class TestWindfuryMechanics:
    """测试风怒机制"""

    def test_windfury_can_attack_twice(self):
        """风怒随从可以攻击两次"""
        # 创建风怒攻击者
        attacker = Minion(
            card_id="WINDFURY_MINION",
            attack=2,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.WINDFURY}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        # 创建防御者
        defender = Minion(
            card_id="DEFENDER",
            attack=1,
            health=10,
            max_health=10,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(attacker,),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(defender,),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=None,
            phase_stack=tuple(),
        )

        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.board(1, 0)
        )

        # 第一次攻击
        new_game = GameLogic.apply_action(game, action)

        # 验证第一次攻击成功，防御者受到2点伤害
        assert len(new_game.players[1].board) == 1
        damaged_defender = new_game.players[1].board[0]
        assert damaged_defender.damage_taken == 2

        # 验证攻击次数被记录
        attacks_dict = dict(new_game.players[0].attacks_this_turn)
        assert attacks_dict.get(0, 0) == 1

        # 第二次攻击（风怒允许第二次）
        new_game = GameLogic.apply_action(new_game, action)

        # 验证第二次攻击成功，防御者总共受到4点伤害
        assert len(new_game.players[1].board) == 1
        damaged_defender = new_game.players[1].board[0]
        assert damaged_defender.damage_taken == 4

        # 验证攻击次数更新为2
        attacks_dict = dict(new_game.players[0].attacks_this_turn)
        assert attacks_dict.get(0, 0) == 2

    def test_windfury_cannot_attack_third_time(self):
        """风怒随从不能攻击第三次"""
        attacker = Minion(
            card_id="WINDFURY_MINION",
            attack=2,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.WINDFURY}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        defender = Minion(
            card_id="DEFENDER",
            attack=1,
            health=10,
            max_health=10,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(attacker,),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(defender,),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=None,
            phase_stack=tuple(),
        )

        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.board(1, 0)
        )

        # 攻击两次
        new_game = GameLogic.apply_action(game, action)
        new_game = GameLogic.apply_action(new_game, action)

        # 尝试第三次攻击 - 应该没有攻击动作可用
        actions = GameLogic.get_legal_actions(new_game, player=0)
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]

        # 风怒随从已经攻击两次，不能再攻击
        assert len(attack_actions) == 0

    def test_normal_minion_can_attack_once(self):
        """普通随从只能攻击一次"""
        attacker = Minion(
            card_id="NORMAL_MINION",
            attack=2,
            health=5,
            max_health=5,
            attributes=frozenset(),  # 无风怒
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        defender = Minion(
            card_id="DEFENDER",
            attack=1,
            health=10,
            max_health=10,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(attacker,),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(defender,),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=None,
            phase_stack=tuple(),
        )

        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.board(1, 0)
        )

        # 第一次攻击
        new_game = GameLogic.apply_action(game, action)

        # 验证防御者受到伤害
        assert len(new_game.players[1].board) == 1
        damaged_defender = new_game.players[1].board[0]
        assert damaged_defender.damage_taken == 2

        # 检查是否还能攻击
        actions = GameLogic.get_legal_actions(new_game, player=0)
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]

        # 普通随从已经攻击一次，不能再攻击
        assert len(attack_actions) == 0

    def test_windfury_attacks_reset_on_new_turn(self):
        """风怒攻击次数在新回合重置"""
        attacker = Minion(
            card_id="WINDFURY_MINION",
            attack=2,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.WINDFURY}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(attacker,),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=((0, 2),),  # 已经攻击了两次
            hero_power_used=False,
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
            hero_power_used=False,
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=None,
            phase_stack=tuple(),
        )

        # 检查当前不能攻击
        actions = GameLogic.get_legal_actions(game, player=0)
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]
        assert len(attack_actions) == 0  # 已经攻击了两次

        # 结束回合
        from hearthstone_cli.engine.actions import EndTurnAction
        end_turn = EndTurnAction(player=0)
        new_game = GameLogic.apply_action(game, end_turn)

        # 再过一回合（回到玩家0）
        new_game = GameLogic.apply_action(new_game, EndTurnAction(player=1))

        # 现在攻击次数应该重置了
        actions = GameLogic.get_legal_actions(new_game, player=0)
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]

        # 攻击次数重置，可以再次攻击两次
        assert len(attack_actions) == 1  # 可以攻击敌方英雄

    def test_windfury_with_charge(self):
        """风怒+冲锋随从可以立即攻击两次"""
        attacker = Minion(
            card_id="WINDFURY_CHARGE",
            attack=3,
            health=5,  # 足够生命值承受反击
            max_health=5,
            attributes=frozenset({Attribute.WINDFURY, Attribute.CHARGE}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=True,  # 本回合召唤的
            exhausted=False,
        )

        defender = Minion(
            card_id="DEFENDER",
            attack=1,
            health=10,
            max_health=10,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(attacker,),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(defender,),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )

        game = GameState(
            turn=1,
            active_player=0,
            players=(player0, player1),
            action_history=tuple(),
            rng_state=None,
            phase_stack=tuple(),
        )

        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.board(1, 0)
        )

        # 第一次攻击（冲锋允许本回合攻击）
        new_game = GameLogic.apply_action(game, action)
        assert len(new_game.players[1].board) == 1
        assert new_game.players[1].board[0].damage_taken == 3

        # 第二次攻击（风怒允许）
        new_game = GameLogic.apply_action(new_game, action)
        assert new_game.players[1].board[0].damage_taken == 6

        # 检查不能再攻击第三次
        actions = GameLogic.get_legal_actions(new_game, player=0)
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]
        assert len(attack_actions) == 0
