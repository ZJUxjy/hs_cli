"""Tests for game logic."""

import pytest
from dataclasses import replace

from hearthstone_cli.engine.game import GameLogic
from hearthstone_cli.engine.state import (
    Attribute,
    Card,
    Enchantment,
    GameState,
    HeroState,
    ManaState,
    Minion,
    PlayerState,
    RandomState,
    Secret,
)
from hearthstone_cli.engine.actions import (
    Action,
    AttackAction,
    EndTurnAction,
    TargetReference,
    Zone,
)


def create_test_minion(
    card_id: str = "TEST_001",
    attack: int = 2,
    health: int = 3,
    attributes: frozenset = frozenset(),
    exhausted: bool = False,
    summoned_this_turn: bool = False,
) -> Minion:
    """Create a test minion."""
    return Minion(
        card_id=card_id,
        attack=attack,
        health=health,
        max_health=health,
        attributes=attributes,
        enchantments=(),
        damage_taken=0,
        summoned_this_turn=summoned_this_turn,
        exhausted=exhausted,
    )


def create_test_player(
    hero_health: int = 30,
    mana_current: int = 1,
    mana_max: int = 1,
    board: tuple = (),
    exhausted_minions: frozenset = frozenset(),
) -> PlayerState:
    """Create a test player state."""
    return PlayerState(
        hero=HeroState(health=hero_health),
        mana=ManaState(current=mana_current, max_mana=mana_max),
        deck=(),
        hand=(),
        board=board,
        secrets=frozenset(),
        graveyard=(),
        exhausted_minions=exhausted_minions,
        hero_power_used=False,
    )


def create_test_game_state(
    turn: int = 1,
    active_player: int = 0,
    player0: PlayerState = None,
    player1: PlayerState = None,
) -> GameState:
    """Create a test game state."""
    if player0 is None:
        player0 = create_test_player()
    if player1 is None:
        player1 = create_test_player()
    return GameState(
        turn=turn,
        active_player=active_player,
        players=(player0, player1),
        action_history=(),
        rng_state=RandomState(seed=42),
        phase_stack=(),
    )


def test_end_turn_switches_active_player():
    """结束回合切换当前玩家"""
    # Arrange
    player0 = create_test_player(mana_current=5, mana_max=5)
    player1 = create_test_player(mana_current=3, mana_max=3)
    state = create_test_game_state(
        turn=1,
        active_player=0,
        player0=player0,
        player1=player1,
    )
    action = EndTurnAction(player=0)

    # Act
    new_state = GameLogic.apply_action(state, action)

    # Assert
    assert new_state.active_player == 1
    assert new_state.turn == 1  # 同一回合，只是切换玩家


def test_end_turn_increases_mana():
    """结束回合后新玩家法力水晶增加"""
    # Arrange - 玩家1的回合结束，切换到玩家0
    player0 = create_test_player(mana_current=3, mana_max=3)
    player1 = create_test_player(mana_current=5, mana_max=5)
    state = create_test_game_state(
        turn=1,
        active_player=1,
        player0=player0,
        player1=player1,
    )
    action = EndTurnAction(player=1)

    # Act
    new_state = GameLogic.apply_action(state, action)

    # Assert - 玩家0的法力应该增加到4
    assert new_state.active_player == 0
    assert new_state.turn == 2  # 新回合
    assert new_state.players[0].mana.current == 4
    assert new_state.players[0].mana.max_mana == 4


def test_end_turn_resets_minion_exhausted():
    """结束回合重置随从疲劳状态"""
    # Arrange
    minion = create_test_minion(exhausted=True, summoned_this_turn=True)
    player0 = create_test_player(board=(minion,))
    player1 = create_test_player()
    state = create_test_game_state(
        turn=1,
        active_player=1,
        player0=player0,
        player1=player1,
    )
    action = EndTurnAction(player=1)

    # Act
    new_state = GameLogic.apply_action(state, action)

    # Assert - 玩家0的随从应该重置疲劳状态
    new_minion = new_state.players[0].board[0]
    assert new_minion.exhausted is False
    assert new_minion.summoned_this_turn is False


