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
