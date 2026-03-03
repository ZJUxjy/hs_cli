"""炉石传说CLI游戏入口"""

from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.cli.ui import CLIInterface
from hearthstone_cli.cards.database import CardDatabase


def load_cards():
    """加载卡牌数据"""
    db = CardDatabase()

    # 尝试从 HearthstoneJSON 加载
    try:
        print("正在加载卡牌数据...")
        count = db.load_from_hearthstonejson(
            locale="zhCN",
            card_types=["MINION"],  # 先只加载随从
            collectible_only=True,
        )
        print(f"已加载 {count} 张卡牌")
        return True
    except Exception as e:
        print(f"从网络加载失败: {e}")
        print("使用本地测试卡牌...")
        load_test_cards()
        return False


def load_test_cards():
    """加载测试卡牌（作为备用）"""
    from hearthstone_cli.cards.data import CardData, CardType, Rarity

    db = CardDatabase()

    # 添加测试卡牌
    cards = [
        # 1费卡牌
        ("CS1_042", "Argent Squire", 1, 1, 1),
        ("CS2_168", "Murloc Raider", 1, 2, 1),
        # 2费卡牌
        ("CS2_121", "Frostwolf Grunt", 2, 2, 2),
        ("CS2_172", "Bloodfen Raptor", 2, 3, 2),
        # 3费卡牌
        ("CS2_124", "Wolfrider", 3, 3, 1),
        ("CS2_122", "Raid Leader", 3, 2, 2),
    ]

    for card_id, name, cost, attack, health in cards:
        db.add_card(CardData(
            card_id=card_id,
            name=name,
            cost=cost,
            card_type=CardType.MINION,
            rarity=Rarity.BASIC,
            attack=attack,
            health=health
        ))


def create_demo_deck():
    """创建演示卡组"""
    db = CardDatabase()

    # 获取1费和2费的卡牌
    cheap_cards = [c for c in db.get_all_cards().values() if c.cost <= 3]

    if len(cheap_cards) < 30:
        # 如果卡牌不足，使用默认卡组
        return Deck(
            ["CS1_042"] * 10 +
            ["CS2_121"] * 10 +
            ["CS2_124"] * 10
        )

    # 选择30张卡牌组成卡组（优先低费卡牌）
    selected = []
    for cost in range(1, 4):  # 1-3费
        cards_of_cost = [c.card_id for c in cheap_cards if c.cost == cost]
        selected.extend(cards_of_cost[:10])  # 每个费用选最多10张
        if len(selected) >= 30:
            break

    # 确保正好30张
    selected = selected[:30]
    while len(selected) < 30:
        selected.append(selected[0])  # 复制第一张填充

    return Deck(selected)


def main():
    print("=" * 60)
    print("炉石传说 CLI 游戏")
    print("=" * 60)

    # 加载卡牌
    loaded_from_network = load_cards()

    # 显示一些示例卡牌
    db = CardDatabase()
    all_cards = list(db.get_all_cards().values())
    if all_cards:
        print(f"\n数据库中有 {len(all_cards)} 张卡牌")
        print("示例卡牌:")
        for card in sorted(all_cards, key=lambda c: c.cost)[:5]:
            card_type_str = "随从" if card.card_type.value == "MINION" else card.card_type.value
            if card.attack is not None and card.health is not None:
                print(f"  [{card.cost}费] {card.name} ({card.attack}/{card.health}) - {card_type_str}")
            else:
                print(f"  [{card.cost}费] {card.name} - {card_type_str}")

    # 创建卡组并开始游戏
    deck = create_demo_deck()
    print(f"\n创建了演示卡组（{len(deck)} 张卡牌）")

    game = GameLogic.create_game(deck1=deck, deck2=deck, seed=123)

    ui = CLIInterface(game)
    ui.run()


if __name__ == "__main__":
    main()