def test_player_with_minion_can_attack():
    """有随从的玩家可以攻击"""
    # Arrange
    minion = create_test_minion(attack=2, health=3)
    player0 = create_test_player(board=(minion,))
    player1 = create_test_player()
    state = create_test_game_state(
        turn=1,
        active_player=0,
        player0=player0,
        player1=player1,
    )

    # Act
    actions = GameLogic.get_legal_actions(state, player=0)

    # Assert
    end_turn_actions = [a for a in actions if isinstance(a, EndTurnAction)]
    attack_actions = [a for a in actions if isinstance(a, AttackAction)]

    assert len(end_turn_actions) == 1
    assert len(attack_actions) >= 1  # 至少有一个攻击动作（攻击敌方英雄）

    # 检查攻击动作指向敌方英雄
    hero_attack = [a for a in attack_actions
                   if a.defender.zone == Zone.HERO and a.defender.player == 1]
    assert len(hero_attack) == 1


def test_newly_summoned_minion_cannot_attack():
    """新召唤的随从本回合不能攻击"""
    # Arrange
    minion = create_test_minion(attack=2, health=3, summoned_this_turn=True)
    player0 = create_test_player(board=(minion,))
    player1 = create_test_player()
    state = create_test_game_state(
        turn=1,
        active_player=0,
        player0=player0,
        player1=player1,
    )

    # Act
    actions = GameLogic.get_legal_actions(state, player=0)

    # Assert
    attack_actions = [a for a in actions if isinstance(a, AttackAction)]
    assert len(attack_actions) == 0  # 没有攻击动作


def test_charge_minion_can_attack_immediately():
    """冲锋随从可以立即攻击"""
    # Arrange
    minion = create_test_minion(
        attack=2,
        health=3,
        summoned_this_turn=True,
        attributes=frozenset({Attribute.CHARGE}),
    )
    player0 = create_test_player(board=(minion,))
    player1 = create_test_player()
    state = create_test_game_state(
        turn=1,
        active_player=0,
        player0=player0,
        player1=player1,
    )

    # Act
    actions = GameLogic.get_legal_actions(state, player=0)

    # Assert
    attack_actions = [a for a in actions if isinstance(a, AttackAction)]
    assert len(attack_actions) >= 1  # 冲锋随从可以攻击


def test_exhausted_minion_cannot_attack():
    """已疲劳的随从不能攻击"""
    # Arrange
    minion = create_test_minion(attack=2, health=3, exhausted=True)
    player0 = create_test_player(board=(minion,))
    player1 = create_test_player()
    state = create_test_game_state(
        turn=1,
        active_player=0,
        player0=player0,
        player1=player1,
    )

    # Act
    actions = GameLogic.get_legal_actions(state, player=0)

    # Assert
    attack_actions = [a for a in actions if isinstance(a, AttackAction)]
    assert len(attack_actions) == 0  # 没有攻击动作


def test_zero_attack_minion_cannot_attack():
    """攻击力为0的随从不能攻击"""
    # Arrange
    minion = create_test_minion(attack=0, health=3)
    player0 = create_test_player(board=(minion,))
    player1 = create_test_player()
    state = create_test_game_state(
        turn=1,
        active_player=0,
        player0=player0,
        player1=player1,
    )

    # Act
    actions = GameLogic.get_legal_actions(state, player=0)

    # Assert
    attack_actions = [a for a in actions if isinstance(a, AttackAction)]
    assert len(attack_actions) == 0  # 没有攻击动作


def test_attack_deals_damage():
    """攻击会造成伤害"""
    # Arrange
    attacker_minion = create_test_minion(attack=3, health=5)
    defender_minion = create_test_minion(attack=2, health=4)
    player0 = create_test_player(board=(attacker_minion,))
    player1 = create_test_player(board=(defender_minion,))
    state = create_test_game_state(
        turn=1,
        active_player=0,
        player0=player0,
        player1=player1,
    )
    action = AttackAction(
        player=0,
        attacker=TargetReference.board(0, 0),
        defender=TargetReference.board(1, 0),
    )

    # Act
    new_state = GameLogic.apply_action(state, action)

    # Assert
    new_attacker = new_state.players[0].board[0]
    new_defender = new_state.players[1].board[0]

    # 攻击者受到防御者的攻击力伤害
    assert new_attacker.damage_taken == defender_minion.attack  # 2点伤害
    # 防御者受到攻击者的攻击力伤害
    assert new_defender.damage_taken == attacker_minion.attack  # 3点伤害


