from fastapi import APIRouter
from .endpoints import sectors, entities, services, maturity, dashboard, reports

api_router = APIRouter()

api_router.include_router(sectors.router, prefix="/sectors", tags=["Sectores"])
api_router.include_router(entities.router, prefix="/entities", tags=["Entidades"])
api_router.include_router(services.router, prefix="/services", tags=["Servicios"])
api_router.include_router(maturity.router, prefix="/maturity", tags=["Madurez"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reportes"])
