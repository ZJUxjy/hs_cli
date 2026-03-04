# web/backend/routers/cards.py
"""Cards API router."""
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from web.backend.schemas import CardSchema, CardType
from web.backend.config import CARD_IMAGE_CDN

router = APIRouter()

# In-memory card database (will be loaded from CardImporter)
_cards_cache: List[dict] = []


def _load_cards() -> List[dict]:
    """Load cards from CardImporter."""
    global _cards_cache
    if not _cards_cache:
        # TODO: Load from CardImporter when available
        _cards_cache = _get_test_cards()
    return _cards_cache


def _get_test_cards() -> List[dict]:
    """Get test cards for development."""
    return [
        {
            "id": "TEST_001",
            "name": "Test Minion",
            "cost": 2,
            "card_type": CardType.MINION,
            "description": "A test minion",
            "hero_class": "NEUTRAL",
            "attack": 2,
            "health": 3,
            "abilities": [],
        },
        {
            "id": "TEST_002",
            "name": "Fireball",
            "cost": 4,
            "card_type": CardType.SPELL,
            "description": "Deal 6 damage",
            "hero_class": "MAGE",
            "attack": None,
            "health": None,
            "abilities": [],
        },
    ]


@router.get("/", response_model=List[CardSchema])
async def get_cards(
    hero_class: Optional[str] = Query(None, description="Filter by hero class"),
    cost: Optional[int] = Query(None, description="Filter by cost"),
    card_type: Optional[CardType] = Query(None, description="Filter by card type"),
    name: Optional[str] = Query(None, description="Search by name"),
):
    """Get all cards with optional filters."""
    cards = _load_cards()

    if hero_class:
        cards = [c for c in cards if c.get("hero_class") == hero_class]
    if cost is not None:
        cards = [c for c in cards if c.get("cost") == cost]
    if card_type:
        cards = [c for c in cards if c.get("card_type") == card_type]
    if name:
        cards = [c for c in cards if name.lower() in c.get("name", "").lower()]

    # Add image URL
    for card in cards:
        if not card.get("image_url"):
            card["image_url"] = f"{CARD_IMAGE_CDN}/{card['id']}.png"

    return cards


@router.get("/{card_id}", response_model=CardSchema)
async def get_card(card_id: str):
    """Get a single card by ID."""
    cards = _load_cards()
    for card in cards:
        if card["id"] == card_id:
            if not card.get("image_url"):
                card["image_url"] = f"{CARD_IMAGE_CDN}/{card['id']}.png"
            return card
    raise HTTPException(status_code=404, detail="Card not found")
