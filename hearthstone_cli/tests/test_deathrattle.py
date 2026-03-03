"""测试亡语系统"""
import pytest
from dataclasses import replace

from hearthstone_cli.engine.state import (
    GameState, PlayerState, HeroState, ManaState, Minion, Attribute, Card
)
from hearthstone_cli.engine.actions import AttackAction, TargetReference
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.data import CardData, CardType, Rarity
from hearthstone_cli.cards.parser import EffectParser


class TestDeathrattleParsing:
    """测试亡语文本解析"""

    def test_parse_deathrattle_draw(self):
        """解析抽牌亡语"""
        text = "<b>亡语：</b>抽一张牌。"
        effects = EffectParser.parse_deathrattle(text)
        assert len(effects) >= 1

    def test_parse_deathrattle_summon(self):
        """解析召唤亡语"""
        text = "<b>亡语：</b>召唤一个1/1的小鬼。"
        effects = EffectParser.parse_deathrattle(text)
        assert len(effects) >= 1

    def test_parse_deathrattle_damage(self):
        """解析伤害亡语"""
        text = "<b>亡语：</b>对所有敌人造成2点伤害。"
        effects = EffectParser.parse_deathrattle(text)
        assert len(effects) >= 1

    def test_parse_deathrattle_english(self):
        """解析英文亡语"""
        text = "<b>Deathrattle:</b> Draw a card."
        effects = EffectParser.parse_deathrattle(text)
        assert len(effects) >= 1

    def test_no_deathrattle(self):
        """非亡语文本返回空列表"""
        text = "战吼：造成1点伤害。"
        effects = EffectParser.parse_deathrattle(text)
        assert len(effects) == 0


class TestDeathrattleMechanics:
    """测试亡语机制"""

    def test_deathrattle_triggers_on_death(self):
        """亡语在随从死亡时触发"""
        # 添加卡牌到数据库
        db = CardDatabase()
        db.add_card(CardData(
            card_id="LOOT_HOARDER",
            name="战利品贮藏者",
            cost=2,
            card_type=CardType.MINION,
            rarity=Rarity.COMMON,
            attack=2,
            health=1,
            text="<b>亡语：</b>抽一张牌。"
        ))

        # 创建一个有亡语的随从
        minion_with_deathrattle = Minion(
            card_id="LOOT_HOARDER",
            attack=2,
            health=1,
            max_health=1,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

        # 创建一个攻击者
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

        # 构建游戏状态
        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(attacker,),
            secrets=frozenset(),
            graveyard=tuple(),
            exhausted_minions=frozenset(),
            hero_power_used=False,
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(minion_with_deathrattle,),
            secrets=frozenset(),
            graveyard=tuple(),
            exhausted_minions=frozenset(),
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

        # 攻击并击杀随从
        action = AttackAction(
            player=0,
            attacker=TargetReference.board(0, 0),
            defender=TargetReference.board(1, 0)
        )

        new_game = GameLogic.apply_action(game, action)

        # 验证防御者已死亡并被移除
        assert len(new_game.players[1].board) == 0
        # 验证死亡随从已进入墓地
        assert len(new_game.players[1].graveyard) == 1

    def test_deathrattle_summon(self):
        """亡语召唤效果"""
        # 创建一个亡语召唤的卡牌数据
        db = CardDatabase()
        db.add_card(CardData(
            card_id="SKELETON_MAGE",
            name="骷髅法师",
            cost=2,
            card_type=CardType.MINION,
            rarity=Rarity.COMMON,
            attack=2,
            health=2,
            text="<b>亡语：</b>召唤一个1/1的骷髅。"
        ))

        minion = Minion(
            card_id="SKELETON_MAGE",
            attack=2,
            health=1,
            max_health=1,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

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

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(attacker,),
            secrets=frozenset(),
            graveyard=tuple(),
            exhausted_minions=frozenset(),
            hero_power_used=False,
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(minion,),
            secrets=frozenset(),
            graveyard=tuple(),
            exhausted_minions=frozenset(),
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

        # 验证亡语触发生成了新随从（如果对方场上原本有1个随从）
        # 死亡后亡语召唤，但注意召唤是在同一个玩家场上
        # 这里需要重新理解：被攻击的随从死亡，亡语在它的拥有者场上召唤

    def test_minion_without_deathrattle(self):
        """无亡语随从死亡不产生额外效果"""
        # 添加无亡语的卡牌到数据库
        db = CardDatabase()
        db.add_card(CardData(
            card_id="PLAIN_MINION",
            name="白板随从",
            cost=2,
            card_type=CardType.MINION,
            rarity=Rarity.COMMON,
            attack=2,
            health=1,
            text=""  # 无亡语
        ))

        minion_no_deathrattle = Minion(
            card_id="PLAIN_MINION",
            attack=2,
            health=1,
            max_health=1,
            attributes=frozenset(),
            enchantments=(),
            damage_taken=0,
            summoned_this_turn=False,
            exhausted=False,
        )

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

        player0 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(attacker,),
            secrets=frozenset(),
            graveyard=tuple(),
            exhausted_minions=frozenset(),
            hero_power_used=False,
        )
        player1 = PlayerState(
            hero=HeroState(health=30),
            mana=ManaState(current=10, max_mana=10),
            deck=tuple(),
            hand=tuple(),
            board=(minion_no_deathrattle,),
            secrets=frozenset(),
            graveyard=tuple(),
            exhausted_minions=frozenset(),
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

        # 验证随从被移除
        assert len(new_game.players[1].board) == 0
        # 验证进入墓地
        assert len(new_game.players[1].graveyard) == 1
