from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict, deque
from datetime import datetime, timedelta
from sqlalchemy import text, inspect as sqlalchemy_inspect
from .config import get_settings
from .database import engine, Base
from .api.v1.router import api_router
from . import models  # noqa: F401  ensure models registered
from .database import SessionLocal
from .seeds.seed_data import seed_if_empty, seed_usuarios

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sistema inteligente de caracterización y gestión de grupos de interés públicos (GOVStake 360)",
    debug=settings.DEBUG,
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


def _column_names(table_name: str):
    """Devuelve los nombres de columnas actuales de una tabla."""
    with engine.connect() as conn:
        inspector = sqlalchemy_inspect(conn)
        return {column["name"] for column in inspector.get_columns(table_name)}


def _ensure_schema():
    """Evolución ligera del esquema sin depender de una migración externa."""
    alter_statements = [
        ("actor_variables", "urgencia", "ALTER TABLE actor_variables ADD COLUMN urgencia FLOAT DEFAULT 0 NOT NULL"),
        ("actor_variables", "frecuencia_intentos", "ALTER TABLE actor_variables ADD COLUMN frecuencia_intentos FLOAT DEFAULT 0 NOT NULL"),
        ("actor_variables", "evaluado_por", "ALTER TABLE actor_variables ADD COLUMN evaluado_por VARCHAR(100)"),
        ("actor_variables", "evaluado_en", "ALTER TABLE actor_variables ADD COLUMN evaluado_en TIMESTAMP WITH TIME ZONE"),
        ("actores", "fuente", "ALTER TABLE actores ADD COLUMN fuente VARCHAR(50) DEFAULT 'manual' NOT NULL"),
        ("actores", "entidad_origen_id", "ALTER TABLE actores ADD COLUMN entidad_origen_id INTEGER"),
        ("actores", "nit", "ALTER TABLE actores ADD COLUMN nit VARCHAR(20)"),
        ("actores", "acronimo", "ALTER TABLE actores ADD COLUMN acronimo VARCHAR(50)"),
        ("actores", "ultima_sync", "ALTER TABLE actores ADD COLUMN ultima_sync TIMESTAMP WITH TIME ZONE"),
    ]

    for table, column, ddl in alter_statements:
        try:
            if column in _column_names(table):
                continue
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception as exc:
            print(f"[GOVStake360] No se pudo asegurar {table}.{column}: {exc}")

    index_statements = [
        "CREATE INDEX IF NOT EXISTS ix_actores_fuente ON actores (fuente)",
        "CREATE INDEX IF NOT EXISTS ix_actores_entidad_origen_id ON actores (entidad_origen_id)",
        "CREATE INDEX IF NOT EXISTS ix_actores_nit ON actores (nit)",
    ]

    for ddl in index_statements:
        try:
            with engine.begin() as conn:
                conn.execute(text(ddl))
        except Exception:
            pass


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup and seed sample actors if empty."""
    Base.metadata.create_all(bind=engine)
    _ensure_schema()
    db = SessionLocal()
    try:
        creados = seed_if_empty(db)
        if creados:
            db.commit()
            print(f"[GOVStake360] Seed inicial: {creados} actores de ejemplo creados.")
        usuarios = seed_usuarios(db)
        if usuarios:
            print(f"[GOVStake360] Seed de seguridad: {usuarios} usuarios creados (contraseñas hasheadas con bcrypt).")
    finally:
        db.close()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/api/v1")
async def api_index():
    """Información de conexión para evitar 404 al abrir la URL base."""
    return {
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "api_prefix": "/api/v1",
        "documentation": "/api/docs",
        "health": "/api/health",
        "authentication": "/api/v1/auth/login",
        "message": "Usa POST /api/v1/auth/login para iniciar sesión.",
    }


@app.get("/api/health")
async def health_check():
    """API health check"""
    return {"status": "healthy"}