"""文本渲染器模块"""

from typing import List

from hearthstone_cli.engine.state import GameState, PlayerState, Minion, Attribute
from hearthstone_cli.i18n import _


class TextRenderer:
    """文本渲染器"""

    @classmethod
    def render(cls, game: GameState) -> str:
        """渲染游戏状态为文本"""
        lines = []
        opponent = game.players[1]
        lines.extend(cls._render_player(opponent, is_opponent=True))
        lines.append("")
        lines.append("-" * 60)
        lines.append("")
        player = game.players[0]
        lines.extend(cls._render_player(player, is_opponent=False))
        return "\n".join(lines)

    @classmethod
    def _render_player(cls, player: PlayerState, is_opponent: bool) -> List[str]:
        lines = []
        prefix = _("Opponent") if is_opponent else _("You")

        hero_line = f"{prefix}: HP {player.hero.health}/30"
        if player.hero.armor > 0:
            hero_line += f"  {_('Armor')}: {player.hero.armor}"
        hero_line += f" | {_('Mana')}: {player.mana.current}/{player.mana.max_mana}"
        lines.append(hero_line)

        if is_opponent:
            lines.append(_("Hand: {} cards").format(len(player.hand)))
        else:
            hand_str = _("Hand: ") + " ".join(f"[{c.cost}{c.name[:3]}]" for c in player.hand)
            lines.append(hand_str)

        if player.board:
            lines.append(_("Board:"))
            for i, minion in enumerate(player.board):
                minion_str = cls._render_minion(minion, i)
                lines.append(f"  {minion_str}")
        else:
            lines.append(_("Board: (empty)"))

        return lines

    @classmethod
    def _render_minion(cls, minion: Minion, index: int) -> str:
        attrs = []
        if Attribute.TAUNT in minion.attributes:
            attrs.append(_("Taunt"))
        if Attribute.DIVINE_SHIELD in minion.attributes:
            attrs.append(_("Divine Shield"))
        if Attribute.WINDFURY in minion.attributes:
            attrs.append(_("Windfury"))
        if Attribute.CHARGE in minion.attributes:
            attrs.append(_("Charge"))
        if Attribute.STEALTH in minion.attributes:
            attrs.append(_("Stealth"))
        if Attribute.POISONOUS in minion.attributes:
            attrs.append(_("Poisonous"))
        if Attribute.LIFESTEAL in minion.attributes:
            attrs.append(_("Lifesteal"))

        attr_str = f" [{', '.join(attrs)}]" if attrs else ""
        exhausted_str = f" ({_('Exhausted')})" if minion.exhausted else ""

        return f"[{index}] {minion.attack}/{minion.health} {minion.card_id}{attr_str}{exhausted_str}"
