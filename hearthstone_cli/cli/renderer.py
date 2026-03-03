"""文本渲染器模块"""

from typing import List

from hearthstone_cli.engine.state import GameState, PlayerState, Minion, Attribute


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
        prefix = "对手" if is_opponent else "你"

        hero_line = f"{prefix}: HP {player.hero.health}/30"
        if player.hero.armor > 0:
            hero_line += f" 护甲: {player.hero.armor}"
        hero_line += f" | 水晶: {player.mana.current}/{player.mana.max_mana}"
        lines.append(hero_line)

        if is_opponent:
            lines.append(f"手牌: {len(player.hand)} 张")
        else:
            hand_str = "手牌: " + " ".join(f"[{c.cost}{c.name[:3]}]" for c in player.hand)
            lines.append(hand_str)

        if player.board:
            lines.append("场上:")
            for i, minion in enumerate(player.board):
                minion_str = cls._render_minion(minion, i)
                lines.append(f"  {minion_str}")
        else:
            lines.append("场上: (空)")

        return lines

    @classmethod
    def _render_minion(cls, minion: Minion, index: int) -> str:
        attrs = []
        if Attribute.TAUNT in minion.attributes:
            attrs.append("嘲讽")
        if Attribute.DIVINE_SHIELD in minion.attributes:
            attrs.append("圣盾")
        if Attribute.WINDFURY in minion.attributes:
            attrs.append("风怒")
        if Attribute.CHARGE in minion.attributes:
            attrs.append("冲锋")
        if Attribute.STEALTH in minion.attributes:
            attrs.append("潜行")

        attr_str = f" [{', '.join(attrs)}]" if attrs else ""
        exhausted_str = " (已攻击)" if minion.exhausted else ""

        return f"[{index}] {minion.attack}/{minion.health} {minion.card_id}{attr_str}{exhausted_str}"
