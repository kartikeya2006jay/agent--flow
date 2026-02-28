from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 AgentFlow OS Backend Starting...")
    yield
    # Shutdown
    print("🛑 AgentFlow OS Backend Stopping...")

app = FastAPI(
    title="AgentFlow OS",
    version="0.1.0",
    description="Multi-Agent Governance Middleware",
    lifespan=lifespan,
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router with prefix
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"name": "AgentFlow OS", "version": "0.1.0", "docs": "/docs", "health": "/health"}

@app.get("/health")
def health():
    return {"status": "healthy", "version": "0.1.0"}
