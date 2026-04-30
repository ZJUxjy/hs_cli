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
