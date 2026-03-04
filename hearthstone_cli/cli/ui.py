"""命令行界面模块"""

from typing import Optional

from hearthstone_cli.engine.state import GameState
from hearthstone_cli.engine.actions import Action, EndTurnAction, AttackAction, PlayCardAction
from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.cli.renderer import TextRenderer
from hearthstone_cli.i18n import _


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
                print("\n" + _("Opponent is thinking..."))
                self.game = GameLogic.apply_action(
                    self.game,
                    EndTurnAction(player=1)
                )

        self._render()
        winner = GameLogic.get_winner(self.game)
        if winner == 0:
            print("\n" + _("You win!"))
        elif winner == 1:
            print("\n" + _("You lose..."))
        else:
            print("\n" + _("Draw"))

    def _render(self) -> None:
        print("\n" + "=" * 60)
        print(TextRenderer.render(self.game))
        print("=" * 60)

    def _get_player_action(self) -> Optional[Action]:
        legal_actions = GameLogic.get_legal_actions(self.game, player=0)

        print("\n" + _("Available actions:"))
        for i, action in enumerate(legal_actions):
            print(f"  [{i}] {self._action_to_str(action)}")

        while True:
            try:
                choice = input(_("Choose action (or 'q' to quit): ")).strip()
                if choice.lower() == 'q':
                    return None

                idx = int(choice)
                if 0 <= idx < len(legal_actions):
                    return legal_actions[idx]
                else:
                    print(_("Invalid choice, please try again"))
            except ValueError:
                print(_("Please enter a number"))

    def _action_to_str(self, action: Action) -> str:
        action_type = type(action).__name__
        if action_type == "EndTurnAction":
            return _("End Turn")
        elif action_type == "AttackAction":
            attacker = action.attacker
            defender = action.defender
            # 获取攻击者信息
            if attacker.zone.value == "BOARD":
                minion = self.game.players[attacker.player].board[attacker.index]
                attacker_str = f"{minion.card_id}({minion.attack}/{minion.health})"
            else:
                attacker_str = _("Hero")
            # 获取防御者信息
            if defender.zone.value == "BOARD":
                minion = self.game.players[defender.player].board[defender.index]
                defender_str = f"{minion.card_id}({minion.attack}/{minion.health})"
            else:
                defender_str = _("Enemy Hero")
            return _("Attack: {} → {}").format(attacker_str, defender_str)
        elif action_type == "PlayCardAction":
            card = self.game.players[action.player].hand[action.card_index]
            card_type = card.card_type

            if card_type == "MINION":
                # 随从牌显示攻击/血量
                stats = f"({card.attack}/{card.health})"
            elif card_type == "SPELL":
                # 法术牌显示"法术"标签
                stats = _("(Spell)")
            elif card_type == "WEAPON":
                # 武器牌显示攻击/耐久
                stats = f"({card.attack}/{card.durability})"
            else:
                stats = ""

            return _("Play [{} mana] {} {}").format(card.cost, card.name, stats)
        elif action_type == "HeroPowerAction":
            hero_power = self.game.players[action.player].hero.hero_power
            if hero_power:
                return _("Hero Power: {} ({} mana)").format(hero_power.name, hero_power.cost)
            return _("Hero Power")
        return action_type
