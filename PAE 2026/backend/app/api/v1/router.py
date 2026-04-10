from fastapi import APIRouter
from .endpoints import auth, sectors, entities, services, maturity, dashboard, reports, ai_analysis, interoperability

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(sectors.router, prefix="/sectors", tags=["Sectores"])
api_router.include_router(entities.router, prefix="/entities", tags=["Entidades"])
api_router.include_router(services.router, prefix="/services", tags=["Servicios"])
api_router.include_router(maturity.router, prefix="/maturity", tags=["Madurez"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reportes"])
api_router.include_router(ai_analysis.router, prefix="/ai", tags=["Análisis IA"])
api_router.include_router(interoperability.router, prefix="/interop", tags=["Interoperabilidad"])
