"""CLI game loop for human play."""
from cli.display.game_display import GameDisplay
from cli.input.input_handler import InputHandler
from hearthstone.engine.game_controller import GameController


class CLIGameLoop:
    """Game loop for CLI interface."""

    def __init__(self, controller: GameController):
        self.controller = controller
        self.display = GameDisplay()
        self.input_handler = InputHandler(self.display)

    def run(self):
        """Run the game loop."""
        # Start game
        self.controller.start_game()

        # Main game loop
        while not self.controller.is_game_over():
            # Display state
            state = self.controller.get_state()
            self.display.render_game_state(state)

            # Get valid actions
            valid_actions = self.controller.get_valid_actions()

            # Display options
            self._display_actions(valid_actions)

            # Get user choice
            action = self.input_handler.get_action_choice(valid_actions)

            # Execute action
            event = self.controller.execute_action(action)

            if event.success:
                print(f"\n[OK] {event.message}")
            else:
                print(f"\n[FAIL] {event.message}")

        # Game over
        winner = self.controller.get_winner()
        if winner:
            print(f"\n游戏结束! {winner.name} 获胜!")
        else:
            print("\n游戏结束!")

    def _display_actions(self, actions):
        """Display available actions."""
        print("\n可用动作:")
        for i, action in enumerate(actions, 1):
            print(f"  {i}. {self._format_action(action)}")

    def _format_action(self, action):
        """Format action for display."""
        from hearthstone.engine.action import EndTurnAction, PlayCardAction, AttackAction

        if isinstance(action, EndTurnAction):
            return "结束回合"
        elif isinstance(action, PlayCardAction):
            state = self.controller.get_state()
            if action.card_index < len(state.current_player.hand):
                card = state.current_player.hand[action.card_index]
                return f"打出 {card.name} ({card.cost}法力)"
            return f"打出卡牌 #{action.card_index + 1}"
        elif isinstance(action, AttackAction):
            state = self.controller.get_state()
            # Find attacker
            attacker = None
            for minion in state.current_player.board:
                if minion.id == action.attacker_id:
                    attacker = minion
                    break

            # Find target
            target_name = "敌方英雄"
            for minion in state.opposing_player.board:
                if minion.id == action.target_id:
                    target_name = minion.name
                    break

            return f"{attacker.name if attacker else 'Unknown'} 攻击 {target_name}"
        else:
            return str(action)
