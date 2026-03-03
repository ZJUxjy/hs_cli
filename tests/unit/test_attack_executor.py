"""Tests for AttackExecutor."""
import pytest
from hearthstone.engine.attack.attack_executor import AttackExecutor
from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.models.enums import HeroClass, Ability


def create_test_game():
    """Create a test game state."""
    player1 = Player(
        hero=Hero(hero_class=HeroClass.MAGE),
        name="Player 1"
    )
    player2 = Player(
        hero=Hero(hero_class=HeroClass.WARRIOR),
        name="Player 2"
    )
    return GameState(player1=player1, player2=player2)


def test_execute_attack_on_hero():
    """Test attacking enemy hero."""
    game = create_test_game()
    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=3,
        health=2
    )
    attacker.can_attack = True
    game.current_player.board.append(attacker)

    executor = AttackExecutor()
    result = executor.execute_attack(attacker, "enemy_hero", game)

    assert result.success
    assert game.opposing_player.hero.health == 27  # 30 - 3
    assert not attacker.can_attack  # Should not be able to attack again


def test_execute_attack_on_minion():
    """Test attacking enemy minion."""
    game = create_test_game()

    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=3,
        health=2
    )
    defender = Minion(
        id="TEST_002",
        name="Defender",
        cost=2,
        attack=1,
        health=3
    )

    attacker.can_attack = True
    game.current_player.board.append(attacker)
    game.opposing_player.board.append(defender)

    executor = AttackExecutor()
    result = executor.execute_attack(attacker, "TEST_002", game)

    assert result.success
    assert defender.health == 0  # 3 - 3
    assert attacker.health == 1  # 2 - 1
    assert len(game.opposing_player.graveyard) == 1  # Defender died


def test_execute_attack_with_windfury():
    """Test minion with windfury can attack twice."""
    game = create_test_game()
    attacker = Minion(
        id="TEST_001",
        name="Windfury",
        cost=4,
        attack=2,
        health=2,
        abilities={Ability.WINDFURY}
    )
    attacker.can_attack = True
    game.current_player.board.append(attacker)

    executor = AttackExecutor()

    # First attack
    result = executor.execute_attack(attacker, "enemy_hero", game)
    assert result.success
    assert attacker.can_attack  # Can still attack
    assert attacker.attacks_this_turn == 1

    # Second attack
    result = executor.execute_attack(attacker, "enemy_hero", game)
    assert result.success
    assert not attacker.can_attack  # Cannot attack anymore
    assert attacker.attacks_this_turn == 2
