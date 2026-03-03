"""Game logic for Hearthstone CLI game."""

from dataclasses import replace
from typing import List

from hearthstone_cli.engine.state import (
    Attribute,
    GameState,
    ManaState,
    Minion,
    PlayerState,
)
from hearthstone_cli.engine.actions import (
    Action,
    AttackAction,
    EndTurnAction,
    TargetReference,
    Zone,
)


class GameLogic:
    """游戏逻辑核心 - 纯静态方法，所有操作都是纯函数"""

    @classmethod
    def apply_action(cls, state: GameState, action: Action) -> GameState:
        """应用行动，返回新状态"""
        if isinstance(action, EndTurnAction):
            return cls._apply_end_turn(state, action)
        elif isinstance(action, AttackAction):
            return cls._apply_attack(state, action)
        else:
            return state

    @classmethod
    def _apply_end_turn(cls, state: GameState, action: EndTurnAction) -> GameState:
        """应用结束回合"""
        new_active = 1 - state.active_player
        new_turn = state.turn + (1 if new_active == 0 else 0)

        players = list(state.players)
        current = players[new_active]

        # 重置水晶
        new_max = min(10, current.mana.max_mana + 1)
        new_mana = ManaState(current=new_max, max_mana=new_max, overload=0, locked=0)

        # 重置随从状态
        new_board = tuple(
            replace(m, exhausted=False, summoned_this_turn=False)
            for m in current.board
        )

        players[new_active] = replace(
            current,
            mana=new_mana,
            hero_power_used=False,
            exhausted_minions=frozenset(),
            board=new_board
        )

        return replace(
            state,
            turn=new_turn,
            active_player=new_active,
            players=tuple(players)
        )

    @classmethod
    def _apply_attack(cls, state: GameState, action: AttackAction) -> GameState:
        """应用攻击（简化版）"""
        players = list(state.players)
        attacker_player = players[action.player]
        defender_player = players[1 - action.player]

        # 获取攻击者和防御者
        if action.attacker.zone == Zone.BOARD:
            attacker_idx = action.attacker.index
            attacker = attacker_player.board[attacker_idx]
        else:
            return state  # 英雄攻击稍后实现

        if action.defender.zone == Zone.BOARD:
            defender_idx = action.defender.index
            defender = defender_player.board[defender_idx]
        elif action.defender.zone == Zone.HERO:
            defender = None
            defender_health = defender_player.hero.health
        else:
            return state

        attacker_attack = attacker.attack
        defender_attack = defender.attack if defender else 0

        # 更新攻击者（受到反击伤害，仅当攻击随从时）
        if defender:
            new_attacker = replace(attacker, damage_taken=attacker.damage_taken + defender_attack)
        else:
            new_attacker = attacker  # 攻击英雄不受反击伤害
        new_board = list(attacker_player.board)
        new_board[attacker_idx] = new_attacker
        attacker_player = replace(attacker_player, board=tuple(new_board))

        # 更新防御者
        if defender:
            new_defender = replace(defender, damage_taken=defender.damage_taken + attacker_attack)
            new_board = list(defender_player.board)
            new_board[defender_idx] = new_defender
            defender_player = replace(defender_player, board=tuple(new_board))
        else:
            new_hero = replace(defender_player.hero, health=defender_health - attacker_attack)
            defender_player = replace(defender_player, hero=new_hero)

        # 标记攻击者已疲劳
        exhausted = set(attacker_player.exhausted_minions)
        exhausted.add(attacker_idx)
        attacker_player = replace(attacker_player, exhausted_minions=frozenset(exhausted))

        players[action.player] = attacker_player
        players[1 - action.player] = defender_player

        return replace(state, players=tuple(players))

    @classmethod
    def get_legal_actions(cls, state: GameState, player: int) -> List[Action]:
        """获取玩家所有合法行动"""
        actions: List[Action] = [EndTurnAction(player=player)]

        if state.active_player != player:
            return actions

        player_state = state.players[player]

        # 可以攻击的随从
        for i, minion in enumerate(player_state.board):
            if cls._can_attack(minion, player_state):
                enemy = state.players[1 - player]
                taunts = [j for j, m in enumerate(enemy.board) if Attribute.TAUNT in m.attributes]

                if taunts:
                    for t in taunts:
                        actions.append(AttackAction(
                            player=player,
                            attacker=TargetReference.board(player, i),
                            defender=TargetReference.board(1 - player, t)
                        ))
                else:
                    actions.append(AttackAction(
                        player=player,
                        attacker=TargetReference.board(player, i),
                        defender=TargetReference.hero(1 - player)
                    ))
                    for j, _ in enumerate(enemy.board):
                        actions.append(AttackAction(
                            player=player,
                            attacker=TargetReference.board(player, i),
                            defender=TargetReference.board(1 - player, j)
                        ))

        return actions

    @classmethod
    def _can_attack(cls, minion: Minion, player: PlayerState) -> bool:
        """检查随从是否可以攻击"""
        if minion.attack <= 0:
            return False
        if Attribute.CHARGE in minion.attributes:
            return not minion.exhausted
        if minion.summoned_this_turn:
            return False
        return not minion.exhausted
