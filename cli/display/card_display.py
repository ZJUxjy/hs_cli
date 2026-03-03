"""Card display component using Rich for rendering Hearthstone cards."""
from typing import List
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.console import Console

from hearthstone.models.card import Minion, Spell, Weapon
from hearthstone.models.enums import Ability, HeroClass


class CardDisplay:
    """Display component for rendering Hearthstone cards using Rich."""

    # Color scheme for different card types
    MINION_COLOR = "yellow"
    SPELL_COLOR = "blue"
    WEAPON_COLOR = "orange3"

    # Color scheme for hero classes
    CLASS_COLORS = {
        HeroClass.WARRIOR: "red",
        HeroClass.SHAMAN: "blue",
        HeroClass.ROGUE: "bright_black",
        HeroClass.PALADIN: "yellow",
        HeroClass.HUNTER: "green",
        HeroClass.DRUID: "dark_orange",
        HeroClass.WARLOCK: "purple",
        HeroClass.MAGE: "cyan",
        HeroClass.PRIEST: "white",
        HeroClass.DEMON_HUNTER: "bright_magenta",
        HeroClass.NEUTRAL: "gray",
    }

    # Ability icons/symbols
    ABILITY_ICONS = {
        Ability.CHARGE: "⚡",
        Ability.TAUNT: "🛡",
        Ability.DIVINE_SHIELD: "✨",
        Ability.WINDFURY: "🌀",
        Ability.STEALTH: "👁‍🗨",
        Ability.FROZEN: "❄",
        Ability.POISONOUS: "☠",
        Ability.LIFESTEAL: "💜",
        Ability.RUSH: "🏃",
        Ability.REBORN: "🔥",
        Ability.SPELL_DAMAGE: "✴",
    }

    @staticmethod
    def render_minion(minion: Minion) -> Panel:
        """Render a minion card as a Rich Panel.

        Args:
            minion: The minion card to render

        Returns:
            A Rich Panel containing the formatted minion card
        """
        # Build card content
        content_lines = []

        # Name and cost
        title = Text()
        title.append(f"[{minion.cost}] ", style="bold cyan")
        title.append(minion.name, style="bold")

        # Attack and health
        stats = Text()
        stats.append(f"Attack: {minion.attack}", style="red")
        stats.append(" | ", style="dim")
        health_style = "green" if minion.health >= minion.max_health else "yellow"
        stats.append(f"Health: {minion.health}/{minion.max_health}", style=health_style)
        content_lines.append(stats)

        # Abilities
        if minion.abilities:
            abilities_text = Text()
            abilities_list = []
            for ability in minion.abilities:
                icon = CardDisplay.ABILITY_ICONS.get(ability, "★")
                abilities_list.append(f"{icon} {ability.value}")
            abilities_text.append(" | ".join(abilities_list), style="magenta")
            content_lines.append(abilities_text)

        # Description
        if minion.description:
            desc_text = Text(minion.description, style="italic dim")
            content_lines.append(desc_text)

        # Hero class
        if minion.hero_class:
            class_color = CardDisplay.CLASS_COLORS.get(minion.hero_class, "white")
            class_text = Text()
            class_text.append(f"Class: {minion.hero_class.value}", style=class_color)
            content_lines.append(class_text)

        # Create panel
        panel_content = Text("\n").join(content_lines)

        return Panel(
            panel_content,
            title=title,
            border_style=CardDisplay.MINION_COLOR,
            padding=(0, 1),
        )

    @staticmethod
    def render_spell(spell: Spell) -> Panel:
        """Render a spell card as a Rich Panel.

        Args:
            spell: The spell card to render

        Returns:
            A Rich Panel containing the formatted spell card
        """
        # Build card content
        content_lines = []

        # Name and cost
        title = Text()
        title.append(f"[{spell.cost}] ", style="bold cyan")
        title.append(spell.name, style="bold")

        # Description
        if spell.description:
            desc_text = Text(spell.description, style="italic")
            content_lines.append(desc_text)

        # Hero class
        if spell.hero_class:
            class_color = CardDisplay.CLASS_COLORS.get(spell.hero_class, "white")
            class_text = Text()
            class_text.append(f"Class: {spell.hero_class.value}", style=class_color)
            content_lines.append(class_text)

        # Create panel
        if content_lines:
            panel_content = Text("\n").join(content_lines)
        else:
            panel_content = Text("No description", style="dim italic")

        return Panel(
            panel_content,
            title=title,
            border_style=CardDisplay.SPELL_COLOR,
            padding=(0, 1),
        )

    @staticmethod
    def render_weapon(weapon: Weapon) -> Panel:
        """Render a weapon card as a Rich Panel.

        Args:
            weapon: The weapon card to render

        Returns:
            A Rich Panel containing the formatted weapon card
        """
        # Build card content
        content_lines = []

        # Name and cost
        title = Text()
        title.append(f"[{weapon.cost}] ", style="bold cyan")
        title.append(weapon.name, style="bold")

        # Attack and durability
        stats = Text()
        stats.append(f"Attack: {weapon.attack}", style="red")
        stats.append(" | ", style="dim")
        stats.append(f"Durability: {weapon.durability}", style="blue")
        content_lines.append(stats)

        # Description
        if weapon.description:
            desc_text = Text(weapon.description, style="italic dim")
            content_lines.append(desc_text)

        # Hero class
        if weapon.hero_class:
            class_color = CardDisplay.CLASS_COLORS.get(weapon.hero_class, "white")
            class_text = Text()
            class_text.append(f"Class: {weapon.hero_class.value}", style=class_color)
            content_lines.append(class_text)

        # Create panel
        panel_content = Text("\n").join(content_lines)

        return Panel(
            panel_content,
            title=title,
            border_style=CardDisplay.WEAPON_COLOR,
            padding=(0, 1),
        )

    @staticmethod
    def render_minion_board(minions: List[Minion]) -> Table:
        """Render minions on the board as a Rich Table.

        Args:
            minions: List of minions on the board

        Returns:
            A Rich Table containing the formatted minions
        """
        # Create table
        table = Table(show_header=True, header_style="bold", expand=False)
        table.add_column("#", style="dim", width=3)
        table.add_column("Name", style="bold", width=20)
        table.add_column("ATK", justify="right", style="red", width=4)
        table.add_column("HP", justify="right", width=6)
        table.add_column("Abilities", width=30)

        # Add minions to table
        for idx, minion in enumerate(minions, start=1):
            # Format abilities
            abilities_str = ""
            if minion.abilities:
                ability_parts = []
                for ability in minion.abilities:
                    icon = CardDisplay.ABILITY_ICONS.get(ability, "★")
                    ability_parts.append(f"{icon}{ability.value[:4]}")  # Abbreviated
                abilities_str = " ".join(ability_parts)

            # Format health (show current/max if damaged)
            if minion.health < minion.max_health:
                hp_str = f"{minion.health}/{minion.max_health}"
                hp_style = "yellow"
            else:
                hp_str = str(minion.health)
                hp_style = "green"

            # Add row
            table.add_row(
                str(idx),
                minion.name,
                str(minion.attack),
                f"[{hp_style}]{hp_str}[/{hp_style}]",
                abilities_str,
            )

        return table
