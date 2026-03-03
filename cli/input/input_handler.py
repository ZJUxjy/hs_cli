"""Input handling for CLI."""
from typing import Optional
from hearthstone.models.game_state import GameState
from hearthstone.engine.action import Action, EndTurnAction, PlayCardAction
from cli.display.game_display import GameDisplay
from cli.input.command_parser import CommandParser


from hearthstone.engine.action import Action, EndTurnAction


class InputHandler:
    """Handle user input in the CLI."""

    def __init__(self, display: GameDisplay):
        self.display = display
        self.mode = "number"

    def get_action(self, game_state: GameState) -> Action:
        """Get user input and convert to action."""
        while True:
            try:
                user_input = input("\n请选择操作 (输入数字或:进入命令模式): ").strip()

                if user_input == ":":
                    # Command mode
                    command = input("命令: ").strip()
                    return CommandParser.parse(command, game_state)
                else:
                    # Number mode
                    return self._parse_number(user_input, game_state)

            except ValueError as e:
                print(f"输入错误: {e}")
                print("请重试")
                continue

    def _parse_number(self, input_str: str, game_state: GameState) -> Action:
        """Parse number input to action."""
        try:
            choice = int(input_str)
        except ValueError:
            raise ValueError("请输入数字")

        # Map number to action based on game state
        # 1-N: Play card (hand index)
        # N+1: End turn

        hand_size = len(game_state.current_player.hand)

        if 1 <= choice <= hand_size:
            # Play a card
            return PlayCardAction(
                player_id=game_state.current_player.name,
                card_index=choice - 1  # 0-indexed
            )
        elif choice == hand_size + 1:
            # End turn
            return EndTurnAction(player_id=game_state.current_player.name)
        else:
            raise ValueError(f"无效选择: {choice}")
