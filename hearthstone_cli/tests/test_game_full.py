"""Full game initialization tests."""

import pytest

from hearthstone_cli.engine.deck import Deck
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.engine.state import GameState, PlayerState, HeroState
from hearthstone_cli.cards.database import CardDatabase
from hearthstone_cli.cards.data import CardData, CardType, Rarity, Class


def create_test_deck(card_prefix: str = "TEST") -> Deck:
    """创建一个测试卡组（30张相同的卡牌）"""
    db = CardDatabase()

    # 确保数据库中有测试卡牌
    for i in range(30):
        card_id = f"{card_prefix}_{i:03d}"
        if db.get_card(card_id) is None:
            db.add_card(CardData(
                card_id=card_id,
                name=f"Test Card {i}",
                cost=1,
                card_type=CardType.MINION,
                rarity=Rarity.BASIC,
                player_class=Class.NEUTRAL,
                attack=1,
                health=1
            ))

    card_ids = [f"{card_prefix}_{i:03d}" for i in range(30)]
    return Deck(card_ids=card_ids)


def test_create_game_with_decks():
    """可以用卡组创建游戏"""
    deck1 = create_test_deck("P1")
    deck2 = create_test_deck("P2")

    state = GameLogic.create_game(deck1, deck2, seed=42)

    assert isinstance(state, GameState)
    assert len(state.players) == 2
    assert state.turn == 1
    assert state.active_player == 0


def test_initial_hand_size():
    """初始手牌数量正确（先手3张，后手4张）"""
    deck1 = create_test_deck("P1")
    deck2 = create_test_deck("P2")

    state = GameLogic.create_game(deck1, deck2, seed=42)

    player0 = state.players[0]  # 先手
    player1 = state.players[1]  # 后手

    # 先手玩家有3张手牌
    assert len(player0.hand) == 3
    # 后手玩家有4张手牌
    assert len(player1.hand) == 4


def test_deck_size_after_initial_draw():
    """初始抽牌后卡组剩余数量正确"""
    deck1 = create_test_deck("P1")
    deck2 = create_test_deck("P2")

    state = GameLogic.create_game(deck1, deck2, seed=42)

    player0 = state.players[0]  # 先手，抽3张
    player1 = state.players[1]  # 后手，抽4张

    # 先手玩家剩余27张
    assert len(player0.deck) == 27
    # 后手玩家剩余26张
    assert len(player1.deck) == 26


def test_initial_mana():
    """初始水晶正确（先手1/0，后手0/1）"""
    deck1 = create_test_deck("P1")
    deck2 = create_test_deck("P2")

    state = GameLogic.create_game(deck1, deck2, seed=42)

    player0 = state.players[0]  # 先手
    player1 = state.players[1]  # 后手

    # 先手：当前1点水晶，最大0点（下回合才到1）
    assert player0.mana.current == 1
    assert player0.mana.max_mana == 0

    # 后手：当前0点水晶，最大1点（下回合有1点）
    assert player1.mana.current == 0
    assert player1.mana.max_mana == 1


def test_initial_hero_health():
    """初始英雄血量为30"""
    deck1 = create_test_deck("P1")
    deck2 = create_test_deck("P2")

    state = GameLogic.create_game(deck1, deck2, seed=42)

    for player in state.players:
        assert player.hero.health == 30
        assert player.hero.max_health == 30


def test_game_is_terminal_when_hero_dies():
    """英雄死亡游戏结束"""
    deck1 = create_test_deck("P1")
    deck2 = create_test_deck("P2")

    state = GameLogic.create_game(deck1, deck2, seed=42)

    # 初始游戏未结束
    assert not GameLogic.is_terminal(state)
    assert GameLogic.get_winner(state) is None

    # 模拟玩家0英雄死亡
    from dataclasses import replace
    dead_hero = replace(state.players[0].hero, health=0)
    dead_player = replace(state.players[0], hero=dead_hero)
    new_state = replace(state, players=(dead_player, state.players[1]))

    assert GameLogic.is_terminal(new_state)
    assert GameLogic.get_winner(new_state) == 1


def test_game_draw_when_both_heroes_die():
    """双方英雄同时死亡为平局"""
    deck1 = create_test_deck("P1")
    deck2 = create_test_deck("P2")

    state = GameLogic.create_game(deck1, deck2, seed=42)

    from dataclasses import replace
    dead_hero0 = replace(state.players[0].hero, health=0)
    dead_hero1 = replace(state.players[1].hero, health=0)
    dead_player0 = replace(state.players[0], hero=dead_hero0)
    dead_player1 = replace(state.players[1], hero=dead_hero1)
    new_state = replace(state, players=(dead_player0, dead_player1))

    assert GameLogic.is_terminal(new_state)
    assert GameLogic.get_winner(new_state) == -1


def test_deck_must_have_30_cards():
    """卡组必须正好30张牌"""
    # 少于30张
    with pytest.raises(ValueError, match="Deck must have exactly 30 cards"):
        Deck(card_ids=["card_001"] * 29)

    # 多于30张
    with pytest.raises(ValueError, match="Deck must have exactly 30 cards"):
        Deck(card_ids=["card_001"] * 31)

    # 正好30张
    deck = Deck(card_ids=["card_001"] * 30)
    assert len(deck) == 30


def test_deck_iteration():
    """Deck类支持迭代"""
    card_ids = [f"card_{i:03d}" for i in range(30)]
    deck = Deck(card_ids=card_ids)

    iterated = list(deck)
    assert iterated == card_ids
