"""卡牌系统测试"""
import pytest

from hearthstone_cli.cards.data import CardData, CardType, Rarity, Class
from hearthstone_cli.cards.effects import (
    DamageEffect,
    DrawEffect,
    SummonEffect,
    BuffEffect,
    HealEffect,
    DestroyEffect,
    GainArmorEffect,
    GainManaEffect,
    EquipWeaponEffect,
)
from hearthstone_cli.cards.database import CardDatabase


class TestCardData:
    """卡牌数据测试"""

    def test_card_data_creation(self):
        """可以创建卡牌数据"""
        card = CardData(
            card_id="CS2_106",
            name="Fiery War Axe",
            cost=2,
            card_type=CardType.WEAPON,
            rarity=Rarity.FREE,
            text="",
            player_class=Class.WARRIOR,
            attack=3,
            durability=2,
        )
        assert card.card_id == "CS2_106"
        assert card.name == "Fiery War Axe"
        assert card.cost == 2
        assert card.card_type == CardType.WEAPON
        assert card.rarity == Rarity.FREE
        assert card.player_class == Class.WARRIOR
        assert card.attack == 3
        assert card.durability == 2

    def test_card_data_with_defaults(self):
        """卡牌数据可以使用默认值"""
        card = CardData(
            card_id="CS2_062",
            name="Hellfire",
            cost=4,
            card_type=CardType.SPELL,
            rarity=Rarity.FREE,
        )
        assert card.text == ""
        assert card.player_class == Class.NEUTRAL
        assert card.attack is None
        assert card.health is None
        assert card.durability is None
        assert card.attributes == frozenset()
        assert card.effect is None
        assert card.battlecry is None
        assert card.deathrattle is None

    def test_card_data_immutable(self):
        """卡牌数据是不可变的"""
        card = CardData(
            card_id="CS2_106",
            name="Fiery War Axe",
            cost=2,
            card_type=CardType.WEAPON,
            rarity=Rarity.FREE,
        )
        with pytest.raises(AttributeError):
            card.name = "New Name"


class TestEffects:
    """效果系统测试"""

    def test_damage_effect_properties(self):
        """伤害效果有正确的属性"""
        effect = DamageEffect(
            amount=5,
            target_selector="enemy_hero",
            is_spell_damage=True,
        )
        assert effect.amount == 5
        assert effect.target_selector == "enemy_hero"
        assert effect.is_spell_damage is True

    def test_damage_effect_default_spell_damage(self):
        """伤害效果默认不是法术伤害"""
        effect = DamageEffect(
            amount=3,
            target_selector="target_minion",
        )
        assert effect.is_spell_damage is False

    def test_draw_effect_properties(self):
        """抽牌效果有正确的属性"""
        effect = DrawEffect(
            count=2,
            target_player="self",
        )
        assert effect.count == 2
        assert effect.target_player == "self"

    def test_summon_effect_properties(self):
        """召唤效果有正确的属性"""
        effect = SummonEffect(
            card_id="EX1_116",
            count=2,
            position="right",
        )
        assert effect.card_id == "EX1_116"
        assert effect.count == 2
        assert effect.position == "right"

    def test_summon_effect_defaults(self):
        """召唤效果有正确的默认值"""
        effect = SummonEffect(card_id="EX1_116")
        assert effect.count == 1
        assert effect.position == "random"

    def test_buff_effect_properties(self):
        """增益效果有正确的属性"""
        effect = BuffEffect(
            attack_delta=2,
            health_delta=2,
            target_selector="friendly_minions",
            one_turn=True,
        )
        assert effect.attack_delta == 2
        assert effect.health_delta == 2
        assert effect.target_selector == "friendly_minions"
        assert effect.one_turn is True

    def test_buff_effect_defaults(self):
        """增益效果有正确的默认值"""
        effect = BuffEffect()
        assert effect.attack_delta == 0
        assert effect.health_delta == 0
        assert effect.target_selector == "self"
        assert effect.one_turn is False

    def test_heal_effect_properties(self):
        """治疗效果有正确的属性"""
        effect = HealEffect(
            amount=5,
            target_selector="friendly_hero",
        )
        assert effect.amount == 5
        assert effect.target_selector == "friendly_hero"

    def test_destroy_effect_properties(self):
        """消灭效果有正确的属性"""
        effect = DestroyEffect(target_selector="target_minion")
        assert effect.target_selector == "target_minion"

    def test_gain_armor_effect_properties(self):
        """获得护甲效果有正确的属性"""
        effect = GainArmorEffect(amount=5)
        assert effect.amount == 5

    def test_gain_mana_effect_properties(self):
        """获得法力水晶效果有正确的属性"""
        effect = GainManaEffect(amount=2, empty=True)
        assert effect.amount == 2
        assert effect.empty is True

    def test_gain_mana_effect_default_empty(self):
        """获得法力水晶效果默认不是空的"""
        effect = GainManaEffect(amount=1)
        assert effect.empty is False

    def test_equip_weapon_effect_properties(self):
        """装备武器效果有正确的属性"""
        effect = EquipWeaponEffect(card_id="CS2_106")
        assert effect.card_id == "CS2_106"


class TestCardDatabase:
    """卡牌数据库测试"""

    def setup_method(self):
        """每个测试前重置单例"""
        CardDatabase._instance = None
        CardDatabase._cards = {}

    def test_card_database_singleton(self):
        """卡牌数据库是单例"""
        db1 = CardDatabase()
        db2 = CardDatabase()
        assert db1 is db2

    def test_database_get_card(self):
        """可以从数据库获取卡牌"""
        db = CardDatabase()
        card = CardData(
            card_id="CS2_106",
            name="Fiery War Axe",
            cost=2,
            card_type=CardType.WEAPON,
            rarity=Rarity.FREE,
            player_class=Class.WARRIOR,
            attack=3,
            durability=2,
        )
        db.add_card(card)

        retrieved = db.get_card("CS2_106")
        assert retrieved is not None
        assert retrieved.name == "Fiery War Axe"
        assert retrieved.cost == 2

    def test_database_get_nonexistent_card(self):
        """获取不存在的卡牌返回None"""
        db = CardDatabase()
        result = db.get_card("NONEXISTENT")
        assert result is None

    def test_database_get_all_cards(self):
        """可以获取所有卡牌"""
        db = CardDatabase()
        card1 = CardData(
            card_id="CS2_106",
            name="Fiery War Axe",
            cost=2,
            card_type=CardType.WEAPON,
            rarity=Rarity.FREE,
        )
        card2 = CardData(
            card_id="CS2_062",
            name="Hellfire",
            cost=4,
            card_type=CardType.SPELL,
            rarity=Rarity.FREE,
        )
        db.add_card(card1)
        db.add_card(card2)

        all_cards = db.get_all_cards()
        assert len(all_cards) == 2
        assert "CS2_106" in all_cards
        assert "CS2_062" in all_cards

    def test_database_get_all_cards_returns_copy(self):
        """获取所有卡牌返回的是副本"""
        db = CardDatabase()
        card = CardData(
            card_id="CS2_106",
            name="Fiery War Axe",
            cost=2,
            card_type=CardType.WEAPON,
            rarity=Rarity.FREE,
        )
        db.add_card(card)

        all_cards = db.get_all_cards()
        all_cards["new_key"] = card  # 修改返回的字典

        # 原始数据库不应受影响
        assert len(db.get_all_cards()) == 1
