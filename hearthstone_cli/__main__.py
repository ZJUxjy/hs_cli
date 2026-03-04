"""炉石传说CLI游戏入口"""

import os

from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.cli.ui import CLIInterface
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.loader import CardLoader
from hearthstone_cli.i18n import _, set_language


def show_language_menu():
    """显示语言选择菜单"""
    # 先打印英文和中文混合的菜单（此时i18n尚未初始化）
    print("\n" + "=" * 40)
    print("Select Language / 选择语言")
    print("=" * 40)
    print("1. English")
    print("2. 简体中文 (zhCN)")
    print("=" * 40)

    choice = input("Enter choice / 输入选择 (default: 2): ").strip()

    if choice == "1":
        return "enUS"
    else:
        return "zhCN"


def load_cards():
    """加载所有标准模式卡牌"""
    db = CardDatabase()

    # 尝试从 HearthstoneJSON 加载
    try:
        print(_("Loading card data..."))
        # 加载所有标准扩展包
        loader = CardLoader(locale="zhCN")
        standard_sets = loader.get_standard_sets()

        print(_("Standard sets: {}").format(len(standard_sets)))

        # 加载随从和法术卡牌
        count = db.load_from_hearthstonejson(
            locale="zhCN",
            sets=standard_sets,
            card_types=["MINION", "SPELL"],  # 加载随从和法术
            collectible_only=True,
        )
        print(_("Loaded {} cards (minions + spells)").format(count))
        return True
    except Exception as e:
        print(_("Failed to load from network: {}").format(e))
        print(_("Using local test cards..."))
        load_test_cards()
        return False


def load_test_cards():
    """加载测试卡牌（作为备用）"""
    from hearthstone_cli.cards.data import CardData, CardType, Rarity

    db = CardDatabase()

    # 添加测试随从
    minions = [
        ("CS1_042", "银色侍从", 1, 1, 1),
        ("CS2_168", "鱼人袭击者", 1, 2, 1),
        ("CS2_121", "霜狼步兵", 2, 2, 2),
        ("CS2_172", "血沼迅猛龙", 2, 3, 2),
        ("CS2_124", "狼骑兵", 3, 3, 1),
    ]

    for card_id, name, cost, attack, health in minions:
        db.add_card(CardData(
            card_id=card_id,
            name=name,
            cost=cost,
            card_type=CardType.MINION,
            rarity=Rarity.BASIC,
            attack=attack,
            health=health
        ))

    # 添加测试法术
    spells = [
        ("CS2_029", "火球术", 4, "造成6点伤害。"),
        ("CS2_037", "寒冰箭", 2, "造成3点伤害。"),
        ("CS1_129", "心灵震爆", 2, "造成5点伤害。"),
    ]

    for card_id, name, cost, text in spells:
        db.add_card(CardData(
            card_id=card_id,
            name=name,
            cost=cost,
            card_type=CardType.SPELL,
            rarity=Rarity.BASIC,
            text=text
        ))


def create_demo_deck():
    """创建演示卡组 - 确保有足够的低费卡牌"""
    db = CardDatabase()

    # 获取所有卡牌
    all_cards = list(db.get_all_cards().values())

    if len(all_cards) < 30:
        # 如果卡牌不足，使用默认卡组
        return Deck(["CS1_042"] * 30)

    # 按费用和类型筛选，创建一个平衡卡组
    selected = []

    # 0-1费卡牌：选择15张（确保前期能出牌）
    cheap_cards = [c for c in all_cards if c.cost <= 1]
    # 优先选择随从
    cheap_minions = [c for c in cheap_cards if c.card_type.value == "MINION"]
    cheap_spells = [c for c in cheap_cards if c.card_type.value == "SPELL"]
    selected.extend([c.card_id for c in cheap_minions[:10]])
    selected.extend([c.card_id for c in cheap_spells[:5]])

    # 2费卡牌：选择10张
    two_cost = [c for c in all_cards if c.cost == 2]
    two_minions = [c for c in two_cost if c.card_type.value == "MINION"]
    selected.extend([c.card_id for c in two_minions[:10]])

    # 3-4费卡牌：选择5张
    mid_cost = [c for c in all_cards if 3 <= c.cost <= 4]
    mid_minions = [c for c in mid_cost if c.card_type.value == "MINION"]
    selected.extend([c.card_id for c in mid_minions[:5]])

    # 确保正好30张
    selected = selected[:30]
    while len(selected) < 30:
        # 用1费卡牌填充
        one_cost = [c.card_id for c in all_cards if c.cost == 1]
        if one_cost:
            selected.append(one_cost[0])
        else:
            selected.append(selected[0])

    return Deck(selected)


def main():
    # 显示语言选择菜单（在初始化i18n之前）
    lang = show_language_menu()
    set_language(lang)

    print("=" * 60)
    print(_("Hearthstone CLI Game"))
    print("=" * 60)

    # 加载卡牌
    loaded_from_network = load_cards()

    # 显示卡牌统计
    db = CardDatabase()
    all_cards = list(db.get_all_cards().values())

    if all_cards:
        minions = [c for c in all_cards if c.card_type.value == "MINION"]
        spells = [c for c in all_cards if c.card_type.value == "SPELL"]

        print(_("\nDatabase has {} cards:").format(len(all_cards)))
        print(_("  - Minions: {}").format(len(minions)))
        print(_("  - Spells: {}").format(len(spells)))

        print(_("\nExample cards:"))
        # 显示一些随从
        print(_("  Minions:"))
        for card in sorted(minions, key=lambda c: c.cost)[:3]:
            print(f"    [{card.cost}费] {card.name} ({card.attack}/{card.health})")
        # 显示一些法术
        print(_("  Spells:"))
        for card in sorted(spells, key=lambda c: c.cost)[:3]:
            text = card.text[:20] + "..." if len(card.text) > 20 else card.text
            print(f"    [{card.cost}费] {card.name} - {text}")

    # 创建卡组并开始游戏
    deck = create_demo_deck()
    print(_("\nCreated demo deck ({} cards)").format(len(deck)))

    game = GameLogic.create_game(deck1=deck, deck2=deck, seed=42)

    ui = CLIInterface(game)
    ui.run()


if __name__ == "__main__":
    main()
