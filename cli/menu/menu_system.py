"""Main menu system."""
from cli.display.menu_display import MenuDisplay
from cli.display.game_display import GameDisplay
from cli.input.input_handler import InputHandler
from hearthstone.engine.game_engine import GameEngine
from hearthstone.models.enums import HeroClass


class MenuSystem:
    """Main menu system controller."""

    def __init__(self):
        self.display = MenuDisplay()
        self.running = True

    def run(self):
        """Run main menu loop."""
        while self.running:
            self.display.render_main_menu()

            try:
                choice = input("Please select: ").strip()

                if choice == "1":
                    self._start_game_flow()
                elif choice == "2":
                    self._deck_builder_flow()
                elif choice == "3":
                    self._settings_flow()
                elif choice == "4":
                    self.running = False
                else:
                    self.display.render_error("Invalid selection")

            except KeyboardInterrupt:
                print("\nGoodbye!")
                self.running = False
            except EOF:
                print("\nGoodbye!")
                self.running = False

    def _start_game_flow(self):
        """Game mode selection and game start."""
        self.display.render_game_mode_menu()

        choice = input("Please select game mode: ").strip()

        if choice == "1":
            # Human vs AI
            self._start_human_vs_ai()
        elif choice == "2":
            # AI vs AI
            self._start_ai_vs_ai()
        elif choice == "3":
            # Back to main menu
            return
        else:
            self.display.render_error("Invalid selection")

    def _start_human_vs_ai(self):
        """Start human vs AI game."""
        engine = GameEngine()
        engine.initialize_game(
            player1_name="Player",
            player1_class=HeroClass.MAGE,
            player2_name="AI",
            player2_class=HeroClass.WARRIOR
        )

        game_display = GameDisplay()
        input_handler = InputHandler(game_display)

        # Main game loop
        while not engine.state.is_game_over():
            game_display.render_game_state(engine.state)

            action = input_handler.get_action(engine.state)
            result = engine.take_action(action)

            if not result.success:
                self.display.render_error(result.message)
        # Game over
        winner = engine.state.get_winner()
        if winner:
            self.display.render_success(f"Game Over! {winner.name} wins!")
        input("\nPress Enter to return to main menu...")
    def _start_ai_vs_ai(self):
        """Start AI vs AI game."""
        # TODO: Implement AI vs AI
        self.display.render_error("AI vs AI mode not implemented yet")
    def _deck_builder_flow(self):
        """Deck builder flow."""
        # TODO: Implement deck builder
        self.display.render_error("Deck builder not implemented yet")
    def _settings_flow(self):
        """Settings flow."""
        self.display.render_error("Settings not implemented yet")
