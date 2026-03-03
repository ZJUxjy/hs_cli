"""命令行界面模块"""

from typing import Optional

from hearthstone_cli.engine.state import GameState
from hearthstone_cli.engine.actions import Action, EndTurnAction, AttackAction, PlayCardAction
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.cli.renderer import TextRenderer


class CLIInterface:
    """命令行界面"""

    def __init__(self, game: GameState):
        self.game = game

    def run(self) -> None:
        """运行游戏循环"""
        while not GameLogic.is_terminal(self.game):
            self._render()

            if self.game.active_player == 0:
                action = self._get_player_action()
                if action is None:
                    break
                self.game = GameLogic.apply_action(self.game, action)
            else:
                print("\n对手思考中...")
                self.game = GameLogic.apply_action(
                    self.game,
                    EndTurnAction(player=1)
                )

        self._render()
        winner = GameLogic.get_winner(self.game)
        if winner == 0:
            print("\n你赢了！")
        elif winner == 1:
            print("\n你输了...")
        else:
            print("\n平局")

    def _render(self) -> None:
        print("\n" + "=" * 60)
        print(TextRenderer.render(self.game))
        print("=" * 60)

    def _get_player_action(self) -> Optional[Action]:
        legal_actions = GameLogic.get_legal_actions(self.game, player=0)

        print("\n可执行的行动:")
        for i, action in enumerate(legal_actions):
            print(f"  [{i}] {self._action_to_str(action)}")

        while True:
            try:
                choice = input("\n选择行动 (或输入 'q' 退出): ").strip()
                if choice.lower() == 'q':
                    return None

                idx = int(choice)
                if 0 <= idx < len(legal_actions):
                    return legal_actions[idx]
                else:
                    print("无效的选择，请重试")
            except ValueError:
                print("请输入数字")

    def _action_to_str(self, action: Action) -> str:
        action_type = type(action).__name__
        if action_type == "EndTurnAction":
            return "结束回合"
        elif action_type == "AttackAction":
            attacker = action.attacker
            defender = action.defender
            # 获取攻击者信息
            if attacker.zone.value == "BOARD":
                minion = self.game.players[attacker.player].board[attacker.index]
                attacker_str = f"{minion.card_id}({minion.attack}/{minion.health})"
            else:
                attacker_str = "英雄"
            # 获取防御者信息
            if defender.zone.value == "BOARD":
                minion = self.game.players[defender.player].board[defender.index]
                defender_str = f"{minion.card_id}({minion.attack}/{minion.health})"
            else:
                defender_str = "敌方英雄"
            return f"攻击: {attacker_str} → {defender_str}"
        elif action_type == "PlayCardAction":
            card = self.game.players[action.player].hand[action.card_index]
            card_type = card.card_type.value

            if card_type == "MINION":
                # 随从牌显示攻击/血量
                stats = f"({card.attack}/{card.health})"
            elif card_type == "SPELL":
                # 法术牌显示"法术"标签
                stats = "(法术)"
            elif card_type == "WEAPON":
                # 武器牌显示攻击/耐久
                stats = f"({card.attack}/{card.durability})"
            else:
                stats = ""

            return f"打出 [{card.cost}费] {card.name} {stats}"
        return action_type
