"""Action system for Hearthstone game engine."""
from dataclasses import dataclass
from typing import Optional, Any
from abc import ABC, abstractmethod


@dataclass
class Action(ABC):
    """Base action class."""
    player_id: str

    @property
    @abstractmethod
    def action_type(self) -> str:
        """Return action type."""
        pass


@dataclass
class EndTurnAction(Action):
    """Action to end current turn."""
    action_type: str = "END_TURN"


@dataclass
class PlayCardAction(Action):
    """Action to play a card from hand."""
    card_index: int = 0
    target_id: Optional[str] = None
    action_type: str = "PLAY_CARD"


@dataclass
class AttackAction(Action):
    """Action to attack with a minion or hero."""
    attacker_id: str = ""
    target_id: str = ""
    action_type: str = "ATTACK"


@dataclass
class HeroPowerAction(Action):
    """Action to use hero power."""
    target_id: Optional[str] = None
    action_type: str = "HERO_POWER"


@dataclass
class ActionResult:
    """Result of executing an action."""
    success: bool
    message: str = ""
    turn_ended: bool = False
    game_over: bool = False
    events: list = None

    def __post_init__(self):
        if self.events is None:
            self.events = []
