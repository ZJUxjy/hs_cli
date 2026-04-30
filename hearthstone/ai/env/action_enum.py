"""Flat action types for FireplaceGymEnv.

Action enumeration produces a list[Action] each step; index 0 is always
EndTurnAction(). The agent picks an index. dispatch() decodes back to
fireplace API calls.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Union


@dataclass(frozen=True)
class EndTurnAction:
    pass


@dataclass(frozen=True)
class PlayCardAction:
    card_idx_in_hand: int
    target_entity_id: Optional[int]
    board_index: Optional[int]
    choose: Optional[str]


@dataclass(frozen=True)
class AttackAction:
    attacker_entity_id: int
    target_entity_id: int


@dataclass(frozen=True)
class HeroPowerAction:
    target_entity_id: Optional[int]


Action = Union[EndTurnAction, PlayCardAction, AttackAction, HeroPowerAction]


import logging
from .choose_one_policy import ChooseOnePolicy

logger = logging.getLogger(__name__)


def enumerate_valid_actions(player, choose_one_policy: ChooseOnePolicy) -> list[Action]:
    """Return the flat list of actions valid for `player`. Index 0 is always EndTurnAction."""
    actions: list[Action] = [EndTurnAction()]

    # Hand → PlayCardAction
    for i, card in enumerate(player.hand):
        if not card.is_playable():
            continue
        if getattr(card, "must_choose_one", False):
            sub_card = choose_one_policy.choose(card)
            chosen_id = sub_card.id
            target_source = sub_card
        else:
            chosen_id = None
            target_source = card
        targets = list(target_source.play_targets) or [None]
        for target in targets:
            tid = target.entity_id if target is not None else None
            actions.append(PlayCardAction(
                card_idx_in_hand=i,
                target_entity_id=tid,
                board_index=None,
                choose=chosen_id,
            ))

    # Field minions → AttackAction
    for minion in player.field:
        if not minion.can_attack():
            continue
        for target in minion.attack_targets:
            actions.append(AttackAction(minion.entity_id, target.entity_id))

    # Hero power → HeroPowerAction
    hp = player.hero_power
    if hp is not None and hp.is_usable():
        targets = list(hp.play_targets) or [None]
        for target in targets:
            tid = target.entity_id if target is not None else None
            actions.append(HeroPowerAction(tid))

    return actions


def _resolve_entity(game, entity_id: int):
    """O(N) scan over game.entities."""
    for e in game.entities:
        if e.entity_id == entity_id:
            return e
    raise KeyError(f"No entity with id {entity_id}")


def dispatch(action: Action, game) -> None:
    """Translate an Action into fireplace API calls."""
    from fireplace.exceptions import GameOver
    try:
        if isinstance(action, EndTurnAction):
            game.end_turn()
        elif isinstance(action, PlayCardAction):
            player = game.current_player
            card = player.hand[action.card_idx_in_hand]
            target = (_resolve_entity(game, action.target_entity_id)
                      if action.target_entity_id is not None else None)
            card.play(target=target, index=action.board_index, choose=action.choose)
        elif isinstance(action, AttackAction):
            attacker = _resolve_entity(game, action.attacker_entity_id)
            target = _resolve_entity(game, action.target_entity_id)
            attacker.attack(target)
        elif isinstance(action, HeroPowerAction):
            hp = game.current_player.hero_power
            target = (_resolve_entity(game, action.target_entity_id)
                      if action.target_entity_id is not None else None)
            hp.use(target=target)
        else:
            raise TypeError(f"Unknown action type: {type(action).__name__}")
    except GameOver:
        pass
