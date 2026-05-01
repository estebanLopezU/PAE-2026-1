from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict, deque
from datetime import datetime, timedelta
from .config import get_settings
from .database import engine, Base
from .api.v1.router import api_router

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sistema de mapeo y diagnóstico de interoperabilidad X-Road para entidades públicas colombianas",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

_request_log = defaultdict(deque)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    settings = get_settings()
    limit = settings.RATE_LIMIT_PER_MINUTE
    if request.url.path.startswith("/api/"):
        ip = request.client.host if request.client else "unknown"
        now = datetime.utcnow()
        window = now - timedelta(minutes=1)
        q = _request_log[ip]
        while q and q[0] < window:
            q.popleft()
        if len(q) >= limit:
            raise HTTPException(status_code=429, detail="Rate limit excedido")
        q.append(now)
    return await call_next(request)


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    """API health check"""
    return {"status": "healthy"}