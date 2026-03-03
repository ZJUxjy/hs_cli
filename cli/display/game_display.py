"""Game state display using Rich."""
from rich.console import Console
from rich.panel import Panel
from rich.columns import Columns
from rich.table import Table
from rich.text import Text

from hearthstone.models.game_state import GameState
from hearthstone.models.player import Player
from hearthstone.models.card import Minion, Spell, Weapon, Card
from cli.display.card_display import CardDisplay


class GameDisplay:
    """Display complete game state using Rich."""

    def __init__(self):
        self.console = Console()

    def render_game_state(self, game_state: GameState):
        """Render complete game state."""
        self.console.clear()

        # Render opponent info
        self._render_player_header(game_state.opposing_player, "Opponent")

        # Render board
        self._render_board(game_state)

        # Render current player info
        self._render_player_header(game_state.current_player, "Your Hero")

        # Render hand
        self._render_hand(game_state.current_player)

    def _render_player_header(self, player: Player, label: str):
        """Render player information header."""
        table = Table(title=f"{label}: {player.name}")
        table.add_column("Class", justify="center")
        table.add_column("Health", justify="center")
        table.add_column("Armor", justify="center")
        table.add_column("Mana", justify="center")
        table.add_column("Hand", justify="center")

        table.add_row(
            player.hero.hero_class.value,
            f"[red]{player.hero.health}[/red]/[green]{player.hero.max_health}[/green]",
            str(player.hero.armor),
            f"[blue]{player.mana}/{player.max_mana}[/blue]",
            str(len(player.hand))
        )

        self.console.print(table)

    def _render_board(self, game_state: GameState):
        """Render the board with minions."""
        self.console.print("\n[bold]Battlefield[/bold]\n")

        # Opponent's minions
        if game_state.opposing_player.board:
            opponent_minions = CardDisplay.render_minion_board(
                game_state.opposing_player.board
            )
            self.console.print(opponent_minions)
        else:
            self.console.print("[dim]Opponent has no minions[/dim]")

        self.console.print("\n" + "-" * 50 + "\n")

        # Current player's minions
        if game_state.current_player.board:
            player_minions = CardDisplay.render_minion_board(
                game_state.current_player.board
            )
            self.console.print(player_minions)
        else:
            self.console.print("[dim]You have no minions[/dim]")

        self.console.print()

    def _render_hand(self, player: Player):
        """Render player's hand."""
        self.console.print("\n[bold]Your Hand[/bold]\n")

        if not player.hand:
            self.console.print("[dim]Hand is empty[/dim]")
            return

        for i, card in enumerate(player.hand, 1):
            if isinstance(card, Minion):
                card_str = self._render_minion_inline(card)
            elif isinstance(card, Spell):
                card_str = self._render_spell_inline(card)
            elif isinstance(card, Weapon):
                card_str = self._render_weapon_inline(card)
            else:
                card_str = f"{card.name} (Cost: {card.cost})"

            self.console.print(f"[{i}] {card_str}")

    def _render_minion_inline(self, minion: Minion) -> str:
        """Render minion as inline string."""
        parts = [f"[bold]{minion.name}[/bold]"]
        parts.append(f"[dim]Cost: {minion.cost}[/dim]")
        parts.append(f"[red]{minion.attack}[/red]/[green]{minion.health}[/green]")

        if minion.abilities:
            abilities_str = ", ".join(a.value for a in minion.abilities)
            parts.append(f"[yellow]{abilities_str}[/yellow]")

        return " | ".join(parts)

    def _render_spell_inline(self, spell: Spell) -> str:
        """Render spell as inline string."""
        parts = [f"[bold]{spell.name}[/bold]"]
        parts.append(f"[dim]Cost: {spell.cost}[/dim]")
        if spell.description:
            parts.append(f"[italic]{spell.description}[/italic]")
        return " | ".join(parts)

    def _render_weapon_inline(self, weapon: Weapon) -> str:
        """Render weapon as inline string."""
        parts = [f"[bold]{weapon.name}[/bold]"]
        parts.append(f"[dim]Cost: {weapon.cost}[/dim]")
        parts.append(f"[red]{weapon.attack}[/red]/[blue]{weapon.durability}[/blue]")
        return " | ".join(parts)
