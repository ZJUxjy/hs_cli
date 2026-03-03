"""卡牌数据库模块"""
from typing import Dict, List, Optional

from hearthstone_cli.cards.data import CardData


class CardDatabase:
    """卡牌数据库（单例模式）"""
    _instance: Optional['CardDatabase'] = None
    _cards: Dict[str, CardData] = {}

    def __new__(cls) -> 'CardDatabase':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._cards = {}
        return cls._instance

    def get_card(self, card_id: str) -> Optional[CardData]:
        """根据卡牌ID获取卡牌数据"""
        return self._cards.get(card_id)

    def add_card(self, card: CardData) -> None:
        """添加卡牌到数据库"""
        self._cards[card.card_id] = card

    def load_from_hearthstonejson(
        self,
        locale: str = "zhCN",
        sets: Optional[List[str]] = None,
        card_types: Optional[List[str]] = None,
        collectible_only: bool = True,
        force_refresh: bool = False,
    ) -> int:
        """从 HearthstoneJSON 加载卡牌数据

        Args:
            locale: 语言区域（zhCN, enUS 等）
            sets: 指定扩展包，None 表示全部
            card_types: 指定卡牌类型（MINION, SPELL, WEAPON），None 表示全部
            collectible_only: 只加载可收集卡牌
            force_refresh: 强制重新下载

        Returns:
            加载的卡牌数量
        """
        from hearthstone_cli.cards.loader import CardLoader

        loader = CardLoader(locale=locale)

        # 如果没有指定扩展包，使用标准模式
        if sets is None:
            sets = loader.get_standard_sets()

        cards = loader.load_cards(
            sets=sets,
            card_types=card_types,
            collectible_only=collectible_only,
        )

        # 添加到数据库
        for card_id, card_data in cards.items():
            self._cards[card_id] = card_data

        return len(cards)

    def load_from_json_file(self, filepath: str) -> int:
        """从本地 JSON 文件加载卡牌数据

        Args:
            filepath: JSON 文件路径

        Returns:
            加载的卡牌数量
        """
        import json
        from hearthstone_cli.cards.loader import CardLoader

        with open(filepath, "r", encoding="utf-8") as f:
            raw_cards = json.load(f)

        loader = CardLoader()
        count = 0

        for card in raw_cards:
            parsed = loader._parse_card(card)
            if parsed:
                self._cards[parsed.card_id] = parsed
                count += 1

        return count

    def get_all_cards(self) -> Dict[str, CardData]:
        """获取所有卡牌数据"""
        return self._cards.copy()

    def get_cards_by_class(self, player_class: str) -> List[CardData]:
        """按职业获取卡牌"""
        return [c for c in self._cards.values() if c.player_class.value == player_class]

    def get_cards_by_type(self, card_type: str) -> List[CardData]:
        """按类型获取卡牌"""
        return [c for c in self._cards.values() if c.card_type.value == card_type]

    def get_cards_by_cost(self, cost: int) -> List[CardData]:
        """按费用获取卡牌"""
        return [c for c in self._cards.values() if c.cost == cost]

    def clear(self) -> None:
        """清空数据库"""
        self._cards.clear()

    def __len__(self) -> int:
        """返回卡牌数量"""
        return len(self._cards)
