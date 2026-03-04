"""测试目标选择系统"""
import pytest
from dataclasses import replace

from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute
)
from hearthstone_cli.engine.actions import AttackAction, TargetReference, PlayCardAction
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.data import CardData, CardType, Rarity


def create_test_card_with_target(card_id: str, name: str, cost: int, text: str, card_type: CardType = CardType.SPELL):
    """创建需要目标的测试卡牌"""
    db = CardDatabase()
    db.add_card(CardData(
        card_id=card_id,
        name=name,
        cost=cost,
        card_type=card_type,
        rarity=Rarity.COMMON,
        text=text
    ))


class TestTargetSelection:
    """测试目标选择机制"""

    def test_spell_damage_to_target(self):
        """法术可以对指定目标造成伤害"""
        create_test_card_with_target(
            "FIREBALL",
            "火球术",
            4,
            "造成6点伤害。",
            CardType.SPELL
        )
        # 添加目标随从到数据库
        db = CardDatabase()
        db.add_card(CardData(
            card_id="TARGET",
            name="目标随从",
            cost=1,
            card_type=CardType.MINION,
            rarity=Rarity.COMMON,
            attack=2,
            health=5,
            text=""
        ))

        # 创建敌方随从
        enemy_minion = Minion(
            card_id="TARGET",
            attack=2,
            health=5,
            max_health=5,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        # 创建火球术卡牌
        db = CardDatabase()
        fireball = db.get_card("FIREBALL")

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=(fireball,),
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

        # 对敌方随从施放火球术
        target = TargetReference.board(1, 0)  # 敌方玩家1的0号随从
        action = PlayCardAction(
            player=0,
            card_index=0,
            target=target,
            board_position=0
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证随从受到6点伤害（生命值5，所以死亡）
        # 由于6点伤害超过5点生命值，随从死亡进入墓地
        assert len(new_game.players[1].board) == 0
        assert len(new_game.players[1].graveyard) == 1

    def test_spell_damage_to_hero(self):
        """法术可以对英雄造成伤害"""
        create_test_card_with_target(
            "FIREBALL_HERO",
            "火球术(英雄)",
            4,
            "造成6点伤害。",
            CardType.SPELL
        )

        db = CardDatabase()
        fireball = db.get_card("FIREBALL_HERO")

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=(fireball,),
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

        # 对敌方英雄施放火球术
        target = TargetReference.hero(1)  # 敌方英雄
        action = PlayCardAction(
            player=0,
            card_index=0,
            target=target,
            board_position=0
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证英雄受到伤害
        assert new_game.players[1].hero.health == 24  # 30 - 6 = 24

    def test_battlecry_with_target(self):
        """战吼效果可以对指定目标造成伤害"""
        create_test_card_with_target(
            "ELVEN_ARCHER",
            "精灵弓箭手",
            1,
            "<b>战吼：</b>对一个敌方随从造成1点伤害。",
            CardType.MINION
        )

        # 添加精灵弓箭手到数据库（需要攻击力/生命值）
        db = CardDatabase()
        db.add_card(CardData(
            card_id="ELVEN_ARCHER_STATS",
            name="精灵弓箭手",
            cost=1,
            card_type=CardType.MINION,
            rarity=Rarity.COMMON,
            attack=1,
            health=1,
            text="<b>战吼：</b>对一个敌方随从造成1点伤害。"
        ))

        # 创建敌方随从
        enemy_minion = Minion(
            card_id="TARGET",
            attack=2,
            health=5,
            max_health=5,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        archer = db.get_card("ELVEN_ARCHER_STATS")

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=(archer,),
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

        # 打出精灵弓箭手，战吼目标敌方随从
        target = TargetReference.board(1, 0)
        action = PlayCardAction(
            player=0,
            card_index=0,
            target=target,
            board_position=0
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证精灵弓箭手在场上
        assert len(new_game.players[0].board) == 1
        # 验证敌方随从受到伤害
        assert len(new_game.players[1].board) == 1
        damaged_minion = new_game.players[1].board[0]
        assert damaged_minion.damage_taken == 1

    def test_get_valid_targets_for_spell(self):
        """获取法术的有效目标列表"""
        create_test_card_with_target(
            "SINGLE_TARGET_SPELL",
            "单体法术",
            2,
            "对一个敌方随从造成2点伤害。",
            CardType.SPELL
        )

        db = CardDatabase()
        spell = db.get_card("SINGLE_TARGET_SPELL")

        # 创建两个敌方随从
        enemy_minion1 = Minion(
            card_id="M1", attack=1, health=2, max_health=2,
            attributes=frozenset(), enchantments=(), damage_taken=0,
            summoned_this_turn=False, exhausted=False,
        )
        enemy_minion2 = Minion(
            card_id="M2", attack=2, health=3, max_health=3,
            attributes=frozenset(), enchantments=(), damage_taken=0,
            summoned_this_turn=False, exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=(spell,),
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
            board=(enemy_minion1, enemy_minion2),
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

        # 获取有效目标
        targets = GameLogic._get_valid_targets(game, 0, spell)

        # 应该有两个目标（两个敌方随从）
        assert len(targets) == 2
        # 目标应该是敌方随从
        assert all(t.player == 1 for t in targets)
        assert all(t.zone.name == "BOARD" for t in targets)

    def test_aoe_damage_to_all_enemies(self):
        """AOE法术对所有敌人造成伤害"""
        create_test_card_with_target(
            "ARCANE_EXPLOSION",
            "魔爆术",
            2,
            "对所有敌方随从造成1点伤害。",
            CardType.SPELL
        )
        # 添加目标随从到数据库
        db = CardDatabase()
        db.add_card(CardData(
            card_id="M1", name="随从1", cost=1, card_type=CardType.MINION,
            rarity=Rarity.COMMON, attack=1, health=2, text=""
        ))
        db.add_card(CardData(
            card_id="M2", name="随从2", cost=2, card_type=CardType.MINION,
            rarity=Rarity.COMMON, attack=2, health=3, text=""
        ))

        aoe_spell = db.get_card("ARCANE_EXPLOSION")

        # 创建多个敌方随从
        enemy_minion1 = Minion(
            card_id="M1", attack=1, health=2, max_health=2,
            attributes=frozenset(), enchantments=(), damage_taken=0,
            summoned_this_turn=False, exhausted=False,
        )
        enemy_minion2 = Minion(
            card_id="M2", attack=2, health=3, max_health=3,
            attributes=frozenset(), enchantments=(), damage_taken=0,
            summoned_this_turn=False, exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=(aoe_spell,),
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
            board=(enemy_minion1, enemy_minion2),
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

        # 施放AOE法术（不需要目标）
        action = PlayCardAction(
            player=0,
            card_index=0,
            target=None,
            board_position=0
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证所有敌方随从都受到伤害
        assert len(new_game.players[1].board) == 2
        for minion in new_game.players[1].board:
            assert minion.damage_taken == 1

    def test_destroy_target(self):
        """消灭指定目标"""
        create_test_card_with_target(
            "ASSASSINATE",
            "刺杀",
            5,
            "消灭一个敌方随从。",
            CardType.SPELL
        )

        db = CardDatabase()
        db.add_card(CardData(
            card_id="TARGET_DESTROY", name="大随从", cost=8, card_type=CardType.MINION,
            rarity=Rarity.COMMON, attack=8, health=8, text=""
        ))
        destroy_spell = db.get_card("ASSASSINATE")

        # 创建敌方随从
        enemy_minion = Minion(
            card_id="TARGET_DESTROY",
            attack=8, health=8, max_health=8,
            attributes=frozenset(), enchantments=(), damage_taken=0,
            summoned_this_turn=False, exhausted=False,
        )

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=(destroy_spell,),
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

        # 使用消灭法术
        target = TargetReference.board(1, 0)
        action = PlayCardAction(
            player=0,
            card_index=0,
            target=target,
            board_position=0
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证随从被消灭
        assert len(new_game.players[1].board) == 0
        assert len(new_game.players[1].graveyard) == 1
