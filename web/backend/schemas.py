# web/backend/schemas.py
"""Pydantic schemas for API request/response models."""
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime


class CardType(str, Enum):
    MINION = "MINION"
    SPELL = "SPELL"
    WEAPON = "WEAPON"


class AbilitySchema(BaseModel):
    name: str


class CardSchema(BaseModel):
    id: str
    name: str
    cost: int
    card_type: CardType
    description: str = ""
    hero_class: Optional[str] = None
    attack: Optional[int] = None
    health: Optional[int] = None
    abilities: List[str] = []
    image_url: Optional[str] = None


class MinionSchema(BaseModel):
    instance_id: str
    card_id: str
    name: str
    attack: int
    health: int
    max_health: int
    can_attack: bool
    abilities: List[str] = []


class PlayerStateSchema(BaseModel):
    name: str
    hero_class: str
    health: int
    armor: int = 0
    mana: int
    max_mana: int
    hand: List[CardSchema] = []
    board: List[MinionSchema] = []
    deck_size: int


class GameStateSchema(BaseModel):
    game_id: str
    turn: int
    current_player: str
    player1: PlayerStateSchema
    player2: PlayerStateSchema
    is_game_over: bool = False
    winner: Optional[str] = None


class DeckSchema(BaseModel):
    id: str
    name: str
    hero_class: str
    cards: List[str]
    created_at: datetime
    updated_at: datetime


class DeckCreateSchema(BaseModel):
    name: str
    hero_class: str
    cards: List[str]


class ActionSchema(BaseModel):
    action_type: str  # 'play_card', 'attack', 'end_turn'
    card_index: Optional[int] = None
    attacker_id: Optional[str] = None
    target_id: Optional[str] = None


class StartGameSchema(BaseModel):
    deck1_id: str
    deck2_id: str


class CardFilterSchema(BaseModel):
    hero_class: Optional[str] = None
    cost: Optional[int] = None
    card_type: Optional[CardType] = None
    name: Optional[str] = None
