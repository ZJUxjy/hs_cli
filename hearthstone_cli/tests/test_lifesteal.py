"""测试吸血系统"""
import pytest
from dataclasses import replace

from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute
)
from hearthstone_cli.engine.actions import AttackAction, TargetReference
from hearthstone_cli.engine.game import GameLogic


class TestLifestealMechanics:
    """测试吸血机制"""

    def test_lifesteal_heals_hero_when_attacking_minion(self):
        """吸血随从攻击随从时治疗英雄"""
        # 吸血攻击者
        attacker = Minion(
            card_id="LIFESTEAL_MINION",
            attack=3,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.LIFESTEAL}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        defender = Minion(
            card_id="DEFENDER",
            attack=2,
            health=4,
            max_health=4,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=20),  # 英雄受伤状态
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

        # 攻击前英雄生命值为20
        assert game.players[0].hero.health == 20

        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.board(1, 0)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证英雄受到治疗（20 + 3 = 23）
        assert new_game.players[0].hero.health == 23
        # 验证防御者受到伤害
        assert new_game.players[1].board[0].damage_taken == 3

    def test_lifesteal_heals_hero_when_attacking_hero(self):
        """吸血随从攻击英雄时治疗英雄"""
        attacker = Minion(
            card_id="LIFESTEAL_MINION",
            attack=4,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.LIFESTEAL}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=15),  # 英雄受伤状态
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

        # 攻击前英雄生命值为15
        assert game.players[0].hero.health == 15

        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.hero(1)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证英雄受到治疗（15 + 4 = 19）
        assert new_game.players[0].hero.health == 19
        # 验证敌方英雄受到伤害
        assert new_game.players[1].hero.health == 26  # 30 - 4 = 26

    def test_lifesteal_no_heal_when_divine_shield_blocks(self):
        """圣盾阻挡伤害时，吸血不触发"""
        attacker = Minion(
            card_id="LIFESTEAL_MINION",
            attack=5,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.LIFESTEAL}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        # 带圣盾的防御者
        defender = Minion(
            card_id="DIVINE_SHIELD",
            attack=2,
            health=6,
            max_health=6,
            attributes=frozenset({Attribute.DIVINE_SHIELD}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=20),  # 英雄受伤状态
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

        new_game = GameLogic.apply_action(game, action)

        # 验证英雄没有受到治疗（仍然是20）
        assert new_game.players[0].hero.health == 20
        # 验证防御者的圣盾被移除
        assert Attribute.DIVINE_SHIELD not in new_game.players[1].board[0].attributes
        # 验证防御者没有受到伤害
        assert new_game.players[1].board[0].damage_taken == 0

    def test_lifesteal_capped_at_max_health(self):
        """吸血治疗不会超过最大生命值（30）"""
        attacker = Minion(
            card_id="LIFESTEAL_MINION",
            attack=5,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.LIFESTEAL}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=28),  # 接近满血
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

        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.hero(1)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证英雄生命值被限制在30（28 + 5 = 33 > 30）
        assert new_game.players[0].hero.health == 30

    def test_normal_minion_no_lifesteal(self):
        """非吸血随从不会治疗英雄"""
        attacker = Minion(
            card_id="NORMAL_MINION",
            attack=3,
            health=5,
            max_health=5,
            attributes=frozenset(),  # 无吸血
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=20),  # 英雄受伤状态
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

        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.hero(1)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证英雄没有受到治疗（仍然是20）
        assert new_game.players[0].hero.health == 20
        # 验证敌方英雄受到伤害
        assert new_game.players[1].hero.health == 27  # 30 - 3 = 27

    def test_lifesteal_with_windfury(self):
        """吸血+风怒随从攻击两次治疗两次"""
        attacker = Minion(
            card_id="LIFESTEAL_WINDFURY",
            attack=2,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.LIFESTEAL, Attribute.WINDFURY}),
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
            hero=HeroState(health=20),  # 英雄受伤状态
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
        # 验证第一次治疗（20 + 2 = 22）
        assert new_game.players[0].hero.health == 22

        # 第二次攻击（风怒允许）
        new_game = GameLogic.apply_action(new_game, action)
        # 验证第二次治疗（22 + 2 = 24）
        assert new_game.players[0].hero.health == 24
