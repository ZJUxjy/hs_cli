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
            return f"攻击"
        elif action_type == "PlayCardAction":
            return f"打出卡牌"
        return action_type
