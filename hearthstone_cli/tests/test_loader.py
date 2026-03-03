"""测试卡牌加载器"""
import pytest
from unittest.mock import patch, MagicMock

from hearthstone_cli.cards.loader import CardLoader
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.data import CardType, Rarity, Class


class TestCardLoader:
    """测试 CardLoader"""

    def test_loader_initialization(self):
        """测试加载器初始化"""
        loader = CardLoader(locale="zhCN")
        assert loader.locale == "zhCN"

    def test_parse_card_minion(self):
        """测试解析随从卡牌"""
        loader = CardLoader()

        raw_card = {
            "id": "CS2_121",
            "name": "Frostwolf Grunt",
            "cost": 2,
            "type": "MINION",
            "attack": 2,
            "health": 2,
            "rarity": "FREE",
            "cardClass": "NEUTRAL",
            "text": "<b>Taunt</b>",
            "mechanics": ["TAUNT"],
        }

        card = loader._parse_card(raw_card)
        assert card is not None
        assert card.card_id == "CS2_121"
        assert card.name == "Frostwolf Grunt"
        assert card.cost == 2
        assert card.attack == 2
        assert card.health == 2
        assert card.card_type == CardType.MINION

    def test_parse_card_spell(self):
        """测试解析法术卡牌"""
        loader = CardLoader()

        raw_card = {
            "id": "CS2_029",
            "name": "Fireball",
            "cost": 4,
            "type": "SPELL",
            "rarity": "FREE",
            "cardClass": "MAGE",
            "text": "Deal $6 damage.",
        }

        card = loader._parse_card(raw_card)
        assert card is not None
        assert card.card_id == "CS2_029"
        assert card.card_type == CardType.SPELL
        assert card.cost == 4

    def test_parse_card_with_mechanics(self):
        """测试解析带有机制的卡牌"""
        loader = CardLoader()

        raw_card = {
            "id": "EX1_116",
            "name": "Leeroy Jenkins",
            "cost": 5,
            "type": "MINION",
            "attack": 6,
            "health": 2,
            "rarity": "LEGENDARY",
            "cardClass": "NEUTRAL",
            "mechanics": ["CHARGE"],
        }

        card = loader._parse_card(raw_card)
        assert card is not None
        from hearthstone_cli.engine.state import Attribute
        assert Attribute.CHARGE in card.attributes

    def test_parse_card_invalid(self):
        """测试解析无效卡牌"""
        loader = CardLoader()

        # 缺少必要字段
        raw_card = {
            "name": "Invalid Card",
            "cost": 1,
        }

        card = loader._parse_card(raw_card)
        assert card is None

    def test_parse_card_hero_skin(self):
        """测试跳过高���皮肤"""
        loader = CardLoader()

        raw_card = {
            "id": "HERO_01",
            "name": "Hero Skin",
            "type": "HERO_SKIN",  # 不是 HERO
        }

        card = loader._parse_card(raw_card)
        assert card is None

    def test_get_standard_sets(self):
        """测试获取标准模式扩展包"""
        loader = CardLoader()
        sets = loader.get_standard_sets()

        assert "CORE" in sets
        assert isinstance(sets, list)
        assert len(sets) > 0


class TestCardDatabaseLoading:
    """测试数据库加载功能"""

    def test_load_from_hearthstonejson(self):
        """测试从 HearthstoneJSON 加载"""
        db = CardDatabase()
        db.clear()

        # Mock CardLoader
        with patch("hearthstone_cli.cards.loader.CardLoader") as MockLoader:
            mock_loader = MagicMock()
            mock_loader.get_standard_sets.return_value = ["CORE"]
            mock_loader.load_cards.return_value = {
                "TEST_001": MagicMock(card_id="TEST_001"),
                "TEST_002": MagicMock(card_id="TEST_002"),
            }
            MockLoader.return_value = mock_loader

            count = db.load_from_hearthstonejson(
                locale="zhCN",
                sets=["CORE"],
                card_types=["MINION"],
            )

            assert count == 2
            assert len(db) == 2

    def test_clear_database(self):
        """测试清空数据库"""
        db = CardDatabase()
        db.add_card(MagicMock(card_id="TEST"))

        assert len(db) > 0
        db.clear()
        assert len(db) == 0

    def test_get_cards_by_type(self):
        """测试按类型获取卡牌"""
        db = CardDatabase()
        db.clear()

        from hearthstone_cli.cards.data import CardData

        db.add_card(CardData(
            card_id="MINION_001",
            name="Test Minion",
            cost=1,
            card_type=CardType.MINION,
            rarity=Rarity.COMMON,
        ))
        db.add_card(CardData(
            card_id="SPELL_001",
            name="Test Spell",
            cost=1,
            card_type=CardType.SPELL,
            rarity=Rarity.COMMON,
        ))

        minions = db.get_cards_by_type("MINION")
        assert len(minions) == 1
        assert minions[0].card_id == "MINION_001"

    def test_get_cards_by_cost(self):
        """测试按费用获取卡牌"""
        db = CardDatabase()
        db.clear()

        from hearthstone_cli.cards.data import CardData

        db.add_card(CardData(
            card_id="CARD_1",
            name="One Cost",
            cost=1,
            card_type=CardType.MINION,
            rarity=Rarity.COMMON,
        ))
        db.add_card(CardData(
            card_id="CARD_2",
            name="Two Cost",
            cost=2,
            card_type=CardType.MINION,
            rarity=Rarity.COMMON,
        ))

        cost_1_cards = db.get_cards_by_cost(1)
        assert len(cost_1_cards) == 1
        assert cost_1_cards[0].card_id == "CARD_1"


class TestEffectParser:
    """测试效果解析器"""

    def test_parse_damage_effect(self):
        """测试解析伤害效果"""
        from hearthstone_cli.cards.parser import EffectParser

        effects = EffectParser.parse_text("造成6点伤害")
        assert len(effects) >= 1

    def test_parse_draw_effect(self):
        """测试解析抽牌效果"""
        from hearthstone_cli.cards.parser import EffectParser

        effects = EffectParser.parse_text("抽2张牌")
        assert len(effects) >= 1

    def test_parse_heal_effect(self):
        """测试解析治疗效果"""
        from hearthstone_cli.cards.parser import EffectParser

        effects = EffectParser.parse_text("恢复3点生命值")
        assert len(effects) >= 1

    def test_clean_html(self):
        """测试清理HTML"""
        from hearthstone_cli.cards.parser import EffectParser

        text = "<b>嘲讽</b>"
        clean = EffectParser._clean_html(text)
        assert "<b>" not in clean

    def test_get_card_description(self):
        """测试获取卡牌描述"""
        from hearthstone_cli.cards.parser import EffectParser

        card_data = {
            "name": "Test Minion",
            "cost": 3,
            "type": "MINION",
            "attack": 4,
            "health": 5,
        }

        desc = EffectParser.get_card_description(card_data)
        assert "3费" in desc
        assert "4/5" in desc
