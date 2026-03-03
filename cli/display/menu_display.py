"""Menu display using Rich."""
from rich.console import Console
from rich.panel import Panel


class MenuDisplay:
    """Display menus using Rich."""

    def __init__(self):
        self.console = Console()

    def render_main_menu(self):
        """Render main menu."""
        menu_text = """
[bold]Hearthstone CLI[/bold]

[1] Start Game
[2] Build Deck
[3] Settings
[4] Quit
"""
        panel = Panel(menu_text, title="Main Menu", border_style="blue")
        self.console.print(panel)

    def render_game_mode_menu(self):
        """Render game mode selection menu."""
        menu_text = """
[bold]Select game mode[/bold]

[1] Human vs AI
[2] AI vs AI
[3] Return
"""
        panel = Panel(menu_text, title="Game Mode", border_style="green")
        self.console.print(panel)

    def render_deck_builder_menu(self):
        """Render deck builder menu."""
        menu_text = """
[bold]Deck Builder[/bold]

[1] Create new deck
[2] Edit deck
[3] Delete deck
[4] Return
"""
        panel = Panel(menu_text, title="Deck Builder", border_style="yellow")
        self.console.print(panel)

    def render_error(self, message: str):
        """Render error message."""
        self.console.print(f"[red]Error: {message}[/red]")

    def render_success(self, message: str):
        """Render success message."""
        self.console.print(f"[green]{message}[/green]")


from cli.display.menu_display import MenuDisplay


from cli.display.game_display import GameDisplay
from cli.input.input_handler import InputHandler
from hearthstone.engine.game_engine import GameEngine
from hearthstone.models.enums import HeroClass


from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.hero import Hero
from hearthstone.models.card import Minion
from hearthstone.engine.action import Action, EndTurnAction, PlayCardAction, AttackAction


from hearthstone.engine.attack.attack_validator import AttackValidator
from hearthstone.engine.attack.attack_executor import AttackExecutor


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
                choice = input("请选择: ").strip()

                if choice == "1":
                    self._start_game_flow()
                elif choice == "2":
                    self._deck_builder_flow()
                elif choice == "3":
                    self._settings_flow()
                elif choice == "4":
                    self.running = False
                else:
                    self.display.render_error("无效选择")

            except KeyboardInterrupt:
                print("\n退出游戏")
                self.running = False
            except EOF:
                print("\n退出游戏")
                self.running = False
