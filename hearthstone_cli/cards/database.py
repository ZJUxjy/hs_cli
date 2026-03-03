"""卡牌数据库模块"""
from typing import Dict, Optional

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

    def load_from_hearthstonejson(self, path: Optional[str] = None) -> None:
        """从hearthstonejson加载卡牌数据（后续实现）"""
        pass  # 后续实现

    def get_all_cards(self) -> Dict[str, CardData]:
        """获取所有卡牌数据"""
        return self._cards.copy()
