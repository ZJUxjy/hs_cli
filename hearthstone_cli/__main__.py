"""炉石传说CLI游戏入口"""

from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.cli.ui import CLIInterface
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.data import CardData, CardType, Rarity


def create_test_deck() -> Deck:
    """创建测试卡组"""
    db = CardDatabase()

    cards = [
        ("CS2_121", "Frostwolf Grunt", 2, 2, 2),
        ("CS2_122", "Raid Leader", 3, 2, 2),
        ("CS2_124", "Wolfrider", 3, 3, 1),
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

    return Deck(["CS2_121"] * 30)


def main():
    print("=" * 60)
    print("炉石传说 CLI 游戏")
    print("=" * 60)

    deck = create_test_deck()
    game = GameLogic.create_game(deck1=deck, deck2=deck, seed=42)

    ui = CLIInterface(game)
    ui.run()


if __name__ == "__main__":
    main()
