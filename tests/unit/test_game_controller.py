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
    assert len(state.player1.deck) == 30
    assert len(state.player2.deck) == 30


def test_get_valid_actions_returns_list():
    """Test get_valid_actions returns a list after game starts."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    controller.start_game()
    actions = controller.get_valid_actions()
    assert isinstance(actions, list)


def test_get_valid_actions_empty_before_start():
    """Test get_valid_actions returns empty list before game starts."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    actions = controller.get_valid_actions()
    assert actions == []


def test_execute_action_returns_event():
    """Test execute_action returns GameEvent after game starts."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    controller.start_game()

    from hearthstone.engine.action import EndTurnAction
    state = controller.get_state()
    action = EndTurnAction(player_id=state.current_player.name)
    event = controller.execute_action(action)

    assert isinstance(event, GameEvent)


def test_execute_action_fails_before_start():
    """Test execute_action returns failure before game starts."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    event = controller.execute_action(None)

    assert event.success is False
    assert "not started" in event.message.lower()


def test_get_state_raises_before_start():
    """Test get_state raises RuntimeError before game starts."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    with pytest.raises(RuntimeError):
        controller.get_state()


def test_get_state_returns_state_after_start():
    """Test get_state returns GameState after game starts."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    controller.start_game()
    state = controller.get_state()

    from hearthstone.models.game_state import GameState
    assert isinstance(state, GameState)


def test_is_game_over_returns_bool():
    """Test is_game_over returns a boolean."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    controller.start_game()

    assert isinstance(controller.is_game_over(), bool)


def test_is_game_over_false_at_start():
    """Test is_game_over is False at game start."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    controller.start_game()

    assert controller.is_game_over() is False


def test_get_winner_returns_none_at_start():
    """Test get_winner returns None at game start."""
    deck1 = create_test_deck()
    deck2 = create_test_deck()
    controller = GameController(deck1, deck2)
    controller.start_game()

    assert controller.get_winner() is None


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
