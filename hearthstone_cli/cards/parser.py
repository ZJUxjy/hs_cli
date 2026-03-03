"""卡牌效果文本解析器

将 HearthstoneJSON 的文本描述解析为效果对象。
"""
import re
from typing import Optional, List, Any

from hearthstone_cli.cards.effects import (
    DamageEffect,
    DrawEffect,
    SummonEffect,
    BuffEffect,
    HealEffect,
    DestroyEffect,
    GainArmorEffect,
    GainManaEffect,
)


class EffectParser:
    """效果文本解析器

    使用正则表达式匹配常见的效果模式。
    """

    # 中英文效果模式
    PATTERNS = {
        # 伤害效果
        "damage": [
            (r"造成\s*(\d+)\s*点伤害", lambda m: DamageEffect(int(m.group(1)), "target")),
            (r"Deal\s+(\d+)\s+ damage", lambda m: DamageEffect(int(m.group(1)), "target")),
            (r"对所有敌人造成\s*(\d+)\s*点伤害", lambda m: DamageEffect(int(m.group(1)), "all_enemies")),
            (r"Deal\s+(\d+)\s+ damage to all enemies", lambda m: DamageEffect(int(m.group(1)), "all_enemies")),
        ],
        # 抽牌效果
        "draw": [
            (r"抽\s*(\d+)\s*张牌", lambda m: DrawEffect(int(m.group(1)), "friendly")),
            (r"抽一张牌", lambda m: DrawEffect(1, "friendly")),  # 特殊处理"一张"
            (r"Draw\s+(\d+)\s+cards?", lambda m: DrawEffect(int(m.group(1)), "friendly")),
            (r"Draw a card", lambda m: DrawEffect(1, "friendly")),  # 特殊处理"a"
            (r"双方各抽\s*(\d+)\s*张牌", lambda m: DrawEffect(int(m.group(1)), "both")),
        ],
        # 召唤效果
        "summon": [
            (r"召唤\s*(?:一个)?\s*(.+)", lambda m: SummonEffect(m.group(1), 1)),
            (r"Summon\s+(?:a|an)?\s*(.+)", lambda m: SummonEffect(m.group(1), 1)),
            (r"召唤\s*(\d+)\s*个", lambda m: SummonEffect("random", int(m.group(1)))),
        ],
        # 治疗效果
        "heal": [
            (r"恢复\s*(\d+)\s*点生命值", lambda m: HealEffect(int(m.group(1)), "target")),
            (r"Restore\s+(\d+)\s+ Health", lambda m: HealEffect(int(m.group(1)), "target")),
            (r"为英雄恢复\s*(\d+)\s*点生命值", lambda m: HealEffect(int(m.group(1)), "hero")),
        ],
        # 护甲效果
        "armor": [
            (r"获得\s*(\d+)\s*点护甲", lambda m: GainArmorEffect(int(m.group(1)))),
            (r"Gain\s+(\d+)\s+ Armor", lambda m: GainArmorEffect(int(m.group(1)))),
        ],
        # 法力水晶
        "mana": [
            (r"获得一个法力水晶", lambda m: GainManaEffect(1, empty=False)),
            (r"Gain an empty Mana Crystal", lambda m: GainManaEffect(1, empty=True)),
            (r"获得\s*(\d+)\s*个法力水晶", lambda m: GainManaEffect(int(m.group(1)), empty=False)),
        ],
        # 消灭效果
        "destroy": [
            (r"消灭", lambda m: DestroyEffect("target")),
            (r"Destroy", lambda m: DestroyEffect("target")),
        ],
    }

    @classmethod
    def parse_text(cls, text: str) -> List[Any]:
        """解析效果文本

        Args:
            text: 卡牌描述文本（HTML格式）

        Returns:
            效果对象列表
        """
        if not text:
            return []

        # 清理HTML标签
        clean_text = cls._clean_html(text)
        effects = []

        # 尝试匹配每种效果类型
        for effect_type, patterns in cls.PATTERNS.items():
            for pattern, factory in patterns:
                match = re.search(pattern, clean_text, re.IGNORECASE)
                if match:
                    try:
                        effect = factory(match)
                        effects.append(effect)
                    except (ValueError, IndexError):
                        continue

        return effects

    @classmethod
    def parse_battlecry(cls, text: str) -> List[Any]:
        """解析战吼效果"""
        if "战吼" in text or "Battlecry" in text:
            return cls.parse_text(text)
        return []

    @classmethod
    def parse_deathrattle(cls, text: str) -> List[Any]:
        """解析亡语效果

        提取亡语描述部分的效果文本。
        例如："<b>亡语：</b>抽一张牌。" -> 解析 "抽一张牌"
        """
        if not text:
            return []

        clean_text = cls._clean_html(text)

        # 匹配亡语描述（支持中英文）
        # 匹配 "亡语：xxx" 或 "Deathrattle: xxx" 后面的内容
        deathrattle_patterns = [
            r"亡语[：:]\s*(.+?)(?:\.|$)",
            r"Deathrattle[:\s]+(.+?)(?:\.|$)",
        ]

        for pattern in deathrattle_patterns:
            match = re.search(pattern, clean_text, re.IGNORECASE | re.DOTALL)
            if match:
                deathrattle_text = match.group(1).strip()
                return cls.parse_text(deathrattle_text)

        # 如果文本中包含亡语关键词但没有匹配到具体效果，尝试整体解析
        if "亡语" in text or "Deathrattle" in text:
            return cls.parse_text(clean_text)

        return []

    @classmethod
    def _clean_html(cls, text: str) -> str:
        """清理HTML标签"""
        # 移除常见的HTML标签
        text = re.sub(r"<b>|</b>", "", text)
        text = re.sub(r"<i>|</i>", "", text)
        text = re.sub(r"<br\s*/?>", " ", text)
        text = re.sub(r"\$\d+", "", text)  # 移除费用引用
        text = re.sub(r"\[x\]", "", text)  # 移除格式化标记
        return text.strip()

    @classmethod
    def get_card_description(cls, card_data: dict) -> str:
        """获取卡牌的简洁描述"""
        name = card_data.get("name", "Unknown")
        cost = card_data.get("cost", 0)
        card_type = card_data.get("type", "")

        if card_type == "MINION":
            attack = card_data.get("attack", 0)
            health = card_data.get("health", 0)
            return f"[{cost}费] {name} ({attack}/{health})"
        elif card_type == "SPELL":
            return f"[{cost}费] {name} (法术)"
        elif card_type == "WEAPON":
            attack = card_data.get("attack", 0)
            durability = card_data.get("durability", 0)
            return f"[{cost}费] {name} ({attack}/{durability})"
        else:
            return f"[{cost}费] {name}"
