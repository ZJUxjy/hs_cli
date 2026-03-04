"""Configuration for the WebUI backend."""
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
