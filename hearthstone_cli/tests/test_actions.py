"""Tests for action definitions."""

from dataclasses import FrozenInstanceError

import pytest
from hearthstone_cli.engine.actions import (
    Zone,
    TargetReference,
    Action,
    PlayCardAction,
    AttackAction,
    HeroPowerAction,
    EndTurnAction,
)


def test_play_card_action_creation():
    target = TargetReference(Zone.HERO, player=1, index=0)
    action = PlayCardAction(
        player=0,
        card_index=2,
        target=target,
        board_position=3
    )
    assert action.player == 0
    assert action.card_index == 2
    assert action.target == target
    assert action.board_position == 3


def test_attack_action_creation():
    """测试攻击行动创建"""
    attacker = TargetReference.board(player=0, index=0)
    defender = TargetReference.hero(player=1)
    action = AttackAction(
        player=0,
        attacker=attacker,
        defender=defender
    )
    assert action.player == 0
    assert action.attacker == attacker
    assert action.defender == defender
    assert action.attacker.zone == Zone.BOARD
    assert action.defender.zone == Zone.HERO


def test_hero_power_action_creation():
    """测试英雄技能行动创建"""
    target = TargetReference.board(player=1, index=0)
    action = HeroPowerAction(
        player=0,
        target=target
    )
    assert action.player == 0
    assert action.target == target


def test_end_turn_action():
    """测试结束回合行动"""
    action = EndTurnAction(player=0)
    assert action.player == 0


def test_actions_are_frozen():
    """测试不可变性"""
    action = EndTurnAction(player=0)
    with pytest.raises(FrozenInstanceError):
        action.player = 1

    target = TargetReference.hero(player=0)
    with pytest.raises(FrozenInstanceError):
        target.player = 1

    play_action = PlayCardAction(
        player=0,
        card_index=1,
        target=None
    )
    with pytest.raises(FrozenInstanceError):
        play_action.card_index = 2


def test_target_reference_equality():
    """测试目标引用相等性"""
    target1 = TargetReference(Zone.HERO, player=0, index=0)
    target2 = TargetReference(Zone.HERO, player=0, index=0)
    target3 = TargetReference(Zone.HERO, player=1, index=0)

    assert target1 == target2
    assert target1 != target3
    assert hash(target1) == hash(target2)
    assert hash(target1) != hash(target3)


def test_target_reference_classmethods():
    """测试快捷方法 hero(), board(), hand()"""
    hero_target = TargetReference.hero(player=0)
    assert hero_target.zone == Zone.HERO
    assert hero_target.player == 0
    assert hero_target.index == 0

    hero_target2 = TargetReference.hero(player=1)
    assert hero_target2.player == 1

    board_target = TargetReference.board(player=0, index=2)
    assert board_target.zone == Zone.BOARD
    assert board_target.player == 0
    assert board_target.index == 2

    hand_target = TargetReference.hand(player=1, index=3)
    assert hand_target.zone == Zone.HAND
    assert hand_target.player == 1
    assert hand_target.index == 3


def test_zone_enum_values():
    """测试 Zone 枚举包含所有需要的值"""
    assert Zone.DECK.name == "DECK"
    assert Zone.HAND.name == "HAND"
    assert Zone.BOARD.name == "BOARD"
    assert Zone.GRAVEYARD.name == "GRAVEYARD"
    assert Zone.HERO.name == "HERO"
    assert Zone.WEAPON.name == "WEAPON"
    assert Zone.HERO_POWER.name == "HERO_POWER"


def test_play_card_action_default_board_position():
    """测试 PlayCardAction 的 board_position 默认值"""
    action = PlayCardAction(
        player=0,
        card_index=1,
        target=None
    )
    assert action.board_position == 0


def test_play_card_action_with_none_target():
    """测试 PlayCardAction 允许 target 为 None"""
    action = PlayCardAction(
        player=0,
        card_index=1,
        target=None
    )
    assert action.target is None


def test_hero_power_action_with_none_target():
    """测试 HeroPowerAction 允许 target 为 None"""
    action = HeroPowerAction(
        player=0,
        target=None
    )
    assert action.target is None
