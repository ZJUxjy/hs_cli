"""Tests for AttackValidator."""
import pytest
from hearthstone.engine.attack.attack_validator import AttackValidator
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


def test_validate_minion_attack_hero():
    """Test minion attacking enemy hero."""
    game = create_test_game()
    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=2,
        health=2
    )
    attacker.can_attack = True  # Set after creation
    game.current_player.board.append(attacker)

    validator = AttackValidator()
    result = validator.validate_attack(attacker, "enemy_hero", game)

    assert result.valid
    assert "enemy_hero" in result.legal_targets


def test_validate_attack_with_taunt():
    """Test must attack taunt minion first."""
    game = create_test_game()

    # Add taunt minion to opponent's board
    taunt = Minion(
        id="TEST_002",
        name="Taunt",
        cost=3,
        attack=2,
        health=5,
        abilities={Ability.TAUNT}
    )
    game.opposing_player.board.append(taunt)

    # Add another minion without taunt
    other = Minion(id="TEST_003", name="Other", cost=2, attack=1, health=1)
    game.opposing_player.board.append(other)

    # Add attacker to current player's board
    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=2,
        health=2
    )
    attacker.can_attack = True  # Set after creation
    game.current_player.board.append(attacker)

    validator = AttackValidator()

    # Should fail - must attack taunt first
    result = validator.validate_attack(attacker, "TEST_003", game)
    assert not result.valid
    assert "taunt" in result.errors[0].lower()

    # Should succeed - attacking taunt
    result = validator.validate_attack(attacker, "TEST_002", game)
    assert result.valid


def test_validate_cannot_attack_twice():
    """Test minion cannot attack twice in one turn."""
    game = create_test_game()
    attacker = Minion(
        id="TEST_001",
        name="Attacker",
        cost=2,
        attack=2,
        health=2
    )
    # can_attack is False by default (already attacked)
    game.current_player.board.append(attacker)

    validator = AttackValidator()
    result = validator.validate_attack(attacker, "enemy_hero", game)

    assert not result.valid
