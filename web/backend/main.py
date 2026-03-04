"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from web.backend.config import CORS_ORIGINS, API_PREFIX

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

# Include routers
from web.backend.routers import cards
# from web.backend.routers import deck, game, replay

app.include_router(cards.router, prefix=f"{API_PREFIX}/cards", tags=["cards"])
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
