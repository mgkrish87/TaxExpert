"""TaxExpert AI — FastAPI Application Entry Point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database import init_db
from routers import auth, users, filings, documents, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered end-to-end tax filing and advisory platform for India",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend (dev + production)
cors_origins = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else []
cors_origins += ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(filings.router)
app.include_router(documents.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
