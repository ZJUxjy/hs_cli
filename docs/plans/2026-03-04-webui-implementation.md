# Hearthstone WebUI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建完整的炉石传说 Web 图形界面，支持游戏对战、卡组管理、卡牌收藏和游戏回放。

**Architecture:** FastAPI 后端直接调用现有 Python 游戏引擎，React 前端通过 REST API 和 WebSocket 与后端通信。卡牌视觉资源使用 HearthstoneJSON CDN。

**Tech Stack:** FastAPI, React, TypeScript, Vite, Zustand, TailwindCSS, WebSocket

---

## Phase 1: Backend Foundation

### Task 1: Create Backend Directory Structure

**Files:**
- Create: `web/backend/__init__.py`
- Create: `web/backend/main.py`
- Create: `web/backend/config.py`

**Step 1: Create directories**

```bash
mkdir -p web/backend/routers
```

**Step 2: Create `web/backend/__init__.py`**

```python
"""Hearthstone WebUI Backend."""
```

**Step 3: Create `web/backend/config.py`**

```python
"""Configuration for the WebUI backend."""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Frontend build directory (for serving static files in production)
FRONTEND_DIST = BASE_DIR / "web" / "frontend" / "dist"

# API settings
API_PREFIX = "/api"

# CORS settings
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:8000",  # FastAPI
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
]

# Card image CDN
CARD_IMAGE_CDN = "https://art.hearthstonejson.com/v1/render/latest/enUS/512x"
```

**Step 4: Create `web/backend/main.py`**

```python
"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from web.backend.config import CORS_ORIGINS, API_PREFIX, FRONTEND_DIST

app = FastAPI(
    title="Hearthstone WebUI",
    description="Web interface for Hearthstone game engine",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (will be added later)
# from web.backend.routers import cards, deck, game, replay
# app.include_router(cards.router, prefix=f"{API_PREFIX}/cards", tags=["cards"])
# app.include_router(deck.router, prefix=f"{API_PREFIX}/decks", tags=["deck"])
# app.include_router(game.router, prefix=f"{API_PREFIX}/game", tags=["game"])
# app.include_router(replay.router, prefix=f"{API_PREFIX}/replay", tags=["replay"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Hearthstone WebUI API", "version": "0.1.0"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
```

**Step 5: Verify**

```bash
cd /home/xu/code/hstone/hs_glm && python -c "from web.backend.main import app; print('OK')"
```

**Step 6: Commit**

```bash
git add web/backend/
git commit -m "feat(web): add FastAPI backend structure"
```

---

### Task 2: Create Pydantic Schemas

**Files:**
- Create: `web/backend/schemas.py`

**Step 1: Create schemas file**

```python
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
```

**Step 2: Verify**

```bash
python -c "from web.backend.schemas import CardSchema; print('OK')"
```

**Step 3: Commit**

```bash
git add web/backend/schemas.py
git commit -m "feat(web): add Pydantic schemas for API"
```

---

### Task 3: Create Cards Router

**Files:**
- Create: `web/backend/routers/__init__.py`
- Create: `web/backend/routers/cards.py`

**Step 1: Create routers init**

```python
# web/backend/routers/__init__.py
"""API routers."""
```

**Step 2: Create cards router**

```python
# web/backend/routers/cards.py
"""Cards API router."""
from fastapi import APIRouter, Query
from typing import List, Optional
from web.backend.schemas import CardSchema, CardType
from web.backend.config import CARD_IMAGE_CDN

router = APIRouter()

# In-memory card database (will be loaded from CardImporter)
_cards_cache: List[dict] = []


def _load_cards():
    """Load cards from CardImporter."""
    global _cards_cache
    if not _cards_cache:
        from hearthstone.data.card_importer import CardImporter
        from hearthstone.data.card_factory import CardFactory

        importer = CardImporter()
        factory = CardFactory()

        # For now, return test cards
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
    return {"error": "Card not found"}
```

**Step 3: Update main.py to include router**

```python
# Add to web/backend/main.py after the CORS middleware

from web.backend.routers import cards
app.include_router(cards.router, prefix=f"{API_PREFIX}/cards", tags=["cards"])
```

**Step 4: Test**

```bash
python -c "from web.backend.routers.cards import router; print('OK')"
```

**Step 5: Commit**

```bash
git add web/backend/routers/
git commit -m "feat(web): add cards API router"
```

---

### Task 4: Create Game Router

**Files:**
- Create: `web/backend/routers/game.py`
- Create: `web/backend/services.py`

**Step 1: Create services.py**

