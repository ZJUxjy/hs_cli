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


@dataclass(frozen=True)
class AuraEffect:
    """光环效果 - 持续为其他随从提供增益"""
    attack_bonus: int = 0
    health_bonus: int = 0
    target_selector: str = "other_minions"  # other_minions, adjacent_minions, all_minions, etc.
    include_self: bool = False  # 是否包括自己


@dataclass(frozen=True)
class OverloadEffect:
    """过载效果 - 下回合锁定法力水晶"""
    amount: int = 0


@dataclass(frozen=True)
class ComboEffect:
    """连击效果 - 本回合打出过其他牌后触发"""
    base_effect: Optional[object] = None  # 基础效果（未触发连击时）
    combo_effect: Optional[object] = None  # 连击效果（触发连击时）


@dataclass(frozen=True)
class DiscoverEffect:
    """发现效果 - 三选一机制"""
    card_type: str = "any"  # 卡牌类型限制: any, minion, spell, weapon
    card_class: str = "any"  # 职业限制: any, neutral, 或特定职业
    cost_range: tuple = (0, 10)  # 费用范围 (min, max)
