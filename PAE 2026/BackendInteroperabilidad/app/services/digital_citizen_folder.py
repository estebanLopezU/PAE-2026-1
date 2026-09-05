"""
Módulo de integración con la Carpeta Ciudadana Digital del MinTIC
Permite consultar servicios ciudadanos digitales y su estado de interoperabilidad
"""

import httpx
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from dataclasses import dataclass
from enum import Enum


class ServiceStatus(Enum):
    """Estados de un servicio ciudadano digital"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    DEPRECATED = "deprecated"


class ServiceCategory(Enum):
    """Categorías de servicios ciudadanos digitales"""
    CERTIFICATES = "certificates"
    PERMITS = "permits"
    PAYMENTS = "payments"
    CONSULTATIONS = "consultations"
    COMPLAINTS = "complaints"
    REGISTRATIONS = "registrations"
    OTHER = "other"


@dataclass
class DigitalService:
    """Modelo de datos para un servicio ciudadano digital"""
    id: str
    name: str
    description: str
    entity_name: str
    entity_code: str
    category: ServiceCategory
    status: ServiceStatus
    url: str
    requires_authentication: bool
    authentication_type: str
    average_response_time: float  # en segundos
    success_rate: float  # porcentaje
    monthly_requests: int
    last_updated: datetime
    interoperability_level: str  # basic, intermediate, advanced
    api_available: bool
    api_url: Optional[str]
    documentation_url: Optional[str]


@dataclass
class ServiceUsageStats:
    """Estadísticas de uso de un servicio"""
    service_id: str
    service_name: str
    total_requests: int
    successful_requests: int
    failed_requests: int
    average_response_time: float
    peak_hours: List[int]
    top_users: List[Dict]
    period_start: datetime
    period_end: datetime


class DigitalCitizenFolderClient:
    """Cliente para interactuar con la Carpeta Ciudadana Digital"""
    
    BASE_URL = "https://www.carpeta.gov.co/api"
    SERVICES_URL = "https://www.carpeta.gov.co/api/v1/services"
    STATS_URL = "https://www.carpeta.gov.co/api/v1/statistics"
    
    # Mapeo de categorías a palabras clave
    CATEGORY_KEYWORDS = {
        ServiceCategory.CERTIFICATES: ["certificado", "constancia", "historial"],
        ServiceCategory.PERMITS: ["permiso", "licencia", "autorización", "habilitación"],
        ServiceCategory.PAYMENTS: ["pago", "impuesto", "tasa", "contribución"],
        ServiceCategory.CONSULTATIONS: ["consulta", "verificación", "validación"],
        ServiceCategory.COMPLAINTS: ["queja", "reclamo", "sugerencia", "pqr"],
        ServiceCategory.REGISTRATIONS: ["registro", "inscripción", "matrícula"]
    }
    
    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True
        )
    
    async def close(self):
        """Cerrar cliente HTTP"""
        await self.client.aclose()
    
    async def get_all_services(
        self,
        limit: int = 100,
        offset: int = 0,
        category: Optional[str] = None,
        entity_code: Optional[str] = None
    ) -> List[DigitalService]:
        """
        Obtener todos los servicios ciudadanos digitales
        
        Args:
            limit: Número máximo de resultados
            offset: Offset para paginación
            category: Filtrar por categoría
            entity_code: Filtrar por código de entidad
        
        Returns:
            Lista de servicios digitales
        """
        try:
            params = {
                "limit": limit,
                "offset": offset
            }
            
            if category:
                params["category"] = category
            if entity_code:
                params["entity"] = entity_code
            
            response = await self.client.get(
                self.SERVICES_URL,
                params=params
            )
            response.raise_for_status()
            
            data = response.json()
            services = []
            
            for item in data.get("services", []):
                service = DigitalService(
                    id=item.get("id", ""),
                    name=item.get("name", ""),
                    description=item.get("description", ""),
                    entity_name=item.get("entity", {}).get("name", ""),
                    entity_code=item.get("entity", {}).get("code", ""),
                    category=self._classify_category(item.get("name", "") + " " + item.get("description", "")),
                    status=ServiceStatus(item.get("status", "inactive")),
                    url=item.get("url", ""),
                    requires_authentication=item.get("requires_auth", False),
                    authentication_type=item.get("auth_type", "none"),
                    average_response_time=item.get("avg_response_time", 0),
                    success_rate=item.get("success_rate", 0),
                    monthly_requests=item.get("monthly_requests", 0),
                    last_updated=datetime.fromisoformat(item.get("updated_at", datetime.now().isoformat())),
                    interoperability_level=item.get("interop_level", "basic"),
                    api_available=item.get("has_api", False),
                    api_url=item.get("api_url"),
                    documentation_url=item.get("docs_url")
                )
                services.append(service)
            
            return services
            
        except Exception as e:
            print(f"Error obteniendo servicios: {e}")
            return []
    
    async def get_service_details(self, service_id: str) -> Optional[Dict]:
        """
        Obtener detalles de un servicio específico
        
        Args:
            service_id: ID del servicio
        
        Returns:
            Detalles del servicio o None si no existe
        """
        try:
            response = await self.client.get(f"{self.SERVICES_URL}/{service_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error obteniendo detalles del servicio {service_id}: {e}")
            return None
    
    async def get_services_by_entity(self, entity_code: str) -> List[DigitalService]:
        """
        Obtener servicios de una entidad específica
        
        Args:
            entity_code: Código de la entidad
        
        Returns:
            Lista de servicios de la entidad
        """
        return await self.get_all_services(entity_code=entity_code, limit=1000)
    
    async def get_services_by_category(self, category: str) -> List[DigitalService]:
        """
        Obtener servicios por categoría
        
        Args:
            category: Categoría de servicio
        
        Returns:
            Lista de servicios de la categoría
        """
        return await self.get_all_services(category=category, limit=1000)
    
    async def get_service_statistics(self, service_id: str, period_days: int = 30) -> Optional[ServiceUsageStats]:
        """
        Obtener estadísticas de uso de un servicio
        
        Args:
            service_id: ID del servicio
            period_days: Período de días para las estadísticas
        
        Returns:
            Estadísticas del servicio o None si no existe
        """
        try:
            params = {"period_days": period_days}
            response = await self.client.get(
                f"{self.STATS_URL}/{service_id}",
                params=params
            )
            response.raise_for_status()
            
            data = response.json()
            
            return ServiceUsageStats(
                service_id=service_id,
                service_name=data.get("service_name", ""),
                total_requests=data.get("total_requests", 0),
                successful_requests=data.get("successful_requests", 0),
                failed_requests=data.get("failed_requests", 0),
                average_response_time=data.get("avg_response_time", 0),
                peak_hours=data.get("peak_hours", []),
                top_users=data.get("top_users", []),
                period_start=datetime.fromisoformat(data.get("period_start", datetime.now().isoformat())),
                period_end=datetime.fromisoformat(data.get("period_end", datetime.now().isoformat()))
            )
            
        except Exception as e:
            print(f"Error obteniendo estadísticas del servicio {service_id}: {e}")
            return None
    
    async def get_interoperability_report(self) -> Dict:
        """
        Obtener reporte de interoperabilidad de servicios
        
        Returns:
            Reporte de interoperabilidad
        """
        try:
            # Obtener todos los servicios
            services = await self.get_all_services(limit=1000)
            
            # Calcular estadísticas
            total_services = len(services)
            services_with_api = sum(1 for s in services if s.api_available)
            services_authenticated = sum(1 for s in services if s.requires_authentication)
            
            # Distribución por nivel de interoperabilidad
            interop_distribution = {}
            for level in ["basic", "intermediate", "advanced"]:
                count = sum(1 for s in services if s.interoperability_level == level)
                interop_distribution[level] = count
            
            # Distribución por categoría
            category_distribution = {}
            for category in ServiceCategory:
                count = sum(1 for s in services if s.category == category)
                category_distribution[category.value] = count
            
            # Promedio de tiempo de respuesta
            avg_response_time = sum(s.average_response_time for s in services) / total_services if total_services > 0 else 0
            
            # Promedio de tasa de éxito
            avg_success_rate = sum(s.success_rate for s in services) / total_services if total_services > 0 else 0
            
            return {
                "total_services": total_services,
                "services_with_api": services_with_api,
                "api_availability_rate": round(services_with_api / total_services * 100, 1) if total_services > 0 else 0,
                "services_requiring_auth": services_authenticated,
                "authentication_rate": round(services_authenticated / total_services * 100, 1) if total_services > 0 else 0,
                "interoperability_distribution": interop_distribution,
                "category_distribution": category_distribution,
                "average_response_time": round(avg_response_time, 2),
                "average_success_rate": round(avg_success_rate, 1),
                "services_by_status": self._count_by_status(services),
                "top_services_by_requests": self._get_top_services(services, "monthly_requests", 10),
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error generando reporte de interoperabilidad: {e}")
            return {}
    
    def _classify_category(self, text: str) -> ServiceCategory:
        """
        Clasificar un servicio por categoría basado en texto
        
        Args:
            text: Texto a clasificar (nombre + descripción)
        
        Returns:
            Categoría del servicio
        """
        text_lower = text.lower()
        
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return category
        
        return ServiceCategory.OTHER
    
    def _count_by_status(self, services: List[DigitalService]) -> Dict:
        """Contar servicios por estado"""
        status_count = {}
        for status in ServiceStatus:
            count = sum(1 for s in services if s.status == status)
            status_count[status.value] = count
        return status_count
    
    def _get_top_services(self, services: List[DigitalService], metric: str, limit: int) -> List[Dict]:
        """Obtener top servicios por métrica"""
        sorted_services = sorted(services, key=lambda s: getattr(s, metric, 0), reverse=True)
        
        return [
            {
                "id": s.id,
                "name": s.name,
                "entity": s.entity_name,
                "value": getattr(s, metric, 0)
            }
            for s in sorted_services[:limit]
        ]
    
    async def sync_services_to_database(self, db_session) -> Dict:
        """
        Sincronizar servicios de la Carpeta Ciudadana a la base de datos
        
        Args:
            db_session: Sesión de base de datos
        
        Returns:
            Resultado de la sincronización
        """
        from ..models.service import Service
        from ..models.entity import Entity
        
        try:
            services = await self.get_all_services(limit=1000)
            
            created = 0
            updated = 0
            errors = 0
            
            for digital_service in services:
                try:
                    # Buscar entidad
                    entity = db_session.query(Entity).filter(
                        Entity.code == digital_service.entity_code
                    ).first()
                    
                    if not entity:
                        # Crear entidad si no existe
                        entity = Entity(
                            name=digital_service.entity_name,
                            code=digital_service.entity_code,
                            sector_id=1  # Sector por defecto
                        )
                        db_session.add(entity)
                        db_session.flush()
                    
                    # Buscar si ya existe el servicio
                    existing = db_session.query(Service).filter(
                        Service.code == digital_service.id
                    ).first()
                    
                    if existing:
                        # Actualizar
                        existing.name = digital_service.name
                        existing.description = digital_service.description
                        existing.status = digital_service.status.value
                        existing.documentation_url = digital_service.documentation_url
                        existing.updated_at = datetime.now()
                        updated += 1
                    else:
                        # Crear nuevo
                        service = Service(
                            entity_id=entity.id,
                            name=digital_service.name,
                            code=digital_service.id,
                            description=digital_service.description,
                            protocol="REST" if digital_service.api_available else "Web",
                            category=digital_service.category.value,
                            status=digital_service.status.value,
                            version="1.0",
                            documentation_url=digital_service.documentation_url,
                            created_at=datetime.now()
                        )
                        db_session.add(service)
                        created += 1
                    
                except Exception as e:
                    errors += 1
                    print(f"Error procesando servicio {digital_service.id}: {e}")
            
            db_session.commit()
            
            return {
                "success": True,
                "created": created,
                "updated": updated,
                "errors": errors,
                "total_processed": len(services)
            }
            
        except Exception as e:
            db_session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


# Instancia global del cliente
digital_citizen_client = DigitalCitizenFolderClient()


async def get_digital_services(limit: int = 100, category: Optional[str] = None) -> List[Dict]:
    """
    Función helper para obtener servicios digitales
    
    Args:
        limit: Número máximo de resultados
        category: Filtrar por categoría
    
    Returns:
        Lista de servicios en formato dict
    """
    services = await digital_citizen_client.get_all_services(limit=limit, category=category)
    await digital_citizen_client.close()
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "entity_name": s.entity_name,
            "entity_code": s.entity_code,
            "category": s.category.value,
            "status": s.status.value,
            "url": s.url,
            "requires_authentication": s.requires_authentication,
            "api_available": s.api_available,
            "success_rate": s.success_rate,
            "monthly_requests": s.monthly_requests
        }
        for s in services
    ]


async def get_interoperability_report() -> Dict:
    """
    Función helper para obtener reporte de interoperabilidad
    
    Returns:
        Reporte de interoperabilidad
    """
    report = await digital_citizen_client.get_interoperability_report()
    await digital_citizen_client.close()
    return report


async def get_entity_services(entity_code: str) -> List[Dict]:
    """
    Función helper para obtener servicios de una entidad
    
    Args:
        entity_code: Código de la entidad
    
    Returns:
        Lista de servicios de la entidad
    """
    services = await digital_citizen_client.get_services_by_entity(entity_code)
    await digital_citizen_client.close()
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "category": s.category.value,
            "status": s.status.value,
            "api_available": s.api_available
        }
        for s in services
    ]