"""Tests for GameController."""
import pytest
from hearthstone.engine.game_controller import GameController, GameEvent
from hearthstone.models.deck import Deck, DECK_SIZE
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass


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


def test_game_controller_initialization():
    """Test GameController can be initialized with two decks."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()

    controller = GameController(deck1, deck2)

    assert controller is not None
    assert controller.deck1 == deck1
    assert controller.deck2 == deck2
    assert controller.engine is None


def test_game_controller_start_game():
    """Test starting a game."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()

    controller = GameController(deck1, deck2)
    state = controller.start_game()

    assert state is not None
    assert state.player1 is not None
    assert state.player2 is not None
    # After drawing starting hands: player1 draws 3, player2 draws 4
    assert len(state.player1.deck) == 27  # 30 - 3 starting cards
    assert len(state.player2.deck) == 26  # 30 - 4 starting cards
    assert len(state.player1.hand) == 3
    assert len(state.player2.hand) == 4


def test_get_valid_actions_not_implemented():
    """Test get_valid_actions raises NotImplementedError."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    with pytest.raises(NotImplementedError):
        controller.get_valid_actions()


def test_execute_action_not_implemented():
    """Test execute_action raises NotImplementedError."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    with pytest.raises(NotImplementedError):
        controller.execute_action(None)


def test_get_state_not_implemented():
    """Test get_state raises NotImplementedError."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    with pytest.raises(NotImplementedError):
        controller.get_state()


def test_is_game_over_not_implemented():
    """Test is_game_over raises NotImplementedError."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    with pytest.raises(NotImplementedError):
        controller.is_game_over()


def test_get_winner_not_implemented():
    """Test get_winner raises NotImplementedError."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    with pytest.raises(NotImplementedError):
        controller.get_winner()


def test_game_event_default_values():
    """Test GameEvent has correct default values."""
    event = GameEvent(success=True, message="Test")
    assert event.success is True
    assert event.message == "Test"
    assert event.state_changes == {}
    assert event.errors == []


def test_game_event_with_values():
    """Test GameEvent with custom values."""
    event = GameEvent(
        success=False,
        message="Error occurred",
        state_changes={"key": "value"},
        errors=["error1", "error2"]
    )
    assert event.success is False
    assert event.message == "Error occurred"
    assert event.state_changes == {"key": "value"}
    assert event.errors == ["error1", "error2"]
