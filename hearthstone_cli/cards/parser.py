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
    AuraEffect,
    OverloadEffect,
)


class EffectParser:
    """效果文本解析器

    使用正则表达式匹配常见的效果模式。
    """

    # 中英文效果模式
    PATTERNS = {
        # 伤害效果
        "damage": [
            # AOE patterns must come before single target patterns
            (r"对所有(?:敌人|敌方|敌方随从)造成\s*(\d+)\s*点伤害", lambda m: DamageEffect(int(m.group(1)), "all_enemies")),
            (r"Deal\s+(\d+)\s+ damage to all (?:enemies|enemy minions)", lambda m: DamageEffect(int(m.group(1)), "all_enemies")),
            (r"造成\s*(\d+)\s*点伤害", lambda m: DamageEffect(int(m.group(1)), "target")),
            (r"Deal\s+(\d+)\s+ damage", lambda m: DamageEffect(int(m.group(1)), "target")),
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
        # 光环效果 - 持续增益其他随从
        "aura": [
            # 暴风城勇士: 你的其他随从获得+1/+1
            (r"你的其他随从获得\+(\d+)/\+(\d+)", lambda m: AuraEffect(attack_bonus=int(m.group(1)), health_bonus=int(m.group(2)), target_selector="other_minions")),
            (r"Your other minions have \+(\d+)/\+(\d+)", lambda m: AuraEffect(attack_bonus=int(m.group(1)), health_bonus=int(m.group(2)), target_selector="other_minions")),
            # 团队领袖: 你的其他随从获得+攻击力
            (r"你的其他随从获得\+(\d+)点攻击力", lambda m: AuraEffect(attack_bonus=int(m.group(1)), health_bonus=0, target_selector="other_minions")),
            (r"Your other minions have \+(\d+) Attack", lambda m: AuraEffect(attack_bonus=int(m.group(1)), health_bonus=0, target_selector="other_minions")),
        ],
        # 过载效果
        "overload": [
            (r"过载：\s*\(?(\d+)\)?", lambda m: OverloadEffect(amount=int(m.group(1)))),
            (r"Overload[：:]?\s*\(?(\d+)\)?", lambda m: OverloadEffect(amount=int(m.group(1)))),
        ],
        # 连击效果 - 在_clean_html之后匹配（无HTML标签）
        "combo": [
            (r"连击[:：](.+?)(?:。|$)", lambda m: m.group(1).strip()),
            (r"Combo[:：]\s*(.+?)(?:\.|$)", lambda m: m.group(1).strip()),
        ],
        # 发现效果 - 在_clean_html之后匹配（无HTML标签）
        "discover": [
            (r"发现一张(?:([^\s]+?)牌|牌)", lambda m: m.group(1).strip() if m.group(1) else ""),
            (r"Discover a (.+?)(?:\s*card)?(?:\.|$)", lambda m: m.group(1).strip()),
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

        # 移除连击和发现文本（这些有专门的解析方法）
        # 移除连击：... 或 Combo: ...
        clean_text = re.sub(r"连击[:：].+?(?:。|$)", "", clean_text, flags=re.IGNORECASE)
        clean_text = re.sub(r"Combo[:：]\s*.+?(?:\.|$)", "", clean_text, flags=re.IGNORECASE)
        # 移除发现... 或 Discover...
        clean_text = re.sub(r"发现.+?(?:。|$)", "", clean_text, flags=re.IGNORECASE)
        clean_text = re.sub(r"Discover\s+.+?(?:\.|$)", "", clean_text, flags=re.IGNORECASE)

        effects = []

        # 尝试匹配每种效果类型
        for effect_type, patterns in cls.PATTERNS.items():
            for pattern, factory in patterns:
                match = re.search(pattern, clean_text, re.IGNORECASE)
                if match:
                    try:
                        effect = factory(match)
                        effects.append(effect)
                        break  # 只匹配第一个模式，避免重复效果
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
    def parse_aura(cls, text: str) -> Optional[AuraEffect]:
        """解析光环效果

        解析持续生效的增益效果，如暴风城勇士的"你的其他随从获得+1/+1"。
        """
        if not text:
            return None

        clean_text = cls._clean_html(text)

        # 检查是否有光环描述
        # 中文：你的其他随从获得...
        # 英文：Your other minions have...
        aura_keywords = [
            r"你的其他随从",
            r"Your other minions",
        ]

        has_aura = any(re.search(kw, clean_text, re.IGNORECASE) for kw in aura_keywords)
        if not has_aura:
            return None

        # 尝试匹配光环模式
        for pattern, factory in cls.PATTERNS.get("aura", []):
            match = re.search(pattern, clean_text, re.IGNORECASE)
            if match:
                try:
                    return factory(match)
                except (ValueError, IndexError):
                    continue

        return None

    @classmethod
    def parse_overload(cls, text: str) -> int:
        """解析过载效果

        解析卡牌描述中的过载数值。
        例如："过载：(2)" 返回 2

        Returns:
            过载数值，如果没有过载则返回 0
        """
        if not text:
            return 0

        clean_text = cls._clean_html(text)

        # 尝试匹配过载模式
        for pattern, factory in cls.PATTERNS.get("overload", []):
            match = re.search(pattern, clean_text, re.IGNORECASE)
            if match:
                try:
                    effect = factory(match)
                    if isinstance(effect, OverloadEffect):
                        return effect.amount
                except (ValueError, IndexError):
                    continue

        return 0

    @classmethod
    def has_combo(cls, text: str) -> bool:
        """检查是否有连击效果

        Returns:
            如果文本包含连击关键词则返回 True
        """
        if not text:
            return False
        clean_text = cls._clean_html(text)
        return bool(re.search(r"连击|Combo", clean_text, re.IGNORECASE))

    @classmethod
    def parse_combo(cls, text: str) -> Optional[str]:
        """解析连击效果文本

        例如："<b>连击：</b>造成2点伤害" 返回 "造成2点伤害"

        Returns:
            连击效果文本，如果没有连击则返回 None
        """
        if not text:
            return None

        clean_text = cls._clean_html(text)

        # 尝试匹配连击模式
        for pattern, factory in cls.PATTERNS.get("combo", []):
            match = re.search(pattern, clean_text, re.IGNORECASE)
            if match:
                try:
                    return factory(match)
                except (ValueError, IndexError):
                    continue

        return None

    @classmethod
    def has_discover(cls, text: str) -> bool:
        """检查是否有发现效果

        Returns:
            如果文本包含发现关键词则返回 True
        """
        if not text:
            return False
        clean_text = cls._clean_html(text)
        return bool(re.search(r"发现|Discover", clean_text, re.IGNORECASE))

    @classmethod
    def parse_discover(cls, text: str) -> Optional[str]:
        """解析发现效果

        例如："<b>发现</b>一张法术牌" 返回 "法术"

        Returns:
            发现的卡牌类型限制，如果没有限制则返回 "any"
        """
        if not text:
            return None

        clean_text = cls._clean_html(text)

        # 尝试匹配发现模式
        for pattern, factory in cls.PATTERNS.get("discover", []):
            match = re.search(pattern, clean_text, re.IGNORECASE)
            if match:
                try:
                    card_type = factory(match)
                    # 空字符串表示任意类型
                    if not card_type:
                        return "any"
                    # 标准化卡牌类型
                    card_type_lower = card_type.lower()
                    if "法术" in card_type_lower or "spell" in card_type_lower:
                        return "spell"
                    elif "随从" in card_type_lower or "minion" in card_type_lower:
                        return "minion"
                    elif "武器" in card_type_lower or "weapon" in card_type_lower:
                        return "weapon"
                    return "any"
                except (ValueError, IndexError):
                    continue

        return None

    @classmethod
    def requires_target(cls, text: str) -> bool:
        """检查效果是否需要选择目标

        根据卡牌文本判断是否需要在施放时选择目标。
        例如："对一个随从造成2点伤害" 需要选择目标
        """
        if not text:
            return False

        clean_text = cls._clean_html(text)

        # AOE效果（不需要选择单个目标）
        aoe_patterns = [
            r"所有(?:敌人|敌方|随从)",
            r"all (?:enemies|enemy|minions)",
        ]
        for pattern in aoe_patterns:
            if re.search(pattern, clean_text, re.IGNORECASE):
                return False

        # 需要目标的模式（指定单个目标）
        target_patterns = [
            # 中文模式
            r"对(?:一个|目标|敌方)?(?:随从|角色|英雄)",
            r"(?:消灭|伤害|治疗|恢复).{0,10}(?:一个|目标)",
            r"选择一个",
            # 对带有"造成X点伤害"但没有"所有"的，也需要目标
            r"造成\s*\d+\s*点伤害(?!.*所有)",
            # 英文模式
            r"Deal \d+ damage to (?:a|an|target|any)",
            r"(?:Destroy|Restore|Heal).{0,20}(?:a|an|target)",
            r"Choose (?:a|an|one)",
            r"Deal \d+ damage(?!.*all enemies)",
        ]

        for pattern in target_patterns:
            if re.search(pattern, clean_text, re.IGNORECASE):
                return True

        return False

    @classmethod
    def is_secret(cls, text: str) -> bool:
        """检查是否是奥秘卡牌"""
        if not text:
            return False
        clean_text = cls._clean_html(text)
        return "奥秘" in clean_text or "Secret" in clean_text

    @classmethod
    def get_secret_trigger(cls, text: str) -> str:
        """获取奥秘的触发类型"""
        if not text:
            return "unknown"

        clean_text = cls._clean_html(text)

        # 常见奥秘触发条件
        triggers = [
            (r"当你的英雄受到攻击", "attack_hero"),
            (r"在敌方英雄攻击后", "after_hero_attack"),
            (r"在敌方攻击后", "after_attack"),
            (r"当.*攻击你的英雄", "attack_hero"),
            (r"在对手使用一张随从牌后", "play_minion"),
            (r"在对手使用一张牌后", "play_card"),
            (r"在对手施放一个法术后", "cast_spell"),
            (r"在你的对手使用.*时", "play_card"),
            (r"当你的英雄受到伤害", "hero_damaged"),
            (r"After your opponent plays a minion", "play_minion"),
            (r"When a character attacks your hero", "attack_hero"),
            (r"When your hero takes damage", "hero_damaged"),
            (r"When your opponent casts a spell", "cast_spell"),
            (r"Secret.*When", "unknown"),  # Generic secret pattern
        ]

        for pattern, trigger_type in triggers:
            if re.search(pattern, clean_text, re.IGNORECASE):
                return trigger_type

        return "unknown"

    @classmethod
    def get_target_type(cls, text: str) -> str:
        """获取目标类型

        Returns:
            "enemy_minion" - 敌方随从
            "enemy_character" - 敌方角色（随从或英雄）
            "enemy_hero" - 敌方英雄
            "any_minion" - 任意随从
            "any_character" - 任意角色
            "friendly_minion" - 友方随从
            "none" - 不需要目标
        """
        if not text:
            return "none"

        clean_text = cls._clean_html(text)

        # AOE效果
        aoe_patterns = [
            r"所有(?:敌人|敌方|随从)",
            r"all (?:enemies|enemy|minions)",
        ]
        for pattern in aoe_patterns:
            if re.search(pattern, clean_text, re.IGNORECASE):
                return "none"

        # 按优先级匹配
        patterns = [
            (r"对(?:一个|目标)?敌方(?:随从|角色)", "enemy_minion"),
            (r"Deal \d+ damage to (?:an )?enemy minion", "enemy_minion"),
            (r"对(?:一个|目标)?敌方英雄", "enemy_hero"),
            (r"Deal \d+ damage to (?:the )?enemy hero", "enemy_hero"),
            (r"消灭(?:一个|目标)?(?:敌方)?随从", "enemy_minion"),
            (r"(?:Destroy|destroy) (?:a|an|target|any) (?:enemy )?minion", "enemy_minion"),
            (r"造成\s*\d+\s*点伤害(?!.*所有)", "any_character"),  # 简单的伤害效果
            (r"Deal \d+ damage(?! to all)", "any_character"),  # 简单的伤害效果
            (r"对(?:一个|目标)?(?:敌方)?(?:随从|角色)", "any_character"),
        ]

        for pattern, target_type in patterns:
            if re.search(pattern, clean_text, re.IGNORECASE):
                return target_type

        return "none"

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
