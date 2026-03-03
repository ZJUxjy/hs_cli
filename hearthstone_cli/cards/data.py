"""卡牌数据定义模块"""
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Optional


class CardType(Enum):
    """卡牌类型枚举"""
    MINION = "MINION"
    SPELL = "SPELL"
    WEAPON = "WEAPON"
    HERO = "HERO"
    HERO_POWER = "HERO_POWER"


class Rarity(Enum):
    """稀有度枚举"""
    FREE = "FREE"
    BASIC = "BASIC"
    COMMON = "COMMON"
    RARE = "RARE"
    EPIC = "EPIC"
    LEGENDARY = "LEGENDARY"


class Class(Enum):
    """职业枚举"""
    NEUTRAL = "NEUTRAL"
    WARRIOR = "WARRIOR"
    SHAMAN = "SHAMAN"
    ROGUE = "ROGUE"
    PALADIN = "PALADIN"
    HUNTER = "HUNTER"
    DRUID = "DRUID"
    WARLOCK = "WARLOCK"
    MAGE = "MAGE"
    PRIEST = "PRIEST"
    DEMONHUNTER = "DEMONHUNTER"


@dataclass(frozen=True)
class CardData:
    """卡牌数据类（不可变）"""
    card_id: str
    name: str
    cost: int
    card_type: CardType
    rarity: Rarity
    text: str = ""
    player_class: Class = Class.NEUTRAL
    attack: Optional[int] = None
    health: Optional[int] = None
    durability: Optional[int] = None
    attributes: frozenset = field(default_factory=frozenset)
    effect: Optional[Any] = None
    battlecry: Optional[Any] = None
    deathrattle: Optional[Any] = None