def test_attack_marks_attacker_exhausted():
    """攻击后标记攻击者为疲劳状态"""
    # Arrange
    attacker_minion = create_test_minion(attack=3, health=5)
    defender_minion = create_test_minion(attack=2, health=4)
    player0 = create_test_player(board=(attacker_minion,))
    player1 = create_test_player(board=(defender_minion,))
    state = create_test_game_state(
        turn=1,
        active_player=0,
        player0=player0,
        player1=player1,
    )
    action = AttackAction(
        player=0,
        attacker=TargetReference.board(0, 0),
        defender=TargetReference.board(1, 0),
    )

    # Act
    new_state = GameLogic.apply_action(state, action)

    # Assert
    assert 0 in new_state.players[0].exhausted_minions


def test_attack_hero_deals_damage_to_hero():
    """攻击英雄会对英雄造成伤害"""
    # Arrange
    attacker_minion = create_test_minion(attack=3, health=5)
    player0 = create_test_player(board=(attacker_minion,))
    player1 = create_test_player(hero_health=30)
    state = create_test_game_state(
        turn=1,
        active_player=0,
        player0=player0,
        player1=player1,
    )
    action = AttackAction(
        player=0,
        attacker=TargetReference.board(0, 0),
        defender=TargetReference.hero(1),
    )

    # Act
    new_state = GameLogic.apply_action(state, action)

    # Assert
    assert new_state.players[1].hero.health == 27  # 30 - 3 = 27


def test_taunt_blocks_attacks_on_others():
    """嘲讽随从会阻止对其他目标的攻击"""
    # Arrange
    attacker_minion = create_test_minion(attack=3, health=5)
    taunt_minion = create_test_minion(
        attack=2,
        health=4,
        attributes=frozenset({Attribute.TAUNT}),
    )
    normal_minion = create_test_minion(attack=1, health=2)
    player0 = create_test_player(board=(attacker_minion,))
    player1 = create_test_player(board=(taunt_minion, normal_minion))
    state = create_test_game_state(
        turn=1,
        active_player=0,
        player0=player0,
        player1=player1,
    )

    # Act
    actions = GameLogic.get_legal_actions(state, player=0)

    # Assert
    attack_actions = [a for a in actions if isinstance(a, AttackAction)]

    # 所有攻击都必须指向嘲讽随从
    for action in attack_actions:
        assert action.defender.zone == Zone.BOARD
        assert action.defender.index == 0  # 嘲讽随从的索引


def test_inactive_player_cannot_attack():
    """非活跃玩家不能攻击"""
    # Arrange
    minion = create_test_minion(attack=2, health=3)
    player0 = create_test_player(board=(minion,))
    player1 = create_test_player()
    state = create_test_game_state(
        turn=1,
        active_player=0,  # 玩家0是活跃玩家
        player0=player0,
        player1=player1,
    )

    # Act - 获取玩家1的合法动作
    actions = GameLogic.get_legal_actions(state, player=1)

    # Assert
    attack_actions = [a for a in actions if isinstance(a, AttackAction)]
    assert len(attack_actions) == 0  # 玩家1不能攻击


def test_inactive_player_can_only_end_turn():
    """非活跃玩家只能结束回合（但通常不应该）"""
    # Arrange
    player0 = create_test_player()
    player1 = create_test_player()
    state = create_test_game_state(
        turn=1,
        active_player=0,
        player0=player0,
        player1=player1,
    )

    # Act - 获取玩家1的合法动作
    actions = GameLogic.get_legal_actions(state, player=1)

    # Assert
    assert len(actions) == 1
    assert isinstance(actions[0], EndTurnAction)
