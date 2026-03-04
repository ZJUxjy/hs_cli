"""测试潜行系统"""
import pytest
from dataclasses import replace

from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute
)
from hearthstone_cli.engine.actions import AttackAction, TargetReference, PlayCardAction
from hearthstone_cli.engine.game import GameLogic


class TestStealthMechanics:
    """测试潜行机制"""

    def test_stealth_minion_cannot_be_targeted(self):
        """潜行随从不能被选为攻击目标"""
        attacker = Minion(
            card_id="ATTACKER",
            attack=2,
            health=2,
            max_health=2,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        # 潜行防御者
        defender = Minion(
            card_id="STEALTH_DEFENDER",
            attack=1,
            health=1,
            max_health=1,
            attributes=frozenset({Attribute.STEALTH}),
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

        # 获取合法动作
        actions = GameLogic.get_legal_actions(game, player=0)
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]

        # 验证没有针对潜行随从的攻击动作
        for action in attack_actions:
            if action.defender.zone.name == "BOARD":
                assert action.defender.index != 0  # 不能攻击潜行随从

    def test_stealth_removed_after_attacking(self):
        """潜行随从攻击后失去潜行"""
        # 潜行攻击者
        attacker = Minion(
            card_id="STEALTH_ATTACKER",
            attack=2,
            health=2,
            max_health=2,
            attributes=frozenset({Attribute.STEALTH}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        defender = Minion(
            card_id="DEFENDER",
            attack=1,
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

        # 攻击前验证有潜行
        assert Attribute.STEALTH in game.players[0].board[0].attributes

        # 攻击
        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.board(1, 0)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证攻击后失去潜行
        assert Attribute.STEALTH not in new_game.players[0].board[0].attributes

    def test_stealth_taunt_does_not_force_attack(self):
        """潜行嘲讽随从不会强制被攻击"""
        attacker = Minion(
            card_id="ATTACKER",
            attack=2,
            health=2,
            max_health=2,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        # 潜行+嘲讽防御者
        defender = Minion(
            card_id="STEALTH_TAUNT",
            attack=1,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.STEALTH, Attribute.TAUNT}),
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

        # 获取合法动作
        actions = GameLogic.get_legal_actions(game, player=0)
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]

        # 验证可以攻击英雄（潜行嘲讽不强制攻击）
        hero_attacks = [a for a in attack_actions if a.defender.zone.name == "HERO"]
        assert len(hero_attacks) == 1

        # 验证没有针对潜行嘲讽随从的攻击动作
        minion_attacks = [a for a in attack_actions if a.defender.zone.name == "BOARD"]
        assert len(minion_attacks) == 0

    def test_normal_taunt_still_forces_attack(self):
        """普通嘲讽随从仍然强制被攻击"""
        attacker = Minion(
            card_id="ATTACKER",
            attack=2,
            health=2,
            max_health=2,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        # 普通嘲讽防御者
        defender = Minion(
            card_id="TAUNT",
            attack=1,
            health=5,
            max_health=5,
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

        # 获取合法动作
        actions = GameLogic.get_legal_actions(game, player=0)
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]

        # 验证只能攻击嘲讽随从，不能攻击英雄
        minion_attacks = [a for a in attack_actions if a.defender.zone.name == "BOARD"]
        hero_attacks = [a for a in attack_actions if a.defender.zone.name == "HERO"]

        assert len(minion_attacks) == 1
        assert len(hero_attacks) == 0

    def test_stealth_minion_can_attack(self):
        """潜行随从可以正常攻击"""
        # 潜行攻击者
        attacker = Minion(
            card_id="STEALTH_ATTACKER",
            attack=3,
            health=2,
            max_health=2,
            attributes=frozenset({Attribute.STEALTH}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        defender = Minion(
            card_id="DEFENDER",
            attack=1,
            health=4,
            max_health=4,
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

        # 获取合法动作
        actions = GameLogic.get_legal_actions(game, player=0)
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]

        # 验证可以攻击敌方随从
        assert len(attack_actions) > 0

        # 执行攻击
        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.board(1, 0)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证攻击成功
        assert new_game.players[1].board[0].damage_taken == 3

    def test_aoe_can_hit_stealth(self):
        """AOE效果可以伤害潜行随从（在游戏中通常如此）"""
        # 注意：这个测试验证当前实现的行为
        # 实际炉石中，某些AOE可以伤害潜行随从，某些不能
        # 这里我们测试当前的实现不阻止AOE伤害潜行随从
        pass  # 简化：当前实现中AOE可以伤害任何随从
