"""Command parsing for CLI input."""
from typing import Optional
from hearthstone.models.game_state import GameState
from hearthstone.engine.action import (
    Action,
    PlayCardAction,
    AttackAction,
    EndTurnAction,
    HeroPowerAction
)


class CommandParser:
    """Parse command-style input."""

    @staticmethod
    def parse(command: str, game_state: GameState) -> Action:
        """Parse a command string into an Action."""
        tokens = command.strip().lower().split()

        if not tokens:
            raise ValueError("Empty command")

        cmd = tokens[0]

        if cmd == "play":
            return CommandParser._parse_play(tokens[1:], game_state)
        elif cmd == "attack":
            return CommandParser._parse_attack(tokens[1:], game_state)
        elif cmd == "end":
            return EndTurnAction(player_id=game_state.current_player.name)
        elif cmd == "hero":
            return CommandParser._parse_hero_power(tokens[1:], game_state)
        else:
            raise ValueError(f"Unknown command: {cmd}")

    @staticmethod
    def _parse_play(args: list, game_state: GameState) -> PlayCardAction:
        """Parse play command."""
        if not args:
            raise ValueError("play command requires card number")

        try:
            card_index = int(args[0])
        except ValueError:
            raise ValueError("Card number must be a number")

        target_id = args[1] if len(args) > 1 else None

        return PlayCardAction(
            player_id=game_state.current_player.name,
            card_index=card_index,
            target_id=target_id
        )

    @staticmethod
    def _parse_attack(args: list, game_state: GameState) -> AttackAction:
        """Parse attack command."""
        if len(args) < 2:
            raise ValueError("attack command requires attacker and target")

        attacker_id = args[0]
        target_id = args[1]

        return AttackAction(
            player_id=game_state.current_player.name,
            attacker_id=attacker_id,
            target_id=target_id
        )

    @staticmethod
    def _parse_hero_power(args: list, game_state: GameState) -> HeroPowerAction:
        """Parse hero power command."""
        target_id = args[0] if args else None

        return HeroPowerAction(
            player_id=game_state.current_player.name,
            target_id=target_id
        )
