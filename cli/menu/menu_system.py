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
        from hearthstone.decks.deck_manager import DeckManager
        from hearthstone.engine.game_controller import GameController
        from cli.game_loop import CLIGameLoop

        # Let player choose deck
        manager = DeckManager()
        decks = manager.list_decks()

        if not decks:
            self.display.render_error("No decks available")
            return

        print("\n选择你的卡组:")
        for i, deck_name in enumerate(decks, 1):
            print(f"  {i}. {deck_name}")

        choice = input("\n输入选择: ").strip()
        try:
            deck_index = int(choice) - 1
            player_deck_name = decks[deck_index]
        except (ValueError, IndexError):
            print("无效选择，使用默认卡组")
            player_deck_name = decks[0] if decks else "test_deck"

        # Load decks
        try:
            player_deck = manager.load_deck(player_deck_name)
            ai_deck = manager.load_deck("basic_warrior")
        except FileNotFoundError as e:
            self.display.render_error(f"无法加载卡组: {e}")
            return

        # Create controller and game loop
        controller = GameController(player_deck, ai_deck)
        game_loop = CLIGameLoop(controller)

        # Run game
        try:
            game_loop.run()
        except KeyboardInterrupt:
            print("\n游戏中断")

        input("\n按回车键返回主菜单...")

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
