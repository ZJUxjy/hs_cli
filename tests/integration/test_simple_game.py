"""Integration test for a simple game."""
import pytest
from hearthstone.engine.game_engine import GameEngine
from hearthstone.engine.action import EndTurnAction
from hearthstone.models.enums import HeroClass
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.game_state import GameState
from hearthstone.models.deck import Deck, DECK_SIZE
from hearthstone.models.card import Minion


def create_test_deck():
    """Create a simple test deck."""
    cards = []
    for i in range(DECK_SIZE):
        cards.append(Minion(
            id=f"TEST_{i:03d}",
            name=f"Test Minion {i}",
            cost=2,
            attack=2,
            health=2
        ))
    return Deck(name="Test Deck", hero_class=HeroClass.MAGE, cards=cards)


def test_simple_game_flow():
    """Test a simple game with just end turn actions."""
    # Set up game state
    deck = create_test_deck()
    player1 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 1")
    player1.deck = deck.cards.copy()
    player2 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 2")
    player2.deck = deck.cards.copy()

    state = GameState(player1=player1, player2=player2)
    engine = GameEngine(state)
    engine.initialize_game()

    # Play 10 turns (5 rounds)
    for i in range(10):
        action = EndTurnAction(
            player_id=engine.state.current_player.name
        )
        result = engine.take_action(action)
        assert result.success

    # Check game state
    assert engine.state.turn == 6  # Turn 6 after 10 end turns
    assert engine.state.current_player.max_mana >= 5


def test_mana_gain_over_turns():
    """Test mana crystal gain over turns."""
    # Set up game state
    deck = create_test_deck()
    player1 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 1")
    player1.deck = deck.cards.copy()
    player2 = Player(hero=Hero(hero_class=HeroClass.MAGE), name="Player 2")
    player2.deck = deck.cards.copy()

    state = GameState(player1=player1, player2=player2)
    engine = GameEngine(state)
    engine.initialize_game()

    player1 = engine.state.player1
    player2 = engine.state.player2

    assert player1.max_mana == 1
    assert player2.max_mana == 1

    # End turn 1
    engine.take_action(EndTurnAction(player_id=player1.name))
    assert player2.max_mana == 2

    # End turn 2
    engine.take_action(EndTurnAction(player_id=player2.name))
    assert player1.max_mana == 2

    # End turn 3
    engine.take_action(EndTurnAction(player_id=player1.name))
    assert player2.max_mana == 3
