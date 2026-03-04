#!/usr/bin/env python
"""Script to run the FastAPI development server."""
import uvicorn


if __name__ == "__main__":
    uvicorn.run(
        "web.backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