```python
# web/backend/services.py
"""Business logic services."""
import uuid
from typing import Dict, Optional
from hearthstone.engine.game_controller import GameController
from hearthstone.decks.deck_manager import DeckManager
from web.backend.schemas import GameStateSchema, PlayerStateSchema, MinionSchema, CardSchema


class GameService:
    """Service for managing game sessions."""

    def __init__(self):
        self.sessions: Dict[str, GameController] = {}
        self.deck_manager = DeckManager()

    def start_game(self, deck1_id: str, deck2_id: str) -> str:
        """Start a new game and return game_id."""
        game_id = str(uuid.uuid4())[:8]

        # Load decks
        deck1 = self.deck_manager.load_deck(deck1_id)
        deck2 = self.deck_manager.load_deck(deck2_id)

        # Create controller
        controller = GameController(deck1, deck2)
        controller.start_game()

        self.sessions[game_id] = controller
        return game_id

    def get_game(self, game_id: str) -> Optional[GameController]:
        """Get game controller by ID."""
        return self.sessions.get(game_id)

    def serialize_state(self, game_id: str) -> Optional[GameStateSchema]:
        """Serialize game state to schema."""
        controller = self.sessions.get(game_id)
        if not controller:
            return None

        state = controller.get_state()

        return GameStateSchema(
            game_id=game_id,
            turn=state.turn,
            current_player=state.current_player.name,
            player1=self._serialize_player(state.player1),
            player2=self._serialize_player(state.player2),
            is_game_over=state.is_game_over(),
            winner=state.get_winner().name if state.get_winner() else None,
        )

    def _serialize_player(self, player) -> PlayerStateSchema:
        """Serialize player state."""
        return PlayerStateSchema(
            name=player.name,
            hero_class=player.hero.hero_class.value,
            health=player.hero.health,
            armor=player.hero.armor,
            mana=player.mana,
            max_mana=player.max_mana,
            hand=[self._serialize_card(c) for c in player.hand],
            board=[self._serialize_minion(m) for m in player.board],
            deck_size=len(player.deck),
        )

    def _serialize_card(self, card) -> CardSchema:
        """Serialize a card."""
        abilities = [a.value for a in card.abilities] if hasattr(card, 'abilities') else []
        return CardSchema(
            id=card.id,
            name=card.name,
            cost=card.cost,
            card_type=card.card_type.value,
            description=card.description,
            hero_class=card.hero_class.value if card.hero_class else None,
            attack=getattr(card, 'attack', None),
            health=getattr(card, 'health', None),
            abilities=abilities,
        )

    def _serialize_minion(self, minion) -> MinionSchema:
        """Serialize a minion."""
        abilities = [a.value for a in minion.abilities] if hasattr(minion, 'abilities') else []
        return MinionSchema(
            instance_id=minion.instance_id or minion.id,
            card_id=minion.id,
            name=minion.name,
            attack=minion.attack,
            health=minion.health,
            max_health=minion.max_health,
            can_attack=minion.can_attack,
            abilities=abilities,
        )


# Global service instance
game_service = GameService()
```

**Step 2: Create game router**

```python
# web/backend/routers/game.py
"""Game API router."""
from fastapi import APIRouter, HTTPException
from web.backend.schemas import GameStateSchema, ActionSchema, StartGameSchema
from web.backend.services import game_service

router = APIRouter()


@router.post("/start", response_model=GameStateSchema)
async def start_game(request: StartGameSchema):
    """Start a new game."""
    try:
        game_id = game_service.start_game(request.deck1_id, request.deck2_id)
        return game_service.serialize_state(game_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{game_id}", response_model=GameStateSchema)
async def get_game_state(game_id: str):
    """Get current game state."""
    state = game_service.serialize_state(game_id)
    if not state:
        raise HTTPException(status_code=404, detail="Game not found")
    return state


@router.post("/{game_id}/action", response_model=GameStateSchema)
async def execute_action(game_id: str, action: ActionSchema):
    """Execute a game action."""
    controller = game_service.get_game(game_id)
    if not controller:
        raise HTTPException(status_code=404, detail="Game not found")

    # Convert action to engine format
    from hearthstone.engine.action import PlayCardAction, AttackAction, EndTurnAction

    if action.action_type == "play_card":
        engine_action = PlayCardAction(
            card_index=action.card_index,
            target_id=action.target_id,
        )
    elif action.action_type == "attack":
        engine_action = AttackAction(
            attacker_id=action.attacker_id,
            target_id=action.target_id,
        )
    elif action.action_type == "end_turn":
        engine_action = EndTurnAction(
            player_id=controller.get_state().current_player.name,
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid action type")

    # Execute
    result = controller.execute_action(engine_action)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return game_service.serialize_state(game_id)


@router.get("/{game_id}/valid-actions")
async def get_valid_actions(game_id: str):
    """Get list of valid actions."""
    controller = game_service.get_game(game_id)
    if not controller:
        raise HTTPException(status_code=404, detail="Game not found")

    actions = controller.get_valid_actions()
    return {"actions": [{"type": a.__class__.__name__} for a in actions]}
```

**Step 3: Update main.py**

```python
# Add to web/backend/main.py

from web.backend.routers import cards, game
app.include_router(cards.router, prefix=f"{API_PREFIX}/cards", tags=["cards"])
app.include_router(game.router, prefix=f"{API_PREFIX}/game", tags=["game"])
```

**Step 4: Test**

```bash
python -c "from web.backend.services import game_service; print('OK')"
```

**Step 5: Commit**

```bash
git add web/backend/services.py web/backend/routers/game.py
git commit -m "feat(web): add game API router and service"
```

---

### Task 5: Create Deck Router

