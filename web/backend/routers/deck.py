# web/backend/routers/deck.py
"""Deck API router."""
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException

from web.backend.schemas import DeckSchema, DeckCreateSchema
from web.backend.config import BASE_DIR

router = APIRouter()

# Decks storage directory
DECKS_DIR = BASE_DIR / "data" / "decks"


def _ensure_decks_dir():
    """Ensure the decks directory exists."""
    DECKS_DIR.mkdir(parents=True, exist_ok=True)


def _get_deck_path(deck_id: str) -> Path:
    """Get the file path for a deck."""
    return DECKS_DIR / f"{deck_id}.json"


def _load_deck_from_file(deck_id: str) -> dict:
    """Load deck data from JSON file."""
    deck_path = _get_deck_path(deck_id)
    if not deck_path.exists():
        return None
    with open(deck_path) as f:
        return json.load(f)


def _save_deck_to_file(deck_id: str, deck_data: dict):
    """Save deck data to JSON file."""
    _ensure_decks_dir()
    deck_path = _get_deck_path(deck_id)
    with open(deck_path, "w") as f:
        json.dump(deck_data, f, indent=2)


def _delete_deck_file(deck_id: str) -> bool:
    """Delete deck file. Returns True if deleted, False if not found."""
    deck_path = _get_deck_path(deck_id)
    if deck_path.exists():
        deck_path.unlink()
        return True
    return False


@router.get("/", response_model=List[DeckSchema])
async def list_decks():
    """List all decks."""
    _ensure_decks_dir()
    decks = []
    for deck_file in DECKS_DIR.glob("*.json"):
        deck_data = _load_deck_from_file(deck_file.stem)
        if deck_data:
            decks.append(DeckSchema(
                id=deck_file.stem,
                name=deck_data["name"],
                hero_class=deck_data["hero_class"],
                cards=deck_data["cards"],
                created_at=datetime.fromisoformat(deck_data["created_at"]),
                updated_at=datetime.fromisoformat(deck_data["updated_at"]),
            ))
    return decks


@router.get("/{deck_id}", response_model=DeckSchema)
async def get_deck(deck_id: str):
    """Get a single deck by ID."""
    deck_data = _load_deck_from_file(deck_id)
    if not deck_data:
        raise HTTPException(status_code=404, detail="Deck not found")

    return DeckSchema(
        id=deck_id,
        name=deck_data["name"],
        hero_class=deck_data["hero_class"],
        cards=deck_data["cards"],
        created_at=datetime.fromisoformat(deck_data["created_at"]),
        updated_at=datetime.fromisoformat(deck_data["updated_at"]),
    )


@router.post("/", response_model=DeckSchema, status_code=201)
async def create_deck(deck: DeckCreateSchema):
    """Create a new deck."""
    # Validate deck size (standard Hearthstone deck is 30 cards)
    if len(deck.cards) != 30:
        raise HTTPException(
            status_code=400,
            detail=f"Deck must have exactly 30 cards, got {len(deck.cards)}"
        )

    # Generate a unique ID
    deck_id = str(uuid.uuid4())[:8]
    now = datetime.utcnow().isoformat()

    deck_data = {
        "name": deck.name,
        "hero_class": deck.hero_class,
        "cards": deck.cards,
        "created_at": now,
        "updated_at": now,
    }

    _save_deck_to_file(deck_id, deck_data)

    return DeckSchema(
        id=deck_id,
        name=deck.name,
        hero_class=deck.hero_class,
        cards=deck.cards,
        created_at=datetime.fromisoformat(now),
        updated_at=datetime.fromisoformat(now),
    )


@router.delete("/{deck_id}")
async def delete_deck(deck_id: str):
    """Delete a deck by ID."""
    if not _delete_deck_file(deck_id):
        raise HTTPException(status_code=404, detail="Deck not found")
    return {"message": "Deck deleted successfully"}
