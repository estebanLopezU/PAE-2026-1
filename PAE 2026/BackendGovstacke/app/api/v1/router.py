from fastapi import APIRouter
from .endpoints import (
    auth,
    actors,
    matriz,
    compromisos,
    alertas,
    relacionamientos,
    dashboard,
    protocolo,
    reportes,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(actors.router, prefix="/actors", tags=["Actores"])
api_router.include_router(matriz.router, prefix="/matriz", tags=["Matriz de priorizacion"])
api_router.include_router(compromisos.router, prefix="/compromisos", tags=["Compromisos"])
api_router.include_router(alertas.router, prefix="/alertas", tags=["Alertas"])
api_router.include_router(relacionamientos.router, prefix="/relacionamientos", tags=["Relacionamiento"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(protocolo.router, prefix="/protocolo", tags=["Protocolo de participacion"])
api_router.include_router(reportes.router, prefix="/reportes", tags=["Reportes"])
