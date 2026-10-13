"""
Creative Engine Backend — FastAPI Service
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import structlog
import os
from dotenv import load_dotenv

from routers import products, sessions, templates, options, concepts, sync
from config import settings

load_dotenv()

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Creative Engine backend starting", env=settings.APP_ENV)
    yield
    log.info("Creative Engine backend shutting down")


app = FastAPI(
    title="Creative Engine API",
    description="Backend service for the ShopDeck Creative Engine — generates strategic Meta ad creative briefs and prompts.",
    version="0.2.0",
    lifespan=lifespan,
    docs_url="/docs" if os.getenv("APP_ENV") != "production" else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers (mounted both directly and under /api for proxy and rewrite compatibility)
for pfx in ["", "/api"]:
    app.include_router(products.router, prefix=f"{pfx}/products", tags=["products"])
    app.include_router(sessions.router, prefix=f"{pfx}/sessions", tags=["sessions"])
    app.include_router(templates.router, prefix=f"{pfx}/templates", tags=["templates"])
    app.include_router(options.router, prefix=f"{pfx}/options", tags=["options"])
    app.include_router(concepts.router, prefix=f"{pfx}/concepts", tags=["concepts"])
    app.include_router(sync.router, prefix=f"{pfx}/sync", tags=["sync"])


@app.get("/health")
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "creative-engine", "version": "0.2.0"}
