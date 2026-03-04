"""测试英雄技能系统"""
import pytest
from dataclasses import replace

from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, HeroPower
)
from hearthstone_cli.engine.actions import HeroPowerAction, TargetReference
from hearthstone_cli.engine.game import GameLogic


class TestHeroPowerMechanics:
    """测试英雄技能机制"""

    def test_hero_power_state_creation(self):
        """测试英雄技能状态创建"""
        hp = HeroPower(
            name="Fireblast",
            cost=2,
            damage=1,
            description="Deal 1 damage.",
            target_required=True
        )
        assert hp.name == "Fireblast"
        assert hp.cost == 2
        assert hp.damage == 1
        assert hp.target_required is True

    def test_use_hero_power_deals_damage_to_hero(self):
        """使用英雄技能对敌方英雄造成伤害"""
        # 创建英雄技能
        hero_power = HeroPower(
            name="Fireblast",
            cost=2,
            damage=1,
            description="Deal 1 damage.",
            target_required=True
        )

        player0 = PlayerState(
            hero=HeroState(health=30, hero_power=hero_power),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
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

        # 使用英雄技能攻击敌方英雄
        action = HeroPowerAction(
            player=0,
            target=TargetReference.hero(1)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证敌方英雄受到1点伤害
        assert new_game.players[1].hero.health == 29
        # 验证英雄技能已使用
        assert new_game.players[0].hero_power_used is True
        # 验证法力值消耗
        assert new_game.players[0].mana.current == 8  # 10 - 2 = 8

    def test_use_hero_power_deals_damage_to_minion(self):
        """使用英雄技能对敌方随从造成伤害"""
        hero_power = HeroPower(
            name="Fireblast",
            cost=2,
            damage=1,
            description="Deal 1 damage.",
            target_required=True
        )

        # 创建敌方随从
        enemy_minion = Minion(
            card_id="ENEMY",
            attack=2,
            health=3,
            max_health=3,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=30, hero_power=hero_power),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
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
            board=(enemy_minion,),
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

        # 使用英雄技能攻击敌方随从
        action = HeroPowerAction(
            player=0,
            target=TargetReference.board(1, 0)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证随从受到1点伤害
        assert new_game.players[1].board[0].damage_taken == 1
        # health是max_health，实际生命值 = max_health - damage_taken = 3 - 1 = 2

    def test_cannot_use_hero_power_twice(self):
        """一回合不能使用两次英雄技能"""
        hero_power = HeroPower(
            name="Fireblast",
            cost=2,
            damage=1,
            description="Deal 1 damage.",
            target_required=True
        )

        player0 = PlayerState(
            hero=HeroState(health=30, hero_power=hero_power),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=True,  # 已经使用过
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

        # 获取合法动作
        actions = GameLogic.get_legal_actions(game, player=0)
        hero_power_actions = [a for a in actions if isinstance(a, HeroPowerAction)]

        # 验证没有英雄技能动作（因为已经使用过了）
        assert len(hero_power_actions) == 0

    def test_cannot_use_hero_power_without_enough_mana(self):
        """法力值不足不能使用英雄技能"""
        hero_power = HeroPower(
            name="Fireblast",
            cost=2,
            damage=1,
            description="Deal 1 damage.",
            target_required=True
        )

        player0 = PlayerState(
            hero=HeroState(health=30, hero_power=hero_power),
            mana=ManaState(current=1, max_mana=10),  # 只有1点法力值
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
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

        # 获取合法动作
        actions = GameLogic.get_legal_actions(game, player=0)
        hero_power_actions = [a for a in actions if isinstance(a, HeroPowerAction)]

        # 验证没有英雄技能动作（因为法力值不足）
        assert len(hero_power_actions) == 0

    def test_hero_power_resets_on_new_turn(self):
        """新回合重置英雄技能使用状态"""
        hero_power = HeroPower(
            name="Fireblast",
            cost=2,
            damage=1,
            description="Deal 1 damage.",
            target_required=True
        )

        player0 = PlayerState(
            hero=HeroState(health=30, hero_power=hero_power),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=True,  # 本回合已使用
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

        # 结束回合
        from hearthstone_cli.engine.actions import EndTurnAction
        game = GameLogic.apply_action(game, EndTurnAction(player=0))
        # 再结束一回合回到玩家0
        game = GameLogic.apply_action(game, EndTurnAction(player=1))

        # 验证英雄技能状态已重置
        assert game.players[0].hero_power_used is False

    def test_use_hero_power_without_target(self):
        """使用不需要目标的英雄技能（如萨满的图腾召唤）"""
        hero_power = HeroPower(
            name="Totemic Call",
            cost=2,
            damage=0,
            description="Summon a random totem.",
            target_required=False
        )

        player0 = PlayerState(
            hero=HeroState(health=30, hero_power=hero_power),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
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

        # 使用英雄技能（无需目标）
        action = HeroPowerAction(
            player=0,
            target=None
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证英雄技能已使用
        assert new_game.players[0].hero_power_used is True
        # 验证法力值消耗
        assert new_game.players[0].mana.current == 8

    def test_hero_power_available_in_legal_actions(self):
        """英雄技能出现在合法动作列表中"""
        hero_power = HeroPower(
            name="Fireblast",
            cost=2,
            damage=1,
            description="Deal 1 damage.",
            target_required=True
        )

        player0 = PlayerState(
            hero=HeroState(health=30, hero_power=hero_power),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
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

        # 获取合法动作
        actions = GameLogic.get_legal_actions(game, player=0)
        hero_power_actions = [a for a in actions if isinstance(a, HeroPowerAction)]

        # 验证有英雄技能动作
        assert len(hero_power_actions) > 0

    def test_healing_hero_power(self):
        """治疗型英雄技能（如牧师的次级治疗术）"""
        hero_power = HeroPower(
            name="Lesser Heal",
            cost=2,
            damage=0,
            heal=2,
            description="Restore 2 Health.",
            target_required=False
        )

        player0 = PlayerState(
            hero=HeroState(health=25, hero_power=hero_power),  # 受伤状态
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
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

        # 使用治疗英雄技能
        action = HeroPowerAction(
            player=0,
            target=None
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证英雄恢复2点生命值
        assert new_game.players[0].hero.health == 27  # 25 + 2 = 27
        # 验证英雄技能已使用
        assert new_game.players[0].hero_power_used is True

    def test_hero_power_with_armor(self):
        """获得护甲的英雄技能（如战士的全副武装）"""
        hero_power = HeroPower(
            name="Armor Up!",
            cost=2,
            damage=0,
            armor=2,
            description="Gain 2 Armor.",
            target_required=False
        )

        player0 = PlayerState(
            hero=HeroState(health=30, armor=0, hero_power=hero_power),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
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

        # 使用英雄技能
        action = HeroPowerAction(
            player=0,
            target=None
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证获得2点护甲
        assert new_game.players[0].hero.armor == 2
        # 验证英雄技能已使用
        assert new_game.players[0].hero_power_used is True