**Files:**
- Create: `web/backend/routers/deck.py`

**Step 1: Create deck router**

```python
# web/backend/routers/deck.py
"""Deck API router."""
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from web.backend.schemas import DeckSchema, DeckCreateSchema
from web.backend.config import BASE_DIR
import json

router = APIRouter()

DECKS_FILE = BASE_DIR / "data" / "decks.json"


def _load_decks() -> List[dict]:
    """Load decks from file."""
    if not DECKS_FILE.exists():
        return []
    with open(DECKS_FILE) as f:
        return json.load(f)


def _save_decks(decks: List[dict]):
    """Save decks to file."""
    DECKS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DECKS_FILE, "w") as f:
        json.dump(decks, f, indent=2)


@router.get("/", response_model=List[DeckSchema])
async def get_decks():
    """Get all decks."""
    return _load_decks()


@router.get("/{deck_id}", response_model=DeckSchema)
async def get_deck(deck_id: str):
    """Get a single deck."""
    decks = _load_decks()
    for deck in decks:
        if deck["id"] == deck_id:
            return deck
    raise HTTPException(status_code=404, detail="Deck not found")


@router.post("/", response_model=DeckSchema)
async def create_deck(deck: DeckCreateSchema):
    """Create a new deck."""
    decks = _load_decks()

    new_deck = {
        "id": f"deck_{len(decks) + 1}",
        "name": deck.name,
        "hero_class": deck.hero_class,
        "cards": deck.cards,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }

    decks.append(new_deck)
    _save_decks(decks)

    return new_deck


@router.delete("/{deck_id}")
async def delete_deck(deck_id: str):
    """Delete a deck."""
    decks = _load_decks()
    decks = [d for d in decks if d["id"] != deck_id]
    _save_decks(decks)
    return {"message": "Deck deleted"}
```

**Step 2: Update main.py**

```python
# Add to web/backend/main.py

from web.backend.routers import cards, game, deck
app.include_router(cards.router, prefix=f"{API_PREFIX}/cards", tags=["cards"])
app.include_router(game.router, prefix=f"{API_PREFIX}/game", tags=["game"])
app.include_router(deck.router, prefix=f"{API_PREFIX}/decks", tags=["deck"])
```

**Step 3: Commit**

```bash
git add web/backend/routers/deck.py
git commit -m "feat(web): add deck API router"
```

---

### Task 6: Create Run Script and Update Requirements

**Files:**
- Create: `run_web.py`
- Modify: `requirements.txt`

**Step 1: Update requirements.txt**

```txt
pytest>=7.0.0
pytest-cov>=4.0.0
gymnasium>=0.29.0
numpy>=1.24.0
rich>=13.0.0
fastapi>=0.100.0
uvicorn>=0.23.0
websockets>=11.0
python-multipart>=0.0.6
requests>=2.28.0
```

**Step 2: Create run_web.py**

```python
#!/usr/bin/env python3
"""Run the Hearthstone WebUI server."""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "web.backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
```

**Step 3: Install dependencies**

```bash
pip install fastapi uvicorn websockets python-multipart
```

**Step 4: Test backend**

```bash
python -c "from web.backend.main import app; print('Backend OK')"
```

**Step 5: Commit**

```bash
git add run_web.py requirements.txt
git commit -m "feat(web): add web server run script"
```

---

## Phase 2: Frontend Foundation

### Task 7: Initialize React Project

**Files:**
- Create: `web/frontend/package.json`
- Create: `web/frontend/vite.config.ts`
- Create: `web/frontend/tsconfig.json`
- Create: `web/frontend/tailwind.config.js`
- Create: `web/frontend/postcss.config.js`
- Create: `web/frontend/index.html`
- Create: `web/frontend/src/main.tsx`
- Create: `web/frontend/src/App.tsx`
- Create: `web/frontend/src/index.css`

**Step 1: Create directory**

```bash
mkdir -p web/frontend/src
```

**Step 2: Create package.json**

```json
{
  "name": "hearthstone-webui",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "zustand": "^4.3.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

**Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
})
```

**Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 5: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 6: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hearthstone: {
          blue: '#4a9eff',
          gold: '#ffd700',
          red: '#ff4444',
          green: '#22bb33',
          purple: '#a335ee',
          orange: '#ff8000',
        },
      },
    },
  },
  plugins: [],
}
```

**Step 7: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 8: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hearthstone WebUI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 9: Create src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Step 10: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

**Step 11: Create src/App.tsx**

```tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-5xl font-bold mb-8 text-hearthstone-gold">
        Hearthstone WebUI
      </h1>
      <p className="text-xl mb-12 text-gray-300">
        AI Training Environment for Hearthstone
      </p>
      <div className="flex gap-4">
        <Link
          to="/game"
          className="px-8 py-4 bg-hearthstone-blue rounded-lg text-lg font-semibold hover:opacity-80 transition"
        >
          Start Game
        </Link>
        <Link
          to="/deck"
          className="px-8 py-4 bg-hearthstone-purple rounded-lg text-lg font-semibold hover:opacity-80 transition"
        >
          Deck Builder
        </Link>
        <Link
          to="/collection"
          className="px-8 py-4 bg-hearthstone-orange rounded-lg text-lg font-semibold hover:opacity-80 transition"
        >
          Collection
        </Link>
      </div>
    </div>
  )
}

