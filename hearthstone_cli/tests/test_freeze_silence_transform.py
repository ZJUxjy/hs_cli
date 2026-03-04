"""测试冻结、沉默、变形效果"""
import pytest
from dataclasses import replace

from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute
)
from hearthstone_cli.engine.actions import AttackAction, TargetReference, PlayCardAction
from hearthstone_cli.engine.game import GameLogic


class TestFreezeMechanics:
    """测试冻结机制"""

    def test_freeze_minion_cannot_attack(self):
        """被冻结的随从不能攻击"""
        # 创建被冻结的随从
        frozen_minion = Minion(
            card_id="FROZEN",
            attack=3,
            health=4,
            max_health=4,
            attributes=frozenset({Attribute.FROZEN}),
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
            board=(frozen_minion,),
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
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]

        # 验证冻结随从不能攻击
        assert len(attack_actions) == 0

    def test_freeze_removes_after_turn(self):
        """冻结效果在下一回合开始时移除"""
        frozen_minion = Minion(
            card_id="FROZEN",
            attack=3,
            health=4,
            max_health=4,
            attributes=frozenset({Attribute.FROZEN}),
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
            board=(frozen_minion,),
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

        # 验证初始有冻结
        assert Attribute.FROZEN in game.players[0].board[0].attributes

        # 结束回合
        from hearthstone_cli.engine.actions import EndTurnAction
        game = GameLogic.apply_action(game, EndTurnAction(player=0))
        game = GameLogic.apply_action(game, EndTurnAction(player=1))

        # 验证冻结已移除
        assert Attribute.FROZEN not in game.players[0].board[0].attributes

    def test_freeze_from_hero_power(self):
        """英雄技能造成的冻结（如法师的冰冻效果）"""
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

        # 对随从应用冻结效果
        new_game = GameLogic._apply_freeze(game, 1, 0)

        # 验证随从被冻结
        assert Attribute.FROZEN in new_game.players[1].board[0].attributes


class TestSilenceMechanics:
    """测试沉默机制"""

    def test_silence_removes_attributes(self):
        """沉默移除随从的所有属性"""
        minion = Minion(
            card_id="TAUNT_MINION",
            attack=2,
            health=3,
            max_health=3,
            attributes=frozenset({Attribute.TAUNT, Attribute.DIVINE_SHIELD}),
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
            board=(minion,),
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

        # 对随从应用沉默效果
        new_game = GameLogic._apply_silence(game, 0, 0)

        # 验证属性被移除
        silenced_minion = new_game.players[0].board[0]
        assert Attribute.TAUNT not in silenced_minion.attributes
        assert Attribute.DIVINE_SHIELD not in silenced_minion.attributes
        assert len(silenced_minion.attributes) == 0

    def test_silence_removes_enchantments(self):
        """沉默移除所有增益效果"""
        from hearthstone_cli.engine.state import Enchantment

        enchantment = Enchantment(source="buff", attack_bonus=2, health_bonus=2)
        minion = Minion(
            card_id="BUFFED",
            attack=3,
            health=4,
            max_health=6,  # 原始4 + buff 2
            attributes=frozenset(),
            enchantments=(enchantment,),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
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

        # 应用沉默
        new_game = GameLogic._apply_silence(game, 0, 0)

        # 验证增益被移除
        silenced_minion = new_game.players[0].board[0]
        assert len(silenced_minion.enchantments) == 0

    def test_silenced_minion_keeps_base_stats(self):
        """沉默后随从保留基础属性"""
        minion = Minion(
            card_id="BASIC",
            attack=2,
            health=3,
            max_health=3,
            attributes=frozenset({Attribute.TAUNT}),
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
            board=(minion,),
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

        # 应用沉默
        new_game = GameLogic._apply_silence(game, 0, 0)

        # 验证基础属性保留
        silenced_minion = new_game.players[0].board[0]
        assert silenced_minion.attack == 2
        assert silenced_minion.health == 3


class TestTransformMechanics:
    """测试变形机制"""

    def test_transform_minion_changes_stats(self):
        """变形改变随从的属性和数值"""
        minion = Minion(
            card_id="SHEEP",
            attack=2,
            health=3,
            max_health=3,
            attributes=frozenset({Attribute.TAUNT}),
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
            board=(minion,),
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

        # 变形为1/1的绵羊
        new_game = GameLogic._apply_transform(
            game, 0, 0,
            new_card_id="SHEEP_1_1",
            new_attack=1,
            new_health=1
        )

        # 验证变形后的属性
        transformed_minion = new_game.players[0].board[0]
        assert transformed_minion.card_id == "SHEEP_1_1"
        assert transformed_minion.attack == 1
        assert transformed_minion.health == 1
        assert Attribute.TAUNT not in transformed_minion.attributes

    def test_transform_removes_enchantments(self):
        """变形移除所有增益效果"""
        from hearthstone_cli.engine.state import Enchantment

        enchantment = Enchantment(source="buff", attack_bonus=2, health_bonus=2)
        minion = Minion(
            card_id="BUFFED",
            attack=3,
            health=4,
            max_health=6,
            attributes=frozenset(),
            enchantments=(enchantment,),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
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

        # 变形
        new_game = GameLogic._apply_transform(
            game, 0, 0,
            new_card_id="FROG",
            new_attack=1,
            new_health=1
        )

        # 验证增益被移除
        transformed_minion = new_game.players[0].board[0]
        assert len(transformed_minion.enchantments) == 0

    def test_transform_preserves_damage(self):
        """变形保留已受到的伤害"""
        minion = Minion(
            card_id="DAMAGED",
            attack=4,
            health=5,
            max_health=5,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=2,  # 已受到2点伤害
            summoned_this_turn=False,
            exhausted=False,
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

        # 变形为更高血量的随从
        new_game = GameLogic._apply_transform(
            game, 0, 0,
            new_card_id="BIG_MINION",
            new_attack=2,
            new_health=10
        )

        # 验证伤害保留（新随从应有8点实际生命值 = 10 - 2）
        transformed_minion = new_game.players[0].board[0]
        assert transformed_minion.damage_taken == 2

    def test_transform_minion_to_minion(self):
        """测试将一个随从变形为另一个随从"""
        minion = Minion(
            card_id="DEVILSAUR",
            attack=5,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.CHARGE}),
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
            board=(minion,),
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

        # 变形为其他随从（如将冲锋恐龙变形为嘲讽熊）
        new_game = GameLogic._apply_transform(
            game, 0, 0,
            new_card_id="IRONBARK_PROTECTOR",
            new_attack=3,
            new_health=8,
            new_attributes=frozenset({Attribute.TAUNT})
        )

        # 验证变形结果
        transformed = new_game.players[0].board[0]
        assert transformed.card_id == "IRONBARK_PROTECTOR"
        assert transformed.attack == 3
        assert transformed.health == 8
        assert Attribute.TAUNT in transformed.attributes
        assert Attribute.CHARGE not in transformed.attributes
