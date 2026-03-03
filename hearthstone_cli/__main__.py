"""炉石传说CLI游戏入口"""

from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.cli.ui import CLIInterface
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.data import CardData, CardType, Rarity


def create_test_deck() -> Deck:
    """创建测试卡组"""
    db = CardDatabase()

    # 添加各种费用的卡牌
    cards = [
        # 1费卡牌
        ("CS1_042", "Argent Squire", 1, 1, 1),  # 银色侍从（有圣盾）
        ("CS2_168", "Murloc Raider", 1, 2, 1),  # 鱼人袭击者
        # 2费卡牌
        ("CS2_121", "Frostwolf Grunt", 2, 2, 2),  # 霜狼步兵（有嘲讽）
        ("CS2_172", "Bloodfen Raptor", 2, 3, 2),  # 血沼迅猛龙
        # 3费卡牌
        ("CS2_124", "Wolfrider", 3, 3, 1),  # 狼骑兵（有冲锋）
        ("CS2_122", "Raid Leader", 3, 2, 2),  # 团队领袖
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

    # 卡组：混合1费和2费卡牌，这样前几回合都能打出
    return Deck(
        ["CS1_042"] * 10 +   # 10张1费
        ["CS2_121"] * 10 +   # 10张2费
        ["CS2_124"] * 10     # 10张3费
    )


def main():
    print("=" * 60)
    print("炉石传说 CLI 游戏")
    print("=" * 60)

    deck = create_test_deck()
    game = GameLogic.create_game(deck1=deck, deck2=deck, seed=123)  # 使用种子123确保第一回合有1费卡牌

    ui = CLIInterface(game)
    ui.run()


if __name__ == "__main__":
    main()
