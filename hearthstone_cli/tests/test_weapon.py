"""测试武器系统"""
import pytest
from dataclasses import replace

from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute, WeaponState
)
from hearthstone_cli.engine.actions import AttackAction, TargetReference, PlayCardAction
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.data import CardData, CardType, Rarity


def create_weapon_card(card_id: str, name: str, cost: int, attack: int, durability: int):
    """创建武器卡牌"""
    db = CardDatabase()
    db.add_card(CardData(
        card_id=card_id,
        name=name,
        cost=cost,
        card_type=CardType.WEAPON,
        rarity=Rarity.COMMON,
        attack=attack,
        durability=durability,
        text=""
    ))


def create_minion_card(card_id: str, name: str, cost: int, attack: int, health: int):
    """创建随从卡牌"""
    db = CardDatabase()
    db.add_card(CardData(
        card_id=card_id,
        name=name,
        cost=cost,
        card_type=CardType.MINION,
        rarity=Rarity.COMMON,
        attack=attack,
        health=health,
        text=""
    ))


class TestWeaponMechanics:
    """测试武器机制"""

    def test_play_weapon_equips_weapon(self):
        """打出武器牌会装备武器"""
        create_weapon_card("FIERY_WAR_AXE", "炽炎战斧", 2, 3, 2)

        db = CardDatabase()
        weapon_card = db.get_card("FIERY_WAR_AXE")

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=(weapon_card,),
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

        # 验证初始没有武器
        assert game.players[0].hero.weapon is None

        # 打出武器
        action = PlayCardAction(
            player=0,
            card_index=0,
            target=None,
            board_position=0
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证武器已装备
        assert new_game.players[0].hero.weapon is not None
        assert new_game.players[0].hero.weapon.card_id == "FIERY_WAR_AXE"
        assert new_game.players[0].hero.weapon.attack == 3
        assert new_game.players[0].hero.weapon.durability == 2

    def test_hero_attack_with_weapon(self):
        """英雄使用武器攻击敌方英雄"""
        # 创建装备武器的玩家状态
        weapon = WeaponState(
            card_id="FIERY_WAR_AXE",
            attack=3,
            durability=2,
            max_durability=2,
            attributes=frozenset()
        )

        player0 = PlayerState(
            hero=HeroState(health=30, weapon=weapon),
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

        # 英雄攻击敌方英雄
        action = AttackAction(
            player=0,
            attacker=TargetReference.hero(0),  # 英雄作为攻击者
            defender=TargetReference.hero(1)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证敌方英雄受到伤害
        assert new_game.players[1].hero.health == 27  # 30 - 3 = 27
        # 验证武器耐久度减少
        assert new_game.players[0].hero.weapon.durability == 1

    def test_weapon_destroyed_when_durability_zero(self):
        """武器耐久度为0时被摧毁"""
        # 创建耐久度为1的武器
        weapon = WeaponState(
            card_id="FIERY_WAR_AXE",
            attack=3,
            durability=1,
            max_durability=2,
            attributes=frozenset()
        )

        player0 = PlayerState(
            hero=HeroState(health=30, weapon=weapon),
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

        # 英雄攻击
        action = AttackAction(
            player=0,
            attacker=TargetReference.hero(0),
            defender=TargetReference.hero(1)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证武器已被摧毁（耐久度为0，武器被移除）
        assert new_game.players[0].hero.weapon is None

    def test_hero_attack_minion_with_weapon(self):
        """英雄使用武器攻击敌方随从"""
        # 创建武器
        weapon = WeaponState(
            card_id="FIERY_WAR_AXE",
            attack=3,
            durability=2,
            max_durability=2,
            attributes=frozenset()
        )

        # 创建敌方随从
        enemy_minion = Minion(
            card_id="ENEMY",
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
            hero=HeroState(health=30, weapon=weapon),
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

        # 英雄攻击敌方随从
        action = AttackAction(
            player=0,
            attacker=TargetReference.hero(0),
            defender=TargetReference.board(1, 0)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证敌方随从受到伤害
        assert new_game.players[1].board[0].damage_taken == 3
        # 验证英雄受到反击伤害
        assert new_game.players[0].hero.health == 28  # 30 - 2 = 28
        # 验证武器耐久度减少
        assert new_game.players[0].hero.weapon.durability == 1

    def test_weapon_with_lifesteal_heals_hero(self):
        """吸血武器攻击时治疗英雄"""
        # 创建带吸血的武器
        weapon = WeaponState(
            card_id="LIFESTEAL_WEAPON",
            attack=3,
            durability=2,
            max_durability=2,
            attributes=frozenset({Attribute.LIFESTEAL})
        )

        player0 = PlayerState(
            hero=HeroState(health=20),  # 英雄受伤状态
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=tuple(),
            secrets=frozenset(),
            graveyard=tuple(),
            attacks_this_turn=tuple(),
            hero_power_used=False,
        )
        # 装备武器
        player0 = replace(player0, hero=replace(player0.hero, weapon=weapon))

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

        # 英雄攻击
        action = AttackAction(
            player=0,
            attacker=TargetReference.hero(0),
            defender=TargetReference.hero(1)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证英雄受到治疗（20 + 3 = 23）
        assert new_game.players[0].hero.health == 23

    def test_equip_new_weapon_replaces_old(self):
        """装备新武器会替换旧武器"""
        create_weapon_card("WEAPON_1", "武器1", 2, 2, 2)
        create_weapon_card("WEAPON_2", "武器2", 3, 4, 3)

        db = CardDatabase()
        old_weapon = db.get_card("WEAPON_1")
        new_weapon = db.get_card("WEAPON_2")

        # 玩家已装备武器1
        existing_weapon = WeaponState(
            card_id="WEAPON_1",
            attack=2,
            durability=2,
            max_durability=2,
            attributes=frozenset()
        )

        player0 = PlayerState(
            hero=HeroState(health=30, weapon=existing_weapon),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=(new_weapon,),
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

        # 打出武器2
        action = PlayCardAction(
            player=0,
            card_index=0,
            target=None,
            board_position=0
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证旧武器被替换
        assert new_game.players[0].hero.weapon.card_id == "WEAPON_2"
        assert new_game.players[0].hero.weapon.attack == 4
        assert new_game.players[0].hero.weapon.durability == 3

    def test_no_weapon_cannot_attack(self):
        """没有武器时英雄不能攻击"""
        player0 = PlayerState(
            hero=HeroState(health=30, weapon=None),
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
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]

        # 验证没有攻击动作（因为没有武器）
        assert len(attack_actions) == 0

    def test_weapon_attack_available_in_legal_actions(self):
        """装备武器后，英雄攻击出现在合法动作中"""
        # 创建带武器的玩家
        weapon = WeaponState(
            card_id="FIERY_WAR_AXE",
            attack=3,
            durability=2,
            max_durability=2,
            attributes=frozenset()
        )

        player0 = PlayerState(
            hero=HeroState(health=30, weapon=weapon),
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
        attack_actions = [a for a in actions if isinstance(a, AttackAction)]

        # 验证有英雄攻击动作
        assert len(attack_actions) == 1
        assert attack_actions[0].attacker.zone.name == "HERO"
        assert attack_actions[0].defender.zone.name == "HERO"

    def test_weapon_attack_with_taunt_on_board(self):
        """对方场上有嘲讽随从时，武器攻击必须先打嘲讽"""
        weapon = WeaponState(
            card_id="FIERY_WAR_AXE",
            attack=3,
            durability=2,
            max_durability=2,
            attributes=frozenset()
        )

        # 创建嘲讽随从
        taunt_minion = Minion(
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
            hero=HeroState(health=30, weapon=weapon),
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
            board=(taunt_minion,),
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
        assert len(attack_actions) == 1
        assert attack_actions[0].defender.zone.name == "BOARD"

    def test_weapon_attack_with_divine_shield(self):
        """武器攻击带圣盾的随从"""
        weapon = WeaponState(
            card_id="FIERY_WAR_AXE",
            attack=3,
            durability=2,
            max_durability=2,
            attributes=frozenset()
        )

        # 创建带圣盾的随从
        divine_minion = Minion(
            card_id="DIVINE",
            attack=2,
            health=5,
            max_health=5,
            attributes=frozenset({Attribute.DIVINE_SHIELD}),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=30, weapon=weapon),
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
            board=(divine_minion,),
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

        # 英雄攻击带圣盾的随从
        action = AttackAction(
            player=0,
            attacker=TargetReference.hero(0),
            defender=TargetReference.board(1, 0)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证圣盾被移除
        assert Attribute.DIVINE_SHIELD not in new_game.players[1].board[0].attributes
        # 验证随从没有受到伤害（圣盾阻挡）
        assert new_game.players[1].board[0].damage_taken == 0
        # 验证英雄受到反击伤害
        assert new_game.players[0].hero.health == 28  # 30 - 2 = 28
        # 验证武器耐久度减少
        assert new_game.players[0].hero.weapon.durability == 1

