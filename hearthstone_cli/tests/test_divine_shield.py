"""测试圣盾系统"""
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


class TestDivineShieldMechanics:
    """测试圣盾机制"""

    def test_divine_shield_blocks_damage(self):
        """圣盾可以阻挡一次伤害"""
        # 添加测试卡牌到数据库
        setup_test_card("DEFENDER_DS", "防御者", 1, 2)
        setup_test_card("ATTACKER_DS", "攻击者", 2, 2)

        # 创建带圣盾的防御者
        defender = Minion(
            card_id="DEFENDER_DS",
            attack=1,
            health=2,
            max_health=2,
            attributes=frozenset({Attribute.DIVINE_SHIELD}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        # 创建攻击者
        attacker = Minion(
            card_id="ATTACKER_DS",
            attack=2,
            health=2,
            max_health=2,
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

        # 验证防御者仍然存活（圣盾阻挡了伤害）
        assert len(new_game.players[1].board) == 1
        new_defender = new_game.players[1].board[0]
        # 没有受到伤害
        assert new_defender.damage_taken == 0
        # 圣盾已被移除
        assert Attribute.DIVINE_SHIELD not in new_defender.attributes

    def test_divine_shield_removed_after_blocking(self):
        """圣盾阻挡伤害后应该被移除"""
        setup_test_card("DEFENDER_DS2", "防御者2", 1, 2)
        setup_test_card("ATTACKER_DS2", "攻击者2", 2, 2)

        defender = Minion(
            card_id="DEFENDER_DS2",
            attack=1,
            health=2,
            max_health=2,
            attributes=frozenset({Attribute.DIVINE_SHIELD}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        attacker = Minion(
            card_id="ATTACKER_DS2",
            attack=2,  # 2点攻击，第一次被圣盾阻挡，第二次能击杀
            health=2,
            max_health=2,
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

        # 第一次攻击
        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.board(1, 0)
        )
        new_game = GameLogic.apply_action(game, action)

        # 重置攻击者的疲劳状态，允许第二次攻击
        players = list(new_game.players)
        player0 = players[0]
        new_board = tuple(replace(m, exhausted=False) for m in player0.board)
        player0 = replace(player0, board=new_board, attacks_this_turn=tuple())
        players[0] = player0
        new_game = replace(new_game, players=tuple(players))

        # 第二次攻击 - 这次应该造成伤害
        new_game = GameLogic.apply_action(new_game, action)

        # 验证防御者受到伤害（2点伤害超过2点生命值，应该死亡）
        assert len(new_game.players[1].board) == 0
        # 验证进入墓地
        assert len(new_game.players[1].graveyard) == 1

    def test_attacker_divine_shield_blocks_counter_damage(self):
        """攻击者的圣盾可以阻挡反击伤害"""
        setup_test_card("ATTACKER_DS3", "攻击者3", 2, 1)
        setup_test_card("DEFENDER_DS3", "防御者3", 5, 5)

        # 创建带圣盾的攻击者
        attacker = Minion(
            card_id="ATTACKER_DS3",
            attack=2,
            health=1,
            max_health=1,
            attributes=frozenset({Attribute.DIVINE_SHIELD}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        # 创建有反击伤害的防御者
        defender = Minion(
            card_id="DEFENDER_DS3",
            attack=5,
            health=5,
            max_health=5,
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

        # 验证攻击者仍然存活（圣盾阻挡了反击伤害）
        assert len(new_game.players[0].board) == 1
        new_attacker = new_game.players[0].board[0]
        # 没有受到伤害
        assert new_attacker.damage_taken == 0
        # 圣盾已被移除
        assert Attribute.DIVINE_SHIELD not in new_attacker.attributes

    def test_both_minions_have_divine_shield(self):
        """双方都有圣盾时，双方都不受伤害"""
        setup_test_card("ATTACKER_DS4", "攻击者4", 2, 1)
        setup_test_card("DEFENDER_DS4", "防御者4", 5, 5)

        attacker = Minion(
            card_id="ATTACKER_DS4",
            attack=2,
            health=1,
            max_health=1,
            attributes=frozenset({Attribute.DIVINE_SHIELD}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        defender = Minion(
            card_id="DEFENDER_DS4",
            attack=5,
            health=5,
            max_health=5,
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

        # 双方随从都存活
        assert len(new_game.players[0].board) == 1
        assert len(new_game.players[1].board) == 1

        new_attacker = new_game.players[0].board[0]
        new_defender = new_game.players[1].board[0]

        # 双方都没有受到伤害
        assert new_attacker.damage_taken == 0
        assert new_defender.damage_taken == 0

        # 双方的圣盾都已被移除
        assert Attribute.DIVINE_SHIELD not in new_attacker.attributes
        assert Attribute.DIVINE_SHIELD not in new_defender.attributes

    def test_no_divine_shield_normal_damage(self):
        """没有圣盾时，伤害正常应用"""
        setup_test_card("DEFENDER_DS5", "防御者5", 1, 2)
        setup_test_card("ATTACKER_DS5", "攻击者5", 2, 2)

        defender = Minion(
            card_id="DEFENDER_DS5",
            attack=1,
            health=2,
            max_health=2,
            attributes=frozenset(),  # 无圣盾
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        attacker = Minion(
            card_id="ATTACKER_DS5",
            attack=2,
            health=2,
            max_health=2,
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

        # 验证防御者受到伤害并死亡（2攻 > 2血）
        assert len(new_game.players[1].board) == 0
        assert len(new_game.players[1].graveyard) == 1
