"""卡牌效果定义模块"""
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class DamageEffect:
    """伤害效果"""
    amount: int
    target_selector: str
    is_spell_damage: bool = False


@dataclass(frozen=True)
class DrawEffect:
    """抽牌效果"""
    count: int
    target_player: str


@dataclass(frozen=True)
class SummonEffect:
    """召唤效果"""
    card_id: str
    count: int = 1
    position: str = "random"


@dataclass(frozen=True)
class BuffEffect:
    """增益效果"""
    attack_delta: int = 0
    health_delta: int = 0
    target_selector: str = "self"
    one_turn: bool = False


@dataclass(frozen=True)
class HealEffect:
    """治疗效果"""
    amount: int
    target_selector: str


@dataclass(frozen=True)
class DestroyEffect:
    """消灭效果"""
    target_selector: str


@dataclass(frozen=True)
class GainArmorEffect:
    """获得护甲效果"""
    amount: int


@dataclass(frozen=True)
class GainManaEffect:
    """获得法力水晶效果"""
    amount: int
    empty: bool = False


@dataclass(frozen=True)
class EquipWeaponEffect:
    """装备武器效果"""
    card_id: str
