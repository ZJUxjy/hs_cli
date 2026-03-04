"""HearthstoneJSON 卡牌数据加载器"""
import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Any
import requests

from hearthstone_cli.cards.data import CardData, CardType, Rarity, Class
from hearthstone_cli.i18n import _


# HearthstoneJSON API  endpoints
HSJSON_URLS = {
    "latest": "https://api.hearthstonejson.com/v1/latest/{locale}/cards.json",
    "locales": ["zhCN", "enUS", "jaJP", "deDE"],
}

# 本地缓存目录
CACHE_DIR = Path.home() / ".cache" / "hearthstone_cli"


class CardLoader:
    """卡牌数据加载器

    从 HearthstoneJSON 加载卡牌数据，支持本地缓存。
    """

    def __init__(self, locale: str = "zhCN", cache_dir: Optional[Path] = None):
        self.locale = locale
        self.cache_dir = cache_dir or CACHE_DIR
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_cache_path(self) -> Path:
        """获取缓存文件路径"""
        return self.cache_dir / f"cards_{self.locale}.json"

    def download_cards(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """下载卡牌数据

        Args:
            force_refresh: 是否强制重新下载（忽略缓存）

        Returns:
            卡牌数据列表
        """
        cache_path = self._get_cache_path()

        # 检查缓存
        if not force_refresh and cache_path.exists():
            print(_("Using cached card data: {}").format(cache_path))
            with open(cache_path, "r", encoding="utf-8") as f:
                return json.load(f)

        # 下载数据
        url = HSJSON_URLS["latest"].format(locale=self.locale)
        print(_("Downloading card data: {}").format(url))

        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            cards = response.json()

            # 保存缓存
            with open(cache_path, "w", encoding="utf-8") as f:
                json.dump(cards, f, ensure_ascii=False, indent=2)

            print(_("Downloaded {} cards").format(len(cards)))
            return cards

        except requests.RequestException as e:
            print(_("Download failed: {}").format(e))
            # 如果下载失败但有缓存，使用缓存
            if cache_path.exists():
                print(_("Using cached card data"))
                with open(cache_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            raise

    def load_cards(
        self,
        sets: Optional[List[str]] = None,
        card_types: Optional[List[str]] = None,
        collectible_only: bool = True,
    ) -> Dict[str, CardData]:
        """加载并解析卡牌数据

        Args:
            sets: 指定扩展包（如 ["CORE", "THE_SUNKEN_CITY"]），None 表示全部
            card_types: 指定卡牌类型（["MINION", "SPELL", "WEAPON"]），None 表示全部
            collectible_only: 只加载可收集卡牌（排除衍生牌）

        Returns:
            卡牌ID到CardData的映射
        """
        raw_cards = self.download_cards()
        cards = {}

        for card in raw_cards:
            # 过滤条件
            if collectible_only and not card.get("collectible", False):
                continue

            if sets and card.get("set") not in sets:
                continue

            if card_types and card.get("type") not in card_types:
                continue

            # 解析卡牌
            parsed = self._parse_card(card)
            if parsed:
                cards[parsed.card_id] = parsed

        return cards

    def _parse_card(self, card: Dict[str, Any]) -> Optional[CardData]:
        """解析单张卡牌数据"""
        try:
            # 跳过非游戏卡牌（如英雄皮肤）
            if card.get("type") not in ["MINION", "SPELL", "WEAPON", "HERO", "HERO_POWER"]:
                return None

            # 解析卡牌类型
            card_type = self._parse_card_type(card.get("type", "MINION"))

            # 解析稀有度
            rarity = self._parse_rarity(card.get("rarity", "FREE"))

            # 解析职业
            card_class = self._parse_class(card.get("cardClass", "NEUTRAL"))

            # 解析属性（如嘲讽、圣盾等）
            attributes = self._parse_mechanics(card.get("mechanics", []))

            return CardData(
                card_id=card["id"],
                name=card.get("name", ""),
                cost=card.get("cost", 0),
                card_type=card_type,
                rarity=rarity,
                text=card.get("text", ""),
                player_class=card_class,
                attack=card.get("attack"),
                health=card.get("health"),
                durability=card.get("durability"),
                attributes=attributes,
            )

        except (KeyError, ValueError) as e:
            print(_("Failed to parse card {}: {}").format(card.get('id', 'unknown'), e))
            return None

    def _parse_card_type(self, type_str: str) -> CardType:
        """解析卡牌类型"""
        type_map = {
            "MINION": CardType.MINION,
            "SPELL": CardType.SPELL,
            "WEAPON": CardType.WEAPON,
            "HERO": CardType.HERO,
            "HERO_POWER": CardType.HERO_POWER,
        }
        return type_map.get(type_str, CardType.MINION)

    def _parse_rarity(self, rarity_str: str) -> Rarity:
        """解析稀有度"""
        rarity_map = {
            "FREE": Rarity.FREE,
            "COMMON": Rarity.COMMON,
            "RARE": Rarity.RARE,
            "EPIC": Rarity.EPIC,
            "LEGENDARY": Rarity.LEGENDARY,
        }
        return rarity_map.get(rarity_str, Rarity.FREE)

    def _parse_class(self, class_str: str) -> Class:
        """解析职业"""
        class_map = {
            "NEUTRAL": Class.NEUTRAL,
            "WARRIOR": Class.WARRIOR,
            "SHAMAN": Class.SHAMAN,
            "ROGUE": Class.ROGUE,
            "PALADIN": Class.PALADIN,
            "HUNTER": Class.HUNTER,
            "DRUID": Class.DRUID,
            "WARLOCK": Class.WARLOCK,
            "MAGE": Class.MAGE,
            "PRIEST": Class.PRIEST,
            "DEMONHUNTER": Class.DEMONHUNTER,
        }
        return class_map.get(class_str, Class.NEUTRAL)

    def _parse_mechanics(self, mechanics: List[str]) -> frozenset:
        """解析卡牌机制（属性）"""
        from hearthstone_cli.engine.state import Attribute

        attr_map = {
            "TAUNT": Attribute.TAUNT,
            "DIVINE_SHIELD": Attribute.DIVINE_SHIELD,
            "WINDFURY": Attribute.WINDFURY,
            "CHARGE": Attribute.CHARGE,
            "STEALTH": Attribute.STEALTH,
            "POISONOUS": Attribute.POISONOUS,
            "LIFESTEAL": Attribute.LIFESTEAL,
        }

        attrs = set()
        for mech in mechanics:
            if mech in attr_map:
                attrs.add(attr_map[mech])

        return frozenset(attrs)

    def get_standard_sets(self) -> List[str]:
        """获取当前标准模式的扩展包列表

        注意：这里需要手动更新每个扩展包发布时
        """
        # 2024年标准模式扩展包
        return [
            "CORE",  # 核心系列（免费提供的卡牌）
            "THE_SUNKEN_CITY",  # 探寻沉没之城
            "REVENDRETH",  # 纳斯利亚堡的悬案
            "PATH_OF_ARTHAS",  # 阿尔萨斯之路
            "MARCH_OF_THE_LICH_KING",  # 巫妖王的进军
            "FESTIVAL_OF_LEGENDS",  # 传奇音乐节
            "TITANS",  # 泰坦诸神
            "SHOWDOWN_IN_THE_BADLANDS",  # 决战荒芜之地
        ]

    def get_wild_sets(self) -> List[str]:
        """获取狂野模式的所有扩展包列表"""
        # 这是一个简化的列表，实际包含更多扩展包
        standard = self.get_standard_sets()
        wild_only = [
            "LEGACY",  # 基础/经典
            "EXPERT1",  # 经典
            "HOF",  # 荣誉室
            "NAXX",  # 纳克萨玛斯
            "GVG",  # 地精大战侏儒
            "BRM",  # 黑石山
            "TGT",  # 冠军的试炼
            "LOE",  # 探险者协会
            "OG",  # 古神的低语
            "KARA",  # 卡拉赞之夜
            "GANGS",  # 龙争虎斗加基森
            "UNGORO",  # 勇闯安戈洛
            "ICECROWN",  # 冰封王座
            "LOOTAPALOOZA",  # 狗头人与地下世界
            "GILNEAS",  # 女巫森林
            "BOOMSDAY",  # 砰砰计划
            "TROLL",  # 拉斯塔哈大乱斗
            "DALARAN",  # 暗影崛起
            "ULDUM",  # 奥丹姆奇兵
            "DRAGONS",  # 巨龙降临
            "YEAR_OF_THE_DRAGON",  # 外域的灰烬
            "SCHOLOMANCE",  # 通灵学园
            "DARKMOON_FAIRE",  # 暗月马戏团
            "THE_BARRENS",  # 贫瘠之地
            "STORMWIND",  # 暴风城下的集结
            "ALTERAC_VALLEY",  # 奥特兰克山谷
        ]
        return standard + wild_only