function GamePage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <h1 className="text-3xl">Game Board (Coming Soon)</h1>
    </div>
  )
}

function DeckPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <h1 className="text-3xl">Deck Builder (Coming Soon)</h1>
    </div>
  )
}

function CollectionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <h1 className="text-3xl">Card Collection (Coming Soon)</h1>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/deck" element={<DeckPage />} />
        <Route path="/collection" element={<CollectionPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

**Step 12: Install dependencies**

```bash
cd web/frontend && npm install
```

**Step 13: Test frontend**

```bash
cd web/frontend && npm run build
```

**Step 14: Commit**

```bash
git add web/frontend/
git commit -m "feat(web): initialize React frontend with Vite and TailwindCSS"
```

---

## Phase 3: Card Components

### Task 8: Create Card Type Definitions

**Files:**
- Create: `web/frontend/src/types/card.ts`
- Create: `web/frontend/src/types/game.ts`
- Create: `web/frontend/src/types/deck.ts`

**Step 1: Create types directory**

```bash
mkdir -p web/frontend/src/types
```

**Step 2: Create card.ts**

```typescript
// web/frontend/src/types/card.ts

export type CardType = 'MINION' | 'SPELL' | 'WEAPON';

export interface Card {
  id: string;
  name: string;
  cost: number;
  card_type: CardType;
  description: string;
  hero_class?: string;
  attack?: number;
  health?: number;
  abilities: string[];
  image_url?: string;
}

export interface Minion {
  instance_id: string;
  card_id: string;
  name: string;
  attack: number;
  health: number;
  max_health: number;
  can_attack: boolean;
  abilities: string[];
}
```

**Step 3: Create game.ts**

```typescript
// web/frontend/src/types/game.ts

import { Card, Minion } from './card';

export interface PlayerState {
  name: string;
  hero_class: string;
  health: number;
  armor: number;
  mana: number;
  max_mana: number;
  hand: Card[];
  board: Minion[];
  deck_size: number;
}

export interface GameState {
  game_id: string;
  turn: number;
  current_player: string;
  player1: PlayerState;
  player2: PlayerState;
  is_game_over: boolean;
  winner?: string;
}

export interface Action {
  action_type: 'play_card' | 'attack' | 'end_turn';
  card_index?: number;
  attacker_id?: string;
  target_id?: string;
}
```

**Step 4: Create deck.ts**

```typescript
// web/frontend/src/types/deck.ts

export interface Deck {
  id: string;
  name: string;
  hero_class: string;
  cards: string[];
  created_at: string;
  updated_at: string;
}

export interface DeckCreate {
  name: string;
  hero_class: string;
  cards: string[];
}
```

**Step 5: Commit**

```bash
git add web/frontend/src/types/
git commit -m "feat(web): add TypeScript type definitions"
```

---

### Task 9: Create Card Component

**Files:**
- Create: `web/frontend/src/components/game/Card.tsx`

**Step 1: Create components directory**

```bash
mkdir -p web/frontend/src/components/game
```

**Step 2: Create Card.tsx**

```tsx
// web/frontend/src/components/game/Card.tsx

import { clsx } from 'clsx';
import { Card as CardType } from '../../types/card';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isSelected?: boolean;
  isPlayable?: boolean;
  isHovered?: boolean;
  showDetails?: boolean;
}

export function Card({
  card,
  onClick,
  isSelected = false,
  isPlayable = false,
  isHovered = false,
  showDetails = false,
}: CardProps) {
  const isMinion = card.card_type === 'MINION';

  return (
    <div
      className={clsx(
        'relative w-[140px] h-[200px] rounded-lg cursor-pointer transition-all duration-200',
        'bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg',
        isSelected && 'ring-4 ring-hearthstone-gold scale-110',
        isPlayable && 'ring-2 ring-hearthstone-green animate-pulse',
        isHovered && !isSelected && 'scale-105',
        'hover:shadow-xl'
      )}
      onClick={onClick}
    >
      {/* Mana Crystal */}
      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-gradient-to-b from-hearthstone-blue to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
        {card.cost}
      </div>

      {/* Card Image */}
      {card.image_url ? (
        <img
          src={card.image_url}
          alt={card.name}
          className="w-full h-[100px] object-cover rounded-t-lg"
        />
      ) : (
        <div className="w-full h-[100px] bg-gray-700 rounded-t-lg flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}

      {/* Card Name */}
      <div className="px-2 py-1 bg-gradient-to-r from-amber-900 to-amber-800 mx-2 mt-1 rounded text-center">
        <span className="text-white text-xs font-semibold truncate block">
          {card.name}
        </span>
      </div>

      {/* Stats for Minion */}
      {isMinion && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-between px-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-b from-hearthstone-gold to-yellow-600 flex items-center justify-center text-black font-bold text-xs">
            {card.attack}
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-b from-hearthstone-red to-red-700 flex items-center justify-center text-white font-bold text-xs">
            {card.health}
          </div>
        </div>
      )}

      {/* Spell indicator */}
      {card.card_type === 'SPELL' && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
          Spell
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add web/frontend/src/components/
git commit -m "feat(web): add Card component"
```

---

### Task 10: Create Hand Component

**Files:**
- Create: `web/frontend/src/components/game/Hand.tsx`

**Step 1: Create Hand.tsx**

```tsx
// web/frontend/src/components/game/Hand.tsx

import { Card } from './Card';
import { Card as CardType } from '../../types/card';

interface HandProps {
  cards: CardType[];
  selectedCard: number | null;
  playableCards: number[];
  onCardClick: (index: number) => void;
  isOpponent?: boolean;
}

export function Hand({
  cards,
  selectedCard,
  playableCards,
  onCardClick,
  isOpponent = false,
}: HandProps) {
  return (
    <div className="flex justify-center items-end gap-[-20px] py-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="transition-all duration-200"
          style={{
            transform: `rotate(${(index - cards.length / 2) * 3}deg)`,
            marginLeft: index > 0 ? '-30px' : '0',
            zIndex: index,
          }}
        >
          {isOpponent ? (
            <div className="w-[100px] h-[140px] rounded-lg bg-gradient-to-b from-gray-600 to-gray-800 shadow-lg border-2 border-gray-500" />
          ) : (
            <Card
              card={card}
              onClick={() => onCardClick(index)}
              isSelected={selectedCard === index}
              isPlayable={playableCards.includes(index)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add web/frontend/src/components/game/Hand.tsx
git commit -m "feat(web): add Hand component with arc layout"
```

---

### Task 11: Create Minion and Board Components

**Files:**
- Create: `web/frontend/src/components/game/Minion.tsx`
- Create: `web/frontend/src/components/game/Board.tsx`

**Step 1: Create Minion.tsx**

```tsx
// web/frontend/src/components/game/Minion.tsx

import { clsx } from 'clsx';
import { Minion as MinionType } from '../../types/card';

interface MinionProps {
  minion: MinionType;
  onClick?: () => void;
  isSelected?: boolean;
  canAttack?: boolean;
  isTargetable?: boolean;
}

export function Minion({
  minion,
  onClick,
  isSelected = false,
  canAttack = false,
  isTargetable = false,
}: MinionProps) {
  const hasTaunt = minion.abilities.includes('TAUNT');
  const hasDivineShield = minion.abilities.includes('DIVINE_SHIELD');

  return (
    <div
      className={clsx(
        'relative w-[100px] h-[140px] rounded-lg cursor-pointer transition-all duration-200',
        'bg-gradient-to-b from-gray-700 to-gray-800 shadow-lg',
        isSelected && 'ring-4 ring-hearthstone-gold scale-110',
        canAttack && minion.can_attack && 'ring-2 ring-hearthstone-green',
        isTargetable && 'ring-2 ring-hearthstone-red',
        hasTaunt && 'border-4 border-amber-500',
        'hover:scale-105'
      )}
      onClick={onClick}
    >
      {/* Minion Art */}
      <div className="w-full h-[70px] bg-gray-600 rounded-t-lg flex items-center justify-center text-2xl">
        👤
      </div>

      {/* Name */}
      <div className="px-1 py-0.5 bg-gradient-to-r from-amber-900 to-amber-800 mx-1 mt-1 rounded text-center">
        <span className="text-white text-[10px] font-semibold truncate block">
          {minion.name}
        </span>
      </div>

      {/* Divine Shield indicator */}
      {hasDivineShield && (
        <div className="absolute inset-0 rounded-lg border-2 border-cyan-400 opacity-50" />
      )}

      {/* Stats */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-between px-1">
        <div className="w-6 h-6 rounded-full bg-gradient-to-b from-hearthstone-gold to-yellow-600 flex items-center justify-center text-black font-bold text-xs">
          {minion.attack}
        </div>
        <div className={clsx(
          'w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs',
          minion.health < minion.max_health
            ? 'bg-gradient-to-b from-red-500 to-red-700 text-white'
            : 'bg-gradient-to-b from-hearthstone-red to-red-700 text-white'
        )}>
          {minion.health}
        </div>
      </div>

      {/* Can attack glow */}
      {minion.can_attack && (
        <div className="absolute inset-0 rounded-lg shadow-[0_0_10px_rgba(34,187,51,0.5)]" />
      )}
    </div>
  );
}
```

**Step 2: Create Board.tsx**

```tsx
// web/frontend/src/components/game/Board.tsx

import { Minion } from './Minion';
import { Minion as MinionType } from '../../types/card';

interface BoardProps {
  minions: MinionType[];
  selectedMinion: string | null;
  attackableMinions: string[];
  onMinionClick: (id: string) => void;
}

export function Board({
  minions,
  selectedMinion,
  attackableMinions,
  onMinionClick,
}: BoardProps) {
  return (
    <div className="flex justify-center items-center gap-2 min-h-[160px] py-2">
      {minions.length === 0 ? (
        <div className="w-full h-[140px] border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500">
          Empty Board
        </div>
      ) : (
        minions.map((minion) => (
          <Minion
            key={minion.instance_id}
            minion={minion}
            onClick={() => onMinionClick(minion.instance_id)}
            isSelected={selectedMinion === minion.instance_id}
            isTargetable={attackableMinions.includes(minion.instance_id)}
          />
        ))
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add web/frontend/src/components/game/Minion.tsx web/frontend/src/components/game/Board.tsx
git commit -m "feat(web): add Minion and Board components"
```

---

### Task 12: Create Hero and Mana Components

**Files:**
- Create: `web/frontend/src/components/game/Hero.tsx`
- Create: `web/frontend/src/components/game/ManaCrystals.tsx`

**Step 1: Create Hero.tsx**

```tsx
// web/frontend/src/components/game/Hero.tsx

import { clsx } from 'clsx';

interface HeroProps {
  heroClass: string;
  health: number;
  armor: number;
  isOpponent?: boolean;
  isTargetable?: boolean;
  onClick?: () => void;
}

const heroIcons: Record<string, string> = {
  MAGE: '🧙',
  WARRIOR: '⚔️',
  HUNTER: '🏹',
  DRUID: '🌿',
  PALADIN: '🛡️',
  ROGUE: '🗡️',
  SHAMAN: '⚡',
  WARLOCK: '👿',
  PRIEST: '✝️',
  DEMON_HUNTER: '😈',
  NEUTRAL: '🎭',
};

export function Hero({
  heroClass,
  health,
  armor,
  isOpponent = false,
  isTargetable = false,
  onClick,
}: HeroProps) {
  return (
    <div
      className={clsx(
        'relative w-[120px] h-[150px] rounded-lg cursor-pointer transition-all',
        'bg-gradient-to-b from-gray-700 to-gray-800 shadow-lg',
        isTargetable && 'ring-4 ring-hearthstone-red',
        'hover:scale-105'
      )}
      onClick={onClick}
    >
      {/* Hero Portrait */}
      <div className="w-full h-[100px] bg-gray-600 rounded-t-lg flex items-center justify-center text-4xl">
        {heroIcons[heroClass] || '👤'}
      </div>

      {/* Class Name */}
      <div className="text-center text-xs text-gray-400 py-1">
        {heroClass}
      </div>

      {/* Health/Armor */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
        {armor > 0 && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-300">
            {armor}
          </div>
        )}
        <div className={clsx(
          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
          health <= 10
            ? 'bg-gradient-to-b from-red-500 to-red-700 text-white'
            : 'bg-gradient-to-b from-hearthstone-red to-red-700 text-white'
        )}>
          {health}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create ManaCrystals.tsx**

```tsx
// web/frontend/src/components/game/ManaCrystals.tsx

import { clsx } from 'clsx';

interface ManaCrystalsProps {
  current: number;
  max: number;
}

export function ManaCrystals({ current, max }: ManaCrystalsProps) {
  const crystals = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="flex items-center gap-1">
      {crystals.map((i) => (
        <div
          key={i}
          className={clsx(
            'w-6 h-8 rounded-sm transition-all',
            i < max
              ? i < current
                ? 'bg-gradient-to-b from-hearthstone-blue to-blue-700 shadow-md'
                : 'bg-gradient-to-b from-gray-500 to-gray-700 opacity-50'
              : 'bg-gray-800 opacity-30'
          )}
        />
      ))}
      <span className="ml-2 text-white font-bold">
        {current}/{max}
      </span>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add web/frontend/src/components/game/Hero.tsx web/frontend/src/components/game/ManaCrystals.tsx
git commit -m "feat(web): add Hero and ManaCrystals components"
```

---

## Phase 4: Game Board Integration

### Task 13: Create Game Board Component

**Files:**
- Create: `web/frontend/src/components/game/GameBoard.tsx`

**Step 1: Create GameBoard.tsx**

```tsx
// web/frontend/src/components/game/GameBoard.tsx

import { Hand } from './Hand';
import { Board } from './Board';
import { Hero } from './Hero';
import { ManaCrystals } from './ManaCrystals';
import { GameState, Action } from '../../types/game';

interface GameBoardProps {
  gameState: GameState;
  selectedCard: number | null;
  selectedMinion: string | null;
  validActions: Action[];
  onCardClick: (index: number) => void;
  onMinionClick: (id: string) => void;
  onHeroClick: () => void;
  onEndTurn: () => void;
}

export function GameBoard({
  gameState,
  selectedCard,
  selectedMinion,
  validActions,
  onCardClick,
  onMinionClick,
  onHeroClick,
  onEndTurn,
}: GameBoardProps) {
  const isPlayer1Turn = gameState.current_player === gameState.player1.name;
  const currentPlayer = isPlayer1Turn ? gameState.player1 : gameState.player2;
  const opposingPlayer = isPlayer1Turn ? gameState.player2 : gameState.player1;

  // Get playable card indices
  const playableCards = currentPlayer.hand
    .map((card, index) => (card.cost <= currentPlayer.mana ? index : -1))
    .filter((i) => i >= 0);

  // Get attackable minion IDs
  const attackableMinions = opposingPlayer.board.map((m) => m.instance_id);

  // Check if hero is targetable
  const heroTargetable = selectedMinion !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 flex flex-col">
      {/* Opponent Area */}
      <div className="flex justify-between items-start mb-4">
        <Hero
          heroClass={opposingPlayer.hero_class}
          health={opposingPlayer.health}
          armor={opposingPlayer.armor}
          isOpponent
          isTargetable={heroTargetable}
          onClick={heroTargetable ? onHeroClick : undefined}
        />
        <ManaCrystals
          current={opposingPlayer.mana}
          max={opposingPlayer.max_mana}
        />
      </div>

      {/* Opponent Hand */}
      <Hand
        cards={opposingPlayer.hand}
        selectedCard={null}
        playableCards={[]}
        onCardClick={() => {}}
        isOpponent
      />

      {/* Opponent Board */}
      <Board
        minions={opposingPlayer.board}
        selectedMinion={selectedMinion}
        attackableMinions={attackableMinions}
        onMinionClick={onMinionClick}
      />

      {/* Center Divider */}
      <div className="h-2 bg-gradient-to-r from-transparent via-amber-600 to-transparent my-4" />

      {/* Player Board */}
      <Board
        minions={currentPlayer.board}
        selectedMinion={selectedMinion}
        attackableMinions={[]}
        onMinionClick={onMinionClick}
      />

      {/* Player Hand */}
      <Hand
        cards={currentPlayer.hand}
        selectedCard={selectedCard}
        playableCards={playableCards}
        onCardClick={onCardClick}
      />

      {/* Player Area */}
      <div className="flex justify-between items-end mt-4">
        <Hero
          heroClass={currentPlayer.hero_class}
          health={currentPlayer.health}
          armor={currentPlayer.armor}
        />
        <div className="flex items-center gap-4">
          <ManaCrystals
            current={currentPlayer.mana}
            max={currentPlayer.max_mana}
          />
          <button
            onClick={onEndTurn}
            className="px-8 py-4 bg-gradient-to-b from-hearthstone-gold to-yellow-600 rounded-lg text-black font-bold text-lg hover:opacity-80 transition shadow-lg"
          >
            END TURN
          </button>
        </div>
      </div>

      {/* Game Info */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded">
        Turn {gameState.turn} • {currentPlayer.name}'s turn
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add web/frontend/src/components/game/GameBoard.tsx
git commit -m "feat(web): add GameBoard component"
```

---

### Task 14: Create Game Store (Zustand)

**Files:**
- Create: `web/frontend/src/store/gameStore.ts`

**Step 1: Create store directory**

```bash
mkdir -p web/frontend/src/store
```

**Step 2: Create gameStore.ts**

```typescript
// web/frontend/src/store/gameStore.ts

import { create } from 'zustand';
import { GameState, Action } from '../types/game';
import { startGame, executeAction } from '../api/game';

interface GameStore {
  // State
  gameId: string | null;
  gameState: GameState | null;
  selectedCard: number | null;
  selectedMinion: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  startNewGame: (deck1Id: string, deck2Id: string) => Promise<void>;
  playCard: (cardIndex: number, targetId?: string) => Promise<void>;
  attack: (attackerId: string, targetId: string) => Promise<void>;
  endTurn: () => Promise<void>;
  selectCard: (index: number | null) => void;
  selectMinion: (id: string | null) => void;
  setGameState: (state: GameState) => void;
  clearError: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameId: null,
  gameState: null,
  selectedCard: null,
  selectedMinion: null,
  isLoading: false,
  error: null,

  // Actions
  startNewGame: async (deck1Id: string, deck2Id: string) => {
    set({ isLoading: true, error: null });
    try {
      const state = await startGame(deck1Id, deck2Id);
      set({
        gameId: state.game_id,
        gameState: state,
        isLoading: false,
        selectedCard: null,
        selectedMinion: null,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  playCard: async (cardIndex: number, targetId?: string) => {
    const { gameId } = get();
    if (!gameId) return;

    set({ isLoading: true, error: null });
    try {
      const action: Action = {
        action_type: 'play_card',
        card_index: cardIndex,
        target_id: targetId,
      };
      const state = await executeAction(gameId, action);
      set({ gameState: state, isLoading: false, selectedCard: null });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  attack: async (attackerId: string, targetId: string) => {
    const { gameId } = get();
    if (!gameId) return;

    set({ isLoading: true, error: null });
    try {
      const action: Action = {
        action_type: 'attack',
        attacker_id: attackerId,
        target_id: targetId,
      };
      const state = await executeAction(gameId, action);
      set({ gameState: state, isLoading: false, selectedMinion: null });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  endTurn: async () => {
    const { gameId } = get();
    if (!gameId) return;

    set({ isLoading: true, error: null });
    try {
      const action: Action = { action_type: 'end_turn' };
      const state = await executeAction(gameId, action);
      set({ gameState: state, isLoading: false, selectedCard: null, selectedMinion: null });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectCard: (index: number | null) => set({ selectedCard: index }),
  selectMinion: (id: string | null) => set({ selectedMinion: id }),
  setGameState: (state: GameState) => set({ gameState: state }),
  clearError: () => set({ error: null }),
}));
```

**Step 3: Commit**

```bash
git add web/frontend/src/store/gameStore.ts
git commit -m "feat(web): add Zustand game store"
```

---

### Task 15: Create API Client

**Files:**
- Create: `web/frontend/src/api/client.ts`
- Create: `web/frontend/src/api/game.ts`
- Create: `web/frontend/src/api/cards.ts`

**Step 1: Create api directory**

```bash
mkdir -p web/frontend/src/api
```

**Step 2: Create client.ts**

```typescript
// web/frontend/src/api/client.ts

const API_BASE = '/api';

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export async function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}
```

**Step 3: Create game.ts**

```typescript
// web/frontend/src/api/game.ts

import { apiPost } from './client';
import { GameState, Action } from '../types/game';

export async function startGame(deck1Id: string, deck2Id: string): Promise<GameState> {
  return apiPost<GameState>('/game/start', {
    deck1_id: deck1Id,
    deck2_id: deck2Id,
  });
}

export async function executeAction(gameId: string, action: Action): Promise<GameState> {
  return apiPost<GameState>(`/game/${gameId}/action`, action);
}

export async function getValidActions(gameId: string): Promise<{ actions: unknown[] }> {
  return apiGet<{ actions: unknown[] }>(`/game/${gameId}/valid-actions`);
}

import { apiGet } from './client';
```

**Step 4: Create cards.ts**

```typescript
// web/frontend/src/api/cards.ts

import { apiGet } from './client';
import { Card } from '../types/card';

export async function fetchCards(filters?: {
  hero_class?: string;
  cost?: number;
  card_type?: string;
  name?: string;
}): Promise<Card[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiGet<Card[]>(`/cards${query}`);
}

export async function fetchCard(cardId: string): Promise<Card> {
  return apiGet<Card>(`/cards/${cardId}`);
}
```

**Step 5: Commit**

```bash
git add web/frontend/src/api/
git commit -m "feat(web): add API client modules"
```

---

### Task 16: Update Game Page

**Files:**
- Modify: `web/frontend/src/App.tsx`
- Create: `web/frontend/src/pages/GamePage.tsx`

**Step 1: Create pages directory**

```bash
mkdir -p web/frontend/src/pages
```

**Step 2: Create GamePage.tsx**

```tsx
// web/frontend/src/pages/GamePage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameBoard } from '../components/game/GameBoard';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types/game';

export function GamePage() {
  const navigate = useNavigate();
  const {
    gameState,
    selectedCard,
    selectedMinion,
    startNewGame,
    playCard,
    attack,
    endTurn,
    selectCard,
    selectMinion,
    isLoading,
    error,
  } = useGameStore();

  useEffect(() => {
    // Start a game with test decks
    startNewGame('test_deck', 'test_deck');
  }, [startNewGame]);

  const handleCardClick = (index: number) => {
    if (selectedCard === index) {
      // Play the card
      playCard(index);
    } else {
      selectCard(index);
      selectMinion(null);
    }
  };

  const handleMinionClick = (id: string) => {
    if (selectedMinion) {
      // Attack with selected minion
      attack(selectedMinion, id);
    } else {
      selectMinion(id);
      selectCard(null);
    }
  };

  const handleHeroClick = () => {
    if (selectedMinion) {
      // Attack hero
      attack(selectedMinion, 'enemy_hero');
    }
  };

  if (isLoading && !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-2xl">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-2xl text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-hearthstone-blue rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-2xl">No game state</div>
      </div>
    );
  }

  return (
    <GameBoard
      gameState={gameState}
      selectedCard={selectedCard}
      selectedMinion={selectedMinion}
      validActions={[]}
      onCardClick={handleCardClick}
      onMinionClick={handleMinionClick}
      onHeroClick={handleHeroClick}
      onEndTurn={endTurn}
    />
  );
}
```

**Step 3: Update App.tsx**

```tsx
// web/frontend/src/App.tsx - Update with imports

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { GamePage } from './pages/GamePage'

// ... rest of App.tsx, update the /game route:
// <Route path="/game" element={<GamePage />} />
```

**Step 4: Commit**

```bash
git add web/frontend/src/pages/ web/frontend/src/App.tsx
git commit -m "feat(web): add GamePage with full game board"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1 | 1-6 | Backend Foundation (FastAPI, routers, schemas) |
| Phase 2 | 7 | Frontend Foundation (React, Vite, TailwindCSS) |
| Phase 3 | 8-12 | Card Components (Card, Hand, Board, Hero, Mana) |
| Phase 4 | 13-16 | Game Integration (GameBoard, Store, API, GamePage) |

**Total: 16 tasks**

**Dependencies to install:**
- Backend: `fastapi uvicorn websockets python-multipart requests`
- Frontend: `npm install` in `web/frontend/`

**To run:**
```bash
# Terminal 1: Backend
python run_web.py

# Terminal 2: Frontend
cd web/frontend && npm run dev
```

**Access:** http://localhost:5173
