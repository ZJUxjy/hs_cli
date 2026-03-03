"""Action definitions for Hearthstone CLI game."""

from dataclasses import dataclass
from enum import Enum, auto
from typing import Optional


class Zone(Enum):
    """游戏区域"""
    DECK = auto()
    HAND = auto()
    BOARD = auto()
    GRAVEYARD = auto()
    HERO = auto()
    WEAPON = auto()
    HERO_POWER = auto()


@dataclass(frozen=True)
class TargetReference:
    """指向游戏实体的引用"""
    zone: Zone
    player: int  # 0 或 1
    index: int   # 在zone中的位置

    @classmethod
    def hero(cls, player: int) -> "TargetReference":
        return cls(zone=Zone.HERO, player=player, index=0)

    @classmethod
    def board(cls, player: int, index: int) -> "TargetReference":
        return cls(zone=Zone.BOARD, player=player, index=index)

    @classmethod
    def hand(cls, player: int, index: int) -> "TargetReference":
        return cls(zone=Zone.HAND, player=player, index=index)


@dataclass(frozen=True)
class Action:
    """行动基类"""
    player: int


@dataclass(frozen=True)
class PlayCardAction(Action):
    """打出卡牌"""
    card_index: int
    target: Optional[TargetReference]
    board_position: int = 0


@dataclass(frozen=True)
class AttackAction(Action):
    """攻击"""
    attacker: TargetReference
    defender: TargetReference


@dataclass(frozen=True)
class HeroPowerAction(Action):
    """使用英雄技能"""
    target: Optional[TargetReference]


@dataclass(frozen=True)
class EndTurnAction(Action):
    """结束回合"""
    pass
