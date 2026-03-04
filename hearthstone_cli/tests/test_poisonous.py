"""测试剧毒系统"""
import pytest
from dataclasses import replace

from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute
)
from hearthstone_cli.engine.actions import AttackAction, TargetReference
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.data import CardData, CardType, Rarity


def setup_test_card(card_id: str, name: str, attack: int, health: int):
    """添加测试卡牌到数据库"""
    db = CardDatabase()
    db.add_card(CardData(
        card_id=card_id,
        name=name,
        cost=1,
        card_type=CardType.MINION,
        rarity=Rarity.COMMON,
        attack=attack,
        health=health,
        text=""
    ))


class TestPoisonousMechanics:
    """测试剧毒机制"""

    def test_poisonous_instant_kill(self):
        """剧毒随从攻击时直接消灭目标"""
        # 添加卡牌到数据库
        setup_test_card("POISONOUS_SNAKE", "毒蛇", 1, 1)
        setup_test_card("BIG_MINION", "大随从", 5, 10)

        # 创建剧毒攻击者（1攻也能秒杀高血量随从）
        attacker = Minion(
            card_id="POISONOUS_SNAKE",
            attack=1,
            health=1,
            max_health=1,
            attributes=frozenset({Attribute.POISONOUS}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        # 创建高血量防御者
        defender = Minion(
            card_id="BIG_MINION",
            attack=5,
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

        new_game = GameLogic.apply_action(game, action)

        # 验证防御者被直接消灭（进入墓地）
        assert len(new_game.players[1].board) == 0
        assert len(new_game.players[1].graveyard) == 1

    def test_poisonous_with_divine_shield(self):
        """剧毒攻击圣盾随从时，圣盾抵消效果"""
        attacker = Minion(
            card_id="POISONOUS_SNAKE",
            attack=1,
            health=1,
            max_health=1,
            attributes=frozenset({Attribute.POISONOUS}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        defender = Minion(
            card_id="DIVINE_SHIELD_MINION",
            attack=5,
            health=10,
            max_health=10,
            attributes=frozenset({Attribute.DIVINE_SHIELD}),
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

        new_game = GameLogic.apply_action(game, action)

        # 验证防御者存活（圣盾抵消剧毒）
        assert len(new_game.players[1].board) == 1
        # 验证圣盾被移除
        assert Attribute.DIVINE_SHIELD not in new_game.players[1].board[0].attributes
        # 验证没有受到伤害
        assert new_game.players[1].board[0].damage_taken == 0

    def test_poisonous_to_hero_no_effect(self):
        """剧毒攻击英雄时正常造成伤害（英雄不受剧毒影响）"""
        attacker = Minion(
            card_id="POISONOUS_SNAKE",
            attack=2,
            health=1,
            max_health=1,
            attributes=frozenset({Attribute.POISONOUS}),
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

        # 验证英雄受到正常伤害（不是秒杀）
        assert new_game.players[1].hero.health == 28  # 30 - 2 = 28

    def test_normal_minion_without_poisonous(self):
        """非剧毒随从攻击时正常造成伤害"""
        attacker = Minion(
            card_id="NORMAL_MINION",
            attack=2,
            health=2,
            max_health=2,
            attributes=frozenset(),  # 无剧毒
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        defender = Minion(
            card_id="BIG_MINION",
            attack=5,
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

        new_game = GameLogic.apply_action(game, action)

        # 验证防御者受到2点伤害（不是秒杀）
        assert len(new_game.players[1].board) == 1
        assert new_game.players[1].board[0].damage_taken == 2

    def test_poisonous_with_windfury(self):
        """剧毒+风怒随从可以秒杀两个目标"""
        setup_test_card("POISONOUS_WINDFURY", "剧毒风怒", 1, 5)
        setup_test_card("TARGET1", "目标1", 1, 8)
        setup_test_card("TARGET2", "目标2", 1, 8)

        attacker = Minion(
            card_id="POISONOUS_WINDFURY",
            attack=1,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.POISONOUS, Attribute.WINDFURY}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        defender1 = Minion(
            card_id="TARGET1",
            attack=1,
            health=8,
            max_health=8,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        defender2 = Minion(
            card_id="TARGET2",
            attack=1,
            health=8,
            max_health=8,
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
            board=(defender1, defender2),
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

        # 第一次攻击
        action1 = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.board(1, 0)
        )
        new_game = GameLogic.apply_action(game, action1)

        # 验证第一个防御者被秒杀
        assert len(new_game.players[1].board) == 1
        assert len(new_game.players[1].graveyard) == 1

        # 第二次攻击（风怒允许）
        action2 = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.board(1, 0)
        )
        new_game = GameLogic.apply_action(new_game, action2)

        # 验证第二个防御者也被秒杀
        assert len(new_game.players[1].board) == 0
        assert len(new_game.players[1].graveyard) == 2

    def test_defender_poisonous_kills_attacker(self):
        """防御者有毒时，反击也能秒杀攻击者"""
        setup_test_card("NORMAL_ATTACKER", "普通攻击者", 5, 10)
        setup_test_card("POISONOUS_DEFENDER", "剧毒防御者", 1, 1)

        attacker = Minion(
            card_id="NORMAL_ATTACKER",
            attack=5,
            health=10,
            max_health=10,
            attributes=frozenset(),  # 无剧毒
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        defender = Minion(
            card_id="POISONOUS_DEFENDER",
            attack=1,
            health=1,
            max_health=1,
            attributes=frozenset({Attribute.POISONOUS}),
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

        new_game = GameLogic.apply_action(game, action)

        # 验证双方都死亡（攻击者被剧毒反击秒杀，防御者被攻击伤害打死）
        assert len(new_game.players[0].board) == 0
        assert len(new_game.players[1].board) == 0
